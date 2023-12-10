import {
  FETCH_FEED,
  ADD_POST,
  SET_FEED_LOADING,
  RESET_POST_STATE,
  UPDATE_SELECTED_PHOTOS,
  UPDATE_CAPTION, DELETE_POST_SUCCESS,
} from "../types";

// Initial state of the feed
const initialState = {
  feed: [],
  loading: false,
  selectedPhotos: [],
  caption: '',
};

// Feed reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_FEED:
      return {
        ...state,
        feed: action.payload,
      };
    case ADD_POST:
      return {
        ...state,
        feed: [action.payload, ...state.feed],
      };
    case SET_FEED_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case RESET_POST_STATE:
      return {
        ...state,
        selectedPhotos: [],
        caption: '',
      };
    case UPDATE_SELECTED_PHOTOS:
      return {
        ...state,
        selectedPhotos: action.payload,
      };
    case UPDATE_CAPTION:
      return {
        ...state,
        caption: action.payload,
      };
    case DELETE_POST_SUCCESS:
      return {
        ...state,
        feed: state.feed.filter(post => post.post_id !== action.payload),
      };
    default:
      return state;
  }
}
