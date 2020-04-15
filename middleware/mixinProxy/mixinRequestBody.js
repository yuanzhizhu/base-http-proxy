const mixinRequestBody = (rawRequestBody = {}, mixinResponseBody = {}) => {
  return {
    requestBody: rawRequestBody,
    responseBody: mixinResponseBody
  };
};

module.exports = mixinRequestBody;
