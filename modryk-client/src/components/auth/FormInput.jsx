export default function FormInput({
  type = "text",
  className = "",
  placeholder,
  ...props
}) {
  return (
    <div className="mb-4">
      <input
        type={type}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full px-4 py-2 rounded-md border border-[#886E49] ${className}`}
        {...props}
      />
    </div>
  );
}
