import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import SecureStorage from "react-native-secure-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import PostSection from "../components/PostSection";
import SliderModal from "../components/SliderModal";
import SliderModalStyles from "../components/SliderModalStyles";
import SuccessMessage from "../components/SuccessMessage";
import { REPORT_REASONS } from "../data/AppContants";
import { deletePostSuccess } from "../redux/actions/dashboard";
import { addPost, fetchFeed } from "../redux/actions/feed";
import { getProfilePic } from "../utils/common";


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
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);

  const [reportMessageModalVisible, setReportMessageModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const [isReportSending, setIsReportSending] = useState(false);

  const handleEllipsisOptionClick = (petId, postId) => {
    setIsPostOwnedByCurrentUser(!!ownedPetIds[petId]);
    setSelectedPetIdForBlock(petId);
    setSelectedPostId(postId);
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


  useEffect(() => {
    let postSuccessTimeout;
    if (postSuccess) {
      // Set a timeout to hide the success message after 3 seconds
      postSuccessTimeout = setTimeout(() => {
        setPostSuccess(false);
      }, 3000);
    }

    // Clear the timeout if the component unmounts
    // or if the postSuccess state changes before the timeout is reached
    return () => clearTimeout(postSuccessTimeout);
  }, [postSuccess]);

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

  const handlePostUpload = async ({ selectedMedias, caption, petId }) => {
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

    selectedMedias.forEach((media, index) => {
      formData.append("media_files", {
        name: `media_${index}${media.extension}`,
        type: media.mimeType,
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
          console.error(`HTTP error! status: ${response.status}`);
          const errorResponse = await response.json();
          const errorMessage = errorResponse.message || "We're terribly sorry, but something went wrong during your post upload. Please try again. If the problem persists, reach out to us for support.";
          Alert.alert("Upload Failed", errorMessage, [{ text: "OK" }]);
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Oops, Something Went Wrong",
        "We're terribly sorry, but something went wrong during your post upload. Please try again. If the problem persists, reach out to us for support.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      );
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

  const handleReportContent = () => {
    setModalVisible(false);
    setReportModalVisible(true);
  };

  const handleReportReasonSelect = async (reasonCode) => {
    setIsReportSending(true);

    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken) {
      console.error("JWT token not found");
      setIsReportSending(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/contentreporting/report_post/`, {
        method: "POST",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "application/json",
        },
        body:
          JSON.stringify({
            post_id: selectedPostId,
            reason: reasonCode,
            details: "",
          }),
      });

      if (response.ok) {
        setReportMessage("Thank you for letting us know!");
        dispatch(fetchFeed(currentPage));
      } else {
        setReportMessage("Failed to report the post. Please try again.");
      }
    } catch (error) {
      setReportMessage("An error occurred while reporting the post. Please try again.");
    } finally {
      setIsReportSending(false);
      setReportModalVisible(false);
      setReportMessageModalVisible(true);
    }

  };


  const handleCloseReportMessageModal = () => {
    setReportMessageModalVisible(false);
    setReportMessage(""); // Resetting the message for next use
  };


  const handleBlockUser = async () => {
    setReportMessageModalVisible(false);
    Alert.alert(
      `Block ${selectedPetIdForBlock}?`,
      "Blocking will also hide all their associated pet profiles from you. They won't be notified, and neither you nor they will be able to see each other's posts.",
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

  // TODO - Refactor slider modal
  // https://soulecho.atlassian.net/browse/PA-242

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {postDetails && isUploading && (
          <View style={styles.uploadingContainer}>
            <Progress.Bar
              style={styles.progressBar}
              indeterminate={true}
              color="#ffc02c"
              unfilledColor="transparent"
              borderWidth={0}
              useNativeDriver={true}
            />
            <Text style={styles.uploadingText}>Posting... Please keep the app open</Text>
          </View>
        )}
        {postSuccess && (
          <SuccessMessage message="Post successful!" />
        )}
        {Array.isArray(feedData) && feedData.map(renderPost)}
        <TouchableOpacity onPress={loadMore} style={styles.loadMoreContainer}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>

      </ScrollView>
      <SliderModal dropdownVisible={modalVisible} setDropdownVisible={setModalVisible}>
        {isPostOwnedByCurrentUser ? (
          <TouchableOpacity onPress={() => deletePost(selectedPostId)}>
            <Text style={styles.modalTextRed}>Delete Post</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={handleReportContent}>
              <Text style={styles.modalTextRed}>Report Content</Text>
            </TouchableOpacity>
          </>
        )}
      </SliderModal>

      <SliderModal dropdownVisible={reportModalVisible} setDropdownVisible={setReportModalVisible}>
        {isReportSending ? (
          <View style={styles.activityIndicatorModal}>
            <ActivityIndicator size="large" color="#ffc02c" />
          </View>
        ) : (
          <>
            <View>
              <Text style={styles.modalTitle}>Report Post</Text>
            </View>
            <View>
              <Text style={styles.modalQuestion}>Why are you reporting this post?</Text>
            </View>
            {Object.entries(REPORT_REASONS).map(([code, reason]) => (
              <View style={SliderModalStyles.modalRow} key={code}>
                <TouchableOpacity onPress={() => handleReportReasonSelect(code)}>
                  <Text style={styles.modalTextReportReasons}>{reason}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </SliderModal>


      <SliderModal
        dropdownVisible={reportMessageModalVisible}
        setDropdownVisible={handleCloseReportMessageModal}
      >

        <View style={styles.reportMessageContent}>
          <Ionicons name="checkmark-circle-outline" size={60} color="#ffc02c" />
          <Text style={styles.reportMessage}>{reportMessage}</Text>
          <TouchableOpacity style={styles.okButton} onPress={handleCloseReportMessageModal}>
            <Text style={styles.okButtonText}>Ok</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.blockUserButton} onPress={handleBlockUser}>
            <Text style={styles.blockUserButtonText}>Block User</Text>
          </TouchableOpacity>
        </View>

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
  progressBarContainer: {
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderRadius: 5,
  },
  uploadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderRadius: 5,
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DCDCDC",
  },
  container: {
    flexGrow: 1,
  },
  modalTextRed: {
    color: "red",
    fontSize: 18,
    padding: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    padding: 10,
  },
  modalTextReportReasons: {
    color: "black",
    fontSize: 16,
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
  reportMessageContent: {
    alignItems: "center",
    padding: 20,
  },
  reportMessage: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  okButton: {
    backgroundColor: "#ffc02c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    width: "100%",
    marginBottom: 15,
  },
  okButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  blockUserButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffc02c",
    width: "100%",

  },
  blockUserButtonText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  activityIndicatorModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
});

export default FeedScreen;
