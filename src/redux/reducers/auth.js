import SecureStorage from "react-native-secure-storage";
import {
  ACTIVATION_FAIL,
  ACTIVATION_SUCCESS,
  AUTHENTICATED_FAIL,
  AUTHENTICATED_SUCCESS,
  LOAD_TOKENS,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
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
} from "../types";


const initialState = {
  access: null,
  refresh: null,
  isAuthenticated: null,
  user: null,
  resendActivationSuccess: false,
  resendActivationFail: false,
};


function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case LOAD_TOKENS:
      return {
        ...state,
        access: payload.access,
        refresh: payload.refresh,
      };

    case AUTHENTICATED_SUCCESS:
      return {
        ...state,
        isAuthenticated: state.user != null,
      };

    case LOGIN_SUCCESS:
      SecureStorage.setItem("access", payload.access);
      SecureStorage.setItem("refresh", payload.refresh);
      return {
        ...state,
        isAuthenticated: true,
        access: payload.access,
        refresh: payload.refresh,
      };

    case SIGNUP_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
      };

    case USER_LOADED_SUCCESS:
      return {
        ...state,
        user: payload,
      };

    case AUTHENTICATED_FAIL:
      return {
        ...state,
        isAuthenticated: false,
      };

    case USER_LOADED_FAIL:
      return {
        ...state,
        user: null,
      };

    case LOGIN_FAIL:
    case SIGNUP_FAIL:
    case LOGOUT:
      SecureStorage.removeItem("access");
      SecureStorage.removeItem("refresh");
      return {
        ...state,
        access: null,
        refresh: null,
        isAuthenticated: false,
        user: null,
      };
    case PASSWORD_RESET_SUCCESS:
    case PASSWORD_RESET_FAIL:
    case PASSWORD_RESET_CONFIRM_SUCCESS:
    case PASSWORD_RESET_CONFIRM_FAIL:
    case ACTIVATION_SUCCESS:
    case ACTIVATION_FAIL:
      return {
        ...state,
      };

    case RESEND_ACTIVATION_LINK_SUCCESS:
      return {
        ...state,
        resendActivationSuccess: true,
        resendActivationFail: false,
      };

    case RESEND_ACTIVATION_LINK_FAIL:
      return {
        ...state,
        resendActivationSuccess: false,
        resendActivationFail: true,
      };

    case RESEND_ACTIVATION_LINK_RESET:
      return {
        ...state,
        resendActivationSuccess: false,
        resendActivationFail: false,
      };

    default:
      return state;
  }
}

export default authReducer;
