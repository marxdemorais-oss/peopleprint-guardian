CREATE TABLE guardian_xchat_deliveries (
 delivery_key TEXT PRIMARY KEY NOT NULL,
 job_id TEXT,
 account_id TEXT NOT NULL,
 sender_id TEXT NOT NULL,
 owner_id TEXT,
 message_id TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('prepared','sending','sent','uncertain','cancelled')),
 payload_json TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_xchat_delivery_time ON guardian_xchat_deliveries(created_at);
--> statement-breakpoint
CREATE TABLE guardian_xchat_received (
 event_uuid TEXT PRIMARY KEY NOT NULL,
 message_id TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_xchat_received_time ON guardian_xchat_received(created_at);
