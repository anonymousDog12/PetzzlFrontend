import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AddCaptionScreen from "../screens/NewPost/AddCaptionScreen";
import SelectMediaScreen from "../screens/NewPost/SelectMediaScreen";


const NewPostModalStack = createStackNavigator();

const NewPostModalNavigator = () => {
  return (
    <NewPostModalStack.Navigator options={{ headerShown: false }}>
      <NewPostModalStack.Screen name="SelectPhoto" component={SelectMediaScreen}
                                options={{
                                  headerShown: false,
                                }} />
      <NewPostModalStack.Screen name="AddCaption" component={AddCaptionScreen}
                                options={{
                                  headerShown: false,
                                }}/>
    </NewPostModalStack.Navigator>
  );
};

export default NewPostModalNavigator;
