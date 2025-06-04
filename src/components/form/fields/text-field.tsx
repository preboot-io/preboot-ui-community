import { TextInput, type TextInputProps, Stack, Text } from '@mantine/core';
import type { BaseFieldProps } from '../types';

interface TextFieldProps<T> extends Omit<TextInputProps, 'error' | 'form'>, BaseFieldProps<T> {
    name: keyof T & string;
}

export function TextField<T>({
                                 form,
                                 name,
                                 label,
                                 mode = 'edit',
                                 ...props
                             }: TextFieldProps<T>) {
    if (mode === 'readonly') {
        return (
            <Stack gap="xs">
                <Text size="sm" c="dimmed">{label}</Text>
                <Text>{String(form.values[name] || '-')}</Text>
            </Stack>
        );
    }

    return (
        <TextInput
            {...props}
            label={label}
            {...form.getInputProps(name)}
        />
    );
}
