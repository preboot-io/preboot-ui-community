import { Checkbox, type CheckboxProps, Stack, Text } from '@mantine/core';
import type { BaseFieldProps } from '../types';

interface CheckboxFieldProps<T> extends Omit<CheckboxProps, 'error' | 'form'>, BaseFieldProps<T> {
    name: keyof T & string;
}

export function CheckboxField<T>({
                                     form,
                                     name,
                                     label,
                                     mode = 'edit',
                                     ...props
                                 }: CheckboxFieldProps<T>) {
    if (mode === 'readonly') {
        const value = Boolean(form.values[name]);
        return (
            <Stack gap="xs">
                <Text size="sm" c="dimmed">{label}</Text>
                <Text>{value ? 'Yes' : 'No'}</Text>
            </Stack>
        );
    }

    return (
        <Checkbox
            {...props}
            label={label}
            {...form.getInputProps(name)}
        />
    );
}
