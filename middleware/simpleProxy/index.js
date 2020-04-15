const httpProxy = require("http-proxy");
const streamify = require("stream-array");

const proxy = httpProxy.createProxyServer();

/**
 * 简单proxy
 * 把proxy结果，塞入ctx[key]中
 */
const simpleProxy = ({ target, key }) => async (ctx, next) => {
  if (!target) throw new Error("target必传");
  if (!key) throw new Error("key必传");

  await new Promise(resolve => {
    proxy.on("proxyRes", proxyRes => {
      let body = [];

      proxyRes.on("data", chunk => {
        body.push(chunk);
      });

      proxyRes.on("end", () => {
        const headers = proxyRes.headers;
        body = Buffer.concat(body);

        ctx[key] = {
          headers,
          body
        };

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
