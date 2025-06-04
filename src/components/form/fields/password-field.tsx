import { PasswordInput, type PasswordInputProps, Stack, Text } from '@mantine/core';
import type { BaseFieldProps } from '../types';

interface PasswordFieldProps<T> extends Omit<PasswordInputProps, 'error' | 'form'>, BaseFieldProps<T> {
    name: keyof T & string;
}

export function PasswordField<T>({
                                     form,
                                     name,
                                     label,
                                     mode = 'edit',
                                     ...props
                                 }: PasswordFieldProps<T>) {
    if (mode === 'readonly') {
        return (
            <Stack gap="xs">
                <Text size="sm" c="dimmed">{label}</Text>
                <Text>••••••••</Text>
            </Stack>
        );
    }

    return (
        <PasswordInput
            {...props}
            label={label}
            {...form.getInputProps(name)}
        />
    );
}
