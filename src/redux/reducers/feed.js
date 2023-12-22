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
  hasNextPage: true, // Add this to track if there are more pages
};


// Feed reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_FEED:
      // Check if it's the first page or appending data
      if (action.page === 1) {
        return {
          ...state,
          feed: action.payload,
          hasNextPage: action.hasNextPage
        };
      } else {
        // Ensure that we are not appending the same data
        const lastPostId = state.feed[state.feed.length - 1]?.post_id;
        if (lastPostId !== action.payload[0]?.post_id) {
          return {
            ...state,
            feed: [...state.feed, ...action.payload],
            hasNextPage: action.hasNextPage
          };
        }
      }
      return state;
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
