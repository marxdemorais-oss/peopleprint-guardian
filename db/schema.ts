/**
 * D1 storage contract. The executable schema is the versioned SQL in drizzle/.
 * No runtime schema creation, ORM dependency or client-side database access.
 * owner_id is supplied by authenticated server identity, never a request body.
 * Shared-account ownership is established through People Organised's identity exchange.
 */
export interface GuardianProfileRow {
  owner_id: string; id: string; email: string; display_name: string;
  onboarding_complete: number; memory_enabled: number;
  profile_completed_at: string|null; connections_intro_at: string|null;
  free_check_allowance: number|null; allowance_revision: number;
  allowance_updated_at: string|null; allowance_updated_by: string|null;
  created_at: string; updated_at: string;
}
export interface GuardianCheckRow {
  id: string; owner_id: string; message: string; channel: string;
  evidence_json: string; preferences_json: string;
  status: 'draft'|'awaiting_connection'|'complete'|'error';
  result_json: string|null; replies_json: string; remember: number;
  incoming_provider: string|null;
  // For account checks, an empty expires_at means there is no automatic expiry.
  context_evidence_json: string;
  assessment_token: string|null;
  revision: number; created_at: string; updated_at: string; expires_at: string;
}
export interface GuardianTrialUsageRow {
  owner_id:string; check_id:string; consumed_at:string|null;
  reservation_token:string|null; reserved_until:number;
}
export interface GuardianContextRecordRow {
  id:string; owner_id:string; source_check_id:string; source_evidence_id:string;
  source:string; text:string; search_text:string; provenance:string;
  created_at:string; expires_at:string;
}
export interface GuardianContextLinkRow {
  owner_id:string; check_id:string; context_record_id:string;
  relation:'retrieved_for_review'|'cited_in_assessment'; reason:string;
  status:'inferred'; created_at:string; expires_at:string;
}
export interface GuardianAnalysisUsageRow {
  id:string; owner_id:string; check_id:string; provider:string; model:string;
  input_tokens:number|null; output_tokens:number|null; outcome:'complete'|'error'; created_at:string;
}
export interface GuardianConnectionRow {
  owner_id: string; provider: string; status: string; external_id: string|null;
  display_label: string|null; connected_at: string|null; updated_at: string;
}
export interface GuardianConnectionTokenRow {
  owner_id: string; provider: string; encrypted_token: string; updated_at: string;
}
export interface GuardianOAuthStateRow {
  state_hash: string; owner_id: string; provider: string; expires_at: number;
  pkce_verifier: string; created_at: number;
}
export interface GuardianRateLimitRow {
  bucket_key: string; owner_id: string; count: number; expires_at: number;
}
export interface GuardianContactLinkRow {
  id: string; owner_id: string; channel: string; code_hash: string;
  created_at: number; expires_at: number;
}
export interface GuardianChannelIdentityRow {
  channel: string; sender_id: string; owner_id: string; verified_at: number;
}
export interface GuardianIngressEventRow {
  channel: string; event_id: string; owner_id: string|null;
  check_id: string|null; status: string; created_at: number;
}
export interface GuardianXServiceAccountRow {
  id:'wolfgang'; account_id:string|null; username:string|null;
  status:'disconnected'|'connected'|'reconnect_required'; encrypted_token:string|null;
  scope:string|null; access_expires_at:number|null; generation:number;
  refresh_lease_token:string|null; refresh_lease_expires:number;
  connected_at:number|null; updated_at:number;
}
export interface GuardianXOAuthStateRow {
  state_hash:string; operator_id:string; generation:number;
  encrypted_verifier:string; created_at:number; expires_at:number;
}
export interface GuardianXEventNoticeRow {
  event_id:string; event_type:string; reason:string; created_at:number;
}
export interface GuardianXSenderOptoutRow {
  sender_id:string; stopped_at:number;
}
export interface GuardianTransportTestRow {
  job_id:string; owner_id:string; operator_id:string;
  state:'sending'|'sent'|'uncertain'|'cancelled';
  provider_message_id:string|null; last_error:string|null;
  created_at:number; updated_at:number;
}
export interface GuardianEmailSenderOptoutRow {
  sender_id:string; stopped_at:number;
}
export interface GuardianXChatDeliveryRow {
  delivery_key:string; job_id:string|null; account_id:string; sender_id:string;
  owner_id:string|null; message_id:string;
  state:'prepared'|'sending'|'sent'|'uncertain'|'cancelled';
  payload_json:string; created_at:number; updated_at:number;
}
export interface GuardianXChatReceivedRow {
  event_uuid:string; message_id:string; created_at:number;
}
