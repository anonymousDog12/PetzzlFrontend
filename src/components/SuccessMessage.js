import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SuccessMessage = ({ message }) => {
  return (
    <View style={styles.successMessageContainer}>
      <Ionicons name="checkmark-circle-outline" size={24} color="green" />
      <Text style={styles.successMessageText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  successMessageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#dafed6",
    borderWidth: 1,
    borderColor: "#a5d6a7",
    borderRadius: 5,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  successMessageText: {
    fontSize: 16,
    color: "#388e3c",
    marginLeft: 10,
  },
});

export default SuccessMessage;
