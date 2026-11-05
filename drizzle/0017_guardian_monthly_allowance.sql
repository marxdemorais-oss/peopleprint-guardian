-- All existing completed cases retain their original date and lifetime identity.
CREATE INDEX guardian_trial_owner_consumed ON guardian_trial_usage(owner_id,consumed_at)
  WHERE consumed_at IS NOT NULL;
