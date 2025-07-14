import React from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {useRef, useState, useEffect, useCallback} from 'react';
import styles from './PostDisplay.module.css';
import { Link } from 'react-router-dom';

export const PostDisplay = ({
    
    hasNextPage,
    isNextPageLoading, 
    items, 
    loadNextPage,
    pageNum
}, props) => {

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
                <Link to='/detailedview' className={styles.commentAmount}>{items[0].data.children[index].data.num_comments} Comments</Link>
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