'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiSave } from 'react-icons/fi';
import { config } from '../utils/config';
import { validateImageFile, formatFileSize } from '@/utils/file-validation';
import { useToast } from '@/hooks/useToast';

interface RegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSave: (data: any) => void;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'file';
    placeholder?: string;
    required?: boolean;
    options?: Array<{ value: string | number; label: string }>;
    min?: number;
    step?: number;
  }>;
  selectData?: any[];
  loading?: boolean;
  editData?: any; // Datos para editar
  isEditing?: boolean; // Modo edición
}

const RegistroModal: React.FC<RegistroModalProps> = ({
  isOpen,
  onClose,
  title,
  onSave,
  fields,
  selectData = [],
  loading = false,
  editData = null,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Hook para toasts
  const { showError, showWarning } = useToast();

  // Helper para construir URLs completas de imágenes
  const getFullImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl; // Ya es URL completa
    }
    return `${config.baseUrl}${relativeUrl}`;
  };

  // Inicializar formulario con datos de edición si están disponibles
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = 'unset';
    }

    // Cleanup para restaurar el scroll al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Inicializar formulario con datos de edición si están disponibles
  useEffect(() => {
    if (isEditing && editData) {
      // Convertir valores boolean a string para los selects
      const processedData = { ...editData };
      if (typeof editData.esta_activo === 'boolean') {
        processedData.esta_activo = editData.esta_activo.toString();
      }
      setFormData(processedData);
      // Si hay imagen existente, mostrar preview con URL completa
      if (editData.image?.url) {
        setPreviewUrl(getFullImageUrl(editData.image.url));
      }
    } else {
      setFormData({});
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [isEditing, editData, isOpen]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Función para manejar cambios en inputs sin validación en tiempo real
  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (file: File) => {
    try {
      // Validar el archivo
      const validationResult = await validateImageFile(file);
      
      if (!validationResult.isValid) {
        showError(validationResult.error || 'Archivo inválido');
        return; // No continuar si el archivo es inválido
      }

      // Si la validación es exitosa, proceder
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error validating file:', error);
      showError('Error al procesar el archivo');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (!files[0].type.startsWith('image/')) {
        showError('Solo se permiten archivos de imagen');
        return;
      }
      await handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleSave = () => {
    // Validar todos los campos antes de guardar
    const errors: string[] = [];

    fields.forEach(field => {
      const value = formData[field.name];

      if (field.type === 'text') {
        const textValue = value?.toString().trim() || '';

        // Validar requerido
        if (field.required && !textValue) {
          errors.push(`${field.label} es obligatorio`);
          return;
        }

        // Validar longitud mínima (solo si tiene contenido)
        if (textValue && textValue.length < 2) {
          errors.push(`${field.label} debe tener al menos 2 caracteres`);
        }

        // Validar longitud máxima
        if (textValue.length > 50) {
          errors.push(`${field.label} no puede exceder los 50 caracteres`);
        }

        // Validar caracteres permitidos
        if (textValue && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]*$/.test(textValue)) {
          errors.push(`${field.label} contiene caracteres no permitidos`);
        }

      } else if (field.type === 'number') {
        const numValue = parseFloat(value);

        // Validar requerido
        if (field.required && (isNaN(numValue) || value === '')) {
          errors.push(`${field.label} es obligatorio`);
          return;
        }

        // Validar que sea número válido
        if (!isNaN(numValue)) {
          if (numValue < 0) {
            errors.push(`${field.label} debe ser un número positivo`);
          } else if (numValue === 0) {
            errors.push(`${field.label} no puede ser cero`);
          } else if (field.min !== undefined && numValue < field.min) {
            errors.push(`${field.label} debe ser mayor o igual a ${field.min}`);
          }
        }

      } else if (field.type === 'select') {
        if (field.required && (!value || value === '')) {
          errors.push(`${field.label} es obligatorio`);
        }

      } else if (field.type === 'file') {
        if (field.required) {
          if (isEditing) {
            const hasExistingImage = editData?.image?.url || editData?.imagen_url;
            const hasNewImage = selectedFile;
            if (!hasExistingImage && !hasNewImage) {
              errors.push('Debes seleccionar una imagen');
            }
          } else {
            if (!selectedFile) {
              errors.push('La imagen es obligatoria');
            }
          }
        }
      }
    });

    // Si hay errores, mostrarlos y no continuar
    if (errors.length > 0) {
      errors.forEach(error => showError(error));
      return;
    }

    // Si todo está bien, proceder con el guardado
    const dataToSave = { ...formData };
    if (selectedFile) {
      dataToSave.image = selectedFile;
    }
    console.log('Datos a enviar desde modal:', dataToSave); // Debug
    onSave(dataToSave);
  };

  const handleClose = () => {
    setFormData({});
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const isFormValid = () => {
    return fields.filter(field => field.required).every(field => {
      if (field.type === 'file') {
        // La imagen es SIEMPRE obligatoria
        if (isEditing) {
          // En modo edición: debe tener una imagen existente O una nueva seleccionada
          const hasExistingImage = editData?.image?.url || editData?.imagen_url;
          const hasNewImage = selectedFile;
          return hasExistingImage || hasNewImage;
        } else {
          // En modo creación: debe tener una imagen seleccionada
          return selectedFile;
        }
      }
      return formData[field.name]?.toString().trim();
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl mt-16 sm:mt-20"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Cerrar"
            >
              <FiX size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Validar caracteres permitidos
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]*$/.test(value)) {
                      handleInputChange(field.name, value);
                    } else {
                      showWarning('Solo se permiten letras, números, espacios, guiones y puntos');
                    }
                  }}
                  onKeyPress={(e) => {
                    // Prevenir caracteres especiales
                    const char = String.fromCharCode(e.which);
                    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]/.test(char)) {
                      e.preventDefault();
                      showWarning('Caracter no permitido');
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder={field.placeholder}
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  min={field.min || 0}
                  step={field.step || 1}
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo permitir números, puntos decimales y el signo menos
                    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                      handleInputChange(field.name, value === '' ? 0 : parseFloat(value));
                    }
                  }}
                  onKeyPress={(e) => {
                    // Prevenir entrada de letras
                    const char = String.fromCharCode(e.which);
                    if (!/[\d\.\-]/.test(char)) {
                      e.preventDefault();
                      showWarning('Solo se permiten números');
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder={field.placeholder}
                />
              )}

              {field.type === 'select' && (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer transition-all text-sm sm:text-base"
                >
                  <option value="">Seleccionar {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'file' && (
                <div className="space-y-4">
                  {/* Área de subida de imagen estilizada */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-red-500 bg-red-50'
                        : 'border-red-300 hover:border-red-400 hover:bg-red-25'
                    }`}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    {previewUrl ? (
                      <div className="space-y-3 sm:space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mx-auto border-2 border-red-200"
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {selectedFile ? 'Nueva imagen seleccionada' : (isEditing ? 'Imagen actual' : 'Vista previa')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click para cambiar imagen</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                          <FiUpload size={20} className="text-red-500 sm:hidden" />
                          <FiUpload size={24} className="text-red-500 hidden sm:block" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base text-gray-700 font-medium">
                            {dragActive ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            JPG, PNG, WEBP, GIF hasta 5MB
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Mínimo 200x200px para categorías, 300x300px para productos
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mensaje de validación para campo requerido */}
                  {field.required && !selectedFile && !isEditing && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <span>⚠️</span>
                      La imagen es obligatoria
                    </p>
                  )}
                  
                  {field.required && !selectedFile && isEditing && !editData?.image?.url && !editData?.imagen_url && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <span>⚠️</span>
                      Debes seleccionar una imagen
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 sm:p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid() || loading}
              title={!isFormValid() ? 'Completa todos los campos obligatorios' : ''}
              className={`flex-1 px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base transition-colors ${
                !isFormValid() || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiSave size={16} />
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroModal;