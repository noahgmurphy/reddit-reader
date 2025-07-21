import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData } from './features/posts/postsSlice.js';
import {useState} from 'react';
import { PostSearchBar } from './features/posts/PostSearchBar.js';
import { PostDetailedView } from './features/posts/PostDetailedView.js';
import { PostDisplay } from './features/posts/PostDisplay.js';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements, Routes} from 'react-router-dom';
function App() {
  const [page, setPage] = useState(0);
  
  const [input, setInput] = useState();
  const [url, setUrl] = useState();
  const [listPage, setListPage] = useState(0);
  const [searchNum, setSearchNum] = useState(0);
  const [mockData, setMockData] = useState([[{data:{children:[{
  data:{
    title:'Test Post',
    ups: 25,
    downs: 3,
    num_comments: 100
  }
}]}}]]);
  
  const dispatch = useDispatch();
  const data = useSelector((state)=>state.posts.postData);
  const after = useSelector((state)=>state.posts.after);
  const apiStatus = useSelector((state)=>state.posts.isLoading)
  const pageNum = useSelector((state)=>state.posts.page)
//SEARCH CODE 
  const handleInput = (value) => {
    setInput(value);
  }
  const handleClick = () => {
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
//LOAD NEXT PAGE
const loadNextPage=()=>{
  console.log("load next page")
  let nextUrl = url; //DECLARE NEW URL
  nextUrl+="&after=" //SET IT EQUAL TO SEARCH URL + "AFTER" QUERY
  // nextUrl+=data[0].data.after; //ACCESS AFTER 
  setTimeout(()=>{  
    dispatch(fetchPostData({  //DISPATCHES FETCH WITH QUERY URL + "AFTER"
    firstPage: false,
    url:nextUrl
    }));
  }, 7000);

  
}
////////
//Router
  const router = createBrowserRouter(createRoutesFromElements(
    <Route>
      <Route path='/detailedview' element={<PostDetailedView/>}/>
      <Route path='/' element={
        <div>
          <PostSearchBar handleClick={handleClick} handleInput={handleInput}/>
          {data[0]&&<PostDisplay searchNum={searchNum} items={data} hasNextPage={after?true:false} listPage={listPage} isNextPageLoading={apiStatus} loadNextPage={loadNextPage}/>}
        </div>
      }/>
      
    </Route>
  ))
////////
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
