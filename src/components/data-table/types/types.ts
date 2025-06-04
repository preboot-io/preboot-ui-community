export interface TableData {
    content: any[];
    totalElements: number;
    number: number;
    size: number;
    last: boolean;
}

export interface FilterCriteria {
    field: string;
    operator: 'eq' | 'neq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in' | 'ao' | 'isnull' | 'isnotnull';
    value: any;
}

export interface SearchParams {
    page: number;
    size: number;
    sortField?: string;
    sortDirection?: 'ASC' | 'DESC';
    filters: FilterCriteria[];
}

// Helper function to create a base query params object
export const createSearchRequest = (
    page: number = 0,
    size: number = 10,
    sortField?: string,
    sortDirection: 'ASC' | 'DESC' = 'ASC',
    filters: FilterCriteria[] = []
): SearchParams => ({
    page,
    size,
    sortField,
    sortDirection,
    filters
});
