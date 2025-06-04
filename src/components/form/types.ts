import type { UseFormReturnType } from '@mantine/form';

export type FormMode = 'edit' | 'readonly';

export interface BaseFieldProps<T> {
    form: UseFormReturnType<T>;
    mode?: FormMode;
}
