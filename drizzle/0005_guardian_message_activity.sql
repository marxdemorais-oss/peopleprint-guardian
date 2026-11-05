CREATE INDEX guardian_message_activity_recent ON guardian_message_jobs(created_at,id);
--> statement-breakpoint
CREATE INDEX guardian_message_activity_channel ON guardian_message_jobs(channel,created_at,id);
--> statement-breakpoint
CREATE INDEX guardian_message_activity_state ON guardian_message_jobs(state,created_at,id);
--> statement-breakpoint
CREATE INDEX guardian_message_activity_channel_state ON guardian_message_jobs(channel,state,created_at,id);
