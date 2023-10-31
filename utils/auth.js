import axios from "axios";
import { CONFIG } from "../config";

export const checkEmailExists = async (email) => {
  try {
    const response = await axios.post(`${CONFIG.BACKEND_URL}/api/accounts/check-email/`, {email});
    return !response.data.isNewUser;
  } catch (error) {
    console.error("Error checking email:", error);
    return "error";
  }
};

export const extractErrorMessages = (response) => {
  const keys = Object.keys(response);
  return keys.map((key) => {
    let msg = response[key];
    if (key === 'email' && msg.includes("user account with this email already exists.")) {
      return `${msg} Please try logging in or use a different email address.`;
    } else {
      return msg;
    }
  });
};
