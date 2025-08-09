import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Eye } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { orders } from '../data/dummyData';
import AddOrderModal from '../components/AddOrderModal';
import EditStatusModal from '../components/EditStatusModal';
import FilterModal, { FilterOptions } from '../components/FilterModal';
import { Order } from '../types';

const Orders: React.FC = () => {
  const { showSuccess, showInfo } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    status: '',
    dateRange: '',
    tableNumber: '',
    minTotal: '',
    maxTotal: ''
  });

  const applyAdvancedFilters = (order: Order, filters: FilterOptions) => {
    // Status filter
    if (filters.status && order.status !== filters.status) {
      return false;
    }

    // Table number filter
    if (filters.tableNumber && order.tableNumber.toString() !== filters.tableNumber) {
      return false;
    }

    // Total amount filter
    if (filters.minTotal && order.total < parseInt(filters.minTotal)) {
      return false;
    }
    if (filters.maxTotal && order.total > parseInt(filters.maxTotal)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const orderDate = new Date(order.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      switch (filters.dateRange) {
        case 'today':
          if (orderDate.toDateString() !== today.toDateString()) {
            return false;
          }
          break;
        case 'yesterday':
          if (orderDate.toDateString() !== yesterday.toDateString()) {
            return false;
          }
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (orderDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          if (orderDate < monthAgo) {
            return false;
          }
          break;
      }
    }

    return true;
  };

  const filteredOrders = orderList.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tableNumber.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'semua' || order.status === statusFilter;
    const matchesAdvancedFilters = applyAdvancedFilters(order, activeFilters);
    return matchesSearch && matchesStatus && matchesAdvancedFilters;
  });

  const handleAddOrder = (newOrder: Order) => {
    setOrderList(prev => [newOrder, ...prev]);
  };

  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsEditStatusModalOpen(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrderList(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus as any } : order
    ));
  };

  const handleApplyFilter = (filters: FilterOptions) => {
    setActiveFilters(filters);
    const activeFilterCount = Object.values(filters).filter(value => value !== '').length;
    if (activeFilterCount > 0) {
      showInfo('Filter Diterapkan', `${activeFilterCount} filter aktif diterapkan`);
    } else {
      showInfo('Filter Direset', 'Semua filter telah dihapus');
    }
  };

  const handleViewOrder = (order: Order) => {
    showInfo('Detail Pesanan', `Menampilkan detail untuk ${order.orderNumber}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dimasak': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'siap': return 'bg-green-100 text-green-800 border-green-200';
      case 'selesai': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const statusCounts = {
    semua: orderList.length,
    menunggu: orderList.filter(o => o.status === 'menunggu').length,
    dimasak: orderList.filter(o => o.status === 'dimasak').length,
    siap: orderList.filter(o => o.status === 'siap').length,
    selesai: orderList.filter(o => o.status === 'selesai').length,
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="text-gray-600">Kelola semua pesanan restoran</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Pesanan
        </button>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <div className="flex flex-wrap gap-1">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nomor pesanan atau meja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => setIsFilterModalOpen(true)}
          className={`flex items-center px-4 py-2.5 border rounded-lg transition-colors duration-200 ${
            hasActiveFilters 
              ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Filter className={`h-5 w-5 mr-2 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-400'}`} />
          Filter {hasActiveFilters && `(${Object.values(activeFilters).filter(v => v !== '').length})`}
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal/Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Meja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.timestamp.toLocaleDateString('id-ID')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.timestamp.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Meja {order.tableNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors duration-200"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditStatus(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-200"
                        title="Edit Status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada pesanan yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddOrder}
      />

      {/* Edit Status Modal */}
      <EditStatusModal
        isOpen={isEditStatusModalOpen}
        onClose={() => setIsEditStatusModalOpen(false)}
        onSave={handleUpdateStatus}
        order={selectedOrder}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        currentFilters={activeFilters}
      />
    </div>
  );
};

export default Orders;