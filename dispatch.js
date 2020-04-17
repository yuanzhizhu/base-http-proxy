const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const simpleProxy = require("./middleware/simpleProxy");
const mixinProxy = require("./middleware/mixinProxy");

const app = new Koa();

app.use(bodyParser());

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
    mixinKeys: "mainRes"
  })
);

app.use(async (ctx) => {
  ctx.body = ctx.isvRes.body;
})

console.log("dispatch启动成功");
app.listen(80);
