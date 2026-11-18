import { useDispatch } from "react-redux";
import { fetchFarms } from "../data/farms/farmsSlice";
import allStores from "../../assets/allstores.png";
export default function CategoryCard({ category, isAll = false }) {
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => {
        if (isAll) {
          dispatch(fetchFarms({ force: true }));
        } else if (category?.id) {
          dispatch(fetchFarms({ farmTypeId: category.id }));
        }
      }}
      className="shrink-0 w-[130px] flex flex-col items-center gap-2 cursor-pointer p-2 transition-all"
    >
      <div className="cat-card w-full h-[110px] rounded-xl bg-[#ddd] overflow-hidden shadow-md">
        <img
          src={isAll ? allStores : category.image}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-primary-dark text-md font-bold">
        {isAll ? "كل المتاجر" : category.name}
      </p>
    </div>
  );
}
