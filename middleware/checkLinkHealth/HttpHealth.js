const TrafficObserver = require("./TrafficObserver");
const HttpUnhealthError = require("./HttpUnhealthError");

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

    this.throttling = false; // 是否正在发送一个http请求
    this.breakTime = null; // 熔断时间
    this.continueSuccess = 0; // 连续成功次数
  }

  /**
   * 熔断所有请求
   */
  breakAll() {
    throw new HttpUnhealthError("请求超时，请稍后再试");
  }

  /**
   * 最多只能通过一个http请求（开启）
   */
  startThrottleHttp() {
    if (this.throttling) {
      throw new HttpUnhealthError("请求超时，请稍后再试");
    }
    this.throttling = true;
  }

  /**
   * 最多只能通过一个http请求（关闭）
   */
  stopThrottleHttp() {
    this.throttling = false;
  }

  /**
   * 检测健康状态
   */
  checkHealthBeforeProxy() {
    if (this.status === UNHEALTH) {
      if (new Date().getTime() - this.breakTime > 30000) {
        console.log("熔断 => 半熔断");
        this.becomeHalfHealth();
        console.log("半熔断中，开始节流");
        this.startThrottleHttp();
      } else {
        console.log("熔断中...");
        this.breakAll();
      }
    } else if (this.status === HALF_HEALTH) {
      console.log("半熔断中，开始节流");
      this.startThrottleHttp();
    }
  }

  /**
   * 保存请求状态
   * @param isSuccess - 本次链路成功与否
   */
  saveHttpIsSuccessAfterProxy({ isSuccess }) {
    console.log(this.status, '保存状态');
    if (isSuccess === undefined)
      throw new Error("saveHttpIsSuccessAfterProxy()必须传isSuccess参数");

    if (isSuccess === false) {
      this.failHttpIng++;
    }

    if (this.status === HALF_HEALTH) {
      this.stopThrottleHttp();
      console.log("刚刚放过一条测试http请求，测试是否恢复");

      if (isSuccess) {
        this.continueSuccess++;
        console.log(`连续成功${this.continueSuccess}次ttp请求测试`);
        if (this.continueSuccess === 2) {
          console.log(`半熔断 => 正常`);
          this.becomeHealth();
        }
      } else {
        console.log(`半熔断 => 熔断`);
        this.becomeUnhealth();
      }
    }

    this.recodeTraffic();
  }

  /**
   * 转化为不健康状态（熔断状态）
   */
  becomeUnhealth() {
    this.status = UNHEALTH;
    this.breakTime = new Date().getTime();
    this.continueSuccess = 0;
  }

  /**
   * 转化为亚健康状态（半熔断）
   */
  becomeHalfHealth() {
    this.status = HALF_HEALTH;
    this.breakTime = null;
    this.continueSuccess = 0;
  }

  /**
   * 转化为健康状态（正常）
   */
  becomeHealth() {
    this.status = HEALTH;
    this.breakTime = null;
    this.continueSuccess = 0;
  }

  /**
   * 高并发时，触发该监听
   */
  onHighConcurrency(totalHttpDiff) {
    console.log("高并发状态中...");
    if (this.status === HEALTH) {
      const failHttpDiff = this.failHttpIng - this.failHttp;
      this.failHttpIng = this.failHttp;

      if (failHttpDiff / totalHttpDiff > 0.3) {
        console.log("正常 => 熔断");
        this.becomeUnhealth();
      }
    }
  }
}

module.exports = HttpHealth;