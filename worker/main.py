"""
Focusly background worker.

Runs the overdue-task refresh cycle every INTERVAL_SECONDS.
"""

import asyncio
import logging
import os
import sys

# Allow imports from the project root (app/, scripts/)
sys.path.insert(0, "/app")

from scripts.refresh import refresh

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [worker] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

INTERVAL_SECONDS = int(os.getenv("WORKER_INTERVAL", "30"))


async def run():
    logger.info("Worker started. Refresh interval: %ss.", INTERVAL_SECONDS)
    while True:
        try:
            await refresh()
        except Exception as e:
            logger.error("Refresh cycle failed: %s", e)
        await asyncio.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    asyncio.run(run())
