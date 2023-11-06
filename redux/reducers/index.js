import { combineReducers } from "redux";
import authReducer from "./auth";
import petProfileReducer from "./petProfile";


export default combineReducers({
  auth: authReducer,
  petProfile: petProfileReducer,
});
