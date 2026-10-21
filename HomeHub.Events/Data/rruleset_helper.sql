-- Helper function to compose individual RRULESET for a single RRULE
-- Returns one RRULESET per RRULE with shared DTSTART and EXDATE
CREATE OR REPLACE FUNCTION compose_rruleset(
  p_start TIMESTAMP WITH TIME ZONE,
  p_end TIMESTAMP WITH TIME ZONE,
  p_rrule JSONB,
  p_except_dates JSONB
) RETURNS TEXT AS $$
DECLARE
  v_rrule_text TEXT;
  v_rruleset TEXT := '';
  v_exdate_str TEXT;
BEGIN
  -- Handle NULL start
  IF p_start IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Convert JSONB rrule to TEXT and strip JSON quotes using regex
  IF p_rrule IS NOT NULL THEN
    v_rrule_text := regexp_replace(p_rrule::text, '^"(.*)"$', '\1');
  END IF;
  
  -- Add DTSTART (required)
  v_rruleset := 'DTSTART:' || to_char(p_start AT TIME ZONE 'UTC', 'YYYYMMDD"T"HHMMSS"Z"');
  
  -- Add DTEND if provided
  IF p_end IS NOT NULL THEN
    v_rruleset := v_rruleset || E'\nDTEND:' || to_char(p_end AT TIME ZONE 'UTC', 'YYYYMMDD"T"HHMMSS"Z"');
  END IF;
  
  -- Add RRULE (single rule)
  IF v_rrule_text IS NOT NULL AND v_rrule_text != '' THEN
    v_rruleset := v_rruleset || E'\nRRULE:' || v_rrule_text;
  END IF;
  
  -- Add EXDATE entries (shared across all RRULEs)
  IF p_except_dates IS NOT NULL AND jsonb_array_length(p_except_dates) > 0 THEN
    v_exdate_str := array_to_string(
      (SELECT array_agg(to_char((regexp_replace(elem::text, '^"(.*)"$', '\1'))::TIMESTAMP WITH TIME ZONE AT TIME ZONE 'UTC', 'YYYYMMDD"T"HHMMSS"Z"') ORDER BY elem::TEXT)
       FROM jsonb_array_elements(p_except_dates) AS elem),
      ','
    );
    v_rruleset := v_rruleset || E'\nEXDATE:' || v_exdate_str;
  END IF;
  
  RETURN v_rruleset;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- EXAMPLE QUERIES using compose_rruleset with occurrences(rruleset, tsrange):

-- 1. Get all occurrences for a single event in a date range:
-- SELECT compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET, 
--        occ.occurrence
-- FROM "Events" e
-- LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
-- LEFT JOIN LATERAL _rrule.occurrences(
--   compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
--   '[2026-01-06, 2026-01-12]'::TSRANGE
-- ) AS occ(occurrence) ON TRUE
-- WHERE e."Id" = 'event-uuid-here'
-- ORDER BY occ.occurrence;

-- 2. Get all event occurrences within a date range (recurring + non-recurring):
-- SELECT e."Id", e."Title", occ.occurrence AS "Start"
-- FROM "Events" e
-- LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
-- LEFT JOIN LATERAL _rrule.occurrences(
--   compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
--   '[2026-01-06, 2026-01-12]'::TSRANGE
-- ) AS occ(occurrence) ON TRUE
-- WHERE e."Rrules" IS NOT NULL
-- UNION ALL
-- -- Non-recurring events in the range
-- SELECT e."Id", e."Title", e."Start"
-- FROM "Events" e
-- WHERE (e."Rrules" IS NULL OR jsonb_array_length(e."Rrules") = 0)
--   AND e."Start" BETWEEN '2026-01-06'::TIMESTAMP AND '2026-01-12'::TIMESTAMP
-- ORDER BY "Start";

-- 3. Check if specific timestamp matches any recurrence rule for an event:
-- SELECT e."Id", e."Title",
--        ARRAY_AGG(compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET) @> 
--        '2026-01-15T10:00:00Z'::TIMESTAMP AS matches
-- FROM "Events" e
-- LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
-- WHERE e."Id" = 'event-uuid-here'
-- GROUP BY e."Id", e."Title";

-- 4. Count occurrences per event in a range:
-- SELECT e."Id", e."Title", COUNT(*) as occurrence_count
-- FROM "Events" e
-- LEFT JOIN LATERAL jsonb_array_elements(e."Rrules") AS rule ON TRUE
-- LEFT JOIN LATERAL _rrule.occurrences(
--   compose_rruleset(e."Start", e."End", rule, e."ExceptDates")::_rrule.RRULESET,
--   '[2026-01-06, 2026-01-12]'::TSRANGE
-- ) AS occ(occurrence) ON TRUE
-- WHERE e."Rrules" IS NOT NULL
-- GROUP BY e."Id", e."Title";
