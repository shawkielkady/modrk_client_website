import { useEffect } from "react";
import ProductCard from "../../shared components/ProductCard";
import ProductCardSkeleton from "../../shared components/skeletons/ProductCardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFarms,
  selectFarms,
  selectFarmsLoading,
} from "../../data/farms/farmsSlice";

export default function ProductsGrid() {
  const farms = useSelector(selectFarms);
  const loading = useSelector(selectFarmsLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFarms());
  }, [dispatch]);

  return (
    <div className="app-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        ) : farms.length > 0 ? (
          farms.map((farm) => <ProductCard key={farm.id} farm={farm} />)
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 font-bold">
            لا توجد متاجر متاحة حالياً
          </div>
        )}
      </div>
    </div>
  );
}
