CREATE TABLE guardian_inspector_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 owner_id TEXT NOT NULL,
 check_id TEXT NOT NULL REFERENCES guardian_checks(id) ON DELETE CASCADE,
 attempt_id TEXT NOT NULL,
 sequence INTEGER NOT NULL,
 recorded_at TEXT NOT NULL,
 kind TEXT NOT NULL,
 detail_json TEXT NOT NULL,
 previous_mac TEXT NOT NULL,
 mac TEXT NOT NULL,
 UNIQUE(check_id,attempt_id,sequence)
);
CREATE INDEX guardian_inspector_owner_check ON guardian_inspector_events(owner_id,check_id,id);
