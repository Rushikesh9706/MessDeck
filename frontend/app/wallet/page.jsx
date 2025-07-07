'use client';

import { useState, useEffect } from 'react';
import Navigation from "../../components/Navigation.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Alert, AlertDescription } from "../../components/ui/alert.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function WalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingFunds, setAddingFunds] = useState(false);
  const [error, setError] = useState('');
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/wallet', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletData(data);
      } else {
        setError('Failed to fetch wallet data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum amount per transaction is ₹10,000');
      return;
    }

    setAddingFunds(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`₹${amount} added to your wallet!`);
        setAddAmount('');
        fetchWalletData(); // Refresh wallet data
      } else {
        toast.error(result.error || 'Failed to add funds');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Error adding funds:', error);
    } finally {
      setAddingFunds(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <ProtectedRoute>
      {(user) => {
        const currentBalance = walletData?.currentBalance ?? user.walletBalance;
        const totalSpent = walletData?.transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) ?? 0;
        const totalBookings = walletData?.transactions?.filter(t => t.type === 'debit').length ?? 0;
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation user={user} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage your meal booking payments and balance.
                </p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Green Balance Card */}
                  <div className="rounded-2xl bg-gradient-to-r from-green-400 to-green-500 p-8 mb-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                    <div>
                      <div className="text-white text-lg font-semibold mb-1">Current Balance</div>
                      <div className="text-4xl font-extrabold text-white mb-2">₹{currentBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className="text-white text-sm mb-4">Available for meal bookings</div>
                      <Button className="bg-white text-green-600 font-bold px-6 py-2 rounded-lg shadow hover:bg-green-50" size="lg" onClick={() => setShowAddFundsModal(true)}>
                        + Add Money
                      </Button>
                    </div>
                    <div className="absolute top-6 right-6 bg-green-400 bg-opacity-30 rounded-full p-4">
                      <CreditCard className="h-8 w-8 text-white opacity-80" />
                    </div>
                  </div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="rounded-xl bg-white dark:bg-gray-900 p-6 flex items-center shadow border border-gray-200 dark:border-gray-700">
                      <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-3 mr-4">
                        <ArrowDownLeft className="h-6 w-6 text-red-500 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-medium mb-1">Total Spent</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">₹{totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">This month</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-gray-900 p-6 flex items-center shadow border border-gray-200 dark:border-gray-700">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3 mr-4">
                        <ArrowUpRight className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-medium mb-1">Total Bookings</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalBookings}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Confirmed meals</div>
                      </div>
                    </div>
                  </div>
                  {/* Recent Transactions */}
                  <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <span className="text-xl font-semibold text-gray-900 dark:text-white mr-2">Recent Transactions</span>
                    </div>
                    {error ? (
                      <Alert className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900">
                        <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
                      </Alert>
                    ) : walletData?.transactions && walletData.transactions.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {walletData.transactions.slice(0, 5).map((transaction) => (
                          <div
                            key={transaction._id}
                            className="flex items-center justify-between py-4"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === 'credit' 
                                  ? 'bg-green-100 dark:bg-green-900' 
                                  : 'bg-red-100 dark:bg-red-900'
                              }`}>
                                {transaction.type === 'credit' ? (
                                  <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium dark:text-white">{transaction.description}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(transaction.timestamp), 'PPp')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`font-bold text-lg ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <span className="mb-4">
                          <Wallet className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        </span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Your meal bookings will appear here</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {showAddFundsModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md relative">
                  {/* Close X icon */}
                  <button
                    onClick={() => setShowAddFundsModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900 group"
                    aria-label="Close"
                    type="button"
                  >
                    <X className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Money to Wallet</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-200">Quick Add</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {quickAmounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setAddAmount(amount.toString())}
                            className="text-sm"
                          >
                            ₹{amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="dark:text-gray-200">Custom Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        min="1"
                        max="10000"
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        await handleAddFunds();
                        setShowAddFundsModal(false);
                      }}
                      className="w-full"
                      disabled={addingFunds || !addAmount}
                    >
                      {addingFunds ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                        </>
                      ) : (
                        <> <CreditCard className="mr-2 h-4 w-4" /> Add ₹{addAmount || '0'} </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Secure payment processing • Maximum ₹10,000 per transaction
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </ProtectedRoute>
  );
}