import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './data-table';
import { MantineProvider } from '@mantine/core';
import styles from './data-table.module.css';

describe('DataTable', () => {
  const mockData = {
    content: [
      { id: 1, name: 'John Doe', age: 30 },
      { id: 2, name: 'Jane Doe', age: 25 },
    ],
    totalElements: 2,
    number: 0,
    size: 10,
    last: true,
  };

  const mockColumns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
  ];

  const mockCurrentParams = {
    page: 0,
    size: 10,
    filters: [],
  };

  it('renders the table with data', () => {
    render(
      <MantineProvider>
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={false}
          onParamsChange={vi.fn()}
          currentParams={mockCurrentParams}
        />
      </MantineProvider>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const handleRowClick = vi.fn();
    render(
      <MantineProvider>
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={false}
          onParamsChange={vi.fn()}
          currentParams={mockCurrentParams}
          onRowClick={handleRowClick}
        />
      </MantineProvider>
    );

    fireEvent.click(screen.getByText('John Doe'));
    expect(handleRowClick).toHaveBeenCalledWith(mockData.content[0]);
  });

  it('calls onRowDoubleClick when a row is double-clicked', () => {
    const handleRowDoubleClick = vi.fn();
    render(
      <MantineProvider>
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={false}
          onParamsChange={vi.fn()}
          currentParams={mockCurrentParams}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </MantineProvider>
    );

    fireEvent.doubleClick(screen.getByText('Jane Doe'));
    expect(handleRowDoubleClick).toHaveBeenCalledWith(mockData.content[1]);
  });

  it('applies clickable class when onRowClick is provided', () => {
    render(
      <MantineProvider>
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={false}
          onParamsChange={vi.fn()}
          currentParams={mockCurrentParams}
          onRowClick={vi.fn()}
        />
      </MantineProvider>
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).toHaveClass(styles.clickable);
  });

  it('applies clickable class when onRowDoubleClick is provided', () => {
    render(
      <MantineProvider>
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={false}
          onParamsChange={vi.fn()}
          currentParams={mockCurrentParams}
          onRowDoubleClick={vi.fn()}
        />
      </MantineProvider>
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).toHaveClass(styles.clickable);
  });

  it('does not apply clickable class when neither onRowClick nor onRowDoubleClick is provided', () => {
    render(
      <MantineProvider>
        <DataTable
          data={mockData}
          columns={mockColumns}
          loading={false}
          onParamsChange={vi.fn()}
          currentParams={mockCurrentParams}
        />
      </MantineProvider>
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toHaveClass(styles.clickable);
  });
});