import { memo } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import RowHeader from "./RowHeader";
import { ACTION_CLASS } from "./constants";

function PasswordRow() {
  return (
    <div className="p-5">
      <RowHeader
        icon={Lock}
        label="كلمة المرور"
        action={
          <Link to="/change-password" className={ACTION_CLASS}>
            تغيير
          </Link>
        }
      />
    </div>
  );
}

export default memo(PasswordRow);
