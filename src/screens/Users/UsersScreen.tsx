import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSecureAuth as useAuth } from "../../contexts/SecureAuthContext";
import { getAllUsers, UserProfile } from "../../services/firebase/firestore";
import { useRefresh } from "../../hooks";

interface UsersScreenProps {
  navigation: any;
  route?: any;
}

const UsersScreen: React.FC<UsersScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isRefreshing, onRefresh } = useRefresh();

  const { returnScreen } = route?.params || { returnScreen: null };

  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await getAllUsers(user?.id);
      setUsers(allUsers);
    } catch (error) {
      throw error;
    }
  }, [user?.id]);

  const handleRefresh = () => {
    return onRefresh(loadUsers);
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        await loadUsers();
      } catch (error) {
        Alert.alert("Error", "Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [loadUsers]);

  const handleUserSelect = (selectedUser: UserProfile) => {
    if (returnScreen === "Transfer") {
      navigation.navigate("Transfer", {
        type: "transfer",
        selectedUser: selectedUser,
      });
    } else {
      navigation.navigate("Transfer", {
        type: "transfer",
        selectedUser: selectedUser,
      });
    }
  };

  const generateAvatar = (name: string) => {
    const colors = [
      "#FE7359",
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
      "#FF9800",
      "#E91E63",
    ];
    const nameIndex = name.charCodeAt(0) % colors.length;
    return colors[nameIndex];
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      className="bg-white/10 rounded-2xl p-4 mb-3 border border-white/10 flex-row items-center"
      onPress={() => handleUserSelect(item)}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: generateAvatar(item.name) }}
      >
        <Text className="text-white font-bold text-lg">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{item.name}</Text>
        <Text className="text-white/60 text-sm">{item.email}</Text>
      </View>

      <MaterialIcons
        name="arrow-forward-ios"
        size={20}
        color="rgba(255,255,255,0.6)"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE7359" />
          <Text className="text-white text-lg mt-4">Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold">Select Recipient</Text>

          <TouchableOpacity
            onPress={handleRefresh}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Users List */}
        <View className="flex-1 px-6 pt-4">
          {users.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <MaterialIcons
                name="people-outline"
                size={80}
                color="rgba(255,255,255,0.3)"
              />
              <Text className="text-white/60 text-lg text-center mt-4">
                No users available for transfer
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-primary rounded-xl px-6 py-3 mt-4"
              >
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-white/60 text-sm mb-4">
                {users.length} user{users.length !== 1 ? "s" : ""} available
              </Text>

              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#FE7359"
                    colors={["#FE7359"]}
                    progressBackgroundColor="#ffffff"
                    title="Loading users..."
                    titleColor="#FE7359"
                  />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UsersScreen;
