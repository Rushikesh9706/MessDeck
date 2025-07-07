'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx';
import { Home, Calendar, Wallet, History, LogOut, User, ChefHat, Menu, Settings as SettingsIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import EditProfileModal from './EditProfileModal';
import { toast } from 'sonner';

export default function Navigation({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userInfo, setUserInfo] = useState(user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Book Meal', href: '/booking', icon: Calendar },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'History', href: '/history', icon: History },
    { name: 'Weekly Menu', href: '/weekly-menu', icon: ChefHat },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Logo and App Name */}
        <div className="flex items-center space-x-3">
          <button className="md:hidden p-2 rounded bg-orange-600 text-white">
            <Menu className="h-6 w-6" />
          </button>
          <span className="flex items-center space-x-2">
            <span className="h-8 w-8 flex items-center justify-center rounded bg-orange-600 text-white font-bold text-xl">
              <Menu className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold text-gray-900">MessDeck</span>
          </span>
        </div>
        {/* Center: Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-base ${
                  isActive
                    ? 'bg-orange-100 text-orange-700' // active
                    : 'text-gray-700 hover:bg-gray-100 hover:text-orange-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        {/* Right: User Info and Icons */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="font-semibold text-gray-900">{user.name}</span>
              <span className="text-xs text-gray-500">{user.rollNo}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200"
            >
              <User className="h-6 w-6" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <SettingsIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Settings</h2>
            <div className="flex flex-col gap-3 mb-4">
              <div
                className="w-full px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors flex items-center justify-between"
              >
                <span>Theme</span>
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setShowSettings(false);
                }}
                className="w-full px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors text-left"
              >
                Edit Profile
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={userInfo}
        readOnly={!showSettings}
        onSave={async ({ name, rollNo, password }) => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/auth/me', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name, rollNo, password }),
            });
            if (res.ok) {
              toast.success('Profile updated successfully!');
              setUserInfo((prev) => prev ? { ...prev, name, rollNo } : prev);
            } else {
              const data = await res.json();
              toast.error(data.error || 'Failed to update profile');
            }
          } catch (e) {
            toast.error('Network error. Please try again.');
          }
          setShowProfileModal(false);
          setShowSettings(false);
        }}
      />
    </nav>
  );
}