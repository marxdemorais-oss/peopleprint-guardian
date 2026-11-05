-- Records collected under the previous policy keep their original expiry. Preserve
-- past exclusions from context before making memory intrinsic to account checks.
UPDATE guardian_checks SET remember=0 WHERE remember=1 AND owner_id IN
 (SELECT owner_id FROM guardian_profiles WHERE memory_enabled=0);
--> statement-breakpoint
UPDATE guardian_profiles SET memory_enabled=1 WHERE memory_enabled=0;
--> statement-breakpoint
ALTER TABLE guardian_checks ADD COLUMN incoming_provider text;
--> statement-breakpoint
UPDATE guardian_checks SET incoming_provider=(SELECT i.channel FROM guardian_ingress_events i
 WHERE i.owner_id=guardian_checks.owner_id AND i.check_id=guardian_checks.id
 ORDER BY i.created_at ASC LIMIT 1)
WHERE id IN (SELECT check_id FROM guardian_ingress_events WHERE check_id IS NOT NULL);
--> statement-breakpoint
CREATE INDEX guardian_check_warnings ON guardian_checks(owner_id,updated_at DESC,id DESC)
 WHERE incoming_provider IS NOT NULL AND status='complete' AND json_extract(result_json,'$.status')='caution';
--> statement-breakpoint
CREATE TABLE guardian_live_requests (owner_id text PRIMARY KEY NOT NULL, requested_at text NOT NULL);
--> statement-breakpoint
ALTER TABLE guardian_profiles ADD COLUMN connections_intro_at text;
--> statement-breakpoint
UPDATE guardian_profiles SET connections_intro_at=created_at;
