"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [30, 30],
});

const baseIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

export default function MapView({
  sites,
  userLocation,
  selectedSite,
  setSelectedSite,
}) {
  if (!userLocation) return <p>GPS kutilmoqda...</p>;

  const { BaseLayer } = LayersControl;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={18}
      style={{ height: "500px", width: "100%" }}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="Oddiy xarita">
          <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
        </BaseLayer>

        <BaseLayer name="Sput Mikki (Satellite)">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            maxZoom={20}
            attribution="Google Satellite"
          />
        </BaseLayer>
      </LayersControl>

      {/* Talaba joylashuvi */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>Sizning joylashuvingiz</Popup>
      </Marker>

      {/* Baza markerlari */}
      {sites.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={baseIcon}
          eventHandlers={{ click: () => setSelectedSite(s) }}
        >
          <Popup>{s.name}</Popup>
        </Marker>
      ))}

      {/* Radius */}
      {selectedSite && (
        <Circle
          center={[selectedSite.lat, selectedSite.lng]}
          radius={10}
          pathOptions={{ color: "green", fillColor: "green" }}
        />
      )}
    </MapContainer>
  );
}
