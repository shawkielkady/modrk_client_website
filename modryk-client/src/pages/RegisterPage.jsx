import AuthCard from "../components/auth/AuthCard";
import RegisterForm from "../components/auth/RegisterForm";
import AuthSideImage from "../components/auth/AuthSideImage";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../data/auth/authSlice";
import { useToast } from "../shared components/toast";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError } = useToast();

  const handleRegister = async (data) => {
    console.log(data);
    try {
      await dispatch(registerUser(data)).unwrap();
      navigate("/otp", { state: { phone: data.phone } });
    } catch (err) {
      console.log(err);
      showError(typeof err === "string" ? err : "فشل إنشاء الحساب");
    }
  };

  return (
    <main className="min-h-screen bg-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 m-auto pt-20 bg-primary px-4 mt-15">
        <AuthCard>
          <RegisterForm onSubmit={handleRegister} />
        </AuthCard>
        <AuthSideImage />
      </div>
    </main>
  );
}
