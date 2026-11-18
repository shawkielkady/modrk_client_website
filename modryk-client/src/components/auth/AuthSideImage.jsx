import sideImage from "../../../assets/logolg.png";

export default function AuthSideImage() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <img src={sideImage} alt="Modryk" className="object-cover" />
    </div>
  );
}
