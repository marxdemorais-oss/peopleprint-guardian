-- Owned-account transport metadata only. Secrets stay in runtime settings;
-- message text, ciphertext and customer identities never belong in this table.
CREATE TABLE guardian_x_transport (
 id TEXT PRIMARY KEY CHECK (id = 'wolfgang'),
 account_id TEXT,
 connection_generation INTEGER,
 configuration_hash TEXT,
 webhook_url TEXT,
 webhook_id TEXT,
 subscription_id TEXT,
 subscription_expires_at INTEGER,
 verified_at INTEGER,
 lease_token TEXT,
 lease_expires_at INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL
);
CREATE INDEX guardian_message_jobs_channel_pending ON guardian_message_jobs(channel,state,expires_at);
