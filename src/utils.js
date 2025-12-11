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

function dataTransformationHelper (data){
    let normalizedData = [];
    data.data.children.map((item)=>{
        const {                     //destructures nested data
            data:{
                title,
                author
            }

        } = item;
        normalizedData.push({       // pushes destructured data to new array to avoid deep nesting
            title,
            author
        })
    });
    return normalizedData;
}
export { postsUrlCreationHelper, commentsUrlCreationHelper, searchInputTransformHelper, dataTransformationHelper }