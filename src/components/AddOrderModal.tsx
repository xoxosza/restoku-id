import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { menuItems } from '../data/dummyData';
import { MenuItem, OrderItem } from '../types';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: any) => void;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onSave }) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    tableNumber: '',
    items: [] as OrderItem[]
  });
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableMenus = menuItems.filter(item => item.available);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddItem = () => {
    if (!selectedMenu) {
      showError('Pilih Menu', 'Silakan pilih menu terlebih dahulu');
      return;
    }

    if (quantity <= 0) {
      showError('Jumlah Invalid', 'Jumlah harus lebih dari 0');
      return;
    }

    const existingItemIndex = formData.items.findIndex(item => item.menuId === selectedMenu.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += quantity;
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const newItem: OrderItem = {
        menuId: selectedMenu.id,
        name: selectedMenu.name,
        quantity: quantity,
        price: selectedMenu.price
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    setSelectedMenu(null);
    setQuantity(1);
  };

  const handleRemoveItem = (menuId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.menuId !== menuId)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tableNumber || parseInt(formData.tableNumber) <= 0) {
      newErrors.tableNumber = 'Nomor meja harus diisi dan valid';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Minimal harus ada satu item pesanan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) {
        showError('Validasi Gagal', 'Mohon periksa kembali data yang dimasukkan');
        return;
      }

      const orderData = {
        id: Date.now().toString(),
        orderNumber: `ORD-${String(Date.now()).slice(-3)}`,
        tableNumber: parseInt(formData.tableNumber),
        items: formData.items,
        status: 'menunggu' as const,
        total: calculateTotal(),
        timestamp: new Date()
      };
      
      onSave(orderData);
      showSuccess('Pesanan Berhasil Ditambahkan', `Pesanan untuk meja ${formData.tableNumber} telah ditambahkan`);
      handleClose();
    } catch (error) {
      showError('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan pesanan');
    }
  };

  const handleClose = () => {
    setFormData({
      tableNumber: '',
      items: []
    });
    setSelectedMenu(null);
    setQuantity(1);
    setErrors({});
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tambah Pesanan Baru</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nomor Meja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Meja *
            </label>
            <input
              type="number"
              value={formData.tableNumber}
              onChange={(e) => handleInputChange('tableNumber', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.tableNumber ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Masukkan nomor meja"
              min="1"
            />
            {errors.tableNumber && <p className="text-red-500 text-sm mt-1">{errors.tableNumber}</p>}
          </div>

          {/* Tambah Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tambah Menu
            </label>
            <div className="flex gap-2">
              <select
                value={selectedMenu?.id || ''}
                onChange={(e) => {
                  const menu = availableMenus.find(m => m.id === e.target.value);
                  setSelectedMenu(menu || null);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Menu</option>
                {availableMenus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name} - {formatCurrency(menu.price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Daftar Item */}
          {formData.items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daftar Pesanan
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item) => (
                      <tr key={item.menuId}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.menuId)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
            </div>
          )}

          {/* Total */}
          {formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Pesanan:</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          )}

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
              Simpan Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;