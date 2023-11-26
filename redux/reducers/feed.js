import { FETCH_FEED, ADD_POST, SET_FEED_LOADING } from '../types';

const initialState = {
  feed: [],
  loading: false,
};

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
    default:
      return state;
  }
}
