import { CreditCard } from "lucide-react";
import SelectableCard from "../../../shared components/ui/SelectableCard";

function PayMethodRow({
  payementMethod,
  handleSelectPayement,
  selectedPay,
  isActive: propIsActive,
  onSelect,
}) {
  if (!payementMethod) return null;

  const isSelected =
    propIsActive !== undefined
      ? Boolean(propIsActive)
      : selectedPay !== undefined && payementMethod?.id !== undefined
        ? String(selectedPay) === String(payementMethod.id)
        : false;

  const handleClick = () => {
    if (onSelect) {
      onSelect(payementMethod.id);
    } else if (handleSelectPayement) {
      handleSelectPayement(payementMethod.id);
    }
  };

  const methodName = payementMethod.name || payementMethod.title || "طريقة دفع";

  return (
    <li>
      <SelectableCard
        isSelected={isSelected}
        onSelect={handleClick}
        title={`الدفع عن طريق ${methodName}`}
        image={payementMethod.image}
        icon={!payementMethod.image ? <CreditCard className="w-5 h-5" /> : null}
      />
    </li>
  );
}

export default PayMethodRow;
