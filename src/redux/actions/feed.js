import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../../config";
import {
  ADD_POST,
  FETCH_FEED,
  RESET_POST_STATE,
  SET_FEED_LOADING,
  UPDATE_CAPTION,
  UPDATE_SELECTED_PHOTOS,
} from "../types";


export const fetchFeed = (page = 1) => async dispatch => {
  dispatch({ type: SET_FEED_LOADING, payload: true });

  const accessToken = await SecureStorage.getItem("access");
  if (!accessToken) {
    console.error("JWT token not found");
    return;
  }

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/feed/?page=${page}`, {
      method: "GET",
      headers: { "Authorization": `JWT ${accessToken}` },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }

    const data = await response.json();
    dispatch({ type: FETCH_FEED, payload: data.results, page: page });
  } catch (error) {
    console.error("Error fetching feed:", error);
  }

  dispatch({ type: SET_FEED_LOADING, payload: false });
};

export const addPost = post => ({
  type: ADD_POST,
  payload: post,
});

export const resetPostState = () => ({
  type: RESET_POST_STATE,
});


export const updateSelectedPhotos = (photos) => ({
  type: UPDATE_SELECTED_PHOTOS,
  payload: photos.map(photo => {
    const isVideo = photo.playableDuration > 0;
    const mimeType = isVideo ? `video/${photo.extension}` : `image/${photo.extension}`;
    const extension = `.${photo.extension}`;
    return {
      uri: photo.uri,
      mimeType, // e.g., 'video/mp4' for videos, 'image/png' for images
      extension, // e.g., '.mp4' for videos, '.png' for images
    };
  }),
});


export const updateCaption = (caption) => ({
  type: UPDATE_CAPTION,
  payload: caption,
});
