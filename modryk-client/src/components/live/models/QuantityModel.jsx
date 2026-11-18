import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  addItemToCart,
  clearCartError,
  selectAddingToCart,
  selectAddToCartError,
} from "../../../data/cart/cartSlice";
import { selectSelectedFarm } from "../../../data/farms/farmsSlice";
import { useToast } from "../../../shared components/toast";
import { useModal } from "../../../shared components/model/ModelContext";
import currencyIcon from "../../../../assets/currency.png";

function QuantityModel() {
  const [count, setCount] = useState(1);
  const [localError, setLocalError] = useState(null);

  const selectedFarm = useSelector(selectSelectedFarm);
  const loading = useSelector(selectAddingToCart);
  const addToCartError = useSelector(selectAddToCartError);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { closeModal } = useModal();

  useEffect(() => {
    dispatch(clearCartError());
    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch]);

  const maxLength = selectedFarm?.sheeps?.length ?? 0;

  const increment = useCallback(() => {
    setLocalError(null);
    setCount((prev) => {
      if (prev < maxLength) {
        return prev + 1;
      }
      return prev;
    });
  }, [maxLength]);

  const decrement = useCallback(() => {
    setLocalError(null);
    setCount((prev) => Math.max(1, prev - 1));
  }, []);

  const getTotalPrice = () => {
    return count * (selectedFarm?.average_price ?? 0);
  };

  const handleSubmitCart = async () => {
    if (loading) return;

    setLocalError(null);
    dispatch(clearCartError());

    if (!selectedFarm?.id) {
      const msg = "بيانات المزرعة غير متوفرة حالياً";
      setLocalError(msg);
      showError(msg);
      return;
    }

    try {
      await dispatch(
        addItemToCart({
          farm_id: selectedFarm.id,
          num_of_sheeps: count,
          sale_type: "individual",
        }),
      ).unwrap();

      showSuccess("تمت إضافة الطلب إلى السلة بنجاح");
      closeModal();
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      if (status === 401) {
        dispatch(clearCartError());
        showError(
          typeof err === "string"
            ? err
            : err?.message || "يرجى تسجيل الدخول أولاً",
        );
        closeModal();
        navigate("/login");
        return;
      }

      // if (status === 422) {
      //   dispatch(clearCartError());
      //   openModal(PreOrderWarn);
      //   return;
      // }

      const message =
        typeof err === "string"
          ? err
          : err?.message || "فشل إضافة الذبيحة إلى السلة";
      setLocalError(message);
      showError(message);
    }
  };

  const errorMessage = localError || addToCartError;

  return (
    <div className="w-full bg-primary text-white flex flex-col">
      <div className="flex items-center justify-between gap-3 pr-5 pl-14 pt-5 pb-3.5 border-b border-white/10">
        <div className="flex-1 text-right">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0 leading-snug">
            لديك طلب سابق في السلة
          </h2>
        </div>
      </div>
      <div className="flex bg-[#D9D9D9] items-center justify-center flex-col p-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={increment}
            disabled={loading || count >= maxLength}
            className="text-white w-8 h-8 flex justify-center items-center text-xl rounded-full bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
          <div
            id="count"
            className="font-bold bg-white text-primary text-lg px-8 rounded-2xl flex items-center justify-center"
          >
            {count}
          </div>
          <button
            type="button"
            onClick={decrement}
            disabled={loading || count <= 1}
            className="text-white w-8 h-8 flex justify-center items-center text-xl rounded-full bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
        </div>

        <div className="bg-primary rounded-2xl text-white w-fit my-2 text-sm px-3 py-1">
          {selectedFarm?.farm_type} | {selectedFarm?.farm_weight_to} -{" "}
          {selectedFarm?.farm_weight_from} كيلو | السن {selectedFarm?.age}
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-center">
          <p className="text-primary">السعر الإجمالي</p>
          <p className="bg-[#6294A6] text-white px-8 py-1 rounded-2xl flex items-center gap-3 text-3xl font-bold">
            {getTotalPrice()}
            <img
              src={currencyIcon}
              alt="ريال"
              className="h-5 w-5 object-contain"
            />
          </p>
          <p className="text-secondary">هذا السعر تقريبي</p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm font-bold text-red-600 text-right"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmitCart}
          disabled={loading}
          className="p-3 rounded-4xl cursor-pointer px-12 btn-primary mt-3 flex items-center justify-center gap-2 min-w-[150px] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التأكيد...</span>
            </>
          ) : (
            "تأكيد"
          )}
        </button>
      </div>
    </div>
  );
}

export default QuantityModel;
