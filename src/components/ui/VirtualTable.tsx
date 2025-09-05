// Virtual scrolling table component
import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { VirtualList } from './VirtualList';

import { Checkbox } from './index';

export interface ColumnType<T = any> {
  title: string;
  dataIndex: keyof T;
  key: string;
  width?: number | string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  fixed?: 'left' | 'right';
}

interface VirtualTableProps<T = any> {
  dataSource: T[];
  columns: ColumnType<T>[];
  rowKey: keyof T | ((record: T) => string);
  rowHeight?: number;
  containerHeight?: number | string;
  pagination?: boolean;
  rowSelection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
    onSelect?: (record: T, selected: boolean) => void;
    onSelectAll?: (
      selected: boolean,
      selectedRows: T[],
      changeRows: T[]
    ) => void;
  };
  className?: string;
  loading?: boolean;
}

export function VirtualTable<T extends Record<string, any>>({
  dataSource,
  columns,
  rowKey,
  rowHeight = 60,
  containerHeight = 400,
  pagination = false,
  rowSelection,
  className = '',
  loading = false,
}: VirtualTableProps<T>) {
  const { t } = useTranslation();

  // Get row key
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      return String(record[rowKey]);
    },
    [rowKey]
  );

  // Check if row is selected
  const isRowSelected = useCallback(
    (record: T): boolean => {
      if (!rowSelection) return false;
      const key = getRowKey(record, 0);
      return rowSelection.selectedRowKeys.includes(key);
    },
    [rowSelection, getRowKey]
  );

  // Handle row selection
  const handleRowSelect = useCallback(
    (record: T, selected: boolean) => {
      if (!rowSelection) return;

      const key = getRowKey(record, 0);
      const newSelectedKeys = selected
        ? [...rowSelection.selectedRowKeys, key]
        : rowSelection.selectedRowKeys.filter(k => k !== key);

      rowSelection.onChange(newSelectedKeys);
      rowSelection.onSelect?.(record, selected);
    },
    [rowSelection, getRowKey]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (!rowSelection) return;

      const newSelectedKeys = selected
        ? dataSource.map(record => getRowKey(record, 0))
        : [];
      rowSelection.onChange(newSelectedKeys);
      rowSelection.onSelectAll?.(selected, dataSource, []);
    },
    [rowSelection, dataSource, getRowKey]
  );

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!rowSelection || dataSource.length === 0) return false;
    return dataSource.every(record => isRowSelected(record));
  }, [rowSelection, dataSource, isRowSelected]);

  // Check if some rows are selected
  const isIndeterminate = useMemo(() => {
    if (!rowSelection || dataSource.length === 0) return false;
    const selectedCount = dataSource.filter(record =>
      isRowSelected(record)
    ).length;
    return selectedCount > 0 && selectedCount < dataSource.length;
  }, [rowSelection, dataSource, isRowSelected]);

  // Render table row
  const renderRow = useCallback(
    (record: T, index: number) => {
      const rowKeyValue = getRowKey(record, index);
      const selected = isRowSelected(record);

      return (
        <div
          key={rowKeyValue}
          className={`virtual-table-row ${selected ? 'selected' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: rowHeight,
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: selected ? '#f0f8ff' : 'transparent',
            transition: 'background-color 0.2s',
          }}
        >
          {/* Selection checkbox */}
          {rowSelection && (
            <div
              style={{ width: 50, display: 'flex', justifyContent: 'center' }}
            >
              <Checkbox
                checked={selected}
                onChange={checked => handleRowSelect(record, checked)}
              />
            </div>
          )}

          {/* Data columns */}
          {columns.map(column => (
            <div
              key={column.key}
              style={{
                flex: column.width ? 0 : 1,
                width: column.width,
                padding: '0 12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {column.render
                ? column.render(record[column.dataIndex], record, index)
                : record[column.dataIndex]}
            </div>
          ))}
        </div>
      );
    },
    [
      columns,
      rowHeight,
      rowSelection,
      isRowSelected,
      handleRowSelect,
      getRowKey,
    ]
  );

  // Render table header
  const renderHeader = useCallback(
    () => (
      <div
        className="virtual-table-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 50,
          backgroundColor: '#fafafa',
          borderBottom: '2px solid #f0f0f0',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {/* Selection checkbox */}
        {rowSelection && (
          <div style={{ width: 50, display: 'flex', justifyContent: 'center' }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={checked => handleSelectAll(checked)}
            />
          </div>
        )}

        {/* Column headers */}
        {columns.map(column => (
          <div
            key={column.key}
            style={{
              flex: column.width ? 0 : 1,
              width: column.width,
              padding: '0 12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {column.title}
          </div>
        ))}
      </div>
    ),
    [columns, rowSelection, isAllSelected, isIndeterminate, handleSelectAll]
  );

  if (loading) {
    return (
      <div
        className={`virtual-table ${className}`}
        style={{ height: containerHeight }}
      >
        <div
          className="loading-placeholder"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
          }}
        >
          {t('loading')}...
        </div>
      </div>
    );
  }

  if (dataSource.length === 0) {
    return (
      <div
        className={`virtual-table ${className}`}
        style={{ height: containerHeight }}
      >
        <div
          className="empty-placeholder"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
          }}
        >
          {t('no_data')}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`virtual-table ${className}`}
      style={{ height: containerHeight }}
    >
      {/* Table header */}
      {renderHeader()}

      {/* Virtual list for table body */}
      <VirtualList
        items={dataSource}
        itemHeight={rowHeight}
        renderItem={renderRow}
        containerHeight={
          typeof containerHeight === 'number'
            ? containerHeight - 50
            : 'calc(100% - 50px)'
        }
        className="virtual-table-body"
      />
    </div>
  );
}
