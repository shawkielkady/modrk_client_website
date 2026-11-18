import { useSelector } from "react-redux";

function OrgInfo() {
  const { cart } = useSelector((state) => state.cart);
  return (
    <div className="flex justify-center items-center py-6 border-b border-b-gray-300 gap-6">
      <div className="rounded-full w-15 h-15 bg-secondary"></div>
      <div className="font-bold text-xl">
        <p> {cart?.farm?.name}</p>
        <div className="flex gap-2">
          <p>س . ت: {cart?.farm?.commercial_number}</p>
          <span> | </span>
          <p> حظيرة: {cart?.farm?.farm_no} </p>
        </div>
      </div>
    </div>
  );
}

export default OrgInfo;
