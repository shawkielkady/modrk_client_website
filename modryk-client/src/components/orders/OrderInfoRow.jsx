export default function OrderInfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-12 gap-y-1">
      <p className="font-bold">{label}</p>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
