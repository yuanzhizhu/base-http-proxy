const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const serialProxy = require("./middleware/serialProxy");

const app = new Koa();

app.use(bodyParser());
app.use(
  serialProxy({
    target: "https://diy.youzanyun.com/",
    key: "mainResText"
  })
);
app.use(serialProxy({ target: "http://localhost:8080", key: "isvResText" }));

console.log("dispatch启动成功");
app.listen(80);
