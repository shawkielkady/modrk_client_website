import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const OTP_LENGTH = 4;
const INITIAL_COUNTDOWN = 5;

export default function OtpForm({ onSubmit, onResend }) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const inputsRef = useRef([]);
  const loading = useSelector((state) => state.auth.loading);
  const isEmpty = digits.every((digit) => digit === "");
  const focusInput = (index) => inputsRef.current[index]?.focus();

  // 5-second countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;
    onResend?.();
    setCountdown(INITIAL_COUNTDOWN);
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (val && !/^\d$/.test(val)) return;

    const next = [...digits];
    next[index] = val;
    setDigits(next);

    if (val && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < OTP_LENGTH; i++) {
      next[i] = pasted[i] || "";
    }
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length === OTP_LENGTH) {
      onSubmit?.(code);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-primary text-center mb-2">
        {t("otp.title")}
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        {t("otp.subtitle")}
      </p>

      <div className="flex justify-center gap-3 mb-6" dir="ltr">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-16 h-16 text-center text-2xl font-bold rounded-xl border border-[#886E49] bg-white focus:border-primary outline-none"
            autoFocus={i === 0}
          />
        ))}
      </div>

      {/* Resend code counter & button */}
      <div className="flex items-center justify-center gap-1.5 mb-6 text-sm">
        <span className="text-gray-500">{t("otp.didNotReceive")}</span>
        {countdown > 0 ? (
          <span className="text-gray-400 font-medium">
            {t("otp.resendIn")}{" "}
            <span className="text-secondary font-bold font-mono">
              00:0{countdown}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-secondary font-bold hover:underline cursor-pointer transition-colors"
          >
            {t("otp.resendCode")}
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isEmpty || loading}
        className="w-full btn btn-primary py-2 rounded-md text-white font-bold hover:bg-secondary enabled:hover:bg-secondary
                   disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-50"
      >
        {t("otp.confirm")}
      </button>

      <div className="text-center mt-6">
        <Link to="/login" className="text-secondary font-bold">
          {t("otp.hasAccount")}
        </Link>
      </div>
    </form>
  );
}
