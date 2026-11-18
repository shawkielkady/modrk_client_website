function FastMethodInfo() {
  return (
    <div className="fast-delivey-time">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-10 my-4">
        <p className="font-bold text-base md:text-xl">
          وقت التسليم: <span className="text-secondary">*</span>
        </p>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <p className="text-secondary font-bold">
            {" "}
            خلال ثلاث ساعات من إكمال الطلب{" "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FastMethodInfo;
