const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  const body = ctx.request.body;
  const t = parseInt(Math.random() * 3000);
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
  ctx.body = body;
  await next();
});

console.log("业务app启动成功");
app.listen(8080);
