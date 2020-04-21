const TrafficObserver = require("./TrafficObserver");

const HEALTH = Symbol("health");
const HALF_HEALTH = Symbol("half_health");
const UNHEALTH = Symbol("unhealth");

class HttpHealth extends TrafficObserver {
  constructor(ctx) {
    if (!ctx) throw new Error("init HttpHealth，ctx参数必传");
    super(ctx);
    this.status = HEALTH;
    this.failHttp = 0;
    this.failHttpIng = 0;
    this.breakTime = null;
    this.pendingOneHttp = false;
  }

  checkHealth() {
    if (this.status === UNHEALTH) {
      this.ctx.body = "已熔断";
      const now = new Date().getTime();
    } else if (this.status === HALF_HEALTH) {
      if (this.pendingOneHttp) {
        this.ctx.body = "半熔断中";
      } else {
        this.pendingOneHttp = true;
      }
    }
  }

  /**
   * 保存请求状态
   * @param isSuccess - 请求成功与失败否
   */
  saveHttpStatus({ isSuccess }) {
    if (isSuccess === undefined)
      throw new Error("saveHttpStatus()必须传isSuccess参数");

    if (isSuccess === false) {
      this.failHttpIng++;
    }

    this.checkIsHighConcurrency();
  }

  /**
   * 转化为不健康状态
   */
  becomeUnhealth() {
    this.status = UNHEALTH;
    this.breakTime = new Date().getTime();
  }

  /**
   * 高并发时，触发该监听
   */
  onHighConcurrency(totalHttpDiff) {
    if (this.status === HEALTH) {
      const failHttpDiff = this.failHttpIng - this.failHttp;
      this.failHttpIng = this.failHttp;

      if (failHttpDiff / totalHttpDiff > 0.3) {
        this.becomeUnhealth();
      }
    }
  }
}

module.exports = HttpHealth;
