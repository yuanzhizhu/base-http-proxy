const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const checkLinkHealth = require("./middleware/checkLinkHealth");
const { simpleProxy, mixinProxy } = require("./middleware/proxy");

const app = new Koa();

app.use(bodyParser());

app.use(checkLinkHealth());

app.use(
  simpleProxy({
    target: "https://qiniu.qingyanjiaoyou.com/",
    key: "mainRes"
  })
);

app.use(
  mixinProxy({
    target: "http://localhost:8080",
    key: "isvRes",
    mixinKeys: "mainRes",
    proxyTimeout: 3000
  })
);

app.use(async ctx => {
  ctx.body = ctx.isvRes.body;
});

console.log("dispatch启动成功");
app.listen(80);
