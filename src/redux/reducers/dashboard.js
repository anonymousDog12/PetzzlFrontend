import { FETCH_POSTS, ADD_POST, DELETE_POST_SUCCESS } from '../types';

const initialState = {
  posts: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_POSTS:
      return {
        ...state,
        posts: action.payload,
      };
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    case DELETE_POST_SUCCESS:
      return {
        ...state,
        posts: state.posts.filter(post => post.post_id !== action.payload),
      };
    default:
      return state;
  }
}
