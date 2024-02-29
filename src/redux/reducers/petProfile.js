import { CURRENT_PET_ID, RESET_STATE, SET_NEW_PET_PROFILE, SET_USER_PET_IDS, USER_HAS_PETS } from "../types";


const initialState = {
  hasPets: false,
  isNewPetProfile: false,
  currentPetId: null,
  ownedPetIds: {},
  currentPetProfilePic: "",
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
        currentPetId: action.payload.petId,
        currentPetProfilePic: action.payload.profilePicThumbnailSmall,
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
