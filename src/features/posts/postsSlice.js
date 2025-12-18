import { createAsyncThunk, createSlice, current} from '@reduxjs/toolkit';
import { postsUrlCreationHelper, commentsUrlCreationHelper, postDataTransformationHelper, commentDataTransformationHelper } from '../../utils.js'

export const fetchPostData = createAsyncThunk(
    'posts/fetchPostData',
    async(arg, {getState, rejectWithValue, signal})=>{
        let state = getState();
        const urlCreationObj = postsUrlCreationHelper(arg.url, arg.firstPage, arg.filter, state.posts.after);
        const url = urlCreationObj.url;
        const showHomeFilters = urlCreationObj.showHomeFilters;
        let response;
        let data;
        try{
            response = await fetch(url, {signal}); 
            console.log(response);
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
        const url = commentsUrlCreationHelper(arg.firstPage, arg.parentId, arg.children, arg.permalink)
        const response = await fetch(url);
        const data = await response.json();
        const transformedData = commentDataTransformationHelper(data, arg.firstPage); //this line causes failure to load comments ON SECOND AND SUBSEQUENT
        return {
            data:data,
            firstPage: arg.firstPage,
            transformedData
        };
        })

const postsSlice = createSlice({
    name: 'posts',
    initialState: {postData: [],
        transformedPostData: [],
        loadedPosts: "", 
        isLoading: false,
        commentsIsLoading: false,
        after: "",
        commentsData: [],
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
            console.log("loading");
            state.loadedPosts = "pending";
            state.isLoading = true;
            state.loadedComments="";
        })
        builder.addCase(fetchPostData.fulfilled, (state, action) => {
            console.log("success");
            state.loadedPosts = "success";
            state.isLoading = false;
            if(action.payload.firstPage === true){
            //CODE FOR TRANSFORMED DATA
                state.transformedPostData = action.payload.transformedData;
            //
            state.postData = [];
            state.commentsData = [];
            state.postData[0] = action.payload.data;
            state.after=action.payload.data.data.after;
            }
            else{
            //CODE FOR TRANSFORMED DATA
                state.transformedPostData.push(...action.payload.transformedData);
            //
                state.postData[0].data.children.push(...action.payload.data.data.children); //unrolls next set of comments and appends to array. this avoids adding an array and instead adds the array elements to the existing array
                state.after=action.payload.data.data.after;
            }
            const data = (current(state));
            state.showHomeFilters = action.payload.showHomeFilters;
            console.log(data)
        })
        builder.addCase(fetchPostData.rejected, (state) => {
            console.log("failed");
            state.loadedPosts="failed";
            state.isLoading = false;
        })
        //COMMENTS FETCH
        builder.addCase(fetchPostComments.pending, (state, action) =>{
            state.showInfiniteScroll = false;
            state.after="";
            state.loadedComments = "pending";
            state.commentsIsLoading = true;
            console.log("loading comments")
        })
        builder.addCase(fetchPostComments.fulfilled, (state, action) => {
            state.loadedComments = "success";
            state.commentsIsLoading = false;
            console.log("success loading comments");
            if(state.commentsData.length===0||action.payload.firstPage){
                state.commentsData = action.payload.data;
                //CODE FOR TRANSFORMED DATA
                state.transformedCommentData = action.payload.transformedData;
                //
            }
            else{
                console.log("called")
                //CODE FOR TRANSFORMED DATA
                state.transformedCommentData.push(...action.payload.transformedData);
                //
                state.commentsData = [...state.commentsData, state.commentsData[1].data.children.push(...action.payload.data.json.data.things)]
            }
            const data = (current(state));
            console.log(data);
        })
        builder.addCase(fetchPostComments.rejected, (state) => {
            state.loadedComments = "failed";
            state.commentsIsLoading = false;
            console.log("failed to load comments")
        })
    }
})

export const postsReducer = postsSlice.reducer;
export const { parseMock } = postsSlice.actions;