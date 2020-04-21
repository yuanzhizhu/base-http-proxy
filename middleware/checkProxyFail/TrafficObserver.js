class TrafficObserver {
  constructor(ctx) {
    this.ctx = ctx;
    this.totalHttp = 0;
    this.totalHttpIng = 0;
    this.lastUpdate = new Date().getTime();
  }

  /**
   * 流量统计函数
   * 一个必须被调用到的函数
   */
  recodeTraffic() {
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

      console.log("两次大于1秒小于2秒");
      if (totalHttpDiff / (timeDiff / 1000) >= 5) {
        this.onHighConcurrency && this.onHighConcurrency(totalHttpDiff);
      }
    }
  }
}

module.exports = TrafficObserver;
