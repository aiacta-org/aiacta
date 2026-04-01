"""Processes CitationEvent or CitationBatch with idempotency (§3.2)."""
async def process_event(event: dict, *, is_processed, mark_processed, on_event):
    events = event.get("events", [event])
    for e in events:
        if await is_processed(e["idempotency_key"]):
            continue
        await on_event(e)
        await mark_processed(e["idempotency_key"])
