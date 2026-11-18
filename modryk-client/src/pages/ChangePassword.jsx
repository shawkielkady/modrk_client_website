import { LockKeyhole } from "lucide-react";
import { useCallback, useState } from "react";
import ChangePasswordForm from "../components/change password/ChangePasswordForm";
import { useDispatch, useSelector } from "react-redux";
import {
  changeUserPassword,
  selectChangePasswordLoading,
} from "../data/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useToast } from "../shared components/toast";

function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const loading = useSelector(selectChangePasswordLoading);

  const [password, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleSaveField = useCallback((id, value) => {
    setPasswords((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (
      !password.oldPassword ||
      !password.newPassword ||
      !password.confirmNewPassword
    ) {
      showError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (password.newPassword !== password.confirmNewPassword) {
      showError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    try {
      await dispatch(
        changeUserPassword({
          old_password: password.oldPassword,
          new_password: password.newPassword,
          new_password_confirmation: password.confirmNewPassword,
        }),
      ).unwrap();

      showSuccess("تم تغيير كلمة المرور بنجاح");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      navigate("/my-profile");
    } catch (err) {
      showError(
        typeof err === "string" ? err : err?.message || "فشل تغيير كلمة المرور",
      );
    }
  };

  return (
    <main className="app-container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <section className="py-6 sm:py-10 mt-10 sm:mt-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary text-center">
          تغيير كلمة المرور
        </h1>

        <LockKeyhole className="h-40 w-40 text-primary mt-5" />
      </section>

      <section className="my-2 max-w-[400px] mx-auto text-center">
        <ChangePasswordForm
          password={password}
          handleSaveField={handleSaveField}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </section>
    </main>
  );
}

export default ChangePassword;
