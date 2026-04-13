"""
Focusly overdue-task refresh worker.

Scans for tasks whose deadline has passed and status is not 'done',
logs a warning for each, and uses Redis to avoid processing the same
task more than once per day (idempotency).

Bounded concurrency: up to CONCURRENCY tasks are processed in parallel
using an anyio task group + semaphore.
"""

import logging
import os
from datetime import date

import anyio
import redis.asyncio as aioredis
from sqlmodel import Session, select

from app.db import engine
from app.models import Status, Task

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [refresh] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CONCURRENCY = 5
IDEMPOTENCY_TTL = 86_400  # 24 hours in seconds


def fetch_overdue_tasks() -> list[Task]:
    """Return all tasks with a past deadline that are not done."""
    today = date.today()
    with Session(engine) as session:
        return session.exec(
            select(Task).where(
                Task.deadline < today,
                Task.status != Status.done,
            )
        ).all()


async def process_task(task: Task, redis_client: aioredis.Redis, sem: anyio.abc.CapacityLimiter) -> None:
    """Check Redis idempotency key; log and record the task if not yet processed."""
    async with sem:
        key = f"processed:{task.id}"
        already_handled = await redis_client.get(key)
        if already_handled:
            logger.info("Skipping task %s (already processed today).", task.id)
            return

        logger.warning(
            "Overdue task #%s: '%s' (deadline: %s, status: %s)",
            task.id,
            task.title,
            task.deadline,
            task.status,
        )
        await redis_client.set(key, "1", ex=IDEMPOTENCY_TTL)


async def refresh() -> int:
    """Run one refresh cycle. Returns the number of overdue tasks found."""
    tasks = fetch_overdue_tasks()
    if not tasks:
        logger.info("No overdue tasks found.")
        return 0

    logger.info("Found %s overdue task(s). Processing...", len(tasks))

    redis_client = await aioredis.from_url(REDIS_URL, decode_responses=True)
    limiter = anyio.CapacityLimiter(CONCURRENCY)

    try:
        async with anyio.create_task_group() as tg:
            for task in tasks:
                tg.start_soon(process_task, task, redis_client, limiter)
    finally:
        await redis_client.aclose()

    return len(tasks)


if __name__ == "__main__":
    anyio.run(refresh)
