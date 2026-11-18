import { useTranslation } from "react-i18next";
import shepherd from "../../../assets/homeshephered.png";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <div className="app-container">
      <div className="flex justify-center flex-col md:flex-row items-center w-full mt-4">
        <div className="w-full lg:w-1/2 gap-4 flex flex-col justify-start items-start">
          <p className="text-secondary text-3xl font-extrabold leading-[1.2]">
            {t("about.title")}
          </p>
          <p className="text-primary-light text-lg font-extrabold leading-[1.2]">
            {t("about.description")}
          </p>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <img src={shepherd} className="h-64" alt="" />
        </div>
      </div>
    </div>
  );
}
