const HttpHealth = require("./HttpHealth");

const httpHealthMap = {};

const checkProxyFail = () => async (ctx, next) => {
  let isSuccess = true;

  const key = `${ctx.request.host}/${ctx.request.path}`;

  const $HttpHealth = (httpHealthMap[key] = httpHealthMap[key]
    ? httpHealthMap[key]
    : new HttpHealth(ctx));

  $HttpHealth.checkHealth();

  try {
    await next();
  } catch (e) {
    isSuccess = false;
  }

  $HttpHealth.saveHttpStatus({ isSuccess });
};

module.exports = checkProxyFail;
