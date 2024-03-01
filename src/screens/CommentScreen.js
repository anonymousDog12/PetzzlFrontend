import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SecureStorage from "react-native-secure-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { CONFIG } from "../../config";
import SliderModal from "../components/SliderModal";
import SuccessMessage from "../components/SuccessMessage";
import { getProfilePic } from "../utils/common";


const CommentScreen = ({ route }) => {
  const { postId, petId } = route.params;


  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const [postingStatus, setPostingStatus] = useState({ isPosting: false, isSuccess: false, message: "" });
  const [deletionStatus, setDeletionStatus] = useState({ isDeleting: false, isSuccess: false, message: "" });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ text: "", textStyle: {} });

  const navigation = useNavigation();

  // Fetch the current pet profile picture from the redux state
  const currentPetProfilePic = useSelector(state => state.petProfile.currentPetProfilePic);
  const currentPetId = useSelector(state => state.petProfile.currentPetId); // Assuming you have access to currentPetId

  useEffect(() => {
    fetchComments();
  }, []);

  const handleEllipsisPress = (commentOwnerPetId, commentId) => {
    const isCurrentPetOwnerOrCommenter = currentPetId === petId || currentPetId === commentOwnerPetId;

    if (isCurrentPetOwnerOrCommenter) {
      setModalContent({
        text: "Delete Comment",
        textStyle: { color: "red", fontSize: 18 },
        onPress: () => {
          Alert.alert(
            "Are you sure?",
            "This cannot be undone.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              { text: "OK", onPress: () => handleDeleteComment(commentId) },
            ],
          );
        },
      });
    } else {
      setModalContent({
        text: "More options coming soon!",
        textStyle: { color: "gray", fontSize: 18 },
        onPress: () => {
        },
      });
    }

    setModalVisible(true);
  };

  const handleDeleteComment = async (commentId) => {
    const accessToken = await SecureStorage.getItem("access");
    const deleteUrl = `${CONFIG.BACKEND_URL}/api/postcomments/delete_comment/${commentId}/`;

    try {
      setDeletionStatus({ isDeleting: true, isSuccess: false, message: "Deleting..." });
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Authorization": `JWT ${accessToken}`,
        },
      });

      if (response.ok) {
        setDeletionStatus({ isDeleting: false, isSuccess: true, message: "Comment Deleted Successfully" });
        fetchComments();
        // Close the modal after deletion
        setModalVisible(false);
      } else {
        setDeletionStatus({ isDeleting: false, isSuccess: false, message: "Failed to Delete Comment" });
      }
    } catch (error) {
      setDeletionStatus({ isDeleting: false, isSuccess: false, message: "Error Deleting Comment" });
      console.error("Error deleting comment:", error);
    }

    // Reset deletion status after a delay to clear the message
    setTimeout(() => {
      setDeletionStatus({ isDeleting: false, isSuccess: false, message: "" });
    }, 3000);
  };


  const fetchComments = async () => {
    const accessToken = await SecureStorage.getItem("access");
    const commentsUrl = `${CONFIG.BACKEND_URL}/api/postcomments/comments/view/${postId}/`;

    try {
      const response = await fetch(commentsUrl, {
        method: "GET",
        headers: {
          "Authorization": `JWT ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };


  const handleCommentChange = (text) => {
    if (text.length <= 500) {
      setComment(text);
    }
  };

  const navigateToDashboard = (selectedPetId) => {
    if (selectedPetId === currentPetId) {
      navigation.navigate("Dashboard");
    } else {
      navigation.navigate("OtherUserDashboard", { otherPetId: selectedPetId });
    }
  };


  const handleCommentSubmit = async () => {
    const accessToken = await SecureStorage.getItem("access");
    if (comment.trim().length > 0) {
      setPostingStatus({ isPosting: true, isSuccess: false, message: "Posting..." });
      const commentUrl = `${CONFIG.BACKEND_URL}/api/postcomments/add_comment/${postId}/`;

      try {
        const response = await fetch(commentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `JWT ${accessToken}`,
          },
          body: JSON.stringify({
            pet_id: currentPetId,
            content: comment.trim(),
          }),
        });

        if (response.ok) {
          // Immediately fetch updated comments after successfully posting the new comment
          await fetchComments();
          setPostingStatus({ isPosting: false, isSuccess: true, message: "Comment Added!" });
          setComment("");

          // Reset postingStatus after 3 seconds to clear the success message
          setTimeout(() => {
            setPostingStatus({ isPosting: false, isSuccess: false, message: "" });
          }, 3000);
        } else {
          console.error("Network response was not ok");
          setPostingStatus({ isPosting: false, isSuccess: false, message: "Failed to Post Comment" });
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        setPostingStatus({ isPosting: false, isSuccess: false, message: "Failed to Post Comment" });
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Image
          source={{ uri: currentPetProfilePic }}
          style={styles.commentProfilePicStyle}
        />
        <View style={styles.inputWithCounter}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            multiline={false}
            returnKeyType="send"
            onChangeText={handleCommentChange}
            value={comment}
            autoFocus={true}
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (comment.trim().length > 0) {
                handleCommentSubmit();
              }
            }}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>
      </View>
      {comments.length === 0 ? (
        // Render this view when there are no comments
        <View style={styles.noCommentsContainer}>
          <Text style={styles.noCommentsText}>It's Silent in Here</Text>
          <Text style={styles.encourageText}>Swoop in and share what you think!</Text>
        </View>
      ) : (
        // Existing ScrollView with comments map function remains here
        <ScrollView showsVerticalScrollIndicator={false}>
          {postingStatus.isPosting && <ActivityIndicator size="small" color="#ffc02c" />}
          {postingStatus.message !== "" && postingStatus.isSuccess && (
            <SuccessMessage message={postingStatus.message} />
          )}
          {deletionStatus.message !== "" && deletionStatus.isSuccess && (
            <SuccessMessage message={deletionStatus.message} />
          )}
          {comments.map((comment) => (
            <View key={comment.comment_id} style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <TouchableOpacity onPress={() => navigateToDashboard(comment.pet_id)}>
                  <Image
                    source={{ uri: getProfilePic(comment.profile_pic_thumbnail_small, comment.pet_type) }}
                    style={styles.commentProfilePicStyle}
                  />
                </TouchableOpacity>
                <View style={styles.commentHeaderDetails}>
                  <TouchableOpacity onPress={() => navigateToDashboard(comment.pet_id)}>
                    <Text style={styles.petNameText}>{comment.pet_id}</Text>
                  </TouchableOpacity>
                  <Text style={styles.petTypeText}>{comment.pet_type}</Text>
                </View>
                <TouchableOpacity
                  style={styles.commentAction}
                  onPress={() => handleEllipsisPress(comment.pet_id, comment.comment_id)}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#a2a2a2" />
                </TouchableOpacity>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
              <Text style={styles.createdAtText}>Posted on: {new Date(comment.created_at).toLocaleString()}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <SliderModal
        dropdownVisible={modalVisible}
        setDropdownVisible={setModalVisible}
      >
        <TouchableOpacity onPress={modalContent.onPress}>
          <Text style={modalContent.textStyle}>{modalContent.text}</Text>
        </TouchableOpacity>
      </SliderModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFF",
  },
  petIdText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  inputWithCounter: {
    flex: 1,
    position: "relative",
  },
  commentInput: {
    padding: 8,
    borderWidth: 0.2,
    borderRadius: 25,
    height: 40,
    paddingRight: 50,
  },
  charCount: {
    position: "absolute",
    bottom: 5,
    right: 5,
    color: "#a2a2a2",
    fontSize: 10,
  },

  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    marginBottom: 5,
    position: "relative",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentHeaderDetails: {
    marginLeft: 8,
  },
  petNameText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  petTypeText: {
    fontSize: 12,
    color: "gray",
  },
  commentText: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 4,
    fontWeight: "300",
    color: "#333",
  },
  createdAtText: {
    fontSize: 12,
    color: "gray",
  },
  commentProfilePicStyle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentAction: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  noCommentsContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: "center",
  },

  noCommentsText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  encourageText: {
    fontSize: 16,
    color: "#a2a2a2",
    marginTop: 10,
  },
});

export default CommentScreen;
