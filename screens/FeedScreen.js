import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Progress from 'react-native-progress';
import SecureStorage from "react-native-secure-storage";
import { fetchFeed, addPost } from "../redux/actions/feed";
import { CONFIG } from "../config";

const FeedScreen = ({ route }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const feedData = useSelector(state => state.feed.feed);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const { postDetails } = route.params || {};

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const handlePostUpload = async ({ selectedPhotos, caption, petId }) => {
    setIsUploading(true);

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
      console.log('++++++');
      console.log(media);


      formData.append("media_files", {
        name: `media_${index}${media.extension}`, // Use the original extension
        type: media.mimeType, // Use the mimeType from Redux state
        uri: media.uri
      });
    });




    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/create_post/`, {
        method: 'POST',
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "multipart/form-data"
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Post created successfully:", result);
        dispatch(addPost(result));
        setPostSuccess(true);
        dispatch(fetchFeed()); // Fetch the updated feed
      } else {
        console.error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // If there are post details, upload the post
  useEffect(() => {
    if (postDetails) {
      handlePostUpload(postDetails);
    }
  }, [postDetails]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Hello {user ? user.first_name : "World"}!</Text>
      {postDetails && isUploading && <Progress.Bar indeterminate={true} width={200} />}
      {postSuccess && <Text>Post successful! {" "}✓</Text>}
      {feedData.map((post, index) => (
        <View key={index}>
          <Text>{post.caption}</Text>
          {post.media?.map((mediaItem, mediaIndex) => (
            <Image
              key={mediaIndex}
              source={{ uri: mediaItem.thumbnail_medium_url }}
              style={styles.image}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    margin: 5,
  },
});

export default FeedScreen;
