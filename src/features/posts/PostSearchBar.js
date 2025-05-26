import React, { useState } from 'react';
import { fetchPostData } from './postsSlice.js'
import {useDispatch} from 'react-redux'

export const PostSearchBar = () => {
const dispatch = useDispatch();
const [input, setInput] = useState();
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
    setInput('')
    dispatch(fetchPostData(url));
}
return(
    <div>
        <input onChange={(e)=>{setInput(e.target.value)}}></input>
        <button onClick={()=>{handleClick()}}>SEARCH</button>
    </div>
)
}