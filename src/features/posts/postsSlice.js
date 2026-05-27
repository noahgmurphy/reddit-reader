import { createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { postsUrlCreationHelper, commentsUrlCreationHelper, postDataTransformationHelper, commentDataTransformationHelper } from '../../utils.js'

export const fetchPostData = createAsyncThunk(
    'posts/fetchPostData',
    async(arg, {getState, rejectWithValue, signal})=>{
        
        let state = getState();
        const urlCreationObj = postsUrlCreationHelper(arg.url, arg.firstPage, arg.filter, state.posts.after);
        let url = urlCreationObj.url;
        url = urlCreationObj.url.replace('https://www.reddit.com', '/.netlify/functions/proxy');
        const showHomeFilters = urlCreationObj.showHomeFilters;
        let response;
        let data;
        try{
            response = await fetch(url,{signal}); 
            data = await response.json();
        }
        catch(error){
            if(error.name==="AbortError"){
                const msg = "AbortError"
                return rejectWithValue(msg);
            }
            return rejectWithValue("Something went wrong");
        }
        const transformedData = postDataTransformationHelper(data);
        return {
            data:data,
            firstPage: arg.firstPage,
            showHomeFilters: showHomeFilters,
            transformedData
        };
    }
 )

export const fetchPostComments = createAsyncThunk(
    'posts/fetchPostComments',
    async(arg)=>{
        let url = commentsUrlCreationHelper(arg.firstPage, arg.parentId, arg.children, arg.permalink);
        url = url.replace('https://www.reddit.com', '/.netlify/functions/proxy');
        const response = await fetch(url);
        const data = await response.json();
        const transformedData = commentDataTransformationHelper(data, arg.firstPage); 
        return {
            data:data,
            firstPage: arg.firstPage,
            transformedData
        };
        })

const postsSlice = createSlice({
    name: 'posts',
    initialState: {
        transformedPostData: [],
        loadedPosts: "", 
        isLoading: false,
        commentsIsLoading: false,
        after: "",
        transformedCommentData: [],
        loadedComments: "",
        showInfiniteScroll: "false",
        showHomeFilters: true
    },
    reducers:{},
    extraReducers: builder => {
        //POST FETCH
        builder.addCase(fetchPostData.pending, (state, action) =>{
            state.showInfiniteScroll = true;
            state.loadedPosts = "pending";
            state.isLoading = true;
            state.loadedComments="";
        })
        builder.addCase(fetchPostData.fulfilled, (state, action) => {
            state.loadedPosts = "success";
            state.isLoading = false;
            if(action.payload.firstPage === true){
                state.transformedPostData = action.payload.transformedData;
                state.after=action.payload.data.data.after;
            }
            else{
                state.transformedPostData.push(...action.payload.transformedData);
                state.after=action.payload.data.data.after;
            }
            state.showHomeFilters = action.payload.showHomeFilters;
        })
        builder.addCase(fetchPostData.rejected, (state) => {
            state.loadedPosts="failed";
            state.isLoading = false;
        })
        //COMMENTS FETCH
        builder.addCase(fetchPostComments.pending, (state, action) =>{
            state.showInfiniteScroll = false;
            state.after="";
            state.loadedComments = "pending";
            state.commentsIsLoading = true;
        })
        builder.addCase(fetchPostComments.fulfilled, (state, action) => {
            state.loadedComments = "success";
            state.commentsIsLoading = false;
            if(state.transformedCommentData.length===0||action.payload.firstPage){
                state.transformedCommentData = action.payload.transformedData;
            }
            else{
                state.transformedCommentData.push(...action.payload.transformedData);
            }
            
        })
        builder.addCase(fetchPostComments.rejected, (state) => {
            state.loadedComments = "failed";
            state.commentsIsLoading = false;
        })
    }
})

export const postsReducer = postsSlice.reducer;
export const { parseMock } = postsSlice.actions;