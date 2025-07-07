'use client';

import { useState, useEffect } from 'react';
import Navigation from "../../components/Navigation.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.jsx";
import { Calendar } from "../../components/ui/calendar.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Input } from "../../components/ui/input.jsx";
import { CalendarIcon, Filter, History, Search, Loader2, MapPin, Clock, Utensils } from 'lucide-react';
import { format } from 'date-fns';

export default function HistoryPage() {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    mealType: '',
    startDate: undefined,
    endDate: undefined,
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [filters, currentPage]);

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      params.append('page', currentPage.toString());
      params.append('limit', '10');

      if (filters.status) params.append('status', filters.status);
      if (filters.mealType) params.append('mealType', filters.mealType);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await fetch(`http://localhost:5000/api/bookings?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      mealType: '',
      startDate: undefined,
      endDate: undefined,
      search: '',
    });
    setCurrentPage(1);
  };

  const filteredBookings = bookingData?.bookings.filter(booking => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        booking.hallId.name.toLowerCase().includes(searchTerm) ||
        booking.mealType.toLowerCase().includes(searchTerm) ||
        booking.mealId?.menuItems?.some(item => item.toLowerCase().includes(searchTerm))
      );
    }
    return true;
  });

 const getStatusColor = (status) => {
  switch (status) {
    case 'booked':
      return 'bg-blue-100 text-blue-800';
    case 'consumed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getMealTypeIcon = (mealType) => {
  switch (mealType) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '☀️';
    case 'dinner':
      return '🌙';
    default:
      return '🍽️';
  }
};
  return (
    <ProtectedRoute>
      {(user) => (
        <div className="min-h-screen bg-gray-50">
          <Navigation user={user} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
              <p className="text-gray-600 mt-2">
                View and filter your meal booking history
              </p>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
                <CardDescription>Filter your bookings by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search bookings..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="consumed">Consumed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Meal Type Filter */}
                  <Select value={filters.mealType} onValueChange={(value) => handleFilterChange('mealType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All meals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All meals</SelectItem>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Start Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(filters.startDate, 'PP') : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => handleFilterChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* End Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(filters.endDate, 'PP') : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => handleFilterChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    Clear Filters
                  </Button>
                  {bookingData && (
                    <p className="text-sm text-gray-600">
                      Showing {filteredBookings?.length || 0} of {bookingData.total} bookings
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bookings List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Your Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{getMealTypeIcon(booking.mealType)}</span>
                              <div>
                                <h3 className="text-lg font-semibold capitalize">
                                  {booking.mealType}
                                </h3>
                                <div className="flex items-center text-sm text-gray-600 space-x-4">
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {booking.hallId?.name || "Unknown Hall"}

                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {format(new Date(booking.date), 'PPP')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {booking.mealId?.menuItems?.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <Utensils className="h-4 w-4 mr-1" />
                                  Menu Items
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {booking.mealId?.menuItems?.length > 0 ? (
                                    booking.mealId.menuItems.map((item, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {item}
                                      </Badge>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-400">No items</p>
                                  )}

                                </div>  
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <Badge className={`mb-2 ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </Badge>
                            <p className="text-lg font-bold">₹{booking.price}</p>
                            <p className="text-xs text-gray-500">
                              Booked on {format(new Date(booking.createdAt), 'PP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {bookingData && bookingData.totalPages > 1 && (
                      <div className="flex justify-center space-x-2 pt-6">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, bookingData.totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, bookingData.totalPages))}
                          disabled={currentPage === bookingData.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600 mb-4">
                      {Object.values(filters).some(filter => filter)
                        ? "Try adjusting your filters to see more results."
                        : "You haven't made any bookings yet. Start by booking your first meal!"
                      }
                    </p>
                    {!Object.values(filters).some(filter => filter) && (
                      <Button onClick={() => window.location.href = '/booking'}>
                        Book a Meal
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}