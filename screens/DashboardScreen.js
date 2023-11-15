import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { CONFIG } from "../config";
import ImageCropper from "../imageHandling/ImageCropper";
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';


const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState("Switch Profile");
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [currentPetProfile, setCurrentPetProfile] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const takePhoto = () => {
    setShowActionSheet(false); // Close the action sheet before opening the camera

    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    };

    // Wait for the modal to close before launching the camera
    requestAnimationFrame(() => {
      launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          console.log('Camera Error: ', response.error);
        } else if (!response.assets || response.assets.length === 0) {
          console.log('No photo returned');
        } else {
          const file = response.assets[0];
          console.log('Captured file: ', file);

          if (file && file.uri) {
            ImageCropper.openCropper(file.uri, selectedPetId, () => {
              fetchPetProfile(selectedPetId); // Re-fetch the profile data after successful upload
            });
          } else {
            console.log('Error: Captured file URI is undefined');
          }
        }
      });
    });
  };


  const handleProfilePicUpdate = () => {
    setShowActionSheet(true);
  };


  const chooseFromLibrary = () => {
    setShowActionSheet(false); // Close the action sheet before opening the library

    const options = {
      mediaType: "photo",
      quality: 1,
    };

    // Wait for the modal to close before launching the image library
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

          ImageCropper.openCropper(file.uri, selectedPetId, () => {
            fetchPetProfile(selectedPetId); // Re-fetch the profile data after successful upload
          });
        }
      });
    });
  };


  const fetchPetProfile = async (petId) => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/`);
      const data = await response.json();
      // Only append the cache busting query if the URL is not null
      const profilePicUrl = data.profile_pic_thumbnail_small ? `${data.profile_pic_thumbnail_small}?${new Date().getTime()}` : null;
      setCurrentPetProfile({
        ...data,
        profile_pic_thumbnail_small: profilePicUrl,
      });
    } catch (error) {
      console.error("Failed to fetch individual pet profile", error);
    }
  };


  useEffect(() => {
    const fetchPetProfiles = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`);
        const data = await response.json();
        setPetProfiles(data);
        if (data.length > 0) {
          const defaultPetId = data[0].pet_id;
          setSelectedPetName(data[0].pet_name);
          setSelectedPetId(defaultPetId);
          fetchPetProfile(defaultPetId);
        } else {
          setSelectedPetName("Select Pet");
          setSelectedPetId(null);
          setCurrentPetProfile(null);
        }
      } catch (error) {
        console.error("Failed to fetch pet profiles", error);
      }
    };

    if (user) {
      fetchPetProfiles();
    }
  }, [user]);


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
        onRequestClose={() => {
          setDropdownVisible(!dropdownVisible);
        }}
      >
        <View style={styles.dropdownContainer}>
          {petProfiles.map((pet, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedPetName(pet.pet_name);
                setSelectedPetId(pet.pet_id);
                fetchPetProfile(pet.pet_id); // Fetch the individual pet profile
                console.log(`Selected pet ID: ${pet.pet_id}`);
                setDropdownVisible(false);
              }}
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
});

export default DashboardScreen;
