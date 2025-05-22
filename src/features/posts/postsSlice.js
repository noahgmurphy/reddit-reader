import { createAsyncThunk, createSlice, current} from '@reduxjs/toolkit';

 export const fetchPostData = createAsyncThunk(
    'posts/fetchPostData',
    async(thunkAPI)=>{
        
        const response = await fetch('https://www.reddit.com/r/mildlyinfuriating/comments/1krzw9k/received_a_call_from_the_hoa_lawyer_threatening_a.json');
        const data = await response.json();
        return data;
    }
 )
 const postsSlice = createSlice({
    name: 'posts',
    initialState: [],
    reducers:{
        /*
        retrieveMock: ((state, action)=>{
            const result = action.payload.data;
            state.push(action.payload);
        }),

        parseMock: ((state)=>{

            const {title, ups, downs, num_comments} = state[0][0].data.children[0].data;
            console.log(title)
            return{
                title,
                ups,
                downs,
                num_comments
            };
        })
        */
    },
    extraReducers: builder => {
        builder.addCase(fetchPostData.pending, () =>{
            console.log("loading");
        })
        builder.addCase(fetchPostData.fulfilled, (state, action) => {
           console.log("success");
           state.push(action.payload); 
           const data = (current(state));
           console.log(data[0][0].data.children[0].data);
        })
        builder.addCase(fetchPostData.rejected, () => {
            console.log("failed");
        })
    }
})

export const postsReducer = postsSlice.reducer;
export const { parseMock } = postsSlice.actions;