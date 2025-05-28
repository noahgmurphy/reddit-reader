import React from 'react';

export const PostDisplay = (props) => {

return(
    <div>
        {props.postData[props.listPage] && props.postData.length>0 && props.page<=24 &&
        <div>
            <p>{props.postData[props.listPage].data.children[props.page].data.title}</p>
        </div>}
    </div>
    )

}