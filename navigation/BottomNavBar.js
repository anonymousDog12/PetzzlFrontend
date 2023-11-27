import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import DashboardScreen from "../screens/DashboardScreen";
import FeedScreen from "../screens/FeedScreen";

const Tab = createBottomTabNavigator();

const EmptyScreen = () => null;

const BottomNavBar = ({ initialRouteName }) => {
  const navigation = useNavigation();


  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        // Remove the tabBarOnPress option as it's no longer needed here.
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen
        name="NewPost"
        component={EmptyScreen}  // This screen is just a trigger for the modal.
        listeners={{
          tabPress: (e) => {
            // Prevent default tab press behavior and navigate to the modal screen.
            e.preventDefault();
            navigation.navigate('NewPostModal');
          },
        }}
      />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavBar;
