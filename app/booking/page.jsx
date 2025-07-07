"use client";

import { useState, useEffect } from "react";
import Navigation from "../../components/Navigation.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.jsx";
import { Calendar } from "../../components/ui/calendar.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover.jsx";
import { Alert, AlertDescription } from "../../components/ui/alert.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { CalendarIcon, Clock, MapPin, Utensils, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BookingPage() {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedDate, setSelectedDate] = useState();
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [meal, setMeal] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState("");
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState("");

  const mealTypes = [
    { value: "breakfast", label: "Breakfast", icon: "🌅" },
    { value: "lunch", label: "Lunch", icon: "☀️" },
    { value: "dinner", label: "Dinner", icon: "🌙" },
  ];

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/halls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHalls(data);
      }
    } catch (error) {
      console.error("Error fetching halls:", error);
    }
  };

  const handleBooking = async () => {
    if (!selectedHall || !selectedMealType || !selectedDate) return;

    setBookingLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hallId: selectedHall,
          mealType: selectedMealType,
          date: selectedDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Meal booked successfully!");
        // Reset form
        setSelectedHall("");
        setSelectedMealType("");
        setSelectedDate(undefined);
      } else {
        toast.error(result.error || "Booking failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Error booking meal:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeals = async () => {
      if (!selectedHall || !selectedMealType || !selectedDate) {
        setMeals([]);
        return;
      }
      setMealsLoading(true);
      setMealsError("");
      try {
        // Get hall name from selectedHall
        const hallObj = halls.find((h) => h._id === selectedHall);
        if (!hallObj) {
          setMeals([]);
          setMealsError("Hall not found");
          setMealsLoading(false);
          return;
        }
        const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/meals?hallName=${encodeURIComponent(hallObj.name)}&day=${dayName}&mealType=${selectedMealType}`,
          { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setMeals(Array.isArray(data) ? data : []);
          if (!data || data.length === 0) setMealsError("No meals found for this selection");
        } else {
          setMeals([]);
          setMealsError("Failed to fetch meals");
        }
      } catch (e) {
        setMeals([]);
        setMealsError("Error fetching meals");
      } finally {
        setMealsLoading(false);
      }
    };
    fetchMeals();
  }, [selectedHall, selectedMealType, selectedDate, halls]);

  const handleBookMeal = async (meal) => {
    if (!selectedDate) return;
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hallId: selectedHall,
          mealType: meal.mealType,
          date: selectedDate.toISOString(),
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Meal booked successfully!");
      } else {
        toast.error(result.error || "Booking failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Error booking meal:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {(user) => (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
          <Navigation user={user} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Book Your Meals
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Select your preferred meals for the week ahead.
            </p>
            <div className="mb-6 text-base">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Wallet Balance: </span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                ₹{user.walletBalance?.toLocaleString()}
              </span>
            </div>

            {/* Date Selector */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-200" />
                <span className="font-semibold text-lg dark:text-white">Select Date</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const isToday = i === 0;
                  const isSelected =
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(new Date(date))}
                      className={`px-6 py-4 rounded-xl font-medium border transition-all text-base flex flex-col items-center min-w-[140px] shadow-sm
                        ${
                          isSelected
                            ? "bg-orange-500 text-white border-orange-500"
                            : isToday
                            ? "bg-orange-50 border-orange-300 text-orange-700"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-100"
                        }
                      `}
                    >
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {isToday && <span className="text-xs mt-1">Today</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hall Selector */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-200" />
                <span className="font-semibold text-lg dark:text-white">
                  Select Hall (Optional)
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedHall("")}
                  className={`px-5 py-2 rounded-full font-medium border transition-all text-base flex items-center
                    ${
                      selectedHall === ""
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-100"
                    }
                  `}
                >
                  All Halls
                </button>
                {halls.map((hall) => (
                  <button
                    key={hall._id}
                    onClick={() => setSelectedHall(hall._id)}
                    className={`px-5 py-2 rounded-full font-medium border transition-all text-base flex items-center
                      ${
                        selectedHall === hall._id
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-100"
                      }
                    `}
                  >
                    <MapPin className="h-4 w-4 mr-1" /> {hall.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Type Selector */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-lg mb-4 dark:text-white">Select Meal Type</div>
              <div className="flex flex-wrap gap-3">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.value}
                    onClick={() => setSelectedMealType(meal.value)}
                    className={`flex flex-col items-start px-6 py-4 rounded-xl border min-w-[220px] shadow-sm transition-all text-left
                      ${
                        selectedMealType === meal.value
                          ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500"
                          : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-orange-100"
                      }
                    `}
                  >
                    <span className="flex items-center text-lg font-semibold mb-1">
                      {meal.icon} {meal.label}
                    </span>
                    <span className="text-xs text-gray-700">
                      {meal.value === "breakfast" && "7:00 - 9:00 AM"}
                      {meal.value === "lunch" && "12:00 - 2:00 PM"}
                      {meal.value === "dinner" && "7:00 - 9:00 PM"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Available Meal Options */}
            {selectedHall && selectedMealType && selectedDate && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
                  <Utensils className="h-5 w-5 mr-2" />
                  Available {mealTypes.find(m => m.value === selectedMealType)?.label} Options
                </h2>
                {mealsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : meals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meals.map((meal) => (
                      <Card key={meal._id} className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <CardContent className="flex-1 flex flex-col justify-between p-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-lg dark:text-white">{meal.hallName}</span>
                            </div>
                            <div className="font-bold text-base mb-1 capitalize dark:text-white">{meal.mealType}</div>
                            <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                              {meal.menuItems.join(', ')}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-lg font-bold dark:text-white">₹{meal.price}</span>
                              <span className="ml-2 text-green-600 dark:text-green-400 text-xs">{meal.available ? 'Available' : 'Not Available'}</span>
                            </div>
                            <Button
                              onClick={() => handleBookMeal(meal)}
                              disabled={bookingLoading || !meal.available}
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              + Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : mealsError ? (
                  <div className="text-red-600 dark:text-red-400 py-8">{mealsError}</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
