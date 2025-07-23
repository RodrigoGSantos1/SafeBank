import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface MoneyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value?: number;
  onValueChange?: (value: number) => void;
  placeholder?: string;
  textClassName?: string;
  containerClassName?: string;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value = 0,
  onValueChange,
  placeholder = "0.00",
  textClassName = "text-white text-2xl",
  containerClassName = "flex-row items-center border-b border-white w-full",
  ...textInputProps
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [rawValue, setRawValue] = useState<number>(value);

  const formatMoneyFromCents = (cents: number): string => {
    if (cents === 0) return '';
    const reais = cents / 100;
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseMoneyToCents = (text: string): number => {
    const numbers = text.replace(/\D/g, '');
    if (!numbers) return 0;

    return parseInt(numbers, 10);
  };

  useEffect(() => {
    const cents = Math.round(value * 100);
    setRawValue(cents);
    setDisplayValue(formatMoneyFromCents(cents));
  }, [value]);

  const handleTextChange = (text: string) => {
    const cents = parseMoneyToCents(text);
    setRawValue(cents);
    setDisplayValue(formatMoneyFromCents(cents));

    if (onValueChange) {
      onValueChange(cents / 100);
    }
  };

  return (
    <View className={containerClassName}>
      <Text className={`${textClassName} mr-2`}>$</Text>
      <TextInput
        {...textInputProps}
        value={displayValue}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#ffffff60"
        keyboardType="numeric"
        className={`${textClassName} flex-1 bg-transparent`}
        style={{ outlineWidth: 0 }}
      />
    </View>
  );
};

export default MoneyInput; 