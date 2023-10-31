import React, { useState } from "react";
import { View, Text, Button, TextInput } from 'react-native';
import {usePetProfile} from "../../contexts/PetProfileContext";
import { PET_PAGE_CREATION_FIELD_NAMES } from "../../data/FieldNames";


const Step1 = ({ navigation }) => {
  const [petName, setPetName] = useState('');
  const { petProfile, updateProfile } = usePetProfile();

  const handleContinue = () => {
    updateProfile({ [PET_PAGE_CREATION_FIELD_NAMES.PET_NAME]: petName });
    navigation.navigate('PetProfileCreationStep2');
  };
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>What's your pet's name?</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: 200, marginTop: 10, padding: 10 }}
        onChangeText={text => setPetName(text)}
        value={petName}
        placeholder="Enter your pet's name"
      />
      <Button
        title="Continue"
        onPress={handleContinue}
      />
    </View>
  );
};

export default Step1;
