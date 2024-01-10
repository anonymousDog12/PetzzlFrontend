import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import SecureStorage from "react-native-secure-storage";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import PostSection from "../components/PostSection";
import SliderModal from "../components/SliderModal";
import { DEFAULT_PROFILE_PICS } from "../data/FieldNames";
import { deletePostSuccess } from "../redux/actions/dashboard";
import { addPost, fetchFeed } from "../redux/actions/feed";


const FeedScreen = ({ route }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const isFocused = useIsFocused();
  const feedData = useSelector(state => state.feed.feed);
  const dispatch = useDispatch();
  const { postDetails } = route.params || {};
  const [likeCounts, setLikeCounts] = useState({});
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const ownedPetIds = useSelector(state => state.petProfile.ownedPetIds);
  const [isPostOwnedByCurrentUser, setIsPostOwnedByCurrentUser] = useState(false);

  const [likeStatuses, setLikeStatuses] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const hasNextPage = useSelector(state => state.feed.hasNextPage);

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPetIdForBlock, setSelectedPetIdForBlock] = useState(null);
  const [selectedPostIdForDeletion, setSelectedPostIdForDeletion] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleEllipsisOptionClick = (petId, postId) => {
    setIsPostOwnedByCurrentUser(!!ownedPetIds[petId]);
    setSelectedPetIdForBlock(petId);
    setSelectedPostIdForDeletion(postId);
    setModalVisible(true);
  };


  const navigation = useNavigation();


  useEffect(() => {
    // Fetch the first page when the component mounts
    dispatch(fetchFeed(1));
  }, [dispatch]);

  useEffect(() => {
    // Check if new data is loaded by comparing the length of feedData before and after
    const isDataLoaded = feedData.length > 0 && currentPage > 1;
    if (isDataLoaded) {
      setIsLoadingPage(false);
    }
  }, [feedData, currentPage]);


  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (isFocused && Array.isArray(feedData)) {
        setIsGlobalLoading(true);
        const fetchPromises = feedData.flatMap(post => [
          fetchLikeCount(post.post_id),
          fetchLikeStatus(post.post_id, currentPetId),
        ]);

        try {
          await Promise.all(fetchPromises);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          if (active) {
            setIsGlobalLoading(false);
          }
        }
      }
    };

    fetchData();

    return () => {
      active = false; // Prevents setting state on unmounted component
    };
  }, [feedData, currentPetId, isFocused]);


  // If there are post details, upload the post
  useEffect(() => {
    if (postDetails) {
      handlePostUpload(postDetails);
    }
  }, [postDetails]);


  const loadMore = () => {
    if (!isLoadingPage && hasNextPage) {
      setIsLoadingPage(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      dispatch(fetchFeed(nextPage));
    }
  };

  const handlePetProfileClick = (petId) => {
    if (petId === currentPetId) {
      navigation.navigate("Dashboard"); // Navigate to current user's Dashboard
    } else {
      navigation.navigate("OtherUserDashboard", { otherPetId: petId }); // Navigate to Other Pet's Dashboard
    }
  };

  const getProfilePic = (petProfilePic, petType) => {
    return petProfilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS["other"];
  };

  const handlePostUpload = async ({ selectedPhotos, caption, petId }) => {
    setIsUploading(true);

    // TODO: move get accessToken up
    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken) {
      console.error("JWT token not found");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("pet_id", petId);
    formData.append("caption", caption);

    selectedPhotos.forEach((media, index) => {
      formData.append("media_files", {
        name: `media_${index}${media.extension}`, // Use the original extension
        type: media.mimeType, // Use the mimeType from Redux state
        uri: media.uri,
      });
    });

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/create_post/`, {
        method: "POST",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // console.log("Post created successfully:", result);
        dispatch(addPost(result));
        setPostSuccess(true);
        dispatch(fetchFeed());
      } else {
        const errorResponse = await response.json();
        if (errorResponse.error_type === "inappropriate_content") {
          Alert.alert(
            "Quick Check Needed",
            errorResponse.message,
            [{ text: "OK" }],
          );
        } else {
          // Handle other types of errors
          console.error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchLikeCount = async (postId) => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likecount/`, {
        method: "GET",
        // Add headers if necessary, such as for authentication
      });
      const data = await response.json();
      setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: data.like_count }));
    } catch (error) {
      console.error("Error fetching like count:", error);
    }
  };

  const fetchLikeStatus = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${petId}/`, {
        method: "GET",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.json();
      setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: data.liked }));
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };

  // TODO: try to use usePostLike hook and get rid of the repeated logic
  // One challenge is, if I use it like it is, the hook will be inside a loop
  // nested loop will report errors
  // but I also don't want to move the use post like in the PostSection component
  // because that would break the logic in post detail screens
  const handleToggleLike = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken) {
      console.error("JWT token not found");
      return;
    }

    const isCurrentlyLiked = likeStatuses[postId];
    const method = isCurrentlyLiked ? "unlike" : "like";

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/${method}/${petId}/`, {
        method: "POST",
        headers: { "Authorization": `JWT ${accessToken}` },
      });

      if (response.ok) {
        // Update like status and count
        setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: !isCurrentlyLiked }));
        setLikeCounts(prevCounts => {
          const currentCount = prevCounts[postId] || 0;
          return { ...prevCounts, [postId]: isCurrentlyLiked ? Math.max(currentCount - 1, 0) : currentCount + 1 };
        });
      } else {
        console.error(`Failed to ${method} the post`);
      }
    } catch (error) {
      console.error(`Error ${method}ing post:`, error);
    }
  };

  // Not using use delete post hook to avoid nested hook error

  const deletePost = async (postId) => {
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
          onPress: () => performDeletePost(postId),
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

  const performDeletePost = async (postId) => {
    setIsDeleting(true); // Start the deletion process

    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken) {
      console.error("JWT token not found");
      setIsDeleting(false); // Reset the deletion status on error
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/delete_post/${postId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `JWT ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to delete the post");
        setIsDeleting(false);
        return;
      }

      dispatch(deletePostSuccess(postId));
      setModalVisible(false);
    } catch (error) {
      console.error("Deletion error:", error);
      setIsDeleting(false);
    } finally {
      setIsDeleting(false);
    }
  };


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
        body: JSON.stringify({ pet_id: selectedPetIdForBlock }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message, [{ text: "OK" }]);
        dispatch(fetchFeed(currentPage));
      } else {
        Alert.alert("Error", data.error || "Failed to block user", [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while blocking the user. Please try again later.", [{ text: "OK" }]);
    }
    setModalVisible(false);
  };

  const renderPost = (post) => {
    const postProps = {
      petProfile: {
        profile_pic_thumbnail_small: getProfilePic(post.pet_profile_pic, post.pet_type),
        pet_name: post.pet_id,
      },
      postDetails: {
        posted_date: post.posted_date,
        media: post.media,
        caption: post.caption,
        post_id: post.post_id,
      },
      onEllipsisPress: () => handleEllipsisOptionClick(post.pet_id, post.post_id),
      handlePetProfileClick: () => handlePetProfileClick(post.pet_id),
      showEllipsis: true,
      isLiked: likeStatuses[post.post_id],
      likeCount: likeCounts[post.post_id],
      handleLikePress: () => handleToggleLike(post.post_id, currentPetId),
    };

    return <PostSection key={post.post_id} {...postProps} />;
  };

  if (isDeleting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffc02c" />
        <Text>Deleting...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {postDetails && isUploading && <Progress.Bar indeterminate={true} width={200} />}
        {postSuccess && <Text>Post successful! {" "}✓</Text>}
        {Array.isArray(feedData) && feedData.map(renderPost)}
        <TouchableOpacity onPress={loadMore} style={styles.loadMoreContainer}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>

      </ScrollView>
      <SliderModal dropdownVisible={modalVisible} setDropdownVisible={setModalVisible}>
        {isPostOwnedByCurrentUser ? (
          <TouchableOpacity onPress={() => deletePost(selectedPostIdForDeletion)}>
            <Text style={styles.blockUserText}>Delete Post</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleBlockUser}>
            <Text style={styles.blockUserText}>Block User</Text>
          </TouchableOpacity>
        )}
      </SliderModal>

      {isGlobalLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffc02c" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  blockUserText: {
    color: "red",
    fontSize: 18,
    padding: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  loadMoreContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    margin: 10,
  },
  loadMoreText: {
    color: "#ffc02c",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FeedScreen;
