const ADDRESS_TYPE_LABELS = {
  home: "المنزل",
  work: "العمل",
  other: "أخرى",
};

/**
 * Returns Arabic display label for address_type ("Home" | "Work" | "Other").
 */
export function getAddressTypeLabel(type) {
  const key = String(type || "")
    .trim()
    .toLowerCase();
  return ADDRESS_TYPE_LABELS[key] || type || "عنوان";
}

/**
 * Extracts formatted "Region - City" label from an address object.
 */
export function getAddressLocationLabel(addr) {
  const regionName =
    typeof addr?.region === "object"
      ? addr.region?.name
      : addr?.region || addr?.region_name || "";
  const cityName =
    typeof addr?.city === "object"
      ? addr.city?.name
      : addr?.city || addr?.city_name || "";
  return [regionName, cityName].filter(Boolean).join(" - ");
}

/**
 * Formats building, floor, and apartment numbers into a single summary line.
 */
export function getAddressSubDetails(addr) {
  return [
    addr?.building_name && `مبنى ${addr.building_name}`,
    addr?.floor_number && `دور ${addr.floor_number}`,
    addr?.apartment_number && `شقة ${addr.apartment_number}`,
  ]
    .filter(Boolean)
    .join(" • ");
}

/**
 * Merges defaultAddress into addresses list without duplication.
 */
export function mergeAddressList(addresses, defaultAddress) {
  const list = Array.isArray(addresses) ? [...addresses] : [];
  if (
    defaultAddress?.id &&
    !list.some((item) => String(item.id) === String(defaultAddress.id))
  ) {
    list.unshift(defaultAddress);
  }
  return list;
}

