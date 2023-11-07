import axios from "axios";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../config";
import { setHasPets } from './petProfile';

import {
  AUTHENTICATED_FAIL,
  AUTHENTICATED_SUCCESS,
  LOAD_TOKENS,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_SUCCESS,
  SIGNUP_FAIL,
  SIGNUP_SUCCESS,
  USER_LOADED_FAIL,
  USER_LOADED_SUCCESS,
} from "../types";


export const loadTokens = () => async dispatch => {
  try {
    const access = await SecureStorage.getItem("access");
    const refresh = await SecureStorage.getItem("refresh");

    if (access && refresh) {
      dispatch({ type: AUTHENTICATED_SUCCESS });
      dispatch(load_user()); // Add this line to load the user and check for pets
    } else {
      dispatch({ type: AUTHENTICATED_FAIL });
    }

    dispatch({ type: LOAD_TOKENS, payload: { access, refresh } });
  } catch (error) {
    console.error("Failed retrieving data", error);
    dispatch({ type: AUTHENTICATED_FAIL });
  }
};


export const signup = (first_name, last_name, email, password, re_password) => async dispatch => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const body = JSON.stringify({ first_name, last_name, email, password, re_password });
    const res = await axios.post(`${CONFIG.BACKEND_URL}/auth/users/`, body, config);
    dispatch({ type: SIGNUP_SUCCESS, payload: res.data });
    return null;
  } catch (err) {
    dispatch({ type: SIGNUP_FAIL });
    return err.response.data;
  }
};

export const login = (email, password) => async dispatch => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const body = JSON.stringify({ email, password });
    const res = await axios.post(`${CONFIG.BACKEND_URL}/auth/jwt/create/`, body, config);
    dispatch({ type: LOGIN_SUCCESS, payload: res.data });
    await dispatch(load_user());
    return null;
  } catch (err) {
    dispatch({ type: LOGIN_FAIL });
    return err.response.data;
  }
};

export const load_user = () => async dispatch => {
  const access = await SecureStorage.getItem("access");
  if (access) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `JWT ${access}`,
        "Accept": "application/json",
      },
    };

    try {
      const res = await axios.get(`${CONFIG.BACKEND_URL}/auth/users/me/`, config);
      dispatch({
        type: USER_LOADED_SUCCESS,
        payload: res.data,
      });

      // Now check if the user has pets
      const petRes = await axios.get(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${res.data.id}/`);
      const userHasPets = petRes.data && Array.isArray(petRes.data) && petRes.data.length > 0;
      dispatch(setHasPets(userHasPets));
    }
    catch (err) {
      dispatch({
        type: USER_LOADED_FAIL,
      });
    }
  } else {
    dispatch({
      type: USER_LOADED_FAIL,
    });
  }
};


export const reset_password = (email) => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ email });

  try {
    await axios.post(`${CONFIG.BACKEND_URL}/auth/users/reset_password/`, body, config);

    dispatch({
      type: PASSWORD_RESET_SUCCESS,
    });
  } catch (err) {
    dispatch({
      type: PASSWORD_RESET_FAIL,
    });
  }
};
