const httpProxy = require("http-proxy");
const streamify = require("stream-array");
const mixinRequestBody = require("./mixinRequestBody");

const proxy = httpProxy.createProxyServer();

/**
 * 混合代理
 */
const mixinProxy = ({ target, key, mixingKey }) => async (ctx, next) => {
  if (!mixingKey) throw new Error("mixingKey必传");

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
    const newRequestBody = JSON.stringify(
      mixinRequestBody(ctx.request.rawBody, ctx[mixingKey])
    );
    const newRequestBodyLen = new Buffer(newRequestBody).length;

    // 混合代理，强制把请求变为POST，并且用JSON格式
    proxy.on("proxyReq", proxyReq => {
      proxyReq.setHeader("method", "POST");
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", newRequestBodyLen);
    });

    proxy.web(ctx.req, ctx.res, {
      target,
      changeOrigin: true,
      selfHandleResponse: true,
      buffer: streamify([newRequestBody])
    });
  });

  await next();
};

module.exports = mixinProxy;
