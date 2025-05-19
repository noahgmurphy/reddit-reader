import { createSlice } from '@reduxjs/toolkit';

 const postsSlice = createSlice({
    name: 'posts',
    initialState: 'hello',
    reducers:{},
    
})

export const postsReducer = postsSlice.reducer;