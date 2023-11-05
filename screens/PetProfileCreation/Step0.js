import React from "react";
import { Button, Text, View } from "react-native";


const Step0 = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to the Petzzl Family! Let's create your pet profile</Text>
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
