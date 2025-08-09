import React, { useState } from 'react';
import { X, Filter, Calendar, MapPin } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  status: string;
  dateRange: string;
  tableNumber: string;
  minTotal: string;
  maxTotal: string;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilter, currentFilters }) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'dimasak', label: 'Dimasak' },
    { value: 'siap', label: 'Siap' },
    { value: 'selesai', label: 'Selesai' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Semua Tanggal' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '30 Hari Terakhir' }
  ];

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      status: '',
      dateRange: '',
      tableNumber: '',
      minTotal: '',
      maxTotal: ''
    };
    setFilters(resetFilters);
    onApplyFilter(resetFilters);
    onClose();
  };

  const handleClose = () => {
    setFilters(currentFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Filter Pesanan</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Pesanan
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Rentang Tanggal
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table Number Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Nomor Meja
            </label>
            <input
              type="number"
              value={filters.tableNumber}
              onChange={(e) => handleFilterChange('tableNumber', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nomor meja"
              min="1"
            />
          </div>

          {/* Total Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rentang Total (Rp)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={filters.minTotal}
                onChange={(e) => handleFilterChange('minTotal', e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min"
                min="0"
              />
              <input
                type="number"
                value={filters.maxTotal}
                onChange={(e) => handleFilterChange('maxTotal', e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.status || filters.dateRange || filters.tableNumber || filters.minTotal || filters.maxTotal) && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800 mb-2">Filter Aktif:</p>
              <div className="space-y-1 text-xs text-blue-700">
                {filters.status && <p>• Status: {statusOptions.find(s => s.value === filters.status)?.label}</p>}
                {filters.dateRange && <p>• Tanggal: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}</p>}
                {filters.tableNumber && <p>• Meja: {filters.tableNumber}</p>}
                {(filters.minTotal || filters.maxTotal) && (
                  <p>• Total: {filters.minTotal || '0'} - {filters.maxTotal || '∞'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Reset Filter
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;