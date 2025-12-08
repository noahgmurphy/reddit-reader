import React from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {useRef, useState, useEffect, useLayoutEffect, useCallback} from 'react';
import styles from './PostDisplay.module.css';
import { Link, useNavigate, useLocation, useNavigationType} from 'react-router-dom';
import {useSelector , useDispatch} from 'react-redux';
import { fetchPostComments } from './postsSlice';
import { fetchPostData } from './postsSlice';

export const PostDisplay = ({
    hasNextPage,
    isNextPageLoading, 
    items, 
    loadNextPage,
    setShowSearchBar,
    showSearchBar,
    url,
    setUrl
}) => {

const navigationType = useNavigationType();
const location = useLocation();
const dispatch = useDispatch();
const navigate = useNavigate();
const commentsData = useSelector((state)=>state.posts.commentsData)
const thunkStatus = useSelector((state)=>state.posts.loadedComments);
const showInfiniteScroll = useSelector((state)=>state.posts.showInfiniteScroll);
const loadedPosts = useSelector((state)=>state.posts.loadedPosts);
const [entry] = performance.getEntriesByType('navigation');
//CALLS RESET WINDOW WHEN NEW SEARCH DATA IS ACQUIRED 
useEffect(()=>{
    handleResetWindow();        //resets window position to top upon new search data load
}, [items[0].data.children[0]])
//FETCHES FIRST BATCH OF COMMENTS
const handleLinkClick = (event, permalink) => { 
    event.preventDefault();
    localStorage.setItem('commentLink', permalink)
    dispatch(fetchPostComments({    //dispatches fetch for comments upon link click
    firstPage: true,
    permalink: permalink
    }));
    navigate('/detailedview')
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

const handleScroll = ({scrollOffset, scrollDirection}) => {                                 //handles search bar visibility based on scroll direction for react window
    if(scrollDirection==="backward" && scrollOffset-lastOffset<=-20 && hasRun===true){      //if scrolling up more than 20px  
        setShowSearchBar(true); 
    }
    if(scrollDirection==="backward" && hasRun===false){                                     //if scrolling up for first time...
        setLastOffset(scrollOffset);                                                        //set last offset to current offset
        setHasRun(true);
    }
    if(scrollDirection==="forward" && hasRun === true){                                     //if scrolling down for first time...
        setLastOffset(scrollOffset)                                                         //set last offset to current offset
        setHasRun(false)
    }
    if(scrollDirection==="forward" && hasRun === false && lastOffset>=0 && scrollOffset-lastOffset>=50){    //if scrolling down more than 50px 
        setShowSearchBar(false)                                                                            
        console.log(false);
        setHasRun(false);
    }
}

//GETS ITEM HEIGHT FOR EACH DATA ITEM
const rowHeights = useRef([]);
const listRef = useRef();
const getItemSize = useCallback(index => {  //gets height for each item based on its index in variable size list
    return rowHeights.current[index]||100;
}, [])

//CREATES ROW STRUCTURE FOR REACT WINDOW
const Row = ({index, style}) => {
    const itemRef = useRef(null);
    
    useEffect(()=>{                                                         //sets height for each item after it loads to avoid clipping
        if(itemRef.current&&listRef.current){
            /*console.log("reset");
            console.log(listRef.current);
            console.log(index);*/
            rowHeights.current[index] = itemRef.current.clientHeight + 20;  //adds 20px for padding/margin
            listRef.current.resetAfterIndex(index, true);                   //resets react window measurements after height change to avoid visual bugs
        }
        
    }, [loadedPosts, index]);
    
    let content;
    if(!isItemLoaded(index)){   //show loading gif if item is not yet loaded
        content = (
            <div className={styles.loadingContainer}>
                <img className={styles.loadingGif} src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif"/>
            </div>
        )
    }
    else{                       //show post data if item is loaded
        content = (
            <div style={{height:items[0].data.children[index].data.preview?'500px':' 150px'}} ref={itemRef} className={styles.postWindow}>
                <div className={styles.textContainer}>
                <h3 className={`${styles.postTitle} ${items[0].data.children[index].data.preview?'':styles.noPreview}`}>{items[0].data.children[index].data.title}</h3>
                </div>
                {items[0].data.children[index].data.preview&&<img className={styles.postPreview} src={items[0].data.children[index].data.preview.images[0].source.url}/>}
                
                <div className={styles.infoContainer}>
                    <div className={styles.postInfoBox}>
                        <p className={styles.score}>&#x2193;{items[0].data.children[index].data.score}&#x2191;</p>
                        <p className={styles.authorName}>Posted by {items[0].data.children[index].data.author}</p>
                        <Link to="/detailedview" onClick={(event)=>handleLinkClick(event, items[0].data.children[index].data.permalink)} className={styles.commentAmount}>{items[0].data.children[index].data.num_comments} Comments</Link>
                    </div>
                </div>
            </div>
        );
    }
    return <div style={style}>{content}</div>
};
//LOGIC FOR INFINITE LOADER
const itemCount = hasNextPage ? items[0].data.children.length+1 : items[0].data.children.length; //checks if there is a next page and sets item count accordingly
const loadMoreItems = isNextPageLoading ? ()=>{} : loadNextPage;                                 //loads next page if not already loading
const isItemLoaded = index => !hasNextPage || index < items[0].data.children.length;             //checks if item is loaded based on index and whether there is a next page
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
                ref={list=>{
                    ref(list);
                    listRef.current = list;
                }}
                height={window.innerHeight}
                itemCount={itemCount}
                itemSize={getItemSize}
                width={"100%"}
                onScroll={handleScroll}
                className={styles.reactWindow}
                style={{zIndex:1, marginTop: showSearchBar?'70px':'0px' }}>
                    {Row}
                </List>
                }
            </div>)}
        </InfiniteLoader>}
    </div>
)

}