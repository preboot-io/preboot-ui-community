
# Preboot UI Community Library

Welcome to the Preboot UI Community library! This is a community-driven React component library designed to accelerate the development of modern SaaS applications. This guide will provide you with a comprehensive overview of how to use the components in this library.

## Table of Contents

- [Installation](#installation)
- [Components](#components)
  - [DataTable](#datatable)
    - [Props](#datatable-props)
    - [Usage](#datatable-usage)
  - [Form](#form)
    - [BaseForm](#baseform)
    - [Props](#baseform-props)
    - [Usage](#baseform-usage)
    - [Form Fields](#form-fields)

## Installation

To use the Preboot UI Community library, you need to have React and the required peer dependencies installed in your project. You can install the library and its dependencies using npm:

```bash
npm install @preboot.io/preboot-ui-community @mantine/core @mantine/dates @mantine/form @mantine/hooks @mantine/modals @mantine/notifications date-fns dayjs react react-dom react-icons
```

## Components

### DataTable

The `DataTable` component is a powerful and flexible table component that supports pagination, sorting, filtering, and row actions.

#### DataTable Props

| Prop                  | Type                                      | Description                                                                                                                              |
| --------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                | `TableData`                               | The data to be displayed in the table.                                                                                                   |
| `columns`             | `Column<T>[]`                             | An array of column definitions.                                                                                                          |
| `loading`             | `boolean`                                 | A boolean indicating whether the table is in a loading state.                                                                            |
| `onParamsChange`      | `(params: SearchParams) => void`          | A callback function that is called when the table's parameters (page, sort, filter) change.                                              |
| `currentParams`       | `SearchParams`                            | The current parameters of the table.                                                                                                     |
| `rowActions`          | `RowAction<T>[]`                          | An array of actions that can be performed on each row.                                                                                   |
| `noRecordsText`       | `string`                                  | The text to be displayed when there are no records in the table.                                                                         |
| `containerClassName`  | `string`                                  | The class name for the table container.                                                                                                  |
| `tableClassName`      | `string`                                  | The class name for the table.                                                                                                            |
| `enableStickyColumn`  | `boolean`                                 | A boolean to enable sticky columns.                                                                                                      |
| `enableStickyHeader`  | `boolean`                                 | A boolean to enable a sticky header.                                                                                                     |
| `scrollAreaHeight`    | `number`                                  | The height of the scroll area.                                                                                                           |
| `enableStickyActionColumn` | `boolean`                                 | A boolean to enable a sticky action column.                                                                                              |
| `filtersRenderMode`   | `'all' | 'selective'`                     | The mode for rendering filters.                                                                                                          |
| `enableExport`        | `boolean`                                 | A boolean to enable the export functionality.                                                                                            |
| `exportFormats`       | `ExportFormat[]`                          | An array of export formats.                                                                                                              |
| `exportFunction`      | `ExportFunction`                          | The function to be called when exporting data.                                                                                           |
| `exportMode`          | `'download' | 'async'`                    | The mode for exporting data.                                                                                                             |
| `defaultExportFileName` | `string`                                  | The default file name for exported files.                                                                                                |
| `translations`        | `Translations`                            | An object with translations for the component.                                                                                           |
| `onRowClick`          | `(row: T) => void`                        | A callback function that is called when a row is clicked.                                                                                |
| `onRowDoubleClick`    | `(row: T) => void`                        | A callback function that is called when a row is double-clicked.                                                                         |

#### DataTable Usage

To use the `DataTable` component, you need to provide the `data`, `columns`, and `onParamsChange` props. The `data` prop should be an object with the following shape:

```typescript
interface TableData {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}
```

The `columns` prop should be an array of objects with the following shape:

```typescript
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'enum' | 'date' | 'array-enum' | 'boolean';
  filterOperator?: string;
  filterOptions?: { label: string; value: string }[];
}
```

Here is an example of how to use the `DataTable` component:

```typescript
import { DataTable } from '@preboot.io/preboot-ui-community';

const MyComponent = () => {
  const [params, setParams] = useState({
    page: 0,
    size: 10,
    sortField: 'name',
    sortDirection: 'ASC',
    filters: [],
  });

  const data = {
    content: [
      { id: 1, name: 'John Doe', age: 30 },
      { id: 2, name: 'Jane Doe', age: 25 },
    ],
    totalElements: 2,
    number: 0,
    size: 10,
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'age', label: 'Age', sortable: true, filterable: true },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={false}
      onParamsChange={setParams}
      currentParams={params}
    />
  );
};
```

### Form

The `Form` component is a flexible form component that can be used to create forms with various input fields.

#### BaseForm

The `BaseForm` component is the base component for creating forms. It provides the basic structure and functionality for a form.

#### BaseForm Props

| Prop          | Type                        | Description                                                              |
| ------------- | --------------------------- | ------------------------------------------------------------------------ |
| `form`        | `UseFormReturnType<T>`      | The form object returned by the `useForm` hook from `@mantine/form`.     |
| `onSubmit`    | `(values: T) => Promise<void>` | A callback function that is called when the form is submitted.           |
| `onCancel`    | `() => void`                | A callback function that is called when the form is cancelled.           |
| `loading`     | `boolean`                   | A boolean indicating whether the form is in a loading state.             |
| `submitLabel` | `string`                    | The label for the submit button.                                         |
| `cancelLabel` | `string`                    | The label for the cancel button.                                         |
| `children`    | `React.ReactNode`           | The content of the form.                                                 |
| `mode`        | `'edit' | 'readonly'`       | The mode of the form.                                                    |

#### BaseForm Usage

To use the `BaseForm` component, you need to provide the `form` and `children` props. The `form` prop should be the object returned by the `useForm` hook from `@mantine/form`.

Here is an example of how to use the `BaseForm` component:

```typescript
import { BaseForm } from '@preboot.io/preboot-ui-community';
import { useForm } from '@mantine/form';
import { TextInput } from '@mantine/core';

const MyForm = () => {
  const form = useForm({
    initialValues: {
      name: '',
    },
  });

  const handleSubmit = async (values) => {
    // Handle form submission
  };

  return (
    <BaseForm form={form} onSubmit={handleSubmit}>
      <TextInput label="Name" {...form.getInputProps('name')} />
    </BaseForm>
  );
};
```

#### Form Fields

The library provides a set of form fields that can be used with the `BaseForm` component. These fields are:

- `CheckboxField`
- `MultiSelectField`
- `PasswordField`
- `SelectField`
- `TextField`

These fields are wrappers around the corresponding Mantine components and are designed to be used with the `BaseForm` component.
