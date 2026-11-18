import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeliveryMethodsTypes from "./delivery methods/DeliveryMethodsTypes";
import FastMethodInfo from "./delivery methods/FastMethodInfo";
import NormalMethodInfo from "./delivery methods/NormalMethodInfo";
import { BookUser, Loader2, MapPin, Pencil, Plus, Star } from "lucide-react";
import { useModal } from "../../shared components/model/ModelContext";
import {
  selectAddressLoading,
  selectAddresses,
  selectDefaultAddress,
  selectSelectedAddressId,
  setSelectedAddressId,
} from "../../data/addresses/addressesSlice";
import AddAddressModal from "./models/AddAddressModal";
import AddressBookModal from "./models/AddressBookModal";
import {
  getAddressLocationLabel,
  getAddressSubDetails,
  getAddressTypeLabel,
  mergeAddressList,
} from "./models/addressHelpers";

function DeliveryMethods({
  subMethods = [],
  currentSubMethod,
  setCurrentSubMethod,
}) {
  const dispatch = useDispatch();
  const [localSubMethod, setLocalSubMethod] = useState(
    () => subMethods?.[0]?.id ?? null,
  );
  const { openModal } = useModal();

  // date and time
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  const addresses = useSelector(selectAddresses);
  const defaultAddress = useSelector(selectDefaultAddress);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const addressesLoading = useSelector(selectAddressLoading);

  const currentType =
    currentSubMethod !== undefined ? currentSubMethod : localSubMethod;
  const handleSelectSubMethod = setCurrentSubMethod || setLocalSubMethod;

  const selectedSub = subMethods?.find(
    (m) => String(m.id) === String(currentType),
  );
  const isFastDelivery =
    Boolean(selectedSub?.name?.includes("سريع")) ||
    String(selectedSub?.id) === "fast" ||
    currentType === "fast";

  const hasAddressesData = Array.isArray(addresses) && addresses.length > 0;

  const addressList = useMemo(
    () => mergeAddressList(addresses, defaultAddress),
    [addresses, defaultAddress],
  );

  const resolvedDefaultAddress =
    defaultAddress ||
    addressList.find((addr) => Boolean(addr.is_default)) ||
    null;

  const selectedAddress = useMemo(() => {
    if (addressList.length === 0) return null;
    return (
      addressList.find(
        (addr) => String(addr.id) === String(selectedAddressId),
      ) ||
      resolvedDefaultAddress ||
      addressList[0] ||
      null
    );
  }, [addressList, selectedAddressId, resolvedDefaultAddress]);

  const handleOpenAddAddressModal = () => {
    openModal(AddAddressModal, {
      modalClassName: "bg-white max-w-[540px]",
      onSave: (data) => {
        if (data?.id) {
          dispatch(setSelectedAddressId(data.id));
        }
      },
    });
  };

  const handleOpenEditAddressModal = (addr) => {
    openModal(AddAddressModal, {
      modalClassName: "bg-white max-w-[540px]",
      address: addr,
      onSave: (data) => {
        if (data?.id) {
          dispatch(setSelectedAddressId(data.id));
        }
      },
    });
  };

  const handleOpenAddressBookModal = () => {
    openModal(AddressBookModal, {
      modalClassName: "bg-white max-w-[540px]",
    });
  };

  const handleSelectDefaultAddress = () => {
    if (resolvedDefaultAddress?.id) {
      dispatch(setSelectedAddressId(resolvedDefaultAddress.id));
    }
  };

  const isSelectedDefault =
    Boolean(selectedAddress?.is_default) ||
    (resolvedDefaultAddress?.id &&
      selectedAddress?.id &&
      String(selectedAddress.id) === String(resolvedDefaultAddress.id));
  const locationLabel = selectedAddress
    ? getAddressLocationLabel(selectedAddress)
    : "";
  const subDetails = selectedAddress
    ? getAddressSubDetails(selectedAddress)
    : "";

  return (
    <div className="py-6 md:py-8 px-4 md:px-0 border-b border-b-gray-300">
      <div className="w-full mx-auto md:w-[80%]">
        <h2 className="font-bold text-xl md:text-2xl">
          حدد طريقة التوصيل: <span className="text-secondary">*</span>
        </h2>
        <DeliveryMethodsTypes
          currentType={currentType}
          setCurrentType={handleSelectSubMethod}
          subMethods={subMethods}
        />
        {isFastDelivery ? (
          <FastMethodInfo />
        ) : (
          <NormalMethodInfo date={date} setDate={setDate} />
        )}
        {/* قسم العنوان */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-base md:text-xl flex items-center gap-1.5 m-0">
              <MapPin className="w-5 h-5 text-secondary" />
              <span>
                العنوان: <span className="text-secondary">*</span>
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {resolvedDefaultAddress?.id && (
                <button
                  type="button"
                  onClick={handleSelectDefaultAddress}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all border ${
                    String(selectedAddress?.id) ===
                    String(resolvedDefaultAddress.id)
                      ? "bg-secondary text-white border-secondary shadow-xs"
                      : "bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>استخدام العنوان الافتراضي</span>
                </button>
              )}

              {hasAddressesData && (
                <button
                  type="button"
                  onClick={handleOpenAddressBookModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-white text-xs sm:text-sm font-bold cursor-pointer transition-all"
                >
                  <BookUser className="w-4 h-4" />
                  <span>سجل العناوين</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenAddAddressModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-white text-xs sm:text-sm font-bold cursor-pointer hover:bg-primary-dark transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عنوان جديد</span>
              </button>
            </div>
          </div>

          {addressesLoading && !selectedAddress ? (
            <div className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 text-primary font-bold text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-secondary" />
              <span>جاري تحميل العنوان...</span>
            </div>
          ) : selectedAddress ? (
            <div className="rounded-2xl p-4 border-2 border-primary bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 text-right">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                    {getAddressTypeLabel(selectedAddress.address_type)}
                  </span>
                  {isSelectedDefault && (
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                      افتراضي
                    </span>
                  )}
                  {locationLabel && (
                    <span className="font-extrabold text-primary text-sm sm:text-base">
                      {locationLabel}
                    </span>
                  )}
                </div>

                {selectedAddress.details && (
                  <p className="text-gray-700 font-medium text-xs sm:text-sm m-0">
                    {selectedAddress.details}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {subDetails && <span>{subDetails}</span>}
                  {selectedAddress.special_mark && (
                    <span>علامة مميزة: {selectedAddress.special_mark}</span>
                  )}
                  {selectedAddress.phone && (
                    <span dir="ltr" className="text-primary/85 font-bold">
                      {selectedAddress.phone}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEditAddressModal(selectedAddress)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white border border-primary/25 hover:bg-primary hover:text-white text-primary text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 self-start sm:self-center"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddAddressModal}
              className="text-primary font-bold gap-4 text-base md:text-xl py-2.5 px-4 md:px-10 mx-auto w-80 justify-center cursor-pointer text-center rounded-4xl bg-[#D0D0D0] hover:bg-[#c2c2c2] transition flex items-center"
            >
              <MapPin />
              <span>اضف عنوان</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeliveryMethods;
