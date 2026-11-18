function DownloadAppModel() {
  return (
    <div class="w-full bg-primary text-white flex flex-col">
      <div class="flex  bg-[#D9D9D9] items-center justify-center mt-20">
        <div class="flex  bg-[#D9D9D9]">
          <div class="  px-3 py-2 flex flex-col items-center space-y-4">
            <p class="text-secondary text-center font-bold">
              هذا الخيار متاح فقط عند استخدام تطبيق مدرك
            </p>
            <div class="flex justify-between items-center gap-6 pb-5">
              <button class="bg-[#115B57] p-3 rounded-xl cursor-pointer">
                {" "}
                تحميل التطبيق للاندرويد
              </button>
              <button class="bg-black  p-3 rounded-xl cursor-pointer">
                {" "}
                تحميل التطبيق للاندرويد{" "}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadAppModel;
