import SecureStorage from "react-native-secure-storage";
import { useSelector } from "react-redux";
import { CONFIG } from "../../../config";
import {
  ADD_POST,
  FETCH_FEED,
  RESET_POST_STATE,
  SET_FEED_LOADING,
} from "../types";


export const fetchFeed = (currentPetId, page = 1) => async dispatch => {
  dispatch({ type: SET_FEED_LOADING, payload: true });

  const accessToken = await SecureStorage.getItem("access");
  if (!accessToken) {
    console.error("JWT token not found");
    return;
  }

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/feed/?current_pet_id=${currentPetId}&page=${page}`, {
      method: "GET",
      headers: { "Authorization": `JWT ${accessToken}` },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }

    const data = await response.json();

    dispatch({
      type: FETCH_FEED,
      payload: data.results,
      page: page,
      hasNextPage: !!data.next
    });

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
