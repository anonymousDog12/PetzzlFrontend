import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavBar from './BottomNavBar';
import NewPostModalNavigator from './NewPostModalNavigator'; // Import this navigator

const RootStack = createStackNavigator();

const RootNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          // Custom animation for initial modal presentation
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-layouts.screen.width, 0], // Slide from left
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <RootStack.Screen name="Tabs" component={BottomNavBar} />
      <RootStack.Screen name="NewPostModal" component={NewPostModalNavigator} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
