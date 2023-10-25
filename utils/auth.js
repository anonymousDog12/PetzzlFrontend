import axios from "axios";

export const checkEmailExists = async (email) => {
  try {
    const response = await axios.post(`http://localhost:8000/api/accounts/check-email/`, {email});
    return !response.data.isNewUser;
  } catch (error) {
    console.error("Error checking email:", error);
    return "error";
  }
};
