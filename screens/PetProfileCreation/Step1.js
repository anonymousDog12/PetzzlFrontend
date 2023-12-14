import React, { useState } from "react";
import { Button, KeyboardAvoidingView, Text, TextInput } from "react-native";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";
import PetProfileCreationStyles from "./PetProfileCreationStyles"; 

const Step1 = ({ navigation }) => {
  const [petName, setPetName] = useState("");
  const { petProfile, updateProfile } = usePetProfile();

  const handleContinue = () => {
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
        style={PetProfileCreationStyles.input} // Apply the common input style (if defined)
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

export default Step1;
