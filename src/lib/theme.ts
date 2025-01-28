export interface ThemeStylesType {
  background: string;
  text: string;
  card: string;
  button: string;
  border: string;
}

export interface ThemeStyles {
  dark: ThemeStylesType;
  light: ThemeStylesType;
}

export const themeStyles: ThemeStyles = {
  dark: {
    background: "bg-gray-900",
    text: "text-white",
    card: "bg-gray-800",
    button: "bg-gray-700",
    border: "border-gray-700",
  },
  light: {
    background: "bg-white",
    text: "text-gray-900",
    card: "bg-gray-100",
    button: "bg-gray-200",
    border: "border-gray-200",
  },
};
