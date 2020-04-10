const Koa = require("koa");
const httpProxy = require("http-proxy");
const bodyParser = require("koa-bodyparser");
const streamify = require("stream-array");

const app = new Koa();
const proxy = httpProxy.createProxyServer();

app.use(bodyParser());

app.use(async ctx => {
  await new Promise(() => {
    proxy.web(ctx.req, ctx.res, {
      changeOrigin: true,
      target: "https://diy.youzanyun.com/",
      buffer: ctx.request.rawBody ? streamify([ctx.request.rawBody]) : undefined
    });
  });
});

console.log("启动成功");
app.listen(80);
