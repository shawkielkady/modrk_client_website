import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  Briefcase,
  ChevronDown,
  Home,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  fetchCities,
  fetchRegions,
  selectCities,
  selectRegions,
} from "../../../data/general/generalSlice";
import {
  addNewAddress,
  updateAddress,
  clearAddressError,
  selectAddressError,
  selectAddressSaving,
} from "../../../data/addresses/addressesSlice";
import { useToast } from "../../../shared components/toast";
import { parseSaudiPhone } from "../../../data/apiUtils";
import LocationMapPicker from "./LocationMapPicker";

const COUNTRY_ID = 1;

const ADDRESS_TYPES = [
  { value: "Home", label: "المنزل", icon: Home },
  { value: "Work", label: "العمل", icon: Briefcase },
  { value: "Other", label: "أخرى", icon: MapPin },
];

const normalizeAddressType = (type) => {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();
  if (normalized === "work") return "Work";
  if (normalized === "other") return "Other";
  return "Home";
};

export default function AddAddressModal({ onSave, onClose, address = null }) {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();

  const regions = useSelector(selectRegions);
  const cities = useSelector(selectCities);
  const saving = useSelector(selectAddressSaving);
  const addressError = useSelector(selectAddressError);

  const [citiesLoading, setCitiesLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const editAddressId = address?.id ?? address?.address_id ?? null;
  const isEditMode = Boolean(editAddressId);
  const initialRegionId = address?.region_id ?? address?.region?.id ?? "";
  const initialCityId = address?.city_id ?? address?.city?.id ?? "";

  const [formData, setFormData] = useState({
    region_id: initialRegionId ? String(initialRegionId) : "",
    city_id: initialCityId ? String(initialCityId) : "",
    phone: address?.phone || "",
    is_default: Boolean(address?.is_default),
    address_type: normalizeAddressType(address?.address_type),
    building_name: address?.building_name || "",
    floor_number:
      address?.floor_number != null ? String(address.floor_number) : "",
    apartment_number:
      address?.apartment_number != null ? String(address.apartment_number) : "",
    special_mark: address?.special_mark || "",
    details: address?.details || "",
    lat: address?.lat ? String(address.lat) : "24.7136",
    lng: address?.lng ? String(address.lng) : "46.6753",
  });

  const regionsList = Array.isArray(regions) ? regions : regions?.items || [];
  const citiesList = Array.isArray(cities) ? cities : cities?.items || [];

  useEffect(() => {
    dispatch(clearAddressError());
    dispatch(fetchRegions(COUNTRY_ID));
    if (initialRegionId) {
      dispatch(fetchCities(initialRegionId));
    }
    return () => {
      dispatch(clearAddressError());
    };
  }, [dispatch, initialRegionId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    setLocalError(null);
    setFormData((prev) => ({
      ...prev,
      region_id: regionId,
      city_id: "",
    }));

    if (regionId) {
      setCitiesLoading(true);
      try {
        await dispatch(fetchCities(regionId)).unwrap();
      } catch {
        // Error handled by apiClient
      } finally {
        setCitiesLoading(false);
      }
    }
  };

  const handleLocationChange = ({ lat, lng }) => {
    setLocalError(null);
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setLocalError(null);
    dispatch(clearAddressError());

    if (!formData.region_id || !formData.city_id || !formData.phone.trim()) {
      const msg = "يرجى تعبئة جميع الحقول المطلوبة (المنطقة، المدينة، رقم الجوال)";
      setLocalError(msg);
      showError(msg);
      return;
    }

    if (!formData.lat || !formData.lng) {
      const msg = "يرجى تحديد الموقع على الخريطة";
      setLocalError(msg);
      showError(msg);
      return;
    }

    const selectedRegionObj = regionsList.find(
      (r) => String(r.id) === String(formData.region_id),
    );
    const selectedCityObj = citiesList.find(
      (c) => String(c.id) === String(formData.city_id),
    );

    const rawPhone = formData.phone.trim();
    const parsedPhone = parseSaudiPhone(rawPhone);
    const formattedPhone =
      rawPhone.startsWith("+") && !rawPhone.startsWith("+966")
        ? rawPhone
        : `${parsedPhone.dial_code}${parsedPhone.phone}`;

    const payload = {
      country_id: COUNTRY_ID,
      region_id: Number(formData.region_id) || formData.region_id,
      city_id: Number(formData.city_id) || formData.city_id,
      phone: formattedPhone,
      is_default: Boolean(formData.is_default),
      address_type: formData.address_type,
      building_name: formData.building_name.trim(),
      floor_number: formData.floor_number.trim(),
      apartment_number: formData.apartment_number.trim(),
      special_mark: formData.special_mark.trim(),
      details: formData.details.trim(),
      lat: String(formData.lat),
      lng: String(formData.lng),
    };

    try {
      let savedData;
      if (isEditMode) {
        savedData = await dispatch(
          updateAddress({
            address_id: Number(editAddressId) || editAddressId,
            ...payload,
          }),
        ).unwrap();
        showSuccess("تم تعديل العنوان بنجاح");
      } else {
        savedData = await dispatch(addNewAddress(payload)).unwrap();
        showSuccess("تم إضافة العنوان بنجاح");
      }

      if (onSave) {
        onSave({
          ...payload,
          ...(savedData || {}),
          id: savedData?.id ?? savedData?.address?.id ?? editAddressId ?? undefined,
          region: selectedRegionObj?.name || "",
          city: selectedCityObj?.name || "",
        });
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "فشل حفظ العنوان، يرجى المحاولة مرة أخرى";
      setLocalError(message);
      showError(message);
    }
  };

  const errorMessage = localError || addressError;

  return (
    <div className="w-full bg-white p-6 pt-10 text-right overflow-y-auto max-h-[85vh]">
      <h2 className="text-xl font-extrabold text-primary mb-4">
        {isEditMode ? "تعديل العنوان" : "إضافة عنوان جديد"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* المنطقة */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            المنطقة <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <select
              name="region_id"
              value={formData.region_id}
              onChange={handleRegionChange}
              required
              disabled={saving}
              className="w-full appearance-none px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right pl-10 cursor-pointer text-sm sm:text-base disabled:opacity-60"
            >
              <option value="" disabled>
                اختر المنطقة
              </option>
              {regionsList.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* المدينة */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            المدينة <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <select
              name="city_id"
              value={formData.city_id}
              onChange={handleChange}
              required
              disabled={saving || !formData.region_id || citiesLoading}
              className="w-full appearance-none px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right pl-10 cursor-pointer text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {!formData.region_id
                  ? "اختر المنطقة أولاً"
                  : citiesLoading
                    ? "جاري تحميل المدن..."
                    : "اختر المدينة"}
              </option>
              {citiesList.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* نوع العنوان */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            نوع العنوان <span className="text-secondary">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {ADDRESS_TYPES.map((typeOption) => {
              const Icon = typeOption.icon;
              const isSelected = formData.address_type === typeOption.value;
              return (
                <label
                  key={typeOption.value}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border text-sm font-bold cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                  }`}
                >
                  <input
                    type="radio"
                    name="address_type"
                    value={typeOption.value}
                    checked={isSelected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{typeOption.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* اسم المبنى */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            اسم / رقم المبنى
          </label>
          <input
            type="text"
            name="building_name"
            value={formData.building_name}
            onChange={handleChange}
            disabled={saving}
            placeholder="مثال: برج النخيل"
            className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right text-sm sm:text-base"
          />
        </div>

        {/* الدور والشقة */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
              رقم الدور
            </label>
            <input
              type="text"
              name="floor_number"
              value={formData.floor_number}
              onChange={handleChange}
              disabled={saving}
              placeholder="مثال: 4"
              className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
              رقم الشقة
            </label>
            <input
              type="text"
              name="apartment_number"
              value={formData.apartment_number}
              onChange={handleChange}
              disabled={saving}
              placeholder="مثال: 14"
              className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right text-sm sm:text-base"
            />
          </div>
        </div>

        {/* رقم الجوال */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            رقم الجوال <span className="text-secondary">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={saving}
            required
            placeholder="05XXXXXXXX"
            dir="ltr"
            className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right text-sm sm:text-base"
          />
        </div>

        {/* علامة مميزة */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            علامة مميزة
          </label>
          <input
            type="text"
            name="special_mark"
            value={formData.special_mark}
            onChange={handleChange}
            disabled={saving}
            placeholder="مثال: بجوار المسجد"
            className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right text-sm sm:text-base"
          />
        </div>

        {/* تفاصيل العنوان */}
        <div>
          <label className="block text-right font-bold text-primary text-sm sm:text-base mb-1.5">
            تفاصيل العنوان
          </label>
          <textarea
            name="details"
            rows={2}
            value={formData.details}
            onChange={handleChange}
            disabled={saving}
            placeholder="مثال: حي الياسمين، شارع أنس بن مالك"
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 bg-white focus:outline-none focus:border-primary text-right text-sm sm:text-base resize-none"
          />
        </div>

        {/* الخريطة (lat & lng) */}
        <LocationMapPicker
          lat={formData.lat}
          lng={formData.lng}
          onChange={handleLocationChange}
        />

        {/* تعيين كعنوان افتراضي */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            disabled={saving}
            className="w-4 h-4 accent-primary rounded cursor-pointer"
          />
          <span className="text-sm sm:text-base font-bold text-primary">
            تعيين كعنوان افتراضي
          </span>
        </label>

        {errorMessage && (
          <div
            role="alert"
            className="w-full flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-red-600 text-right"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* زر الإضافة */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-primary text-white font-bold text-base sm:text-lg rounded-full hover:bg-primary-dark transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : isEditMode ? (
              "حفظ التعديلات"
            ) : (
              "+ إضافة"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
