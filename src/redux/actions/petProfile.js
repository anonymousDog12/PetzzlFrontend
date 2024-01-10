import { CURRENT_PET_ID, SET_NEW_PET_PROFILE, SET_USER_PET_IDS, USER_HAS_PETS } from "../types";

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


export const setHasPetsAndNavigate = (hasPets, navigation, isNewPetProfile = false) => (dispatch) => {
  dispatch(setHasPets(hasPets));
  dispatch(setNewPetProfile(isNewPetProfile));
  // If you have asynchronous actions, make sure they are completed before resolving.
  return Promise.resolve();
};


export const setCurrentPetId = (petId) => {
  return {
    type: CURRENT_PET_ID,
    payload: petId,
  };
};

// List of pet ids owned by the current user
export const setUserPetIds = (petIds) => ({
  type: SET_USER_PET_IDS,
  payload: petIds,
});
