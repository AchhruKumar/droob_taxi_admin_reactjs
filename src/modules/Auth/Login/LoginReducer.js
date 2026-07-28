import actions from "../../../redux/actions";
import { setInitialState } from "../../../utils/localStorage";
import {
  VERIFY,
  LOGIN,
  VERIFY_SUCCESS,
  LOGOUT,
  LOGOUT_SUCCESS,
  UPDATE,
  UPDATE_SUCCESS,
} from "./LoginConstants";

function LoginReducer(state = setInitialState(), action) {
  switch (action.type) {
    case LOGIN:
      return { ...state };

    case actions.LOGIN_SUCCESS:
      // payload: { data: user, access_token, loggedIn }
      return {
        ...state,
        ...action.payload,
      };

    case VERIFY:
      return {
        ...state,
        verify: action.payload,
      };

    case VERIFY_SUCCESS:
      return {
        ...state,
        userVerified: action.payload,
      };

    case UPDATE:
      // if you dispatch UPDATE (pre-success) you can optionally set a flag
      return {
        ...state,
      };

    case UPDATE_SUCCESS:
      // payload is full updated auth object: { ...state, data: updatedUser }
      return {
        ...state,
        ...action.payload,
      };

    case LOGOUT:
      return {
        data: null,
        access_token: null,
        loggedIn: false,
      };

    case LOGOUT_SUCCESS:
      return {
        data: null,
        access_token: null,
        loggedIn: false,
      };

    default:
      return state;
  }
}

export default LoginReducer;
