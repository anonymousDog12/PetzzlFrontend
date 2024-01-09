import { useState, useEffect } from 'react';
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../config";

export const usePostLike = (postId, currentPetId) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const accessToken = await SecureStorage.getItem("access");
      if (accessToken && currentPetId) {
        try {
          const likeStatusResponse = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${currentPetId}/`, {
            method: "GET",
            headers: {
              "Authorization": `JWT ${accessToken}`,
            },
          });
          if (likeStatusResponse.ok) {
            const { liked } = await likeStatusResponse.json();
            setIsLiked(liked);
          }
        } catch (error) {
          console.error("Error fetching like status:", error);
        }
      }
    };

    const fetchLikeCount = async () => {
      try {
        const likeCountResponse = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likecount/`);
        const { like_count } = await likeCountResponse.json();
        setLikeCount(like_count);
      } catch (error) {
        console.error("Error fetching like count:", error);
      }
    };

    fetchLikeStatus();
    fetchLikeCount();
  }, [postId, currentPetId]);

  const toggleLike = async () => {
    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken || !currentPetId) return;

    const url = `${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/${isLiked ? 'unlike' : 'like'}/${currentPetId}/`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `JWT ${accessToken}` }
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prevCount => isLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);
      } else {
        console.error("Failed to toggle like status");
      }
    } catch (error) {
      console.error("Error toggling like status:", error);
    }
  };

  return { isLiked, likeCount, toggleLike };
};
