"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Calendar,
  Wallet,
  History,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    thisMonthBookings: 0,
    avgMealCost: 0,
    upcomingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/bookings?limit=5",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentBookings(data.bookings);

        // Calculate stats from bookings
        const now = new Date();
        const thisMonth = data.bookings.filter((booking) => {
          const bookingDate = new Date(booking.createdAt);
          return (
            bookingDate.getMonth() === now.getMonth() &&
            bookingDate.getFullYear() === now.getFullYear()
          );
        });

        const upcoming = data.bookings.filter((booking) => {
          const bookingDate = new Date(booking.date);
          return bookingDate > now && booking.status === "booked";
        });

        const totalCost = data.bookings.reduce(
          (sum, booking) => sum + booking.price,
          0
        );

        setStats({
          totalBookings: data.total,
          thisMonthBookings: thisMonth.length,
          avgMealCost:
            data.bookings.length > 0
              ? Math.round(totalCost / data.bookings.length)
              : 0,
          upcomingBookings: upcoming.length,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Book a Meal",
      description: "Reserve your next meal",
      icon: Calendar,
      href: "/booking",
      color: "bg-blue-500",
    },
    {
      title: "Manage Wallet",
      description: "Add funds or view transactions",
      icon: Wallet,
      href: "/wallet",
      color: "bg-green-500",
    },
    {
      title: "View History",
      description: "Check your booking history",
      icon: History,
      href: "/history",
      color: "bg-purple-500",
    },
  ];

  return (
    <ProtectedRoute>
      {(user) => {
        console.log("User:", user);
        return (
          <div className="min-h-screen bg-gray-50">
            <Navigation user={user} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Here's an overview of your mess activities
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Wallet Balance
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{user.walletBalance}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available balance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Bookings
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalBookings}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All time bookings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      This Month
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.thisMonthBookings}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Meals this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Upcoming
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.upcomingBookings}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Booked meals
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Common tasks at your fingertips
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Link key={action.title} href={action.href}>
                            <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                              <div
                                className={`${action.color} p-3 rounded-lg mr-4`}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {action.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Bookings</CardTitle>
                      <CardDescription>
                        Your latest meal reservations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-gray-200 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : recentBookings.length > 0 ? (
                        <div className="space-y-4">
                          {recentBookings.map((booking) => (
                            <div
                              key={booking._id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <h4 className="font-semibold capitalize">
                                  {booking.mealType} - {booking.hallId?.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(booking.date).toLocaleDateString()}{" "}
                                  • ₹{booking.price}
                                </p>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "booked"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.status === "consumed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {booking.status}
                              </div>
                            </div>
                          ))}
                          <div className="pt-4">
                            <Link href="/history">
                              <Button variant="outline" className="w-full">
                                View All Bookings
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No bookings yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Start by booking your first meal!
                          </p>
                          <Link href="/booking">
                            <Button>Book a Meal</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </ProtectedRoute>
  );
}
