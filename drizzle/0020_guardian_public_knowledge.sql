-- This shared catalogue holds findings from independently read official pages.
-- Never store a customer identifier, question, message, search result or case.
CREATE TABLE guardian_public_passages (
 publisher text NOT NULL,
 topic text NOT NULL CHECK(topic IN ('codes','remote','invoice','transfer','refund','fees','contact')),
 source_url text NOT NULL,
 passage text NOT NULL CHECK(length(passage) BETWEEN 28 AND 270),
 proof_method text NOT NULL CHECK(proof_method IN ('cited_passage','reviewed_passage','direct_official_page')),
 checked_at integer NOT NULL,
 next_review_at integer NOT NULL,
 PRIMARY KEY(publisher,topic)
);
--> statement-breakpoint
CREATE INDEX guardian_public_passages_due ON guardian_public_passages(next_review_at);
