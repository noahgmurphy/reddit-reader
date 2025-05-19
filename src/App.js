import logo from './logo.svg';
import './App.css';
import {useSelector} from 'react-redux';

function App() {
  const data = useSelector((state)=>state.posts);
  return (
    <div>
      <p>{data}</p>
    </div>
  );
}

export default App;
