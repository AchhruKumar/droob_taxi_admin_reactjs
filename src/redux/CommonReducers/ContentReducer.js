import actions from "@/redux/actions";

const initialState = {
  content: {},
};

function ContentReducer(state = initialState, action, key) {
  switch (action.type) {
    case actions.CONTENT:
      return {
        content: action.payload.data,
      };
    default:
      return initialState;
  }
}

export default ContentReducer;
