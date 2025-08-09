import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { Order } from '../types';

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, newStatus: string) => void;
  order: Order | null;
}

const EditStatusModal: React.FC<EditStatusModalProps> = ({ isOpen, onClose, onSave, order }) => {
  const { showSuccess, showError } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState('');

  const statusOptions = [
    { value: 'menunggu', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'dimasak', label: 'Dimasak', color: 'bg-blue-100 text-blue-800' },
    { value: 'siap', label: 'Siap', color: 'bg-green-100 text-green-800' },
    { value: 'selesai', label: 'Selesai', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (order && isOpen) {
      setSelectedStatus(order.status);
    }
  }, [order, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!order) return;
      
      if (selectedStatus === order.status) {
        showError('Tidak Ada Perubahan', 'Status yang dipilih sama dengan status saat ini');
        return;
      }

      onSave(order.id, selectedStatus);
      showSuccess(
        'Status Berhasil Diperbarui', 
        `Status pesanan ${order.orderNumber} telah diubah menjadi "${statusOptions.find(s => s.value === selectedStatus)?.label}"`
      );
      handleClose();
    } catch (error) {
      showError('Gagal Memperbarui', 'Terjadi kesalahan saat memperbarui status pesanan');
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Status Pesanan</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">No. Pesanan:</span>
                <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">No. Meja:</span>
                <span className="text-sm font-medium text-gray-900">Meja {order.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Waktu:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.timestamp.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Saat Ini
            </label>
            <div className="flex items-center">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                statusOptions.find(s => s.value === order.status)?.color
              }`}>
                {statusOptions.find(s => s.value === order.status)?.label}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Baru *
            </label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className={`ml-3 inline-flex px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Pesanan
            </label>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <span className="text-sm text-gray-600">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Perbarui Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStatusModal;