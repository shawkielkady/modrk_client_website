import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

export default function RegisterForm({ onSubmit }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const { loading } = useSelector((state) => state.auth);

  const isEmpty =
    !values.name.trim() ||
    !values.phone.trim() ||
    !values.password ||
    !values.confirmPassword;

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
    if (isEmpty || loading) {
      return;
    }
    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        id="name"
        name="name"
        value={values.name}
        onChange={handleChange}
        placeholder={t("auth.name")}
        autoComplete="name"
        required
      />
      <FormInput
        type="email"
        id="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder={t("auth.email")}
        autoComplete="email"
      />
      <FormInput
        type="tel"
        id="phone"
        name="phone"
        value={values.phone}
        onChange={handleChange}
        placeholder={t("auth.phone")}
        autoComplete="tel"
        required
      />
      <PasswordInput
        id="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        placeholder={t("auth.password")}
        autoComplete="new-password"
        required
      />
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        placeholder={t("auth.confirmPassword")}
        autoComplete="new-password"
        required
      />

      <button
        type="submit"
        disabled={isEmpty || loading}
        className="w-full btn btn-primary py-2 rounded-md text-white font-bold text-center flex items-center justify-center
                   enabled:hover:bg-secondary
                   disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : t("auth.register")}
      </button>

      <p className="text-center mt-4 text-primary">
        {t("auth.hasAccount")}{" "}
        <Link to="/login" className="text-secondary font-bold">
          {t("auth.loginNow")}
        </Link>
      </p>
    </form>
  );
}
