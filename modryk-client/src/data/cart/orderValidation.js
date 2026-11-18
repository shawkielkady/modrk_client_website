/**
 * Validates the submitCartDataWrapper before sending checkout request.
 * Returns { isValid: boolean, error: string | null }
 */
export function validateCheckoutData(wrapper) {
  if (!wrapper) {
    return { isValid: false, error: "بيانات الطلب غير متوفرة" };
  }

  if (!wrapper.address_id) {
    return { isValid: false, error: "يرجى تحديد عنوان التوصيل أولاً" };
  }

  if (!wrapper.delivery_sub_method_id && !wrapper.delivery_method_id) {
    return { isValid: false, error: "يرجى اختيار طريقة التوصيل المناسبة" };
  }

  if (!wrapper.payment_method_id) {
    return { isValid: false, error: "يرجى تحديد طريقة الدفع" };
  }

  if (!Array.isArray(wrapper.sheeps) || wrapper.sheeps.length === 0) {
    return { isValid: false, error: "السلة فارغة، يرجى إضافة ذبيحة أولاً" };
  }

  return { isValid: true, error: null };
}

export default validateCheckoutData;

