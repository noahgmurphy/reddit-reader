import React from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {useRef, useState, useEffect, useCallback} from 'react';
import styles from './PostDisplay.module.css';
import { Link, useNavigate } from 'react-router-dom';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostComments } from './postsSlice';

export const PostDisplay = ({
    
    hasNextPage,
    isNextPageLoading, 
    items, 
    loadNextPage,
}, props) => {
const commentsData = useSelector((state)=>state.posts.commentsData)
const dispatch = useDispatch();
const navigate = useNavigate();
const thunkStatus = useSelector((state)=>state.posts.loadedComments);
const handleLinkClick = (event, permalink) => {
    event.preventDefault();
    dispatch(fetchPostComments({
    permalink: permalink
}))}

useEffect(()=>{
    if (thunkStatus === "success"){
        navigate('/detailedview', {state: commentsData});
    }

}, [commentsData])

const rowHeights = useRef({});
const listRef = useRef();
const getItemSize = useCallback(index => {
    return rowHeights.current[index]||50;
}, [])

const Row = ({index, style}) => {
    const itemRef = useRef(null);
    
    useEffect(()=>{
        if(itemRef.current){
            rowHeights.current[index] = itemRef.current.clientHeight + 20;
            listRef.current.resetAfterIndex(index, true);
        }
    }, [index]);
    
    let content;
    if(!isItemLoaded(index)){
        content = "Loading..."
    }
    else{
        content = (
        <div ref={itemRef} className={styles.postWindow}>
            <h3 className={styles.postTitle}>{items[0].data.children[index].data.title}</h3>
            {items[0].data.children[index].data.preview&&<img className={styles.postPreview} src={items[0].data.children[index].data.preview.images[0].source.url}/>}
            <div className={styles.postInfoBox}>
                <p className={styles.authorName}>Posted by {items[0].data.children[index].data.author}</p>
                <Link onClick={(event)=>handleLinkClick(event, items[0].data.children[index].data.permalink)} className={styles.commentAmount}>{items[0].data.children[index].data.num_comments} Comments</Link>
                <p className={styles.score}>&#x2193;{items[0].data.children[index].data.score}&#x2191;</p>
            </div>
        </div>
    );
    }
    return <div style={style}>{content}</div>
};

const itemCount = hasNextPage ? items[0].data.children.length+1 : items[0].data.children.length;
const loadMoreItems = isNextPageLoading ? ()=>{} : loadNextPage;
const isItemLoaded = index => !hasNextPage || index < items[0].data.children.length;
return(

    <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
    >
    {({onItemsRendered, ref}) => (
        <div>
            {items[0]&&
            <List 
            onItemsRendered={onItemsRendered}
            ref={listRef}
            height={window.innerHeight}
            itemCount={itemCount}
            itemSize={getItemSize}
            width={"100%"}>
                {Row}
            </List>
            }
        </div>)}
    </InfiniteLoader>
    
)

}