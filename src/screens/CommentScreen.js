import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { useSelector } from "react-redux";
import { CONFIG } from "../../config";
import { getProfilePic } from "../utils/common";

const CommentScreen = ({ route }) => {
  const { postId } = route.params;
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const [postingStatus, setPostingStatus] = useState({ isPosting: false, isSuccess: false, message: "" });

  // Fetch the current pet profile picture from the redux state
  const currentPetProfilePic = useSelector(state => state.petProfile.currentPetProfilePic);
  const currentPetId = useSelector(state => state.petProfile.currentPetId); // Assuming you have access to currentPetId

  useEffect(() => {
    fetchComments();
  }, []);

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
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentSubmit = async () => {
    const accessToken = await SecureStorage.getItem("access");
    if (comment.trim().length > 0) {
      setPostingStatus({ isPosting: true, isSuccess: false, message: "Posting..." });

      // Create the temporary comment object with the current pet's profile picture URI
      const tempComment = {
        comment_id: `temp-${Date.now()}`,
        pet_id: currentPetId,
        content: comment.trim(),
        created_at: new Date().toISOString(),
        profile_pic_thumbnail_small: currentPetProfilePic, // Use the current pet's profile picture URI
      };

      // Add the temporary comment to the local state
      setComments(prevComments => [tempComment, ...prevComments]);

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

        if (!response.ok) {
          console.error("Network response was not ok");
          // Optionally handle failed post attempt, e.g., by removing the temporary comment
        }

        setPostingStatus({ isPosting: false, isSuccess: true, message: "Successfully posted!" });
        setComment("");

        // No need to update the temporary comment with real data from the response here
        // since we're not replacing the temp comment in this simplified example
      } catch (error) {
        console.error("Error posting comment:", error);
        // Optionally handle error by removing the temporary comment
        setComments(prevComments => prevComments.filter(c => c.comment_id !== tempComment.comment_id));
        setPostingStatus({ isPosting: false, isSuccess: false, message: "Failed to post comment." });
      }
    }
  };


  return (
    <>
      <View style={styles.inputContainer}>
        <Image
          source={{ uri: currentPetProfilePic }}
          style={styles.commentProfilePicStyle}
        />
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          multiline={false}
          returnKeyType="send"
          onChangeText={setComment}
          value={comment}
          autoFocus={true}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (comment.trim().length > 0) {
              handleCommentSubmit();
            }
          }}
        />
      </View>
      <ScrollView style={styles.container}>
        {postingStatus.isPosting && <ActivityIndicator size="small" color="#0000ff" />}
        {postingStatus.message !== "" && (
          <Text style={{ color: postingStatus.isSuccess ? "green" : "red" }}>
            {postingStatus.message}
          </Text>
        )}
        {comments.map((comment) => (
          <View key={comment.comment_id} style={styles.commentContainer}>
            <Image
              source={{ uri: getProfilePic(comment.profile_pic_thumbnail_small, comment.pet_type) }}
              style={styles.commentProfilePicStyle}
            />
            <Text style={styles.petIdText}>{comment.pet_id}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.createdAtText}>Posted on: {new Date(comment.created_at).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFF", // Consider setting a background color for better visibility
  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 5,
  },
  petIdText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  createdAtText: {
    fontSize: 12,
    color: "gray",
  },
  commentProfilePicStyle: {
    width: 40,
    height: 40,
    borderRadius: 20, // Adjust as needed
    marginRight: 8, // Space between image and text input
  },
  commentInput: {
    flex: 1,
    padding: 8,
    borderWidth: 0.2,
    borderRadius: 25,
    height: 40, // Adjust height as needed
  },
});

export default CommentScreen;
