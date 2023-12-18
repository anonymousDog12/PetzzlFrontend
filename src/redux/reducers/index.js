import { combineReducers } from "redux";
import authReducer from "./auth";
import petProfileReducer from "./petProfile";
import feedReducer from './feed';
import dashboardReducer from "./dashboard";


export default combineReducers({
  auth: authReducer,
  petProfile: petProfileReducer,
  feed: feedReducer,
  dashboard: dashboardReducer,
});
