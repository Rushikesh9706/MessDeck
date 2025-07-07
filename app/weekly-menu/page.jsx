"use client";

import { useEffect, useState } from "react";
import WeeklyMenu from "../../components/WeeklyMenu.jsx";
import Navigation from "../../components/Navigation.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";

export default function WeeklyMenuPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/halls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHalls(data);
      }
      setLoading(false);
    };
    fetchHalls();
  }, []);

  return (
    <ProtectedRoute>
      {(user) => (
        <div className="min-h-screen bg-[#f8f9fa]">
          <Navigation user={user} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="text-center text-gray-500 py-12 text-lg">Loading...</div>
            ) : (
              <WeeklyMenu halls={halls} />
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 