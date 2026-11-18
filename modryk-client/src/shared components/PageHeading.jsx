export default function PillHeading({ children }) {
  return (
    <section className="py-6 sm:py-10">
      <div className="px-3 rounded-full bg-primary w-full max-w-sm mx-auto">
        <p className="text-lg sm:text-2xl font-bold text-center text-white py-2 sm:py-3">
          {children}
        </p>
      </div>
    </section>
  );
}
