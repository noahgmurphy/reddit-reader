import {configureStore} from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { postsReducer } from './features/posts/postsSlice.js'


export const renderWithProvider = (component) => {
    const store = configureStore({
        reducer:{
             posts: postsReducer
        },
        middleware:(getDefaultMiddleware) => getDefaultMiddleware()   
    });
    render(
        <Provider store={store}>
            {component}
        </Provider>
    );
    return store;
}