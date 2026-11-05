CREATE TABLE `guardian_profiles` (
  `owner_id` text PRIMARY KEY NOT NULL,
  `id` text NOT NULL UNIQUE,
  `email` text NOT NULL,
  `display_name` text NOT NULL,
  `onboarding_complete` integer DEFAULT 0 NOT NULL,
  `memory_enabled` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guardian_checks` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL,
  `message` text NOT NULL,
  `channel` text NOT NULL,
  `evidence_json` text NOT NULL,
  `preferences_json` text NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `result_json` text,
  `replies_json` text DEFAULT '[]' NOT NULL,
  `remember` integer DEFAULT 0 NOT NULL,
  `revision` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guardian_checks_owner_updated` ON `guardian_checks` (`owner_id`,`updated_at`);
--> statement-breakpoint
CREATE INDEX `guardian_checks_expiry` ON `guardian_checks` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `guardian_rate_limits` (
  `bucket_key` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL,
  `count` integer DEFAULT 0 NOT NULL,
  `expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guardian_rate_limits_owner` ON `guardian_rate_limits` (`owner_id`);
--> statement-breakpoint
CREATE INDEX `guardian_rate_limits_expiry` ON `guardian_rate_limits` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `guardian_connections` (
  `owner_id` text NOT NULL,
  `provider` text NOT NULL,
  `status` text NOT NULL,
  `external_id` text,
  `display_label` text,
  `connected_at` text,
  `updated_at` text NOT NULL,
  PRIMARY KEY (`owner_id`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `guardian_connection_tokens` (
  `owner_id` text NOT NULL,
  `provider` text NOT NULL,
  `encrypted_token` text NOT NULL,
  `updated_at` text NOT NULL,
  PRIMARY KEY (`owner_id`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `guardian_oauth_states` (
  `state_hash` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL,
  `provider` text NOT NULL,
  `expires_at` integer NOT NULL,
  `pkce_verifier` text NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guardian_oauth_states_owner` ON `guardian_oauth_states` (`owner_id`);
--> statement-breakpoint
CREATE INDEX `guardian_oauth_states_expiry` ON `guardian_oauth_states` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `guardian_contact_links` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL,
  `channel` text NOT NULL,
  `code_hash` text NOT NULL UNIQUE,
  `created_at` integer NOT NULL,
  `expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guardian_contact_links_owner` ON `guardian_contact_links` (`owner_id`);
--> statement-breakpoint
CREATE INDEX `guardian_contact_links_expiry` ON `guardian_contact_links` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `guardian_channel_identities` (
  `channel` text NOT NULL,
  `sender_id` text NOT NULL,
  `owner_id` text NOT NULL,
  `verified_at` integer NOT NULL,
  PRIMARY KEY (`channel`,`sender_id`)
);
--> statement-breakpoint
CREATE INDEX `guardian_channel_identities_owner` ON `guardian_channel_identities` (`owner_id`);
--> statement-breakpoint
CREATE TABLE `guardian_ingress_events` (
  `channel` text NOT NULL,
  `event_id` text NOT NULL,
  `owner_id` text,
  `check_id` text,
  `status` text NOT NULL,
  `created_at` integer NOT NULL,
  PRIMARY KEY (`channel`,`event_id`)
);
--> statement-breakpoint
CREATE INDEX `guardian_ingress_events_owner` ON `guardian_ingress_events` (`owner_id`);
