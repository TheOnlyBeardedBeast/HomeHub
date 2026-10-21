-- Test data for Events table
-- Insert sample events with various recurrence patterns

-- 1. Simple non-recurring event
INSERT INTO "Events" ("Id", "Title", "Description", "Organizer", "Start", "End", "Rrules", "Category", "AllDay", "ExceptDates")
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Team Meeting',
  'Weekly team sync',
  '00000000-0000-0000-0000-000000000001'::uuid,
  '2026-01-08 10:00:00+00'::timestamp with time zone,
  '2026-01-08 11:00:00+00'::timestamp with time zone,
  NULL,
  'Work',
  false,
  NULL
);

-- 2. Daily recurring event (5 occurrences starting Jan 6)
INSERT INTO "Events" ("Id", "Title", "Description", "Organizer", "Start", "End", "Rrules", "Category", "AllDay", "ExceptDates")
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Daily Standup',
  'Daily team standup meeting',
  '00000000-0000-0000-0000-000000000001'::uuid,
  '2026-01-06 09:00:00+00'::timestamp with time zone,
  '2026-01-06 09:30:00+00'::timestamp with time zone,
  '["FREQ=DAILY;COUNT=5"]'::jsonb,
  'Work',
  false,
  NULL
);

-- 3. Weekly recurring event (Mondays and Wednesdays for 8 weeks)
INSERT INTO "Events" ("Id", "Title", "Description", "Organizer", "Start", "End", "Rrules", "Category", "AllDay", "ExceptDates")
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Training Session',
  'Weekly training on Mondays and Wednesdays',
  '00000000-0000-0000-0000-000000000002'::uuid,
  '2026-01-05 14:00:00+00'::timestamp with time zone,
  '2026-01-05 15:30:00+00'::timestamp with time zone,
  '["FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8"]'::jsonb,
  'Training',
  false,
  NULL
);

-- 4. Daily recurring event with exception dates
INSERT INTO "Events" ("Id", "Title", "Description", "Organizer", "Start", "End", "Rrules", "Category", "AllDay", "ExceptDates")
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Exercise Routine',
  'Daily exercise routine (skipped on weekends)',
  '00000000-0000-0000-0000-000000000003'::uuid,
  '2026-01-06 06:00:00+00'::timestamp with time zone,
  '2026-01-06 07:00:00+00'::timestamp with time zone,
  '["FREQ=DAILY;UNTIL=20260131T060000Z"]'::jsonb,
  'Personal',
  false,
  '["2026-01-10T06:00:00+00", "2026-01-11T06:00:00+00", "2026-01-17T06:00:00+00"]'::jsonb
);

-- 5. All-day event (non-recurring)
INSERT INTO "Events" ("Id", "Title", "Description", "Organizer", "Start", "End", "Rrules", "Category", "AllDay", "ExceptDates")
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Company Holiday',
  'Founders Day',
  '00000000-0000-0000-0000-000000000001'::uuid,
  '2026-01-15 00:00:00+00'::timestamp with time zone,
  '2026-01-15 23:59:59+00'::timestamp with time zone,
  NULL,
  'Holiday',
  true,
  NULL
);

-- 6. Multiple RRULEs in one event
INSERT INTO "Events" ("Id", "Title", "Description", "Organizer", "Start", "End", "Rrules", "Category", "AllDay", "ExceptDates")
VALUES (
  '66666666-6666-6666-6666-666666666666'::uuid,
  'Monthly & Quarterly Review',
  'Combined monthly and quarterly review meetings',
  '00000000-0000-0000-0000-000000000002'::uuid,
  '2026-01-05 11:00:00+00'::timestamp with time zone,
  '2026-01-05 12:00:00+00'::timestamp with time zone,
  '["FREQ=MONTHLY;BYMONTHDAY=5", "FREQ=QUARTERLY;BYMONTHDAY=5"]'::jsonb,
  'Review',
  false,
  NULL
);

-- TEST QUERIES
-- ============

-- Test 1: Get all non-recurring events in the range
-- Expected: Team Meeting (Jan 8), Company Holiday (Jan 15)
SELECT 'Test 1: Non-recurring events' AS test_name;
SELECT e."Id", e."Title", e."Start" FROM "Events" e
WHERE (e."Rrules" IS NULL OR jsonb_array_length(e."Rrules") = 0)
  AND e."Start" BETWEEN '2026-01-06'::TIMESTAMP AND '2026-01-12'::TIMESTAMP
ORDER BY e."Start";

