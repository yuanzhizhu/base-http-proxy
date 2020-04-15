const buildPureResponse = ({ headers, body }) => {
  const contentType = headers["content-type"];

  if (/^application\/json/.test(contentType)) {
    return {
      headers,
      result: JSON.parse(body.toString()),
      base64: false
    };
  } else if (/^text\//.test(contentType)) {
    return {
      headers,
      result: body.toString(),
      base64: false
    };
  } else {
    return {
      headers,
      result: body.toString("base64"),
      base64: true
    };
  }
};

module.exports = buildPureResponse;
