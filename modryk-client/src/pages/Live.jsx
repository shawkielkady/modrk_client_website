import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ActionsSide from "../components/live/ActionsSide";
// import LiveSide from "../components/live/LiveSide";
import ChooseSheepModel from "../components/live/models/ChooseSheepModel";
import { useModal } from "../shared components/model/ModelContext";
import {
  fetchFarmDetails,
  clearSelectedFarm,
  selectSelectedFarm,
  selectFarmsDetailsLoading,
  selectFarmsError,
} from "../data/farms/farmsSlice";
import modrykLogo from "../../assets/modryklogo.png";
import CameraPage from "@/components/streaming/StreamComponent";

function LivePage() {
  const { id } = useParams();
  const { openModal } = useModal();
  const dispatch = useDispatch();

  const selectedFarm = useSelector(selectSelectedFarm);
  const loading = useSelector(selectFarmsDetailsLoading);
  const error = useSelector(selectFarmsError);

  useEffect(() => {
    if (id) {
      dispatch(fetchFarmDetails(id));
    }
    return () => {
      dispatch(clearSelectedFarm());
    };
  }, [id, dispatch]);

  const isWrongFarm =
    Boolean(selectedFarm?.id) &&
    Boolean(id) &&
    String(selectedFarm.id) !== String(id);

  if (error && (!selectedFarm || isWrongFarm) && !loading) {
    return (
      <main className="min-h-screen bg-black pt-25 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 text-white text-center px-4 max-w-md">
          <p className="text-red-400 font-bold text-lg">{error}</p>
          <button
            type="button"
            onClick={() => id && dispatch(fetchFarmDetails(id))}
            className="btn btn-primary px-6 py-2 rounded-xl text-white cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  if (loading || !selectedFarm || isWrongFarm) {
    return (
      <main className="min-h-screen bg-black pt-25 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 text-white">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin" />
            <img
              src={modrykLogo}
              alt="Modrek"
              className="w-9 h-9 object-contain animate-pulse"
            />
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-200">
            جاري تحميل البث المباشر...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-25">
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 px-4 sm:px-6 py-6 lg:py-10 bg-black">
        <ActionsSide />
        <div
          className="col-span-1 lg:col-span-2 lg:col-start-11 lg:row-start-1
                    self-start justify-self-end lg:justify-self-center"
        >
          <img
            src={modrykLogo}
            alt="Logo"
            className="w-14 sm:w-20 lg:w-28 object-contain"
          />
        </div>
        <CameraPage farm={selectedFarm} />
        <button
          onClick={() =>
            openModal(ChooseSheepModel, {
              modalClassName: "bg-primary text-white max-w-[580px]",
            })
          }
          type="button"
          className="btn btn-primary col-span-2 lg:col-start-1 lg:row-start-2 lg:self-end w-full text-sm xl:text-base cursor-pointer hover:opacity-90 transition-all"
        >
          اختر الاغنام
        </button>
      </div>
    </main>
  );
}

export default LivePage;
