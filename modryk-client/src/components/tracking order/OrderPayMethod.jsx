import { useSelector } from "react-redux";

function OrderPayMethod() {
  const payMethod = useSelector(
    (state) => state.orders?.currentOrder?.payment_method,
  );

  if (!payMethod) return null;

  return (
    <div className="py-4 space-y-4 w-full mx-auto md:w-[70%]">
      <h2 className="font-bold text-2xl">طريقة الدفع: </h2>
      <li className="border cursor-pointer border-[#eee] flex gap-4 px-4 py-2 rounded-3xl bg-[#E2F1F4]">
        {payMethod.image && (
          <img
            src={payMethod.image}
            className="h-8 w-10 object-contain"
            alt={payMethod.name || "طريقة الدفع"}
          />
        )}
        <p> الدفع عن طريق {payMethod.name || "بطاقة الدفع"} </p>
      </li>
    </div>
  );
}

export default OrderPayMethod;
