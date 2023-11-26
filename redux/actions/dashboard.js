import { CONFIG } from "../../config";
import { FETCH_POSTS, ADD_POST } from '../types';

// Action to fetch posts
export const fetchPosts = petId => async dispatch => {
  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/pet_posts/${petId}/`);
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
