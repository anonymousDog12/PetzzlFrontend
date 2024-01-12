import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actions/auth";


const SettingsScreen = () => {
  const dispatch = useDispatch();

  // Function to handle log out
  const handleLogout = () => {
    console.log("logging out");
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default SettingsScreen;
