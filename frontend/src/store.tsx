import { createStore, AnyAction } from "redux";

interface State {
  sidebarShow: boolean;
}

const initialState: State = {
  sidebarShow: true,
};

const changeState = (
  state: State = initialState,
  { type, ...rest }: AnyAction
): State => {
  switch (type) {
    case "set":
      return { ...state, ...rest };
    default:
      return state;
  }
};

const store = createStore(changeState);
export default store;
