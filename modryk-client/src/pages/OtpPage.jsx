import AuthCard from "../components/auth/AuthCard";
import OtpForm from "../components/auth/OtpForm";
import AuthSideImage from "../components/auth/AuthSideImage";
import { useDispatch, useSelector } from "react-redux";
import {
  verifyOtpUser,
  resendOtpCode,
  selectPendingPhone,
} from "../data/auth/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../shared components/toast";

export default function OtpPage() {
  const { state } = useLocation();
  const reduxPhone = useSelector(selectPendingPhone);
  const phone = state?.phone || reduxPhone;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleVerify = async (code) => {
    try {
      const data = await dispatch(
        verifyOtpUser({ otp_code: code, phone }),
      ).unwrap();

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      showSuccess("تم التحقق من رمز التحقق بنجاح");
      navigate("/");
    } catch (err) {
      showError(typeof err === "string" ? err : "فشل التحقق من رمز التحقق");
    }
  };

  const handleResend = async () => {
    if (!phone) {
      showError("رقم الجوال غير متوفر لإعادة الإرسال");
      return;
    }

    try {
      await dispatch(resendOtpCode(phone)).unwrap();
      showSuccess("تم إعادة إرسال كود التحقق بنجاح");
    } catch (err) {
      showError(typeof err === "string" ? err : "فشل إعادة إرسال رمز التحقق");
    }
  };

  return (
    <main className="min-h-screen bg-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 m-auto pt-20 bg-primary px-4 mt-15">
        <AuthCard>
          <OtpForm onSubmit={handleVerify} onResend={handleResend} />
        </AuthCard>
        <AuthSideImage />
      </div>
    </main>
  );
}
