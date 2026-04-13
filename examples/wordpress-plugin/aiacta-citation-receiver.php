<?php
/**
 * Plugin Name: AIACTA Citation Receiver
 * Description: Receives AIACTA citation webhooks for WordPress (Section 3.4).
 * License: Apache-2.0
 */
add_action('rest_api_init', function () {
  register_rest_route('aiacta/v1', '/citations', [
    'methods' => 'POST',
    'callback' => 'aiacta_handle',
    'permission_callback' => '__return_true',
  ]);
});
function aiacta_handle(WP_REST_Request $r) {
  $secret = get_option('aiacta_webhook_secret', '');
  $ts   = $r->get_header('X-AIACTA-Webhook-Timestamp');
  $sig  = $r->get_header('X-AIACTA-Webhook-Signature');
  $body = $r->get_body();
  if (abs(time() - intval($ts)) > 300) {
    return new WP_Error('replay', 'Stale timestamp', ['status' => 400]);
  }
  $expected = 'sha256=' . hash_hmac('sha256', "{$ts}.{$body}", $secret);
  if (!hash_equals($expected, $sig)) {
    return new WP_Error('sig', 'Bad signature', ['status' => 401]);
  }
  $event = json_decode($body, true);
  $key = sanitize_text_field($event['idempotency_key'] ?? '');
  if (get_option("aiacta_{$key}")) {
    return new WP_REST_Response(['status' => 'duplicate_ignored'], 200);
  }
  // TODO: insert $event into custom DB table or analytics pipeline
  update_option("aiacta_{$key}", true, false);
  return new WP_REST_Response(['status' => 'accepted'], 200);
}
