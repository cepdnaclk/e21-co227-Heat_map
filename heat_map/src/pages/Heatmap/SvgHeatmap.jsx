// SvgHeatmap.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";

const SVG_URL = "/campus.svg";
// If you use a Vite proxy, set API_URL = "/heatmap/map-data"
const API_URL = import.meta.env.VITE_HEATMAP_API_URL ? `${import.meta.env.VITE_HEATMAP_API_URL}/heatmap/map-data` : "http://localhost:3897/heatmap/map-data";

/* ---------- Map gutter (OSM) bbox ---------- */
const BBOX_W = 80.5903, BBOX_S = 7.2519, BBOX_E = 80.5939, BBOX_N = 7.2560;
const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX_W},${BBOX_S},${BBOX_E},${BBOX_N}&layer=mapnik`;

/* ------------- Look & feel ------------- */
const FILL_OPACITY = 0.40;
const STROKE_WIDTH = 1.5;
const MAP_SCALE = 1;

/* === Label tuning === */
const LABEL_MIN = 9;          // px
const LABEL_MAX = 24;         // px
const LABEL_FRACTION = 0.095; // ~10% of bbox width

/* ---------- Sample capacities (edit anytime) ---------- */
// const CAPACITY = {
//   B1:120, B2:100, B3:60,  B4:120, B5:120, B6:150, B7:50,  B8:80,  B9:200,
//   B10:40, B11:80, B12:60, B13:40, B14:80, B15:100, B16:60, B17:90, B18:120,
//   B19:70, B20:90, B21:120, B22:70, B23:90, B24:150, B25:60, B26:120, B27:160,
//   B28:100, B29:100, B30:100, B31:80, B32:60, B33:120, B34:120
// };

const EXHIBITION_BUILDING_NAMES = {
  B1: [],
  B2: [],
  B3: [],
  B4: [],
  B5: [],
  B6: ["Modern Infrastructure Advancements","Ancient Engineering to Modern Engineering"],
  B7: [],
  B8: [],
  B9: [],
  B10: [],
  B11: ["Innovating a Greener Tomorrow"],
  B12: ["Dream Zone"], // Lecture Room 2/3
  B13: ["Industry and VR Zone","Smart City by PeraCom"], // Drawing Office 2
  B14: ["Innovating a Greener Tomorrow"],
  B15: ["Creovate DMIE"],
  B16: [],
  B17: [],
  B18: [],
  B19: [],
  B20: [],
  B21: [],
  B22: ["Environment and Engineering"],
  B23: ["Applied Mechanics & Cyber Physical Systems"],
  B24: ["Renewable Energy and Sustainability"],
  B25: [],
  B26: [],
  B27: [],
  B28: ["Structures and Materials"," Chemical Engineering Pilot Plant:"],
  B29: ["Applied Thermodynamics,","Automobiles and Aeronautical Zone"],
  B30: ["The Flow Space"],
  B31: ["Smart Mobility Hub", "GeoFrontiers Hub"],
  B32: ["EngMath Nexus"],
  B33: ["EngMath Nexus","School Innovation Hub & Computer Museum"],
  B34: ["Spark Street DEEE"],
};

/* ---------- Building display names ---------- */
const BUILDING_NAMES = {
  B1:"Engineering Carpentry Shop",
  B2:"Engineering Workshop",
  B3:"",
  B4:"Generator Room",
  B5:"",
  B6:"Structure Lab",
  B7:"Administrative Building",
  B8:"Canteen",
  B9:"Lecture Room 10/11",
  B10:"Engineering Library",
  B11:"Department of Chemical and process Engineering",
  B12:"Lecture Room 2/3",
  B13:"Drawing Office 2 and Faculty Common Room",
  B14:"Faculty Canteen",
  B15:"Department of Manufacturing and Industrial Engineering",
  B16:"Professor E.O.E. Perera Theater",
  B17:"Electronic Lab",
  B18:"Washrooms",
  B19:"Electrical and Electronic Workshop",
  B20:"Department of Computer Engineering",
  B21:"",
  B22:"Environmental Lab",
  B23:"Applied Mechanics Lab",
  B24:"New Mechanics Lab",
  B25:"",
  B26:"",
  B27:"",
  B28:"Materials Lab",
  B29:"Thermodynamics Lab",
  B30:"Fluids Lab",
  B31:"Surveying and Soil Lab",
  B32:"Department of Engineering Mathematics",
  B33:"Drawing Office 1",
  B34:"Department of Electrical and Electronic Engineering ",
};
function ensureBuildingIcon(svg, node, id, iconPath) {
  let bbox = node.getBBox();

  // Try to find existing icon <image>
  let icon = svg.querySelector(`.canteen-icon[data-for='${id}']`);
  if (!icon) {
    icon = document.createElementNS("http://www.w3.org/2000/svg", "image");
    icon.setAttribute("class", "canteen-icon");
    icon.setAttribute("data-for", id);
    icon.setAttribute("width", "20");
    icon.setAttribute("height", "20");
    svg.appendChild(icon);
  }

  // Always update icon href so caller can change dynamically
  icon.setAttribute("href", iconPath);

  // Position icon at center of the building rectangle
  icon.setAttribute("x", bbox.x + bbox.width / 2 - 10);
  icon.setAttribute("y", bbox.y + bbox.height / 2 - 10);
}


export default function SvgHeatmap() {
  const hostRef = useRef(null);
  const svgRef  = useRef(null);

  const [err, setErr] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [sort, setSort] = useState("most"); //sort

  // Live data from API
  const [buildingInfo, setBuildingInfo] = useState({});
  const [buildingColors, setBuildingColors] = useState({});

  // Refs for event handlers
  const infoRef   = useRef(buildingInfo);
  const colorsRef = useRef(buildingColors);
  useEffect(() => { infoRef.current = buildingInfo; }, [buildingInfo]);
  useEffect(() => { colorsRef.current = buildingColors; }, [buildingColors]);

  const [popup, setPopup] = useState(null);

  /* -------- Derived lists -------- */
  const list = useMemo(() => {
    return Object.entries(buildingInfo).map(([id, info]) => {
      const status = statusFor(info);
      const color  = buildingColors[id] || colorForStatus(status);
      return {
        id,
        name: info?.name || id,
        current: info?.current ?? null,
        capacity: info?.capacity ?? null,
        occ: occPct(info),
        status,
        color
      };
    }).sort((a, b) => {
      // Extract numeric part of B1, B2, B10, etc.
      const numA = parseInt(a.id.replace(/^B0*/, ""), 10);
      const numB = parseInt(b.id.replace(/^B0*/, ""), 10);
      return numA - numB;
    });
  }, [buildingInfo, buildingColors]);

  /*const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(b =>
      b.id.toLowerCase().includes(q) || (b.name || "").toLowerCase().includes(q) || (EXHIBITION_BUILDING_NAMES[b.id] || []).some(n => n.toLowerCase().includes(q))
    );
  }, [list, search]);
  */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = list;
    
    // Apply search filter
    if (q) {
      result = result.filter(b =>
        b.id.toLowerCase().includes(q) || 
        (b.name || "").toLowerCase().includes(q) || 
        (EXHIBITION_BUILDING_NAMES[b.id] || []).some(n => n.toLowerCase().includes(q))
      );
    }
    
    // Apply sorting
    switch (sort) {
      case "most":
        result.sort((a, b) => (b.occ || 0) - (a.occ || 0));
        break;
      case "least":
        result.sort((a, b) => (a.occ || 0) - (b.occ || 0));
        break;
      case "az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep original order
        break;
    }
    
    return result;
  }, [list, search, sort]); // ADD 'sort' TO DEPENDENCIES

  const totals = useMemo(() => {
    const totalPeople = list.reduce((s, b) => s + (b.current || 0), 0);
    const byStatus = { Low: 0, Moderate: 0, Busy: 0, High: 0, Critical: 0, Unknown: 0 };
    list.forEach(b => { if (byStatus[b.status] != null) byStatus[b.status]++; else byStatus.Unknown++; });
    return { totalPeople, byStatus };
  }, [list]);

  /* ---------------- SVG bootstrapping ---------------- */
  const [svgReady, setSvgReady] = useState(false); // for initial zoom apply
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(SVG_URL);
        const text = await res.text();
        if (cancelled) return;

        if (!hostRef.current) return;
        hostRef.current.innerHTML = text;

        const svg = hostRef.current.querySelector("svg");
        if (!svg) throw new Error("No <svg> root found in campus.svg");

        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.display = "block";
        
        ensureViewBoxFitsContent(svg);
        expandUses(svg);
        annotateCanonicalBuildingIds(svg);

        svgRef.current = svg;

        // Initial zoom apply (so current scale is visible immediately)
        svg.style.transformOrigin = "center center";
        svg.style.transform = `scale(${MAP_SCALE})`;

        setSvgReady(true);

        const closeOnInside = (e) => {
          if (!hostRef.current) return;
          if (!hostRef.current.contains(e.target)) return;
          const isBuilding = e.target.closest("[data-building-id]");
          if (!isBuilding) setPopup(null);
        };
        hostRef.current.addEventListener("click", closeOnInside);
        return () => hostRef.current?.removeEventListener("click", closeOnInside);
      } catch (e) {
        setErr(`Failed to load SVG: ${e.message}`);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---------------- Live fetcher (AXIOS) ---------------- */
  function normalizeLivePayload(raw) {
    const arr = Array.isArray(raw?.data) ? raw.data : [];
    const out = {};

    for (const item of arr) {
      const id = item?.id || item?.building_id;
      if (!id) continue;

      const current =
        (typeof item?.count === "number") ? item.count :
        (typeof item?.current_crowd === "number") ? item.current_crowd : null;

      out[id] = {
        capacity:item?.capacity || item?.building_capacity || CAPACITY[id] || null,
        name: item?.building_name || item?.name || id,
        current,
        color: item?.color || null,
        updatedAt: item?.status_timestamp ? new Date(item.status_timestamp) : new Date()
      };
    }
    return out;
  }

  async function fetchLive({ silent=false } = {}) {
    try {
      const { data } = await axios.get(API_URL);
      const payload = normalizeLivePayload(data);

      setBuildingInfo(prev => {
        const next = { ...prev };
        for (const [id, v] of Object.entries(payload)) {
          next[id] = {
            ...(next[id] || {}),
            name: BUILDING_NAMES[id] ?? v.name ?? next[id]?.name ?? id,
            current: v.current,
            capacity: v.capacity??CAPACITY[id] ?? next[id]?.capacity ?? null,
            updatedAt: v.updatedAt ?? next[id]?.updatedAt ?? null
          };
        }
        return next;
      });

      setBuildingColors(prev => {
        const next = { ...prev };
        for (const [id, v] of Object.entries(payload)) {
          if (v.color) next[id] = v.color;
        }
        return next;
      });

      const newest = (Array.isArray(data?.data) ? data.data : [])
        .map(x => new Date(x?.status_timestamp || Date.now()))
        .filter(d => !isNaN(d))
        .sort((a,b) => b - a)[0];
      setLastUpdated(newest || new Date());
      setErr("");
    } catch (e) {
      if (!silent) setErr(`Live data fetch failed: ${e.message}`);
      console.error(e);
    }
  }

  useEffect(() => {
    const t = setInterval(fetchLive, 15000);
    fetchLive();
    return () => clearInterval(t);
  }, []);

  /* ---------------- Repaint on data change ---------------- */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ids = new Set([...Object.keys(buildingInfo), ...Object.keys(buildingColors)]);
    ids.forEach((id) => {
      const info  = buildingInfo[id];
      const color = buildingColors[id] || colorForStatus(statusFor(info));
      const nodes = findNodesForId(svg, id);
      nodes.forEach((node) => {
        if (!node.dataset.hmBound) {
          attachInteractions(node, id);
          node.dataset.hmBound = "1";
        }
        paintNodeDeep(node, color);

        // === ensure/update the centered ID label at the SVG root layer ===
        ensureIdLabel(svg, node, id);
      });
    });
  }, [buildingInfo, buildingColors]);

  /* ================== SMART POPUP PLACEMENT ================== */
  function smartPopupPosition(node, hostEl, popupW = 280, popupH = 170, pad = 12){
    const hb = hostEl.getBoundingClientRect();
    const nb = node.getBoundingClientRect();

    const hostW = hb.width, hostH = hb.height;

    // Building box relative to host
    const bx1 = nb.left - hb.left;
    const by1 = nb.top  - hb.top;
    const bx2 = nb.right - hb.left;
    const by2 = nb.bottom - hb.top;

    // Try: right → left → above → below
    const candidates = [
      { left: bx2 + pad,            top: by1,                 where: "right"  },
      { left: bx1 - popupW - pad,   top: by1,                 where: "left"   },
      { left: bx1,                  top: by1 - popupH - pad,  where: "top"    },
      { left: bx1,                  top: by2 + pad,           where: "bottom" },
    ];

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    for (const c of candidates){
      const l = clamp(c.left, pad, hostW - popupW - pad);
      const t = clamp(c.top,  pad, hostH - popupH - pad);
      const visibleW = Math.min(hostW - l, popupW + pad);
      const visibleH = Math.min(hostH - t, popupH + pad);
      if (visibleW >= popupW * 0.8 && visibleH >= popupH * 0.8){
        return { left: l, top: t, where: c.where };
      }
    }

    // Fallback: clamp near building corner
    return { left: clamp(bx1, pad, hostW - popupW - pad), top: clamp(by1, pad, hostH - popupH - pad), where: "fallback" };
  }

  /* ---------------- Interactions ---------------- */
  function attachInteractions(node, id) {
    node.style.cursor = "pointer";
    node.classList.add("hm-building");

    node.addEventListener("mouseenter", () => nodeSetEmphasis(node, true));
    node.addEventListener("mouseleave", () => nodeSetEmphasis(node, false));
    node.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const infoNow  = infoRef.current?.[id];
      const status   = statusFor(infoNow);
      const colorNow = colorsRef.current?.[id] || colorForStatus(status);
      const occ      = infoNow ? occPct(infoNow) : null;

      const pos = smartPopupPosition(node, hostRef.current);

      setSelectedId(id);
      setPopup({
        id,
        name: infoNow?.name || id,
        altName: EXHIBITION_BUILDING_NAMES[id] || "",
        current: infoNow?.current ?? null,
        capacity: infoNow?.capacity ?? null,
        occ,
        status,
        color: colorNow,
        left: pos.left,
        top:  pos.top,
        where: pos.where,
      });
    });
  }

  function focusBuilding(b) {
    const svg = svgRef.current;
    if (!svg) return;
    const nodes = findNodesForId(svg, b.id);
    const node = nodes[0];
    if (!node) return;

    const pos = smartPopupPosition(node, hostRef.current);

    setSelectedId(b.id);
    setPopup({
      altName: EXHIBITION_BUILDING_NAMES[b.id] || "",
      id: b.id, name: b.name, current: b.current, capacity: b.capacity,
      occ: b.occ, status: b.status, color: b.color,
      left: pos.left, top: pos.top, where: pos.where
    });
  }

  /* ================== MAP ZOOM ================== */
  const [zoom, setZoom] = useState(MAP_SCALE);

  // Keep SVG scale in sync with state
  useEffect(() => {
    if (!svgReady) return;
    const svg = svgRef.current;
    if (!svg) return;
    svg.style.transformOrigin = "center center";
    svg.style.transform = `scale(${zoom})`;
    svg.style.willChange = "transform";
  }, [zoom, svgReady]);

  const Z_MIN = 0.5, Z_MAX = 3, Z_STEP = 0.15;
  const clampZoom = (v,min,max) => Math.max(min, Math.min(max, v));
  function zoomIn(){ setZoom(z => clampZoom(+(z + Z_STEP).toFixed(2), Z_MIN, Z_MAX)); }
  function zoomOut(){ setZoom(z => clampZoom(+(z - Z_STEP).toFixed(2), Z_MIN, Z_MAX)); }
  function zoomReset(){ setZoom(MAP_SCALE); }

  function onWheel(e){
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    const step = Z_STEP / 1.5;
    setZoom(z => clampZoom(+(z * (1 + dir*step)).toFixed(3), Z_MIN, Z_MAX));
  }
  /* ============================================== */

  return (
    <div className="page">
      <main className="stage">
        <div className="center">
          <div
            ref={hostRef}
            className="svg-host"
            onWheel={onWheel}  // wheel zoom
          />
          {/* Zoom controls */}
          <div className="zoom-controls">
            <button onClick={zoomOut} aria-label="Zoom out">−</button>
            <div className="zoom-indicator">{Math.round(zoom*100)}%</div>
            <button onClick={zoomIn} aria-label="Zoom in">+</button>
            <button onClick={zoomReset} className="reset" aria-label="Reset zoom">Reset</button>
          </div>

          <div className="legend-pill">
            <span className="chip" style={{ "--c": "#22c55e" }}>Low 0%-50%</span>
            <span className="chip" style={{ "--c": "#ffbf00ff" }}>Moderate 50%-80%</span>
            <span className="chip" style={{ "--c": "#f97316" }}>Busy 80%-90%</span>
            <span className="chip" style={{ "--c": "#ff0000ff" }}>High {'>='}90%</span>
          </div>

          {popup && (
            <div
              className={`popup glass where-${popup.where || 'auto'}`}
              style={{
                left: popup.left,
                top:  popup.top,
                '--accent': popup.color,
                '--p': `${popup.occ ?? 0}%`
              }}
              role="dialog"
              aria-modal="false"
            >
              <div className="popup-arrow" />
              <div className="popup-hd">
              <div className="pill">{popup.id}</div>
              <div className="name-block">
                <div className="bname" title={popup.name}>{popup.name}</div>
                {Array.isArray(popup.altName) &&
      popup.altName
        .filter(name => name && name.trim() !== "")
        .map((name, idx) => (
          <div key={idx} className="alt" title={name}>
            {name}
          </div>
          
        ))}
              </div>
              <button className="close" onClick={() => setPopup(null)} aria-label="Close">×</button>
            </div>
              <div className="popup-body">
                <Row label="Current visitors" value={numOrDash(popup.current)} />
                <Row label="Capacity"         value={numOrDash(popup.capacity)} />
                <Row label="Occupancy"        value={popup.occ != null ? `${popup.occ}%` : "—"} />
                <Row label="Status"           value={<b style={{ color: 'var(--accent)' }}>{popup.status}</b>} />
                {popup.occ != null && (
                  <div className="meter" aria-label="Occupancy meter">
                    <div className="fill" style={{ width: `var(--p)` }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {err && <div className="banner error">{err}</div>}
        </div>

        <aside className="sidepanel">
          <div className="panel card">
            <div className="panel-title">Summary</div>
            <div className="stats">
              <div className="stat"><div className="stat-value">{totals.totalPeople}</div><div className="stat-label">People total</div></div>
              <div className="stat small"><span className="dot green" /> {totals.byStatus.Low} Low</div>
              <div className="stat small"><span className="dot yellow" /> {totals.byStatus.Moderate} Moderate</div>
              <div className="stat small"><span className="dot orange" /> {totals.byStatus.Busy} Busy</div>
              <div className="stat small"><span className="dot red" /> {totals.byStatus.High} High</div>
            </div>
          </div>
          

          <div className="panel card">
            <input className="search" placeholder="Search buildings…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          
          {/*sorting buildings*/}
          <div className="panel card">
            <div className="sort-container">
              <label className="sort-label">Sort by:</label>
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="most">Most Crowded</option>
                <option value="least">Least Crowded</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>
          </div>


          <div className="panel card list">
            <div className="panel-title">Buildings</div>
            <div className="items">
              {filtered.map(b => {
                const active = b.id === selectedId;
                return (
                  <div key={b.id} className={`item ${active ? "active" : ""}`} onClick={() => focusBuilding(b)}>
                    <div className="item-row">
                      <div className="idpill">{b.id}</div>
                      <div className="name">{b.name}</div>
                      <div className="chip" style={{ background: b.color }}>{b.status}</div>
                    </div>
                    {(EXHIBITION_BUILDING_NAMES[b.id] || []).length > 0 && (
                      <div className="item-exhibitions">
                        {(EXHIBITION_BUILDING_NAMES[b.id] || []).map((exh, idx) => (
                          <div key={idx} className="exhibition-name">{exh}</div>
                        ))}
                      </div>
                    )}
                    <div className="item-row">
                      <div className="count"><span className="count-num">{b.current ?? "—"}</span> people</div>
                      {b.occ != null && <div className="muted small">{b.occ}% occupancy</div>}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <div className="empty">No buildings match your search.</div>}
            </div>
          </div>
        </aside>
      </main>

      <style>{`
        :root{ color-scheme: light; }
        *{scrollbar-color: #cbd5e1 #f8fafc;}
        *::-webkit-scrollbar{ width: 10px; height: 10px; }
        *::-webkit-scrollbar-track{ background: #f8fafc; }
        *::-webkit-scrollbar-thumb{ background: #cbd5e1; border-radius: 8px; border: 2px solid #f8fafc;}
        :root{ --bg:#f6f7fb; --card:#fff; --muted:#6b7280; --border:#e5e7eb; --shadow:0 16px 40px rgba(2,8,23,.10); }
        .page { 
          width: 100%; 
          min-height: 800px; 
          height: 80vh;
          max-height: 1000px;
          font:14px/1.4 system-ui,-apple-system,sans-serif; 
          background:var(--bg); 
          color:#111;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }
        .brand{ display:flex; align-items:center; gap:12px; } .brand img{ width:50px; height:50px; object-fit:contain; }
        .title{ font-weight:700; letter-spacing:.2px; margin-right:1400px; font-size:24px; }
        .actions{ display:flex; align-items:center; gap:10px; } .muted{ color:var(--muted) } .small{ font-size:12px; }
        .btn{ appearance:none; border:1px solid var(--border); background:#111; color:#fff; border-radius:10px; padding:8px 12px; cursor:pointer; font-weight:600; }
        .stage{ 
          display:grid; 
          grid-template-columns: 1fr 320px; 
          align-items:stretch; 
          gap:20px; 
          height: 100%; 
          padding:20px; 
        }
        .center{ position:relative; }
        .sidepanel{ display:flex; flex-direction:column; gap:12px; }
        .svg-host{ width:100%; height:100%; border-radius:12px; overflow:hidden; background:#fff; box-shadow:var(--shadow); border:1px solid var(--border); display:grid; place-items:center; }
        .svg-host svg{ width:100%; height:100%; display:block; transform-origin:center center; transform:scale(${MAP_SCALE}); }

        .legend-pill{ position:absolute; left:12px; bottom:12px; display:flex; gap:8px; background:#fff; border:1px solid var(--border); border-radius:999px; padding:6px 10px; box-shadow:var(--shadow); }
        .chip{ display:inline-flex; align-items:center; justify-content: center; gap:8px; min-width: 60px; font-size:12px; font-weight: 700; color:#111; padding:4px 10px; border-radius:999px; background:#f8fafc; border:1px solid var(--border);}
        .chip::before{ content:""; width:10px; height:10px; border-radius:50%; background: var(--c); box-shadow:0 0 0 3px color-mix(in srgb, var(--c), transparent 70%); }

        /* (legacy popup base kept for compatibility) */
        .popup{ position:absolute; width:320px; background:#fff; color:#111; border:2px solid; border-radius:12px; box-shadow:var(--shadow); animation:pop .14s ease-out; }
        .popup-arrow{ position:absolute; top:-10px; left:28px; width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:10px solid; filter: drop-shadow(0 -2px 4px rgba(0,0,0,.08)); }
        .popup-hd{ display:block; align-items:center; gap:10px; padding:10px 12px; border-bottom:2px solid; background:#fafafa; border-top-left-radius:10px; border-top-right-radius:10px; }
        .pill{ color:#fff; font-weight:800; padding:2px 8px; border-radius:999px; font-size:12px; }
        .bname{ font-weight:800; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .aname{ font-weight:800; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:12px; color:#374151; }
        .bname .alt {
          font-size: 0.9em;   /* smaller text for altName */
          color: #666;        /* lighter color to differentiate */
        }
        .col {
          display: flex;
          flex-direction: column; /* stack vertically */
          line-height: 1.2;       /* tighten spacing if needed */
        }
        .popup-hd {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          max-width: 100%; /* keeps content constrained */
        }

        .name-block {
          display: flex;
          flex-direction: column;
          min-width: 0;  /* required for ellipsis inside flexbox */
          flex: 1;       /* take remaining space */
        }

        .name-block .bname {
          white-space: nowrap;        /* no wrapping */
          overflow: hidden;           /* hide overflow text */
          text-overflow: ellipsis;    /* add ... */
          font-weight: 600;
        }

        .name-block .alt {
          font-size: 0.9em;
          color: #666;
          white-space: nowrap;        /* optional: prevent wrap */
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .close{ appearance:none; border:none; background:transparent; font-size:18px; line-height:1; cursor:pointer; color:#111; padding:0 4px; }
        .popup-body{ padding:10px 12px; display:grid; gap:8px; }
        .row{ display:flex; justify-content:space-between; font-size:14px; }
        .exhibition-name {
          font-size: 12px;
          color: #787878ff;
          margin-top: 2px;
        }
        .panel.card{ background:var(--card); border:1px solid var(--border); border-radius:12px; box-shadow:var(--shadow); padding:12px; }
        .panel .panel-title{ font-weight:700; margin-bottom:8px; }
        .stats{ display:grid; gap:8px; }
        .stat{ display:flex; align-items:baseline; gap:10px; } .stat .stat-value{ font-size:22px; font-weight:800; margin-top: -6px; }
        .stat.small{ color:#374151; font-size:12px; display:flex; align-items:center; gap:6px; }
        .dot{ width:10px; height:10px; border-radius:50%; display:inline-block; }
        .dot.green{background:#22c55e;} .dot.yellow{background:#eab308;} .dot.orange{background:#f97316;}
        .dot.red{background:#ef4444;} .dot.darkred{background:#991b1b;}
        .search{ width:90%; padding:10px 10px; border-radius:10px; border:1px solid var(--border); outline:none; background: #fff; color: #0f1072a; }
        .list .items{ display:flex; flex-direction:column; gap:8px; }
        .item{ border:1px solid var(--border); border-radius:10px; padding:10px 10px; display:flex; flex-direction:column; gap:6px; background:#fff; cursor:pointer; transition:transform .06s ease; }
        .item:hover{ transform:translateY(-1px); } .item.active{ outline:1px solid #111; }
        .item-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .idpill{ background:#111; color:#fff; padding:2px 10px; border-radius:999px; font-weight:700; font-size:12px; }
        .name{ font-weight:700; } .count{ color:#374151; font-size:13px; } .count-num{ font-weight:800; }
        .banner.error{ position:absolute; top:12px; left:12px; background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:8px 12px; border-radius:10px; box-shadow:var(--shadow); }

        /* === SVG building labels === */
        .b-label{
          pointer-events: none;
          font-family: ui-sans-serif, system-ui, Montserrat, sans-serif;
          font-weight: 500;
          letter-spacing: .3px;
          text-anchor: middle;
          dominant-baseline: middle;
          text-transform: uppercase;
          fill: #443e3eff;
          opacity: .95;
          user-select: none;
        }

        @media (max-width:1100px){ .stage{ grid-template-columns: 1fr 300px; gap:15px; } }
        @media (max-width:780px){ .stage{ grid-template-columns:1fr; } .sidepanel{margin-top: -8px; order:2; } }
        .center{ min-height:0; }
        .sidepanel{ display:flex; flex-direction:column; gap:6px; min-height:0; margin-bottom:15px; }
        .panel.card.list{flex:1 1 auto; display:flex; flex-direction:column; min-height:0; }
        .panel.card.list .items{ overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch;  }
        .panel.card.list .panel-title{ position:sticky; top:0; background:#fff; z-index:1; padding-bottom:8px; }
        .list .items{ padding-top: 12px; scrollbar-gutter: stable both-edges; padding-right: 12px; box-sizing: border-box;}
        
        /* === Zoom controls === */
        .zoom-controls{
          position:absolute;
          right:12px;
          bottom:12px;
          display:flex;
          align-items:center;
          gap:6px;
          background:#fff;
          border:1px solid var(--border);
          border-radius:10px;
          box-shadow:var(--shadow);
          padding:6px;
          z-index:5;
        }
        .zoom-controls button{
          appearance:none;
          border:1px solid var(--border);
          background:#111;
          color:#fff;
          border-radius:8px;
          padding:6px 10px;
          font-weight:700;
          cursor:pointer;
        }
        .zoom-controls .reset{
          background:#fff;
          color:#111;
        }
        .zoom-controls .zoom-indicator{
          min-width:44px;
          text-align:center;
          font-weight:700;
          color:#111;
        }

        /* ===== Modern transparent popup (scoped) ===== */
        .popup.glass{
          position:absolute;
          width: 280px;            /* compact */
          max-width: 70vw;
          background: rgba(255,255,255,.55);
          border: 1px solid rgba(255,255,255,.65);
          border-radius: 14px;
          box-shadow:
            0 12px 28px rgba(2,8,23,.18),
            0 0 0 1px color-mix(in srgb, var(--accent, #94a3b8), transparent 80%);
          backdrop-filter: blur(10px) saturate(1.1);
          -webkit-backdrop-filter: blur(10px) saturate(1.1);
          color: #0f172a;
          animation: pop .14s ease-out;
          overflow: hidden;
          border-width: 0; /* neutralize legacy 2px border */
        }
        .popup.glass .popup-hd{
          display:flex; align-items:center; gap:10px;
          padding: 10px 12px;
          border-bottom: 1px solid color-mix(in srgb, var(--accent, #94a3b8), #ffffff 80%);
          background: linear-gradient(
            to bottom,
            color-mix(in srgb, var(--accent, #94a3b8), transparent 90%),
            transparent 60%
          );
        }
        .popup.glass .pill{
          color:#0b1020;
          background: color-mix(in srgb, var(--accent, #94a3b8), #ffffff 30%);
          border: 1px solid color-mix(in srgb, var(--accent, #94a3b8), #ffffff 65%);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent, #94a3b8), transparent 70%);
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
        }
        .popup.glass .bname{
          font-weight: 800;
          flex:1;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .popup.glass .close{
          appearance:none; border:none; background:transparent;
          font-size: 18px; line-height:1; cursor:pointer; color:#0f172a; padding:0 4px;
          opacity:.8;
        }
        .popup.glass .close:hover{ opacity:1; }
        .popup.glass .popup-body{
          padding: 10px 12px;
          display:grid; gap:8px;
        }
        .popup.glass .row{
          display:flex; justify-content:space-between; align-items:center;
          font-size: 13.5px;
          color:#111827;
        }
        .popup.glass .meter{
          height: 6px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent, #94a3b8), transparent 85%);
          border: 1px solid color-mix(in srgb, var(--accent, #94a3b8), transparent 60%);
          overflow:hidden;
          margin-top: 4px;
        }
        .popup.glass .meter .fill{
          height:100%;
          background: var(--accent, #94a3b8);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent, #94a3b8), transparent 70%) inset;
          transition: width .18s ease;
        }

        /* Default legacy arrow (will be overridden by where-* rules below) */
        .popup-arrow{
          position:absolute;
          top:-10px; left:28px;
          width:0; height:0;
          border-left:10px solid transparent;
          border-right:10px solid transparent;
          border-top:10px solid rgba(255,255,255,.55);
          filter: drop-shadow(0 -2px 4px rgba(0,0,0,.08));
        }

        /* Reposition arrow depending on placement */
        .popup.glass.where-top .popup-arrow{
          bottom:-8px; left:24px;
          border-left:8px solid transparent; border-right:8px solid transparent;
          border-top:8px solid rgba(255,255,255,.55);
          border-bottom:0; border-right-width:8px; border-left-width:8px;
          top:auto;
        }
        .popup.glass.where-bottom .popup-arrow{
          top:-8px; left:24px;
          border-left:8px solid transparent; border-right:8px solid transparent;
          border-bottom:8px solid rgba(255,255,255,.55);
          border-top:0;
          bottom:auto;
        }
        .popup.glass.where-right .popup-arrow{
          left:-8px; top:12px;
          border-top:8px solid transparent; border-bottom:8px solid transparent;
          border-right:8px solid rgba(255,255,255,.55);
          border-left:0;
        }
        .popup.glass.where-left .popup-arrow{
          right:-8px; top:12px;
          border-top:8px solid transparent; border-bottom:8px solid transparent;
          border-left:8px solid rgba(255,255,255,.55);
          border-right:0; left:auto;
        }

        /* Motion */
        @keyframes pop{ from{ transform: translateY(4px); opacity:0 } to{ transform: none; opacity:1 } }
        @media (prefers-reduced-transparency: reduce){
          .popup.glass{ background:#ffffff; backdrop-filter:none; -webkit-backdrop-filter:none; }
          .popup.glass .popup-arrow{ border-bottom-color:#ffffff; }
        }
        
        /* === Sorting UI === */
        .sort-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .sort-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
        }

        .sort-select {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: #fff;
          font-size: 13px;
          color: #111;
          cursor: pointer;
        }

      `}</style>
    </div>
  );
}

/* ---------------- UI bits ---------------- */
function Row({ label, value }) {
  return <div className="row"><span>{label}</span><div>{value}</div></div>;
}
function numOrDash(n){ return (n || n === 0) ? n : "—"; }

/* --------------- SVG helpers --------------- */
function expandUses(svg) {
  const ns = "http://www.w3.org/2000/svg";
  const uses = Array.from(svg.querySelectorAll("use"));
  uses.forEach((useEl) => {
    const href = useEl.getAttribute("href") || useEl.getAttribute("xlink:href");
    if (!href || !href.startsWith("#")) return;
    const refId = href.slice(1);
    const refEl = svg.getElementById(refId);
    if (!refEl) return;

    const g = document.createElementNS(ns, "g");
    g.setAttribute("data-building-id", refId);

    const x = parseFloat(useEl.getAttribute("x") || "0");
    const y = parseFloat(useEl.getAttribute("y") || "0");
    const t = useEl.getAttribute("transform") || "";
    const translate = (x || y) ? `translate(${x},${y})` : "";
    const combined = [translate, t].filter(Boolean).join(" ");
    if (combined) g.setAttribute("transform", combined);

    const style = useEl.getAttribute("style"); if (style) g.setAttribute("style", style);
    const cls = useEl.getAttribute("class");  if (cls) g.setAttribute("class", cls);

    if (refEl.tagName.toLowerCase() === "symbol") {
      Array.from(refEl.childNodes).forEach(n => g.appendChild(n.cloneNode(true)));
    } else {
      g.appendChild(refEl.cloneNode(true));
    }
    useEl.parentNode.replaceChild(g, useEl);
  });
}

function ensureViewBoxFitsContent(svg) {
  if (svg.hasAttribute("viewBox")) return;
  const shapes = Array.from(svg.querySelectorAll("path,polygon,rect,circle,ellipse,polyline,line"));
  if (shapes.length === 0) return;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  shapes.forEach((el) => {
    try {
      const b = el.getBBox();
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
    } catch {}
  });
  const pad = 8;
  svg.setAttribute("viewBox", `${x1 - pad} ${y1 - pad} ${(x2 - x1) + 2*pad} ${(y2 - y1) + 2*pad}`);
}

function annotateCanonicalBuildingIds(svg) {
  const nodes = svg.querySelectorAll("[id]");
  nodes.forEach(el => {
    if (el.hasAttribute("data-building-id")) return;
    const canonical = canonicalFromAny(el.getAttribute("id"));
    if (canonical) el.setAttribute("data-building-id", canonical);
  });
}

function canonicalFromAny(raw) {
  if (!raw) return null;
  const s = String(raw);
  const m = s.match(/(?:^|[^a-z0-9])(b\d{1,3}[a-z]?)(?![0-9a-z])/i);
  if (!m) return null;
  const token = m[1].toUpperCase();
  const m2 = token.match(/^B0*([0-9]+)([A-Z]?)$/);
  if (!m2) return token;
  const num = m2[1].replace(/^0+/, "") || "0";
  const suf = m2[2] || "";
  return `B${num}${suf}`;
}

function findNodesForId(svg, wantId) {
  const nodes = [...svg.querySelectorAll(`[data-building-id="${cssAttr(wantId)}"]`)];
  if (nodes.length) return pruneToTopmost(nodes);
  const all = [...svg.querySelectorAll("[id]")].filter(el => canonicalFromAny(el.id) === wantId);
  return pruneToTopmost(all);
}

function pruneToTopmost(nodes) {
  const set = new Set(nodes);
  return nodes.filter(n => {
    for (let p = n.parentElement; p; p = p.parentElement) {
      if (set.has(p)) return false;
    }
    return true;
  });
}

function paintNodeDeep(node, color) {
  const targets = isShape(node)
    ? [node]
    : Array.from(node.querySelectorAll("path,polygon,rect,circle,ellipse,polyline"));

  targets.forEach(el => {
    el.style.setProperty("fill", color, "important");
    el.style.setProperty("stroke", color, "important");
    el.style.setProperty("fill-opacity", String(FILL_OPACITY), "important");
    el.style.setProperty("stroke-width", String(STROKE_WIDTH));
    el.style.setProperty("transition", "fill .15s ease, fill-opacity .15s ease, stroke-width .15s ease");
    el.removeAttribute("fill");
    el.removeAttribute("stroke");
  });
}

/* ===== Labels: root layer + helpers ===== */
function getLabelLayer(svg){
  const ns = "http://www.w3.org/2000/svg";
  let layer = svg.querySelector('g#__labels');
  if (!layer){
    layer = document.createElementNS(ns, 'g');
    layer.setAttribute('id', '__labels');
    layer.setAttribute('pointer-events', 'none');
    svg.appendChild(layer); // on top for visibility
  }
  return layer;
}

function ensureIdLabel(svg, node, id) {
  const ns = "http://www.w3.org/2000/svg";
  const layer = getLabelLayer(svg);

  let label = layer.querySelector(`text.b-label[data-label-for="${cssAttr(id)}"]`);
  if (!label){
    label = document.createElementNS(ns, 'text');
    label.classList.add('b-label');
    label.setAttribute('data-label-for', id);
    label.textContent = id;
    label.setAttribute('pointer-events', 'none');
    layer.appendChild(label);
  } else if (label.textContent !== id){
    label.textContent = id;
  }
  layoutIdLabel(node, label);
}

function layoutIdLabel(node, labelEl) {
  try {
    const b = node.getBBox(); // current user space (includes transforms)
    if (!isFinite(b.x) || !isFinite(b.y) || !isFinite(b.width) || !isFinite(b.height)) return;

    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    labelEl.setAttribute('x', String(cx));
    labelEl.setAttribute('y', String(cy));

    const fs = clamp(LABEL_MIN, Math.round(b.width * LABEL_FRACTION), LABEL_MAX);
    labelEl.setAttribute('font-size', String(fs));
  } catch { /* ignore degenerate shapes */ }
}

function nodeSetEmphasis(node, on) {
  const targets = isShape(node)
    ? [node]
    : Array.from(node.querySelectorAll("path,polygon,rect,circle,ellipse,polyline"));
  targets.forEach(el => {
    el.style.setProperty("stroke-width", on ? STROKE_WIDTH * 1.9 : STROKE_WIDTH);
    el.style.setProperty("fill-opacity", on ? 0.52 : FILL_OPACITY);
    el.style.setProperty("filter", on ? "drop-shadow(0 12px 26px rgba(0,0,0,.25))" : "drop-shadow(0 6px 16px rgba(0,0,0,.20))");
  });
}

function isShape(node) { return /^(path|polygon|rect|circle|ellipse|polyline)$/i.test(node.tagName); }
function cssAttr(s) { return String(s).replace(/"/g, '\\"'); }
function centerOfNodeInHost(node, hostEl) {
  const nb = node.getBoundingClientRect();
  const hb = hostEl.getBoundingClientRect();
  return { x: nb.left + nb.width / 2 - hb.left, y: nb.top + nb.height / 2 - hb.top };
}

/* --------- status & color logic --------- */
function occPct(info) {
  if (!info || !info.capacity || (!Number.isFinite(info.current) && info.current !== 0)) return null;
  return Math.round((info.current / info.capacity) * 100);
}
function statusFor(info) {
  const p = occPct(info);
  if (p == null) return "Unknown";
  if (p < 50) return "Low";
  if (p < 80) return "Moderate";
  if (p < 90) return "Busy";
  if (p >= 90) return "High";
  return "High";
}
function colorForStatus(status) {
  switch (status) {
    case "Low":       return "#22c55e";
    case "Moderate":  return "#eab308";
    case "Busy":      return "#f97316";
    case "High":      return "#ef4444";
    default:          return "#94a3b8";
  }
}

/* small util for clamp (labels) */
function clamp(min, v, max){ return Math.max(min, Math.min(max, v)); }
