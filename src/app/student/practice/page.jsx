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
  const [openAttendance, setOpenAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const student_id = "014e065e-6bce-4c80-944e-3a3367efa840";

  useEffect(() => {
    supabase
      .from("intern_sites")
      .select("*")
      .then((res) => setSites(res.data || []));

    supabase
      .from("practice_attendance")
      .select("*")
      .eq("student_id", student_id)
      .is("check_out", null)
      .single()
      .then((res) => setOpenAttendance(res.data || null));

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
      (err) => console.log("GPS ERROR:", err),
      { enableHighAccuracy: true }
    );
  }, [selectedSite]);

  // GOOGLE MAPS ROUTE
  const openGoogleMaps = () => {
    if (!userLocation || !selectedSite) return;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedSite.lat},${selectedSite.lng}&travelmode=driving`;

    window.location.href = url;
  };

  // YANDEX ROUTE
  const openYandexMaps = () => {
    if (!userLocation || !selectedSite) return;

    const mobileUrl = `yandexmaps://maps.yandex.ru/?rtext=${userLocation.lat},${userLocation.lng}~${selectedSite.lat},${selectedSite.lng}&rtt=auto`;
    const webUrl = `https://yandex.com/maps/?rtext=${userLocation.lat},${userLocation.lng}~${selectedSite.lat},${selectedSite.lng}&rtt=auto`;

    // Mobilga o‘tmasa — web versiyani ochadi
    window.location.href = mobileUrl;
    setTimeout(() => {
      window.location.href = webUrl;
    }, 500);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-3">Amaliyot – GPS bilan kirish/chiqish</h1>

      <MapView
        sites={sites}
        userLocation={userLocation}
        onSelectSite={(site) => {
          setSelectedSite(site);
          setOpenDialog(true);
        }}
      />

      {/* DIALOG */}
      {openDialog && selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-md w-80 shadow-xl">
            <h2 className="text-lg font-bold mb-2">{selectedSite.name}</h2>

            <p className="text-sm text-gray-600 mb-4">
              Bu amaliyot bazasiga borishni xohlaysizmi?
            </p>

            <button
              className="w-full bg-blue-600 text-white py-2 rounded mb-2"
              onClick={openGoogleMaps}
            >
              Google Maps orqali borish
            </button>

            <button
              className="w-full bg-yellow-500 text-white py-2 rounded mb-2"
              onClick={openYandexMaps}
            >
              Yandex Maps orqali borish
            </button>

            <button
              className="w-full bg-gray-300 py-2 rounded"
              onClick={() => setOpenDialog(false)}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {selectedSite && (
        <div className="p-3 mt-4 border rounded">
          <p>
            Tanlangan amaliyot bazasi: <b>{selectedSite.name}</b>
          </p>
          <p>Masofa: {distance ? distance + " metr" : "aniqlanmoqda..."}</p>
        </div>
      )}
    </div>
  );
}
