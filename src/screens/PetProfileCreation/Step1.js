import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import { Button, KeyboardAvoidingView, Text, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/AppContants";
import { setNewPetProfile } from "../../redux/actions/petProfile";
import { validatePetName } from "../../utils/common";
import PetProfileCreationStyles from "./PetProfileCreationStyles";


const Step1 = () => {
  const [petName, setPetName] = useState("");
  const [error, setError] = useState("");
  const { petProfile, updateProfile } = usePetProfile();

  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const comingFromDashboard = route.params?.comingFromDashboard || false;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        comingFromDashboard ? (
          <TouchableOpacity onPress={() => dispatch(setNewPetProfile(false))}>
            <Icon style={PetProfileCreationStyles.cancelButton} name="close" />

          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, comingFromDashboard]);

  const handleContinue = () => {
    const validationResult = validatePetName(petName);

    if (validationResult.error) {
      setError(validationResult.error);
      return;
    }

    updateProfile({ [PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]: validationResult.validName });
    navigation.navigate("PetProfileCreationStep2");
  };

  return (
    <KeyboardAvoidingView
      style={PetProfileCreationStyles.containerReverse}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text style={PetProfileCreationStyles.mainTitleReverse}>What's your dog's name?</Text>
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
      <TouchableOpacity
        style={PetProfileCreationStyles.buttonReverse}
        onPress={handleContinue}
      >
        <Text style={PetProfileCreationStyles.buttonTextReverse}>Continue</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default Step1;
