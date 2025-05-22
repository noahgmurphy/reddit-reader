import logo from './logo.svg';
import './App.css';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostData, parseMock } from './features/posts/postsSlice.js';
import {useState} from 'react';

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
    const {title, ups, downs, num_comments} = mockData[0][0].data.children[0].data;
    console.log(title);
  }
  return (
    <div>
      <button onClick={()=>{ handleClick()}}></button>
      <button onClick={()=>{ retrieve()}}> RETRIEVE </button>
      <p></p>

    </div>
  );
}

export default App;
