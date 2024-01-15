import { USER_HAS_PETS, SET_NEW_PET_PROFILE, CURRENT_PET_ID, SET_USER_PET_IDS, RESET_STATE } from "../types";

const initialState = {
  hasPets: false,
  isNewPetProfile: false,
  currentPetId: null,
  ownedPetIds: {},
};

const petProfileReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_HAS_PETS:
      return {
        ...state,
        hasPets: action.payload,
      };
    case SET_NEW_PET_PROFILE:
      return {
        ...state,
        isNewPetProfile: action.payload,
      };
    case CURRENT_PET_ID:
      return {
        ...state,
        currentPetId: action.payload,
      };
    case SET_USER_PET_IDS:
      return {
        ...state,
        ownedPetIds: action.payload,
      };
    case RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

export default petProfileReducer;
