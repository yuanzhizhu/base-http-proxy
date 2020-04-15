const zlib = require('zlib');

const buildPureResponse = ({ headers, body }) => {
  const contentType = headers["content-type"];
  const contentEncoding = headers["content-encoding"];

  let resBody = body;

  if (contentEncoding === 'gzip') {
    resBody = zlib.gunzipSync(body);
  }

  const pureResponse = {
    headers
  };

  if (/^application\/json/.test(contentType)) {
    pureResponse.result = JSON.parse(resBody.toString());
    pureResponse.base64 = false;
  } else if (/^application\/javascript/.test(contentType)) {
    pureResponse.result = resBody.toString();
    pureResponse.base64 = false;
  } else if (/^text\//.test(contentType)) {
    pureResponse.result = resBody.toString();
    pureResponse.base64 = false;
  } else {
    pureResponse.result = resBody.toString("base64");
    pureResponse.base64 = true;
  }

  return pureResponse;
};

module.exports = buildPureResponse;
