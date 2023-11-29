import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SelectMediaScreen from '../screens/NewPost/SelectMediaScreen';
import AddCaptionScreen from '../screens/NewPost/AddCaptionScreen';

const NewPostModalStack = createStackNavigator();

const NewPostModalNavigator = () => {
  return (
    <NewPostModalStack.Navigator screenOptions={{ headerShown: false }}>
      <NewPostModalStack.Screen name="SelectPhoto" component={SelectMediaScreen} />
      <NewPostModalStack.Screen name="AddCaption" component={AddCaptionScreen} />
    </NewPostModalStack.Navigator>
  );
};

export default NewPostModalNavigator;
