import { Check } from "lucide-react";

/**
 * Reusable SelectableCard component for selection rows
 * (Payment methods, delivery types, options, etc.)
 */
export function SelectableCard({
  isSelected = false,
  onSelect,
  title,
  subtitle,
  icon,
  image,
  showRadio = true,
  children,
  className = "",
  disabled = false,
}) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (e) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group cursor-pointer flex items-center justify-between gap-4 px-5 py-3.5 rounded-3xl transition-all duration-300 select-none ${
        disabled
          ? "opacity-50 cursor-not-allowed border-2 border-gray-200 bg-gray-50"
          : isSelected
            ? "border-2 border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.01]"
            : "border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
      } ${className}`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {image ? (
          <img
            src={image}
            alt={typeof title === "string" ? title : ""}
            className={`h-9 w-12 object-contain transition-transform duration-300 ${
              isSelected ? "scale-105" : "opacity-80"
            }`}
          />
        ) : icon ? (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
              isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          {title && (
            <p
              className={`text-base md:text-lg transition-colors duration-300 ${
                isSelected
                  ? "text-primary font-extrabold"
                  : "text-gray-700 font-semibold"
              }`}
            >
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 font-normal truncate mt-0.5">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      {showRadio && (
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
            isSelected
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-gray-300 bg-white group-hover:border-gray-400"
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      )}
    </div>
  );
}

export default SelectableCard;

