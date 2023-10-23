import axios from 'axios';
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
