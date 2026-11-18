import { useDispatch } from "react-redux";
import {
  recalculateCart,
  updateSubmitCartSheep,
} from "../../../data/cart/cartSlice";

function WithHeadBox({ withHead, setWithHead, sheepId = "all" }) {
  const dispatch = useDispatch();

  const handleToggle = () => {
    const nextValue = !withHead;
    setWithHead?.(nextValue);
    dispatch(
      updateSubmitCartSheep({
        sheepId,
        applyToAll: sheepId === "all" || !sheepId,
        changes: { want_head_feet: nextValue },
      }),
    );
    dispatch(recalculateCart());
  };

  return (
    <div className="w-full mx-auto md:w-[80%]">
      <h2 className="font-bold text-2xl">
        الرأس:<span className="text-secondary">*</span>
      </h2>

      <ul className="my-4 space-y-4">
        <li
          onClick={handleToggle}
          className={`cursor-pointer rounded-2xl px-10 py-2 font-bold text-2xl
        ${withHead ? "bg-primary text-white" : "bg-[#F3F3F3] text-primary"}`}
        >
          شلوطة الرأس
        </li>
      </ul>
    </div>
  );
}

export default WithHeadBox;
