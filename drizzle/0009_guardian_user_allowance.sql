ALTER TABLE guardian_profiles ADD COLUMN free_check_allowance integer CHECK(free_check_allowance IS NULL OR free_check_allowance BETWEEN 0 AND 1000);
--> statement-breakpoint
ALTER TABLE guardian_profiles ADD COLUMN allowance_revision integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE guardian_profiles ADD COLUMN allowance_updated_at text;
--> statement-breakpoint
ALTER TABLE guardian_profiles ADD COLUMN allowance_updated_by text;
