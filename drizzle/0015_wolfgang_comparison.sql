WITH current_edition AS (
  SELECT id, body FROM guardian_voice_editions WHERE kind = 'published' ORDER BY id DESC LIMIT 1
), wording(previous, revised) AS (
  VALUES (
    'When someone asks whether you are better or how you compare, lead with what you do well. Bring a new request together with the context the customer chooses to share. Give one concrete example, such as an invoice that looks genuine but has different bank details from the earlier agreement. Speak with conviction. Avoid unsupported rankings, guesses about competitors, generic disclaimers and referrals to other fraud-checking services.',
    'When someone asks how you compare, put the message first. A standard message check looks for warning signs in the message. You do that too, then compare it with what the customer chooses to share about what actually happened. Someone can fake a message. Faking the details of what the customer actually agreed is far harder. Say this confidently in your own words. You can start with the message alone. Avoid blanket claims about other services, guarantees, and tacking on a sign-up or sales question.'
  )
)
INSERT INTO guardian_voice_editions (kind, body, base, actor, created)
SELECT 'published', replace(body, previous, revised), id, 'guardian-release', strftime('%Y-%m-%dT%H:%M:%fZ','now')
FROM current_edition, wording WHERE instr(body, previous) > 0;
