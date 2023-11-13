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
    // First, update the Redux state to indicate that the user has pets and
    // a new pet profile has been created
    dispatch(setHasPets(true));
    dispatch(setNewPetProfile(false));

    // Use a timeout to allow the state update to propagate
    setTimeout(() => {
      // Now perform the navigation
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'BottomNavBar',
            params: {
              screen: 'Dashboard', // Specify the screen within the BottomNavBar
            },
          },
        ],
      });
    }, 0); // Timeout with 0 to push the action to the end of the event queue
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
