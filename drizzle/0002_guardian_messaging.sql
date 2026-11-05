CREATE TABLE guardian_message_jobs (
 id TEXT PRIMARY KEY NOT NULL,
 channel TEXT NOT NULL,
 event_id TEXT NOT NULL,
 sender_id TEXT NOT NULL,
 owner_id TEXT,
 payload_json TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'queued',
 after_send_state TEXT NOT NULL DEFAULT 'completed',
 reply_text TEXT,
 provider_message_id TEXT,
 delivery_generation INTEGER NOT NULL DEFAULT 0,
 attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at INTEGER NOT NULL DEFAULT 0,
 last_error TEXT,
 received_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 UNIQUE(channel,event_id)
);
--> statement-breakpoint
CREATE INDEX guardian_message_jobs_due ON guardian_message_jobs(state,created_at);
--> statement-breakpoint
CREATE INDEX guardian_message_jobs_sender ON guardian_message_jobs(channel,sender_id,created_at);
--> statement-breakpoint
CREATE INDEX guardian_message_jobs_owner ON guardian_message_jobs(owner_id);
--> statement-breakpoint
CREATE TABLE guardian_message_locks (
 sender_key TEXT PRIMARY KEY NOT NULL,
 lease_token TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE guardian_channel_preferences (
 owner_id TEXT NOT NULL,
 channel TEXT NOT NULL,
 stopped_at INTEGER NOT NULL,
 PRIMARY KEY(owner_id,channel)
);
