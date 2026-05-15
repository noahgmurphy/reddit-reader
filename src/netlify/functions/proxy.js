

exports.handler = async function (event) {
    console.log("proxy");
    console.log(event);
  const prefix = "/.netlify/functions/proxy";
  const path = event.rawPath?.startsWith(prefix)
    ? event.rawPath.slice(prefix.length)
    : event.path.replace(prefix, "");
  let queryString = event.rawQueryString;
  
  
  if (!queryString && event.queryStringParameters) {
    queryString = Object.entries(event.queryStringParameters)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&');
  }

  const query = queryString ? `?${queryString}` : "";
  const redditUrl = `https://www.reddit.com${path}${query}`;
  console.log(redditUrl)

  try {
    const response = await fetch(redditUrl);
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};