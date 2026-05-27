

exports.handler = async function (event) {
  let incomingPath = event.path || event.rawPath || "";
  incomingPath = incomingPath.replace("/.netlify/functions/proxy", "");
  incomingPath = incomingPath.replace("/api", "");

  if (!incomingPath.startsWith("/")) {
    incomingPath = "/" + incomingPath;
  }

  let queryString = event.rawQueryString;
  if (!queryString && event.queryStringParameters) {
    queryString = Object.entries(event.queryStringParameters)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&');
  }

  const query = queryString ? `?${queryString}` : "";
  const redditUrl = `https://api.reddit.com${incomingPath}${query}`;
  let fetchOptionsObject = {};
  let targetUrl;
  if(redditUrl.includes('/morechildren')){
    targetUrl = "https://www.reddit.com/api/morechildren.json";
    const incomingUrl = new URL(redditUrl);
    fetchOptionsObject = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'web:redditreaderbynoahm:v1.0.0 (by /u/noah_m_dev)' 
      },
      body: incomingUrl.searchParams 
    }
  }
  else{
    fetchOptionsObject = {
      method: 'GET',
      headers: {
        'User-Agent': 'web:redditreaderbynoahm:v1.0.0 (by /u/noah_m_dev)'
      }
    }
  }
  try {
    const response = await fetch(targetUrl?targetUrl:redditUrl , fetchOptionsObject);
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
}