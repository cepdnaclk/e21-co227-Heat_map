CREATE DATABASE IF NOT EXISTS heatmap_db;

\c heatmap_db
-- Create buildings table
CREATE TABLE buildings (
    building_id VARCHAR(10) PRIMARY KEY,   -- Auto-increment primary key
    building_name VARCHAR(100) NOT NULL,
    building_capacity INT NOT NULL CHECK (building_capacity > 0)
);

INSERT INTO buildings (building_id, building_name, building_capacity) VALUES
('B1',  'Engineering Carpentry Shop', 85),
('B2',  'Engineering Workshop', 85),
('B3',  '', 1),
('B4',  'Generator Room', 1),
('B5',  '', 1),
('B6',  'Structure Lab', 350),
('B7',  'Administrative Building', 80),
('B8',  'Canteen', 20),
('B9',  'Lecture Room 10/11', 130),
('B10', 'Engineering Library', 80),
('B11', 'Department of Chemical and process Engineering', 50),
('B12', 'Lecture Room 2/3', 130),
('B13', 'Drawing Office 2', 500),
('B14', 'Faculty Canteen', 80),
('B15', 'Department of Manufacturing and Industrial Engineering', 100),
('B16', 'Professor E.O.E. Perera Theater', 80),
('B17', 'Electronic Lab', 130),
('B18', 'Washrooms', 30),
('B19', 'Electrical and Electronic Workshop', 60),
('B20', 'Department of Computer Engineering', 130),
('B21', '', 30),
('B22', 'Environmental Lab', 70),
('B23', 'Applied Mechanics Lab', 450),
('B24', 'New Mechanics Lab', 150),
('B25', '', 30),
('B26', '', 30),
('B27', '', 30),
('B28', 'Materials Lab', 200),
('B29', 'Thermodynamics Lab', 200),
('B30', 'Fluids Lab', 200),
('B31', 'Surveying and Soil Lab', 225),
('B32', 'Department of Engineering Mathematics', 100),
('B33', 'Drawing Office 1', 450),
('B34', 'Department of Electrical and Electronic Engineering ', 400);



-- Create current_status table
CREATE TABLE current_status (
       -- Unique row identifier
    building_id VARCHAR(10) NOT NULL PRIMARY KEY,
    current_crowd INT NOT NULL CHECK (current_crowd >= 0),
    color VARCHAR(20),
    status_timestamp VARCHAR(50) DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_building
        FOREIGN KEY (building_id) 
        REFERENCES buildings(building_id)
        ON DELETE CASCADE
);
