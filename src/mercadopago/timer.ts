export default new class Timer {

  users = new Map<string, NodeJS.Timeout>()

  set(userId: string) {

    const timeout = this.get(userId);
    if (timeout) this.clear(userId);

    const timer = setTimeout(() => this.clear(userId), 1000 * 10);
    this.users.set(userId, timer);
    return;
  }

  has(userId: string) {
    return this.users.has(userId);
  }

  get(userId: string) {
    return this.users.get(userId);
  }

  clear(userId: string) {
    const timeout = this.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      this.users.delete(userId);
    }
    return;
  }

}