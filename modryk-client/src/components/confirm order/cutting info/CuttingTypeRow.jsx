function CuttingTypeRow({ title, isActive, onSelect }) {
  return (
    <li
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl px-10 py-2 font-bold text-2xl
        ${isActive ? "bg-primary text-white" : "bg-[#F3F3F3] text-primary"}`}
    >
      {title}
    </li>
  );
}
export default CuttingTypeRow;
