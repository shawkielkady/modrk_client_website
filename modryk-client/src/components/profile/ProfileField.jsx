import { memo, useEffect, useId, useRef, useState } from "react";
import RowHeader from "./RowHeader";
import { ACTION_CLASS } from "./constants";
import { useDispatch } from "react-redux";
import { editUserProfile } from "../../data/auth/authSlice";
import { useToast } from "../../shared components/toast";

const INPUT_BASE =
  "border border-[#E8DFD0] rounded-xl px-4 p-2 w-full md:w-100 mt-2";

function ProfileField({ field, value }) {
  const { id, label, icon, type, dir } = field;
  const inputId = useId();
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();
  const handleEditing = async () => {
    try {
      await dispatch(editUserProfile({ [field.id]: draft.trim() })).unwrap();
      showSuccess("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      showError(
        typeof error === "string" ? error : error?.message || "فشل تحديث الملف الشخصي",
      );
    }
  };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEditing = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const save = () => {
    handleEditing();
    setIsEditing(false);
  };

  const cancel = () => setIsEditing(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    else if (e.key === "Escape") cancel();
  };

  return (
    <div className="p-5">
      <RowHeader
        icon={icon}
        label={label}
        htmlFor={inputId}
        action={
          field.readOnly ? null : (
            <button
              type="button"
              className={ACTION_CLASS}
              onClick={isEditing ? save : startEditing}
            >
              {isEditing ? "حفظ" : "تعديل"}
            </button>
          )
        }
      />
      <input
        ref={inputRef}
        id={inputId}
        name={id}
        type={type}
        dir={dir}
        readOnly={!isEditing}
        value={isEditing ? draft : value}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`${INPUT_BASE} ${isEditing ? "bg-white" : "bg-[#F0F0F0]"}`}
      />
    </div>
  );
}

export default memo(ProfileField);
