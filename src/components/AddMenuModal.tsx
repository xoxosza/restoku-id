import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menuData: any) => void;
}

const AddMenuModal: React.FC<AddMenuModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'makanan',
    description: '',
    image: '',
    available: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama menu harus diisi';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi harus diisi';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'URL gambar harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const menuData = {
        ...formData,
        id: Date.now().toString(),
        price: parseFloat(formData.price)
      };
      
      onSave(menuData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      price: '',
      category: 'makanan',
      description: '',
      image: '',
      available: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tambah Menu Baru</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nama Menu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Menu *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Masukkan nama menu"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Harga dan Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="0"
                min="0"
                step="1000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Masukkan deskripsi menu"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* URL Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Gambar *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.image ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </button>
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            
            {/* Preview Gambar */}
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Status Ketersediaan */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => handleInputChange('available', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 text-sm text-gray-700">
              Menu tersedia untuk dijual
            </label>
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
              Simpan Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuModal;