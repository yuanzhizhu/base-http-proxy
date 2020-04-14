const httpProxy = require("http-proxy");
const streamify = require("stream-array");

const proxy = httpProxy.createProxyServer();

const mainStationProxy = ({ target }) => async (ctx, next) => {
  const { mainStationResponse } = ctx;

  await new Promise(resolve => {
    proxy.on("proxyRes", proxyRes => {
      var body = [];

      proxyRes.on("data", chunk => {
        body.push(chunk);
      });

      proxyRes.on("end", () => {
        body = Buffer.concat(body).toString();
        ctx.body = body;
        resolve();
      });
    });

    proxy.web(ctx.req, ctx.res, {
      changeOrigin: true,
      target,
      selfHandleResponse: true,
      headers: {
        mainStationResponse
      },
      buffer: ctx.request.rawBody ? streamify([ctx.request.rawBody]) : undefined
    });
  });

  await next();
};

module.exports = mainStationProxy;
