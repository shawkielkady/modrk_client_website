function SingleType({ mainImg, text, value, currentType, setCurrentType }) {
  function isActive() {
    return currentType == value ? true : false;
  }
  return (
    <div
      className={`
    flex flex-col deliver-box w-50 gap-4 items-center justify-center
    cursor-pointer rounded-2xl p-3 transition-all duration-300
    ${
      isActive()
        ? "bg-primary/10 border-2 border-primary shadow-lg shadow-primary/20 scale-[1.03]"
        : "bg-transparent border-2 border-transparent hover:bg-gray-100"
    }
  `}
      onClick={() => {
        setCurrentType?.(value);
      }}
    >
      <div
        className={`
      rounded-2xl py-3 w-full flex items-center justify-center
      transition-all duration-300
    `}
      >
        {mainImg && (
          <img
            src={mainImg}
            alt={text || ""}
            className={`h-10 w-10 transition-transform duration-300 ${
              isActive() ? "scale-110" : ""
            }`}
          />
        )}
      </div>

      <p
        className={`text-center font-bold text-md md:text-2xl transition-colors duration-300 ${
          isActive() ? "text-primary" : "text-gray-700"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default SingleType;
