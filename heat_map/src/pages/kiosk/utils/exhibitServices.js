class ExhibitService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/buildings';
    }

    async fetchExhibits() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const buildings = await response.json();
            
            // Map buildings to extract exhibit-related data
            const exhibits = buildings.map(building => ({
                building_id: building.building_ID,
                zone_id: building.zone_ID,
                building_name: building.building_name,
                description: building.description,
                exhibits: building.exhibits, // Assuming exhibits is an array or string
                exhibit_tags: building.exhibit_tags // Assuming exhibit_tags is an array or string
            }));

            return exhibits;
        } catch (error) {
            console.error('Error fetching exhibits:', error);
            throw error;
        }
    }

    // Method to get exhibits by zone_id
    async getExhibitsByZone(zoneId) {
        try {
            const exhibits = await this.fetchExhibits();
            return exhibits.filter(exhibit => exhibit.zone_id === zoneId);
        } catch (error) {
            console.error(`Error fetching exhibits for zone ${zoneId}:`, error);
            throw error;
        }
    }

    // Method to get exhibit by building_id
    async getExhibitByBuildingId(buildingId) {
        try {
            const exhibits = await this.fetchExhibits();
            return exhibits.find(exhibit => exhibit.building_id === buildingId) || null;
        } catch (error) {
            console.error(`Error fetching exhibit for building ${buildingId}:`, error);
            throw error;
        }
    }

    // Method to get exhibits by tag
    async getExhibitsByTag(tag) {
        try {
            const exhibits = await this.fetchExhibits();
            return exhibits.filter(exhibit => 
                Array.isArray(exhibit.exhibit_tags) 
                    ? exhibit.exhibit_tags.includes(tag) 
                    : exhibit.exhibit_tags === tag
            );
        } catch (error) {
            console.error(`Error fetching exhibits for tag ${tag}:`, error);
            throw error;
        }
    }
}

export default ExhibitService;