import {Badge, Group} from '@mantine/core';
import { format, parseISO } from 'date-fns';

export const tableRenderers = {
    // Boolean renderer with customizable labels and colors
    boolean: (options?: {
        activeLabel?: string;
        inactiveLabel?: string;
        activeColor?: string;
        inactiveColor?: string;
    }) => (value: boolean) => (
        <Badge
            color={value ? (options?.activeColor ?? 'green') : (options?.inactiveColor ?? 'red')}
            variant="light"
        >
            {value ? (options?.activeLabel ?? 'Active') : (options?.inactiveLabel ?? 'Inactive')}
        </Badge>
    ),

// Array of strings renderer (e.g., for tags, roles, etc.)
    stringArray: (options?: {
        color?: string;
        variant?: 'light' | 'filled' | 'outline';
    }) => (values: string[]) => (
        <Group gap="xs" wrap="wrap">
            {values.map((value) => (
                <Badge
                    key={value}
                    color={options?.color}
                    variant={options?.variant ?? 'light'}
                >
                    {value}
                </Badge>
            ))}
        </Group>
    ),

// Date renderer with format options
    date: (options?: {
        format?: string;  // date-fns format string, e.g., 'dd-MM-yyyy HH:mm'
    }) => (value: string | Date) => {
        const date = value instanceof Date ? value : parseISO(value);
        return format(date, options?.format ?? 'dd.MM.yyyy');
    },

    // Currency renderer
    currency: (options?: {
        currency?: string;
        locale?: string;
    }) => (value: number) => {
        return new Intl.NumberFormat(options?.locale ?? 'en-US', {
            style: 'currency',
            currency: options?.currency ?? 'USD'
        }).format(value);
    },

    // Percentage renderer
    percentage: (options?: {
        decimals?: number;
    }) => (value: number) => {
        return `${value.toFixed(options?.decimals ?? 2)}%`;
    },

    // Status renderer with custom colors and labels
    status: (options: {
        statuses: Record<string, { color: string; label?: string }>;
    }) => (value: string) => {
        const status = options.statuses[value];
        return (
            <Badge color={status?.color ?? 'gray'} variant="light">
                {status?.label ?? value}
            </Badge>
        );
    },
};
