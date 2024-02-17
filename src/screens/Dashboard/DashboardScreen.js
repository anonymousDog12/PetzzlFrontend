import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, LogBox, Text, TouchableOpacity, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Ionicon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../../config";
import EmptyDashboardPostList from "../../components/EmptyDashboardPostList";
import SliderModal from "../../components/SliderModal";
import { DEFAULT_PROFILE_PICS } from "../../data/AppContants";
import ImageCropper from "../../imageHandling/ImageCropper";
import { fetchPosts } from "../../redux/actions/dashboard";
import { setCurrentPetId, setNewPetProfile } from "../../redux/actions/petProfile";
import { RESET_DASHBOARD_POSTS } from "../../redux/types";
import { getGenderText } from "../../utils/common";
import styles from "./DashboardScreenStyles";


LogBox.ignoreLogs(["Sending `onAnimatedValueUpdate` with no listeners registered."]);

// TODO: Considering refactor to redux further

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
      dispatch({ type: RESET_DASHBOARD_POSTS });
      dispatch(setCurrentPetId(petId));
      setSelectedPetName(petName);
      fetchPetProfile(petId);
      setDropdownVisible(false);
      dispatch(fetchPosts(petId));
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


  const takePhoto = () => {
    setShowActionSheet(false); // Close the action sheet before opening the camera

    const options = {
      mediaType: "photo",
      quality: 1,
      includeBase64: false,
    };

    requestAnimationFrame(() => {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera");
          // Optionally handle the cancellation case here
        } else if (response.error) {
          console.log("Camera Error: ", response.error);
        } else {
          const file = response.assets && response.assets[0];
          if (file && file.uri) {
            ImageCropper.openCropper(file.uri, currentPetId, () => {
              fetchPetProfile(currentPetId); // Re-fetch the profile data after successful upload
            });
          } else {
            console.log("Error: No photo returned or URI is undefined");
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
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
          // Optionally handle the cancellation case here
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const file = response.assets && response.assets[0];
          if (file && file.uri) {
            ImageCropper.openCropper(file.uri, currentPetId, () => fetchPetProfile(currentPetId));
          } else {
            console.log("Error: No photo returned or URI is undefined");
          }
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

  const renderPost = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => handlePostSelect(item.post_id, currentPetProfile)}
      >
        <Image
          source={{ uri: item.thumbnail_url || item.thumbnail_small_url }}
          style={styles.postThumbnail}
        />
        {item.has_multiple_images && (
          <Ionicon
            name="copy-outline"
            style={[styles.iconStyle, styles.coverIcon]}
          />
        )}
        {item.post_type === "video" && (
          <Ionicon
            name="film-outline"
            style={[styles.iconStyle, styles.coverIcon]}
          />
        )}
      </TouchableOpacity>
    );
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}
                          style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.dropdownButton}>{selectedPetName}</Text>
          <Ionicon name="caret-down" size={20} color="#ffc02c" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <Ionicon
            name="pencil-outline"
            size={30}
            style={{ marginRight: 10 }}
            onPress={() => navigation.navigate("EditPetProfile", { petId: currentPetId })}
          />
          <Ionicon
            name="settings-outline"
            size={30}
            onPress={() => navigation.navigate("Settings")}
            style={{ marginRight: 10 }}
          />
        </View>
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
          <SliderModal
            dropdownVisible={dropdownVisible}
            setDropdownVisible={setDropdownVisible}
          >
            {petProfiles.map((pet, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleSelectPetProfile(pet.pet_id, pet.pet_name)}
              >
                <Image
                  source={{ uri: pet.profile_pic_regular || DEFAULT_PROFILE_PICS[pet.pet_type] }}
                  style={styles.dropdownProfilePic}
                />
                <Text style={currentPetId === pet.pet_id ? styles.selectedPetName : styles.unSelectedPetName}>
                  {pet.pet_name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={handleAddNewPet}
              style={styles.addNewPetButton}
            >
              <Ionicon name="add-circle-outline" size={30} color="#ffc02c" />
              <Text style={styles.addNewPetText}>Add a New Pet</Text>
            </TouchableOpacity>
          </SliderModal>

          {currentPetProfile && (
            <View style={styles.petProfile}>
              <TouchableOpacity onPress={handleProfilePicUpdate} style={styles.profilePicContainer}>
                {currentPetProfile.profile_pic_regular ? (
                  <Image
                    source={{ uri: currentPetProfile.profile_pic_regular }}
                    style={styles.profilePic}
                  />
                ) : (
                  <View style={styles.cameraIconContainer}>
                    <Ionicon name="camera" size={50} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.petInfo}>
                <Text style={styles.petId}>@{currentPetProfile.pet_id}</Text>
                <Text style={styles.petName}>{currentPetProfile.pet_name}</Text>
                <Text style={styles.petName}>{getGenderText(currentPetProfile.gender)}</Text>
              </View>
            </View>
          )}


          <SliderModal
            dropdownVisible={showActionSheet}
            setDropdownVisible={setShowActionSheet}
          >
            {/* Contents of the action sheet modal */}
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
          </SliderModal>
          <FlatList
            data={posts}
            numColumns={3}
            keyExtractor={item => item.post_id.toString()}
            renderItem={renderPost}
            ListEmptyComponent={<EmptyDashboardPostList />}
          />
        </>
      )}
    </View>
  );
};

export default DashboardScreen;
