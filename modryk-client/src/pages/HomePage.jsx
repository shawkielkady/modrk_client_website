import HomePanner from "@/components/home/HomePanner";
import AboutSection from "../components/home/AboutSection";
import BrandBanner from "../components/home/BrandBanner";
import CategoriesSlider from "../components/home/CategoriesSlider";
import ProductsGrid from "../components/home/ProuctsGrid";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <main className="mt-15 relative">
        <div className="px-2 py-3 text-white flex items-center justify-center text-center bg-primary-light">
          <p className="font-bold text-md md:text-2xl">{t("nav.subtitle")}</p>
        </div>
        <CategoriesSlider />
        <ProductsGrid />
        <BrandBanner />
        <AboutSection />
        <HomePanner />
      </main>
    </>
  );
}

export default HomePage;
