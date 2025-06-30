import React from 'react';
import styles from './PostSearchBar.module.css'
import {useState} from 'react';
export const PostSearchBar = (props) => {
    const [showSearchBar, setShowSearchBar] = useState(true);
    let lastScrollTop = 0;
    window.addEventListener('scroll', function(){
        let scrollTop = window.pageYOffset || this.document.documentElement.scrollTop;
        if(scrollTop > lastScrollTop){
            setShowSearchBar(false);
        }
        if(scrollTop < lastScrollTop){
            setShowSearchBar(true);
        }
        lastScrollTop = scrollTop;
    });
return(
    <div style={{display:showSearchBar?'block':'none'}} className={styles.searchWrapper}>
        <div className={styles.searchContainer}>
            <div className={styles.barContainer}>
                <input className={styles.searchInput}onChange={(e)=>{props.handleInput(e.target.value)}}></input>
                <button className={styles.searchButton} onClick={()=>{props.handleClick()}}>SEARCH</button>
            </div>
        </div>
    </div>
)
}