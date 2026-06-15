import { AccessibilityRole, AccessibilityState } from "react-native";

type A11yRole =
  | "button"
  | "header"
  | "search"
  | "image"
  | "text"
  | "link"
  | "tab"
  | "switch"
  | "adjustable"
  | "none";

interface A11yProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: A11yRole;
  accessibilityState?: AccessibilityState;
}

export function a11y(
  label: string,
  hint?: string,
  role?: A11yRole
): A11yProps {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
  };
}

export function a11yButton(
  label: string,
  hint?: string,
  disabled?: boolean,
  selected?: boolean
): A11yProps {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: "button",
    accessibilityState: { disabled, selected },
  };
}

export function a11ySwitch(
  label: string,
  checked: boolean,
  hint?: string
): A11yProps {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: "switch",
    accessibilityState: { checked },
  };
}

export function a11yHeader(label: string): A11yProps {
  return {
    accessibilityLabel: label,
    accessibilityRole: "header",
  };
}

export function a11yImage(label: string): A11yProps {
  return {
    accessibilityLabel: label,
    accessibilityRole: "image",
  };
}

export function a11yLink(label: string, hint?: string): A11yProps {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: "link",
  };
}
