import { Stack, Button, Group } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface BaseFormProps<T> {
    form: UseFormReturnType<T>;
    onSubmit?: (values: T) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    children: React.ReactNode;
    mode?: 'edit' | 'readonly';
}

export function BaseForm<T>({
                                form,
                                onSubmit,
                                onCancel,
                                loading = false,
                                submitLabel = 'Submit',
                                cancelLabel = 'Cancel',
                                children,
                                mode = 'edit'
                            }: BaseFormProps<T>) {
    const content = (
        <Stack gap="md">
            {children}

            {mode === 'edit' && (
                <Group justify="flex-end" gap="sm">
                    {onCancel && (
                        <Button
                            variant="subtle"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        loading={loading}
                    >
                        {submitLabel}
                    </Button>
                </Group>
            )}
        </Stack>
    );

    if (mode === 'readonly') {
        return content;
    }

    return (
        <form onSubmit={onSubmit ? form.onSubmit(onSubmit) : undefined}>
            {content}
        </form>
    );
}
