import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { useSelector } from "react-redux";
import { CONFIG } from "../../../config";
import PostSection from "../../components/PostSection";
import SliderModal from "../../components/SliderModal";
import { useDeletePost } from "../../hooks/useDeletePost";
import { usePostLike } from "../../hooks/usePostLike";
import { getProfilePic } from "../../utils/common";


const PostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const { postId, petProfile } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);

  const { isLiked, likeCount, toggleLike } = usePostLike(postId, currentPetId);
  const [modalVisible, setModalVisible] = useState(false);


  const [isDeleting, setIsDeleting] = useState(false);
  const navigation = useNavigation();
  const showDeleteConfirmation = useDeletePost(navigation, setIsDeleting);


  useEffect(() => {
    const fetchPostDetails = async () => {
      const accessToken = await SecureStorage.getItem("access");

      if (accessToken) {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/post_media/${postId}/full/`, {
            method: "GET",
            headers: {
              "Authorization": `JWT ${accessToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setPostDetails(data);
          } else {
            console.error("Failed to fetch post details");
          }
        } catch (error) {
          console.error("Error fetching post details:", error);
        }
      }
    };

    fetchPostDetails();
  }, [postId]);


  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  if (isDeleting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffc02c" />
        <Text>Deleting...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      <ScrollView style={styles.scrollViewStyle}>
        <PostSection
          petProfile={{
            ...petProfile,
            profile_pic_thumbnail_small: getProfilePic(petProfile.profile_pic_thumbnail_small, petProfile.pet_type),
          }}
          postDetails={postDetails}
          onEllipsisPress={() => setModalVisible(!modalVisible)}
          showEllipsis={true}
          isLiked={isLiked}
          likeCount={likeCount}
          handleLikePress={toggleLike}
        />
        <SliderModal
          dropdownVisible={modalVisible}
          setDropdownVisible={setModalVisible}
        >
          <TouchableOpacity onPress={() => showDeleteConfirmation(postId)}>
            <Text style={styles.modalTextRed}>Delete Post</Text>
          </TouchableOpacity>
        </SliderModal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewStyle: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTextRed: {
    color: "red",
    fontSize: 18,
    padding: 10,
  },
});

export default PostDetailScreen;