class TrafficObserver {
  constructor() {
    this.totalReq = 0;
    this.liveTotalReq = 0;
    this.lastUpdateReqNumber = new Date().getTime();
  }

  /**
   * 检测是否是高并发
   * 当前 n >= 10个/秒，即算是高并发
   */
  checkIsHighConcurrency() {
    this.liveTotalReq++;
    const now = new Date().getTime();
    const timeDiff = now - this.lastUpdateReqNumber;

    if (timeDiff >= 2000) {
      this.totalReq = this.liveTotalReq;
      this.lastUpdateReqNumber = now;
    } else if (timeDiff < 2000 && timeDiff >= 1000) {
      const totalReqDiff = this.liveTotalReq - this.totalReq;
      this.totalReq = this.liveTotalReq;
      this.lastUpdateReqNumber = now;

      if (totalReqDiff / timeDiff >= 5) {
        this.onHighConcurrency && this.onHighConcurrency(totalReqDiff);
      }
    }
  }
}

module.exports = TrafficObserver;
