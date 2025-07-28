import React from 'react';

export interface ColumnType<T = any> {
  title: string;
  dataIndex?: string;
  key: string;
  render?: (text: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T = any> {
  columns: ColumnType<T>[];
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  pagination?: boolean | {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[]) => void;
    onSelect?: (record: T, selected: boolean) => void;
    onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  };
}

const Table = <T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey = 'id',
  pagination = false,
  loading = false,
  className = '',
  style,
  onRow,
  rowSelection
}: TableProps<T>) => {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const renderCell = (column: ColumnType<T>, record: T, index: number) => {
    const value = record[column.dataIndex];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  return (
    <div className={`overflow-x-auto ${className}`} style={style}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {rowSelection && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={rowSelection.selectedRowKeys?.length === dataSource.length}
                  onChange={(e) => {
                    if (rowSelection.onSelectAll) {
                      rowSelection.onSelectAll(e.target.checked, dataSource, dataSource);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${column.className || ''}`}
                style={{
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                No data
              </td>
            </tr>
          ) : (
            dataSource.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                className="hover:bg-gray-50 transition-colors duration-150"
                {...(onRow ? onRow(record, index) : {})}
              >
                {rowSelection && (
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={rowSelection.selectedRowKeys?.includes(getRowKey(record, index))}
                      onChange={(e) => {
                        if (rowSelection.onSelect) {
                          rowSelection.onSelect(record, e.target.checked);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-gray-900 border-b border-gray-100 ${column.className || ''}`}
                    style={{
                      textAlign: column.align || 'left'
                    }}
                  >
                    {renderCell(column, record, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Simple pagination - can be enhanced */}
      {pagination && typeof pagination === 'object' && pagination.total && pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current || 1) - 1) * (pagination.pageSize || 10) + 1} to{' '}
            {Math.min((pagination.current || 1) * (pagination.pageSize || 10), pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={(pagination.current || 1) <= 1}
              onClick={() => pagination.onChange?.((pagination.current || 1) - 1, pagination.pageSize || 10)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={(pagination.current || 1) * (pagination.pageSize || 10) >= (pagination.total || 0)}
              onClick={() => pagination.onChange?.((pagination.current || 1) + 1, pagination.pageSize || 10)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table; 