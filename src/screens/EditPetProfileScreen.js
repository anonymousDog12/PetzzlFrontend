import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import SecureStorage from "react-native-secure-storage";
import Ionicon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import SliderModal from "../components/SliderModal";
import SuccessMessage from "../components/SuccessMessage";
import { PET_TYPE_DISPLAY } from "../data/AppContants";
import TemporaryImageCropper from "../imageHandling/TemporaryImageCropper";
import { setCurrentPetId } from "../redux/actions/petProfile";
import { CURRENT_PET_ID, SET_NEW_PET_PROFILE, USER_HAS_PETS } from "../redux/types";
import { validatePetName } from "../utils/common";


const EditPetProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const petId = route.params?.petId;
  const user = useSelector(state => state.auth.user);

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const dispatch = useDispatch();


  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Individual useState hooks for each editable field
  const [petName, setPetName] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [gender, setGender] = useState(null);
  const [bio, setBio] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [petType, setPetType] = useState(null);


  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(Object.entries(PET_TYPE_DISPLAY).map(([key, value]) => ({
    label: value,
    value: key,
  })));

  const [tempProfilePic, setTempProfilePic] = useState(null);

  const [bioCharCount, setBioCharCount] = useState(0);

  const [petNameError, setPetNameError] = useState("");


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
            setPetType((data.pet_type));

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
    setIsSaving(true);

    // Part 1 - Validate Information

    const validationResult = validatePetName(petName);
    if (validationResult.error) {
      setPetNameError(validationResult.error);
      return;
    } else {
      setPetNameError("");
    }

    // Part 2 - PUT updated profile info

    const updatedProfile = {
      pet_name: petName,
      birthday: birthday,
      gender: gender,
      bio: bio ? bio.trim() : null,
      pet_type: petType,
    };

    const accessToken = await SecureStorage.getItem("access");


    try {
      const profileResponse = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${accessToken}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      let profileUpdateSuccess = profileResponse.ok;

      if (profileUpdateSuccess && tempProfilePic) {
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

        profileUpdateSuccess = imageUploadResponse.ok;
      }

      // Show success message if all updates were successful
      if (profileUpdateSuccess) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        console.error("Failed to update profile or profile picture");
      }
    } catch (error) {
      console.error("Error while updating profile:", error);
    }

    setIsSaving(false);
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

  // TODO: rename this!
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

  const showDeleteConfirmation = () => {
    Alert.alert(
      `Permanently Delete ${petId}?`,
      "This action cannot be undone. It will permanently delete all posts and profiles associated with this pet.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(),
        },
      ],
      { cancelable: false },
    );
  };


  const handleDelete = async () => {
    setIsLoading(true);
    const accessToken = await SecureStorage.getItem("access");
    try {
      const deleteResponse = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `JWT ${accessToken}`,
        },
      });


      if (deleteResponse.ok) {
        // Fetch the remaining pet profiles
        const remainingProfilesResponse = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`, {
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        const remainingProfiles = await remainingProfilesResponse.json();

        if (remainingProfiles.length > 0) {
          // Set another pet profile as the current one
          const newCurrentPetId = remainingProfiles[0].pet_id;
          // TODO: Consider grouping async storage and set current pet id together
          await AsyncStorage.setItem("selectedPetId", newCurrentPetId);
          dispatch(setCurrentPetId(newCurrentPetId));
          navigation.navigate("Dashboard");
        } else {
          // No pet profiles left
          dispatch({ type: USER_HAS_PETS, payload: false });
          dispatch({ type: SET_NEW_PET_PROFILE, payload: true });
          dispatch({ type: CURRENT_PET_ID, payload: null });
          navigation.navigate("PetProfileCreationStep0");
        }
      } else {
        console.error("Failed to delete pet profile");
        // Handle the error, show an alert or a toast to the user
      }
    } catch (error) {
      console.error("Error while deleting profile:", error);
      // Handle the error, show an alert or a toast to the user
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {showSuccessMessage && (
        <SuccessMessage message="Saving successful" />
      )}


      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffc02c" />
          </View>
        )}

        {isSaving && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffc02c" />
            <Text>Saving...</Text>
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
                onChangeText={text => {
                  setPetNameError("");
                  setPetName(text);
                }}
              />
            </View>
            {petNameError ? <Text style={styles.errorText}>{petNameError}</Text> : null}


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
                  label="Boy"
                  selected={gender === "m"}
                  onPress={() => handleGenderSelect("m")}
                />
                <RadioButton
                  label="Girl"
                  selected={gender === "f"}
                  onPress={() => handleGenderSelect("f")}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.fieldLabel}>Pet Type:</Text>
              <DropDownPicker
                listMode="MODAL"
                modalProps={{
                  animationType: "slide",
                }}
                open={open}
                value={petType}
                items={items}
                setOpen={setOpen}
                setValue={setPetType}
                setItems={setItems}
                onChangeValue={(value) => {
                  setPetType(value);
                }}
                containerStyle={styles.petTypeDropdownContainer}
                style={{
                  backgroundColor: "#f2f2f2",
                }}
                labelStyle={styles.dropDownLabel}
                modalContentContainerStyle={styles.modalContentContainer}
                listItemLabelStyle={{
                  fontSize: 20,
                }}
                selectedItemLabelStyle={{
                  fontWeight: "bold",
                }}
                selectedItemContainerStyle={{
                  backgroundColor: "lightgrey",
                }}
              />
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

            <TouchableOpacity style={styles.formRow} onPress={showDeleteConfirmation}>
              <Text style={styles.deleteText}>Delete Profile</Text>
            </TouchableOpacity>


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
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
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
    marginTop: 25,
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


  // Name
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
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


  deleteText: {
    fontSize: 16,
    color: "red",
  },

  petTypeDropdownContainer: {
    flex: 1,
    marginRight: 10,
  },

  dropDownLabel: {
    fontSize: 16,
  },

  modalContentContainer: {
    backgroundColor: "#f2f2f2",
  },

});

export default EditPetProfileScreen;
