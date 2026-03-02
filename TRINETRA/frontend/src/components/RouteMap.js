import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";

const sourceIcon = L.divIcon({
  className: "route-marker route-marker-source",
  html: '<span class="route-marker-inner">S</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = L.divIcon({
  className: "route-marker route-marker-destination",
  html: '<span class="route-marker-inner">D</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function FitRouteBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;

    const bounds = L.latLngBounds(positions);
    map.flyToBounds(bounds, {
      padding: [50, 50],
      maxZoom: 12,
      duration: 0.75,
    });
  }, [map, positions]);

  return null;
}

export default function RouteMap({ route }) {
  const positions = useMemo(() => {
    if (!route?.coordinates || !Array.isArray(route.coordinates)) return [];

    return route.coordinates
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const lat = Number(point[0]);
        const lng = Number(point[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return [lat, lng];
      })
      .filter(Boolean);
  }, [route]);

  if (positions.length < 2) return null;

  const source = positions[0];
  const destination = positions[positions.length - 1];

  return (
    <div className="map-card">
      <div className="map-card-header">
        <p className="map-card-title">Route Preview</p>
        <p className="map-card-subtitle">Auto-fitted for safe navigation clarity</p>
      </div>

      <MapContainer
        center={source}
        zoom={7}
        minZoom={4}
        className="route-map-canvas"
      >
        <FitRouteBounds positions={positions} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />

        <Polyline positions={positions} color="#f8a26f" weight={10} opacity={0.48} />
        <Polyline positions={positions} color="#cf2f2f" weight={6} opacity={0.95} />

        <Marker position={source} icon={sourceIcon}>
          <Popup className="route-popup">Source</Popup>
        </Marker>

        <Marker position={destination} icon={destinationIcon}>
          <Popup className="route-popup">Destination</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
