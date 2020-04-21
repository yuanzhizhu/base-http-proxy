class TrafficObserver {
  constructor(ctx) {
    this.ctx = ctx;
    this.totalHttp = 0;
    this.totalHttpIng = 0;
    this.lastUpdate = new Date().getTime();
  }

  /**
   * 检测是否是高并发
   * 当前 n >= 10个/秒，即算是高并发
   */
  checkIsHighConcurrency() {
    this.totalHttpIng++;
    const now = new Date().getTime();
    const timeDiff = now - this.lastUpdate;

    if (timeDiff >= 2000) {
      this.totalHttp = this.totalHttpIng;
      this.lastUpdate = now;
    } else if (timeDiff < 2000 && timeDiff >= 1000) {
      const totalHttpDiff = this.totalHttpIng - this.totalHttp;
      this.totalHttp = this.totalHttpIng;
      this.lastUpdate = now;

      if (totalHttpDiff / timeDiff >= 5) {
        this.onHighConcurrency && this.onHighConcurrency(totalHttpDiff);
      }
    }
  }
}

module.exports = TrafficObserver;
