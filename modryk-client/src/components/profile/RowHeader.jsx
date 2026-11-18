export default function RowHeader({ icon: Icon, label, htmlFor, action }) {
  // password row has no input, so a span instead of a label
  const Label = htmlFor ? "label" : "span";

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={htmlFor} className="font-bold flex gap-2">
        <Icon />
        {label}
      </Label>
      {action}
    </div>
  );
}
