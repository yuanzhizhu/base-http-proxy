const HttpHealth = require("./HttpHealth");
const HttpUnhealthError = require("../HttpUnhealthError");

const httpHealthMap = {};

const checkProxyFail = () => async (ctx, next) => {
  let isSuccess = true;

  const key = `${ctx.request.host}/${ctx.request.path}`;

  const $HttpHealth = (httpHealthMap[key] = httpHealthMap[key]
    ? httpHealthMap[key]
    : new HttpHealth(ctx));

  try {
    $HttpHealth.checkHealthBeforeProxy();
    await next();
  } catch (e) {
    if (e instanceof HttpUnhealthError) {
      ctx.body = e.message;
    }
    isSuccess = false;
  }

  $HttpHealth.saveHttpStatusAfterProxy({ isSuccess });
};

module.exports = checkProxyFail;
