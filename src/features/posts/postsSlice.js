import { createAsyncThunk, createSlice, current} from '@reduxjs/toolkit';

 export const fetchPostData = createAsyncThunk(
    'posts/fetchPostData',
    async(arg, {getState})=>{
        let state = getState();
        let url = 'https://www.reddit.com'
        if(arg && arg.firstPage===true){
           url += '/search.json?q=';
           url += arg.url;
        }
        else if (arg && arg.firstPage===false){
            url += '/search.json?q=';
            url += arg.url;
            url += state.posts.after;
        }
        else{
            url += '.json';
        }
        console.log(url)
        const response = await fetch(url);
        const data = await response.json();
        return {
            data:data,
            firstPage: arg.firstPage

        };
    }
 )
 const postsSlice = createSlice({
    name: 'posts',
    initialState: {postData:[], 
        isLoading: false,
        after: ""
    },
    reducers:{},
    extraReducers: builder => {
        builder.addCase(fetchPostData.pending, (state, action) =>{
            console.log("loading");
            state.isLoading = true;
            
        })
        builder.addCase(fetchPostData.fulfilled, (state, action) => {
           console.log("success");
           state.isLoading = false;
            if(action.payload.firstPage === true){
            state.postData = [];
            state.postData[0] = action.payload.data;
            state.after=action.payload.data.data.after;
            }
            else{
                state.postData[0].data.children.push(...action.payload.data.data.children);
                state.after=action.payload.data.data.after;
                
            }
        
           const data = (current(state));
           //console.log(data[0][0].data.children[0].data);
           console.log(data)
        })
        builder.addCase(fetchPostData.rejected, (state) => {
            console.log("failed");
            state.isLoading = false;
        })
    }
})

export const postsReducer = postsSlice.reducer;
export const { parseMock } = postsSlice.actions;