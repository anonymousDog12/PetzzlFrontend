import React from "react";
import { Button, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";
import { setHasPetsAndNavigate } from "../../redux/actions/petProfile";

const Step4 = ({ navigation }) => {
  const dispatch = useDispatch();
  const { petProfile } = usePetProfile();

  const continueToDashboard = () => {
    dispatch(setHasPetsAndNavigate(true, navigation))
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomNavBar', params: { screen: 'Dashboard' } }],
        });
      })
      .catch(error => {
        console.error('Navigation error:', error);
      });
  };



  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome, {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}!</Text>
      <Button
        title="Continue"
        onPress={continueToDashboard}
      />
    </View>
  );
};


export default Step4;
