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
    setShowSearchBar,
    showSearchBar,
    url
}) => {

const dispatch = useDispatch();
const navigate = useNavigate();
const commentsData = useSelector((state)=>state.posts.commentsData)
const thunkStatus = useSelector((state)=>state.posts.loadedComments);
const showInfiniteScroll = useSelector((state)=>state.posts.showInfiniteScroll);

//CALLS RESET WINDOW WHEN NEW SEARCH DATA IS ACQUIRED 
useEffect(()=>{
    handleResetWindow();
}, [items[0].data.children[0]])

//REDIRECTS TO DETAILED VIEW WHEN COMMENTS ARE SUCCESSFULLY FETCHED
useEffect(()=>{
    if (thunkStatus === "success" && commentsData.length>0 ){
        navigate('/detailedview', {state: commentsData});
        console.log("rerouted");
    }
}, [commentsData])

//FETCHES FIRST BATCH OF COMMENTS
const handleLinkClick = (event, permalink) => {
    event.preventDefault();
    dispatch(fetchPostComments({
    firstPage: true,
    permalink: permalink
    }))
}
//RESETS WINDOW POSITION TO TOP
const handleResetWindow = () => {
    if (listRef.current){
        listRef.current.scrollTo(0);
    }
}
//SHOWS SEARCH BAR BASED ON SCROLL DIRECTION
const [lastOffset, setLastOffset] = useState(0);
const [hasRun, setHasRun] = useState(false);
const handleScroll = ({scrollOffset, scrollDirection}) => {
    if(scrollDirection==="backward" && scrollOffset-lastOffset<=-20 && hasRun===true){
        setShowSearchBar(true);
    }
    if(scrollDirection==="backward" && hasRun===false){
        setLastOffset(scrollOffset);
        setHasRun(true);
    }
    if(scrollDirection==="forward" && hasRun === true){
        setLastOffset(scrollOffset)
        setHasRun(false)
    }
    if(scrollDirection==="forward" && hasRun === false && lastOffset>=0 && scrollOffset-lastOffset>=50){
        setShowSearchBar(false)
        console.log(false);
        setHasRun(false);
    }
}


const rowHeights = useRef({});
const listRef = useRef();
//GETS ITEM HEIGHT FOR EACH DATA ITEM
const getItemSize = useCallback(index => {
    return rowHeights.current[index]||500;
}, [])

//CREATES ROW STRUCTURE FOR REACT WINDOW
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
        if(url.includes("/r/popular")){
            content="";
        }
        else{
        content = "Loading..."
        }
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
//LOGIC FOR INFINITE LOADER
const itemCount = hasNextPage ? items[0].data.children.length+1 : items[0].data.children.length;
const loadMoreItems = isNextPageLoading ? ()=>{} : loadNextPage;
const isItemLoaded = index => !hasNextPage || index < items[0].data.children.length;
//RETURNING REACT WINDOW <List> COMPONENT INSIDE INIFITE LOADER
return(
    <div>
        {showInfiniteScroll&&<InfiniteLoader
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
                width={"100%"}
                onScroll={handleScroll}
                style={{zIndex:1, marginTop: showSearchBar?'70px':'0px' }}>
                    {Row}
                </List>
                }
            </div>)}
        </InfiniteLoader>}
    </div>
)

}