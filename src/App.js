import logo from './logo.svg';
import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData, parseMock } from './features/posts/postsSlice.js';
import {useState} from 'react';
import { PostSearchBar } from './features/posts/PostSearchBar.js'

function App() {
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
  
  const handleClick = () => {
    dispatch(fetchPostData());
    
  }
  const retrieve = () => {
    //dispatch(parseMock());
    const {title, ups, downs, num_comments} = data[0].data.children[0].data; //data[][] for detailed view
    console.log(title);
  }
  return (
    <div>
      <PostSearchBar/>
      <button onClick={()=>{ handleClick()}}></button>
      <button onClick={()=>{ retrieve()}}> RETRIEVE </button>
      <p></p>

    </div>
  );
}

export default App;
