import React from 'react';
import {useDispatch} from 'react-redux';
import { fetchPostData } from './postsSlice.js'

export const PostNavigation = (props) => {
    const dispatch = useDispatch();

    const handleNavigation = (value) =>{
                                                    
        if(value==="next" && props.page<24){ 
            props.changePage(props.page+1)
        }                                           //changes post between 1 and 25
        else if(value==="prev" && props.page>0){
            props.changePage(props.page-1)
        }
                                                    //if end is reached...
        else if(value==="next" && props.page===24){
            if(!props.postData[props.listPage+1]){  // and no data for next listing
                let url=props.url;
                url+="&after="
                url+=props.postData[props.listPage].data.after;
                dispatch(fetchPostData({            //request from api
                    firstPage: false,
                    url:url
                }));
            }
            props.changePage(0);                    // change post back to 0
            props.listPageHandler(props.listPage+1) //change listing page to next
        }
        else if(value==="prev" && props.page===0){ //if on post 0 for given listing 
            props.changePage(24);                  //go to last post
            props.listPageHandler(props.listPage-1)//of previous listing
        }
    }
    return(
    <div>
        <button value="prev" onClick={(e)=>{handleNavigation(e.target.value)}}>PREV</button>
        <button value="next" onClick={(e)=>{handleNavigation(e.target.value)}}>NEXT</button>
    </div>
    )
}