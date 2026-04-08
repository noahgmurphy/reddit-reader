import React from 'react';
import styles from './PostSearchBar.module.css'
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
export const PostSearchBar = (props) => {
    const showHomeFilters= useSelector((state)=>state.posts.showHomeFilters);
    const navigate = useNavigate();  
return(
    <div>
        <div style={{display:props.showSearchBar?'inline-block':'none'}} className={styles.searchWrapper}>
            <div className={styles.searchContainer}>
                <button className={styles.popularButton} onClick={()=>{props.handlePopularClick(); navigate('/');}}>Popular</button>
                <div className={styles.barContainer}>
                    <input data-testid="searchInput" value={props.input} className={styles.searchInput}onChange={(e)=>{props.handleInput(e.target.value)}}></input>
                    <button data-testid="searchButton" className={styles.searchButton} onClick={()=>{props.handleClick(); navigate('/');}}>&#x2315;</button>
                    </div>
                <div className={styles.filterContainer}>
                    <select value={props.filter} className={styles.filterInput} onChange={(e)=>{props.handleFilter(e.target.value)}}>
                        {showHomeFilters && <option value="best">Best</option>}
                        {!showHomeFilters && <option value="relevance">Relevance</option>}
                        <option value="hot">Hot</option>
                        <option value="new">New</option>
                        <option value="top">Top</option>
                        {showHomeFilters && <option value="rising">Rising</option>}
                        {!showHomeFilters && <option value="comments">Comment Count</option>}
                    </select>
                </div>
            </div>
           
        </div>
        <Outlet/>
    </div>
)
}