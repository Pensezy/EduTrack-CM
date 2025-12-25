/**
 * TABLE RESPONSIVE
 *
 * - Mode Desktop : Table classique
 * - Mode Mobile : Cards empilées
 * - Tri et filtres adaptés
 */

import React, { useState } from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/responsive';

const ResponsiveTable = ({
  columns = [],
  data = [],
  onRowClick = null,
  emptyMessage = 'Aucune donnée',
  loading = false,
  mobileCardRenderer = null
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Inbox" size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(column)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 select-none',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <Icon
                        name={
                          sortColumn === column.key
                            ? sortDirection === 'asc'
                              ? 'ChevronUp'
                              : 'ChevronDown'
                            : 'ChevronsUpDown'
                        }
                        size={14}
                        className={sortColumn === column.key ? 'text-primary' : 'text-gray-400'}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'px-4 py-4 whitespace-nowrap text-sm',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedData.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick && onRowClick(row)}
            className={cn(
              'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
              onRowClick && 'active:scale-95 transition-transform cursor-pointer'
            )}
          >
            {mobileCardRenderer ? (
              mobileCardRenderer(row)
            ) : (
              <div className="space-y-2">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {column.label}
                    </span>
                    <span className="text-sm text-gray-900 text-right ml-3">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;
