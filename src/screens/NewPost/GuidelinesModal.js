import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GuidelinesModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Petzzl Posting Guidelines </Text>
          <Text style={styles.modalText}>
            <Text style={styles.summary}>📸 Pet Photos Only:</Text> Share lovely moments with your pets {"\n\n"}
            <Text style={styles.summary}>😊 Be Kind:</Text> Let's keep our comments friendly and supportive{"\n\n"}
            <Text style={styles.summary}>🛡️ Privacy Matters:</Text> Please don't share personal info like addresses or phone numbers.{"\n\n"}
            <Text style={styles.summary}>🚫 No Ads Please:</Text> It's all about pets, not ads{"\n\n"}
            <Text style={styles.summary}>🧼 Keep it Clean:</Text> Let's keep everything appropriate and fun{"\n\n"}
            <Text style={styles.summary}>©️ Respect Copyright:</Text> Share what's yours or what you're allowed to{"\n\n"}
            <Text style={styles.summary}>🚩 Flag Concerns:</Text> See something that shouldn't be here? Let us know!{"\n\n"}
            <Text style={styles.summary}>🎉 Have Fun!</Text> Enjoy connecting with fellow pet lovers and their adorable companions!
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 15,
    textAlign: "left",
    color: "darkgrey",
  },
  summary: {
    color: "black",
  },
  closeButton: {
    backgroundColor: "#ffc02c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default GuidelinesModal;
