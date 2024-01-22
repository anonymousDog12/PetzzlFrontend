import React from "react";
import { Text, View, TouchableOpacity } from "react-native"; // Import TouchableOpacity
import PetProfileCreationStyles from "./PetProfileCreationStyles";

const Step0 = ({ navigation }) => {
  return (
    <View style={PetProfileCreationStyles.container}>
      <Text style={PetProfileCreationStyles.mainTitle}>Welcome to DogDomain! </Text>
      <Text style={PetProfileCreationStyles.subTitle}>
        Create your dog's profile and connect with fellow dog parents
      </Text>
      <TouchableOpacity
        style={PetProfileCreationStyles.button}
        onPress={() => {
          navigation.navigate("PetProfileCreationStep1");
        }}
      >
        <Text style={PetProfileCreationStyles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step0;
