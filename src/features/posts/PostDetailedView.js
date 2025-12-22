import React from 'react';
import Linkify from 'react-linkify'
import { useSelector, useDispatch} from 'react-redux';
import { useEffect, useState } from 'react';
import  styles  from './PostDetailedView.module.css';


export const PostDetailedView = ({setShowSearchBar, showSearchBar, setShowLoadMoreButton, showLoadMoreButton, moreCommentsIds, handleLoadMoreComments}) =>{
    const commentsData = useSelector((state)=>state.posts.commentsData);
    const transformedCommentData = useSelector((state)=> state.posts.transformedCommentData)
    const isCommentsLoading = useSelector((state)=>state.posts.isCommentsLoading);
//SEARCH BAR VISIBILITY
    useEffect(()=> {                                                //handles search bar visibility based on scroll direction for normal window
        let lastScrollTop = 0;                                      //keeps track of last scroll position
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
    {transformedCommentData[0]&&
        <div>
            <div className={styles.postDetailsContainer}>
                <h3 className={styles.commentTitle}>{transformedCommentData[0].postTitle}</h3>
                {transformedCommentData[0].previewImageUrl&&<img className={styles.commentPhoto} src={transformedCommentData[0].previewImageUrl}/>}
            </div>
            {transformedCommentData.slice(2).map((item)=>(                  //slices first element containing post details
                <div>
                    {item.body && <div className={styles.commentContainer}>
                        <Linkify>
                            <p>{item.body}</p>
                        </Linkify>
                    </div>}
                </div>
            ))}
        </div>}
    {((moreCommentsIds?.length>0) || (transformedCommentData[1]?.commentIds?.length>0 && !moreCommentsIds)) && <button className={styles.loadMoreButton} onClick={()=>{handleLoadMoreComments(commentsData, transformedCommentData)}}>LOAD MORE...</button>}
            {isCommentsLoading && <div className={styles.loadingContainer}>
                <img className={styles.loadingGif} src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif"/>  
            </div>}
    </div>
)
    
}

