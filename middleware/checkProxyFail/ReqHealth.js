const TrafficObserver = require("./TrafficObserver");

const HEALTH = Symbol("health");
const HALF_HEALTH = Symbol("half_health");
const UNHEALTH = Symbol("unhealth");

class ReqHealth extends TrafficObserver {
  constructor() {
    super();
    this.status = HEALTH;

    this.failReq = 0;
    this.liveFailReq = 0;
  }

  checkHealth({ isSuccess }) {
    if (isSuccess === undefined)
      throw new Error("checkHealth()必须传isSuccess");

    if (isSuccess === false) {
      this.liveFailReq++;
    }

    this.checkIsHighConcurrency();
  }

  onHighConcurrency(totalReqDiff) {
    if (this.status === HEALTH) {
      const failReqDiff = this.liveFailReq - this.failReq;
      this.liveFailReq = this.failReq;

      if (failReqDiff / totalReqDiff > 0.3) {
        this.status = UNHEALTH;
      }
    }
  }
}

exports.HEALTH = HEALTH;
exports.HALF_HEALTH = HALF_HEALTH;
exports.UNHEALTH = UNHEALTH;

module.exports = ReqHealth;
