CREATE TABLE guardian_service_settings (
  setting_key text PRIMARY KEY NOT NULL CHECK(setting_key='guest_check_limit'),
  integer_value integer NOT NULL CHECK(integer_value BETWEEN 1 AND 10),
  revision integer NOT NULL DEFAULT 1,
  updated_at text NOT NULL,
  updated_by text NOT NULL
);
--> statement-breakpoint
INSERT INTO guardian_service_settings(setting_key,integer_value,revision,updated_at,updated_by) VALUES ('guest_check_limit',3,1,'2026-11-01T00:00:00.000Z','schema-default');
