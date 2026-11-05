CREATE TABLE guardian_merged_logins (
 legacy_owner TEXT PRIMARY KEY NOT NULL,
 people_owner TEXT NOT NULL,
 merged_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_profiles BEFORE INSERT ON guardian_profiles
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_checks BEFORE INSERT ON guardian_checks
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_context_records BEFORE INSERT ON guardian_context_records
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_context_links BEFORE INSERT ON guardian_context_links
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_analysis_usage BEFORE INSERT ON guardian_analysis_usage
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_trial_usage BEFORE INSERT ON guardian_trial_usage
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_connections BEFORE INSERT ON guardian_connections
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_connection_tokens BEFORE INSERT ON guardian_connection_tokens
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_oauth_states BEFORE INSERT ON guardian_oauth_states
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_contact_links BEFORE INSERT ON guardian_contact_links
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_channel_identities BEFORE INSERT ON guardian_channel_identities
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_channel_preferences BEFORE INSERT ON guardian_channel_preferences
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_live_requests BEFORE INSERT ON guardian_live_requests
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_message_jobs BEFORE INSERT ON guardian_message_jobs
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_ingress_events BEFORE INSERT ON guardian_ingress_events
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
--> statement-breakpoint
CREATE TRIGGER guardian_block_retired_rate_limits BEFORE INSERT ON guardian_rate_limits
WHEN EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=NEW.owner_id)
BEGIN SELECT RAISE(ABORT,'Guardian sign-in has moved'); END;
