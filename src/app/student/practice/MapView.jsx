"use client";

import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
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

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={17}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Talabaning joylashuvi */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>Sizning joylashuvingiz</Popup>
      </Marker>

      {/* Amaliyot bazalari */}
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

      {/* 10 metr radius */}
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
