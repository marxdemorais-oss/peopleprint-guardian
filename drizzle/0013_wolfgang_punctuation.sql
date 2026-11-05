INSERT INTO guardian_voice_editions (kind,body,base,actor,created)
SELECT 'published',body || char(10,10) || 'Writing style' || char(10) || 'Avoid em dashes in your own writing. Use a full stop, a comma or two short sentences. Preserve punctuation in direct quotations from a customer or their evidence.',id,'guardian-release',strftime('%Y-%m-%dT%H:%M:%fZ','now')
FROM guardian_voice_editions WHERE kind='published' ORDER BY id DESC LIMIT 1;
