import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface DataSourcesState {
    isLoading: boolean;
    startDateIndex?: number;
    datasources: DataSource[];
}

export interface DataSourceResult {
    Sources: DataSource[]
}

export interface DataSource {
    name: string;
    fields: string[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestDataSourcesAction {
    type: 'REQUEST_DATASOURCES';
    startDateIndex: number;
}

interface ReceiveDataSourcesAction{
    type: 'RECEIVE_DATASOURCES';
    startDateIndex: number;
    datasources: DataSource[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestDataSourcesAction | ReceiveDataSourcesAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestDataSources: (startDateIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (startDateIndex !== getState().dataSources.startDateIndex) {
            let fetchTask = fetch(`metadataendpoint`)
                .then(response => response.json() as Promise<DataSourceResult>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_DATASOURCES', startDateIndex: startDateIndex, datasources: data.Sources });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_DATASOURCES', startDateIndex: startDateIndex });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: DataSourcesState = { datasources: [], isLoading: false };

export const reducer: Reducer<DataSourcesState> = (state: DataSourcesState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_DATASOURCES':
            return {
                startDateIndex: action.startDateIndex,
                datasources: state.datasources,
                isLoading: true
            };
        case 'RECEIVE_DATASOURCES':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startDateIndex === state.startDateIndex) {
                return {
                    startDateIndex: action.startDateIndex,
                    datasources: action.datasources,
                    isLoading: false
                };
            }
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
