import React from "react";
import { StyleSheet, Text, View, Button } from "react-native"; // Import Button component
import { useSelector } from "react-redux";

const SettingsScreen = () => {
  // Get the user data from Redux state
  const user = useSelector(state => state.auth.user);

  // Function to handle log out
  const handleLogout = () => {
    console.log("logging out");
    // Here you will later add the logic for actual logout
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      {/* Add a Button for logging out */}
      <Button
        title="Log Out"
        onPress={handleLogout} // Set the onPress to the handleLogout function
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Add some padding for aesthetics
  },
});

export default SettingsScreen;
