import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux"; // Import useSelector

const FeedScreen = () => {
  // Get the user data from Redux state
  const user = useSelector(state => state.auth.user);

  return (
    <View style={styles.container}>
      <Text>Hello {user ? user.first_name : "World"}!</Text>
      <Text>This is the feed screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FeedScreen;
