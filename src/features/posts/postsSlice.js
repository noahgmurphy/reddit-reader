import { createAsyncThunk, createSlice, current} from '@reduxjs/toolkit';

export const fetchPostData = createAsyncThunk(
    'posts/fetchPostData',
    async(arg, {getState})=>{
        let state = getState();
        let url = 'https://www.reddit.com'
        if(arg && arg.firstPage===true){
           url += '/search.json?q=';
           url += arg.url;
           url += "&raw_json=1"
        }
        else if (arg && arg.firstPage===false){
            url += '/search.json?q=';
            url += arg.url;
            url += state.posts.after;
            url += "&raw_json=1"
        }
        else{
            console.log("else called")
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

 export const fetchPostComments = createAsyncThunk(
    'posts/fetchPostComments',
    async(arg)=>{
        let url = 'https://www.reddit.com';
        url += arg.permalink;
        url += '.json';
        url += "?&raw_json=1"
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();
        return {
            data : data
        };
    })

 const postsSlice = createSlice({
    name: 'posts',
    initialState: {postData:[], 
        isLoading: false,
        after: "",
        commentsData: [],
        loadedComments: ""
    },
    reducers:{},
    extraReducers: builder => {
        //POST FETCH
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
            console.log(data)
        })
        builder.addCase(fetchPostData.rejected, (state) => {
            console.log("failed");
            state.isLoading = false;
        })
        //COMMENTS FETCH
        builder.addCase(fetchPostComments.pending, (state, action) =>{
            state.loadedComments = "pending";
            console.log("loading comments")
        })
        builder.addCase(fetchPostComments.fulfilled, (state, action) => {
            state.loadedComments = "success";
            console.log("success loading comments")
            state.commentsData = action.payload.data;
            const data = (current(state));
        })
        builder.addCase(fetchPostComments.rejected, (state) => {
            state.loadedComments = "failed";
            console.log("failed to load comments")
        })
    }
})

export const postsReducer = postsSlice.reducer;
export const { parseMock } = postsSlice.actions;