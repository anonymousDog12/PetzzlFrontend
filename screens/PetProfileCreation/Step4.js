import React from "react";
import { Button, Text, View } from "react-native";
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from "react-redux";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";
import { setHasPets, setNewPetProfile } from "../../redux/actions/petProfile";

const Step4 = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { petProfile } = usePetProfile();

  const navigateToDashboard = () => {
    dispatch(setHasPets(true));
    dispatch(setNewPetProfile(true))
  };


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome, {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}!</Text>
      <Button
        title="Continue"
        onPress={navigateToDashboard}
      />
    </View>
  );
};


export default Step4;
