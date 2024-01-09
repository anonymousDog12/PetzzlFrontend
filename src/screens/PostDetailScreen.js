import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import PostSection from "../components/PostSection";
import SliderModal from "../components/SliderModal";
import { usePostLike } from "../hooks/usePostLike";
import { deletePostSuccess } from "../redux/actions/dashboard";


const PostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const { postId, petProfile } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);

  const { isLiked, likeCount, toggleLike } = usePostLike(postId, currentPetId);
  const [modalVisible, setModalVisible] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();


  const deletePost = async () => {
    setIsDeleting(true);
    const accessToken = await SecureStorage.getItem("access"); // Retrieve the access token

    if (accessToken) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/delete_post/${postId}/`, {
          method: "DELETE",
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to delete the post");
        }

        dispatch(deletePostSuccess(postId));
        navigation.goBack();
      } catch (error) {
        console.error("Deletion error:", error);
      }
    }
    setIsDeleting(false);
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: deletePost,
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

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
    <SafeAreaView style={{ flex: 1 }}>
      <PostSection
        petProfile={petProfile}
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
        <TouchableOpacity onPress={showDeleteConfirmation}>
          <Text style={styles.modalTextDelete}>Delete</Text>
        </TouchableOpacity>
      </SliderModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTextDelete: {
    marginBottom: 15,
    color: "red",
    textAlign: "center",
  },
});

export default PostDetailScreen;
