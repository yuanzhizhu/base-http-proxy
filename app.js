const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  const body = ctx.request.body;
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
  ctx.body = body;
  await next();
});

console.log("业务app启动成功");
app.listen(8080);
