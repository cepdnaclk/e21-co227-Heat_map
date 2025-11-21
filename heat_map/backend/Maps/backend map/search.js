// search.js
// Enhanced search function for the backend database
// This will replace the frontend buildingData.js when backend is connected

// Enhanced search function with improved logic and database schema format
function searchDatabase(query, { category, zone, subzone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim().toLowerCase();
  let results = [];
  
  // Mock data matching the database schema format
  // This should be replaced with actual database queries when backend is connected
  const mockBuildings = [
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
    }
  ];
  
  // Enhanced search logic with improved matching
  mockBuildings.forEach((building) => {
    const matchesQuery = 
      building.building_name?.toLowerCase().includes(searchTerm) ||
      building.description?.toLowerCase().includes(searchTerm) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(searchTerm));
    
    if (matchesQuery) {
      // Check zone filter if provided
      if (zone && zone !== 'all') {
        if (building.zone_ID !== parseInt(zone)) return;
      }
      
      // Add building to results
      results.push({
        id: building.building_ID,
        name: building.building_name,
        category: 'Building',
        description: building.description,
        buildingId: building.building_ID,
        buildingName: building.building_name,
        svgBuildingId: building.svg_id,
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
}

// Helper function to get building by ID
function getBuildingById(buildingId) {
  const mockBuildings = [
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
    }
  ];
  
  return mockBuildings.find(building => building.building_ID === buildingId);
}

// Helper function to get all buildings
function getAllBuildings() {
  const mockBuildings = [
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
    }
  ];
  
  return mockBuildings.map(building => ({
    building_ID: building.building_ID,
    building_name: building.building_name,
    description: building.description,
    zone_ID: building.zone_ID,
    exhibits: building.exhibits || [],
    coordinates: building.coordinates,
    svg_id: building.svg_id
  }));
}

// Helper function to map building ID to SVG ID
function mapDatabaseIdToSvgId(databaseId) {
  const mapping = {
    33: "b33",  // Tech Building A
    34: "b34",  // Tech Building B
    1: "b1",    // Innovation Hub
    4: "b4",    // Research Block
    16: "b16",  // Student Projects Zone
    28: "b28",  // AI & Machine Learning Center
    26: "b26",  // Green Technology Pavilion
  };
  return mapping[databaseId] || `b${databaseId}`;
}

export {
  searchDatabase,
  getBuildingById,
  getAllBuildings,
  mapDatabaseIdToSvgId
};

