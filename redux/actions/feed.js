import { FETCH_FEED, ADD_POST, SET_FEED_LOADING } from '../types';
import SecureStorage from 'react-native-secure-storage';
import { CONFIG } from '../../config';

export const fetchFeed = () => async dispatch => {
  dispatch({ type: SET_FEED_LOADING, payload: true });

  const accessToken = await SecureStorage.getItem('access');
  if (!accessToken) {
    console.error('JWT token not found');
    return;
  }

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/feed/`, {
      method: 'GET',
      headers: { 'Authorization': `JWT ${accessToken}` },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }

    const data = await response.json();
    dispatch({ type: FETCH_FEED, payload: data });
  } catch (error) {
    console.error('Error fetching feed:', error);
  }

  dispatch({ type: SET_FEED_LOADING, payload: false });
};

export const addPost = post => ({
  type: ADD_POST,
  payload: post,
});
