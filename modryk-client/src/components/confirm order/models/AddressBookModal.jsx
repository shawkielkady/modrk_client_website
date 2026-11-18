import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, MapPin, Pencil, Plus } from "lucide-react";
import {
  selectAddresses,
  selectDefaultAddress,
  selectSelectedAddressId,
  setSelectedAddressId,
} from "../../../data/addresses/addressesSlice";
import { useModal } from "../../../shared components/model/ModelContext";
import AddAddressModal from "./AddAddressModal";
import {
  getAddressLocationLabel,
  getAddressSubDetails,
  getAddressTypeLabel,
  mergeAddressList,
} from "./addressHelpers";

export default function AddressBookModal({ onClose }) {
  const dispatch = useDispatch();
  const { openModal } = useModal();

  const addresses = useSelector(selectAddresses);
  const defaultAddress = useSelector(selectDefaultAddress);
  const selectedAddressId = useSelector(selectSelectedAddressId);

  const addressList = useMemo(
    () => mergeAddressList(addresses, defaultAddress),
    [addresses, defaultAddress],
  );

  const resolvedDefaultId =
    defaultAddress?.id ||
    addressList.find((addr) => Boolean(addr.is_default))?.id ||
    null;

  const handleSelectAddress = (addr) => {
    dispatch(setSelectedAddressId(addr.id));
    if (onClose) onClose();
  };

  const handleEditAddress = (addr) => {
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

  const handleAddNewAddress = () => {
    openModal(AddAddressModal, {
      modalClassName: "bg-white max-w-[540px]",
      onSave: (data) => {
        if (data?.id) {
          dispatch(setSelectedAddressId(data.id));
        }
      },
    });
  };

  return (
    <div className="w-full bg-white flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="bg-primary text-white px-5 py-4 pr-5 pl-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-secondary-light" />
          <h2 className="text-lg sm:text-xl font-extrabold m-0">
            سجل العناوين
          </h2>
        </div>
      </div>

      {/* Address List */}
      <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-3 bg-[#F7F7F7]">
        {addressList.length > 0 ? (
          addressList.map((addr) => {
            const isSelected = String(selectedAddressId) === String(addr.id);
            const isDefault =
              Boolean(addr.is_default) ||
              (resolvedDefaultId &&
                String(addr.id) === String(resolvedDefaultId));
            const locationLabel = getAddressLocationLabel(addr);
            const subDetails = getAddressSubDetails(addr);

            return (
              <div
                key={addr.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectAddress(addr)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectAddress(addr);
                  }
                }}
                className={`rounded-2xl p-4 border-2 text-right transition-all cursor-pointer flex flex-col gap-2 bg-white ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {getAddressTypeLabel(addr.address_type)}
                    </span>
                    {isDefault && (
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                        افتراضي
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(addr);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  {locationLabel && (
                    <p className="font-extrabold text-primary m-0">
                      {locationLabel}
                    </p>
                  )}
                  {addr.details && (
                    <p className="text-gray-700 font-medium text-xs sm:text-sm m-0">
                      {addr.details}
                    </p>
                  )}
                  {subDetails && (
                    <p className="text-gray-500 text-xs m-0">{subDetails}</p>
                  )}
                  {addr.special_mark && (
                    <p className="text-gray-500 text-xs m-0">
                      علامة مميزة: {addr.special_mark}
                    </p>
                  )}
                  {addr.phone && (
                    <p
                      dir="ltr"
                      className="text-primary/80 font-bold text-xs text-right m-0 pt-0.5"
                    >
                      {addr.phone}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm font-bold text-gray-500 py-8">
            لا توجد عناوين مسجلة حالياً
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white shrink-0">
        <button
          type="button"
          onClick={handleAddNewAddress}
          className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عنوان جديد</span>
        </button>
      </div>
    </div>
  );
}

