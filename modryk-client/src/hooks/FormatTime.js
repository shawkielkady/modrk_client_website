export function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
export const formatTimee = (time) => {
  const [hours, minutes] = time.split(":");

  const date = new Date();
  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
