import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { useSelector } from "react-redux";
import { CONFIG } from "../../config";
import PostSection from "../components/PostSection";
import SliderModal from "../components/SliderModal";
import { usePostLike } from "../hooks/usePostLike";

// TODO: only display block user option after reporting
// https://soulecho.atlassian.net/browse/PA-248

// TODO: Handle app behavior after user is blocked

const OtherUserPostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const { postId, petId, petProfilePic } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);

  const { isLiked, likeCount, toggleLike } = usePostLike(postId, currentPetId);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBlockUser = async () => {
    setModalVisible(false);
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? This will also block all other pet profiles associated with them.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block User",
          onPress: () => performBlockUser(),
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

  const performBlockUser = async () => {
    try {
      const accessToken = await SecureStorage.getItem("access");
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/userblocking/block/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${accessToken}`,
        },
        body: JSON.stringify({ pet_id: petId }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message, [{ text: "OK" }]);
      } else {
        Alert.alert("Error", data.error || "Failed to block user", [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while blocking the user. Please try again later.", [{ text: "OK" }]);
    }
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/post_media/${postId}/full/`);
        const data = await response.json();
        setPostDetails(data);
      } catch (error) {
        console.error("Failed to fetch post details", error);
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    // TODO - Refactor slider modal
    // https://soulecho.atlassian.net/browse/PA-242

    <SafeAreaView style={{ flex: 1 }}>
      <PostSection
        petProfile={{ profile_pic_thumbnail_small: petProfilePic, pet_name: petId }}
        postDetails={postDetails}
        showEllipsis={true}
        onEllipsisPress={() => setModalVisible(!modalVisible)}
        isLiked={isLiked}
        likeCount={likeCount}
        handleLikePress={toggleLike}
      />
      <SliderModal
        dropdownVisible={modalVisible}
        setDropdownVisible={setModalVisible}
      >
        <TouchableOpacity onPress={handleBlockUser}>
          <Text style={styles.modalTextRed}>Block User</Text>
        </TouchableOpacity>
      </SliderModal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  modalTextRed: {
    marginBottom: 15,
    color: "red",
    textAlign: "center",
  },
});


export default OtherUserPostDetailScreen;
