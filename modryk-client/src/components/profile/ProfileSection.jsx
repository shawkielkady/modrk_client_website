import { memo } from "react";
import ProfileField from "./ProfileField";
import PasswordRow from "./PasswordRow";
import { PROFILE_FIELDS } from "./constants";

function ProfileSection({ user, onSaveField }) {
  return (
    <section className="my-2 divide-y divide-gray-200">
      {PROFILE_FIELDS.map((field) => (
        <ProfileField
          key={field.id}
          field={field}
          value={user?.[field.id] || ""}
          onSave={onSaveField}
          readOnly={field.readOnly}
        />
      ))}
      <PasswordRow />
    </section>
  );
}

export default memo(ProfileSection);
