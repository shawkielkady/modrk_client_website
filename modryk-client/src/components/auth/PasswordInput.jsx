import { memo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  className = "",
  placeholder,
  name,
  value,
  onChange,
  ...props
}) {
  const [show, setShow] = useState(false);

  const handleInputChange = (e) => {
    if (!onChange) return;
    if (onChange.length >= 2) {
      onChange(name, e.target.value);
    } else {
      onChange(e);
    }
  };

  return (
    <div className="mb-4 relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        aria-label={placeholder}
        name={name}
        value={value}
        onChange={handleInputChange}
        className={`w-full px-4 py-2 rounded-md border border-[#886E49] pe-12 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 cursor-pointer"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default memo(PasswordInput);
