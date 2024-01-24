import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import SecureStorage from "react-native-secure-storage";
import Ionicon from "react-native-vector-icons/Ionicons";
import { CONFIG } from "../../config";
import SliderModal from "../components/SliderModal";
import TemporaryImageCropper from "../imageHandling/TemporaryImageCropper";


const EditPetProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const petId = route.params?.petId;
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Individual useState hooks for each editable field
  const [petName, setPetName] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [gender, setGender] = useState(null);
  const [bio, setBio] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const [tempProfilePic, setTempProfilePic] = useState(null);

  const [bioCharCount, setBioCharCount] = useState(0);


  useEffect(() => {
    const fetchPetProfile = async () => {
      if (petId) {
        setIsLoading(true);
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/`);
          const data = await response.json();
          if (data) {
            setPetName(data.pet_name);
            setBirthday(data.birthday || null);
            setGender(data.gender);
            setBio(data.bio);
            setProfilePic(data.profile_pic_regular);

            setIsDataLoaded(true);
          }
        } catch (error) {
          console.error("Failed to fetch pet profile", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPetProfile();
  }, [petId]);


  useEffect(() => {
    if (bio) {
      setBioCharCount(bio.length);
    }
  }, [bio]);

  const handleBioChange = (text) => {
    setBio(text);
    setBioCharCount(text.length);
  };

  const handleSave = async () => {

    // Part 1 - PUT updated profile info
    const updatedProfile = {
      pet_name: petName,
      birthday: birthday,
      gender: gender,
      bio: bio,
    };

    const accessToken = await SecureStorage.getItem("access");


    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${accessToken}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Profile updated successfully:", data);
      } else {
        console.error("Failed to update profile:", data);
      }
    } catch (error) {
      console.error("Error while updating profile:", error);
    }

    // Part 2 - Check if there is a temporary profile picture to upload
    if (tempProfilePic) {
      try {
        let formData = new FormData();
        formData.append("file", {
          uri: tempProfilePic,
          type: tempProfilePic.mime,
          name: "profilepic.jpg",
        });
        formData.append("pet_id", petId);

        const imageUploadResponse = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/upload_pet_profile_pic/`, {
          method: "POST",
          headers: {
            "Authorization": `JWT ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        if (imageUploadResponse.ok) {
          console.log("Profile picture updated successfully");
          // You might want to update your app state here, depending on how you handle the uploaded image URL
        } else {
          console.error("Failed to update profile picture");
        }
      } catch (error) {
        console.error("Error while uploading profile picture:", error);
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 10 }}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSave]);

  const handleProfilePicUpdate = () => {
    setShowActionSheet(true);
  };


  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  const takePhoto = () => {
    setShowActionSheet(false);
    const options = {
      mediaType: "photo",
      quality: 1,
      includeBase64: false,
    };
    launchCamera(options, handleImageResponse);
  };

  const chooseFromLibrary = () => {
    setShowActionSheet(false);
    const options = {
      mediaType: "photo",
      quality: 1,
    };
    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) {
      console.log("User cancelled image picker");
    } else if (response.error) {
      console.log("ImagePicker Error: ", response.error);
    } else {
      const file = response.assets && response.assets[0];
      if (file && file.uri) {
        TemporaryImageCropper.openCropper(file.uri, (croppedUri) => {
          setTempProfilePic(croppedUri);
        });
      }
    }
  };

  const RadioButton = ({ selected, onPress, label }) => (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={onPress}>
      <View style={styles.radioButton}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const onChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      // Convert selectedDate to YYYY-MM-DD format
      let dateString = selectedDate.toISOString().split("T")[0];
      setBirthday(dateString);
    } else {
      setBirthday(null);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffc02c" />
        </View>
      )}

      {!isLoading && isDataLoaded && (
        <View>
          <TouchableOpacity onPress={handleProfilePicUpdate} style={styles.profileRow}>
            {tempProfilePic ? (
              <Image
                source={{ uri: tempProfilePic }}
                style={styles.profilePic}
              />
            ) : (
              profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  style={styles.profilePic}
                />
              ) : (
                <View style={styles.cameraIconContainer}>
                  <Ionicon name="camera" size={50} color="#000" />
                </View>
              )
            )}
            <Text style={styles.changeProfileText}>Change Profile Picture</Text>
          </TouchableOpacity>

          <View style={styles.formRow}>
            <Text style={styles.fieldLabel}>Name:</Text>
            <TextInput
              style={styles.textInput}
              value={petName}
              placeholder="Pet Name"
              onChangeText={setPetName}
            />
          </View>


          <View style={styles.formRow}>
            <Text style={styles.fieldLabel}>Birthday:</Text>
            <TouchableOpacity
              style={styles.birthdayDisplay}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.birthdayText}>
                {birthday || "Select Birthday"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={birthday ? new Date(birthday + "T00:00:00") : new Date()}
                mode="date"
                display="default"
                onChange={onChange}
              />
            )}

          </View>

          <View style={styles.formRow}>
            <Text style={styles.fieldLabel}>Gender:</Text>
            <View style={styles.genderSelectionContainer}>
              <RadioButton
                label="Male"
                selected={gender === "m"}
                onPress={() => handleGenderSelect("m")}
              />
              <RadioButton
                label="Female"
                selected={gender === "f"}
                onPress={() => handleGenderSelect("f")}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.fieldLabel}>Bio:</Text>
            <View style={styles.bioInputContainer}>
              <TextInput
                style={styles.textInputBio}
                value={bio}
                placeholder="Bio"
                onChangeText={handleBioChange}
                multiline
                numberOfLines={5}
                maxLength={500}
              />
              <Text style={styles.charCount}>{bioCharCount}/500</Text>
            </View>
          </View>


        </View>
      )}

      <SliderModal
        dropdownVisible={showActionSheet}
        setDropdownVisible={setShowActionSheet}
      >
        <TouchableOpacity style={styles.actionSheetButton} onPress={takePhoto}>
          <Text style={styles.actionSheetText}>Take Photo...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionSheetButton} onPress={chooseFromLibrary}>
          <Text style={styles.actionSheetText}>Choose from Library...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionSheetButton}
                          onPress={() => setShowActionSheet(false)}>
          <Text style={styles.actionSheetText}>Cancel</Text>
        </TouchableOpacity>
      </SliderModal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e1e1e1",
  },
  changeProfileText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#797979",
  },
  actionSheetButton: {
    padding: 16,
    alignItems: "center",
  },
  actionSheetText: {
    fontSize: 18,
    color: "#ffc02c",
  },
  saveButtonText: {
    color: "#ffc02c",
    fontSize: 18,
  },

  // Form
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  fieldLabel: {
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 5,
    fontSize: 16,
  },


  // Birthday
  birthdayDisplay: {
    padding: 5,
  },

  birthdayText: {
    fontSize: 16,
  },

  // Gender Selection
  genderSelectionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 40,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#ffc02c",
  },
  radioButtonLabel: {
    marginLeft: 10,
    fontSize: 16,
  },

  // Bio
  content: {
    flex: 1,
  },
  bioInputContainer: {
    flex: 1,
    justifyContent: "flex-end",
    position: "relative",
    marginRight: 10,
    marginTop: 5,
  },
  textInputBio: {
    padding: 10,
    paddingTop: 10,
    fontSize: 16,
    textAlignVertical: "top",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    height: 120,
  },
  charCount: {
    position: "absolute",
    bottom: 5,
    right: 5,
    color: "#797979",
    fontSize: 14,
  },
});

export default EditPetProfileScreen;
