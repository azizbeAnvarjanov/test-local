"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getDistance } from "geolib";
import { createClient } from "@/lib/client";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function PracticePage() {
  const supabase = createClient();
  const [sites, setSites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    supabase
      .from("intern_sites")
      .select("*")
      .then((res) => setSites(res.data || []));

    navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);

        if (selectedSite) {
          const dist = getDistance(
            { latitude: loc.lat, longitude: loc.lng },
            { latitude: selectedSite.lat, longitude: selectedSite.lng }
          );
          setDistance(dist);
        }
      },
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-3">Amaliyot – Karta</h1>

      <MapView
        sites={sites}
        userLocation={userLocation}
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
      />

      {selectedSite && (
        <div className="p-3 mt-3 border rounded">
          <p>
            Tanlangan baza: <b>{selectedSite.name}</b>
          </p>
          <p>Masofa: {distance ? distance + " m" : "Aniqlanmoqda..."}</p>
        </div>
      )}
    </div>
  );
}
