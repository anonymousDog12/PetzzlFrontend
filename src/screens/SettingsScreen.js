import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actions/auth";


const SettingsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();


  // Function to handle log out
  const handleLogout = () => {
    console.log("logging out");
    dispatch(logout());
  };

  // Placeholder function for Blocking
  const handleBlocking = () => {
    navigation.navigate('BlockerList');
  };

  return (
    <View style={styles.container}>
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
