import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../config";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES, PET_TYPES } from "../../data/FieldNames";


const Step3 = ({ navigation }) => {
  const { petProfile, updateProfile } = usePetProfile();
  const [petType, setPetType] = useState(PET_TYPES.DOG); // Default to 'dog'
  const [open, setOpen] = useState(false); // State for dropdown open/closed


  const handleContinue = async () => {
    const updatedProfile = {
      ...petProfile,
      [PET_PAGE_CREATION_FIELD_NAMES.PET_TYPE]: petType,
    };

    console.log("posting to database....");
    console.log("Pet Profile:", updatedProfile);

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
        updateProfile(updatedProfile);
        navigation.navigate("PetProfileCreationStep4");
      } else {
        // Handle server-side error
        console.log("Server returned an error:", await response.text());
      }
    } catch (error) {
      // Handle network error
      console.log("Network error:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>What kind of pet is {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}?</Text>
      <DropDownPicker
        items={Object.values(PET_TYPES).map(type => ({ label: type, value: type }))}
        open={open}
        setOpen={setOpen}
        value={petType}
        setValue={setPetType}
        containerStyle={{ height: 40, width: 150 }}
        style={{ backgroundColor: "#fafafa" }}
        itemStyle={{
          justifyContent: "flex-start",
        }}
        dropDownStyle={{ backgroundColor: "#fafafa" }}
      />
      <Button
        title="Continue"
        onPress={handleContinue}
      />
    </View>
  );
};

export default Step3;
