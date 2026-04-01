"""Cryptographic webhook signature verification (§3.4)."""
import hashlib, hmac, time

TIMESTAMP_TOLERANCE_SECONDS = 300

def verify_webhook_signature(payload: bytes, timestamp: str, sig_header: str, secret: str) -> bool:
    now = int(time.time())
    if abs(now - int(timestamp)) > TIMESTAMP_TOLERANCE_SECONDS:
        raise ValueError("Timestamp outside tolerance window — possible replay attack")
    signed = f"{timestamp}.".encode() + payload
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    received = sig_header.removeprefix("sha256=")
    return hmac.compare_digest(expected, received)
