import { Select, type SelectProps, Stack, Text } from '@mantine/core';
import type { BaseFieldProps } from '../types';
import type { ComboboxData } from '@mantine/core';

interface SelectFieldProps<T> extends Omit<SelectProps, 'error' | 'form'>, BaseFieldProps<T> {
    name: keyof T & string;
    data: ComboboxData;
}

export function SelectField<T>({
                                   form,
                                   name,
                                   label,
                                   data,
                                   mode = 'edit',
                                   ...props
                               }: SelectFieldProps<T>) {
    if (mode === 'readonly') {
        const value = String(form.values[name]);
        const selectedOption = data.find(item => {
            if (typeof item === 'string') {
                return item === value;
            }
            return 'value' in item && item.value === value;
        });

        const displayValue = typeof selectedOption === 'string'
            ? selectedOption
            : ('value' in selectedOption! ? selectedOption.label : '');

        return (
            <Stack gap="xs">
                <Text size="sm" c="dimmed">{label}</Text>
                <Text>{displayValue || '-'}</Text>
            </Stack>
        );
    }

    return (
        <Select
            {...props}
            label={label}
            data={data}
            {...form.getInputProps(name)}
        />
    );
}
