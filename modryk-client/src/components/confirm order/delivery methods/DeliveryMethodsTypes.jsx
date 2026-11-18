import SingleType from "../changing types/SingleType";
import normalTypeImgActive from "../../../../assets/normaldeliveryactive.png";

function DeliveryMethodsTypes({ currentType, setCurrentType, subMethods = [] }) {
  return (
    <div className="flex deliver-types my-4 justify-center  gap-6 ">
      {(subMethods || []).map((method) => (
        <SingleType
          key={method.id}
          text={method.name}
          mainImg={method.image}
          activeImg={normalTypeImgActive}
          value={method.id}
          currentType={currentType}
          setCurrentType={setCurrentType}
        />
      ))}
    </div>
  );
}

export default DeliveryMethodsTypes;
