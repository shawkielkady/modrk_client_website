import { useDispatch } from "react-redux";
import {
  recalculateCart,
  updateSubmitCartSheep,
} from "../../../data/cart/cartSlice";
import CuttingTypeRow from "./CuttingTypeRow";

function CuttingInfoBox({
  data = [],
  cutting,
  setCutting,
  title,
  fieldKey,
  sheepId = "all",
}) {
  const dispatch = useDispatch();

  return (
    <div className="w-full mx-auto md:w-[80%]">
      <h2 className="font-bold text-2xl">
        {title}:<span className="text-secondary">*</span>
      </h2>

      <ul className="my-4 space-y-4">
        {data.map((ele, i) => {
          const isObject = typeof ele === "object" && ele !== null;
          const optionValue = isObject ? ele.id : i;
          const optionTitle = isObject ? (ele.name ?? ele.title ?? "") : ele;

          return (
            <CuttingTypeRow
              key={isObject ? ele.id : i}
              title={optionTitle}
              isActive={cutting === optionValue}
              onSelect={() => {
                setCutting?.(optionValue);
                if (fieldKey) {
                  const mappedValue =
                    fieldKey === "want_stomach_intestines"
                      ? optionTitle !== "لا أرغب"
                      : optionValue;

                  dispatch(
                    updateSubmitCartSheep({
                      sheepId,
                      applyToAll: sheepId === "all" || !sheepId,
                      changes: { [fieldKey]: mappedValue },
                    }),
                  );
                  dispatch(recalculateCart());
                }
              }}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default CuttingInfoBox;
