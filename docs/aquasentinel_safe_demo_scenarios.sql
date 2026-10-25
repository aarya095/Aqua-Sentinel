/*
AquaSentinel safe presentation scenarios
Run SETUP once, then run only one scenario section at a time.
Original incidents are never updated by these scripts.
Demo-created incident IDs are tracked in aquasentinel_demo_incidents.
Rainfall/water-level readings are appended. response_plans are preserved.
*/

-- SETUP (run once)
CREATE TABLE IF NOT EXISTS aquasentinel_demo_incidents (
    incident_id BIGINT PRIMARY KEY REFERENCES incidents(incident_id) ON DELETE CASCADE,
    scenario_key VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT setval('rainfall_rainfall_id_seq',
              COALESCE((SELECT MAX(rainfall_id) FROM rainfall), 1),
              EXISTS (SELECT 1 FROM rainfall));
SELECT setval('water_levels_measurement_id_seq',
              COALESCE((SELECT MAX(measurement_id) FROM water_levels), 1),
              EXISTS (SELECT 1 FROM water_levels));

-- Optional preflight:
-- SELECT incident_id, hotspot_id, severity, affected_population, status FROM incidents ORDER BY incident_id;
-- SELECT status, COUNT(*) FROM pumps GROUP BY status;
-- SELECT status, COUNT(*) FROM response_teams GROUP BY status;


-- SCENARIO 1: NORMAL CONDITIONS
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='GOOD', blocked_percentage=5.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.80,2);
INSERT INTO rainfall (ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,2.00,'MANUAL_SCENARIO' FROM wards;
INSERT INTO water_levels (hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,0.10,0.0000 FROM hotspots;
UPDATE pumps SET status='AVAILABLE';
UPDATE response_teams SET status='AVAILABLE';
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE','LOW',20,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn=1 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'NORMAL' FROM inserted;
COMMIT;


-- SCENARIO 2: HEAVY RAINFALL
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='FAIR',blocked_percentage=25.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.65,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,
 CASE WHEN rn%3=0 THEN 72.00 WHEN rn%3=1 THEN 58.00 ELSE 45.00 END,'MANUAL_SCENARIO'
FROM (SELECT ward_id,ROW_NUMBER() OVER(ORDER BY ward_id) rn FROM wards) w;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,
 CASE WHEN rn%3=0 THEN 0.75 WHEN rn%3=1 THEN 0.55 ELSE 0.40 END,0.0060
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
 CASE WHEN rn<=2 THEN 'HIGH' ELSE 'MODERATE' END,
 CASE WHEN rn<=2 THEN 450 ELSE 180 END,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=4 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'HEAVY_RAIN' FROM inserted;
COMMIT;


-- SCENARIO 3: SEVERE WATERLOGGING
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='POOR',blocked_percentage=45.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.40,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,88.00,'MANUAL_SCENARIO' FROM wards;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,CASE WHEN rn<=3 THEN 1.35 ELSE 0.95 END,
 CASE WHEN rn<=3 THEN 0.0250 ELSE 0.0140 END
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
 CASE WHEN rn<=3 THEN 'CRITICAL' ELSE 'HIGH' END,
 CASE WHEN rn<=3 THEN 1200 ELSE 650 END,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=5 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'SEVERE_WATERLOGGING' FROM inserted;
COMMIT;


-- SCENARIO 4: BLOCKED DRAINAGE
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='POOR',blocked_percentage=85.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.15,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,24.00,'MANUAL_SCENARIO' FROM wards;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,CASE WHEN rn<=3 THEN 0.90 ELSE 0.45 END,
 CASE WHEN rn<=3 THEN 0.0120 ELSE 0.0040 END
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
 CASE WHEN rn<=2 THEN 'HIGH' ELSE 'MODERATE' END,
 CASE WHEN rn<=2 THEN 500 ELSE 220 END,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=4 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'BLOCKED_DRAINAGE' FROM inserted;
COMMIT;


-- SCENARIO 5: RESOURCE SHORTAGE
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='FAIR',blocked_percentage=35.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.55,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,CASE WHEN rn%2=0 THEN 62.00 ELSE 48.00 END,'MANUAL_SCENARIO'
FROM (SELECT ward_id,ROW_NUMBER() OVER(ORDER BY ward_id) rn FROM wards) w;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,CASE WHEN rn<=2 THEN 1.10 ELSE 0.70 END,0.0100
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
UPDATE pumps SET status='DEPLOYED';
UPDATE response_teams SET status='DEPLOYED';
WITH first_pump AS (SELECT pump_id FROM pumps ORDER BY pump_id LIMIT 1)
UPDATE pumps SET status='AVAILABLE' WHERE pump_id IN (SELECT pump_id FROM first_pump);
WITH first_team AS (SELECT team_id FROM response_teams ORDER BY team_id LIMIT 1)
UPDATE response_teams SET status='AVAILABLE' WHERE team_id IN (SELECT team_id FROM first_team);
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
 CASE WHEN rn<=2 THEN 'CRITICAL' ELSE 'HIGH' END,
 CASE WHEN rn<=2 THEN 1000 ELSE 550 END,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=5 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'RESOURCE_SHORTAGE' FROM inserted;
COMMIT;

INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'COMPETING_PRIORITIES' FROM inserted;
COMMIT;

-- SCENARIO 7: DRAINAGE FAILURE VS RAINFALL (2 incidents)
-- Test: modest rainfall but severe drainage blockage, versus a second incident
-- with lower water level and slower rise. Agent should consider drainage risk.
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='POOR',blocked_percentage=88.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.12,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,18.00,'MANUAL_SCENARIO' FROM wards;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,
       CASE rn WHEN 1 THEN 1.05 WHEN 2 THEN 0.42 ELSE 0.16 END,
       CASE rn WHEN 1 THEN 0.0230 WHEN 2 THEN 0.0040 ELSE 0.0000 END
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
UPDATE pumps SET status='AVAILABLE';
UPDATE response_teams SET status='AVAILABLE';
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
        CASE WHEN rn=1 THEN 'HIGH' ELSE 'MODERATE' END,
        CASE WHEN rn=1 THEN 520 ELSE 260 END,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=2 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'DRAINAGE_VS_RAIN' FROM inserted;
COMMIT;


-- SCENARIO 8: SCARCE RESOURCES, THREE INCIDENTS (3 incidents)
-- Test: only one available pump and one available team; agent should avoid
-- recommending the same scarce resource for incompatible simultaneous tasks.
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='POOR',blocked_percentage=55.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.35,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,69.00,'MANUAL_SCENARIO' FROM wards;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,
       CASE rn WHEN 1 THEN 1.42 WHEN 2 THEN 1.16 WHEN 3 THEN 0.78 ELSE 0.32 END,
       CASE rn WHEN 1 THEN 0.0280 WHEN 2 THEN 0.0180 WHEN 3 THEN 0.0130 ELSE 0.0020 END
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
UPDATE pumps SET status='DEPLOYED';
UPDATE response_teams SET status='DEPLOYED';
WITH first_pump AS (SELECT pump_id FROM pumps ORDER BY pump_id LIMIT 1)
UPDATE pumps SET status='AVAILABLE' WHERE pump_id IN (SELECT pump_id FROM first_pump);
WITH first_team AS (SELECT team_id FROM response_teams ORDER BY team_id LIMIT 1)
UPDATE response_teams SET status='AVAILABLE' WHERE team_id IN (SELECT team_id FROM first_team);
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
        CASE rn WHEN 1 THEN 'CRITICAL' WHEN 2 THEN 'CRITICAL' ELSE 'HIGH' END,
        CASE rn WHEN 1 THEN 900 WHEN 2 THEN 1450 ELSE 620 END,
        CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=3 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'SCARCE_RESOURCES_3' FROM inserted;
COMMIT;


-- SCENARIO 9: RISING VS RECEDING WATER (2 incidents)
-- Test: higher current water level but receding versus lower water level
-- rising quickly. Agent should explain urgency using trend and exposure.
BEGIN;
DELETE FROM incidents WHERE incident_id IN (SELECT incident_id FROM aquasentinel_demo_incidents);
DELETE FROM aquasentinel_demo_incidents;
UPDATE drainage SET condition='FAIR',blocked_percentage=20.00,
    current_flow_m3_hr=ROUND(COALESCE(capacity_m3_hr,100)::numeric*0.70,2);
INSERT INTO rainfall(ward_id,timestamp,rainfall_mm_hr,source)
SELECT ward_id,CURRENT_TIMESTAMP,38.00,'MANUAL_SCENARIO' FROM wards;
INSERT INTO water_levels(hotspot_id,timestamp,water_level_m,rate_of_change_m_per_min)
SELECT hotspot_id,CURRENT_TIMESTAMP,
       CASE rn WHEN 1 THEN 1.12 WHEN 2 THEN 0.72 ELSE 0.18 END,
       CASE rn WHEN 1 THEN -0.0140 WHEN 2 THEN 0.0320 ELSE 0.0000 END
FROM (SELECT hotspot_id,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn FROM hotspots) h;
UPDATE pumps SET status='AVAILABLE';
UPDATE response_teams SET status='AVAILABLE';
WITH chosen AS (
 SELECT hotspot_id,geometry,ROW_NUMBER() OVER(ORDER BY hotspot_id) rn
 FROM hotspots WHERE geometry IS NOT NULL
), inserted AS (
 INSERT INTO incidents(hotspot_id,started_at,status,severity,affected_population,created_at,geometry)
 SELECT hotspot_id,CURRENT_TIMESTAMP,'ACTIVE',
        CASE WHEN rn=1 THEN 'HIGH' ELSE 'MODERATE' END,
        CASE WHEN rn=1 THEN 330 ELSE 780 END,CURRENT_TIMESTAMP,geometry
 FROM chosen WHERE rn<=2 RETURNING incident_id
)
INSERT INTO aquasentinel_demo_incidents(incident_id,scenario_key)
SELECT incident_id,'RISING_VS_RECEDING' FROM inserted;
COMMIT;


-- VERIFICATION QUERIES (run separately)
-- Original incidents 11-16 should remain unchanged:
-- SELECT incident_id,hotspot_id,severity,affected_population,status FROM incidents WHERE incident_id BETWEEN 11 AND 16 ORDER BY incident_id;
-- Current demo incidents:
-- SELECT i.incident_id,d.scenario_key,i.hotspot_id,i.severity,i.affected_population,i.status
-- FROM incidents i JOIN aquasentinel_demo_incidents d USING(incident_id) ORDER BY i.incident_id;
-- Latest rainfall per ward:
-- SELECT DISTINCT ON(ward_id) ward_id,rainfall_mm_hr,timestamp,source FROM rainfall ORDER BY ward_id,timestamp DESC,rainfall_id DESC;
-- Latest water level per hotspot:
-- SELECT DISTINCT ON(hotspot_id) hotspot_id,water_level_m,rate_of_change_m_per_min,timestamp FROM water_levels ORDER BY hotspot_id,timestamp DESC,measurement_id DESC;
