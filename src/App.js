import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData } from './features/posts/postsSlice.js';
import {useState} from 'react';
import { PostSearchBar } from './features/posts/PostSearchBar.js'
import { PostNavigation } from './features/posts/PostNavigation.js'
import { PostDisplay } from './features/posts/PostDisplay.js';

function App() {
  const [page, setPage] = useState(0);
  const [input, setInput] = useState();
  const [url, setUrl] = useState();
  const [listPage, setListPage] = useState(0);
  const [mockData, setMockData] = useState([[{data:{children:[{
  data:{
    title:'Test Post',
    ups: 25,
    downs: 3,
    num_comments: 100
  }
}]}}]]);
  
  const dispatch = useDispatch();
  const data = useSelector((state)=>state.posts);
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
    console.log(url);
    setUrl(url);
    setInput('')
    dispatch(fetchPostData({
        firstPage: true,
        url:url
    }));
}
////////
  return (
    <div>
      <PostSearchBar handleClick={handleClick} handleInput={handleInput}/>
      <PostNavigation changePage={setPage} page={page} url={url} postData={data} listPageHandler={setListPage} listPage={listPage}/>
      <PostDisplay postData={data} page={page} listPage={listPage}/>
    </div>
  );
}

export default App;
