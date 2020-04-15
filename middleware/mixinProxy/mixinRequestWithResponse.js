const mixinRequestWithResponse = (
  requestBody = {},
  response = {},
) => {
  return {
    requestBody: requestBody,
    response
  };
};

module.exports = mixinRequestWithResponse;
