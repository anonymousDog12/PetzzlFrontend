import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { useSelector } from "react-redux";
import { CONFIG } from "../../config";
import PostSection from "../components/PostSection";
import { usePostLike } from "../hooks/usePostLike";


const OtherUserPostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const { postId, petId, petProfilePic } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);

  const { isLiked, likeCount, toggleLike } = usePostLike(postId, currentPetId);


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
    <SafeAreaView style={{ flex: 1 }}>
      <PostSection
        petProfile={{ profile_pic_thumbnail_small: petProfilePic, pet_name: petId }}
        postDetails={postDetails}
        showEllipsis={false}
        isLiked={isLiked}
        likeCount={likeCount}
        handleLikePress={toggleLike}
      />
    </SafeAreaView>
  );
};

export default OtherUserPostDetailScreen;
