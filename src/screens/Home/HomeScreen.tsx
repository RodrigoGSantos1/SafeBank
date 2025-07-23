import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useSecureAuth as useAuth } from "../../contexts/SecureAuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils";
import { TransactionsTable, StatsCard, TransactionsTableRef, NotificationBadge } from "../../components";
import { useRefresh, useFinancialStats, useAnimations } from "../../hooks";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { user, userProfile, signOut, refreshUserProfile } = useAuth();
  const { unreadCount, syncNotifications } = useNotifications();
  const { isDark, colors, toggleTheme } = useTheme();
  const { isRefreshing, onRefresh } = useRefresh();
  const transactionsTableRef = useRef<TransactionsTableRef>(null);
  const { stats, isLoading: statsLoading, refreshStats } = useFinancialStats(user?.id);
  const { animateIn, animateCard, animateButton } = useAnimations();

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to sign out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await signOut();
            if (!result.success) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const formatTime = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      icon: "send",
      title: "Transfer",
      subtitle: "Send money",
      color: colors.primary,
      bgColor: "bg-primary",
      route: "Transfer",
    },
    {
      icon: "download",
      title: "Deposit",
      subtitle: "Add funds",
      color: colors.success,
      bgColor: "bg-green-500",
      route: "Deposit",
    },
    {
      icon: "people",
      title: "Recipients",
      subtitle: "Select contacts",
      color: colors.info,
      bgColor: "bg-blue-500",
      route: "Users",
    },
    {
      icon: "history",
      title: "Transaction History",
      subtitle: "View all transactions",
      color: colors.warning,
      bgColor: "bg-orange-500",
      route: "History",
    },
  ];

  const handleRefresh = () => {
    return onRefresh(async () => {
      await refreshUserProfile();
      await refreshStats();
      
      if (transactionsTableRef.current) {
        await transactionsTableRef.current.refreshTransactions();
      }
    });
  };

  useEffect(() => {
    refreshUserProfile();
    
    if (user?.id) {
      syncNotifications(user.id);
    }

    animateIn();
  }, [user?.id]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.background}
          title="Pull to refresh..."
          titleColor={colors.primary}
        />
      }
    >
      <View className="relative">
        <View 
          className="absolute inset-0" 
          style={{ 
            backgroundColor: isDark 
              ? `rgba(254, 115, 89, 0.2)` 
              : `rgba(254, 115, 89, 0.1)` 
          }} 
        />

        <View className="pt-12 pb-8 px-6">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View 
                className="rounded-full p-3 mr-3"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <MaterialIcons name="account-circle" size={24} color={colors.primary} />
              </View>
              <View>
                <Text 
                  style={{ color: colors.textSecondary }} 
                  className="text-sm"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatTime()},
                </Text>
                <Text 
                  style={{ color: colors.textPrimary }} 
                  className="text-lg font-semibold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {user?.name?.split(" ")[0] || "User"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-2">
              <TouchableOpacity 
                className="rounded-full p-3 relative"
                style={{ backgroundColor: `${colors.textPrimary}10` }}
                onPress={() => navigation.navigate('Notifications')}
              >
                <MaterialIcons
                  name="notifications-none"
                  size={22}
                  color={colors.textPrimary}
                />
                <NotificationBadge size="small" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="rounded-full p-3"
                style={{ backgroundColor: `${colors.textPrimary}10` }}
                onPress={toggleTheme}
              >
                <MaterialIcons
                  name={isDark ? "light-mode" : "dark-mode"}
                  size={22}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                className="rounded-full p-3"
                style={{ backgroundColor: `${colors.textPrimary}10` }}
              >
                <MaterialIcons
                  name="account-circle"
                  size={22}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View 
            className="rounded-3xl p-6 border"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border
            }}
          >
            <View className="items-center">
              <Text 
                style={{ color: colors.textSecondary }} 
                className="text-sm font-medium mb-2"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Available Balance
              </Text>
              <Text 
                style={{ color: colors.textPrimary }} 
                className="text-4xl font-bold mb-1"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {formatCurrency(userProfile?.balance || 0)}
              </Text>
              <View className="flex-row items-center mt-2">
                <MaterialIcons name="trending-up" size={16} color={colors.success} />
                <Text 
                  style={{ color: colors.success }} 
                  className="text-sm ml-1 font-medium"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  +2.5% this month
                </Text>
              </View>
            </View>

            <View className="flex-row mt-6 space-x-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={() =>
                  navigation.navigate("Transfer", { type: "transfer" })
                }
              >
                <MaterialIcons name="north-east" size={20} color="white" />
                <Text className="text-white text-sm font-semibold mt-1">
                  Transfer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center"
                style={{ backgroundColor: `${colors.textPrimary}20` }}
                onPress={() =>
                  navigation.navigate("Transfer", { type: "deposit" })
                }
              >
                <MaterialIcons name="south-west" size={20} color={colors.textPrimary} />
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold mt-1">
                  Deposit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View 
        className="flex-1 rounded-t-3xl pt-6"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
      >
        <View className="px-6 mb-6">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mb-4">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => {
              const isLastCard = index === quickActions.length - 1;
              const isOddNumberOfCards = quickActions.length % 2 === 1;
              const shouldBeFullWidth = isLastCard && isOddNumberOfCards;
              
              return (
                <TouchableOpacity
                  key={index}
                  className={`${shouldBeFullWidth ? 'w-full' : 'w-[48%]'} rounded-2xl p-4 mb-3 border`}
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }}
                  onPress={() => {
                    if (action.route === "Transfer") {
                      navigation.navigate("Transfer", { type: "transfer" });
                    } else if (action.route === "Deposit") {
                      navigation.navigate("Transfer", { type: "deposit" });
                    } else if (action.route === "Users") {
                      navigation.navigate("Users");
                    } else {
                      navigation.navigate(action.route);
                    }
                  }}
                >
                  <View
                    className="rounded-full p-3 w-12 h-12 items-center justify-center mb-3"
                    style={{ backgroundColor: action.color }}
                  >
                    <MaterialIcons
                      name={action.icon as any}
                      size={22}
                      color="white"
                    />
                  </View>
                  <Text 
                    style={{ color: colors.textPrimary }} 
                    className="font-semibold text-base"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {action.title}
                  </Text>
                  <Text 
                    style={{ color: colors.textSecondary }} 
                    className="text-sm"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text 
              style={{ color: colors.textPrimary }} 
              className="text-lg font-bold flex-1 mr-3"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('History')}
              className="flex-row items-center px-3 py-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <MaterialIcons name="history" size={16} color={colors.primary} />
              <Text 
                style={{ color: colors.primary }} 
                className="text-sm font-medium ml-1"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <TransactionsTable ref={transactionsTableRef} isPreview={true} maxItems={5} />
        </View>

        <View className="px-6 mb-8">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mb-4">
            Financial Overview
          </Text>
          {statsLoading ? (
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <View 
                  className="rounded-2xl p-4 border"
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View 
                      className="rounded-full p-2 w-10 h-10 items-center justify-center"
                      style={{ backgroundColor: colors.success }}
                    >
                      <MaterialIcons name="trending-up" size={18} color="white" />
                    </View>
                    <View 
                      className="w-16 h-4 rounded animate-pulse"
                      style={{ backgroundColor: colors.border }}
                    />
                  </View>
                  <View 
                    className="w-20 h-3 rounded mb-1 animate-pulse"
                    style={{ backgroundColor: colors.border }}
                  />
                  <View 
                    className="w-24 h-6 rounded animate-pulse"
                    style={{ backgroundColor: colors.border }}
                  />
                </View>
              </View>

              <View className="flex-1">
                <View 
                  className="rounded-2xl p-4 border"
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View 
                      className="rounded-full p-2 w-10 h-10 items-center justify-center"
                      style={{ backgroundColor: colors.error }}
                    >
                      <MaterialIcons name="trending-down" size={18} color="white" />
                    </View>
                    <View 
                      className="w-16 h-4 rounded animate-pulse"
                      style={{ backgroundColor: colors.border }}
                    />
                  </View>
                  <View 
                    className="w-20 h-3 rounded mb-1 animate-pulse"
                    style={{ backgroundColor: colors.border }}
                  />
                  <View 
                    className="w-24 h-6 rounded animate-pulse"
                    style={{ backgroundColor: colors.border }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <StatsCard
                    icon="trending-up"
                    title="Income"
                    value={stats.formattedIncome}
                    change={stats.incomeChange}
                    changeType={stats.incomeChange.includes('+') ? 'positive' : 'negative'}
                    color={colors.success}
                  />
                </View>

                <View className="flex-1">
                  <StatsCard
                    icon="trending-down"
                    title="Expenses"
                    value={stats.formattedExpenses}
                    change={stats.expensesChange}
                    changeType={stats.expensesChange.includes('+') ? 'negative' : 'positive'}
                    color={colors.error}
                  />
                </View>
              </View>

              <View className="w-full">
                <StatsCard
                  icon="account-balance-wallet"
                  title="Net Income"
                  value={stats.formattedNetIncome}
                  change={(() => {
                    const total = stats.income + stats.expenses;
                    if (total === 0) return '+0%';
                    const percentage = (stats.netIncome / total) * 100;
                    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
                  })()}
                  changeType={stats.netIncome >= 0 ? 'positive' : 'negative'}
                  color={colors.info}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
