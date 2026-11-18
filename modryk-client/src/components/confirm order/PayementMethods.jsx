import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PayMethodRow from "./payement methods/PayMethodRow";
import {
  fetchPaymentMethods,
  selectPaymentMethods,
} from "../../data/general/generalSlice";
import {
  applyCartCoupon,
  recalculateCart,
  removeCartCoupon,
  selectCartCouponApplied,
  selectCartCouponCode,
  selectCartCouponError,
  selectSelectedPaymentMethodId,
  selectSubmitCartDataWrapper,
  setSelectedPaymentMethodId,
  updateSubmitCartData,
} from "../../data/cart/cartSlice";
import currencyPrimary from "../../../assets/currencyprimary.png";
import tamaraCard from "../../../assets/tamaraitemcard.png";
import { CheckCircle2, Loader2, X } from "lucide-react";

const DEFAULT_PAYMENT_METHODS = [
  { id: 1, name: "بطاقة مدى البنكية / فيزا", image: null },
  { id: 2, name: "Apple Pay", image: null },
  { id: 3, name: "تمارا (تقسيط على 4 دفعات)", image: tamaraCard },
  { id: 4, name: "الدفع عند الاستلام", image: null },
];

function PayementMethods() {
  const dispatch = useDispatch();
  const apiPaymentMethods = useSelector(selectPaymentMethods);
  const selectedPaymentMethodId = useSelector(selectSelectedPaymentMethodId);
  const submitCartDataWrapper = useSelector(selectSubmitCartDataWrapper);

  const couponCodeFromStore = useSelector(selectCartCouponCode);
  const couponApplied = useSelector(selectCartCouponApplied);
  const couponError = useSelector(selectCartCouponError);

  const [couponInput, setCouponInput] = useState(
    couponCodeFromStore || submitCartDataWrapper?.coupon_code || "",
  );
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  useEffect(() => {
    if (!Array.isArray(apiPaymentMethods) || apiPaymentMethods.length === 0) {
      dispatch(fetchPaymentMethods());
    }
  }, [apiPaymentMethods, dispatch]);

  const paymentMethodsList = useMemo(() => {
    const rawMethods = Array.isArray(apiPaymentMethods)
      ? apiPaymentMethods
      : Array.isArray(apiPaymentMethods?.data)
        ? apiPaymentMethods.data
        : [];

    if (rawMethods.length > 0) {
      return rawMethods.map((m) => {
        if (
          !m.image &&
          m.name &&
          (m.name.includes("تمارا") || m.name.toLowerCase().includes("tamara"))
        ) {
          return { ...m, image: tamaraCard };
        }
        return m;
      });
    }

    return DEFAULT_PAYMENT_METHODS;
  }, [apiPaymentMethods]);

  const activePaymentId =
    submitCartDataWrapper?.payment_method_id ??
    selectedPaymentMethodId ??
    paymentMethodsList?.[0]?.id ??
    1;

  useEffect(() => {
    if (
      activePaymentId !== null &&
      submitCartDataWrapper?.payment_method_id !== activePaymentId
    ) {
      dispatch(setSelectedPaymentMethodId(activePaymentId));
      dispatch(updateSubmitCartData({ payment_method_id: activePaymentId }));
    }
  }, [activePaymentId, submitCartDataWrapper?.payment_method_id, dispatch]);

  const handleSelectPayment = async (id) => {
    try {
      await dispatch(recalculateCart({ payment_method_id: id })).unwrap();
      dispatch(setSelectedPaymentMethodId(id));
      dispatch(updateSubmitCartData({ payment_method_id: id }));
    } catch {
      // إذا فشل الـ recalculateCart، لا يتم تغيير طريقة الدفع
    }
  };

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    const trimmed = couponInput.trim();
    if (!trimmed) return;
    setCouponSubmitting(true);
    try {
      await dispatch(applyCartCoupon(trimmed)).unwrap();
    } catch {
      // Error handled in Redux couponError
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponSubmitting(true);
    try {
      await dispatch(removeCartCoupon()).unwrap();
      setCouponInput("");
    } catch {
      // ignore
    } finally {
      setCouponSubmitting(false);
    }
  };

  return (
    <div className="py-6 md:py-8 px-4 md:px-0 border-b border-b-gray-300">
      <div className="w-full mx-auto md:w-[70%]">
        <h2 className="font-bold text-xl md:text-2xl">ادخل كود الخصم :</h2>
        <form onSubmit={handleApplyCoupon} className="flex mt-2">
          <div className="flex-1">
            <input
              placeholder="ادخل كود الخصم"
              type="text"
              value={couponInput}
              disabled={couponApplied || couponSubmitting}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full border bg-[#eee] border-gray-300 rounded-r-lg px-4 py-2 text-primary font-medium disabled:opacity-70"
            />
          </div>
          {couponApplied ? (
            <button
              type="button"
              onClick={handleRemoveCoupon}
              disabled={couponSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-l-lg cursor-pointer flex items-center gap-1 transition-colors"
            >
              {couponSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              <span>إلغاء</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={couponSubmitting || !couponInput.trim()}
              className="bg-primary hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-l-lg cursor-pointer flex items-center gap-1 transition-opacity"
            >
              {couponSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              <span>ادخال</span>
            </button>
          )}
        </form>

        {couponApplied && (
          <p className="flex items-center gap-1 text-sm text-green-700 font-bold mt-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم تطبيق كود الخصم بنجاح!</span>
          </p>
        )}
        {couponError && !couponApplied && (
          <p className="text-sm text-red-600 font-medium mt-2">{couponError}</p>
        )}

        <ul className="space-y-3.5 my-6">
          {(paymentMethodsList || []).map((payementMethod) => (
            <PayMethodRow
              key={payementMethod.id}
              payementMethod={payementMethod}
              handleSelectPayement={handleSelectPayment}
              selectedPay={activePaymentId}
              isActive={String(activePaymentId) === String(payementMethod.id)}
              onSelect={handleSelectPayment}
            />
          ))}
        </ul>

        <div className="flex justify-between items-center text-xl md:text-3xl font-bold mt-8">
          <span>قسط</span>
          <span className="text-secondary">530</span>
          <img
            src={currencyPrimary}
            alt="SR"
            className="h-8 md:h-10 w-8 md:w-10 object-contain inline-block"
          />
          <span className="text-gray-500 text-base md:text-2xl">
            / شهرياً /
          </span>
          <span className="text-secondary">4</span>
          <span>دفعات</span>
        </div>
      </div>
    </div>
  );
}

export default PayementMethods;
