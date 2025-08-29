import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData } from './features/posts/postsSlice.js';
import { useState, useEffect, useRef } from 'react';
import { PostSearchBar } from './features/posts/PostSearchBar.js';
import { PostDetailedView } from './features/posts/PostDetailedView.js';
import { PostDisplay } from './features/posts/PostDisplay.js';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements} from 'react-router-dom';
import { fetchPostComments } from './features/posts/postsSlice.js';

function App() {
  const [input, setInput] = useState();
  const [url, setUrl] = useState();
  const [showSearchBar, setShowSearchBar] = useState(true);
  const dispatch = useDispatch();
  const data = useSelector((state)=>state.posts.postData);
  const after = useSelector((state)=>state.posts.after);
  const apiStatus = useSelector((state)=>state.posts.isLoading);
  const timeoutId = useRef(null);
//FETCHES POPULAR PAGE FOR FIRST MOUNT
  useEffect(()=>{
    setUrl("/r/popular");
    dispatch(fetchPostData({
          firstPage: true,
          url:"/r/popular"
      }))
  },[])
//HANDLES INPUT AND SEARCH BUTTON LOGIC
  const handleInput = (value) => {
    setInput(value);
  }
  const handleClick = () => {
    console.log(timeoutId);
    clearTimeout(timeoutId.current);
    let url = '';
    for(let i=0; i<input.length; i++){
      if(input[i]===' '){
        url+='%20'
      }
      else{
        url+=input[i];
      }
    }
    setUrl(url);
    setInput('')
    dispatch(fetchPostData({
        firstPage: true,
        url:url
    }))
  }
//HANDLES FILTER SETTING
  const handleFilter = (filter) => {
    if(data.length>0){
      dispatch(fetchPostData({
        filter: filter,
        url: url, 
        firstPage: true
      }))
    }
  }
//LOAD NEXT PAGE FOR INFINITE LOADER
  const loadNextPage=()=>{
      console.log("load next page")
      let nextUrl = url; 
      nextUrl+="&after="
      timeoutId.current = setTimeout(()=>{  
        dispatch(fetchPostData({ 
        firstPage: false,
        url:nextUrl
        }));
      }, 7000);
    }
//LOAD MORE COMMENTS FOR DETAILED VIEW
  const handleLoadMoreComments = (commentsData) => {
    if(commentsData[1].data.children[commentsData[1].data.children.length-1].kind==="more"){
      dispatch(fetchPostComments({
          firstPage: false,
          parentId: commentsData[1].data.children[commentsData[1].data.children.length-1].data.parent_id,
          children: commentsData[1].data.children[commentsData[1].data.children.length-1].data.children
          }))
    }
  }


//REACT ROUTER CODE 
  const router = createBrowserRouter(createRoutesFromElements(
    <Route>
      <Route path='/' element={<PostSearchBar  handleFilter={handleFilter}setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} handleClick={handleClick} handleInput={handleInput} input={input}/>}>
        <Route path='/detailedview' element={<PostDetailedView setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} handleLoadMoreComments={handleLoadMoreComments}/>}/>
        <Route index element={
          <div>
            {data[0]&&<PostDisplay url={url} setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} items={data} hasNextPage={after?true:false} isNextPageLoading={apiStatus} loadNextPage={loadNextPage}/>}
          </div>
        }/>
      </Route>
    </Route>
  ))
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
