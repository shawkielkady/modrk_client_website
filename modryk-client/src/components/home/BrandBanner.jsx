import logo from "../../../assets/modryklogo.png";

export default function BrandBanner() {
  return (
    <div className="bg-primary py-4 flex justify-center items-center w-full my-4">
      <img src={logo} className="h-32" alt="Modryk" />
    </div>
  );
}
