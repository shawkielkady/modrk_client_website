import AuthCard from "../components/auth/AuthCard";
import LoginForm from "../components/auth/LoginForm";
import AuthSideImage from "../components/auth/AuthSideImage";
import { loginUser } from "../data/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../shared components/toast";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showError } = useToast();

  const handleLogin = async (credentials) => {
    console.log(credentials);
    try {
      await dispatch(loginUser(credentials)).unwrap();
      navigate("/otp", { state: { phone: credentials.username } });
    } catch (err) {
      console.log(err);
      showError(typeof err === "string" ? err : "فشل تسجيل الدخول");
    }
  };

  return (
    <main className="min-h-screen bg-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 m-auto pt-20 bg-primary px-4 mt-15">
        <AuthCard>
          <LoginForm onSubmit={handleLogin} />
        </AuthCard>
        <AuthSideImage />
      </div>
    </main>
  );
}
