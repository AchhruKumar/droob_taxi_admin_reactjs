import { combineReducers } from "redux";
import RequestReducer from "./requestReducer";
import LoginReducer from "@/modules/Auth/Login/LoginReducer";

const rootReducer = combineReducers({
  request: RequestReducer,
  login: LoginReducer,
});

export default rootReducer;
