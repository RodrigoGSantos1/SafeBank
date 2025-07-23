import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatCurrency } from "../utils";
import { getUserTransactions, Transaction } from "../services";
import { useSecureAuth as useAuth } from "../contexts/SecureAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useRefresh } from "../hooks";

export interface TransactionsTableRef {
  refreshTransactions: () => Promise<void>;
}

interface TransactionsTableProps {
  isPreview?: boolean;
  maxItems?: number;
}

const TransactionsTable = forwardRef<TransactionsTableRef, TransactionsTableProps>((props, ref) => {
  const { isPreview = false, maxItems = 5 } = props;
  const { userProfile } = useAuth();
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'transfer' | 'deposit' | 'withdraw'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { isRefreshing, onRefresh } = useRefresh({ showAlertOnError: false });
  const lastUpdateRef = useRef<number>(0);

  const fetchTransactions = useCallback(async () => {
    if (!userProfile?.id) {
      setTransactions([]);
      setFilteredTransactions([]);
      return;
    }
    
    try {
      const userTransactions = await getUserTransactions(userProfile.id);
      setTransactions(userTransactions || []);
      setFilteredTransactions(userTransactions || []);
      lastUpdateRef.current = Date.now();
    } catch (error) {
      setTransactions([]);
      setFilteredTransactions([]);
      throw error;
    }
  }, [userProfile?.id]);

  useImperativeHandle(ref, () => ({
    refreshTransactions: fetchTransactions
  }), [fetchTransactions]);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      
      if (userProfile?.id && timeSinceLastUpdate > 2000) {
        fetchTransactions();
      }
    }, [userProfile?.id, fetchTransactions])
  );

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      try {
        await fetchTransactions();
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
  }, [fetchTransactions]);

  const handleRefresh = () => {
    return onRefresh(fetchTransactions);
  };

  const applyFilters = useCallback(() => {
    let filtered = transactions;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.type === selectedFilter);
    }

    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        filtered = filtered.filter(t => {
          const today = new Date();
          const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt as any);
          return transactionDate.toDateString() === today.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => {
          const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt as any);
          return transactionDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => {
          const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt as any);
          return transactionDate >= monthAgo;
        });
        break;
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedFilter, selectedPeriod]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'arrow-downward';
      case 'payment':
        return 'shopping-cart';
      case 'transfer':
        return 'swap-horiz';
      case 'withdrawal':
        return 'atm';
      default:
        return 'payment';
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return colors.success;
    
    switch (type) {
      case 'payment':
        return colors.error;
      case 'transfer':
        return colors.primary;
      case 'withdrawal':
        return colors.warning;
      case 'deposit':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'cancelled':
        return 'error';
      default:
        return 'help';
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit'
      });
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    if (!userProfile?.id) return 'Transaction';
    
    switch (transaction.type) {
      case 'transfer':
        if (transaction.amount < 0) {
          return 'Transfer Sent';
        } else {
          return 'Transfer Received';
        }
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdrawal';
      default:
        return 'Transaction';
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (!userProfile?.id) return transaction.description || '';
    
    if (transaction.description && !transaction.description.includes('Transfer to') && !transaction.description.includes('Deposit')) {
      return transaction.description;
    }
    
    switch (transaction.type) {
      case 'transfer':
        if (transaction.amount < 0) {
          return `Sent to recipient`;
        } else {
          return `Received from sender`;
        }
      case 'deposit':
        return `Deposit to your account`;
      default:
        return transaction.description || 'Transaction';
    }
  };

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: Transaction[] } = {};
    let itemCount = 0;
    
    filteredTransactions.forEach(transaction => {
      if (isPreview && itemCount >= maxItems) {
        return;
      }
      
      const dateKey = formatDate(transaction.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
      itemCount++;
    });
    
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  const calculateTotals = () => {
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses };
  };

  const { income, expenses } = calculateTotals();

  const renderFilters = () => (
    <View className="px-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text style={{ color: colors.textPrimary }} className="text-lg font-bold">
          Filters
        </Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center"
        >
          <MaterialIcons
            name={showFilters ? "expand-less" : "expand-more"}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={{ color: colors.textSecondary }} className="text-sm ml-1">
            {showFilters ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="space-y-4">
          {/* Filter by Type */}
          <View>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
              Transaction Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: 'list' },
                { key: 'transfer', label: 'Transfers', icon: 'swap-horiz' },
                { key: 'deposit', label: 'Deposits', icon: 'trending-up' },
                { key: 'withdraw', label: 'Withdrawals', icon: 'trending-down' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key as any)}
                  className={`px-3 py-2 rounded-lg border flex-row items-center flex-shrink-0 ${
                    selectedFilter === filter.key ? 'border-primary' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: selectedFilter === filter.key ? colors.primary : colors.card,
                    borderColor: selectedFilter === filter.key ? colors.primary : colors.border,
                  }}
                >
                  <MaterialIcons
                    name={filter.icon as any}
                    size={14}
                    color={selectedFilter === filter.key ? 'white' : colors.textSecondary}
                  />
                  <Text
                    style={{
                      color: selectedFilter === filter.key ? 'white' : colors.textPrimary,
                    }}
                    className="text-sm font-medium ml-1"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filter by Period */}
          <View>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
              Time Period
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Time', icon: 'schedule' },
                { key: 'today', label: 'Today', icon: 'today' },
                { key: 'week', label: 'This Week', icon: 'date-range' },
                { key: 'month', label: 'This Month', icon: 'calendar-month' },
              ].map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key as any)}
                  className={`px-3 py-2 rounded-lg border flex-row items-center flex-shrink-0 ${
                    selectedPeriod === period.key ? 'border-primary' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: selectedPeriod === period.key ? colors.primary : colors.card,
                    borderColor: selectedPeriod === period.key ? colors.primary : colors.border,
                  }}
                >
                  <MaterialIcons
                    name={period.icon as any}
                    size={14}
                    color={selectedPeriod === period.key ? 'white' : colors.textSecondary}
                  />
                  <Text
                    style={{
                      color: selectedPeriod === period.key ? 'white' : colors.textPrimary,
                    }}
                    className="text-sm font-medium ml-1"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View 
            className="rounded-xl p-3 border"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs">
                  Filtered Results
                </Text>
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  {filteredTransactions.length} transactions
                </Text>
              </View>
              <View className="items-end">
                <Text style={{ color: colors.success }} className="text-xs">
                  +{formatCurrency(income)}
                </Text>
                <Text style={{ color: colors.error }} className="text-xs">
                  -{formatCurrency(expenses)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary }} className="text-center mt-4">
            Loading transactions...
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
              title="Updating transactions..."
              titleColor={colors.primary}
            />
          }
        >
          {!isPreview && renderFilters()}
          
          {Object.entries(groupedTransactions).map(([dateKey, dayTransactions], dayIndex) => (
          <View key={`${dateKey}-${dayIndex}`} className="mb-4">
            <View className="flex-row items-center mb-3 px-4">
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
                {dateKey}
              </Text>
              <View className="flex-1 h-px ml-3" style={{ backgroundColor: colors.border }} />
            </View>

            {dayTransactions.map((transaction, index) => (
              <TouchableOpacity
                key={`${transaction.id}-${dayIndex}-${index}`}
                className="mx-4 mb-3 rounded-xl border"
                style={{ 
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }}
                onPress={() => {
                  Alert.alert(
                    'Transaction Details',
                    `Type: ${transaction.type}\nAmount: ${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\nStatus: ${transaction.status}\nDate: ${formatDate(transaction.createdAt)}`,
                    [{ text: 'OK' }]
                  );
                }}
              >
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="rounded-full p-3 mr-4"
                      style={{ backgroundColor: getTransactionColor(transaction.type, transaction.amount) }}
                    >
                      <MaterialIcons 
                        name={getTransactionIcon(transaction.type) as any} 
                        size={20} 
                        color="white" 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <Text 
                        style={{ color: colors.textPrimary }} 
                        className="font-semibold text-base mb-1"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {getTransactionTitle(transaction)}
                      </Text>
                      <Text 
                        style={{ color: colors.textSecondary }} 
                        className="text-sm"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {getTransactionDescription(transaction)}
                      </Text>
                      
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons
                          name={getStatusIcon(transaction.status) as any}
                          size={12}
                          color={getStatusColor(transaction.status)}
                        />
                        <Text 
                          style={{ color: getStatusColor(transaction.status) }}
                          className="text-xs font-medium ml-1"
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {getStatusText(transaction.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end ml-4 flex-shrink-0">
                    <Text 
                      style={{ 
                        color: transaction.amount > 0 ? colors.success : colors.error
                      }}
                      className="font-bold text-base"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                    
                    {dateKey === 'Today' && (
                      <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
                        {formatDate(transaction.createdAt).includes(':') ? 
                          formatDate(transaction.createdAt) :
                          (transaction.createdAt?.toDate ? 
                            transaction.createdAt.toDate() : 
                            new Date()
                          ).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        }
                      </Text>
                    )}
                  </View>

                  <View className="ml-3">
                    <MaterialIcons 
                      name="chevron-right" 
                      size={18} 
                      color={colors.textSecondary} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

          {filteredTransactions.length === 0 && (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }} className="text-center mt-4">
                {transactions.length === 0 ? 'No transactions found' : 'No transactions match your filters'}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-center text-sm mt-2">
                {transactions.length === 0 ? 'Your transactions will appear here' : 'Try adjusting your filters'}
              </Text>
            </View>
          )}

          {isPreview && transactions.length > maxItems && (
            <View className="mx-4 mt-4 p-4 rounded-xl border items-center"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border
              }}
            >
              <MaterialIcons name="more-horiz" size={24} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-2">
                {transactions.length - maxItems} more transactions
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
                Tap "View All" to see complete history
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
});

export default TransactionsTable;
