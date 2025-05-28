import React from 'react';

export const PostSearchBar = (props) => {
return(
    <div>
        <input onChange={(e)=>{props.handleInput(e.target.value)}}></input>
        <button onClick={()=>{props.handleClick()}}>SEARCH</button>
    </div>
)
}