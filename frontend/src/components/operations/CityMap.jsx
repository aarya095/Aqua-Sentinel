import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  GeoJSON,
  Polyline,
  Polygon,
  CircleMarker,
  Popup,
  Marker,
  Tooltip,
  Pane,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  MapPinned,
  AlertTriangle,
  Crosshair,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

/*
---------------------------------------------------------
AquaSentinel - Synthetic AquaCity Operations Map
---------------------------------------------------------

This map intentionally does NOT use OpenStreetMap.

The city is synthetic, so the map itself acts as the
geographic background.

Data:

  /public/data/wards.geojson
  /public/data/aquasentinel_roads_clean.json
  /public/data/facilities.json
  /public/data/aquasentinel_hotspots_clean.json
  /public/data/intersections.json

Additional visual layers:

  - Synthetic parks
  - Synthetic drainage channel
  - Synthetic building footprints

These visual layers are generated locally in this component
and do not require additional GeoJSON files.
*/


// ---------------------------------------------------------
// Helper: automatically fit the map to the city boundary
// ---------------------------------------------------------

function FitCityBounds({ wards }) {
  const map = useMap();

  useEffect(() => {
    if (!wards) return;

    const layer = L.geoJSON(wards);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [30, 30],
      });
    }
  }, [wards, map]);

  return null;
}


// ---------------------------------------------------------
// Facility icon
// ---------------------------------------------------------

