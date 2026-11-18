import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  max = 5,
  size = "w-4 h-4",
  className = "gap-0.5",
}) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label={`${rating}/${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.round(rating)
              ? "fill-yellow-400 stroke-yellow-400"
              : "stroke-gray-300"
          }`}
        />
      ))}
    </span>
  );
}
