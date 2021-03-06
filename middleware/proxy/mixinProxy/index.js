const httpProxy = require("http-proxy");
const streamify = require("stream-array");
const buildPureResponse = require("./buildPureResponse");
const ProxyError = require("../ProxyError");

/**
 * 混合代理
 */
const mixinProxy = ({ target, key, mixinKeys, proxyTimeout }) => async (
  ctx,
  next
) => {
  if (!target) throw new Error("target必传");
  if (!key) throw new Error("key必传");
  if (!mixinKeys) throw new Error("mixinKeys必传");

  if (typeof mixinKeys === "string") {
    mixinKeys = [mixinKeys];
  }

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

    let newRequestBody = {
      requestBody: ctx.request.body
    };

    for (let mixingKey of mixinKeys) {
      if (!ctx[mixingKey])
        throw new Error(
          `key为${key}的mixinProxy，找不到mixinKeys为${mixingKey}的响应`
        );

      const response = buildPureResponse(ctx[mixingKey]);
      newRequestBody[mixingKey] = response;
    }

    newRequestBody = JSON.stringify(newRequestBody);

    const newRequestBodyLen = new Buffer(newRequestBody).length;

    // 混合代理，强制把请求变为POST，并且用JSON格式
    proxy.on("proxyReq", proxyReq => {
      proxyReq.setHeader("method", "POST");
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", newRequestBodyLen);
    });

    proxy.on("error", () => {
      reject(new ProxyError("代理超时或发生错误，请稍后重试"));
    });

    proxy.web(ctx.req, ctx.res, {
      target,
      changeOrigin: true,
      selfHandleResponse: true,
      buffer: streamify([newRequestBody]),
      proxyTimeout
    });
  });

  proxy.close();

  await next();
};

module.exports = mixinProxy;
