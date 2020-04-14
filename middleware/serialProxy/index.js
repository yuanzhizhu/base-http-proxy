const httpProxy = require("http-proxy");
const streamify = require("stream-array");
const buildRequestBody = require("./buildRequestBody");

const proxy = httpProxy.createProxyServer();

const serialProxy = ({ target, key, combineKey }) => async (ctx, next) => {
  await new Promise(resolve => {
    proxy.on("proxyRes", proxyRes => {
      let body = [];

      proxyRes.on("data", chunk => {
        body.push(chunk);
      });

      proxyRes.on("end", () => {
        body = Buffer.concat(body).toString();
        // TODO:当前假设body都是String类型
        ctx[key] = body;
        resolve();
      });
    });

    // TODO:假设rawBody都是String类型
    let rawBody = ctx.request.rawBody;

    if (combineKey !== undefined) {
      const combineResponseBody = ctx[combineKey];
      rawBody = buildRequestBody(rawBody, combineResponseBody);
    }

    proxy.web(ctx.req, ctx.res, {
      changeOrigin: true,
      target,
      selfHandleResponse: true,
      buffer: rawBody ? streamify([rawBody]) : undefined
    });
  });

  await next();
};

module.exports = serialProxy;
