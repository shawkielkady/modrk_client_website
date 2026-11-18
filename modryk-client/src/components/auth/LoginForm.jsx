import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

export default function LoginForm({ onSubmit }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({ username: "", password: "" });
  const isEmpty = !values.username.trim() || !values.password;
  const { loading } = useSelector((state) => state.auth);
  // change handler for inputs
  const handleChange = (e, val) => {
    if (typeof e === "string") {
      setValues((prev) => ({ ...prev, [e]: val }));
    } else if (e?.target) {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.username || !values.password) {
      return;
    }
    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        id="username"
        name="username"
        value={values.username}
        onChange={handleChange}
        placeholder={t("auth.username")}
        autoComplete="username"
        required
      />
      {/* {isError && <p className="text-center text-error">{error?.name || ""}</p>} */}

      <PasswordInput
        id="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        placeholder={t("auth.password")}
        autoComplete="current-password"
        required
      />
      {/* {isError && (
        <p className="text-center text-error">{error?.password || ""}</p>
      )} */}

      <button
        type="submit"
        disabled={isEmpty || loading}
        className="w-full btn btn-primary py-2 rounded-md text-white font-bold text-center flex items-center justify-center
                   enabled:hover:bg-secondary
                   disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin  " /> : t("auth.login")}
      </button>

      <Link
        to="/forgot-password"
        className="block text-center mt-4 text-secondary cursor-pointer"
      >
        {t("auth.forgotPassword")}
      </Link>

      <p className="text-center mt-4 text-primary">
        {t("auth.noAccount")}{" "}
        <Link to="/register" className="text-secondary font-bold">
          {t("auth.registerNow")}
        </Link>
      </p>
    </form>
  );
}
