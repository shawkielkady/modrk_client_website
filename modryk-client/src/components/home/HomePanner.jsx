import { useTranslation } from "react-i18next";
import homebanner1 from "../../../assets/homebanner1.png";
import homebanner2 from "../../../assets/homebanner2.png";
import homebanner3 from "../../../assets/homebanner3.png";

function HomePanner() {
  const { t } = useTranslation();

  return (
    <section className="bg-[#D9D9D9] my-6 sm:my-8 md:my-10 py-4 sm:py-6 md:py-8 lg:py-10 overflow-hidden">
      <div className="app-container">
        <div
          dir="ltr"
          className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 lg:gap-8"
        >
          {/* Left: Phone & Bill 3D Illustration */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src={homebanner3}
              alt="تقسيط الفاتورة"
              className="w-20 sm:w-36 md:w-48 lg:w-60 xl:w-72 h-auto max-h-32 sm:max-h-48 md:max-h-60 lg:max-h-72 object-contain select-none pointer-events-none drop-shadow-sm transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Center: Headline & Tamara Logo Badge */}
          <div
            dir="rtl"
            className="flex flex-col items-center justify-center text-center px-1 sm:px-3 md:px-6 flex-1 min-w-0"
          >
            <h2 className="text-[#123340] text-sm sm:text-lg md:text-2xl lg:text-3xl font-extrabold leading-snug sm:leading-normal mb-1 sm:mb-2 md:mb-3">
              {t("banner.installment", "تقدر تقسط فاتورتك عن طريق:")}
            </h2>
            <div className="flex items-center justify-center -my-2 sm:-my-4 md:-my-5">
              <img
                src={homebanner2}
                alt="تمارا - Tamara"
                className="w-24 sm:w-36 md:w-44 lg:w-56 h-auto object-contain select-none cursor-pointer hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Hand with Cash 3D Illustration */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src={homebanner1}
              alt="طرق الدفع"
              className="w-16 sm:w-30 md:w-40 lg:w-52 xl:w-64 h-auto max-h-32 sm:max-h-48 md:max-h-60 lg:max-h-72 object-contain select-none pointer-events-none drop-shadow-sm transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePanner;
