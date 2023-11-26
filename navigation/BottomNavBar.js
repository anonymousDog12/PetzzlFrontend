import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import FeedScreen from "../screens/FeedScreen";
import DashboardScreen from "../screens/DashboardScreen";
import NewPostNavigator from './NewPostNavigator'; // Imported NewPostNavigator

const Tab = createBottomTabNavigator();

const BottomNavBar = ({ initialRouteName }) => {
  return (
    <Tab.Navigator initialRouteName={initialRouteName}>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="NewPost" component={NewPostNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavBar;
