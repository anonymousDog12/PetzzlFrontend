import React, { useState } from "react";
import { Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from "react-native";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";


const Step1 = ({ navigation }) => {
  const [petName, setPetName] = useState("");
  const { petProfile, updateProfile } = usePetProfile();

  const handleContinue = () => {
    updateProfile({ [PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]: petName });
    navigation.navigate("PetProfileCreationStep2");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text style={styles.title}>What's your pet's name?</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setPetName(text)}
        value={petName}
        placeholder="Enter your pet's name"
      />
      <Button
        title="Continue"
        onPress={handleContinue}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: 200,
    marginTop: 10,
    padding: 10,
  },
});

export default Step1;
