// buildingData.js
// Sample building data for testing the interactive exhibition map
// This replaces the backend service when it's not available
// Format matches the database schema from script.sql

import buildingApiService from "./buildingApi";

const other_buildings = [
  {
    building_id: 50,
    zone_ID: 2,
    building_name: "Female Restroom",
    description: "Clean and well-maintained female restroom equipped with multiple stalls, sinks, and sanitary facilities. Located within Zone A for convenient access."
  },
  {
    building_id: 51,
    zone_ID: 2,
    building_name: "Male Restroom",
    description: "Spacious male restroom featuring urinals, private stalls, and handwashing stations. Easily accessible within Zone D."
  },
  {
    building_id: 52,
    zone_ID: 2,
    building_name: "Male Restroom",
    description: "Spacious male restroom featuring urinals, private stalls, and handwashing stations. Easily accessible within Zone C."
  },
  {
    building_id: 49,
    zone_ID: 2,
    building_name: "Female Restroom",
    description: "Clean and well-maintained female restroom equipped with multiple stalls, sinks, and sanitary facilities. Located within Zone C for convenient access."
  },
  

]

const buildingData = [
  {
    building_ID: 33,
    zone_ID: 1,
    building_name: "Tech Building A",
    description: "Main hub for technology exhibits featuring robotics, AI, and cutting-edge technology demonstrations.",
    exhibits: ["Robotics", "AI", "Machine Learning", "Computer Vision", "Autonomous Systems"],
    coordinates: [7.253750, 80.592028],
    svg_id: "b33"
  },
  {
    building_ID: 34,
    zone_ID: 1,
    building_name: "Tech Building B",
    description: "Secondary hub for tech startups and emerging technologies including IoT, cloud computing, and mobile applications.",
    exhibits: ["IoT", "Cloud", "Mobile Apps", "Web Development", "Cybersecurity"],
    coordinates: [7.253800, 80.592100],
    svg_id: "b34"
  },
  {
    building_ID: 1,
    zone_ID: 2,
    building_name: "Innovation Hub",
    description: "Creative innovations from students featuring green energy solutions, smart devices, and sustainable technology.",
    exhibits: ["Green Energy", "Smart Devices", "Sustainable Tech", "Student Projects", "Startup Ideas"],
    coordinates: [7.253850, 80.592150],
    svg_id: "b1"
  },
  {
    building_ID: 4,
    zone_ID: 3,
    building_name: "Research Block",
    description: "Research papers and prototypes showcasing medical research, nanotechnology, and advanced scientific discoveries.",
    exhibits: ["Medical Research", "NanoTech", "Biotechnology", "Advanced Materials", "Scientific Research"],
    coordinates: [7.253900, 80.592200],
    svg_id: "b4"
  },
  {
    building_ID: 16,
    zone_ID: 4,
    building_name: "Student Projects Zone",
    description: "Showcasing innovative student projects, academic achievements, and creative solutions from various departments.",
    exhibits: ["Student Projects", "Academic Achievements", "Creative Solutions", "Final Year Projects", "Research Presentations"],
    coordinates: [7.253950, 80.592250],
    svg_id: "b16"
  },
  {
    building_ID: 28,
    zone_ID: 1,
    building_name: "AI & Machine Learning Center",
    description: "Advanced AI and machine learning demonstrations including neural networks, deep learning, and AI applications.",
    exhibits: ["Neural Networks", "Deep Learning", "AI Applications", "Data Science", "Predictive Analytics"],
    coordinates: [7.254000, 80.592300],
    svg_id: "b28"
  },
  {
    building_ID: 26,
    zone_ID: 2,
    building_name: "Green Technology Pavilion",
    description: "Sustainable and green technology solutions including renewable energy, environmental monitoring, and eco-friendly innovations.",
    exhibits: ["Renewable Energy", "Environmental Monitoring", "Eco-friendly Tech", "Solar Technology", "Wind Energy"],
    coordinates: [7.254050, 80.592350],
    svg_id: "b26"
  }];

// Zone information (matches database schema)
const zoneData = [
  {
    zone_ID: 1,
    zone_name: "A"
  },
  {
    zone_ID: 2,
    zone_name: "B"
  },
  {
    zone_ID: 3,
    zone_name: "C"
  },
  {
    zone_ID: 4,
    zone_name: "D"
  }
];

// Helper functions
const getBuildingById = (id) => {
  return buildingData.find(building => building.building_ID === id);
};

const getBuildingsByZone = (zoneId) => {
  return buildingData.filter(building => building.zone_ID === zoneId);
};

const searchBuildings = (query, options = {}) => {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim().toLowerCase();
  let results = [];
  
  buildingData.forEach((building) => {
    const matchesQuery = 
      building.building_name?.toLowerCase().includes(searchTerm) ||
      building.description?.toLowerCase().includes(searchTerm) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(searchTerm));
    
    if (matchesQuery) {
      // Check zone filter if provided
      if (options.zone && options.zone !== 'all') {
        if (building.zone_ID !== parseInt(options.zone)) return;
      }
      
      // Add building to results
      results.push({
        id: building.building_ID,
        name: building.building_name,
        category: 'Building',
        description: building.description,
        buildingId: building.building_ID,
        buildingName: building.building_name,
        svgBuildingId: buildingApiService.mapDatabaseIdToSvgId(building.building_ID),
        zoneId: building.zone_ID,
        coordinates: building.coordinates,
        exhibits: building.exhibits || [],
        type: 'building'
      });
      
      // Add exhibits from this building that match the search
      if (building.exhibits) {
        building.exhibits.forEach((exhibit, index) => {
          if (exhibit.toLowerCase().includes(searchTerm)) {
            results.push({
              id: `${building.building_ID}-exhibit-${index}`,
              name: exhibit,
              category: 'Exhibits',
              description: `Exhibit in ${building.building_name}`,
              buildingId: building.building_ID,
              buildingName: building.building_name,
              svgBuildingId: building.svg_id,
              zoneId: building.zone_ID,
              coordinates: building.coordinates,
              type: 'exhibit'
            });
          }
        });
      }
    }
  });
  
  // Remove duplicates and limit results
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  return uniqueResults.slice(0, 20); // Limit to 20 results
};

const getAllBuildings = () => {
  return buildingData.map(building => ({
    building_id: building.building_ID,
    building_name: building.building_name,
    description: building.description,
    zone_id: building.zone_ID,
    exhibits: building.exhibits || [],
    coordinates: building.coordinates,
    svg_id: building.svg_id
  }));
};

// Export the data and functions
export {
  buildingData,
  zoneData,
  other_buildings,
  getBuildingById,
  getBuildingsByZone,
  searchBuildings,
  getAllBuildings
};

export default buildingData;