import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSecureAuth as useAuth } from "../../contexts/SecureAuthContext";
import { useNotificationActions } from "../../hooks";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatCurrency } from "../../utils";
import { MoneyInput } from "../../components";
import { createTransactionWithBalanceUpdate, createTransferBetweenUsers } from "../../services/firebase/firestore";
import NotificationSyncService from "../../services/notificationsSync";

const TransactionScreen = ({ navigation, route }: any) => {
  const { userProfile, refreshUserProfile, user } = useAuth();
  const { notifyTransaction } = useNotificationActions();
  const { syncNotifications } = useNotifications();
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { type, selectedUser } = route.params || { type: "transfer", selectedUser: null };

  const quickAmounts = [50, 100, 200, 500, 800, 1000];

  const generateAvatar = (name: string) => {
    const colors = ["#FE7359", "#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#E91E63"];
    const nameIndex = name.charCodeAt(0) % colors.length;
    return colors[nameIndex];
  };

  const handleTransaction = async () => {
    if (!userProfile?.id || amount <= 0) return;

    if (amount > (userProfile?.balance || 0)) {
      Alert.alert("Insufficient Balance", "You don't have enough balance for this transaction.");
      return;
    }

    if (type === "transfer") {
      if (!selectedUser) {
        Alert.alert("Select Recipient", "You must select a recipient for the transfer.", [
          {
            text: "Select Recipient",
            onPress: () => navigation.navigate("Users", { returnScreen: "Transfer" })
          },
          { text: "Cancel" }
        ]);
        return;
      }

      if (selectedUser.id === userProfile.id) {
        Alert.alert("Invalid Transfer", "You cannot transfer money to yourself. Use deposit instead.");
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;

      if (type === "transfer") {
        const description = `Transfer to ${selectedUser.name}`;
        result = await createTransferBetweenUsers(
          userProfile.id,
          selectedUser.id,
          amount,
          description
        );
      } else {
        result = await createTransactionWithBalanceUpdate(userProfile.id, {
          amount: amount,
          type: "deposit",
          toUserId: userProfile.id,
          fromUserId: userProfile.id,
          description: `Deposit - $${amount.toFixed(2)}`,
          status: "completed",
        });
      }

      if (!result.success) {
        Alert.alert("Transaction Failed", result.message || "Unknown error occurred");
        await notifyTransaction('failed', amount, userProfile?.name, selectedUser?.name);
        return;
      }

      await refreshUserProfile();

      if (type === "transfer") {
        await notifyTransaction('sent', amount, userProfile?.name, selectedUser?.name);
      } else {
        await notifyTransaction('received', amount, userProfile?.name, userProfile?.name);
      }

      if (user?.id) {
        await syncNotifications();
        if (selectedUser?.id) {
          setTimeout(async () => {
            try {
              const syncService = NotificationSyncService.getInstance();
              await syncService.syncNotificationsFromFirestore(selectedUser.id, () => {});
            } catch (error) {
              console.error('Erro ao sincronizar notificações do destinatário:', error);
            }
          }, 1000);
        }
      }

      const successMessage = type === "transfer" 
        ? `Transfer of $${amount.toFixed(2)} sent to ${selectedUser.name} successfully!`
        : `Deposit of $${amount.toFixed(2)} completed successfully!`;

      Alert.alert(
        "Transaction Successful!", 
        successMessage,
        [
          {
            text: "OK",
            onPress: () => {
              setAmount(0);
              navigation.navigate('Home');
            }
          }
        ]
      );

    } catch (error) {
      console.error("Transaction error:", error);
      Alert.alert(
        "Transaction Failed", 
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    if (type === "transfer" && !selectedUser) {
      Alert.alert("Select Recipient First", "Please select a recipient before choosing an amount.", [
        {
          text: "Select Recipient",
          onPress: () => navigation.navigate("Users", { returnScreen: "Transfer" })
        },
        { text: "Cancel" }
      ]);
      return;
    }
    setAmount(amount);
  };

  const config = {
    transfer: {
      title: "Transfer Money",
      question: selectedUser ? `How much do you want to send to ${selectedUser.name}?` : "Select a recipient first",
      buttonText: "Send Money",
      buttonIcon: "send",
      amountLabel: "Transfer Amount",
      requiresRecipient: true,
      showRecipientSection: true,
    },
    deposit: {
      title: "Deposit Funds",
      question: "How much do you want to deposit to your account?",
      buttonText: "Deposit Money", 
      buttonIcon: "add",
      amountLabel: "Deposit Amount",
      requiresRecipient: false,
      showRecipientSection: false,
    },
  };

  const currentConfig = config[type as keyof typeof config] || config.transfer;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        <View className="relative pt-12 pb-6">
          <View className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <View className="flex-row items-center justify-between px-6">
            <TouchableOpacity
              className="p-2 -ml-2 w-1/3"
              onPress={() => navigation.navigate('Home')}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold w-1/3 text-center">
              {currentConfig.title}
            </Text>
            <View className="w-1/3" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mb-6">
            <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <Text className="text-white/70 text-sm font-medium mb-1">
                Available Balance
              </Text>
              <Text className="text-white text-3xl font-bold">
                {formatCurrency(userProfile?.balance || 0)}
              </Text>
            </View>
          </View>

          <View className="px-6 mb-8">
            <Text className="text-white text-xl font-bold mb-6">
              {currentConfig.question}
            </Text>

            {currentConfig.showRecipientSection && (
              <View className="mb-6">
                {selectedUser ? (
                  <View className="bg-white/10 rounded-2xl p-4 border border-white/10 flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: generateAvatar(selectedUser.name) }}
                    >
                      <Text className="text-white font-bold text-lg">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base">
                        Sending to: {selectedUser.name}
                      </Text>
                      <Text className="text-white/60 text-sm">{selectedUser.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Users", { returnScreen: "Transfer" })}
                      className="p-2"
                    >
                      <MaterialIcons name="edit" size={20} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="bg-white/10 rounded-2xl p-4 border border-white/10 border-dashed flex-row items-center justify-center"
                    onPress={() => navigation.navigate("Users", { returnScreen: "Transfer" })}
                  >
                    <MaterialIcons name="person-add" size={24} color="rgba(255,255,255,0.6)" />
                    <Text className="text-white/60 text-base ml-3 font-medium">
                      Select Recipient
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-4">
              <Text className="text-white/70 text-sm mb-3">
                {currentConfig.amountLabel}
              </Text>
              <MoneyInput
                value={amount}
                onValueChange={setAmount}
                placeholder="0.00"
                textClassName="text-white text-5xl font-bold"
                containerClassName="flex-row items-center"
              />
              {amount > 0 && (
                <Text
                  className={`text-xs mt-3 ${
                    amount > (userProfile?.balance || 0)
                      ? "text-red-400"
                      : currentConfig.requiresRecipient && !selectedUser
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {amount > (userProfile?.balance || 0)
                    ? "⚠️ Amount exceeds available balance"
                    : currentConfig.requiresRecipient && !selectedUser
                    ? "⚠️ Select a recipient first"
                    : type === "transfer"
                    ? `✓ Ready to send to ${selectedUser?.name}`
                    : "✓ Ready to deposit"}
                </Text>
              )}
            </View>

            <Text className="text-white/70 text-sm mb-3">Quick amounts</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row space-x-3"
            >
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => handleQuickAmount(quickAmount)}
                  className={`flex-row bg-white/10 rounded-xl px-2 py-1 justify-center items-center border ${
                    amount === quickAmount
                      ? "border-primary bg-primary/20"
                      : "border-white/20"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      amount === quickAmount ? "text-primary" : "text-white"
                    }`}
                  >
                    {formatCurrency(quickAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View className="px-6 pb-8 pt-4 bg-background border-t border-white/10">
          <TouchableOpacity
            className={`rounded-2xl p-4 w-full flex-row items-center justify-center ${
              amount > 0 &&
              amount <= (userProfile?.balance || 0) &&
              (!currentConfig.requiresRecipient || selectedUser) &&
              !isLoading
                ? "bg-primary shadow-lg shadow-primary/30"
                : "bg-gray-600"
            }`}
            disabled={
              amount <= 0 ||
              amount > (userProfile?.balance || 0) ||
              (currentConfig.requiresRecipient && !selectedUser) ||
              isLoading
            }
            onPress={handleTransaction}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            ) : (
              <MaterialIcons
                name={currentConfig.buttonIcon as any}
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
            )}
            <Text className="text-white text-base font-bold">
              {isLoading ? "Processing..." : currentConfig.buttonText}
            </Text>
          </TouchableOpacity>

          <Text className="text-white/50 text-xs text-center mt-3">
            {isLoading
              ? "Processing transaction..."
              : amount <= 0
              ? "Enter amount to continue"
              : amount > (userProfile?.balance || 0)
              ? "Insufficient balance"
              : currentConfig.requiresRecipient && !selectedUser
              ? "Select a recipient first"
              : type === "transfer"
              ? `Tap to send $${amount.toFixed(2)} to ${selectedUser?.name}`
              : `Tap to deposit $${amount.toFixed(2)} to your account`}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TransactionScreen;
