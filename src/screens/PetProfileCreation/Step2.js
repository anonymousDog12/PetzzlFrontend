import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../../config";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/AppContants";
import PetProfileCreationStyles from "./PetProfileCreationStyles";


const Step2 = ({ navigation }) => {
  const { petProfile, updateProfile } = usePetProfile();
  const [petId, setPetId] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const validatePetId = (id) => {
    const regex = /^[a-zA-Z0-9-]+$/;
    return id.length >= 3 && id.length <= 63 && regex.test(id);
  };

  const checkUniqueId = async () => {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/check_pet_id_uniqueness/${petId}/`, {
      method: "GET",
    });

    const data = await response.json();
    return data.is_unique;
  };

  const handleContinue = async () => {
    if (validatePetId(petId)) {
      const isUnique = await checkUniqueId();
      if (isUnique) {
        setErrorMessage(null);

        const updatedProfile = {
          ...petProfile,
          [PET_PAGE_CREATION_FIELD_NAMES.PET_ID]: petId,
          [PET_PAGE_CREATION_FIELD_NAMES.PET_TYPE]: "dog",
        };

        // console.log("posting to database....");
        // console.log("Pet Profile:", updatedProfile);

        // Retrieve JWT token from secure storage
        const token = await SecureStorage.getItem("access");

        try {
          // Send POST request to save the pet profile
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `JWT ${token}`,
            },
            body: JSON.stringify(updatedProfile),
          });

          if (response.ok) {
            const responseData = await response.json();
            const newPetId = responseData.pet_id;
            updateProfile({ ...updatedProfile, pet_id: newPetId });
            navigation.navigate("PetProfileCreationStep3", { newPetId });
          } else {
            console.log("Server returned an error:", await response.text());
          }
        } catch (error) {
          console.log("Network error:", error);
        }
      } else {
        setErrorMessage("Pet ID is already taken. Please choose another.");
      }
    } else {
      setErrorMessage("Pet ID must be 3-63 characters long and contain only alphanumeric characters or dashes.");
    }
  };
  return (
    <KeyboardAvoidingView
      style={PetProfileCreationStyles.containerReverse}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text style={PetProfileCreationStyles.mainTitleReverse}>
        Choose a unique ID for {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}
      </Text>
      <Text style={PetProfileCreationStyles.subTitleReverse}>
        IDs can include letters, numbers, and dashes
      </Text>
      <TextInput
        style={PetProfileCreationStyles.input}
        onChangeText={text => {
          setPetId(text);
          setErrorMessage(null);
        }}
        value={petId}
        placeholder="Enter your identifier"
      />
      {errorMessage && <Text style={PetProfileCreationStyles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity
        style={PetProfileCreationStyles.buttonReverse}
        onPress={handleContinue}
      >
        <Text style={PetProfileCreationStyles.buttonTextReverse}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default Step2;
