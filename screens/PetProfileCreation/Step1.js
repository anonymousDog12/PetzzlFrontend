import React, { useState } from "react";
import { Button, KeyboardAvoidingView, Text, TextInput } from "react-native";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";
import PetProfileCreationStyles from "./PetProfileCreationStyles";


const Step1 = ({ navigation }) => {
  const [petName, setPetName] = useState("");
  const [error, setError] = useState("");
  const { petProfile, updateProfile } = usePetProfile();

  const validatePetName = (name) => {
    if (name.length < 2 || name.length > 50) {
      return "Pet name must be between 2 and 50 characters.";
    }
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      return "Pet name must be alphanumeric only.";
    }
    return "";
  };

  const handleContinue = () => {
    const validationError = validatePetName(petName);
    if (validationError) {
      setError(validationError);
      return;
    }
    updateProfile({ [PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]: petName });
    navigation.navigate("PetProfileCreationStep2");
  };

  return (
    <KeyboardAvoidingView
      style={PetProfileCreationStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text style={PetProfileCreationStyles.mainTitle}>What's your pet's name?</Text>
      <TextInput
        style={PetProfileCreationStyles.input}
        onChangeText={text => {
          setError("");
          setPetName(text);
        }}
        value={petName}
        placeholder="Enter your pet's name"
      />
      {error ? <Text style={PetProfileCreationStyles.errorText}>{error}</Text> : null}
      <Button
        title="Continue"
        onPress={handleContinue}
      />
    </KeyboardAvoidingView>
  );
};

export default Step1;
