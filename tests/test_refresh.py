"""
Tests for scripts/refresh.py — overdue task detection with Redis idempotency.
Uses a fake Redis client to avoid requiring a real Redis instance.
"""

from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from scripts.refresh import IDEMPOTENCY_TTL, process_task_with_retry as process_task
from app.models import Priority, Category, EnergyLevel, Status, Task


def make_task(
    id: int = 1,
    title: str = "Test task",
    deadline: date = date.today() - timedelta(days=1),
    status: Status = Status.todo,
) -> Task:
    return Task(
        id=id,
        title=title,
        category=Category.study,
        priority=Priority.high,
        status=status,
        energy_required=EnergyLevel.medium,
        deadline=deadline,
    )


@pytest.mark.anyio
async def test_process_task_logs_and_marks_overdue():
    """A new overdue task should be logged and marked in Redis."""
    task = make_task(id=1)
    redis = AsyncMock()
    redis.get.return_value = None  # not yet processed
    limiter = MagicMock()
    limiter.__aenter__ = AsyncMock(return_value=None)
    limiter.__aexit__ = AsyncMock(return_value=False)

    await process_task(task, redis, limiter)

    redis.get.assert_called_once_with("processed:1")
    redis.set.assert_called_once_with("processed:1", "1", ex=IDEMPOTENCY_TTL)


@pytest.mark.anyio
async def test_process_task_skips_already_processed():
    """A task already in Redis should be skipped (no set call)."""
    task = make_task(id=2)
    redis = AsyncMock()
    redis.get.return_value = "1"  # already processed
    limiter = MagicMock()
    limiter.__aenter__ = AsyncMock(return_value=None)
    limiter.__aexit__ = AsyncMock(return_value=False)

    await process_task(task, redis, limiter)

    redis.set.assert_not_called()


@pytest.mark.anyio
async def test_refresh_no_overdue_tasks():
    """refresh() should return 0 when there are no overdue tasks."""
    with patch("scripts.refresh.fetch_overdue_tasks", return_value=[]):
        from scripts.refresh import refresh
        result = await refresh()

    assert result == 0


@pytest.mark.anyio
async def test_process_task_retries_on_failure():
    """A transient Redis error should be retried; succeeds on second attempt."""
    task = make_task(id=3)
    redis = AsyncMock()
    # First get() raises, second succeeds
    redis.get.side_effect = [Exception("Redis timeout"), None]
    limiter = MagicMock()
    limiter.__aenter__ = AsyncMock(return_value=None)
    limiter.__aexit__ = AsyncMock(return_value=False)

    with patch("scripts.refresh.anyio.sleep", new=AsyncMock()):
        await process_task(task, redis, limiter)

    assert redis.get.call_count == 2
    redis.set.assert_called_once_with("processed:3", "1", ex=IDEMPOTENCY_TTL)
