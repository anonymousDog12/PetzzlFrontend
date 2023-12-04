import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
// Import other necessary components and libraries

const OtherUserDashboardScreen = ({ route }) => {

  const { otherPetId } = route.params;

  console.log(otherPetId)
  return (
    <View >
      <Text>Other user dashboard screen</Text>
    </View>
  );
};



export default OtherUserDashboardScreen;
