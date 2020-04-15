const httpProxy = require("http-proxy");
const streamify = require("stream-array");

const proxy = httpProxy.createProxyServer();

/**
 * 简单proxy
 * 把proxy结果，塞入ctx[key]中
 */
const simpleProxy = ({ target, key }) => async (ctx, next) => {
  await new Promise(resolve => {
    proxy.on("proxyRes", proxyRes => {
      let body = [];

      proxyRes.on("data", chunk => {
        body.push(chunk);
      });

      proxyRes.on("end", () => {
        // TODO:toString是否合理？
        body = Buffer.concat(body).toString();
        ctx[key] = body;
        resolve();
      });
    });

    let rawBody = ctx.request.rawBody;

    proxy.web(ctx.req, ctx.res, {
      target,
      changeOrigin: true,
      selfHandleResponse: true,
      buffer: rawBody ? streamify([rawBody]) : undefined
    });
  });

  await next();
};

module.exports = simpleProxy;
