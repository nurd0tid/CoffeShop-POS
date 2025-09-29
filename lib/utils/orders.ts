// lib/state/orders.ts
type OrderStatus = "pending" | "paid" | "cancelled" | "failed";

class OrderStore {
  private map = new Map<string, OrderStatus>();

  set(tid: string, s: OrderStatus) {
    this.map.set(tid, s);
  }
  get(tid: string): OrderStatus {
    return this.map.get(tid) ?? "pending";
  }
}

export const orderStore = new OrderStore();
