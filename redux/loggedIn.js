import * as ActionTypes from './ActionTypes';

export const loggedIn = (state  = { isLoading: true,
                                    errMess: null,
                                    loggedIn: false}, action) => {
    switch (action.type) {
        case ActionTypes.SET_LOGGEDIN:
        return {...state, isLoading: false, errMess: null, loggedIn: action.payload};

        default:
          return state;
    }
};