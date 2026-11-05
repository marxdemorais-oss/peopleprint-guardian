ALTER TABLE guardian_profiles ADD COLUMN profile_completed_at text;
--> statement-breakpoint
ALTER TABLE guardian_checks ADD COLUMN context_evidence_json text NOT NULL DEFAULT '[]';
--> statement-breakpoint
ALTER TABLE guardian_checks ADD COLUMN assessment_token text;
--> statement-breakpoint
CREATE INDEX guardian_profiles_created_owner ON guardian_profiles(created_at,owner_id);
--> statement-breakpoint
CREATE INDEX guardian_profiles_email ON guardian_profiles(email);
--> statement-breakpoint
CREATE TABLE guardian_trial_usage (
  owner_id text NOT NULL,
  check_id text NOT NULL,
  consumed_at text,
  reservation_token text,
  reserved_until integer NOT NULL DEFAULT 0,
  PRIMARY KEY(owner_id,check_id)
);
--> statement-breakpoint
CREATE INDEX guardian_trial_reservations ON guardian_trial_usage(owner_id,reserved_until);
--> statement-breakpoint
CREATE TABLE guardian_context_records (
  id text PRIMARY KEY NOT NULL,
  owner_id text NOT NULL,
  source_check_id text NOT NULL,
  source_evidence_id text NOT NULL,
  source text NOT NULL,
  text text NOT NULL,
  search_text text NOT NULL,
  provenance text NOT NULL,
  created_at text NOT NULL,
  expires_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_context_owner_expiry ON guardian_context_records(owner_id,expires_at);
--> statement-breakpoint
CREATE INDEX guardian_context_source ON guardian_context_records(owner_id,source_check_id);
--> statement-breakpoint
CREATE TABLE guardian_context_links (
  owner_id text NOT NULL,
  check_id text NOT NULL,
  context_record_id text NOT NULL,
  relation text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL,
  created_at text NOT NULL,
  expires_at text NOT NULL,
  PRIMARY KEY(owner_id,check_id,context_record_id)
);
--> statement-breakpoint
CREATE INDEX guardian_context_links_owner_created ON guardian_context_links(owner_id,created_at);
--> statement-breakpoint
CREATE INDEX guardian_context_links_expiry ON guardian_context_links(expires_at);
--> statement-breakpoint
CREATE INDEX guardian_context_records_expiry ON guardian_context_records(expires_at);
--> statement-breakpoint
CREATE TABLE guardian_analysis_usage (
  id text PRIMARY KEY NOT NULL,
  owner_id text NOT NULL,
  check_id text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  input_tokens integer,
  output_tokens integer,
  outcome text NOT NULL,
  created_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_analysis_usage_owner_created ON guardian_analysis_usage(owner_id,created_at);
--> statement-breakpoint
CREATE INDEX guardian_analysis_usage_expiry ON guardian_analysis_usage(created_at);
