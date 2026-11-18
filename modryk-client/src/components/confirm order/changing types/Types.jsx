import SingleType from "./SingleType";

import { memo } from "react";
function Types({ currentType, setCurrentType, deliveryMethods }) {
  return (
    <div className="flex deliver-types my-4 justify-center  gap-6 ">
      {(deliveryMethods || []).map((method) => (
        <SingleType
          key={method.id}
          text={method.name}
          mainImg={method.image}
          value={method.id}
          currentType={currentType}
          setCurrentType={setCurrentType}
        />
      ))}
    </div>
  );
}

export default memo(Types);
