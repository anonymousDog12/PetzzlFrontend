import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../../config";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES, PET_TYPE_DISPLAY, PET_TYPES } from "../../data/AppContants";
import PetProfileCreationStyles from "./PetProfileCreationStyles";


const Step3 = ({ navigation }) => {
  const { petProfile, updateProfile } = usePetProfile();
  const [petType, setPetType] = useState(PET_TYPES.DOG); // Default to 'dog'
  const [open, setOpen] = useState(false); // State for dropdown open/closed


  const handleContinue = async () => {
    const updatedProfile = {
      ...petProfile,
      [PET_PAGE_CREATION_FIELD_NAMES.PET_TYPE]: petType,
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

      // Navigate to Step 4 if POST request is successful
      if (response.ok) {
        const responseData = await response.json();
        const newPetId = responseData.pet_id; // Assuming 'pet_id' is the key in the response

        // Update the context with the new pet ID
        updateProfile({ ...updatedProfile, pet_id: newPetId });

        // Navigate to Step 4
        navigation.navigate("PetProfileCreationStep4", { newPetId });
      } else {
        // Handle server-side error
        console.log("Server returned an error:", await response.text());
      }
    } catch (error) {
      console.log("Network error:", error);
    }
  };


  return (
    <View style={PetProfileCreationStyles.containerReverse}>
      <Text style={PetProfileCreationStyles.mainTitleReverse}>
        What kind of pet is {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}?
      </Text>
      <DropDownPicker
        items={Object.values(PET_TYPES).map(type => ({ label: PET_TYPE_DISPLAY[type], value: type }))}
        open={open}
        setOpen={setOpen}
        value={petType}
        setValue={setPetType}
        containerStyle={PetProfileCreationStyles.dropdownContainer}
        style={PetProfileCreationStyles.dropdown}
        itemStyle={PetProfileCreationStyles.itemStyle}
      />
      <TouchableOpacity
        style={PetProfileCreationStyles.buttonReverse}
        onPress={handleContinue}
      >
        <Text style={PetProfileCreationStyles.buttonTextReverse}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};


export default Step3;
