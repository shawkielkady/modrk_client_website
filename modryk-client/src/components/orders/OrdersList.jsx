import OrderCard from "./OrderCard";

export default function OrdersList({ orders = [] }) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      {orders.map((order, index) => (
        <OrderCard key={order.id ?? order.order_id ?? index} order={order} />
      ))}
    </section>
  );
}
