/** Design tokens — keep in sync with tailwind.config.js */
export const colors = {
  white: "#FFFFFF",
  primary: {
    300: "#C3D9FF",
    400: "#9BBFFF",
    500: "#0286FF",
    700: "#475A99",
    800: "#364573",
  },
  secondary: {
    500: "#AAAAAA",
    700: "#666666",
    800: "#4D4D4D",
    900: "#333333",
  },
  success: {
    500: "#38A169",
    600: "#2F855A",
  },
  danger: {
    600: "#E53E3E",
  },
  warning: {
    500: "#EAB308",
  },
  general: {
    300: "#EEEEEE",
    400: "#0CC25F",
    800: "#ADADAD",
  },
  dark: {
    bg: "#0C0C0E",
    card: "#1C1C1E",
    border: "#2C2C2E",
    text: "#F5F5F7",
    "text-secondary": "#8E8E93",
  },
  whiteMuted: "rgba(255, 255, 255, 0.7)",
} as const;
