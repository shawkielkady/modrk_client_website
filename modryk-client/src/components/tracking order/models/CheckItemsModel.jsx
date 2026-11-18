import {
  FileDown,
  Hash,
  Layers,
  MapPin,
  Scale,
  ShoppingBag,
  Store,
  Tag,
  User,
} from "lucide-react";

import { useToast } from "../../../shared components/toast";
import { useSelector } from "react-redux";

export default function CheckItemsModel({ order = null, onClose }) {
  const { showInfo } = useToast();
  const saleType = useSelector((state) => state.orders.currentOrder.sale_type);
  const numOfSheep = useSelector(
    (state) => state.orders.currentOrder.num_of_sheep,
  );
  const items = useSelector((state) => state.orders.currentOrder.items);
  // Static fallback data matching the invoice design exactly
  const staticData = {
    customerName: order?.customer?.name || " ",
    address: order?.customer_address || " ",
    orderNumber: order?.id || " ",
    sheepType: order?.farm?.farm_type || " ",
    weight:
      order?.farm?.farm_weight_from && order?.farm?.farm_weight_to
        ? `${order.farm.farm_weight_from}-${order.farm.farm_weight_to} كيلو`
        : "- ",
    store: order?.farm?.name || "  ",
    salesType: order?.sales_type || "",
    quantity: order?.items_count ? `${order.items_count} ` : " ",
    preparation: order?.preparation_type?.name || " ",
    price: order?.total ? `${order.total}` : "",
    sheepTags: ["", "", ""],
  };

  const infoRows = [
    { label: "اسم العميل", value: staticData.customerName, icon: User },
    { label: "العنوان", value: staticData.address, icon: MapPin },
    { label: "رقم الطلب", value: staticData.orderNumber, icon: Hash },
    { label: "نوع الغنمة", value: staticData.sheepType, icon: Tag },
    { label: "الوزن", value: staticData.weight, icon: Scale },
    { label: "المتجر", value: staticData.store, icon: Store },
    { label: "نوع المبيعات", value: saleType, icon: ShoppingBag },
    { label: "الكمية", value: numOfSheep, icon: Layers },
    // {
    //   label: "تجهيز الطلب",
    //   value: staticData.preparation,
    //   icon: ClipboardCheck,
    // },
    { label: "السعر", value: `${staticData.price} ﷼`, icon: Tag },
  ];
  const images = useSelector(
    (state) => state.orders.currentOrder.items[0].iamges,
  );

  const handleDownloadInvoice = () => {
    if (order?.invoice) {
      window.open(order.invoice, "_blank");
    } else {
      showInfo("جاري تجهيز الفاتورة بصيغة PDF...");
    }
  };

  return (
    <div
      className="w-full flex flex-col overflow-hidden text-right bg-[#F4F7F8]"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-primary text-white py-3.5 px-6 text-center shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold m-0">الفاتورة</h2>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[75vh] space-y-4">
        {/* Sheep Photos Section */}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-primary mb-2.5">
            صور الأغنام
          </h3>
          <div className="flex items-center gap-3">
            {images && images.length > 0 ? (
              images.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-gray-300 bg-white shadow-xs shrink-0"
                >
                  <img
                    src={imgSrc}
                    alt={`صورة غنم ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div>لا توجد صور</div>
            )}
          </div>
        </div>

        {/* Detailed Info List */}
        <div className="space-y-1.5 pt-2">
          {infoRows.map((row, index) => {
            const IconComponent = row.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between py-1 text-xs sm:text-sm font-bold text-primary"
              >
                <div className="flex items-center gap-2 text-right">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[#943B46]">
                    <IconComponent className="w-4 h-4" />
                  </span>
                  <span>{row.label}</span>
                </div>
                <span className="text-gray-600 font-semibold">{row.value}</span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <hr className="border-t border-gray-300 my-3" />

        {/* Bottom Actions & Sheep Badges Section */}
        <div className="space-y-2.5 pt-1">
          {/* Row 1: فحص الطلب + Badge 1101 */}
          <div className="flex items-center justify-between gap-3">
            {/* <button
              type="button"
              onClick={handleCheckOrderAction}
              className="flex-1 bg-primary hover:bg-[#154554] text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-full flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>فحص الطلب</span>
            </button> */}
            {items.map((item) => (
              <div className="bg-[#D9E2E8] px-2.5 py-1 rounded-full shadow-2xs shrink-0">
                <span className="bg-[#8B1E2B] text-white font-extrabold text-xs py-0.5 px-3 rounded-full inline-block tracking-wide">
                  {item.sheep.id}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2: تحميل الفاتورة + Badge 1109 */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="flex-1 bg-primary hover:bg-[#154554] text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-full flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>تحميل الفاتورة</span>
            </button>
          </div>

          {/* Row 3: رجوع + Badge 1122 */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#D9D9D9] hover:bg-[#c9c9c9] text-primary font-bold text-xs sm:text-sm py-2 px-4 rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>رجوع</span>
              <span className="text-base leading-none">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
