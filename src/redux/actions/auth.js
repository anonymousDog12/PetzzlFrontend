import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../../config";

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
import { setCurrentPetId, setHasPets, setNewPetProfile, setUserPetIds } from "./petProfile";


export const loadTokens = () => async dispatch => {
  try {
    const access = await SecureStorage.getItem("access");
    const refresh = await SecureStorage.getItem("refresh");

    if (access && refresh) {
      await dispatch(load_user());
      dispatch({ type: AUTHENTICATED_SUCCESS });
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

let isRefreshingToken = false;

export const refreshToken = () => async dispatch => {


  if (isRefreshingToken) return;
  isRefreshingToken = true;

  const refresh = await SecureStorage.getItem("refresh");
  if (refresh) {
    try {
      const res = await axios.post(`${CONFIG.BACKEND_URL}/auth/jwt/refresh/`, { refresh });
      await SecureStorage.setItem("access", res.data.access);
      await SecureStorage.setItem("refresh", res.data.refresh);
      dispatch({ type: AUTHENTICATED_SUCCESS });
    } catch (error) {
      console.error("Failed to refresh token", error);
      dispatch({ type: AUTHENTICATED_FAIL });
      // Additional logic for error handling
    } finally {
      isRefreshingToken = false;
    }
  } else {
    dispatch({ type: AUTHENTICATED_FAIL });
    isRefreshingToken = false;
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
      dispatch({ type: USER_LOADED_SUCCESS, payload: res.data });

      try {
        const petRes = await axios.get(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${res.data.id}/`, config);
        // Converting to map for easier lookups
        const petIdMap = petRes.data.reduce((map, petProfile) => {
          map[petProfile.pet_id] = true;
          return map;
        }, {});
        dispatch(setUserPetIds(petIdMap));

        const petIds = Object.keys(petIdMap); // Get pet IDs from the map
        if (petIds.length > 0) {
          dispatch(setCurrentPetId(petIds[0]));
        }
        dispatch(setHasPets(petIds.length > 0));
        dispatch(setNewPetProfile(petIds.length === 0));
      } catch (error) {
        console.error("Error fetching user's pet profiles", error);
      }
    } catch (err) {
      if (err.response && err.response.data.code === "token_not_valid") {
        dispatch({ type: AUTHENTICATED_FAIL });
        dispatch(refreshToken());
      } else {
        dispatch({ type: USER_LOADED_FAIL });
      }
    }
  } else {
    dispatch({ type: USER_LOADED_FAIL });
    dispatch({ type: AUTHENTICATED_FAIL });
  }
};


// New Apple Sign-In action
export const appleSignIn = (identityToken, firstName, lastName) => async dispatch => {
  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/accounts/apple-sign-in/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity_token: identityToken,
        first_name: firstName || "",
        last_name: lastName || "",
      }),
    });

    const data = await response.json();
    if (!response.ok) console.error("Apple Sign-In failed");

    // Store tokens securely
    await SecureStorage.setItem('access', data.token.access);
    await SecureStorage.setItem('refresh', data.token.refresh);

    // Update Redux state
    dispatch({ type: LOGIN_SUCCESS, payload: data.token });

    console.log("successfully signed in with apple")

    await dispatch(load_user());

  } catch (error) {
    console.error("Apple Sign-In error:", error);
    dispatch({ type: LOGIN_FAIL });
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
