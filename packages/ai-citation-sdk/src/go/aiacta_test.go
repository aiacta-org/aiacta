package aiacta_test

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"testing"
	"time"

	"github.com/aiacta-org/aiacta/ai-citation-sdk"
)

func makeSignature(payload []byte, timestamp, secret string) string {
	signed := append([]byte(timestamp+"."), payload...)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(signed)
	return "sha256=" + hex.EncodeToString(mac.Sum(nil))
}

func TestVerifyWebhookSignature_Valid(t *testing.T) {
	ts      := fmt.Sprintf("%d", time.Now().Unix())
	payload := []byte(`{"event_type":"citation.generated"}`)
	sig     := makeSignature(payload, ts, "test-secret")

	ok, err := aiacta.VerifyWebhookSignature(payload, ts, sig, "test-secret")
	if err != nil { t.Fatalf("unexpected error: %v", err) }
	if !ok        { t.Fatal("expected signature to be valid") }
}

func TestVerifyWebhookSignature_TamperedPayload(t *testing.T) {
	ts      := fmt.Sprintf("%d", time.Now().Unix())
	sig     := makeSignature([]byte("original"), ts, "secret")
	ok, err := aiacta.VerifyWebhookSignature([]byte("tampered"), ts, sig, "secret")
	if err != nil  { t.Fatalf("unexpected error: %v", err) }
	if ok          { t.Fatal("expected tampered payload to fail verification") }
}

func TestVerifyWebhookSignature_StaleTimestamp(t *testing.T) {
	oldTs := fmt.Sprintf("%d", time.Now().Unix()-400)
	_, err := aiacta.VerifyWebhookSignature([]byte("{}"), oldTs, "sha256=abc", "secret")
	if err == nil { t.Fatal("expected error for stale timestamp") }
}

func TestTruncateToMinute(t *testing.T) {
	now       := time.Date(2026, 3, 24, 9, 14, 37, 500_000_000, time.UTC)
	result    := aiacta.TruncateToMinute(now)
	expected  := "2026-03-24T09:14:00Z"
	if result != expected {
		t.Fatalf("got %s, want %s", result, expected)
	}
}

type inMemoryStore struct { keys map[string]bool }
func (s *inMemoryStore) Has(k string) bool { return s.keys[k] }
func (s *inMemoryStore) Set(k string)      { s.keys[k] = true }

func TestProcessEvent_Idempotency(t *testing.T) {
	store    := &inMemoryStore{keys: make(map[string]bool)}
	called   := 0
	events   := []aiacta.CitationEvent{
		{IdempotencyKey: "idem_1", EventID: "evt_1"},
	}
	handler := func(e aiacta.CitationEvent) error { called++; return nil }

	// Call 3 times — should only process once
	for i := 0; i < 3; i++ {
		if err := aiacta.ProcessEvent(events, store, handler); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	if called != 1 {
		t.Fatalf("expected handler called once, got %d", called)
	}
}

func TestRetryDelaysSchedule(t *testing.T) {
	if len(aiacta.RetryDelaysSeconds) != 6 {
		t.Fatalf("expected 6 retry attempts, got %d", len(aiacta.RetryDelaysSeconds))
	}
	if aiacta.RetryDelaysSeconds[0] != 0 {
		t.Fatal("first attempt must be immediate")
	}
	if aiacta.RetryDelaysSeconds[5] != 43200 {
		t.Fatalf("last delay must be 43200s (12h), got %d", aiacta.RetryDelaysSeconds[5])
	}
}
