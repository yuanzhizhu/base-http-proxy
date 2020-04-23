const httpProxy = require("http-proxy");
const streamify = require("stream-array");
const ProxyError = require("../ProxyError");

/**
 * 简单proxy
 * 把proxy结果，塞入ctx[key]中
 */
const simpleProxy = ({ target, key, proxyTimeout }) => async (ctx, next) => {
  if (!target) throw new Error("target必传");
  if (!key) throw new Error("key必传");

  const proxy = httpProxy.createProxyServer();

  await new Promise((resolve, reject) => {
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

    proxy.on("error", () => {
      reject(new ProxyError("代理超时或发生错误，请稍后重试"));
    });

    proxy.web(ctx.req, ctx.res, {
      target,
      changeOrigin: true,
      selfHandleResponse: true,
      buffer: rawBody ? streamify([rawBody]) : undefined,
      proxyTimeout
    });
  });

  proxy.close();

  await next();
};

module.exports = simpleProxy;
