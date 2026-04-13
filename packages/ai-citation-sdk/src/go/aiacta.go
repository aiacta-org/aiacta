// Package aiacta provides the Go implementation of the AIACTA Citation SDK (§3.4).
//
// Implements:
//   - VerifyWebhookSignature — HMAC-SHA256 request verification (§3.4A)
//   - ProcessEvent           — Idempotent citation event processing (§3.2)
//   - WithRetry              — Delivery retry schedule (§3.5)
//   - TruncateToMinute       — Event timestamp minute precision (§3.2)
package aiacta

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

// TimestampToleranceSeconds is the maximum allowed clock skew for webhook
// signature verification, preventing replay attacks (§3.4A).
const TimestampToleranceSeconds = 300

// RetryDelaysSeconds defines the delivery retry schedule (§3.5).
// Attempt 1: immediate, Attempt 2: 30s, 3: 5m, 4: 30m, 5: 2h, 6: 12h.
var RetryDelaysSeconds = []int{0, 30, 300, 1800, 7200, 43200}

// CitationEvent represents a single AIACTA citation event payload (§3.2).
type CitationEvent struct {
	SchemaVersion  string     `json:"schema_version"`
	Provider       string     `json:"provider"`
	EventType      string     `json:"event_type"`
	EventID        string     `json:"event_id"`
	IdempotencyKey string     `json:"idempotency_key"`
	Timestamp      string     `json:"timestamp"` // minute precision only (§3.2)
	Citation       Citation   `json:"citation"`
	Attribution    Attribution `json:"attribution"`
}

// Citation holds the per-event citation details.
type Citation struct {
	URL              string `json:"url"`
	CitationType     string `json:"citation_type"`
	ContextSummary   string `json:"context_summary,omitempty"`
	QueryCategoryL1  string `json:"query_category_l1,omitempty"`
	QueryCategoryL2  string `json:"query_category_l2,omitempty"`
	Model            string `json:"model,omitempty"`
	ResponseLocale   string `json:"response_locale,omitempty"`
	UserCountry      string `json:"user_country,omitempty"` // country-level only (§3.3)
}

// Attribution describes how the citation was presented to the user.
type Attribution struct {
	DisplayType   string `json:"display_type"`
	UserInterface string `json:"user_interface"`
}

// VerifyWebhookSignature validates an X-AIACTA-Webhook-Signature header.
//
// The signature covers the string "${timestamp}.${rawBody}" using HMAC-SHA256
// with the shared secret issued at enrollment (§3.4A).
//
// Returns an error if the timestamp is outside the tolerance window
// (possible replay attack) or if the signature does not match.
func VerifyWebhookSignature(rawBody []byte, timestamp, sigHeader, secret string) (bool, error) {
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return false, fmt.Errorf("invalid timestamp value %q: %w", timestamp, err)
	}
	if math.Abs(float64(time.Now().Unix()-ts)) > TimestampToleranceSeconds {
		return false, fmt.Errorf("timestamp outside %ds tolerance window — possible replay attack", TimestampToleranceSeconds)
	}

	// signed = timestamp + "." + rawBody
	signed := append([]byte(timestamp+"."), rawBody...)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(signed)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	received := strings.TrimPrefix(sigHeader, "sha256=")

	// Constant-time comparison to prevent timing attacks
	return hmac.Equal([]byte(expected), []byte("sha256="+received)), nil
}

// TruncateToMinute truncates an ISO 8601 timestamp to minute precision
// as required by §3.2 (prevents timing-attack re-identification of users).
func TruncateToMinute(t time.Time) string {
	truncated := time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), 0, 0, time.UTC)
	return truncated.Format("2006-01-02T15:04:00Z")
}

// IdempotencyStore is the interface that callers must implement to track
// processed event keys (§3.2: safe at-least-once reprocessing).
type IdempotencyStore interface {
	// Has returns true if the key has already been processed.
	Has(key string) bool
	// Set marks the key as processed.
	Set(key string)
}

// EventHandler is called once per unique citation event.
type EventHandler func(event CitationEvent) error

// ProcessEvent processes a single CitationEvent or a batch, skipping
// events whose idempotency_key has already been processed (§3.2).
func ProcessEvent(events []CitationEvent, store IdempotencyStore, handler EventHandler) error {
	for _, e := range events {
		if store.Has(e.IdempotencyKey) {
			continue
		}
		if err := handler(e); err != nil {
			return fmt.Errorf("handler error for event %s: %w", e.EventID, err)
		}
		store.Set(e.IdempotencyKey)
	}
	return nil
}

// WithRetry executes fn up to len(RetryDelaysSeconds) times using the
// AIACTA delivery retry schedule (§3.5). Returns an error if all attempts fail.
func WithRetry(fn func() error) error {
	for attempt, delay := range RetryDelaysSeconds {
		if delay > 0 {
			time.Sleep(time.Duration(delay) * time.Second)
		}
		if err := fn(); err == nil {
			return nil
		} else if attempt == len(RetryDelaysSeconds)-1 {
			return fmt.Errorf("dead-lettered after %d attempts: %w", len(RetryDelaysSeconds), err)
		}
	}
	return nil
}
