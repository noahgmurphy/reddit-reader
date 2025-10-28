import React from 'react';
import Linkify from 'react-linkify'
import { useSelector, useDispatch} from 'react-redux';
import { useEffect } from 'react';
import { fetchPostComments } from './postsSlice';

export const PostDetailedView = ({setShowSearchBar, showSearchBar, handleLoadMoreComments}) =>{
    const dispatch = useDispatch();
    const commentsData = useSelector((state)=>state.posts.commentsData);
    const [entry] = performance.getEntriesByType('navigation');
//SEARCH BAR VISIBILITY
    useEffect(()=> {
        let lastScrollTop = 0;
        const handleScroll = (e) => {
            e.preventDefault();
            let scrollTop = window.pageYOffset;
            if(scrollTop > lastScrollTop){
                setShowSearchBar(false);
            }
            if(scrollTop < lastScrollTop - 100 || scrollTop <= 50){
                setShowSearchBar(true);
            }
            lastScrollTop = scrollTop;
            }
        window.addEventListener('scroll', handleScroll);  
        return () => {
            window.removeEventListener('scroll', handleScroll )
        }
    }, [])
    
    return(
    <div style={{marginTop: showSearchBar?'70px': '0px'}}>
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
    {commentsData[1] && commentsData[1].data.children[commentsData[1].data.children.length-1].kind==="more"&&commentsData[1].data.children[commentsData[1].data.children.length-1].data.depth===0 && <button onClick={()=>{handleLoadMoreComments(commentsData)}}>LOAD MORE...</button>}
    </div>
)
    
}