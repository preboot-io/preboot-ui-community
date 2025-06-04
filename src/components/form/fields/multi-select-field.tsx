import { MultiSelect, type MultiSelectProps, Stack, Text, Group, Badge } from '@mantine/core';
import type { BaseFieldProps } from '../types';
import type { ComboboxData } from '@mantine/core';

interface MultiSelectFieldProps<T> extends Omit<MultiSelectProps, 'error' | 'form'>, BaseFieldProps<T> {
    name: keyof T & string;
    data: ComboboxData;
    displayBadges?: boolean;
}

export function MultiSelectField<T>({
                                        form,
                                        name,
                                        label,
                                        data,
                                        mode = 'edit',
                                        displayBadges = false,
                                        ...props
                                    }: MultiSelectFieldProps<T>) {
    if (mode === 'readonly') {
        const values = (form.values[name] as string[]) || [];
        const selectedOptions = values.map(value =>
            data.find(item => {
                if (typeof item === 'string') {
                    return item === value;
                }
                return 'value' in item && item.value === value;
            })
        );

        const displayValues = selectedOptions.map(option => {
            if (!option) return '';
            return typeof option === 'string' ? option : ('value' in option ? option.label : '');
        }).filter(Boolean);

        return (
            <Stack gap="xs">
                <Text size="sm" c="dimmed">{label}</Text>
                {displayBadges ? (
                    <Group gap="xs">
                        {displayValues.map((value, index) => (
                            <Badge key={index} variant="light">{value}</Badge>
                        ))}
                    </Group>
                ) : (
                    <Text>{displayValues.join(', ') || '-'}</Text>
                )}
            </Stack>
        );
    }

    return (
        <MultiSelect
            {...props}
            label={label}
            data={data}
            {...form.getInputProps(name)}
        />
    );
}
