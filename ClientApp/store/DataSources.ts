import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface DataSourcesState {
    isLoading: boolean;
    startDateIndex?: number;
    forDataSource?: string;
    startDate?: Date;
    endDate?: Date;
    datasources: DataSource[];
}

export interface DataSource {
    commonName: string;
    fieldX: string[];
}

export interface DataRequest {
    dataSourceName: string;
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

interface SubmitDataRequestAction {
    type: 'SUBMIT_DATAREQUEST';
    startDateIndex: number;
    forDataSource: string;
}

interface SubmitDataRequestCompmleteAction {
    type: 'SUBMIT_DATAREQUEST_COMPLETE';
    startDateIndex: number;
    forDataSource: string;
    rawresponse?: any;

}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestDataSourcesAction | ReceiveDataSourcesAction | SubmitDataRequestAction | SubmitDataRequestCompmleteAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestDataSources: (startDateIndex: number, dataRequest: DataRequest): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (dataRequest.dataSourceName != '' && startDateIndex == -2) { 
            let dataSources = getState().dataSources.datasources || [];
            let requestBody = {
                "QueryRange": {
                    "End": "10\/24\/2017 10:00:00",
                    "Start": "10\/23\/2017 10:00:00"
                },
                "Sources": [
                    {
                        "Fields": dataSources.filter(x => x.commonName == dataRequest.dataSourceName)[0].fieldX || [],
                        "Name": dataRequest.dataSourceName 
                    }
                ],
                "Stores": [
                    "1234"
                ]
            }

            let fetchDataTask = fetch(`https://fido-queryinvoke-funcapp.azurewebsites.net/api/InvokeQuery?code=ktsBtbU0nduGBT3JF8USAtS6NfPrLn3485L/advxyI4aiUv/m4yaaA==&clientId=default`
                , {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'post',
                    body: JSON.stringify(requestBody)
                })
                .then(response => response.json() as Promise<any>)
                .then(data => {
                    dispatch({ type: 'SUBMIT_DATAREQUEST_COMPLETE', startDateIndex: startDateIndex, forDataSource: dataRequest.dataSourceName, rawresponse: data });
                });

            addTask(fetchDataTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'SUBMIT_DATAREQUEST', startDateIndex: startDateIndex, forDataSource: dataRequest.dataSourceName });
        } else {
        if (startDateIndex !== getState().dataSources.startDateIndex) {
            let fetchTask = fetch(`api/DataSourcesDummyData/DataSources?startDateIndex=${startDateIndex}`)
                .then(response => response.json() as Promise<DataSource[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_DATASOURCES', startDateIndex: startDateIndex, datasources: data });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_DATASOURCES', startDateIndex: startDateIndex });
            }
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
                startDateIndex: (action.startDateIndex > -1 ? action.startDateIndex : 0),
                datasources: state.datasources,
                isLoading: true
            };
        case 'RECEIVE_DATASOURCES':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startDateIndex === state.startDateIndex || action.startDateIndex > -1 ) {
                return {
                    startDateIndex: (action.startDateIndex != -1 ? action.startDateIndex : 0),
                    datasources: action.datasources,
                    isLoading: false
                };
            }
            break;

        case 'SUBMIT_DATAREQUEST':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.forDataSource != '' && action.startDateIndex == -2) {
                return {
                    startDateIndex: (action.startDateIndex > -1  ? action.startDateIndex : 0),
                    isLoading: false,
                    forDataSource: action.forDataSource,
                    datasources: state.datasources
                };
            }
            break;

        case 'SUBMIT_DATAREQUEST_COMPLETE':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.forDataSource != state.forDataSource) {
                return {
                    startDateIndex: (action.startDateIndex > -1  ? action.startDateIndex : 0),
                    isLoading: false,
                    datasources: state.datasources,
                    forDataSource: action.forDataSource
                };
            }
            break;

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
