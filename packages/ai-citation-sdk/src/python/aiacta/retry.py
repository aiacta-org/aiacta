"""Retry schedule matching §3.5."""
import asyncio
RETRY_DELAYS_SECONDS = [0, 30, 300, 1800, 7200, 43200]
async def with_retry(fn):
    for attempt, delay in enumerate(RETRY_DELAYS_SECONDS):
        if delay: await asyncio.sleep(delay)
        try:
            return await fn()
        except Exception as e:
            if attempt == len(RETRY_DELAYS_SECONDS) - 1:
                raise RuntimeError(f"Dead-lettered after {len(RETRY_DELAYS_SECONDS)} attempts: {e}") from e
