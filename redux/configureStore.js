import { configureStore } from '@reduxjs/toolkit'
import { user } from './user';
import { loggedIn } from './loggedIn';

export const ConfigureStore = () => {
    const store = configureStore({
        reducer: {
            user: user,
            loggedIn: loggedIn,
        },
    });

    return store;
}