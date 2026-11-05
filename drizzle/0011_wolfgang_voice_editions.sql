CREATE TABLE guardian_voice_editions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 kind TEXT NOT NULL CHECK (kind IN ('draft','published')),
 body TEXT NOT NULL,
 base INTEGER NOT NULL,
 actor TEXT NOT NULL,
 created TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX guardian_voice_kind_id ON guardian_voice_editions(kind,id);
