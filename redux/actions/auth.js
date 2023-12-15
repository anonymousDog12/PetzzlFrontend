import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../config";

import {
  AUTHENTICATED_FAIL,
  AUTHENTICATED_SUCCESS,
  LOAD_TOKENS,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_SUCCESS,
  SIGNUP_FAIL,
  SIGNUP_SUCCESS,
  USER_LOADED_FAIL,
  USER_LOADED_SUCCESS,
} from "../types";
import { setCurrentPetId, setHasPets, setNewPetProfile } from "./petProfile";


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
    dispatch(setNewPetProfile(true));
    dispatch(setHasPets(false));
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

      // Check if the user has pets and set the current pet ID
      const petRes = await axios.get(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${res.data.id}/`, config);
      const userHasPets = petRes.data && Array.isArray(petRes.data) && petRes.data.length > 0;
      dispatch(setHasPets(userHasPets));
      dispatch(setNewPetProfile(!userHasPets));

      if (userHasPets) {
        // Set the first pet's ID as the current pet ID
        dispatch(setCurrentPetId(petRes.data[0].pet_id));
      }
    } catch (err) {
      // Check if the error is due to an expired token
      if (err.response && err.response.data.code === "token_not_valid") {
        // Token is invalid or expired
        dispatch({ type: AUTHENTICATED_FAIL });
        SecureStorage.removeItem("access");
        SecureStorage.removeItem("refresh");
      } else {
        // Handle other errors
        dispatch({ type: USER_LOADED_FAIL });
      }
    }
  } else {
    // Handle no access token found
    dispatch({ type: USER_LOADED_FAIL });
    dispatch({ type: AUTHENTICATED_FAIL });
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

export const logout = () => async dispatch => {
  // Remove the tokens from SecureStorage
  await SecureStorage.removeItem("access");
  await SecureStorage.removeItem("refresh");

  // Clear the selectedPetId from AsyncStorage
  await AsyncStorage.removeItem("selectedPetId");

  // Dispatch the LOGOUT action to update the Redux state
  dispatch({ type: LOGOUT });
};
