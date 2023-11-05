import React from "react";
import { Button, Text, View } from "react-native";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";


const Step4 = ({ navigation }) => {
  const { petProfile, updateProfile } = usePetProfile();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome, {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}! </Text>
      <Button
        title="Continue"
      />
    </View>
  );
};


export default Step4;
