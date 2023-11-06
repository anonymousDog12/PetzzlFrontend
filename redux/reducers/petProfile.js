import { USER_HAS_PETS, SET_NEW_PET_PROFILE } from "../types";

const initialState = {
  hasPets: false,
  isNewPetProfile: false,
};

const petProfileReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_HAS_PETS:
      return {
        ...state,
        hasPets: action.payload,
      };
    case SET_NEW_PET_PROFILE: // Handle the new action
      return {
        ...state,
        isNewPetProfile: action.payload,
      };
    default:
      return state;
  }
};

export default petProfileReducer;
