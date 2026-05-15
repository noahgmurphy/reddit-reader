

exports.handler = async function (event) {
    console.log("proxy");
    console.log(event);
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
  console.log(redditUrl)

  try {
    const response = await fetch(redditUrl , {
      method: 'GET',
      headers: {
        // FORMAT: platform:app_id:version (by /u/your_username)
        'User-Agent': 'web:redditreaderbynoahm:v1.0.0 (by /u/noah_m_dev)'
      }
    });
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