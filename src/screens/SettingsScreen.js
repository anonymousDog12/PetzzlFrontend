import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SecureStorage from "react-native-secure-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { CONFIG } from "../../config";
import { logout } from "../redux/actions/auth";


const SettingsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isDeleting, setIsDeleting] = useState(false);


  // Function to handle log out
  const handleLogout = () => {
    console.log("logging out");
    dispatch(logout());
  };

  const handleBlocking = () => {
    navigation.navigate("BlockerList");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Are you sure?",
      "This will delete ALL your pet profiles and posts. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log("Attempting to delete account");
              // Call your API endpoint to delete the account
              const accessToken = await SecureStorage.getItem("access");
              if (!accessToken) {
                console.error("JWT token not found");
                return;
              }

              const response = await fetch(`${CONFIG.BACKEND_URL}/api/accounts/delete-account/`, {
                method: "DELETE",
                headers: {
                  "Authorization": `JWT ${accessToken}`,
                },
              });

              if (response.status === 204) {
                console.log("Account successfully deleted");
                // Cleanup local storage and secure storage
                await SecureStorage.removeItem("access");
                await SecureStorage.removeItem("refresh");
                await AsyncStorage.clear(); // Caution: This clears everything in AsyncStorage

                // Dispatch the reset state action to reset redux state
                dispatch({ type: "RESET_STATE" });

                // Navigate to signup or welcome screen with a reset navigation stack
                navigation.reset({
                  index: 0,
                  routes: [{ name: "SignUp" }],
                });
              } else {
                // If the response status is not 204, handle it accordingly
                console.error("Unexpected response status:", response.status);
                Alert.alert("Error", "An unexpected error occurred. Please try again.");
              }
              setIsDeleting(false);
            } catch (err) {
              console.error("Failed to delete account", err);
              Alert.alert("Error", "Failed to delete the account. Please try again.");
              setIsDeleting(false);
            }
          },
          style: "destructive",
        },
      ],
    );
  };


  return (
    <View style={styles.container}>
      {isDeleting ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color="#ffc02c" />
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.menuItem} onPress={handleBlocking}>
            <Ionicons name="ban-outline" size={24} color="black" style={styles.icon} />
            <Text style={styles.menuText}>Blocked Accounts</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="black" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="red" style={styles.icon} />
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Ionicons name="chevron-forward-outline" size={24} color="transparent" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-bin-outline" size={24} color="red" style={styles.icon} />
            <Text style={[styles.menuText, styles.logoutText]}>Delete Account</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Ionicons name="chevron-forward-outline" size={24} color="transparent" />
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 20,
    backgroundColor: "white",
  },
  activityIndicatorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    backgroundColor: "white",
  },
  icon: {
    marginRight: 10,
  },
  arrowIcon: {
    marginLeft: "auto", // This will push the arrow to the right
  },
  menuText: {
    fontSize: 18,
    color: "black",
    flex: 1, // This will allow the text to take up as much space as possible
  },
  logoutText: {
    color: "red",
  },
});

export default SettingsScreen;
