-- No defaults that activate monitoring and no historical enrolment.
CREATE TABLE guardian_watches (
 id text PRIMARY KEY NOT NULL, owner_id text NOT NULL, provider text NOT NULL,
 external_id text NOT NULL, connection_at text NOT NULL, started_at integer NOT NULL,
 covered_to integer NOT NULL, last_success integer, window_end integer, page text,
 next_due integer NOT NULL, lease text, lease_until integer NOT NULL DEFAULT 0,
 failed integer NOT NULL DEFAULT 0, UNIQUE(owner_id,provider)
);
--> statement-breakpoint
CREATE INDEX guardian_watch_due ON guardian_watches(next_due,lease_until);
--> statement-breakpoint
CREATE TABLE guardian_watch_items (
 id text PRIMARY KEY NOT NULL, watch_id text NOT NULL, owner_id text NOT NULL, provider text NOT NULL,
 message_id text NOT NULL, received_at integer NOT NULL, detected_at integer NOT NULL, expires_at integer NOT NULL,
 subject text NOT NULL, sender text NOT NULL, excerpt text NOT NULL, reason text NOT NULL, action text NOT NULL,
 earlier_check text, earlier_evidence text, earlier_title text, earlier_detail text, dismissed integer NOT NULL DEFAULT 0,
 UNIQUE(watch_id,message_id)
);
--> statement-breakpoint
CREATE INDEX guardian_watch_items_owner ON guardian_watch_items(owner_id,detected_at DESC);
--> statement-breakpoint
CREATE INDEX guardian_watch_items_expiry ON guardian_watch_items(expires_at);
--> statement-breakpoint
CREATE TRIGGER guardian_unwatch_after_disconnect AFTER DELETE ON guardian_connections
 BEGIN DELETE FROM guardian_watches WHERE owner_id=OLD.owner_id AND provider=OLD.provider; END;
--> statement-breakpoint
CREATE TRIGGER guardian_unwatch_after_reconnect AFTER UPDATE OF connected_at,external_id,status ON guardian_connections
 WHEN NEW.connected_at IS NOT OLD.connected_at OR NEW.external_id IS NOT OLD.external_id OR NEW.status!='connected'
 BEGIN DELETE FROM guardian_watches WHERE owner_id=OLD.owner_id AND provider=OLD.provider; END;
--> statement-breakpoint
CREATE TRIGGER guardian_clear_watch_items AFTER DELETE ON guardian_watches
 BEGIN DELETE FROM guardian_watch_items WHERE watch_id=OLD.id; END;
--> statement-breakpoint
CREATE TRIGGER guardian_clear_watch_context AFTER DELETE ON guardian_checks
 BEGIN DELETE FROM guardian_watch_items WHERE owner_id=OLD.owner_id AND earlier_check=OLD.id; END;
--> statement-breakpoint
CREATE TRIGGER guardian_clear_changed_watch_context AFTER UPDATE OF evidence_json,incoming_provider ON guardian_checks
 WHEN NEW.evidence_json IS NOT OLD.evidence_json OR NEW.incoming_provider IS NOT OLD.incoming_provider
 BEGIN DELETE FROM guardian_watch_items WHERE owner_id=OLD.owner_id AND earlier_check=OLD.id; END;
--> statement-breakpoint
CREATE TABLE guardian_watch_trigger_ticks (slot integer PRIMARY KEY CHECK (slot=1),last_minute integer NOT NULL);
