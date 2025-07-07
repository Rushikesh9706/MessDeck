"use client";

import { useState, useEffect } from "react";

export default function EditProfileModal({ isOpen, onClose, user, onSave, readOnly }) {
  const [name, setName] = useState(user?.name || "");
  const [rollNo, setRollNo] = useState(user?.rollNo || "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isOpen && !readOnly) {
      setName(user?.name || "");
      setRollNo(user?.rollNo || "");
      setPassword("");
    }
  }, [isOpen, readOnly, user]);

  if (!isOpen) return null;

  if (readOnly) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Profile Details</h2>
          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Name</span>
              <span className="block px-3 py-2 border rounded dark:bg-gray-800 dark:text-white bg-gray-100">{user?.name}</span>
            </div>
            <div>
              <span className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Roll Number</span>
              <span className="block px-3 py-2 border rounded dark:bg-gray-800 dark:text-white bg-gray-100">{user?.rollNo}</span>
            </div>
            <div>
              <span className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Wallet Balance</span>
              <span className="block px-3 py-2 border rounded dark:bg-gray-800 dark:text-white bg-gray-100">₹{user?.walletBalance?.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave({ name, rollNo, password });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Roll Number</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">Close</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
