-- Owned service credentials are separate from every customer's connections.
CREATE TABLE guardian_x_service_account (
 id TEXT PRIMARY KEY CHECK (id = 'wolfgang'),
 account_id TEXT,
 username TEXT,
 status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected','connected','reconnect_required')),
 encrypted_token TEXT,
 scope TEXT,
 access_expires_at INTEGER,
 generation INTEGER NOT NULL DEFAULT 0,
 refresh_lease_token TEXT,
 refresh_lease_expires INTEGER NOT NULL DEFAULT 0,
 connected_at INTEGER,
 updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE guardian_x_oauth_states (
 state_hash TEXT PRIMARY KEY,
 operator_id TEXT NOT NULL,
 generation INTEGER NOT NULL,
 encrypted_verifier TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_x_oauth_expiry ON guardian_x_oauth_states(expires_at);
--> statement-breakpoint
-- Never retain ciphertext, keys, message text or customer identifiers here.
CREATE TABLE guardian_x_event_notices (
 event_id TEXT PRIMARY KEY,
 event_type TEXT NOT NULL,
 reason TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_x_notice_created ON guardian_x_event_notices(created_at);
--> statement-breakpoint
CREATE TABLE guardian_x_sender_optouts (
 sender_id TEXT PRIMARY KEY,
 stopped_at INTEGER NOT NULL
);
