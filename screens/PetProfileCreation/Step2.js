import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { CONFIG } from "../../config";
import { PET_PAGE_CREATION_FIELD_NAMES, PET_TYPES } from "../../data/FieldNames";
import { usePetProfile } from "../../contexts/PetProfileContext";

const Step2 = ({ navigation }) => {
  const { petProfile, updateProfile } = usePetProfile();
  const [petId, setPetId] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const validatePetId = (id) => {
    const regex = /^[a-zA-Z0-9-]+$/;
    return id.length >= 3 && id.length <= 63 && regex.test(id);
  };

  const checkUniqueId = async () => {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/check_pet_id_uniqueness/${petId}/`, {
      method: 'GET',
    });

    const data = await response.json();
    return data.is_unique;
  };


  const handleContinue = async () => {
    if (validatePetId(petId)) {
      const isUnique = await checkUniqueId();
      if (isUnique) {
        setErrorMessage(null); // Clear any previous error messages
        updateProfile({ [PET_PAGE_CREATION_FIELD_NAMES.PET_ID]: petId });
        navigation.navigate('PetProfileCreationStep3');
      } else {
        setErrorMessage('Pet ID is already taken. Please choose another.');
      }
    } else {
      setErrorMessage('Pet ID must be 3-63 characters long and contain only alphanumeric characters or dashes.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Choose a unique identifier for {petProfile[PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]}</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => {
          setPetId(text);
          setErrorMessage(null);
        }}
        value={petId}
        placeholder="Enter your pet's name"
      />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <Button
        title="Continue"
        onPress={handleContinue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 200,
    marginTop: 10,
    padding: 10
  },
  errorText: {
    color: 'red',
    marginTop: 10
  }
});

export default Step2;