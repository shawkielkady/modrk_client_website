import { useSelector } from "react-redux";
import {
  selectCart,
  selectCartCalculations,
} from "../../../data/cart/cartSlice";

function OrderSummary() {
  const calculations = useSelector(selectCartCalculations);
  const cart = useSelector(selectCart);

  const subTotal = calculations?.sub_total ?? cart?.sub_total ?? 1800;
  const deliveryCost = calculations?.delivery_cost ?? 150;
  const grandTotal =
    calculations?.grand_total ??
    Number(subTotal) + Number(deliveryCost);

  return (
    <div className="py-6 md:py-8 px-4 md:px-0 border-b border-b-gray-300">
      <div className="w-full mx-auto md:w-[70%]">
        <h2 className="font-bold text-xl md:text-2xl mb-6">
          إجمالي السعر الخاص بك :
        </h2>

        <div className="w-full rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between bg-[#D9D9D9] px-6 md:px-10 py-4">
            <p className="text-[#123340] font-bold text-base md:text-xl">
              إجمالي سعر المنتجات
            </p>
            <div className="flex items-center gap-3 md:gap-6">
              <span className="text-[#123340] font-extrabold text-lg md:text-2xl">
                {subTotal}
              </span>
              <span className="text-[#123340] font-bold text-sm md:text-base">
                SR
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#EDEDED] px-6 md:px-10 py-4">
            <p className="text-[#123340] font-bold text-base md:text-xl">
              التوصيل
            </p>
            <div className="flex items-center gap-3 md:gap-6">
              <span className="text-[#123340] font-extrabold text-lg md:text-2xl">
                {deliveryCost}
              </span>
              <span className="text-[#123340] font-bold text-sm md:text-base">
                SR
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#D9D9D9] px-6 md:px-10 py-4">
            <p className="text-[#123340] font-bold text-base md:text-xl">
              المجموع النهائي
            </p>
            <div className="flex items-center gap-3 md:gap-6">
              <span className="text-[#123340] font-extrabold text-lg md:text-2xl">
                {grandTotal}
              </span>
              <span className="text-[#123340] font-bold text-sm md:text-base">
                SR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
