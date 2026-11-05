CREATE TABLE guardian_directory_maintenance_grant (id INTEGER PRIMARY KEY CHECK(id=1), grant_token TEXT NOT NULL);
--> statement-breakpoint
INSERT INTO guardian_directory_maintenance_grant (id,grant_token) VALUES (1,lower(hex(randomblob(32))));
