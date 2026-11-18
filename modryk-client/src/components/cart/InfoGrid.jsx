import { Fragment } from "react";

export default function InfoGrid({ rows, className = "" }) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-12 gap-y-3 text-base sm:text-lg lg:text-xl text-primary min-w-0 ${className}`}
    >
      {rows.map(({ key, label, value, valueClassName = "" }) => (
        <Fragment key={key}>
          <p className="font-bold">{label}</p>
          <span className={valueClassName}>{value}</span>
        </Fragment>
      ))}
    </div>
  );
}
