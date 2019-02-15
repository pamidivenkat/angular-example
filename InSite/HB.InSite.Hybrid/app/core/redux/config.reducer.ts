import { ConfigActionsUnion, ConfigActionTypes, } from './config.actions';

export interface State {
    loaded?: boolean;
    user?: any;
    isLoggedIn?: boolean;
    showBack?: boolean;
    clearStatusCount?: number;
    expiringContent?: number;
    notificationCount?: number;
    publishedDate?: string;
    searchPhrase?: string;
    isLoading?: boolean;
}

const initialState: State = {
    loaded: false,
    user: null,
    isLoggedIn: false,
    showBack: false,
    clearStatusCount: 0,
    expiringContent: 0,
    notificationCount: 0,
    publishedDate: '2018-7-19 11:47:05',
    searchPhrase: '',
    isLoading: true
};


export function reducer(
    state: State = initialState,
    action: ConfigActionsUnion
): State {
    // Quick Helper for New Object
    const newState = (payload) => Object.assign({}, state, payload);
    // Reducer
    switch (action.type) {
        case ConfigActionTypes.LoadConfig:
            return newState({
                loaded: true,
            });
        case ConfigActionTypes.UserLoaded:
            return newState({ user: action.payload, isLoggedIn: true });
        case ConfigActionTypes.UserUnloaded:
            return newState({ user: null, isLoggedIn: false });
        case ConfigActionTypes.PublishedDate:
        case ConfigActionTypes.ClearStatusCount:
        case ConfigActionTypes.NotificationCount:
        case ConfigActionTypes.HeaderCounts:
        case ConfigActionTypes.ExpiringContent:
            return newState(action.payload);

        default:
            return state;
    }
}
