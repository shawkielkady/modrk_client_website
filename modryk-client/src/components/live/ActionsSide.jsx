import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function ActionsSide() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Back"
      className="col-span-1 lg:col-span-2 lg:col-start-1 lg:row-start-1
                    self-start justify-self-start lg:justify-self-center
                    text-primary rounded-2xl bg-[#eee] p-3 sm:p-4 text-xl w-fit cursor-pointer hover:bg-gray-200 transition-colors"
    >
      <ArrowRight />
    </button>
  );
}

export default ActionsSide;
