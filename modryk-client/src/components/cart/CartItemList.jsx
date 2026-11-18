import CartItemCard from "./CartItemCard";

export default function CartItemsList({ items, onConfirm, onReorder }) {
  return (
    <section className="flex flex-col gap-4">
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onConfirm={onConfirm}
          onReorder={onReorder}
        />
      ))}
    </section>
  );
}
