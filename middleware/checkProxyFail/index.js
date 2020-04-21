const ReqHealth = require("./ReqHealth");
const { HEALTH, HALF_HEALTH, UNHEALTH } = ReqHealth;

const reqHealthMap = {};

const checkProxyFail = () => async (ctx, next) => {
  let isSuccess = true;

  const { host, path } = ctx.request;
  const key = `${host}/${path}`;
  if (reqHealthMap[key] === undefined) {
    reqHealthMap[key] = new ReqHealth();
  }
  const $ReqHealth = reqHealthMap[key];

  try {
    await next();
  } catch (e) {
    isSuccess = false;
  }

  const status = $ReqHealth.getStatus();

  ctx.reqHealthMap = reqHealthMap;
};

module.exports = checkProxyFail;
