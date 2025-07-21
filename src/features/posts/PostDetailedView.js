import React from 'react';
import { useLocation } from 'react-router-dom';
import Linkify from 'react-linkify'
export const PostDetailedView = () =>{
    const location = useLocation();
    const commentsData = location.state || {};

    return(
    <div>
    {commentsData[1]&&
        <div>
            <h3>{commentsData[0].data.children[0].data.title}</h3>
             {commentsData[0].data.children[0].data.preview&&<img src={commentsData[0].data.children[0].data.preview.images[0].source.url}/>}
            {commentsData[1].data.children.map((item)=>(
                <Linkify>
                    <p>{item.data.body}</p>
                </Linkify>
            ))}
        </div>}
    </div>
)
    
}