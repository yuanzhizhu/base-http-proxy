const buildPureResponse = ({ headers, body }) => {
  const contentType = headers["content-type"];

  const pureResponse = {
    headers
  };

  if (/^application\/json/.test(contentType)) {
    pureResponse.result = JSON.parse(body.toString());
    pureResponse.base64 = false;
  } else if (/^application\/javascript/.test(contentType)) {
    pureResponse.result = body.toString();
    pureResponse.base64 = false;
  } else if (/^text\//.test(contentType)) {
    pureResponse.result = body.toString();
    pureResponse.base64 = false;
  } else {
    pureResponse.result = body.toString("base64");
    pureResponse.base64 = true;
  }

  return pureResponse;
};

module.exports = buildPureResponse;
