import actions from "../actions";
const initialState = {
  loader: false,
  message: null,
  messageType: null,
};

function RequestReducer(STATE = initialState, action, reducerType = null) {
  
  switch (action.type) {
    case actions.PROCESSING:
      return {
        loader: true,
        message: null,
        messageType: null,
      };

    case actions.FAILURE:
      return {
        loader: false,
        message: action.payload.message,
        messageType: "error",
      };
    case actions.SUCCESS:
      return {
        loader: false,
        message: action.payload.message,
        messageType: "success",
      };

    case actions.INIT_LOADER:
      return { ...STATE, loader: action.payload.loader };
    default:
      return initialState;
  }
}

export default RequestReducer;
