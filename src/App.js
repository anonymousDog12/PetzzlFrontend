import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Provider } from "react-redux";
import { CONFIG } from "../config";
import { PetProfileProvider } from "./contexts/PetProfileContext";
import RootNavigator from "./navigation/RootNavigator";
import { loadTokens, refreshToken } from "./redux/actions/auth";
import { setCurrentPetId } from "./redux/actions/petProfile";
import store from "./redux/store";
import { getProfilePic } from "./utils/common";


enableScreens();

const AppInitializer = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {

      // Consider saving last selected ID into DB instead of async storage
      const storedPetId = await AsyncStorage.getItem("selectedPetId");
      if (storedPetId) {
        try {
          const response = await axios.get(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${storedPetId}/`);
          if (response.status === 200) {
            const profilePicThumbnailSmall = getProfilePic(response.data.profile_pic_thumbnail_small, response.data.pet_type);
            // Dispatch pet ID and profile picture URL to Redux
            store.dispatch(setCurrentPetId(storedPetId, profilePicThumbnailSmall));
          }
        } catch (error) {
          console.error("Error fetching pet profile picture:", error);
          // If the fetch fails, still set the pet ID in Redux (without profile picture URL)
          store.dispatch(setCurrentPetId(storedPetId));
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ffc02c" />
      </View>
    );
  }

  return <RootNavigator />;
};

const App = () => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    store.dispatch(loadTokens())
      .then(() => setIsAuthChecked(true))
      .catch((error) => console.error("Error during authentication check:", error));

    // Set up a timer to refresh the token periodically
    const tokenRefreshInterval = setInterval(() => {
      store.dispatch(refreshToken());
    }, 82800000);

    return () => clearInterval(tokenRefreshInterval); // Clear interval on component unmount
  }, []);

  if (!isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ffc02c" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PetProfileProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppInitializer />
          </NavigationContainer>
        </SafeAreaProvider>
      </PetProfileProvider>
    </Provider>
  );
};

export default App;
