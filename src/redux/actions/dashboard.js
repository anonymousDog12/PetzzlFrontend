import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../../config";
import { FETCH_POSTS, ADD_POST, DELETE_POST_SUCCESS } from "../types";

// Action to fetch posts
export const fetchPosts = petId => async dispatch => {
  try {
    const accessToken = await SecureStorage.getItem("access");
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/pet_posts/${petId}/`, {
      headers: {
        "Authorization": `JWT ${accessToken}`
      }
    });
    const data = await response.json();
    dispatch({ type: FETCH_POSTS, payload: data });
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

export const addPost = response => ({
  type: ADD_POST,
  payload: {
    post_id: response.post_id,
    thumbnail_url: response.thumbnail_small_url,
    // Add other fields if needed
  },
});


export const deletePostSuccess = postId => ({
  type: DELETE_POST_SUCCESS,
  payload: postId,
});
