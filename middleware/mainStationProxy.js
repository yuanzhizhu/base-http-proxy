const httpProxy = require("http-proxy");
const streamify = require("stream-array");

const proxy = httpProxy.createProxyServer();

const mainStationProxy = async (ctx, next) => {
  await new Promise(resolve => {
    proxy.on("proxyRes", proxyRes => {
      var body = [];
      proxyRes.on("data", chunk => {
        body.push(chunk);
      });

      proxyRes.on("end", () => {
        body = Buffer.concat(body).toString();
        ctx.mainStationResponse = body;
        resolve();
      });
    });

    proxy.web(ctx.req, ctx.res, {
      changeOrigin: true,
      target: "https://diy.youzanyun.com/",
      selfHandleResponse: true,
      buffer: ctx.request.rawBody ? streamify([ctx.request.rawBody]) : undefined
    });
  });

  await next();
};

module.exports = mainStationProxy;
