import { USER_HAS_PETS, SET_NEW_PET_PROFILE } from "../types";

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