-- Test 2: Get all occurrences for Daily Standup in the range Jan 6-12
-- Expected: 5 occurrences (Jan 6-10 at 09:00)
SELECT 'Test 2: Daily Standup occurrences (Jan 6-12)' AS test_name;
SELECT e."Id", e."Title", 
       compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET AS rruleset,
       occ.occurrence
FROM "Events" e
LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
LEFT JOIN LATERAL _rrule.occurrences(
  compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
  '[2026-01-06 00:00:00+00, 2026-01-13 00:00:00+00)'::TSRANGE
) AS occ(occurrence) ON TRUE
WHERE e."Id" = '22222222-2222-2222-2222-222222222222'::uuid
ORDER BY occ.occurrence;

-- Test 3: Get all occurrences for Training Session (Mon/Wed) in the range Jan 5-20
-- Expected: Multiple occurrences on Mondays and Wednesdays
SELECT 'Test 3: Training Session occurrences (Jan 5-20)' AS test_name;
SELECT e."Id", e."Title",
       occ.occurrence
FROM "Events" e
LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
LEFT JOIN LATERAL _rrule.occurrences(
  compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
  '[2026-01-05 00:00:00+00, 2026-01-21 00:00:00+00)'::TSRANGE
) AS occ(occurrence) ON TRUE
WHERE e."Id" = '33333333-3333-3333-3333-333333333333'::uuid
ORDER BY occ.occurrence;

-- Test 4: Check if specific timestamp matches Exercise Routine (should respect exceptions)
-- Expected: Should show which dates are excluded
SELECT 'Test 4: Exercise Routine with exceptions (Jan 6-20)' AS test_name;
SELECT e."Id", e."Title",
       occ.occurrence,
       CASE WHEN occ.occurrence = '2026-01-10 06:00:00+00'::timestamp with time zone 
            OR occ.occurrence = '2026-01-11 06:00:00+00'::timestamp with time zone
            OR occ.occurrence = '2026-01-17 06:00:00+00'::timestamp with time zone
       THEN 'EXCLUDED' ELSE 'INCLUDED' END AS status
FROM "Events" e
LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
LEFT JOIN LATERAL _rrule.occurrences(
  compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
  '[2026-01-06 00:00:00+00, 2026-01-21 00:00:00+00)'::TSRANGE
) AS occ(occurrence) ON TRUE
WHERE e."Id" = '44444444-4444-4444-4444-444444444444'::uuid
ORDER BY occ.occurrence;

-- Test 5: Combined query - all events (recurring + non-recurring) in range
-- Expected: Mix of recurring occurrences and non-recurring events
-- OPTIMIZED: Pre-filter events and use CTE to reduce expensive operations
SELECT 'Test 5: All events in range (Jan 6-20) - OPTIMIZED' AS test_name;
WITH filtered_events AS (
  -- Only get events that could possibly have occurrences in the range
  SELECT * FROM "Events"
  WHERE ("Rrules" IS NOT NULL AND jsonb_array_length("Rrules") > 0)
     OR ("Start" BETWEEN '2026-01-06'::TIMESTAMP AND '2026-01-20'::TIMESTAMP)
)
SELECT e."Id", e."Title", occ.occurrence AS "Start", 'Recurring' AS type
FROM filtered_events e
INNER JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
INNER JOIN LATERAL _rrule.occurrences(
  compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
  '[2026-01-06 00:00:00+00, 2026-01-21 00:00:00+00)'::TSRANGE
) AS occ(occurrence) ON TRUE
WHERE e."Rrules" IS NOT NULL
UNION ALL
SELECT e."Id", e."Title", e."Start", 'Non-recurring' AS type
FROM filtered_events e
WHERE (e."Rrules" IS NULL OR jsonb_array_length(e."Rrules") = 0)
  AND e."Start" BETWEEN '2026-01-06'::TIMESTAMP AND '2026-01-20'::TIMESTAMP
ORDER BY "Start";

-- Test 6: Check if specific timestamp matches any rule
-- Expected: Show which events have occurrences on Jan 8 09:00
SELECT 'Test 6: Events matching Jan 8 09:00' AS test_name;
SELECT e."Id", e."Title",
       ARRAY_AGG(compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET) FILTER (WHERE rule IS NOT NULL) @> 
       '2026-01-08 09:00:00+00'::TIMESTAMP with time zone AS matches
FROM "Events" e
LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
WHERE e."Rrules" IS NOT NULL
GROUP BY e."Id", e."Title"
HAVING ARRAY_AGG(compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET) FILTER (WHERE rule IS NOT NULL) @> '2026-01-08 09:00:00+00'::TIMESTAMP with time zone;
