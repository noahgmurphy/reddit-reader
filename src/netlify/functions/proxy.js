

exports.handler = async function (event) {
    console.log("proxy");
    console.log(event);
  const prefix = "/.netlify/functions/proxy";
  const path = event.rawPath?.startsWith(prefix)
    ? event.rawPath.slice(prefix.length)
    : event.path.replace(prefix, "");
  const query = event.rawQueryString ? `?${event.rawQueryString}` : "";
  const redditUrl = `https://www.reddit.com${path}${query}`;

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