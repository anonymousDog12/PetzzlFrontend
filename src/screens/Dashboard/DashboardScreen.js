import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  LogBox,
  Modal,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../../config";
import ImageCropper from "../../imageHandling/ImageCropper";
import { fetchPosts } from "../../redux/actions/dashboard";
import { setCurrentPetId, setNewPetProfile } from "../../redux/actions/petProfile";
import { capitalizeFirstLetter } from "../../utils/common";
import styles from "./DashboardScreenStyles";


LogBox.ignoreLogs(["Sending `onAnimatedValueUpdate` with no listeners registered."]);


const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const isNewPetProfile = useSelector(state => state.petProfile.isNewPetProfile);

  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState("Switch Profile");
  const [currentPetProfile, setCurrentPetProfile] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const posts = useSelector(state => state.dashboard.posts);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);


  const route = useRoute();
  const newPetIdFromStep4 = route.params?.newPetId;

  useEffect(() => {
    if (newPetIdFromStep4 && newPetIdFromStep4 !== currentPetId) {
      dispatch(setCurrentPetId(newPetIdFromStep4));
      fetchPetProfile(newPetIdFromStep4);
    }
  }, [newPetIdFromStep4, currentPetId, dispatch]);


  useEffect(() => {
    if (currentPetId) {
      dispatch(fetchPosts(currentPetId));
    }
  }, [currentPetId, dispatch]);

  // Function to handle pet profile selection
  const handleSelectPetProfile = async (petId, petName) => {
    try {
      await AsyncStorage.setItem("selectedPetId", petId);
      dispatch(setCurrentPetId(petId));
      setSelectedPetName(petName);
      fetchPetProfile(petId);
      setDropdownVisible(false);
    } catch (error) {
      console.error("Error storing selected pet ID:", error);
    }
  };


  useEffect(() => {
    const getStoredPetId = async () => {
      try {
        const storedPetId = await AsyncStorage.getItem("selectedPetId");
        if (storedPetId) {
          dispatch(setCurrentPetId(storedPetId));
          fetchPetProfile(storedPetId);
        }
      } catch (error) {
        console.error("Error retrieving stored pet ID:", error);
      }
    };

    getStoredPetId();
  }, [dispatch]);


  const modalY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  // Reset modalY to 0 when dropdownVisible becomes true
  useEffect(() => {
    if (dropdownVisible) {
      modalY.setValue(0);
    }
  }, [dropdownVisible]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const newY = Math.max(-5, gestureState.dy);
      modalY.setValue(newY);
    },
    onPanResponderRelease: (e, { dy }) => {
      if (dy > 50) {
        Animated.spring(modalY, {
          toValue: screenHeight, // Corrected to use the screenHeight variable
          useNativeDriver: true,
          bounciness: 5,
          speed: 12,
        }).start(() => setDropdownVisible(false));
      } else {
        Animated.spring(modalY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 5,
          speed: 12,
        }).start();
      }
    },
  })).current;


  const takePhoto = () => {
    setShowActionSheet(false); // Close the action sheet before opening the camera

    const options = {
      mediaType: "photo",
      quality: 1,
      includeBase64: false,
    };

    // Wait for the modal to close before launching the camera
    requestAnimationFrame(() => {
      launchCamera(options, response => {
        if (response.didCancel) {
          console.log("User cancelled camera");
        } else if (response.error) {
          console.log("Camera Error: ", response.error);
        } else if (!response.assets || response.assets.length === 0) {
          console.log("No photo returned");
        } else {
          const file = response.assets[0];
          console.log("Captured file: ", file);

          if (file && file.uri) {
            ImageCropper.openCropper(file.uri, currentPetId, () => {
              fetchPetProfile(currentPetId); // Re-fetch the profile data after successful upload
            });
          } else {
            console.log("Error: Captured file URI is undefined");
          }
        }
      });
    });
  };

  useEffect(() => {
    if (isNewPetProfile) {
      navigation.navigate("PetProfileCreationStep1", { comingFromDashboard: true });
      setDropdownVisible(false);

    }
  }, [isNewPetProfile, navigation]);


  // Updated handleAddNewPet function
  const handleAddNewPet = () => {
    dispatch(setNewPetProfile(true));
  };


  const handleProfilePicUpdate = () => {
    setShowActionSheet(true);
  };


  const chooseFromLibrary = () => {
    setShowActionSheet(false);
    const options = { mediaType: "photo", quality: 1 };
    requestAnimationFrame(() => {
      launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else if (response.customButton) {
          console.log("User tapped custom button: ", response.customButton);
        } else {
          const file = response.assets && response.assets[0];
          console.log("Selected file: ", file);
          ImageCropper.openCropper(file.uri, currentPetId, () => fetchPetProfile(currentPetId));
        }
      });
    });
  };


  const fetchPetProfile = async (petId) => {
    if (!petId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/`);
      const data = await response.json();
      const cacheBustedImageUrl = data.profile_pic_thumbnail_small
        ? `${data.profile_pic_thumbnail_small}?cb=${new Date().getTime()}`
        : null;
      setCurrentPetProfile({
        ...data,
        profile_pic_thumbnail_small: cacheBustedImageUrl,
      });
      setSelectedPetName(data.pet_name);
    } catch (error) {
      console.error("Failed to fetch individual pet profile", error);
    } finally {
      setIsLoading(false); // Stop loading once fetching is done or failed
    }
  };


  useEffect(() => {
    fetchPetProfile();
  }, [currentPetId]);


// In DashboardScreen
  useEffect(() => {
    const fetchPetProfiles = async () => {
      if (user) {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`);
          const data = await response.json();
          setPetProfiles(data);
          if (data.length > 0) {
            const storedPetId = await AsyncStorage.getItem("selectedPetId");
            const initialPetId = storedPetId || data[0].pet_id;
            dispatch(setCurrentPetId(initialPetId));
            fetchPetProfile(initialPetId);
          }
        } catch (error) {
          console.error("Failed to fetch pet profiles", error);
        }
      }
    };

    return navigation.addListener("focus", fetchPetProfiles);
  }, [user, navigation, dispatch]);


  const handlePostSelect = (postId, petProfile) => {
    navigation.navigate("PostDetailScreen", { postId: postId, petProfile: petProfile });
  };


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}
                          style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.dropdownButton}>{selectedPetName}</Text>
          <Icon name="caret-down" size={20} color="#ffc02c" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <Icon
          name="settings-outline"
          size={30}
          onPress={() => navigation.navigate("Settings")}
          style={{ marginRight: 10 }}
        />
      ),
    });
  }, [navigation, dropdownVisible, selectedPetName]);


  return (
    <View style={styles.container}>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffc02c" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <Modal
            animationType="slide"
            transparent={true}
            visible={dropdownVisible}
            onRequestClose={() => setDropdownVisible(!dropdownVisible)}
          >
            <TouchableOpacity
              style={styles.fullScreenButton}
              activeOpacity={1}
              onPressOut={() => setDropdownVisible(false)}
            >
              <Animated.View
                style={[styles.sliderContainer, { transform: [{ translateY: modalY }] }]} {...panResponder.panHandlers}>
                <View style={styles.sliderHandle} />
                {petProfiles.map((pet, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleSelectPetProfile(pet.pet_id, pet.pet_name)}
                  >
                    <Text style={currentPetId === pet.pet_id ? styles.selectedPetName : null}>{pet.pet_name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={handleAddNewPet}
                  style={styles.addNewPetButton}
                >
                  <Text style={styles.addNewPetText}>Add a New Pet</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Modal>


          {currentPetProfile && (
            <View style={styles.petProfile}>
              <TouchableOpacity onPress={handleProfilePicUpdate} style={styles.profilePicContainer}>
                {currentPetProfile.profile_pic_thumbnail_small ? (
                  <Image
                    source={{ uri: currentPetProfile.profile_pic_thumbnail_small }}
                    style={styles.profilePic}
                  />
                ) : (
                  <View style={styles.cameraIconContainer}>
                    <Icon name="camera" size={50} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.petInfo}>
                <Text style={styles.petId}>@{currentPetProfile.pet_id}</Text>
                <Text style={styles.petName}>{currentPetProfile.pet_name}</Text>
                <Text style={styles.petType}>{capitalizeFirstLetter(currentPetProfile.pet_type)}</Text>
              </View>
            </View>
          )}


          <Modal
            animationType="slide"
            transparent={true}
            visible={showActionSheet}
            onRequestClose={() => setShowActionSheet(false)}
          >
            <TouchableOpacity
              style={styles.actionSheetBackground}
              onPress={() => setShowActionSheet(false)}
            >
              <View style={styles.actionSheet}>
                {/* Action sheet options here */}
                <TouchableOpacity
                  style={styles.actionSheetButton}
                  onPress={() => {
                    setShowActionSheet(false);
                    takePhoto();
                  }}
                >
                  <Text style={styles.actionSheetText}>Take Photo...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionSheetButton}
                  onPress={() => {
                    setShowActionSheet(false);
                    chooseFromLibrary();
                  }}
                >
                  <Text style={styles.actionSheetText}>Choose from Library...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionSheetButton}
                  onPress={() => setShowActionSheet(false)}
                >
                  <Text style={styles.actionSheetText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
          <FlatList
            data={posts}
            numColumns={3} // Set the number of columns
            keyExtractor={item => item.post_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.postItem}
                onPress={() => handlePostSelect(item.post_id, currentPetProfile)}
              >
                <Image
                  source={{ uri: item.thumbnail_url || item.thumbnail_small_url }}
                  style={styles.postThumbnail}
                />
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
};

export default DashboardScreen;