const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const mainStationProxy = require('./middleware/mainStationProxy');
const youzanyunProxy = require('./middleware/youzanyunProxy');

const app = new Koa();

app.use(bodyParser());
app.use(mainStationProxy);
app.use(youzanyunProxy);

console.log("dispatch启动成功");
app.listen(80);
