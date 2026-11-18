import Types from "./changing types/Types";
import { Fragment, useState } from "react";
import CuttingInfoBox from "./cutting info/CuttingInfoBox";
import { Preparations, stomaches } from "./ConfirmOrderMock";
import WithHeadBox from "./cutting info/WithHeadBox";
import { useSelector } from "react-redux";
import {
  selectCuttingTypes,
  selectPreparationTypes,
} from "../../data/general/generalSlice";
import { selectSubmitCartDataWrapper } from "../../data/cart/cartSlice";
import sheepBadge from "../../../assets/sheepbadge.svg";

function ChargingTypes({ currentType, setCurrentType, deliveryMethods }) {
  const [selectedSheepId, setSelectedSheepId] = useState("all");
  const [cutting, setCutting] = useState(null);
  const [preparation, setPreparation] = useState(null);
  const [stomachState, setStomachState] = useState(0);
  const [withHead, setWithHead] = useState(false);

  const cartItems = useSelector((state) => state.cart.cart?.cart_items || []);
  const cuttingTypes = useSelector(selectCuttingTypes);
  const apiPreparationTypes = useSelector(selectPreparationTypes);
  const submitCartDataWrapper = useSelector(selectSubmitCartDataWrapper);

  const preparationOptions =
    apiPreparationTypes?.length > 0 ? apiPreparationTypes : Preparations;

  const activeSheep =
    selectedSheepId === "all"
      ? submitCartDataWrapper?.sheeps?.[0]
      : submitCartDataWrapper?.sheeps?.find(
          (s) => String(s.sheep_id) === String(selectedSheepId),
        );

  const activeCutting = activeSheep?.cutting_type_id ?? cutting;
  const activePreparation = activeSheep?.preparation_type_id ?? preparation;
  const activeWithHead = activeSheep
    ? Boolean(activeSheep.want_head_feet)
    : withHead;

  return (
    <div className="py-4">
      <h2 className="font-bold text-2xl">
        {" "}
        حدد طريقة استلام الطلب <span className="text-secondary">*</span>{" "}
      </h2>
      <Types
        currentType={currentType}
        setCurrentType={setCurrentType}
        deliveryMethods={deliveryMethods}
      />
      <div className="p-2 px-4 text-secondary rounded-2xl text-center bg-[#D9D9D9] mx-auto w-fit font-bold">
        ملاحظة تختلف الأسعار حسب طريقة الاستلام
      </div>
      <div className="flex items-start gap-3 mt-6 w-full px-4 md:w-[60%] md:px-0 mx-auto">
        <button
          type="button"
          onClick={() => setSelectedSheepId("all")}
          className={`shrink-0 rounded-2xl p-3 md:p-4 text-xl md:text-2xl font-bold h-16 md:h-20 flex items-center cursor-pointer transition-colors ${
            selectedSheepId === "all"
              ? "bg-primary text-white shadow-md"
              : "bg-[#9D9D9D] text-secondary"
          }`}
        >
          الكل
        </button>

        <div className="flex-1 flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible no-scrollbar snap-x">
          {cartItems.map((item) => {
            const sheepId = item.sheep?.id ?? item.sheep_id ?? item.id;
            const isSelected = String(selectedSheepId) === String(sheepId);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedSheepId(sheepId)}
                className="flex flex-col items-center gap-3 shrink-0 w-24 md:w-auto snap-start cursor-pointer"
              >
                <img
                  src={sheepBadge}
                  alt=""
                  className={`h-20 w-20 md:h-30 md:w-30 rounded-full transition-transform ${
                    isSelected ? "scale-105 ring-4 ring-primary" : ""
                  }`}
                />
                <p
                  className={`p-1 px-3 rounded-2xl text-lg md:text-xl font-bold transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-[#9D9D9D] text-secondary"
                  }`}
                >
                  {sheepId}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      {currentType == 5 && (
        <Fragment>
          <CuttingInfoBox
            data={cuttingTypes}
            cutting={activeCutting}
            setCutting={setCutting}
            title="التقطيع"
            fieldKey="cutting_type_id"
            sheepId={selectedSheepId}
          />
          <CuttingInfoBox
            data={preparationOptions}
            cutting={activePreparation}
            setCutting={setPreparation}
            title="التجهيز"
            fieldKey="preparation_type_id"
            sheepId={selectedSheepId}
          />
          <WithHeadBox
            withHead={activeWithHead}
            setWithHead={setWithHead}
            sheepId={selectedSheepId}
          />
          <CuttingInfoBox
            data={stomaches}
            cutting={stomachState}
            setCutting={setStomachState}
            title="الكرش والمصران"
            fieldKey="want_stomach_intestines"
            sheepId={selectedSheepId}
          />
        </Fragment>
      )}
    </div>
  );
}

export default ChargingTypes;
