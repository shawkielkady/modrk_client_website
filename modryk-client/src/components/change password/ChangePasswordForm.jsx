import PasswordInput from "../auth/PasswordInput";
import { Loader2 } from "lucide-react";

function ChangePasswordForm({
  password,
  handleSaveField,
  onSubmit,
  loading = false,
}) {
  const isEmpty =
    !password.oldPassword ||
    !password.newPassword ||
    !password.confirmNewPassword;

  return (
    <form onSubmit={onSubmit}>
      <PasswordInput
        value={password.oldPassword}
        onChange={handleSaveField}
        name="oldPassword"
        placeholder="كلمة المرور القديمة"
        autoComplete="current-password"
        required
      />

      <PasswordInput
        value={password.newPassword}
        onChange={handleSaveField}
        name="newPassword"
        placeholder="كلمة المرور الجديدة"
        autoComplete="new-password"
        required
      />

      <PasswordInput
        value={password.confirmNewPassword}
        onChange={handleSaveField}
        name="confirmNewPassword"
        placeholder="تأكيد كلمة المرور الجديدة"
        autoComplete="new-password"
        required
      />

      <button
        type="submit"
        disabled={isEmpty || loading}
        className="w-full btn btn-primary py-2 rounded-md text-white font-bold text-center flex items-center justify-center mt-6
                   enabled:hover:bg-secondary
                   disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
      </button>
    </form>
  );
}

export default ChangePasswordForm;
