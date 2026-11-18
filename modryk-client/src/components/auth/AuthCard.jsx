import logo from "../../../assets/modryklogo.png";

export default function AuthCard({ children }) {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-[#D9D9D9] p-6 rounded-md shadow-md max-w-md w-full">
        <img
          src={logo}
          alt="Modryk"
          className="w-16 h-16 object-contain mx-auto mb-4"
        />
        {children}
      </div>
    </div>
  );
}
