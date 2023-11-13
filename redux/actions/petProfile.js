import { USER_HAS_PETS, SET_NEW_PET_PROFILE } from "../types";
import { CommonActions } from '@react-navigation/native';

// Existing setHasPets action creator
export const setHasPets = (hasPets) => {
  return {
    type: USER_HAS_PETS,
    payload: hasPets,
  };
};

// New action creator for isNewPetProfile
export const setNewPetProfile = (isNewPetProfile) => {
  return {
    type: SET_NEW_PET_PROFILE,
    payload: isNewPetProfile,
  };
};



export const setHasPetsAndNavigate = (hasPets, navigation) => (dispatch) => {
  dispatch(setHasPets(hasPets));
  dispatch(setNewPetProfile(false));
  // If you have asynchronous actions, make sure they are completed before resolving.
  return Promise.resolve();
};
