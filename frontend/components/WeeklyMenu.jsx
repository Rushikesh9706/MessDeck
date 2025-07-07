import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Utensils } from "lucide-react";

const daysOfWeek = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

export default function WeeklyMenu({
  halls = [],
  mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
  ],
}) {
  const [selectedHall, setSelectedHall] = useState("all");
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeeklyMeals = async () => {
      if (!selectedMealType) return;
      setLoading(true);
      const token = localStorage.getItem("token");
      const mealsByDay = {};
      for (const day of daysOfWeek) {
        let meals = [];
        if (selectedHall === "all") {
          // Fetch for all halls
          for (const hall of halls) {
            const res = await fetch(
              `http://localhost:5000/api/meals?hallName=${encodeURIComponent(hall.name)}&day=${day.key}&mealType=${selectedMealType}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                meals = meals.concat(data);
              }
            }
          }
        } else {
          const hallObj = halls.find((h) => h._id === selectedHall);
          if (hallObj) {
            const res = await fetch(
              `http://localhost:5000/api/meals?hallName=${encodeURIComponent(hallObj.name)}&day=${day.key}&mealType=${selectedMealType}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
              const data = await res.json();
              meals = Array.isArray(data) ? data : [];
            }
          }
        }
        mealsByDay[day.key] = meals;
      }
      setWeeklyMeals(mealsByDay);
      setLoading(false);
    };
    fetchWeeklyMeals();
  }, [selectedHall, selectedMealType, halls]);

  return (
    <div className="p-6">
      <div className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Utensils className="h-6 w-6 text-orange-500" /> Weekly Menu
      </div>
      <div className="text-gray-600 mb-6">View meals for the entire week</div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <div className="mb-1 font-medium">Select Hall</div>
          <Select value={selectedHall} onValueChange={setSelectedHall}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Hall" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">All Halls</SelectItem>
              {halls.map((hall) => (
                <SelectItem key={hall._id} value={hall._id}>
                  {hall.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1 font-medium">Select Meal Type</div>
          <Select value={selectedMealType} onValueChange={setSelectedMealType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Meal Type" />
            </SelectTrigger>
            <SelectContent>
              {mealTypes.map((meal) => (
                <SelectItem key={meal.value} value={meal.value}>
                  {meal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 min-w-[700px]">
          {daysOfWeek.map((day) => (
            <div key={day.key}>
              <div className="font-bold mb-2 text-center">{day.label}</div>
              {loading ? (
                <div className="text-center text-gray-400">Loading...</div>
              ) : weeklyMeals[day.key]?.length > 0 ? (
                weeklyMeals[day.key].map((meal) => (
                  <Card key={meal._id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="font-semibold mb-1">{meal.menuItems.join(", ")}</div>
                      <div className="text-orange-600 font-bold">₹{meal.price}</div>
                      <div className="text-xs text-gray-500 mt-1">{meal.hallName}</div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-400">No meal</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 