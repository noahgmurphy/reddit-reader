function postsUrlCreationHelper(inputUrl, firstPage, filter, after){
    let showHomeFilters;
    let url = 'https://www.reddit.com';
    if(filter && (!inputUrl.includes("/r/popular")) || firstPage===true && (!inputUrl.includes("/r/popular"))){
        url += '/search.json?q=';
        url += inputUrl;
        url += "&type=posts";
        if(filter){
            url+="&sort=" + filter;
        }
           url += "&raw_json=1";
           showHomeFilters = false;
        }
        else if (firstPage===false && (!inputUrl.includes("/r/popular"))){
            url += '/search.json?q=';
            url += inputUrl;
            url += after;
            url += "&raw_json=1";
            showHomeFilters = false;
        }
        else if(inputUrl.includes("/r/popular") || (inputUrl === "/r/popular" && firstPage === true)){
            url+="/r/popular";
            if(filter){
            url+="/" + filter;
            }
            url += '.json?';
            if(firstPage===false){
                url+="after="+after + "&";
            }
            url += "raw_json=1";
            showHomeFilters = true;
        }
    return({
        url: url,
        showHomeFilters: showHomeFilters
    })
}

function commentsUrlCreationHelper(firstPage, parentId, children, permalink){
    let url = 'https://www.reddit.com';
        if(firstPage===false){
            console.log(children);
            url+='/api/morechildren.json?';
            url+= "api_type=json&"
            url+='link_id=' + parentId + '&';
            url+= 'children=' + children.join(",") + '&'; 
        }
        else{
            url += permalink;
            url += '.json?';
            url += "&raw_json=1"  
        }
    return url
}

function searchInputTransformHelper(input){
    let url = '';
    for(let i=0; i<input.length; i++){    //iterates through input string
      if(input[i]===' '){                 //replaces spaces with correct character for api fetch
        url+='%20'
      }
      else{
        url+=input[i];      
      }
    }
    return url;
}

function postDataTransformationHelper (data){ //destructures nested post data to avoid deep nesting
    let transformedData = [];
    data.data.children.map((item)=>{
        const {                     
            data:{
                title,
                author, 
                score,
                num_comments,
                permalink,
                preview
                
                    
            }

        } = item;
        transformedData.push({       
            title,
            author,
            score,
            num_comments,
            permalink,
            preview
        })
    });
    return transformedData;
}

function commentDataTransformationHelper(data, firstPage){ //destructures nested comment data to avoid deep nesting
    let transformedData = [];
    if(firstPage){                                         //data structure is different after first fetch
       if(data[0].data.children[0].data.preview){
            const postTitle = data[0]?.data?.children[0]?.data?.title;  //checks that each object/array exists using optional chaining
            const previewImageUrl = data[0]?.data?.children[0]?.data?.preview?.images[0]?.source?.url; 
            transformedData.push({
                postTitle,
                previewImageUrl
            });
           
        }
        data[1].data.children.map((item)=>{   
        if (item.kind!=="more"){
            const{
                data:{
                    body
                }
            } = item;
            transformedData.push({
                body
            })
        }
        })
    }
    else{
        data.json.data.things.map((item)=>{
          if (item.kind!=="more"){
            const{
                data:{
                    body
                }
            } = item;
            transformedData.push({
                body
            })
        }  
        })
    }
    return transformedData;
}
export { postsUrlCreationHelper, commentsUrlCreationHelper, searchInputTransformHelper, postDataTransformationHelper, commentDataTransformationHelper }