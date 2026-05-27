import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData } from './features/posts/postsSlice.js';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PostSearchBar } from './features/posts/PostSearchBar.js';
import { PostDetailedView } from './features/posts/PostDetailedView.js';
import { PostDisplay } from './features/posts/PostDisplay.js';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements,} from 'react-router-dom';
import { fetchPostComments } from './features/posts/postsSlice.js';
import { searchInputTransformHelper } from './utils.js'

function App() {
  const [input, setInput] = useState(''); 
  const [url, setUrl] = useState();
  const [filter, setFilter] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [pendingPromise, setPendingPromise] = useState(null);
  const dispatch = useDispatch();
  const transformedPostData = useSelector((state)=>state.posts.transformedPostData);
  const after = useSelector((state)=>state.posts.after);
  const apiStatus = useSelector((state)=>state.posts.isLoading);
  const timeoutId = useRef(null);
  const [entry] = performance.getEntriesByType('navigation');
//LOAD MORE COMMENTS STATE DATA
  const [moreCommentsIds, setMoreCommentsIds] = useState();
//HANDLES CANCELLATION OF PENDING PROMISE
  const handleCancel = useCallback(() => {
    setPendingPromise((currentPromise) => {
    if (currentPromise) {
      currentPromise.abort();
    }
    return null;
  });
  }, [])
    
//HANDLES FIRST MOUNT, REFRESH, AND REDIRECT
  useEffect(()=>{
    const handlePopState = (event) => {
      window.location.reload();
    }
    window.addEventListener('popstate', handlePopState);                      //Trigger page reload upon popstate (back button click) 
    if(entry && entry.type==="reload" && window.location.pathname === "/" ){  //if on home page and reload...
      const urlFromRefresh = localStorage.getItem('storedUrl');               //retrieve url from local storage
      const filterFromRefresh = localStorage.getItem('storedFilter') ?? "";
      setUrl(urlFromRefresh); 
      setFilter(filterFromRefresh);
      //CANCEL
      handleCancel();
      const currentPromise = dispatch(fetchPostData({                                                //fetch data from before refresh to restore view
        firstPage: true,
        url:urlFromRefresh,
        filter: filterFromRefresh
      }));
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
    else if(entry && entry.type==="reload" && window.location.pathname==="/detailedview"){ //if in detailed (comments) view and reload triggered
      const commentLink = localStorage.getItem('commentLink');                             //retrieve comment link from local storage
      //CANCEL
      handleCancel();
      const currentPromise = dispatch(fetchPostComments({                                  //fetch comments from before refresh to restore detailed view
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
      //CANCEL
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
  },[dispatch, entry, handleCancel])

//HANDLES INPUT AND SEARCH BUTTON LOGIC
  const handleInput = (value) => {        //sets state from user input
    setInput(value);
  }
  const handleClick = () => {
    localStorage.clear();
    setFilter("");
    if(input && input.trim()!=="" ){      //checks if input exists and is not empty string to avoid unnecessary fetches
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
  const handlePopularClick = () => {
    localStorage.clear();
    setFilter("");
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
//HANDLES FILTER SETTING
  const handleFilter = (filter) => {
    if(transformedPostData.length>0){ //CHANGE THIS LINE TO TRANSFORMED DATA.LENGTH
      handleCancel();
      localStorage.setItem('storedFilter', filter);
      setFilter(filter);
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
  const handleLoadMoreComments = (commentsData, transformedCommentData) => {
    let nextIds = [];
    const commentIds = transformedCommentData[1].commentIds;        // sets variable for first run to retrieve data from DetailedView component
    if(commentIds?.length > 0 || moreCommentsIds){                  //checks if there are more comments to load
      handleCancel();
      if(moreCommentsIds){
        nextIds = moreCommentsIds.toSpliced(100, Infinity);         //splices 100 and further for dispatch
        setMoreCommentsIds(moreCommentsIds.toSpliced(0,100));       // splices first 100 from state to update ids for subsequent calls
      }
      else{                                                         //on first run
        nextIds = commentIds.toSpliced(100, Infinity);      
        setMoreCommentsIds(commentIds.toSpliced(0,100));
      }
      const currentPromise = dispatch(fetchPostComments({           
          firstPage: false,
          parentId: transformedCommentData[1].parentId, //CHANGE TO TRANSFORMED VERSION
          children: nextIds 
      }))
      setPendingPromise(currentPromise);
      currentPromise.finally(()=>{
      setPendingPromise(prev => prev===currentPromise ? null : prev)
      });
    }
  }
//REACT ROUTER CODE 
  const router = createBrowserRouter(createRoutesFromElements(    // sets up routes for main view and detailed view
    <Route>
      <Route element={<PostSearchBar  filter={filter} handleFilter={handleFilter}setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} handleClick={handleClick} handlePopularClick={handlePopularClick} handleInput={handleInput} input={input}/>}>
        <Route path='/detailedview' element={<PostDetailedView setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} handleLoadMoreComments={handleLoadMoreComments} moreCommentsIds={moreCommentsIds}/>}/>
        <Route path='/' index element={
          <div>
            {transformedPostData[0]&&<PostDisplay setUrl={setUrl} url={url} setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} hasNextPage={after?true:false} isNextPageLoading={apiStatus} loadNextPage={loadNextPage} pendingPromise={pendingPromise} setPendingPromise={setPendingPromise} handleCancel={handleCancel} transformedPostData={transformedPostData}/>}
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
