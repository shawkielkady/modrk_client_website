import { User, Phone, Mail } from "lucide-react";

export const ACTION_CLASS = "btn-primary rounded-3xl px-4 p-2";

// defined outside the components so the reference never changes
export const PROFILE_FIELDS = [
  { id: "name", label: "اسم المستخدم", icon: User, type: "text", dir: "rtl" },
  {
    id: "phone",
    label: "رقم الجوال:",
    icon: Phone,
    type: "tel",
    readOnly: true,
    dir: "ltr",
  },
  {
    id: "email",
    label: "البريد الإلكتروني:",
    icon: Mail,
    type: "email",
    dir: "ltr",
  },
];
