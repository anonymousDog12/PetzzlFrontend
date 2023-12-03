import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../config";
import ImageCropper from "../imageHandling/ImageCropper";
import { setCurrentPetId } from "../redux/actions/petProfile";
import { fetchPosts, addPost } from "../redux/actions/dashboard";


const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState("Switch Profile");
  const [currentPetProfile, setCurrentPetProfile] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const posts = useSelector(state => state.dashboard.posts);
  const dispatch = useDispatch();


  useEffect(() => {
    if (currentPetId) {
      dispatch(fetchPosts(currentPetId));
    }
  }, [currentPetId, dispatch]);

  // Function to handle pet profile selection
  const handleSelectPetProfile = (petId, petName) => {
    dispatch(setCurrentPetId(petId));
    setSelectedPetName(petName);
    fetchPetProfile(petId);
    setDropdownVisible(false);
  };

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


  const fetchPetProfile = async () => {
    if (!currentPetId) return;
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${currentPetId}/`);
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
    }
  };



  useEffect(() => {
    fetchPetProfile();
  }, [currentPetId]);



  useEffect(() => {
    const fetchPetProfiles = async () => {
      if (user) {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`);
          const data = await response.json();
          setPetProfiles(data);
          if (data.length > 0 && !currentPetId) {
            dispatch(setCurrentPetId(data[0].pet_id));
          }
        } catch (error) {
          console.error("Failed to fetch pet profiles", error);
        }
      }
    };
    fetchPetProfiles();
  }, [user, dispatch]);

  // New function to handle post click
  // Inside DashboardScreen, where you handle navigation to PostDetailScreen
  const handlePostSelect = (postId, petProfile) => {
    navigation.navigate('PostDetailScreen', { postId: postId, petProfile: petProfile });
  };




  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <Text style={styles.dropdownButton}>{selectedPetName}</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(!dropdownVisible)}
      >
        <View style={styles.dropdownContainer}>
          {petProfiles.map((pet, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => handleSelectPetProfile(pet.pet_id, pet.pet_name)}
            >
              <Text>{pet.pet_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {currentPetProfile && (
        <FlatList
          data={[currentPetProfile]}
          keyExtractor={item => item.pet_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.petProfile}>
              <TouchableOpacity onPress={handleProfilePicUpdate}>
                {item.profile_pic_thumbnail_small ? (
                  <Image
                    source={{ uri: item.profile_pic_thumbnail_small }}
                    style={styles.profilePic}
                  />
                ) : (
                  <View style={styles.cameraIconContainer}>
                    <Icon name="camera" size={50} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
              <Text>Pet Name: {item.pet_name}</Text>
              <Text>Pet Type: {item.pet_type}</Text>
            </View>
          )}
        />
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
      {/* Posts rendering */}
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

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  petProfile: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: "lightgrey",
    borderRadius: 5,
  },
  dropdownButton: {
    marginLeft: 10,
    fontSize: 18,
    color: "blue",
  },
  dropdownContainer: {
    position: "absolute",
    top: 50, // Adjust this value as needed
    left: 10,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
  cameraIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A9A9A9", // Dark grey background
    alignItems: "center", // Center the icon horizontally
    justifyContent: "center", // Center the icon vertically
    marginRight: 10,
  },
  actionSheetBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionSheetButton: {
    padding: 16,
    alignItems: "center",
  },
  actionSheetText: {
    fontSize: 18,
    color: "blue",
  },
  postItem: {
    flex: 1 / 3, // Each item will take up 1/3 of the container's width
    aspectRatio: 1, // Keep the aspect ratio of each item to 1:1
    padding: 2, // Adjust padding as necessary
  },
  postThumbnail: {
    width: '100%', // Take up all available width
    height: '100%', // Take up all available height
    borderRadius: 5, // Adjust as necessary
  },
});

export default DashboardScreen;
