import { USER_HAS_PETS, SET_NEW_PET_PROFILE, CURRENT_PET_ID } from "../types";

const initialState = {
  hasPets: false,
  isNewPetProfile: false,
  currentPetId: null,
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
    case CURRENT_PET_ID:
      return {
        ...state,
        currentPetId: action.payload,
      };
    default:
      return state;
  }
};

export default petProfileReducer;
