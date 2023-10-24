import axios from 'axios';
import jwt_decode from 'jwt-decode';
import SecureStorage from 'react-native-secure-storage';


import {
  ACTIVATION_FAIL,
  ACTIVATION_SUCCESS,
  AUTHENTICATED_FAIL,
  AUTHENTICATED_SUCCESS,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  LOAD_TOKENS,
  PASSWORD_RESET_CONFIRM_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_SUCCESS,
  RESEND_ACTIVATION_LINK_FAIL,
  RESEND_ACTIVATION_LINK_RESET,
  RESEND_ACTIVATION_LINK_SUCCESS,
  SIGNUP_FAIL,
  SIGNUP_SUCCESS,
  USER_LOADED_FAIL,
  USER_LOADED_SUCCESS,
} from '../types';

export const loadTokens = () => async dispatch => {
  try {
    const access = await SecureStorage.getItem('access');
    const refresh = await SecureStorage.getItem('refresh');
    dispatch({ type: LOAD_TOKENS, payload: { access, refresh } });
  } catch (error) {
    console.error('Failed retrieving data', error);
  }
};

export const signup = (first_name, last_name, email, password, re_password) => async dispatch => {
  try {
    const config = { headers: {'Content-Type': 'application/json'} };
    const body = JSON.stringify({ first_name, last_name, email, password, re_password });
    const res = await axios.post(`http://localhost:8000/auth/users/`, body, config);
    dispatch({ type: SIGNUP_SUCCESS, payload: res.data });
    return null;
  } catch (err) {
    dispatch({ type: SIGNUP_FAIL });
    return err.response.data;
  }
};

export const login = (email, password) => async dispatch => {
  try {
    const config = { headers: {'Content-Type': 'application/json'} };
    const body = JSON.stringify({email, password});
    const res = await axios.post(`http://localhost:8000/auth/jwt/create/`, body, config);
    dispatch({ type: LOGIN_SUCCESS, payload: res.data });
    await dispatch(load_user());
    return null;
  } catch (err) {
    dispatch({ type: LOGIN_FAIL });
    return err.response.data;
  }
};

export const load_user = () => async dispatch => {
  const access = await SecureStorage.getItem('access');
  if (access) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${access}`,
        'Accept': 'application/json'
      }
    };

    try {
      const res = await axios.get(`http://localhost:8000/auth/users/me/`, config);
      const decodedToken = jwt_decode(access);
      const userId = decodedToken.user_id;
      await SecureStorage.setItem('user_id', userId.toString());
      dispatch({
        type: USER_LOADED_SUCCESS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: USER_LOADED_FAIL
      });
    }
  } else {
    dispatch({
      type: USER_LOADED_FAIL
    });
  }
};
