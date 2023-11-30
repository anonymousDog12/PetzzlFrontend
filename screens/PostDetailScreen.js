import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { CONFIG } from "../config";

const PostDetailScreen = ({ route }) => {
  const { postId } = route.params;
  const [postDetails, setPostDetails] = useState(null);

  useEffect(() => {
    // Fetch full-size media for the post
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
    return <Text>Loading...</Text>; // Or any other loading indicator
  }

  return (
    <ScrollView>
      <Text>{postDetails.caption}</Text>
      {postDetails.media.map((mediaItem) => (
        <Image
          key={mediaItem.media_id}
          source={{ uri: mediaItem.full_size_url }}
          style={{ width: '100%', height: 300 }} // Adjust styling as needed
        />
      ))}
    </ScrollView>
  );
};

export default PostDetailScreen;
