const HttpHealth = require("./HttpHealth");
const HttpUnhealthError = require("./HttpUnhealthError");

const httpHealthMap = {};

const checkLinkHealth = () => async (ctx, next) => {
  const key = `${ctx.request.host}/${ctx.request.path}`;

  const $HttpHealth = (httpHealthMap[key] = httpHealthMap[key]
    ? httpHealthMap[key]
    : new HttpHealth(ctx));

  try {
    $HttpHealth.checkHealthBeforeProxy();
    try {
      await next();
      $HttpHealth.saveHttpIsSuccessAfterProxy({ isSuccess: true });
    } catch (e) {
      $HttpHealth.saveHttpIsSuccessAfterProxy({ isSuccess: false });
    }
  } catch (e) {
    if (e instanceof HttpUnhealthError) {
      ctx.body = e.message;
    } else {
      ctx.body = "代理链路异常";
    }
  }
};

module.exports = checkLinkHealth;
