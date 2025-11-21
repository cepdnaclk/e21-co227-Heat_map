import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import './Map.css';

import {
  map, 
  initMap, 
  buildingToNode, 
  drawRoute, 
  addBuildingClickListner, 
  getUserPosition, 
  startGPS, 
  addGpsListner, 
  setUserPosition, 
  addMessageListner, 
  sendMessage, 

  stopGps, 
  setBuildingAccent

} from "./map_module";  

function MapComponent() {
  const mapRef = useRef(null);


  const building_clicked = useRef(null);
  const is_navigation_enabled = useRef(true);


  useEffect(() => {
    if (mapRef.current) return; // prevent re-init

    // Initialize the map
    initMap('map');
    mapRef.current = map

  }, []);
  const mapStyle = { height: "740px", width: "640px", backgroundColor:"#e8f5f9" };

  return <div id="map" style={mapStyle}></div>;
 
}

export default MapComponent;
