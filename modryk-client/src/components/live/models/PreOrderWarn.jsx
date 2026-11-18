import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  clearActiveCart,
  clearCartError,
  selectClearingCart,
  selectClearingCartError,
} from "../../../data/cart/cartSlice";
import { useModal } from "../../../shared components/model/ModelContext";
import { useToast } from "../../../shared components/toast";
import QuantityModel from "./QuantityModel";
import { Link, useNavigate } from "react-router-dom";

function PreOrderWarn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectClearingCart);
  const reduxError = useSelector(selectClearingCartError);
  const [localError, setLocalError] = useState(null);

  const { openModal, closeModal } = useModal();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    dispatch(clearCartError());
    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch]);

  const removeCart = async () => {
    if (loading) return;

    setLocalError(null);
    dispatch(clearCartError());

    try {
      await dispatch(clearActiveCart()).unwrap();
      showSuccess("تم تفريغ السلة بنجاح");
      openModal(QuantityModel);
    } catch (err) {
      const message =
        typeof err === "string" ? err : err?.message || "فشل تفريغ السلة";
      setLocalError(message);
      showError(message);
    }
  };

  const errorMessage = localError || reduxError;
  const completePreOrder = () => {
    closeModal(PreOrderWarn);
    navigate("/confirm-order");
  };
  return (
    <div className="w-full bg-primary text-white flex flex-col">
      <div className="flex items-center justify-between gap-3 pr-5 pl-14 pt-5 pb-3.5 border-b border-white/10">
        <div className="flex-1 text-right">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0 leading-snug">
            لديك طلب سابق في السلة
          </h2>
        </div>
      </div>
      <div className="flex bg-[#D9D9D9] items-center justify-center">
        <div className="p-6 text-center bg-[#D9D9D9] w-full">
          <p className="font-bold text-xl text-primary">
            يجب افراغ محتويات السلة لتسطيع الاختيار والطلب مجدداً.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm font-bold text-red-600 text-right"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-between items-center gap-3 pb-2 mt-5">
            <button
              type="button"
              onClick={removeCart}
              disabled={loading}
              className="bg-[#115B57] text-white p-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التفريغ...</span>
                </>
              ) : (
                "إزالة محتوى السلة"
              )}
            </button>
            <Link
              onClick={completePreOrder}
              to="/confirm-order"
              type="button"
              disabled={loading}
              className="bg-[#D0D0D0] text-primary p-3 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إكمال الطلب السابق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreOrderWarn;
