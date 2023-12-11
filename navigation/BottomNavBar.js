import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import DashboardScreen from "../screens/DashboardScreen";
import FeedScreen from "../screens/FeedScreen";
import LikerListScreen from "../screens/LikerListScreen";
import PostDetailScreen from "../screens/PostDetailScreen";


const Tab = createBottomTabNavigator();

const EmptyScreen = () => null;

const BottomNavBar = ({ initialRouteName }) => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator initialRouteName={initialRouteName}>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen
        name="NewPost"
        component={EmptyScreen} // This screen is just a trigger for the modal.
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("NewPostModal");
          },
        }}
      />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="PostDetailScreen" component={PostDetailScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="LikerListScreen" component={LikerListScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};

export default BottomNavBar;
