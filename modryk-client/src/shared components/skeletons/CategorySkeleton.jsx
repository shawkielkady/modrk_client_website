export default function CategorySkeleton() {
  return (
    <div className="shrink-0 w-[130px] flex flex-col items-center gap-2 p-2 pointer-events-none">
      <div className="cat-card w-full h-[110px] rounded-xl shimmer shadow-sm"></div>
      <div className="h-4 w-20 rounded-md shimmer"></div>
    </div>
  );
}

