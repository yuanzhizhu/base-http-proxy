const buildRequestBody = (rawRequestBody, combineResponseBody) => {
  return {
    rawRequestBody,
    combineResponseBody
  };
};

module.exports = buildRequestBody;
