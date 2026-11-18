import { useSelector } from "react-redux";

function OrderItemsDetails() {
  const { cart } = useSelector((state) => state.cart);
  const { farm } = cart;
  return (
    <div className="py-4">
      <h2 className="font-bold text-2xl">الأغنام التي تم اختيارها</h2>
      <div className="rounded-4xl p-6 bg-[#D0D0D0] w-full  mx-auto md:w-[80%] mt-4 space-y-4  ">
        <div className="flex justify-between items-center text-lg md:text-2xl font-bold">
          <div className="flex gap-4 items-center grow-1">
            <img src="./assets/Weighticon.png" className="w-10 h-10" />
            <p>الوزن </p>
          </div>
          <div className="grow-1">
            {farm.farm_weight_to} - {farm.farm_weight_from} كيلو
          </div>
        </div>
        <div className="flex justify-between items-center text-lg md:text-2xl font-bold">
          <div className="flex gap-4 items-center grow-1">
            <img src="./assets/quantityicon.png" className="w-10 h-10" />
            <p>الكمية </p>
          </div>
          <div className="grow-1">{cart.cart_items.length} أغنام</div>
        </div>
        <div className="flex justify-between items-center text-lg md:text-2xl font-bold">
          <div className="flex gap-4 items-center grow-1">
            <img src="./assets/Sheeptypeicon.png" className="w-10 h-10" />
            <p>نوع الغنمة </p>
          </div>
          <div className="grow-1"> {farm.farm_type} </div>
        </div>
        <div className="flex justify-between items-center text-lg md:text-2xl font-bold">
          <div className="flex gap-4 items-center grow-1">
            <img src="./assets/sheeppriceicon.png" className="w-10 h-10" />
            <p>سعر الأغنام </p>
          </div>
          <div className="flex gap-3 items-center grow-1">
            {cart.sub_total}{" "}
            <img src="./assets/redcurrency.png" className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderItemsDetails;
