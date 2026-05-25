import React, { memo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  Marker,
  ZoomableGroup,
  Annotation,
} from "react-simple-maps";

// Sample data - replace with real data from your analytics
const markers = [
  { name: "Egypt", coordinates: [30.8025, 26.8206], value: 1250 },
  { name: "United States", coordinates: [-95.7129, 37.0902], value: 3500 },
  { name: "United Kingdom", coordinates: [-3.436, 55.3781], value: 2100 },
  { name: "Germany", coordinates: [10.4515, 51.1657], value: 1800 },
  { name: "France", coordinates: [2.2137, 46.2276], value: 1600 },
  { name: "Japan", coordinates: [138.2529, 36.2048], value: 2200 },
  { name: "Australia", coordinates: [133.7751, -25.2744], value: 1400 },
  { name: "Brazil", coordinates: [-51.9253, -14.235], value: 1100 },
  { name: "Canada", coordinates: [-106.3468, 56.1304], value: 1900 },
  { name: "India", coordinates: [78.9629, 20.5937], value: 2800 },
];

const geoUrl = "/countries.json"; // ✅ local file

const GeographyMap = memo(() => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  // Scale marker size based on value
  const getMarkerRadius = (value: number) => {
    const maxValue = Math.max(...markers.map((m) => m.value));
    const minRadius = 3;
    const maxRadius = 15;
    return minRadius + (value / maxValue) * (maxRadius - minRadius);
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg overflow-hidden">
      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10 pointer-events-none">
          <p className="text-sm font-semibold text-gray-900">
            {tooltipContent}
          </p>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
          aria-label="Zoom in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
          aria-label="Zoom out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border border-gray-200 z-10">
        <p className="text-xs font-semibold text-gray-700 mb-2">
          Visitors by Region
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-600">1K - 2K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-600">2K - 3K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-600">3K+</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={handleMoveEnd}
          maxZoom={4}
          minZoom={1}
        >
          {/* Background sphere */}
          <Sphere
            stroke="#e5e7eb"
            strokeWidth={0.5}
            fill="transparent"
            id={""}
          />

          {/* Grid lines */}
          <Graticule stroke="#f3f4f6" strokeWidth={0.5} />

          {/* Countries */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#d1fae5"
                  stroke="#10b981"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      fill: "#d1fae5",
                      stroke: "#10b981",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#a7f3d0",
                      stroke: "#059669",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    pressed: {
                      fill: "#6ee7b7",
                      stroke: "#047857",
                      strokeWidth: 1,
                      outline: "none",
                    },
                  }}
                  onMouseEnter={() => {
                    setTooltipContent(geo.properties.name);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                />
              ))
            }
          </Geographies>

          {/* Markers */}
          {markers.map(({ name, coordinates, value }) => (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              <circle
                r={getMarkerRadius(value) / position.zoom}
                fill="#10b981"
                fillOpacity={0.7}
                stroke="#ffffff"
                strokeWidth={1.5 / position.zoom}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => {
                  setTooltipContent(
                    `${name}: ${value.toLocaleString()} visitors`,
                  );
                }}
                onMouseLeave={() => {
                  setTooltipContent("");
                }}
              />
              <circle
                r={getMarkerRadius(value) / position.zoom + 5 / position.zoom}
                fill="#10b981"
                fillOpacity={0.2}
                stroke="none"
                className="animate-ping"
                style={{
                  animationDuration: "2s",
                }}
              />
            </Marker>
          ))}

          {/* Annotations for top regions */}
          {markers.slice(0, 3).map(({ name, coordinates, value }, index) => (
            <Annotation
              key={`annotation-${name}`}
              subject={coordinates as [number, number]}
              dx={
                index === 0 ? 30
                : index === 1 ?
                  -40
                : 25
              }
              dy={
                index === 0 ? -20
                : index === 1 ?
                  15
                : 30
              }
              connectorProps={{
                stroke: "#10b981",
                strokeWidth: 1.5 / position.zoom,
                strokeLinecap: "round",
              }}
            >
              <text
                x={0}
                textAnchor={index === 1 ? "end" : "start"}
                alignmentBaseline="middle"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fill: "#047857",
                  fontSize: `${12 / position.zoom}px`,
                  fontWeight: 600,
                  pointerEvents: "none",
                }}
              >
                {name}
              </text>
              <text
                x={0}
                y={14 / position.zoom}
                textAnchor={index === 1 ? "end" : "start"}
                alignmentBaseline="middle"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fill: "#6b7280",
                  fontSize: `${10 / position.zoom}px`,
                  pointerEvents: "none",
                }}
              >
                {value.toLocaleString()}
              </text>
            </Annotation>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});

GeographyMap.displayName = "GeographyMap";

export default GeographyMap;