function createFacilityIcon(facilityType, priority) {
  const normalizedType = facilityType?.trim().toUpperCase() || "";

  let iconColor = "#38bdf8";

  if (priority === "CRITICAL") {
    iconColor = "#fb7185";
  } else if (priority === "HIGH") {
    iconColor = "#fb923c";
  }

  const iconSvg = getFacilityIconSvg(normalizedType, iconColor);

  const html = `
    <div
      style="
        width: 30px;
        height: 30px;
        border-radius: 9px;
        background: #0f172a;
        border: 1px solid ${iconColor};
        box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      ${iconSvg}
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}


// ---------------------------------------------------------
// Active incident icon: visually distinct from hotspots
// ---------------------------------------------------------

function createIncidentIcon(severity) {
  const normalized = severity?.toUpperCase();
  const color = normalized === "CRITICAL"
    ? "#fb7185"
    : normalized === "HIGH"
      ? "#fb923c"
      : normalized === "MODERATE"
        ? "#fbbf24"
        : "#4ade80";

  return L.divIcon({
    className: "aquasentinel-incident-marker",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #450a0a;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(127, 29, 29, 0.55), 0 0 14px ${color}55;
        color: ${color};
        font-size: 19px;
        font-weight: 900;
        line-height: 1;
      ">!</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}


// ---------------------------------------------------------
// Facility SVG icons
// ---------------------------------------------------------

function getFacilityIconSvg(type, color) {
  const common = `
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="${color}"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  `;

  // Hospital / medical
  if (type === "HOSPITAL") {
    return `
      <svg ${common}>
        <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" />
      </svg>
    `;
  }

  // Fire station
  if (type === "FIRE_STATION") {
    return `
      <svg ${common}>
        <path d="M12 22c4 0 7-2.8 7-7
          0-3.8-2.2-6.2-4.8-8.8
          .2 2.4-.8 4-2.2 4.8
          .1-3.4-1.5-6-4-8
          .2 4.2-3 6.2-3 11
          0 4.8 3 8 7 8Z" />
      </svg>
    `;
  }

  // Shelter
  if (type === "SHELTER") {
    return `
      <svg ${common}>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    `;
  }

  // School
  if (type === "SCHOOL") {
    return `
      <svg ${common}>
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c3 2 9 2 12 0v-5" />
      </svg>
    `;
  }

  // Power station
  if (type === "POWER_STATION") {
    return `
      <svg ${common}>
        <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    `;
  }

  // Water treatment plant
  if (type === "WATER_PLANT") {
    return `
      <svg ${common}>
        <path d="M12 3s-6 6.2-6 11a6 6 0 0 0 12 0c0-4.8-6-11-6-11Z" />
        <path d="M9 16c.8 1 1.8 1.5 3 1.5" />
      </svg>
    `;
  }

  // Generic fallback
  return `
    <svg ${common}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 21v-5h6v5" />
      <path d="M8 8h2" />
      <path d="M14 8h2" />
      <path d="M8 12h2" />
      <path d="M14 12h2" />
    </svg>
  `;
}


// ---------------------------------------------------------
// CityMap
// ---------------------------------------------------------

function CityMap() {
  const [wards, setWards] = useState(null);
  const [roads, setRoads] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [intersections, setIntersections] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);


  // -------------------------------------------------------
  // Load synthetic GIS data
  // -------------------------------------------------------

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [
          wardsResponse,
          roadsResponse,
          facilitiesResponse,
          hotspotsResponse,
          intersectionsResponse,
        ] = await Promise.all([
          fetch("/data/wards.geojson"),
          fetch("/data/aquasentinel_roads_planned.json"),
          fetch("/data/facilities.json"),
          fetch("/data/aquasentinel_hotspots_clean.json"),
          fetch("/data/aquasentinel_intersections_planned.json"),
        ]);

        const wardsData = await wardsResponse.json();
        const roadsData = await roadsResponse.json();
        const facilitiesData = await facilitiesResponse.json();
        const hotspotsData = await hotspotsResponse.json();
        const intersectionsData = await intersectionsResponse.json();

        setWards(wardsData);
        setRoads(roadsData);
        setFacilities(facilitiesData);
        setHotspots(hotspotsData);
        setIntersections(intersectionsData);
      } catch (error) {
        console.error("Failed to load AquaCity map data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  useEffect(() => {
  const loadIncidents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/operations/incidents");

      if (!response.ok) {
        throw new Error("Failed to fetch active incidents");
      }

      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to load active incidents:", error);
    }
  };

  loadIncidents();
  }, []);

  // -------------------------------------------------------
  // Ward styling
  // -------------------------------------------------------

  const wardStyle = (feature) => {
    const wardId = feature?.properties?.ward_id;

    const fills = {
      1: "#172033",
      2: "#18252b",
      3: "#211f32",
      4: "#20262d",
    };

    return {
      color: "#64748b",
      weight: 1.2,
      opacity: 0.9,
      fillColor: fills[wardId] || "#172033",
      fillOpacity: 0.72,
    };
  };


  // -------------------------------------------------------
  // Road styling
  // -------------------------------------------------------

  const roadStyle = (roadType) => {
    const normalized = roadType?.toUpperCase();

    if (normalized === "ARTERIAL") {
      return {
        color: "#cbd5e1",
        weight: 4,
        opacity: 0.75,
      };
    }

    if (normalized === "COLLECTOR") {
      return {
        color: "#94a3b8",
        weight: 2.5,
        opacity: 0.65,
      };
    }

    return {
      color: "#64748b",
      weight: 1.4,
      opacity: 0.42,
    };
  };


  // -------------------------------------------------------
  // Hotspot styling
  // -------------------------------------------------------

  const hotspotStyle = (severity) => {
    const normalized = severity?.toUpperCase();

    if (normalized === "HIGH" || normalized === "CRITICAL") {
      return {
        color: "#fb7185",
        fillColor: "#ef4444",
        radius: 7,
      };
    }

    if (normalized === "MEDIUM" || normalized === "MODERATE") {
      return {
        color: "#fbbf24",
        fillColor: "#f59e0b",
        radius: 6,
      };
    }

    return {
      color: "#4ade80",
      fillColor: "#22c55e",
      radius: 5,
    };
  };

 // -------------------------------------------------------
  // Incidents styling
  // -------------------------------------------------------
  const incidentStyle = (severity) => {
  const normalized = severity?.toUpperCase();

  if (normalized === "CRITICAL") {
    return {
      color: "#fda4af",
      fillColor: "#ef4444",
      radius: 9,
    };
  }

  if (normalized === "HIGH") {
    return {
      color: "#fdba74",
      fillColor: "#f97316",
      radius: 8,
    };
  }

  if (normalized === "MODERATE") {
    return {
      color: "#fde68a",
      fillColor: "#eab308",
      radius: 7,
    };
  }

  return {
    color: "#86efac",
    fillColor: "#22c55e",
    radius: 6,
  };
};

  // -------------------------------------------------------
  // Ward labels
  // -------------------------------------------------------

  const wardLabels = useMemo(() => {
    if (!wards?.features) return [];

    return wards.features
      .map((feature) => {
        const geometry = feature.geometry;

        if (!geometry || geometry.type !== "Polygon") {
          return null;
        }

        const coordinates = geometry.coordinates?.[0];

        if (!coordinates?.length) {
          return null;
        }

        let latitudeSum = 0;
        let longitudeSum = 0;

        coordinates.forEach(([longitude, latitude]) => {
          longitudeSum += longitude;
          latitudeSum += latitude;
        });

        return {
          id: feature.properties?.ward_id,
          name: feature.properties?.name,
          position: [
            latitudeSum / coordinates.length,
            longitudeSum / coordinates.length,
          ],
        };
      })
      .filter(Boolean);
  }, [wards]);


  // -------------------------------------------------------
  // Synthetic urban background layers
  //
  // These are generated from the actual city bounding box.
  // No additional GeoJSON file is required.
  // -------------------------------------------------------

  const urbanLayers = useMemo(() => {
    if (!wards) {
      return {
        parks: [],
        buildings: [],
        drainage: [],
      };
    }

    const layer = L.geoJSON(wards);
    const bounds = layer.getBounds();

    if (!bounds.isValid()) {
      return {
        parks: [],
        buildings: [],
        drainage: [],
      };
    }

    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    const latRange = north - south;
    const lonRange = east - west;

    // Convert normalized city coordinates into
    // real map coordinates.
    const point = (x, y) => [
      south + latRange * y,
      west + lonRange * x,
    ];

    // -----------------------------------------------------
    // Parks
    // -----------------------------------------------------

    const parks = [
      [
        point(0.06, 0.72),
        point(0.16, 0.77),
        point(0.19, 0.69),
        point(0.13, 0.63),
        point(0.05, 0.66),
      ],

      [
        point(0.66, 0.78),
        point(0.82, 0.82),
        point(0.88, 0.73),
        point(0.78, 0.67),
        point(0.66, 0.70),
      ],

      [
        point(0.12, 0.25),
        point(0.23, 0.29),
        point(0.27, 0.20),
        point(0.20, 0.13),
        point(0.10, 0.16),
      ],

      [
        point(0.72, 0.30),
        point(0.84, 0.34),
        point(0.90, 0.25),
        point(0.84, 0.17),
        point(0.72, 0.20),
      ],

      [
        point(0.38, 0.54),
        point(0.48, 0.58),
        point(0.54, 0.50),
        point(0.49, 0.43),
        point(0.38, 0.46),
      ],
    ];


    // -----------------------------------------------------
    // Drainage / water channel
    // -----------------------------------------------------

    const drainage = [
      point(0.03, 0.40),
      point(0.16, 0.43),
      point(0.28, 0.39),
      point(0.40, 0.42),
      point(0.52, 0.37),
      point(0.64, 0.40),
      point(0.76, 0.36),
      point(0.89, 0.39),
      point(0.98, 0.35),
    ];


    // -----------------------------------------------------
    // Building footprints
    //
    // 6 clusters × 4 buildings = 24 buildings.
    // Small and intentionally low contrast.
    // -----------------------------------------------------

    const buildingClusters = [
      { x: 0.27, y: 0.76 },
      { x: 0.47, y: 0.78 },
      { x: 0.28, y: 0.55 },
      { x: 0.57, y: 0.54 },
      { x: 0.31, y: 0.28 },
      { x: 0.52, y: 0.20 },
    ];

    const buildings = [];

    buildingClusters.forEach((cluster, clusterIndex) => {
      const offsets = [
        [0, 0],
        [0.035, 0.008],
        [0.008, -0.035],
        [0.045, -0.032],
      ];

      offsets.forEach(([dx, dy], buildingIndex) => {
        const x = cluster.x + dx;
        const y = cluster.y + dy;

        const width = 0.022 + ((clusterIndex + buildingIndex) % 2) * 0.008;
        const height =
          0.020 + ((clusterIndex + buildingIndex) % 3) * 0.007;

        buildings.push([
          point(x, y),
          point(x + width, y),
          point(x + width, y + height),
          point(x, y + height),
        ]);
      });
    });

    return {
      parks,
      buildings,
      drainage,
    };
  }, [wards]);


  // -------------------------------------------------------
  // Loading state
  // -------------------------------------------------------

  if (loading) {
    return (
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <div className="flex h-[500px] items-center justify-center">
          <div className="text-center">
            <MapPinned className="mx-auto h-6 w-6 text-slate-500" />

            <p className="mt-3 text-sm font-medium text-slate-300">
              Loading AquaCity map...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Loading synthetic urban environment
            </p>
          </div>
        </div>
      </section>
    );
  }


  // -------------------------------------------------------
  // Main map
  // -------------------------------------------------------

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <style>{`
        .aquasentinel-dark-popup .leaflet-popup-content-wrapper,
        .aquasentinel-dark-popup .leaflet-popup-tip {
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid #334155;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
        }
        .aquasentinel-dark-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
        }
        .aquasentinel-dark-popup .leaflet-popup-content {
          margin: 14px 16px;
          color: #cbd5e1;
          line-height: 1.65;
          min-width: 150px;
        }
        .aquasentinel-dark-popup .leaflet-popup-content p {
          margin: 7px 0;
        }
        .aquasentinel-dark-popup .leaflet-popup-content strong {
          color: #f1f5f9;
          font-weight: 600;
        }
        .aquasentinel-dark-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        .aquasentinel-dark-popup .leaflet-popup-close-button:hover {
          color: #f8fafc !important;
        }
        .aquasentinel-dark-popup .leaflet-popup-tip-container {
          filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
        }
      `}</style>

      {/* ---------------------------------------------------
          Header
      --------------------------------------------------- */}

      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-sky-400" />

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
              AquaCity Operations Map
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Synthetic urban environment · infrastructure and waterlogging
            situation
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Operational Area
          </span>
        </div>
      </div>


      {/* ---------------------------------------------------
          Map
      --------------------------------------------------- */}

      <div className="relative h-[500px] bg-slate-950">

        <MapContainer
          center={[19.045, 72.895]}
          zoom={13}
          zoomControl={false}
          scrollWheelZoom={true}
          attributionControl={false}
          className="h-full w-full"
          style={{
            background: "#020617",
          }}
        >

          {/* -----------------------------------------------
              Automatically fit synthetic city
          ----------------------------------------------- */}

          <FitCityBounds wards={wards} />


          {/* -----------------------------------------------
              Synthetic urban background

              These layers sit behind the operational
              road / incident / facility layers.
          ----------------------------------------------- */}

          <Pane
            name="urban-background"
            style={{
              zIndex: 390,
              pointerEvents: "none",
            }}
          >

            {/* Parks */}

            {urbanLayers.parks.map((park, index) => (
              <Polygon
                key={`park-${index}`}
                positions={park}
                pathOptions={{
                  color: "#28524a",
                  weight: 1,
                  opacity: 0.55,
                  fillColor: "#163b34",
                  fillOpacity: 0.48,
                }}
              />
            ))}


            {/* Buildings */}

            {urbanLayers.buildings.map((building, index) => (
              <Polygon
                key={`building-${index}`}
                positions={building}
                pathOptions={{
                  color: "#475569",
                  weight: 0.5,
                  opacity: 0.35,
                  fillColor: "#334155",
                  fillOpacity: 0.20,
                }}
              />
            ))}


            {/* Drainage channel */}

            <Polyline
              positions={urbanLayers.drainage}
              pathOptions={{
                color: "#164e63",
                weight: 7,
                opacity: 0.38,
                lineCap: "round",
                lineJoin: "round",
              }}
            />

            <Polyline
              positions={urbanLayers.drainage}
              pathOptions={{
                color: "#0e7490",
                weight: 1.5,
                opacity: 0.45,
                lineCap: "round",
                lineJoin: "round",
              }}
            />

          </Pane>


          {/* -----------------------------------------------
              City / ward polygons
          ----------------------------------------------- */}

          {wards && (
            <GeoJSON
              data={wards}
              style={wardStyle}
              onEachFeature={(feature, layer) => {
                const properties = feature.properties || {};

                layer.bindTooltip(
                  `
                    <div style="
                      font-size: 11px;
                      font-weight: 600;
                      color: #0f172a;
                      white-space: nowrap;
                    ">
                      ${properties.name || "Ward"}
                    </div>
                  `,
                  {
                    sticky: true,
                    direction: "center",
                    className: "aquasentinel-ward-tooltip",
                  }
                );
              }}
            />
          )}


          {/* -----------------------------------------------
              Ward labels
          ----------------------------------------------- */}

          {wardLabels.map((ward) => (
            <Marker
              key={`ward-label-${ward.id}`}
              position={ward.position}
              interactive={false}
              icon={L.divIcon({
                html: `
                  <div style="
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    text-align: center;
                    text-shadow:
                      0 1px 2px #020617,
                      0 0 4px #020617;
                  ">
                    ${ward.name || `WARD ${ward.id}`}
                  </div>
                `,
                className: "",
                iconSize: [120, 20],
                iconAnchor: [60, 10],
              })}
            />
          ))}


          {/* -----------------------------------------------
              Roads
          ----------------------------------------------- */}

          {roads.map((road) => (
            <Polyline
              key={road.road_id}
              positions={road.geometry.coordinates.map(
                ([longitude, latitude]) => [latitude, longitude]
              )}
              pathOptions={roadStyle(road.road_type)}
            >
              <Popup className="aquasentinel-dark-popup">
                <div className="text-xs">
                  <p className="font-semibold">{road.name}</p>

                  <p>Code: {road.road_code}</p>

                  <p>Type: {road.road_type}</p>

                  <p>Ward: {road.ward_id}</p>

                  <p>Width: {road.width_m} m</p>
                </div>
              </Popup>
            </Polyline>
          ))}


          {/* -----------------------------------------------
              Intersections
          ----------------------------------------------- */}

          {intersections.map((intersection) => {
            const [longitude, latitude] =
              intersection.geometry.coordinates;

            return (
              <CircleMarker
                key={intersection.intersection_id}
                center={[latitude, longitude]}
                radius={2}
                pathOptions={{
                  color: "#94a3b8",
                  fillColor: "#94a3b8",
                  fillOpacity: 0.45,
                  opacity: 0.5,
                  weight: 1,
                }}
              >
                <Tooltip direction="top">
                  {intersection.intersection_code}
                </Tooltip>

                <Popup className="aquasentinel-dark-popup">
                  <div className="text-xs">
                    <p className="font-semibold">
                      {intersection.intersection_code}
                    </p>

                    <p>Ward: {intersection.ward_id}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}


          {/* -----------------------------------------------
              Historical waterlogging hotspots
          ----------------------------------------------- */}

        {hotspots.map((hotspot) => {
          const [longitude, latitude] =
            hotspot.geometry.coordinates;

          const style = hotspotStyle(
            hotspot.historical_severity
          );

          // Historical hotspots remain small filled circles.
          return (
            <CircleMarker
              key={hotspot.hotspot_id}
              center={[latitude, longitude]}
              radius={style.radius}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip direction="top">
                {hotspot.hotspot_code}
              </Tooltip>

              <Popup className="aquasentinel-dark-popup">
                <div className="text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />

                    <p className="font-semibold">
                      Waterlogging Hotspot
                    </p>
                  </div>

                  <p>
                    <strong>Code:</strong>{" "}
                    {hotspot.hotspot_code}
                  </p>

                  <p>
                    <strong>Historical severity:</strong>{" "}
                    {hotspot.historical_severity}
                  </p>

                  <p>
                    <strong>Elevation:</strong>{" "}
                    {hotspot.elevation_m} m
                  </p>

                  <p>
                    <strong>Ward:</strong>{" "}
                    {hotspot.ward_id}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

          {/* -------------------------------------------------
              Active incidents
          ------------------------------------------------- */}

          {incidents.map((incident) => {
            if (
              incident.latitude == null ||
              incident.longitude == null
            ) {
              return null;
            }

            const style = incidentStyle(incident.severity);

            return (
              <Marker
                key={`incident-${incident.id}`}
                position={[incident.latitude, incident.longitude]}
                icon={createIncidentIcon(incident.severity)}
                // Keep active incidents visually above facility markers.
                zIndexOffset={1000}
              >
                <Tooltip direction="top">
                  Incident #{incident.id}
                </Tooltip>

                <Popup className="aquasentinel-dark-popup">
                  <div className="text-xs">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />

                      <p className="font-semibold">
                        Active Waterlogging Incident
                      </p>
                    </div>

                    <p>
                      <strong>Incident:</strong> #{incident.id}
                    </p>

                    <p>
                      <strong>Severity:</strong> {incident.severity}
                    </p>

                    <p>
                      <strong>Ward:</strong> {incident.ward}
                    </p>

                    <p>
                      <strong>Water level:</strong>{" "}
                      {incident.waterLevel ?? "N/A"} m
                    </p>

                    <p>
                      <strong>Affected population:</strong>{" "}
                      {incident.affectedPopulation ?? "N/A"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}


          {/* -----------------------------------------------
              Critical facilities
          ----------------------------------------------- */}

          {facilities.map((facility) => {
            const [longitude, latitude] =
              facility.geometry.coordinates;

            return (
              <Marker
                key={facility.facility_id}
                position={[latitude, longitude]}
                icon={createFacilityIcon(
                  facility.facility_type,
                  facility.priority
                )}
                zIndexOffset={0}
              >
                <Tooltip direction="top">
                  {facility.name}
                </Tooltip>

                <Popup className="aquasentinel-dark-popup">
                  <div className="text-xs">
                    <p className="font-semibold">
                      {facility.name}
                    </p>

                    <p>
                      <strong>Type:</strong>{" "}
                      {facility.facility_type}
                    </p>

                    <p>
                      <strong>Priority:</strong>{" "}
                      {facility.priority}
                    </p>

                    <p>
                      <strong>Capacity:</strong>{" "}
                      {facility.capacity}
                    </p>

                    <p>
                      <strong>Ward:</strong>{" "}
                      {facility.ward_id}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>


        {/* -------------------------------------------------
            Top-left map label
        ------------------------------------------------- */}

        <div className="pointer-events-none absolute left-4 top-4 z-[500]">
          <div className="rounded-md border border-slate-700/80 bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Municipal Boundary
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-200">
              AQUACITY
            </p>
          </div>
        </div>


        {/* -------------------------------------------------
            Map legend
        ------------------------------------------------- */}

        <div className="absolute bottom-4 left-4 z-[500] rounded-lg border border-slate-700/80 bg-slate-950/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Map Layers
          </p>

          <div className="space-y-2 text-[11px] text-slate-400">

            {/* Road */}

            <div className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-slate-300" />
              <span>Arterial road</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-[2px] w-5 rounded-full bg-slate-500" />
              <span>Collector road</span>
            </div>


            {/* Park */}

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-sm border border-emerald-900 bg-emerald-950" />
              <span>Urban green space</span>
            </div>


            {/* Drainage */}

            <div className="flex items-center gap-2">
              <span className="h-[2px] w-5 rounded-full bg-cyan-800" />
              <span>Drainage channel</span>
            </div>


            {/* Hotspot */}

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-red-300 bg-red-500" />
              <span>Waterlogging hotspot</span>
            </div>


            {/* Facility */}

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm border border-sky-400 bg-slate-900" />
              <span>Critical facility</span>
            </div>


            {/* Intersection */}

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>Intersection</span>
            </div>

          </div>
        </div>


        {/* -------------------------------------------------
            Map status indicator
        ------------------------------------------------- */}

        <div className="absolute right-4 top-4 z-[500]">
          <div className="flex items-center gap-2 rounded-md border border-slate-700/80 bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-sm">
            <Crosshair className="h-3.5 w-3.5 text-sky-400" />

            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Live Operations View
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default CityMap;