import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {useState} from 'react';

export const PostDisplay = ({
    
    hasNextPage,
    isNextPageLoading, 
    items, 
    loadNextPage,
    pageNum
}, props) => {



const Row = ({index, style}) => {
   
    let content;
    if(!isItemLoaded(index)){
        content = "Loading..."
    }
    else{
        content = items[0].data.children[index];
    }
    return <div style={style}>{content.data.title}</div>
};

const itemCount = hasNextPage ? items[0].data.children.length+1 : items[0].data.children.length+1;
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
            ref={ref}
            height={150}
            itemCount={1000}
            itemSize={35}
            width={700}>
                {Row}
            </List>
            }
        </div>)}
    </InfiniteLoader>
    
)

}