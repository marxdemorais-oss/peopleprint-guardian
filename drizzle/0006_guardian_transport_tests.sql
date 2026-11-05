CREATE TABLE guardian_transport_tests (
 job_id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL,
 operator_id TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('sending','sent','uncertain','cancelled')),
 provider_message_id TEXT,
 last_error TEXT,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_transport_tests_owner_time ON guardian_transport_tests(owner_id,created_at);
--> statement-breakpoint
CREATE INDEX guardian_transport_tests_created ON guardian_transport_tests(created_at);
--> statement-breakpoint
CREATE TABLE guardian_email_sender_optouts (
 sender_id TEXT PRIMARY KEY NOT NULL,
 stopped_at INTEGER NOT NULL
);
