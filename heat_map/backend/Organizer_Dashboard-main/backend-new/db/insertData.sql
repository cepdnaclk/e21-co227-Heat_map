-- ==============================
-- INSERT SAMPLE DATA
-- ==============================
\c organizer_dashboard;

INSERT INTO Zone (zone_name) VALUES
('A'),      -- This would get zone_ID = 1
('B'),      -- This would get zone_ID = 2  
('C'),      -- This would get zone_ID = 3
('D');      -- This would get zone_ID = 4
-- 1. Zone


-- 2. Building
INSERT INTO Building (building_ID, zone_ID, building_name, description, exhibits) VALUES
(101, 1, 'Tech Building A', 'Main hub for technology exhibits', ARRAY['robocar', 'robotics']),
(102, 1, 'Tech Building B', 'Secondary hub for tech startups', ARRAY['cal', 'Electronics']);


-- 3. Exhibits
INSERT INTO Exhibits (exhibit_name, building_ID) VALUES
('Autonomous Drone', 101),
('AI Chatbot', 101),
('IoT Smart Home', 102),\
('Nano Medicine Prototype', 301);

-- 4. Organizer
INSERT INTO Organizer (organizer_name, fname, lname, email, contact_no, password_hash, status) VALUES
('Tech Team', 'Alice', 'Fernando', 'alice@uni.lk', '0771234567', 'hash1', 'approved'),
('Innovation Team', 'Bob', 'Perera', 'bob@uni.lk', '0772345678', 'hash2', 'approved'),
('Research Team', 'Charlie', 'Silva', 'charlie@uni.lk', '0773456789', 'hash3', 'pending'),
('Student Projects Team', 'Diana', 'Kumari', 'diana@uni.lk', '0774567890', 'hash4', 'approved');

-- 5. Events
INSERT INTO Events (event_name, start_time, end_time, location, description, media_urls, event_categories) VALUES
('AI Workshop', '2025-09-20 09:00', '2025-09-20 12:00', 'Tech Building A', 'Hands-on AI training', 'ai.jpg', ARRAY['Workshop','AI']),
('Innovation Pitch', '2025-09-21 10:00', '2025-09-21 13:00', 'Innovation Hub', 'Pitching ideas to investors', 'pitch.png', ARRAY['Pitch','Innovation']),
('Research Symposium', '2025-09-22 09:00', '2025-09-22 16:00', 'Research Block', 'Sharing latest research', 'symposium.pdf', ARRAY['Symposium','Research']),
('Student Project Expo', '2025-09-23 09:00', '2025-09-23 18:00', 'Student Projects Zone', 'Showcasing student projects', 'expo.mp4', ARRAY['Expo','Students']);

-- 6. Admin
INSERT INTO Admin (user_name, email) VALUES
('superadmin', 'admin@uni.lk'),
('eventadmin', 'event@uni.lk'),
('zoneadmin', 'zone@uni.lk'),
('systemadmin', 'sys@uni.lk');

-- 7. Speaker
INSERT INTO Speaker (speaker_name, email) VALUES
('Dr. Nimal Jayasuriya', 'nimal@uni.lk'),
('Prof. Anusha Wickramasinghe', 'anusha@uni.lk'),
('Mr. Kasun Weerasinghe', 'kasun@uni.lk'),
('Ms. Tharushi Perera', 'tharushi@uni.lk');

-- 8. Event_Speaker (link speakers to events)
INSERT INTO Event_Speaker (event_ID, speaker_ID) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4);

-- 9. Tag
INSERT INTO Tag (tag_name) VALUES
('AI'),
('Innovation'),
('Research'),
('Student Projects');

-- 10. Event_Tag (link tags to events)
INSERT INTO Event_Tag (event_ID, tag_ID) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- 11. Exhibit_Tag_Map (exhibit name -> allowed tag) using only:
-- ['AI','Robotics','Mechanics','Civil','Electronics','Computer Science','Chemical','Manufacturing']
-- This resolves building_ID from Exhibits to keep consistency
INSERT INTO Exhibit_Tag_Map (building_ID, exhibit_name, tag)
SELECT e.building_ID, e.exhibit_name, v.tag
FROM (
	VALUES
		('Autonomous Drone', 'Robotics'),
		('Autonomous Drone', 'AI'),
		('Autonomous Drone', 'Electronics'),
		('AI Chatbot', 'AI'),
		('AI Chatbot', 'Computer Science'),
		('IoT Smart Home', 'Electronics'),
		('IoT Smart Home', 'Computer Science'),
		('Nano Medicine Prototype', 'Chemical'),
		('Nano Medicine Prototype', 'Electronics')
) AS v(exhibit_name, tag)
JOIN Exhibits e ON e.exhibit_name = v.exhibit_name
ON CONFLICT DO NOTHING;

-- 12. Exhibit_Tag_Map from Building seed pairs
-- Building 101: 'robocar' -> 'robotics'
-- Building 102: 'cal' -> 'Electronics'
INSERT INTO Exhibit_Tag_Map (building_ID, exhibit_name, tag)
SELECT v.building_ID, v.exhibit_name, v.tag
FROM (
	VALUES
		(101, 'robocar', 'robotics'),
		(102, 'cal', 'Electronics')
) AS v(building_ID, exhibit_name, tag)
WHERE NOT EXISTS (
	SELECT 1 FROM Exhibit_Tag_Map etm
	WHERE etm.building_ID = v.building_ID
		AND etm.exhibit_name = v.exhibit_name
		AND etm.tag = v.tag
);