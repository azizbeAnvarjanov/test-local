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

  const student_id = "014e065e-6bce-4c80-944e-3a3367efa840"; // TODO: Auth’dan real student ID olib qo’ying

  useEffect(() => {
    // Amaliyot bazalarini olish
    supabase
      .from("intern_sites")
      .select("*")
      .then((res) => setSites(res.data || []));

    // Ochilgan check-in bor yoki yo'qligini ko'rish
    supabase
      .from("practice_attendance")
      .select("*")
      .eq("student_id", student_id)
      .is("check_out", null)
      .single()
      .then((res) => {
        setOpenAttendance(res.data || null);
      });

    // GPS kuzatuv
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

  // ⬇⬇⬇ CHECK IN FUNKSIYASI
  const handleCheckIn = async () => {
    if (!selectedSite) return alert("Baza tanlanmagan");
    if (!userLocation) return alert("GPS aniqlanmayapti");

    if (distance > 10) {
      return alert("📍 Siz amaliyot bazasidan 10 metr uzoqdasiz!");
    }

    setLoading(true);

    const { error } = await supabase.from("practice_attendance").insert({
      student_id,
      site_id: selectedSite.id,
      check_in: new Date().toISOString(),
    });

    setLoading(false);

    if (error) return alert("Xatolik: kirish yozilmadi" + error);

    alert("✔ Amaliyotga kirishingiz qayd etildi!");
    window.location.reload();
  };

  // ⬇⬇⬇ CHECK OUT FUNKSIYASI
  const handleCheckOut = async () => {
    if (!openAttendance) return alert("Hozirgi amaliyot yo'q");

    if (distance > 10) {
      return alert("📍 Chiqish uchun bazaga 10 metr ichida bo‘ling!");
    }

    setLoading(true);

    const { error } = await supabase
      .from("practice_attendance")
      .update({
        check_out: new Date().toISOString(),
      })
      .eq("id", openAttendance.id);

    setLoading(false);

    if (error) return alert("Xatolik: chiqish yozilmadi" + error);

    alert("✔ Amaliyotdan chiqish qayd etildi!");
    window.location.reload();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-3">Amaliyot – GPS bilan kirish/chiqish</h1>

      <MapView
        sites={sites}
        userLocation={userLocation}
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
      />

      {selectedSite && (
        <div className="p-3 mt-4 border rounded">
          <p>
            Tanlangan amaliyot bazasi: <b>{selectedSite.name}</b>
          </p>
          <p>Masofa: {distance ? distance + " metr" : "aniqlanmoqda..."}</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Check In
        </button>

        <button
          onClick={handleCheckOut}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Check Out
        </button>
      </div>
    </div>
  );
}
