import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryCard from "../../shared components/CategoryCard";
import CategorySkeleton from "../../shared components/skeletons/CategorySkeleton";
import { useSelector } from "react-redux";
import {
  selectFarmTypes,
  selectFarmTypesLoading,
} from "../../data/general/generalSlice";

export default function CategoriesSlider() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const categories = useSelector(selectFarmTypes);
  const loading = useSelector(selectFarmTypesLoading);

  const scrollByAmount = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const isLoading = loading || categories.length === 0;

  return (
    <div className="app-container border-b border-[#ddd]">
      <div className="relative w-full px-4">
        {/* أزرار التمرير (بتظهر في الموبايل والتابلت بس) */}
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label={t("categories.prev")}
          className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-2 hover:bg-white text-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label={t("categories.next")}
          className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-2 hover:bg-white text-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={containerRef}
          className="flex overflow-x-auto scroll-smooth no-scrollbar gap-12 py-4 px-2 lg:grid lg:grid-cols-8 lg:gap-6 lg:overflow-visible"
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))
          ) : (
            <>
              <CategoryCard isAll={true} />
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
