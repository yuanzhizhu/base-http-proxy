const HttpHealth = require("./HttpHealth");

const httpHealthMap = {};

const checkProxyFail = () => async (ctx, next) => {
  let isSuccess = true;

  const key = `${ctx.request.host}/${ctx.request.path}`;

  const $HttpHealth = (httpHealthMap[key] = httpHealthMap[key]
    ? httpHealthMap[key]
    : new HttpHealth(ctx));

  $HttpHealth.checkHealthBeforeProxy();

  try {
    await next();
  } catch (e) {
    isSuccess = false;
  }

  $HttpHealth.saveHttpStatusAfterProxy({ isSuccess });
};

module.exports = checkProxyFail;
