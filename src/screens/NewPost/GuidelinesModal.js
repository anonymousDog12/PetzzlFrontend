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
          <Text style={styles.modalTitle}>DogDomain Posting Guidelines </Text>
          <Text style={styles.modalText}>
            <Text style={styles.summary}>🐶 Dog Photos Only:</Text>
            Share adorable snapshots of your canine companions {"\n\n"}

            <Text style={styles.summary}>🐾 Pawsitive Vibes:</Text>
            Let's keep our comments friendly and supportive{"\n\n"}

            <Text style={styles.summary}>🛡️ Privacy Matters:</Text>
            Please don't share personal info like addresses or phone numbers.{"\n\n"}

            <Text style={styles.summary}>🚫 No Ads Please:</Text>
            It's all about our furry friends, not ads{"\n\n"}

            <Text style={styles.summary}>🧼 Keep it Clean:</Text>
            Let's keep everything appropriate and fun{"\n\n"}

            <Text style={styles.summary}>©️ Respect Copyright:</Text>
            Share what's yours or what you're allowed to{"\n\n"}

            <Text style={styles.summary}>🚩 Flag Concerns:</Text>
            See something that shouldn't be here? Let us know!{"\n\n"}

            <Text style={styles.summary}>🎉 Enjoy the Bark!</Text>
            Enjoy connecting with fellow dog parents and their adorable companions!
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
