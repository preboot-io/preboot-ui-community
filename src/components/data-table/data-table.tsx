import {useCallback, useState, useEffect} from 'react';
import {
    Table,
    Pagination,
    Group,
    TextInput,
    Select,
    Menu,
    ActionIcon,
    Text,
    MultiSelect,
    Tooltip,
    Button,
    Loader,
    Box,
    ScrollArea,
    SegmentedControl
} from '@mantine/core';
import cx from 'clsx';
import {TbCheck, TbDots, TbFileExport, TbPlus} from 'react-icons/tb';
import { useDebouncedValue } from '@mantine/hooks';
import styles from './data-table.module.css';
import {FilterCriteria, SearchParams, TableData} from "components/data-table/types/types";
import {DatePickerInput} from "@mantine/dates";
import {FaRegTrashCan} from "react-icons/fa6";
import { saveAs } from 'file-saver';

export type FilterType = 'text' | 'enum' | 'date' | 'array-enum' | 'boolean';
export type FiltersRenderMode = 'all' | 'selective';
export type ExportFormat = 'xlsx' | 'csv' | 'pdf';
export interface ExportFunction {
    (format: ExportFormat, fileName: string, params: SearchParams): Promise<Blob>;
}

export interface Column<T, K extends keyof T = keyof T> {
    key: K;
    label: string;
    render?: (value: T[K], item: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: FilterType;
    filterOperator?: FilterCriteria['operator'];
    filterOptions?: { label: string; value: string }[];
    tooltip?: string;
    columnStyle?: React.CSSProperties;
    columnClassName?: string;
}

export interface RowAction<T> {
    label: string;
    color?: string;
    icon?: React.ComponentType<any>;
    onClick: (item: T) => void;
    show?: (item: T) => boolean;
}

export interface Translations {
    addFilter?: string;
    noRecordsFound?: string;
    exportAs?: string;
    export?: string;
    totalItems?: string;
    booleanTrue?: string;
    booleanFalse?: string;
}

export interface DataTableProps<T> {
    data: TableData;
    columns: readonly { [K in keyof T]: Column<T, K> }[keyof T][];  // This ensures type safety for each column
    loading: boolean;
    onParamsChange: (params: SearchParams) => void;
    currentParams: SearchParams;
    rowActions?: RowAction<T>[];
    noRecordsText?: string;
    containerClassName?: string;
    tableClassName?: string;
    enableStickyColumn?: boolean;
    enableStickyHeader?: boolean;
    scrollAreaHeight?: number;
    enableStickyActionColumn?: boolean;
    filtersRenderMode?: FiltersRenderMode;
    enableExport?: boolean;
    exportFormats?: ExportFormat[];
    exportFunction?: ExportFunction;
    defaultExportFileName?: string;
    translations?: Translations;
}

export function DataTable<T>({
                                 data,
                                 columns,
                                 loading,
                                 onParamsChange,
                                 currentParams,
                                 rowActions,
                                 noRecordsText,
                                 containerClassName,
                                 tableClassName,
                                 filtersRenderMode='all',
                                 enableExport = false,
                                 exportFormats = ['xlsx'],
                                 exportFunction,
                                 defaultExportFileName = 'export',
                                 enableStickyColumn=false,
                                 enableStickyHeader=false,
                                 scrollAreaHeight,
                                 enableStickyActionColumn=false,
                                 translations = {}
                             }: DataTableProps<T>) {
    // Store search values separately from the query params
    const [searchValues, setSearchValues] = useState<Record<string, string | string[] | boolean>>({});
    const [isExporting, setIsExporting] = useState<Record<ExportFormat, boolean>>({
        xlsx: false,
        csv: false,
        pdf: false
    });

    const [debouncedSearchValues] = useDebouncedValue(searchValues, 300);

    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [availableFilters, setAvailableFilters] = useState<string[]>([]);

    // Initialize searchValues from currentParams.filters
    useEffect(() => {
        const initialSearchValues: Record<string, string | string[] | boolean> = {};
        currentParams.filters.forEach(filter => {
            const column = columns.find(col => String(col.key) === filter.field);
            if (column?.filterType === 'boolean' && typeof filter.value === 'string') {
                initialSearchValues[filter.field] = filter.value === 'true';
            } else {
                initialSearchValues[filter.field] = filter.value;
            }
        });
        setSearchValues(initialSearchValues);

        const activeFilterKeys = currentParams.filters.map(filter => filter.field);
        setActiveFilters(activeFilterKeys);

        const filterableColumns = columns
            .filter(column => column.filterable)
            .map(column => String(column.key));

        const remainingFilters = filterableColumns.filter(key => !activeFilterKeys.includes(key));
        setAvailableFilters(remainingFilters);

    }, []); // Run only on mount

    // Update search params when debounced values change
    useEffect(() => {
        const newFilters: FilterCriteria[] = [];

        Object.entries(debouncedSearchValues).forEach(([key, value]) => {
            // For boolean fields, include them even if the value is false
            const column = columns.find(col => String(col.key) === key);
            const isBooleanField = column?.filterType === 'boolean';

            if (value !== undefined && (value !== '' || isBooleanField)) {
                if (column?.filterOperator) {
                    newFilters.push({
                        field: key,
                        operator: column.filterOperator,
                        value
                    });
                } else if (column?.filterType === 'enum') {
                    newFilters.push({
                        field: key,
                        operator: 'eq',
                        value
                    });
                } else if (column?.filterType === 'date') {
                    newFilters.push({
                        field: key,
                        operator: 'gte',
                        value
                    });
                } else if (column?.filterType === 'array-enum') {
                    const arrayValue = Array.isArray(value) ? value : [value as string];
                    if (arrayValue.length > 0) {
                        newFilters.push({
                            field: key,
                            operator: 'ao',
                            value: arrayValue
                        });
                    }
                } else if (column?.filterType === 'boolean') {
                    newFilters.push({
                        field: key,
                        operator: 'eq',
                        value: String(value) // Convert boolean to string for consistency
                    });
                } else {
                    newFilters.push({
                        field: key,
                        operator: 'like',
                        value
                    });
                }
            }
        });

        const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(currentParams.filters);

        if (filtersChanged) {
            onParamsChange({
                ...currentParams,
                page: 0,
                filters: newFilters
            });
        }
    }, [debouncedSearchValues, currentParams, onParamsChange, columns]);

    const handlePageChange = (page: number) => {
        onParamsChange({
            ...currentParams,
            page: page - 1 // Convert from 1-based to 0-based
        });
    };

    const handleSort = (column: Column<T>) => {
        if (!column.sortable) return;

        const isCurrentColumn = currentParams.sortField === column.key;
        const newDirection = isCurrentColumn && currentParams.sortDirection === 'ASC' ? 'DESC' : 'ASC';

        onParamsChange({
            ...currentParams,
            sortField: column.key as string,
            sortDirection: newDirection
        });
    };

    // Render filter function
    const renderFilter = (column: Column<T>) => {
        if (!column.filterable) return null;

        const value = searchValues[column.key as string];

        switch (column.filterType) {
            case 'enum':
                return (
                    <Select
                        key={String(column.key)}
                        data={column.filterOptions || []}
                        clearable
                        className={styles.filterInput}
                        value={value as string}
                        onChange={(newValue) => handleSearch(column, newValue || '')}
                    />
                );
            case 'array-enum':
                return (
                    <MultiSelect
                        key={String(column.key)}
                        data={column.filterOptions || []}
                        clearable
                        className={styles.filterInput}
                        value={Array.isArray(value) ? value : []}
                        onChange={(newValue) => handleMultiSearch(column, newValue)}
                    />
                );
            case 'date':
                return (
                    <DatePickerInput
                        key={String(column.key)}
                        value={value ? new Date(value as string) : null}
                        className={styles.filterInput}
                        onChange={(date) => {
                            handleSearch(column, date);
                        }}
                    />
                );
            case 'boolean':
                return (
                    <SegmentedControl
                        key={String(column.key)}
                        className={styles.filterInput}
                        value={String(value)}
                        onChange={(val) => handleBooleanSearch(column, val === 'true')}
                        data={[
                            { label: translations.booleanTrue || 'True', value: 'true' },
                            { label: translations.booleanFalse || 'False', value: 'false' }
                        ]}
                        size="xs"
                    />
                );
            case 'text':
            default:
                return (
                    <TextInput
                        key={String(column.key)}
                        className={styles.filterInput}
                        value={String(value || '')}
                        onChange={(event) => handleSearch(column, event.currentTarget.value)}
                    />
                );
        }
    };

    const handleSearch = useCallback((column: Column<T>, value: string) => {
        setSearchValues(prev => ({
            ...prev,
            [column.key as string]: value
        }));
    }, []);

    const handleMultiSearch = useCallback((column: Column<T>, values: string[]) => {
        setSearchValues(prev => ({
            ...prev,
            [column.key as string]: values
        }));
    }, []);

    // Specific handler for boolean filters
    const handleBooleanSearch = useCallback((column: Column<T>, value: boolean) => {
        setSearchValues(prev => ({
            ...prev,
            [column.key as string]: value
        }));
    }, []);

    const addFilter = (filterKey: string) => {
        setActiveFilters(prev => [...prev, filterKey]);
        setAvailableFilters(prev => prev.filter(key => key !== filterKey));

        // For boolean filters, initialize with false
        const column = columns.find(col => String(col.key) === filterKey);
        if (column?.filterType === 'boolean') {
            setSearchValues(prev => ({
                ...prev,
                [filterKey]: false
            }));
        }
    };

    const removeFilter = (filterKey: string) => {
        setActiveFilters(prev => prev.filter(key => key !== filterKey));
        setAvailableFilters(prev => [...prev, filterKey]);

        setSearchValues(prev => {
            const newValues = {...prev};
            delete newValues[filterKey];
            return newValues;
        });
    };

    const handleExport = async (format: ExportFormat) => {
        if (!exportFunction) {
            console.error('Export function is not provided');
            return;
        }

        try {
            setIsExporting(prev => ({ ...prev, [format]: true }));

            const blob = await exportFunction(format, defaultExportFileName, currentParams);

            saveAs(blob, `${defaultExportFileName}.${format}`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(prev => ({ ...prev, [format]: false }));
        }
    };

    const renderExportButton = () => {
        if (!enableExport || !exportFunction) return null;

        // If only one format is available, show a simple button
        if (exportFormats.length === 1) {
            const format = exportFormats[0];
            return (
                <Button
                    leftSection={isExporting[format] ? <Loader size="xs" /> : <TbFileExport size={16} />}
                    onClick={() => handleExport(format)}
                    disabled={isExporting[format]}
                >
                    {translations.export || 'Export'} {format.toUpperCase()}
                </Button>
            );
        }

        // If multiple formats are available, show a dropdown
        return (
            <Menu position="bottom-end">
                <Menu.Target>
                    <Button leftSection={<TbFileExport size={16} />}>
                        {translations.export || 'Export'}
                    </Button>
                </Menu.Target>
                <Menu.Dropdown>
                    {exportFormats.map((format) => (
                        <Menu.Item
                            key={format}
                            leftSection={isExporting[format] ? <Loader size="xs" /> : <TbFileExport size={16} />}
                            rightSection={isExporting[format] ? null : <TbCheck size={16} />}
                            onClick={() => handleExport(format)}
                            disabled={isExporting[format]}
                        >
                            {translations.exportAs ? `${translations.exportAs} ${format.toUpperCase()}` : `Export as ${format.toUpperCase()}`}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
        );
    };

    const renderSelectiveFilters = () => {
        return (
            <div className={styles.filtersContainer}>
                {activeFilters.length > 0 && (
                    <div className={styles.filtersGrid} style={{ gap: '12px' }}>
                        {activeFilters.map(filterKey => {
                            const column = columns.find(col => String(col.key) === filterKey);
                            if (!column) return null;

                            return (
                                <div key={filterKey} className={styles.filterRow}>
                                    <Text className={styles.filterLabel}>{column.label}</Text>
                                    {renderFilter(column)}
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        className={styles.filterDelete}
                                        onClick={() => removeFilter(filterKey)}
                                    >
                                        <FaRegTrashCan size={16}/>
                                    </ActionIcon>
                                </div>
                            );
                        })}
                    </div>
                )}

                {availableFilters.length > 0 && (
                    <Menu position="bottom-start">
                        <Menu.Target>
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<TbPlus size={16} />}
                            >
                                {translations.addFilter || 'Add filter'}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <ScrollArea h={availableFilters.length > 10 ? 300 : undefined} type="auto">
                                {availableFilters.map(filterKey => {
                                    const column = columns.find(col => String(col.key) === filterKey);
                                    if (!column) return null;

                                    return (
                                        <Menu.Item
                                            key={filterKey}
                                            onClick={() => addFilter(filterKey)}
                                        >
                                            {column.label}
                                        </Menu.Item>
                                    );
                                })}
                            </ScrollArea>
                        </Menu.Dropdown>
                    </Menu>
                )}
            </div>
        );
    };

    const renderAllFilters = () => {
        return (
            <Group mb="md" gap="sm">
                {columns
                    .filter(column => column.filterable)
                    .map(column => (
                        <div key={String(column.key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'xs'}}>
                            <Text size="sm" c="dimmed" mb="xs">{column.label}</Text>
                            {renderFilter(column)}
                        </div>
                    ))}
            </Group>
        );
    };

    const renderRowActions = (item: T) => {
        if (!rowActions?.length) return null;

        const visibleActions = rowActions.filter(action =>
            !action.show || action.show(item)
        );

        if (visibleActions.length === 0) return null;

        return (
            <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                    <ActionIcon variant="subtle" size="sm">
                        <TbDots size={16} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    {visibleActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Menu.Item
                                key={index}
                                leftSection={Icon && <Icon size={16} />}
                                color={action.color}
                                onClick={() => action.onClick(item)}
                            >
                                {action.label}
                            </Menu.Item>
                        );
                    })}
                </Menu.Dropdown>
            </Menu>
        );
    };

    return (
        <div className={`${styles.container} ${containerClassName || ''}`}>
            {/* Search/Filter Controls */}
            <Group justify="space-between" mt="md" mb="md">
                {filtersRenderMode === 'all' ? renderAllFilters() : renderSelectiveFilters()}

                <Box style={{ display: 'flex', alignSelf: 'flex-end' }}>
                    {renderExportButton()}
                </Box>
            </Group>
            {/* Table */}
            <ScrollArea
                h={enableStickyHeader ? scrollAreaHeight : undefined}
                classNames={styles}
                offsetScrollbars
                type="auto"
            >
                <Table
                    stickyHeader={enableStickyHeader}
                    striped
                    highlightOnHover
                    className={cx(
                        styles.table,
                        tableClassName
                    )}
                >
                    <Table.Thead data-sticky-header={enableStickyHeader ? "true" : undefined}>
                        <Table.Tr>
                            {columns.map(((column, columnIndex) => (
                                <Tooltip
                                    disabled={!column.tooltip}
                                    key={String(column.key)}
                                    label={column.tooltip}
                                    multiline
                                    w={220}
                                >
                                    <Table.Th
                                        onClick={() => handleSort(column)}
                                        className={cx(
                                            column.sortable ? styles.sortable : '',
                                            column.columnClassName || ''
                                        )}
                                        style={column.columnStyle}
                                        data-sticky-column={columnIndex === 0 && enableStickyColumn ? "true" : undefined}
                                    >
                                        <Group gap="xs" wrap="nowrap">
                                            {column.label}
                                            {column.sortable && currentParams.sortField === column.key && (
                                                <span>{currentParams.sortDirection === 'DESC' ? ' ↓' : ' ↑'}</span>
                                            )}
                                        </Group>
                                    </Table.Th>
                                </Tooltip>
                            )))}
                            {rowActions?.length ? (
                                <Table.Th
                                    w={40}
                                    data-sticky-action={enableStickyActionColumn ? "true" : undefined}
                                />
                            ) : null}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            // Loading skeleton rows
                            Array.from({ length: currentParams.size || 10 }).map((_, index) => (
                                <Table.Tr key={index}>
                                    {columns.map((column, columnIndex) => (
                                        <Table.Td
                                            key={String(column.key)}
                                            className={
                                                columnIndex === 0 && enableStickyColumn ? styles.stickyColumn : ''
                                            }
                                        >
                                            <div className={styles.skeleton} />
                                        </Table.Td>
                                    ))}
                                    {rowActions?.length ? (
                                        <Table.Td key="rowActionsColumnKey">
                                            <div className={styles.skeleton} />
                                        </Table.Td>
                                    ) : null}
                                </Table.Tr>
                            ))
                        ) : data?.content?.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length + (rowActions?.length ? 1 : 0)}>
                                    <Text c="dimmed" ta="center" py="xl">
                                        {noRecordsText || translations.noRecordsFound || 'No records found'}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            data?.content?.map((item, index) => (
                                <Table.Tr key={index}>
                                    {columns.map((column, columnIndex) => (
                                        <Table.Td
                                            key={String(column.key)}
                                            className={cx(
                                                column.columnClassName
                                            )}
                                            style={column.columnStyle}
                                            data-sticky-column={columnIndex === 0 && enableStickyColumn ? "true" : undefined}
                                        >
                                            {column.render
                                                ? column.render(item[column.key], item)
                                                : String(item[column.key] ?? '')}
                                        </Table.Td>
                                    ))}
                                    {rowActions?.length ? (
                                        <Table.Td
                                            data-sticky-action={enableStickyActionColumn ? "true" : undefined}
                                        >
                                            {renderRowActions(item)}
                                        </Table.Td>
                                    ) : null}
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            {/* Pagination */}
            {data?.totalElements > 0 && (
                <Group justify="space-between" mt="md">
                    <div>
                        {translations.totalItems ? `${translations.totalItems}: ${data.totalElements}` : `Total: ${data.totalElements} items`}
                    </div>
                    <Pagination
                        value={data.number + 1}
                        onChange={handlePageChange}
                        total={Math.ceil(data.totalElements / data.size)}
                    />
                </Group>
            )}
        </div>
    );
}
