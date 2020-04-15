const httpProxy = require("http-proxy");
const streamify = require("stream-array");
const buildPureResponse = require("./buildPureResponse");
const mixinRequestWithResponse = require("./mixinRequestWithResponse");

const proxy = httpProxy.createProxyServer();

/**
 * 混合代理
 */
const mixinProxy = ({ target, key, mixingKey }) => async ctx => {
  if (!target) throw new Error("target必传");
  if (!key) throw new Error("key必传");
  if (!mixingKey) throw new Error("mixingKey必传");

  await new Promise(() => {
    const response = buildPureResponse(ctx[mixingKey]);

    const newRequestBody = JSON.stringify(
      mixinRequestWithResponse(ctx.request.body, response)
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
      buffer: streamify([newRequestBody])
    });
  });
};

module.exports = mixinProxy;
