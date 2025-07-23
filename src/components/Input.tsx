import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface InputProps extends TextInputProps {
  placeholder: string;
  theme?: "light" | "dark";
}

const Input = ({ placeholder, style, theme = "light", ...props }: InputProps) => {
  const { colors } = useTheme();
  
  const inputTheme = theme === "light" ? {
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    borderColor: '#E2E8F0',
  } : {
    backgroundColor: colors.card,
    color: colors.textPrimary,
    borderColor: colors.border,
  };

  return (
    <TextInput
      className="rounded-lg p-4 border text-base"
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={[
        inputTheme,
        style
      ]}
      {...props}
    />
  );
};

export default Input;