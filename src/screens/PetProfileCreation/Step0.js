import React from "react";
import { Button, Text, View } from "react-native";
import PetProfileCreationStyles from "./PetProfileCreationStyles"; // Import the styles

const Step0 = ({ navigation }) => {
  return (
    <View style={PetProfileCreationStyles.container}>
      <Text style={PetProfileCreationStyles.mainTitle}>Welcome to the Petzzl Family!</Text>
      <Text style={PetProfileCreationStyles.subTitle}>Create your pet's profile and connect with fellow animal
        lovers.</Text>
      <Button
        title="Continue"
        onPress={() => {
          navigation.navigate("PetProfileCreationStep1");
        }}
      />
    </View>
  );
};

export default Step0;
