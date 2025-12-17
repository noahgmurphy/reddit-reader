import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData } from './features/posts/postsSlice.js';
import { useState, useEffect, useRef } from 'react';
import { PostSearchBar } from './features/posts/PostSearchBar.js';
import { PostDetailedView } from './features/posts/PostDetailedView.js';
import { PostDisplay } from './features/posts/PostDisplay.js';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements,} from 'react-router-dom';
import { fetchPostComments } from './features/posts/postsSlice.js';
import { searchInputTransformHelper } from './utils.js'

function App() {
  const [input, setInput] = useState();
  const [url, setUrl] = useState();
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [pendingPromise, setPendingPromise] = useState(null);
  const dispatch = useDispatch();
  const data = useSelector((state)=>state.posts.postData);
  const transformedPostData = useSelector((state)=>state.posts.transformedPostData)
  const after = useSelector((state)=>state.posts.after);
  const apiStatus = useSelector((state)=>state.posts.isLoading);
  const timeoutId = useRef(null);
  const [entry] = performance.getEntriesByType('navigation');
//LOAD MORE COMMENTS STATE DATA
  const [moreCommentsIds, setMoreCommentsIds] = useState();
  const [didFetchIds, setDidFetchIds] = useState(false);
//HANDLES FIRST MOUNT, REFRESH, AND REDIRECT
  useEffect(()=>{
    const handlePopState = (event) => {
      window.location.reload();
    }
    window.addEventListener('popstate', handlePopState);                      //Trigger page reload upon popstate (back button click) 
    if(entry && entry.type==="reload" && window.location.pathname === "/" ){  //if on home page and reload...
      const urlFromRefresh = localStorage.getItem('storedUrl');               //retrieve url from local storage
      setUrl(urlFromRefresh); 
      handleCancel();
      const currentPromise = dispatch(fetchPostData({                                                //fetch data from before refresh to restore view
        firstPage: true,
        url:urlFromRefresh
      }));
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
    else if(entry && entry.type==="reload" && window.location.pathname==="/detailedview"){ //if in detailed (comments) view and reload triggered
      const commentLink = localStorage.getItem('commentLink');                             //retrieve comment link from local storage
      handleCancel();
      const currentPromise = dispatch(fetchPostComments({                                                         //fetch comments from before refresh to restore detailed view
        firstPage: true,
        permalink: commentLink,
      }));
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
    else{                                               //else upon mount
      localStorage.clear();
      localStorage.setItem('storedUrl', "/r/popular");
      setUrl("/r/popular");
      handleCancel();
      const currentPromise = dispatch(fetchPostData({                          //fetch home page data
        firstPage: true,
        url:"/r/popular"
      }));
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
    return () => {
      window.removeEventListener('popstate', handlePopState); 
    }
  },[])

//HANDLES CANCELLATION OF PENDING PROMISE
  const handleCancel = () => {
    if (pendingPromise){
      pendingPromise.abort();
      setPendingPromise(null);
      console.log("Thunk Aborted");
    }
  }
//HANDLES INPUT AND SEARCH BUTTON LOGIC
  const handleInput = (value) => {        //sets state from user input
    setInput(value);
  }
  const handleClick = () => {
    localStorage.clear();
    if(input && input.trim()!=="" ){      //checks if input exists and is not empty string to avoid unnecessary fetches
    console.log(timeoutId);
    clearTimeout(timeoutId.current);      //cancels any delayed dispatches still incoming to avoid race conditions
    
    const url = searchInputTransformHelper(input)
    localStorage.setItem('storedUrl', url);   //stores current url in local storage to restore view upon refresh
    setUrl(url);
    setInput('')
    handleCancel();
    const currentPromise = dispatch(fetchPostData({
        firstPage: true,
        url:url
    }));
    setPendingPromise(currentPromise);
    currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
    });
    }
  }
//HANDLES FILTER SETTING
  const handleFilter = (filter) => {
    if(data.length>0){
      handleCancel();
      const currentPromise = dispatch(fetchPostData({               //dispatches fetch with new filter applied
        filter: filter,
        url: url, 
        firstPage: true
      }));
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
  }
//LOAD NEXT PAGE FOR INFINITE LOADER
  const loadNextPage=()=>{
    console.log("load next page")
    let nextUrl = url; 
    nextUrl+="&after="
    timeoutId.current = setTimeout(()=>{  
      dispatch(fetchPostData({            //dispatches fetch for next page after 7 second delay to avoid rate limiting
        firstPage: false,
        url:nextUrl                       //original url + after parameter to get next set of posts
      }));
    }, 7000);
  }
//LOAD MORE COMMENTS FOR DETAILED VIEW
  const handleLoadMoreComments = (commentsData) => {
    let nextIds = [];
    let commentIds = commentsData[1].data.children[commentsData[1].data.children.length-1].data.children;       // sets variable for first run to retrieve data from DetailedView component
    if(commentsData[1].data.children[commentsData[1].data.children.length-1].kind==="more" || moreCommentsIds){    //checks if there are more comments to load
      handleCancel();
      if(moreCommentsIds){
        nextIds = moreCommentsIds.toSpliced(100, Infinity);    //splices 100 and further for dispatch
        setMoreCommentsIds(moreCommentsIds.toSpliced(0,100))   // splices first 100 from state to update ids for subsequent calls
      }
      else{                                                //on first run
        nextIds = commentIds.toSpliced(100, Infinity);      
        setMoreCommentsIds(commentIds.toSpliced(0,100))   
      }
      const currentPromise = dispatch(fetchPostComments({                                                              //dispatches fetch for more comments with necessary parameters to get next set
          firstPage: false,
          parentId: commentsData[1].data.children[commentsData[1].data.children.length-1].data.parent_id,
          children: nextIds 
      }))
      setDidFetchIds(true);
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
  }
//REACT ROUTER CODE 
  const router = createBrowserRouter(createRoutesFromElements(    // sets up routes for main view and detailed view
    <Route>
      <Route element={<PostSearchBar  handleFilter={handleFilter}setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} handleClick={handleClick} handleInput={handleInput} input={input}/>}>
        <Route path='/detailedview' element={<PostDetailedView setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} handleLoadMoreComments={handleLoadMoreComments}/>}/>
        <Route path='/' index element={
          <div>
            {data[0]&&<PostDisplay setUrl={setUrl} url={url} setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} items={data} hasNextPage={after?true:false} isNextPageLoading={apiStatus} loadNextPage={loadNextPage} pendingPromise={pendingPromise} setPendingPromise={setPendingPromise} handleCancel={handleCancel} transformedPostData={transformedPostData}/>}
          </div>
        }/>
      </Route>
    </Route>
  ))
  return (
    <RouterProvider router={router}/>   //provides routing context to application 
  );
}

export default App;
