import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSecureAuth as useAuth } from '../../contexts/SecureAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TransactionsTable, { TransactionsTableRef } from '../../components/TransactionsTable';

const HistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const transactionsTableRef = useRef<TransactionsTableRef>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const renderHeader = () => (
    <View 
      className="pt-12 pb-6 px-6"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text
          style={{ color: colors.textPrimary }}
          className="text-xl font-bold"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Transaction History
        </Text>
        <View className="w-10" />
      </View>

      <View 
        className="rounded-2xl p-4 border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1 mr-3">
            <View 
              className="rounded-full p-2 mr-3"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <MaterialIcons
                name="history"
                size={20}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text 
                style={{ color: colors.textPrimary }} 
                className="font-semibold text-base"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Complete Transaction History
              </Text>
              <Text 
                style={{ color: colors.textSecondary }} 
                className="text-sm"
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                View all your transactions with detailed information
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex-row items-center px-3 py-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <MaterialIcons
              name={showAdvancedFilters ? "tune" : "filter-list"}
              size={16}
              color={colors.primary}
            />
            <Text 
              style={{ color: colors.primary }} 
              className="text-sm font-medium ml-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {showAdvancedFilters ? "Hide" : "Filters"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {showAdvancedFilters && (
          <View className="mt-4 p-3 rounded-xl border" style={{ borderColor: colors.border }}>
            <Text 
              style={{ color: colors.textPrimary }} 
              className="text-sm font-semibold mb-3"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Advanced Features
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <MaterialIcons name="search" size={16} color={colors.textSecondary} />
                <Text 
                  style={{ color: colors.textSecondary }} 
                  className="text-sm ml-2"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Search transactions by description
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="sort" size={16} color={colors.textSecondary} />
                <Text 
                  style={{ color: colors.textSecondary }} 
                  className="text-sm ml-2"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Sort by amount, date, or type
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="download" size={16} color={colors.textSecondary} />
                <Text 
                  style={{ color: colors.textSecondary }} 
                  className="text-sm ml-2"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Export transaction history
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="analytics" size={16} color={colors.textSecondary} />
                <Text 
                  style={{ color: colors.textSecondary }} 
                  className="text-sm ml-2"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  View spending analytics
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderStats = () => (
    <View className="px-6 mb-4">
      <View 
        className="rounded-2xl p-4 border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <Text 
          style={{ color: colors.textPrimary }} 
          className="text-lg font-bold mb-3"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Quick Stats
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <MaterialIcons name="trending-up" size={24} color={colors.success} />
            <Text 
              style={{ color: colors.success }} 
              className="text-sm font-semibold mt-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Income
            </Text>
            <Text 
              style={{ color: colors.textSecondary }} 
              className="text-xs"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              This month
            </Text>
          </View>
          <View className="items-center flex-1">
            <MaterialIcons name="trending-down" size={24} color={colors.error} />
            <Text 
              style={{ color: colors.error }} 
              className="text-sm font-semibold mt-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Expenses
            </Text>
            <Text 
              style={{ color: colors.textSecondary }} 
              className="text-xs"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              This month
            </Text>
          </View>
          <View className="items-center flex-1">
            <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
            <Text 
              style={{ color: colors.primary }} 
              className="text-sm font-semibold mt-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Balance
            </Text>
            <Text 
              style={{ color: colors.textSecondary }} 
              className="text-xs"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Current
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {renderHeader()}
      {renderStats()}
      
      <View className="flex-1">
        <TransactionsTable ref={transactionsTableRef} isPreview={false} />
      </View>
    </View>
  );
};

export default HistoryScreen; 