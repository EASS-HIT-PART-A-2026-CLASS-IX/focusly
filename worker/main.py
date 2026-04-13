"""
Focusly background worker.

Placeholder — wakes up every 30 seconds and logs a heartbeat.
Phase 2 will add overdue-task detection with Redis-backed idempotency.
"""

import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [worker] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

INTERVAL_SECONDS = 30


def run():
    logger.info("Worker started. Checking every %s seconds.", INTERVAL_SECONDS)
    while True:
        logger.info("Heartbeat — worker is running.")
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    run()
