-- Seed data for development/testing
-- Run this after schema.sql to populate sample data

-- Sample hotspots across Oxfordshire
INSERT INTO hotspots (centroid_latitude, centroid_longitude, score, status, report_count, volunteer_interest_count, area_name) VALUES
  (51.7520, -1.2577, 12, 'needs_attention', 5, 1, 'Oxford City Centre'),
  (51.7489, -1.2625, 8, 'cleanup_forming', 4, 3, 'Jericho'),
  (51.7440, -1.2400, 15, 'needs_attention', 7, 2, 'Cowley Road'),
  (51.7610, -1.2580, 6, 'recently_improved', 3, 4, 'Summertown'),
  (51.7545, -1.2680, 10, 'needs_attention', 5, 0, 'Port Meadow Path'),
  (51.7350, -1.2100, 9, 'cleanup_forming', 4, 3, 'Headington'),
  (51.7480, -1.2900, 4, 'cleaned', 2, 5, 'Botley'),
  (51.7560, -1.2450, 7, 'needs_attention', 3, 1, 'University Parks Edge'),
  (51.7800, -1.3100, 5, 'needs_attention', 2, 0, 'Wolvercote'),
  (51.6900, -1.2800, 11, 'needs_attention', 6, 2, 'Abingdon Road');

-- Sample reports linked to hotspots
INSERT INTO reports (latitude, longitude, severity, note, source, hotspot_id, status) VALUES
  (51.7522, -1.2580, 'medium', 'Fast food packaging near the bus station', 'web', (SELECT id FROM hotspots WHERE area_name = 'Oxford City Centre'), 'confirmed'),
  (51.7518, -1.2575, 'bad', 'Overflowing bin and bags of rubbish', 'web', (SELECT id FROM hotspots WHERE area_name = 'Oxford City Centre'), 'confirmed'),
  (51.7525, -1.2572, 'low', 'A few cans and bottles', 'web', (SELECT id FROM hotspots WHERE area_name = 'Oxford City Centre'), 'confirmed'),
  (51.7490, -1.2628, 'medium', 'Litter along the canal path', 'web', (SELECT id FROM hotspots WHERE area_name = 'Jericho'), 'confirmed'),
  (51.7488, -1.2620, 'bad', 'Fly-tipping near the bridge', 'web', (SELECT id FROM hotspots WHERE area_name = 'Jericho'), 'confirmed'),
  (51.7442, -1.2405, 'bad', 'Takeaway containers everywhere', 'web', (SELECT id FROM hotspots WHERE area_name = 'Cowley Road'), 'confirmed'),
  (51.7438, -1.2395, 'medium', 'Broken glass and cans', 'web', (SELECT id FROM hotspots WHERE area_name = 'Cowley Road'), 'confirmed'),
  (51.7445, -1.2410, 'bad', 'Rubbish bags dumped by bins', 'web', (SELECT id FROM hotspots WHERE area_name = 'Cowley Road'), 'confirmed'),
  (51.7612, -1.2575, 'low', 'Scattered litter after market day', 'web', (SELECT id FROM hotspots WHERE area_name = 'Summertown'), 'confirmed'),
  (51.7547, -1.2685, 'medium', 'Plastic bottles and wrappers along path', 'web', (SELECT id FROM hotspots WHERE area_name = 'Port Meadow Path'), 'confirmed');
