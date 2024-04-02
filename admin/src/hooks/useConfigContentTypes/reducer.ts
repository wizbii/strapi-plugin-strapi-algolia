import produce from 'immer';

export type State = {
  contentTypes: string[];
  isLoading: boolean;
};

export enum Actions {
  GET_DATA = 'GET_DATA',
  GET_DATA_SUCCEEDED = 'GET_DATA_SUCCEEDED',
  GET_DATA_ERROR = 'GET_DATA_ERROR',
}

export const initialState: State = {
  contentTypes: [],
  isLoading: true,
};

const reducer = (
  state: State,
  action: { type: string; data?: any }
) =>
  produce(state, (draftState: State) => {
    switch (action.type) {
      case Actions.GET_DATA: {
        draftState.isLoading = true;
        draftState.contentTypes = [];
        break;
      }
      case Actions.GET_DATA_SUCCEEDED: {
        draftState.contentTypes = action.data;
        draftState.isLoading = false;
        break;
      }
      case Actions.GET_DATA_ERROR: {
        draftState.isLoading = false;
        break;
      }
      default:
        return draftState;
    }
  });

export default reducer;
