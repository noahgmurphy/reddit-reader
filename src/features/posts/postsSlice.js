import { createAsyncThunk, createSlice, current} from '@reduxjs/toolkit';


export const fetchPostData = createAsyncThunk(
    'posts/fetchPostData',
    async(arg, {getState, rejectWithValue, signal})=>{
        let state = getState();
        let showHomeFilters;
        
        let url = 'https://www.reddit.com';
        if(arg.filter && (!arg.url.includes("/r/popular")) ||arg && arg.firstPage===true && (!arg.url.includes("/r/popular"))){
           url += '/search.json?q=';
           url += arg.url;
           url += "&type=posts";
           if(arg.filter){
            url+="&sort=" + arg.filter;
           }
           url += "&raw_json=1";
           showHomeFilters = false;
        }
        
        else if (arg && arg.firstPage===false && (!arg.url.includes("/r/popular"))){
            url += '/search.json?q=';
            url += arg.url;
            url += state.posts.after;
            url += "&raw_json=1";
            showHomeFilters = false;
        }
        else if(arg.url.includes("/r/popular") || (arg.url === "/r/popular" && arg.firstPage === true)){
            //console.log("else called");
            url+="/r/popular";
            if(arg.filter){
            url+="/" + arg.filter;
            }
            url += '.json?';
            if(arg.firstPage===false){
                url+="after="+state.posts.after + "&";
            }
            url += "raw_json=1";
            showHomeFilters = true;
        }
        console.log(url)
        let response;
        let data;
        try{
            response = await fetch(url, {signal}); 
            data = await response.json();
        }
        
        catch(error){
            if(error.name==="AbortError"){
                const msg = "AbortError"
                return rejectWithValue(msg);
            }
            return rejectWithValue("Something went wrong");
        }
        finally{
             
        }
        
        return {
            data:data,
            firstPage: arg.firstPage,
            showHomeFilters: showHomeFilters
        };
    }
 )

export const fetchPostComments = createAsyncThunk(
    'posts/fetchPostComments',
    async(arg)=>{
        let url = 'https://www.reddit.com';
        if(arg.firstPage===false){
            url+='/api/morechildren.json?';
            url+= "api_type=json&"
            url+='link_id=' + arg.parentId + '&';
            url+= 'children=' + arg.children.join(",") + '&'; 
        }
        else{
            url += arg.permalink;
            url += '.json?';
            url += "&raw_json=1"  
        }
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();
        return {
            data:data,
            firstPage: arg.firstPage
        };
        })

const postsSlice = createSlice({
    name: 'posts',
    initialState: {postData:[],
        loadedPosts: "", 
        isLoading: false,
        after: "",
        commentsData: [],
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
            state.postData = [];
            state.commentsData = [];
            state.postData[0] = action.payload.data;
            state.after=action.payload.data.data.after;
            }
            else{
                state.postData[0].data.children.push(...action.payload.data.data.children);
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
            console.log("loading comments")
        })
        builder.addCase(fetchPostComments.fulfilled, (state, action) => {
            state.loadedComments = "success";
            console.log("success loading comments");
            if(state.commentsData.length===0||action.payload.firstPage){
                state.commentsData = action.payload.data;
            }
            else{
                console.log("called")
                state.commentsData = [...state.commentsData, state.commentsData[1].data.children.push(...action.payload.data.json.data.things)]
            }
            const data = (current(state));
            console.log(data);
        })
        builder.addCase(fetchPostComments.rejected, (state) => {
            state.loadedComments = "failed";
            console.log("failed to load comments")
        })
    }
})

export const postsReducer = postsSlice.reducer;
export const { parseMock } = postsSlice.actions;