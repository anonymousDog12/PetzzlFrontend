import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import { Button, KeyboardAvoidingView, Text, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { usePetProfile } from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";
import { setNewPetProfile } from "../../redux/actions/petProfile";
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


  const validatePetName = (name) => {
    if (name.length < 2 || name.length > 50) {
      return "Pet name must be between 2 and 50 characters.";
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      return "Pet name must be alphanumeric and may include spaces.";
    }
    return "";
  };

  const handleContinue = () => {
    const trimmedPetName = petName.trim().replace(/\s+/g, " ");

    const validationError = validatePetName(trimmedPetName);
    if (validationError) {
      setError(validationError);
      return;
    }
    updateProfile({ [PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]: trimmedPetName });
    navigation.navigate("PetProfileCreationStep2");
  };

  return (
    <KeyboardAvoidingView
      style={PetProfileCreationStyles.containerReverse}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text style={PetProfileCreationStyles.mainTitleReverse}>What's your pet's name?</Text>
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
