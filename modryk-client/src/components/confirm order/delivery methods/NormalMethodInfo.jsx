import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Clock } from "lucide-react";
import {
  selectCart,
  selectSubmitCartDataWrapper,
  updateSubmitCartData,
} from "../../../data/cart/cartSlice";
import { selectDeliveryTimes } from "../../../data/general/generalSlice";

const formatTime = (time) => {
  if (!time) return "";
  const parts = String(time).split(":");
  if (parts.length < 2) return String(time);

  const [hours, minutes] = parts;
  const d = new Date();
  d.setHours(Number(hours), Number(minutes));

  return d.toLocaleTimeString("ar-EG", {
    hour: "numeric",
    hour12: true,
  });
};

function NormalMethodInfo({ date, setDate }) {
  const dispatch = useDispatch();
  const times = useSelector(selectDeliveryTimes);
  const cart = useSelector(selectCart);
  const submitCartDataWrapper = useSelector(selectSubmitCartDataWrapper);

  // Check if cart source is customer (allow edit) or non-customer (read-only display)
  const isCustomer = cart?.source === "customer";

  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  const activeDate =
    submitCartDataWrapper?.delivery_date || date || todayStr;
  const activeTimeId = submitCartDataWrapper?.delivery_time_id ?? null;

  // Auto-sync date to submit wrapper when isCustomer
  useEffect(() => {
    if (isCustomer && !submitCartDataWrapper?.delivery_date && activeDate) {
      dispatch(updateSubmitCartData({ delivery_date: activeDate }));
    }
  }, [isCustomer, submitCartDataWrapper?.delivery_date, activeDate, dispatch]);

  // When NOT customer, sync the cart's predefined delivery_date and delivery_time_id to submit wrapper
  useEffect(() => {
    if (!isCustomer && cart) {
      const updates = {};
      if (
        cart.delivery_date &&
        submitCartDataWrapper?.delivery_date !== cart.delivery_date
      ) {
        updates.delivery_date = cart.delivery_date;
      }

      const fixedTimeId =
        cart.delivery_time_id ||
        (typeof cart.delivery_time === "object" && cart.delivery_time !== null
          ? cart.delivery_time?.id
          : typeof cart.delivery_time === "number"
            ? cart.delivery_time
            : null);

      if (
        fixedTimeId &&
        submitCartDataWrapper?.delivery_time_id !== fixedTimeId
      ) {
        updates.delivery_time_id = fixedTimeId;
      }

      if (Object.keys(updates).length > 0) {
        dispatch(updateSubmitCartData(updates));
      }
    }
  }, [
    isCustomer,
    cart,
    submitCartDataWrapper?.delivery_date,
    submitCartDataWrapper?.delivery_time_id,
    dispatch,
  ]);

  const availableTimes = useMemo(() => {
    if (!isCustomer) return [];

    const timesList = times || [];
    if (!Array.isArray(timesList) || timesList.length === 0) return [];

    const today = new Date();
    const selectedDate = new Date(`${activeDate}T00:00:00`);

    if (selectedDate.toDateString() !== today.toDateString()) {
      return timesList;
    }

    const currentMinutes = today.getHours() * 60 + today.getMinutes();

    return timesList.filter((time) => {
      if (!time?.to) return true;
      const [hours, minutes] = time.to.split(":").map(Number);
      const endMinutes = hours * 60 + minutes;

      return endMinutes > currentMinutes;
    });
  }, [isCustomer, times, activeDate]);

  // Auto-select first available time slot for customers
  useEffect(() => {
    if (
      isCustomer &&
      availableTimes.length > 0 &&
      !availableTimes.some((t) => t.id === activeTimeId)
    ) {
      dispatch(
        updateSubmitCartData({ delivery_time_id: availableTimes[0].id }),
      );
    }
  }, [isCustomer, availableTimes, activeTimeId, dispatch]);

  // Formatted read-only delivery time for non-customer source
  const displayDeliveryTime = useMemo(() => {
    const deliveryTime = cart?.delivery_time;
    const deliveryTimeId = cart?.delivery_time_id;

    if (deliveryTime) {
      if (typeof deliveryTime === "object" && deliveryTime !== null) {
        if (deliveryTime.from && deliveryTime.to) {
          return `${formatTime(deliveryTime.from)} - ${formatTime(deliveryTime.to)}`;
        }
        if (deliveryTime.name || deliveryTime.title) {
          return deliveryTime.name || deliveryTime.title;
        }
      }
      if (typeof deliveryTime === "string") {
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(deliveryTime.trim())) {
          return formatTime(deliveryTime.trim());
        }
        return deliveryTime;
      }
    }

    // Try finding by ID in master times list
    const targetId =
      deliveryTimeId ||
      (typeof deliveryTime === "number" ? deliveryTime : null);
    if (targetId && Array.isArray(times)) {
      const matched = times.find((t) => String(t.id) === String(targetId));
      if (matched?.from && matched?.to) {
        return `${formatTime(matched.from)} - ${formatTime(matched.to)}`;
      }
      if (matched?.name) return matched.name;
    }

    return deliveryTime ? String(deliveryTime) : "غير محدد";
  }, [cart?.delivery_time, cart?.delivery_time_id, times]);

  const handleDateChange = (newDate) => {
    setDate?.(newDate);
    dispatch(updateSubmitCartData({ delivery_date: newDate }));
  };

  const handleTimeSelect = (timeId) => {
    dispatch(updateSubmitCartData({ delivery_time_id: timeId }));
  };

  // Case 1: Non-customer source -> Read-only display without ability to edit
  if (!isCustomer) {
    return (
      <div className="normal-delivery-date-and-time">
        <div className="flex flex-wrap items-center gap-3 md:gap-10">
          <p className="font-bold text-base md:text-xl">
            تاريخ التسليم: <span className="text-secondary">*</span>
          </p>

          <div className="inline-flex items-center gap-2 text-primary font-bold text-base md:text-xl py-2 px-4 md:px-6 rounded-4xl bg-[#D0D0D0] select-none cursor-default">
            <Calendar className="w-5 h-5 text-primary/70 shrink-0" />
            <span>{cart?.delivery_date || "غير محدد"}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-10 my-4">
          <p className="font-bold text-base md:text-xl">
            وقت التسليم: <span className="text-secondary">*</span>
          </p>

          <div className="inline-flex items-center gap-2 text-primary font-bold text-base md:text-xl py-2 px-4 md:px-6 rounded-4xl bg-[#D0D0D0] select-none cursor-default">
            <Clock className="w-5 h-5 text-primary/70 shrink-0" />
            <span>{displayDeliveryTime}</span>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Customer source -> Editable date and time selectors
  return (
    <div className="normal-delivery-date-and-time">
      <div className="flex flex-wrap items-center gap-3 md:gap-10">
        <p className="font-bold text-base md:text-xl">
          تاريخ التسليم: <span className="text-secondary">*</span>
        </p>

        <input
          type="date"
          value={activeDate}
          min={todayStr}
          onChange={(e) => handleDateChange(e.target.value)}
          className="text-primary font-bold text-base md:text-xl py-2 px-4 md:px-6 text-center rounded-4xl bg-[#D0D0D0] outline-none cursor-pointer"
        />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-10 my-4">
        <p className="font-bold text-base md:text-xl">
          وقت التسليم: <span className="text-secondary">*</span>
        </p>

        <div className="flex flex-wrap gap-2 md:gap-4">
          {availableTimes.map((time) => {
            const isSelected = activeTimeId === time.id;
            return (
              <button
                type="button"
                key={time.id}
                onClick={() => handleTimeSelect(time.id)}
                className={`font-bold text-sm md:text-xl py-2 px-4 md:px-6 text-center rounded-4xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-[#D0D0D0] text-primary hover:bg-gray-300"
                }`}
              >
                {formatTime(time.from)} - {formatTime(time.to)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NormalMethodInfo;
