import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import footerLogo from "../../assets/footerlogo.png";

// Payment icons
import applePay from "../../assets/payments/apple.png";
import madaPay from "../../assets/payments/mada.png";
import payPal from "../../assets/payments/paypal.png";

// Social icons
import ytIcon from "../../assets/social/yt.png";
import ttIcon from "../../assets/social/tt.png";
import scIcon from "../../assets/social/sc.png";
import waIcon from "../../assets/social/wa.png";
import igIcon from "../../assets/social/ig.png";
import xIcon from "../../assets/social/x.png";
import fbIcon from "../../assets/social/fb.png";

export default function Footer() {
  const { t } = useTranslation();
  const settings = useSelector((state) => state.general?.settings);

  const socials = [
    {
      name: "YouTube",
      icon: ytIcon,
      href: settings?.youtube || "https://youtube.com",
    },
    {
      name: "TikTok",
      icon: ttIcon,
      href: settings?.tiktok || "https://tiktok.com",
    },
    {
      name: "Snapchat",
      icon: scIcon,
      href: settings?.snapchat || "https://snapchat.com",
    },
    {
      name: "WhatsApp",
      icon: waIcon,
      href: settings?.whatsapp
        ? `https://wa.me/${String(settings.whatsapp).replace(/[^0-9]/g, "")}`
        : "https://whatsapp.com",
    },
    {
      name: "Instagram",
      icon: igIcon,
      href: settings?.instagram || "https://instagram.com",
    },
    {
      name: "X",
      icon: xIcon,
      href: settings?.twitter || settings?.x || "https://x.com",
    },
    {
      name: "Facebook",
      icon: fbIcon,
      href: settings?.facebook || "https://facebook.com",
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-8 sm:pt-12 pb-24 sm:pb-28 lg:pb-12 mt-auto w-full">
      <div className="app-container">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-10 lg:gap-16 text-center md:text-start">
          {/* Logo Section */}
          <div className="shrink-0 flex items-center justify-center md:justify-start">
            <Link
              to="/"
              className="inline-block transition-transform duration-300 hover:scale-105"
              aria-label="الرئيسية"
            >
              <img
                src={footerLogo}
                alt="Modryk Logo"
                className="w-20 sm:w-24 md:w-28 lg:w-32 h-auto object-contain drop-shadow-xs"
              />
            </Link>
          </div>

          {/* Fast Links Section */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h3 className="text-secondary text-lg sm:text-xl font-bold tracking-wide">
              {t("footer.fastLinks", "Fast Links")}
            </h3>
            <ul className="flex flex-col items-center md:items-start space-y-2 text-sm sm:text-base text-gray-600 font-medium">
              <li>
                <Link
                  to="/"
                  className="hover:text-secondary transition-colors duration-200"
                >
                  {t("footer.home", "Home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-secondary transition-colors duration-200"
                >
                  {t("footer.terms", "Terms and conditions")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-secondary transition-colors duration-200"
                >
                  {t("footer.contactUs", "Contact Us")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods & Socials Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-secondary text-lg sm:text-xl font-bold tracking-wide">
              {t("footer.paymentMethods", "Payment Methods")}
            </h3>

            {/* Payment Icons */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center md:justify-start">
              <img
                src={applePay}
                alt="Apple Pay"
                className="h-6 sm:h-7 object-contain"
              />
              <img
                src={madaPay}
                alt="Mada"
                className="h-6 sm:h-7 object-contain"
              />
              <img
                src={payPal}
                alt="PayPal"
                className="h-7 sm:h-8 object-contain"
              />
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center md:justify-start pt-1">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="transition-transform duration-200 hover:scale-110 hover:opacity-90 inline-block"
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg shadow-xs"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

