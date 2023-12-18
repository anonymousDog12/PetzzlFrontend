import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Button, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";
import { setHasPetsAndNavigate } from "../../redux/actions/petProfile";
import PetProfileCreationStyles from "./PetProfileCreationStyles";


const Step4 = ({ navigation, route }) => {
  const { newPetId } = route.params;
  const dispatch = useDispatch();
  const { petProfile } = usePetProfile();

  const continueToDashboard = async () => {
    try {
      if (newPetId) {
        await AsyncStorage.setItem("selectedPetId", newPetId);
      }
      dispatch(setHasPetsAndNavigate(true, navigation, false))
        .then(() => {
          navigation.navigate("Dashboard");
        })
        .catch(error => {
          console.error("Navigation error:", error);
        });
    } catch (error) {
      console.error("Error storing new pet ID:", error);
    }
  };


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={PetProfileCreationStyles.mainTitle}>
        Welcome, {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}!
      </Text>
      {newPetId &&
      <Text style={PetProfileCreationStyles.subTitle}>
        Your new pet ID is: {newPetId}
      </Text>}
      <Button
        title="Let's Go!"
        onPress={continueToDashboard}
      />
    </View>
  );
};


export default Step4;