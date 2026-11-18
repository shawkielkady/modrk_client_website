export default function PageTitle({ children }) {
  return (
    <section className="py-6 sm:py-10 mt-10 sm:mt-20 border-b border-gray-200 flex items-center justify-center">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary text-center">
        {children}
      </h1>
    </section>
  );
}
