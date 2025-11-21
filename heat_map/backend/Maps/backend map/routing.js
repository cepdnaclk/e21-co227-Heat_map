const {nodes, edges} = require('./path.json');
const turf = require('@turf/turf')

edges.forEach(e => {
    const line = turf.lineString(e.coords.map(([lat,lng]) => [lng, lat]));
    e.lengthM = turf.length(line, { units: 'meters' });
  });


  // --------------------------------------------------
  // 3) Dijkstra with int indices
  // --------------------------------------------------
  function buildAdjacency(nodes, edges) {
    const adj = Array.from({length:nodes.length}, ()=>[]);
    edges.forEach(e => {
      adj[e.from].push({to:e.to, weight:e.lengthM});
      adj[e.to].push({to:e.from, weight:e.lengthM});
    });
    return adj;
  }

  function dijkstra(adj, start, goal) {
    const n = adj.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(null);
    const visited = new Array(n).fill(false);

    dist[start] = 0;
    for (let count=0; count<n; count++) {
      let u=-1, best=Infinity;
      for (let i=0; i<n; i++) {
        if (!visited[i] && dist[i]<best) { best=dist[i]; u=i; }
      }
      if (u===-1) break;
      if (u===goal) break;
      visited[u]=true;

      for (const {to, weight} of adj[u]) {
        if (visited[to]) continue;
        const alt=dist[u]+weight;
        if (alt<dist[to]) { dist[to]=alt; prev[to]=u; }
      }
    }

    const path=[];
    let cur=goal;
    while (cur!==null) { path.unshift(cur); cur=prev[cur]; }
    return (path[0]===start)? path : [];
  }

  // --------------------------------------------------
  // 4) Snap to nearest edge
  // --------------------------------------------------
  function nearestPointOnEdge(lat, lng, edges) {
    const pt = turf.point([lng,lat]);
    let best=null;
    edges.forEach(e=>{
      const line=turf.lineString(e.coords.map(([lt,lg])=>[lg,lt]));
      const snap=turf.nearestPointOnLine(line, pt, {units:'meters'});
      if (!best||snap.properties.dist<best.snap.properties.dist) {
        best={edge:e,line,snap};
      }
    });

    const startPt=turf.point([nodes[best.edge.from].lng,nodes[best.edge.from].lat]);
    const endPt=turf.point([nodes[best.edge.to].lng,nodes[best.edge.to].lat]);
    const snapPt=best.snap;

    const slice1=turf.lineSlice(startPt,snapPt,best.line);
    const slice2=turf.lineSlice(snapPt,endPt,best.line);
    const d1=turf.length(slice1,{units:'meters'});
    const d2=turf.length(slice2,{units:'meters'});

    return {
      edge:best.edge,
      line:best.line,
      snapLatLng:[snapPt.geometry.coordinates[1],snapPt.geometry.coordinates[0]],
      distToStartM:d1,
      distToEndM:d2
    };
  }

  // --------------------------------------------------
  // 5) Route with a virtual node
  // --------------------------------------------------
  function routeFromArbitraryPoint(userLatLng, destNode) {
    const snap=nearestPointOnEdge(userLatLng[0],userLatLng[1],edges);
    const {edge,line,snapLatLng,distToStartM,distToEndM}=snap;

    const vId=nodes.length; // next index
    const tmpNodes=nodes.concat([{lat:snapLatLng[0],lng:snapLatLng[1]}]);

    const tmpEdges=edges.slice();
    tmpEdges.push({from:vId,to:edge.from,coords:[],lengthM:distToStartM});
    tmpEdges.push({from:vId,to:edge.to,  coords:[],lengthM:distToEndM});

    const adj=buildAdjacency(tmpNodes,tmpEdges);
    const path=dijkstra(adj,vId,destNode);
    if(!path.length) return null;

    const coordsOut=[];
    function appendCoords(latlngs){
      if(coordsOut.length===0){
        coordsOut.push(...latlngs);
      } else {
        const last=coordsOut[coordsOut.length-1];
        const first=latlngs[0];
        if(last[0]===first[0]&&last[1]===first[1]){
          coordsOut.push(...latlngs.slice(1));
        } else coordsOut.push(...latlngs);
      }
    }

    const nextNode=path[1];
    const snapPt=turf.point([snapLatLng[1],snapLatLng[0]]);
    const sNodePt=turf.point([nodes[edge.from].lng,nodes[edge.from].lat]);
    const eNodePt=turf.point([nodes[edge.to].lng,  nodes[edge.to].lat]);
    let firstSlice=(nextNode===edge.from)?
      turf.lineSlice(snapPt,sNodePt,line):
      turf.lineSlice(snapPt,eNodePt,line);
    appendCoords(firstSlice.geometry.coordinates.map(([lng,lat])=>[lat,lng]));

    for(let i=1;i<path.length-1;i++){
      const u=path[i],v=path[i+1];
      const e=edges.find(E=>(E.from===u&&E.to===v)||(E.from===v&&E.to===u));
      if(!e) continue;
      const poly=(e.from===u&&e.to===v)?e.coords:e.coords.slice().reverse();
      appendCoords(poly);
    }

    return {path, snappedAt:snapLatLng, routeCoords:coordsOut};
  }

//   const result=routeFromArbitraryPoint(userLatLng,dest);

  module.exports =  routeFromArbitraryPoint;