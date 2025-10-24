'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { http } from '@/lib/http';
import { config } from '@/utils/config';
import RegistroModal from '@/components/RegistroModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validateCategoryImage, validateProductImage, formatFileSize } from '@/utils/file-validation';
import { FiImage, FiEye, FiCheck, FiX, FiCamera, FiEdit2, FiTrash2, FiSettings, FiPlus, FiSave, FiLogOut, FiClipboard, FiPaperclip } from 'react-icons/fi';
import { GiIceCreamCone } from 'react-icons/gi';
import { IoIceCream } from 'react-icons/io5';
import { FiTag } from 'react-icons/fi';
import { GiStrawberry } from 'react-icons/gi';
import { MdBlock, MdCheckCircle, MdAdminPanelSettings } from 'react-icons/md';

type TabKey = 'especialidades' | 'tipos' | 'sabores';

// Helper function to render tab icons
const renderTabIcon = (iconType: string) => {
  switch (iconType) {
    case 'tag':
      return <FiTag size={20} />;
    case 'ice-cream':
      return <IoIceCream size={20} />;
    case 'flavor':
      return <GiStrawberry size={20} />;
    default:
      return null;
  }
};

interface ImageInfo {
  id: number;
  uuid: string;
  filename: string;
  url: string;
  size: number;
  esta_activo: boolean;
  created_at: string;
}

interface Categoria {
  id: number;
  nombre: string;
  imagen_url?: string;
  esta_activo: boolean;
  image?: ImageInfo;
}

interface Producto {
  id: number;
  nombre: string;
  imagen_url?: string;
  precio_base: number | string; // Puede venir como string del backend
  esta_activo: boolean;
  categoria?: Categoria;
  image?: ImageInfo;
}

interface Sabor {
  id: number;
  nombre: string;
  esta_activo: boolean;
}

export default function AdminPage() {
  // Estados de autenticación (MANTENER INTACTO)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Estados de navegación
  const [activeTab, setActiveTab] = useState<TabKey>('especialidades');

  // Categorías (especialidades)
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [newCategoriaName, setNewCategoriaName] = useState('');

  // Productos (tipos de helado)
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [newProducto, setNewProducto] = useState({ nombre: '', precio_base: 0, categoriaId: 0 });

  // Sabores
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [loadingSabores, setLoadingSabores] = useState(false);
  const [newSaborName, setNewSaborName] = useState('');

  // Hook para toasts
  const { showSuccess, showError, showWarning } = useToast();
  
  // Hook para confirmaciones
  const { dialog, showConfirm, closeDialog } = useConfirm();

  // Hook para manejo de errores
  const { handleError, handleCrudError, handleValidationError, handleFileError } = useErrorHandler();

  // Helper functions para verificar duplicados
  const checkDuplicateCategoria = (nombre: string): boolean => {
    const trimmedNombre = nombre.trim().toLowerCase();
    return categorias.some(cat => cat.esta_activo && cat.nombre.toLowerCase() === trimmedNombre);
  };

  const checkDuplicateProducto = (nombre: string, categoriaId: number): boolean => {
    const trimmedNombre = nombre.trim().toLowerCase();
    return productos.some(prod => 
      prod.esta_activo &&
      prod.nombre.toLowerCase() === trimmedNombre && 
      prod.categoria?.id === categoriaId
    );
  };

  const checkDuplicateSabor = (nombre: string): boolean => {
    const trimmedNombre = nombre.trim().toLowerCase();
    return sabores.some(sabor => sabor.esta_activo && sabor.nombre.toLowerCase() === trimmedNombre);
  };

  // Helper functions para verificar duplicados en edición (excluyendo el item actual)
  const checkDuplicateCategoriaEdit = (nombre: string, excludeId: number): boolean => {
    const trimmedNombre = nombre.trim().toLowerCase();
    return categorias.some(cat => 
      cat.esta_activo &&
      cat.nombre.toLowerCase() === trimmedNombre && cat.id !== excludeId
    );
  };

  const checkDuplicateProductoEdit = (nombre: string, categoriaId: number, excludeId: number): boolean => {
    const trimmedNombre = nombre.trim().toLowerCase();
    return productos.some(prod => 
      prod.esta_activo &&
      prod.nombre.toLowerCase() === trimmedNombre && 
      prod.categoria?.id === categoriaId &&
      prod.id !== excludeId
    );
  };

  const checkDuplicateSaborEdit = (nombre: string, excludeId: number): boolean => {
    const trimmedNombre = nombre.trim().toLowerCase();
    return sabores.some(sabor => 
      sabor.esta_activo &&
      sabor.nombre.toLowerCase() === trimmedNombre && sabor.id !== excludeId
    );
  };

  // Modal para vista de imagen
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; title: string }>({
    isOpen: false,
    imageUrl: '',
    title: ''
  });

  // Helper para construir URLs completas de imágenes
  const getFullImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl; // Ya es URL completa
    }
    return `${config.baseUrl}${relativeUrl}`;
  };

  // Helper para formatear precios de manera segura
  const formatPrice = (price: any): string => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return '0.00';
    }
    // Redondear a 2 decimales para evitar problemas de precisión
    return (Math.round(numPrice * 100) / 100).toFixed(2);
  };

  // Estados para modales de registro
  const [registroModalConfig, setRegistroModalConfig] = useState<{
    isOpen: boolean;
    type: 'categoria' | 'producto' | 'sabor' | null;
    loading: boolean;
    isEditing: boolean;
    editData: any;
  }>({
    isOpen: false,
    type: null,
    loading: false,
    isEditing: false,
    editData: null
  });

  // Verificar autenticación al cargar la página (MANTENER INTACTO)
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    } else {
      router.replace('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  // Hacer el navbar fijo solo en admin
  useEffect(() => {
    if (!isAuthenticated) return;

    const header = document.querySelector<HTMLElement>('header');
    const main = document.querySelector<HTMLElement>('main');

    if (header) {
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.left = '0';
      header.style.right = '0';
      header.style.zIndex = '9999';
      header.style.width = '100%';
    }
    if (main) main.style.paddingTop = '0';

    return () => {
      if (header) {
        header.style.position = '';
        header.style.top = '';
        header.style.left = '';
        header.style.right = '';
        header.style.zIndex = '';
        header.style.width = '';
      }
      if (main) main.style.paddingTop = '';
    };
  }, [isAuthenticated]);

  // useEffect para cargar datos cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategorias();
      fetchProductos();
      fetchSabores();
    }
  }, [isAuthenticated]);

  // Early returns (MANTENER INTACTO)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Fetchers
  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const data = await http<Categoria[]>('/categoria');
      setCategorias(data);
    } catch (e) {
      handleCrudError('obtener', 'las categorías')(e);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      const data = await http<Producto[]>('/producto');
      setProductos(data);
    } catch (e) {
      handleCrudError('obtener', 'los productos')(e);
    } finally {
      setLoadingProductos(false);
    }
  };

  const fetchSabores = async () => {
    try {
      setLoadingSabores(true);
      const data = await http<Sabor[]>('/sabor');
      setSabores(data);
    } catch (e) {
      handleCrudError('obtener', 'los sabores')(e);
    } finally {
      setLoadingSabores(false);
    }
  };

  // Función para abrir modal de imagen
  const openImageModal = (imageUrl: string, title: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      title
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      title: ''
    });
  };

  // CRUD Categorías
  // Funciones para manejar modales de registro
  const openRegistroModal = (type: 'categoria' | 'producto' | 'sabor') => {
    setRegistroModalConfig({ 
      isOpen: true, 
      type, 
      loading: false, 
      isEditing: false, 
      editData: null 
    });
  };

  const openEditModal = (type: 'categoria' | 'producto' | 'sabor', editData: any) => {
    setRegistroModalConfig({ 
      isOpen: true, 
      type, 
      loading: false, 
      isEditing: true, 
      editData 
    });
  };

  const closeRegistroModal = () => {
    setRegistroModalConfig({ 
      isOpen: false, 
      type: null, 
      loading: false, 
      isEditing: false, 
      editData: null 
    });
    // Limpiar estados de formulario
    setNewCategoriaName('');
    setNewProducto({ nombre: '', precio_base: 0, categoriaId: 0 });
    setNewSaborName('');
  };

  const handleModalSave = async (data: any) => {
    console.log('🔄 Modal save iniciado con data:', data);
    console.log('🔄 Modal config:', registroModalConfig);
    
    setRegistroModalConfig(prev => ({ ...prev, loading: true }));
    
    try {
      if (registroModalConfig.isEditing) {
        console.log('✏️ Modo edición detectado');
        // Modo edición
        switch (registroModalConfig.type) {
          case 'categoria':
            console.log('📝 Actualizando categoría...');
            await handleUpdateCategoriaFromModal(data);
            break;
          case 'producto':
            console.log('📝 Actualizando producto...');
            await handleUpdateProductoFromModal(data);
            break;
          case 'sabor':
            console.log('📝 Actualizando sabor...');
            await handleUpdateSaborFromModal(data);
            break;
        }
      } else {
        console.log('➕ Modo creación detectado');
        // Modo creación
        switch (registroModalConfig.type) {
          case 'categoria':
            console.log('📝 Creando categoría...');
            await handleCreateCategoriaFromModal(data);
            break;
          case 'producto':
            console.log('📝 Creando producto...');
            await handleCreateProductoFromModal(data);
            break;
          case 'sabor':
            console.log('📝 Creando sabor...');
            await handleCreateSaborFromModal(data);
            break;
        }
      }
      console.log('✅ Operación completada exitosamente');
      closeRegistroModal();
    } catch (error) {
      console.error('❌ Error en modal save:', error);
      setRegistroModalConfig(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateCategoriaFromModal = async (data: any) => {
    if (!data.nombre?.trim()) {
      handleValidationError(new Error('El nombre de la categoría es obligatorio'));
      return;
    }
    
    // Verificar duplicados del lado del cliente
    if (checkDuplicateCategoria(data.nombre.trim())) {
      handleValidationError(new Error(`Ya existe una categoría con el nombre "${data.nombre.trim()}"`));
      return;
    }
    
    try {
      const response = await http<{ id: number }>('/categoria', {
        method: 'POST',
        body: JSON.stringify({ nombre: data.nombre.trim(), esta_activo: true }),
      });

      if (data.image && response.id) {
        await handleUploadCategoriaImage(response.id, data.image);
      }

      await fetchCategorias();
      showSuccess('Especialidad creada exitosamente');
    } catch (error) {
      handleCrudError('crear', 'la especialidad')(error);
      throw error;
    }
  };

  const handleCreateProductoFromModal = async (data: any) => {
    console.log('🔄 handleCreateProductoFromModal iniciado:', data);
    
    if (!data.nombre?.trim() || data.precio_base <= 0 || !data.categoriaId) {
      const errorMsg = !data.nombre?.trim() 
        ? 'El nombre del producto es obligatorio'
        : data.precio_base <= 0 
        ? 'El precio debe ser mayor a 0'
        : 'Debes seleccionar una categoría';
      
      handleValidationError(new Error(errorMsg));
      return;
    }
    
    // Verificar duplicados del lado del cliente
    if (checkDuplicateProducto(data.nombre.trim(), data.categoriaId)) {
      handleValidationError(new Error(`Ya existe un producto con el nombre "${data.nombre.trim()}" en esta categoría`));
      return;
    }
    
    try {
      console.log('📡 Enviando POST a producto...');
      const response = await http<{ id: number }>('/producto', {
        method: 'POST',
        body: JSON.stringify({
          nombre: data.nombre.trim(),
          precio_base: data.precio_base,
          categoria_id: data.categoriaId,
          esta_activo: true
        }),
      });
      console.log('✅ POST producto exitoso, ID:', response.id);

      if (data.image && response.id) {
        console.log('📸 Subiendo imagen de producto...');
        await handleUploadProductoImage(response.id, data.image);
        console.log('✅ Imagen de producto subida');
      }

      await fetchProductos();
      showSuccess('Tipo de helado creado exitosamente');
    } catch (error) {
      handleCrudError('crear', 'el tipo de helado')(error);
      throw error;
    }
  };

  const handleCreateSaborFromModal = async (data: any) => {
    console.log('🔄 handleCreateSaborFromModal iniciado:', data);
    
    if (!data.nombre?.trim()) {
      handleValidationError(new Error('El nombre del sabor es obligatorio'));
      return;
    }
    
    // Verificar duplicados del lado del cliente
    if (checkDuplicateSabor(data.nombre.trim())) {
      handleValidationError(new Error(`Ya existe un sabor con el nombre "${data.nombre.trim()}"`));
      return;
    }
    
    try {
      console.log('📡 Enviando POST a sabor...');
      await http('/sabor', {
        method: 'POST',
        body: JSON.stringify({ nombre: data.nombre.trim(), esta_activo: true }),
      });
      console.log('✅ POST sabor exitoso');

      await fetchSabores();
      showSuccess('Sabor creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando sabor:', error);
      handleCrudError('crear', 'el sabor')(error);
      throw error;
    }
  };

  // Funciones de actualización para modales
  const handleUpdateCategoriaFromModal = async (data: any) => {
    console.log('🔄 handleUpdateCategoriaFromModal iniciado:', data);
    console.log('🔄 editData ID:', registroModalConfig.editData?.id);
    
    if (!data.nombre?.trim() || !registroModalConfig.editData?.id) {
      handleValidationError(new Error('El nombre de la categoría es obligatorio'));
      return;
    }
    
    // Verificar duplicados del lado del cliente (excluyendo el item actual)
    if (checkDuplicateCategoriaEdit(data.nombre.trim(), registroModalConfig.editData.id)) {
      handleValidationError(new Error(`Ya existe una categoría con el nombre "${data.nombre.trim()}"`));
      return;
    }
    
    try {
      console.log('📡 Enviando PATCH a categoria...');
      await http(`/categoria/${registroModalConfig.editData.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nombre: data.nombre.trim(),
          esta_activo: data.esta_activo === 'true'
        }),
      });
      console.log('✅ PATCH categoria exitoso');

      // Si hay nueva imagen, subirla
      if (data.image && data.image instanceof File) {
        console.log('📸 Subiendo nueva imagen...');
        await handleUploadCategoriaImage(registroModalConfig.editData.id, data.image);
        console.log('✅ Imagen subida exitosamente');
      }

      console.log('🔄 Refrescando categorías...');
      await fetchCategorias();
      showSuccess('Especialidad actualizada exitosamente');
    } catch (error) {
      console.error('❌ Error actualizando categoría:', error);
      handleCrudError('actualizar', 'la especialidad')(error);
      throw error;
    }
  };

  const handleUpdateProductoFromModal = async (data: any) => {
    console.log('🔄 handleUpdateProductoFromModal iniciado:', data);
    console.log('🔄 editData ID:', registroModalConfig.editData?.id);
    
    if (!data.nombre?.trim() || !registroModalConfig.editData?.id) {
      console.error('❌ Validación de actualización de producto fallida:', { 
        nombre: data.nombre, 
        id: registroModalConfig.editData?.id 
      });
      handleValidationError(new Error('El nombre del producto es obligatorio'));
      return;
    }
    
    // Verificar duplicados del lado del cliente (excluyendo el item actual)
    if (checkDuplicateProductoEdit(data.nombre.trim(), data.categoriaId, registroModalConfig.editData.id)) {
      handleValidationError(new Error(`Ya existe un producto con el nombre "${data.nombre.trim()}" en esta categoría`));
      return;
    }
    
    try {
      console.log('📡 Enviando PATCH a producto...');
      await http(`/producto/${registroModalConfig.editData.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nombre: data.nombre.trim(),
          precio_base: data.precio_base,
          categoria_id: data.categoriaId,
          esta_activo: data.esta_activo === 'true'
        }),
      });
      console.log('✅ PATCH producto exitoso');

      // Si hay nueva imagen, subirla
      if (data.image && data.image instanceof File) {
        console.log('📸 Subiendo nueva imagen de producto...');
        await handleUploadProductoImage(registroModalConfig.editData.id, data.image);
        console.log('✅ Imagen de producto actualizada');
      }

      await fetchProductos();
      showSuccess('Tipo de helado actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      handleCrudError('actualizar', 'el tipo de helado')(error);
      throw error;
    }
  };

  const handleUpdateSaborFromModal = async (data: any) => {
    console.log('🔄 handleUpdateSaborFromModal iniciado:', data);
    console.log('🔄 editData ID:', registroModalConfig.editData?.id);
    
    if (!data.nombre?.trim() || !registroModalConfig.editData?.id) {
      console.error('❌ Validación de actualización de sabor fallida:', { 
        nombre: data.nombre, 
        id: registroModalConfig.editData?.id 
      });
      handleValidationError(new Error('El nombre del sabor es obligatorio'));
      return;
    }
    
    // Verificar duplicados del lado del cliente (excluyendo el item actual)
    if (checkDuplicateSaborEdit(data.nombre.trim(), registroModalConfig.editData.id)) {
      handleValidationError(new Error(`Ya existe un sabor con el nombre "${data.nombre.trim()}"`));
      return;
    }
    
    try {
      console.log('📡 Enviando PATCH a sabor...');
      await http(`/sabor/${registroModalConfig.editData.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nombre: data.nombre.trim(),
          esta_activo: data.esta_activo === 'true'
        }),
      });
      console.log('✅ PATCH sabor exitoso');

      await fetchSabores();
      showSuccess('Sabor actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error actualizando sabor:', error);
      handleCrudError('actualizar', 'el sabor')(error);
      throw error;
    }
  };

  // Configuraciones de campos para los modales
  const getModalConfig = () => {
    const isEditing = registroModalConfig.isEditing;
    
    switch (registroModalConfig.type) {
      case 'categoria':
        return {
          title: isEditing ? 'Editar Especialidad' : 'Registrar Nueva Especialidad',
          fields: [
            {
              name: 'nombre',
              label: 'Nombre de la Especialidad',
              type: 'text' as const,
              placeholder: 'Ej: Helados Premium',
              required: true
            },
            {
              name: 'image',
              label: 'Imagen',
              type: 'file' as const,
              required: true
            }
          ]
        };
      case 'producto':
        return {
          title: isEditing ? 'Editar Tipo de Helado' : 'Registrar Nuevo Tipo de Helado',
          fields: [
            {
              name: 'nombre',
              label: 'Nombre del Tipo',
              type: 'text' as const,
              placeholder: 'Ej: Cono Simple, Copa Doble',
              required: true
            },
            {
              name: 'precio_base',
              label: 'Precio Base (Q)',
              type: 'number' as const,
              placeholder: '15.00',
              min: 0.01,
              step: 0.25,
              required: true
            },
            {
              name: 'categoriaId',
              label: 'Especialidad',
              type: 'select' as const,
              required: true,
              options: categorias.filter(cat => cat.esta_activo).map(cat => ({
                value: cat.id,
                label: cat.nombre
              }))
            },
            {
              name: 'image',
              label: 'Imagen',
              type: 'file' as const,
              required: true
            }
          ]
        };
      case 'sabor':
        return {
          title: isEditing ? 'Editar Sabor' : 'Registrar Nuevo Sabor',
          fields: [
            {
              name: 'nombre',
              label: 'Nombre del Sabor',
              type: 'text' as const,
              placeholder: 'Ej: Chocolate, Vainilla, Fresa',
              required: true
            }
          ]
        };
      default:
        return { title: '', fields: [] };
    }
  };

  // Funciones para subir imágenes (usadas por el modal unificado)
  const handleUploadCategoriaImage = async (categoriaId: number, file: File) => {
    try {
      // Verificar que el archivo sea válido
      if (!file || !(file instanceof File)) {
        throw new Error('Archivo inválido');
      }

      // Validar archivo del lado del cliente
      const validationResult = await validateCategoryImage(file);
      
      if (!validationResult.isValid) {
        handleFileError(new Error(validationResult.error || 'Archivo inválido'));
        throw new Error(validationResult.error || 'Archivo inválido');
      }

      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${config.apiUrl}/images/upload/categoria/${categoriaId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        let errorMessage = 'Error al subir la imagen';
        
        if (response.status === 413) {
          errorMessage = `El archivo es demasiado grande (${formatFileSize(file.size)}). Tamaño máximo permitido: 5MB`;
        } else if (response.status === 415) {
          errorMessage = 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)';
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = 'Datos del archivo inválidos';
          }
        }
        
        handleFileError(new Error(errorMessage));
        throw new Error(errorMessage);
      }
      
      const imageData = await response.json();
      console.log('Image uploaded successfully:', imageData);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Solo re-lanzar el error si no ha sido manejado ya
      if (error instanceof Error && !error.message.includes('Archivo')) {
        handleFileError(error);
      }
      
      throw error;
    }
  };

  const handleUploadProductoImage = async (productoId: number, file: File) => {
    try {
      // Verificar que el archivo sea válido
      if (!file || !(file instanceof File)) {
        throw new Error('Archivo inválido');
      }

      // Validar archivo del lado del cliente
      const validationResult = await validateProductImage(file);
      
      if (!validationResult.isValid) {
        handleFileError(new Error(validationResult.error || 'Archivo inválido'));
        throw new Error(validationResult.error || 'Archivo inválido');
      }

      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${config.apiUrl}/images/upload/producto/${productoId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        let errorMessage = 'Error al subir la imagen';
        
        if (response.status === 413) {
          errorMessage = `El archivo es demasiado grande (${formatFileSize(file.size)}). Tamaño máximo permitido: 5MB`;
        } else if (response.status === 415) {
          errorMessage = 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)';
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = 'Datos del archivo inválidos';
          }
        }
        
        handleFileError(new Error(errorMessage));
        throw new Error(errorMessage);
      }
      
      const imageData = await response.json();
      console.log('Image uploaded successfully:', imageData);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Solo re-lanzar el error si no ha sido manejado ya
      if (error instanceof Error && !error.message.includes('Archivo')) {
        handleFileError(error);
      }
      
      throw error;
    }
  };

  const handleDeleteCategoria = async (categoria: Categoria) => {
    showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la especialidad "${categoria.nombre}"? Se marcará como inactiva.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
      onConfirm: async () => {
        try {
          await http(`/categoria/${categoria.id}`, { 
            method: 'PATCH',
            body: JSON.stringify({ esta_activo: false })
          });
          await fetchCategorias();
          showSuccess('Especialidad eliminada exitosamente');
        } catch (error) {
          handleCrudError('eliminar', 'la especialidad')(error);
        }
      }
    });
  };

  // CRUD Sabores
  const handleCreateSabor = async () => {
    if (!newSaborName.trim()) return;
    try {
      await http('/sabor', {
        method: 'POST',
        body: JSON.stringify({ nombre: newSaborName.trim(), esta_activo: true }),
      });

      setNewSaborName('');
      await fetchSabores();
      showSuccess('Sabor creado exitosamente');
    } catch (error) {
      handleCrudError('crear', 'el sabor')(error);
    }
  };

  const handleDeleteSabor = async (sabor: Sabor) => {
    showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el sabor "${sabor.nombre}"? Se marcará como inactivo.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
      onConfirm: async () => {
        try {
          await http(`/sabor/${sabor.id}`, { 
            method: 'PATCH',
            body: JSON.stringify({ esta_activo: false })
          });
          await fetchSabores();
          showSuccess('Sabor eliminado exitosamente');
        } catch (error) {
          handleCrudError('eliminar', 'el sabor')(error);
        }
      }
    });
  };

  // CRUD Productos - Solo función de eliminación (create y update están en el modal)
  const handleDeleteProducto = async (producto: Producto) => {
    showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"? Se marcará como inactivo.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
      onConfirm: async () => {
        try {
          await http(`/producto/${producto.id}`, { 
            method: 'PATCH',
            body: JSON.stringify({ esta_activo: false })
          });
          await fetchProductos();
          showSuccess('Producto eliminado exitosamente');
        } catch (error) {
          handleCrudError('eliminar', 'el producto')(error);
        }
      }
    });
  };

  return (
    <>
      <div className="admin-page-container min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Espaciador para no tapar por el navbar fijo */}
          <div className="h-20 sm:h-24 lg:h-28" />
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <MdAdminPanelSettings size={24} className="text-red-600 sm:hidden" />
                  <MdAdminPanelSettings size={28} className="text-red-600 hidden sm:block" />
                  Panel de Administración
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Helado Express - Sistema de Gestión Integral</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sessionStorage.removeItem('admin_logged_in');
                    router.replace('/login');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <FiLogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {[
                  { key: 'especialidades', label: 'Especialidades', icon: 'tag' },
                  { key: 'tipos', label: 'Tipos de Helado', icon: 'ice-cream' },
                  { key: 'sabores', label: 'Sabores', icon: 'flavor' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key as TabKey);
                    }}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-b-2 border-red-500 text-red-600 bg-red-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base sm:text-lg">
                      {renderTabIcon(tab.icon)}
                    </span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.key === 'especialidades' ? 'Esp.' : tab.key === 'tipos' ? 'Tipos' : 'Sabores'}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">{/* ESPECIALIDADES CONTENT */}
              {activeTab === 'especialidades' && (
                <div className="space-y-8">
                  {/* Vista de registros existentes */}
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Especialidades Registradas</h2>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total: {categorias.length} especialidades
                      </div>
                    </div>

                    {loadingCategorias ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : categorias.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <FiTag size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay especialidades registradas</h3>
                        <p className="text-gray-500 mb-6">
                          Comienza creando tu primera especialidad de helados.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {categorias.map((categoria) => (
                          <div key={categoria.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{categoria.nombre}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {categoria.esta_activo ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <MdCheckCircle size={10} className="sm:hidden" />
                                      <MdCheckCircle size={12} className="hidden sm:block" />
                                      <span className="hidden sm:inline">Activo</span>
                                      <span className="sm:hidden">Act.</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <MdBlock size={10} className="sm:hidden" />
                                      <MdBlock size={12} className="hidden sm:block" />
                                      <span className="hidden sm:inline">Inactivo</span>
                                      <span className="sm:hidden">Inact.</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              {categoria.image && (
                                <div className="ml-2 sm:ml-3 flex-shrink-0">
                                  <img
                                    src={getFullImageUrl(categoria.image.url)}
                                    alt={categoria.nombre}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    title={`Click para ver imagen de ${categoria.nombre}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (categoria.image) {
                                        openImageModal(getFullImageUrl(categoria.image.url), categoria.nombre);
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal('categoria', categoria)}
                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FiEdit2 size={12} className="sm:hidden" />
                                <FiEdit2 size={14} className="hidden sm:block" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCategoria(categoria)}
                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500 text-white text-xs sm:text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FiTrash2 size={12} className="sm:hidden" />
                                <FiTrash2 size={14} className="hidden sm:block" />
                                <span className="hidden sm:inline">Eliminar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botón para abrir modal de registro */}
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button
                      onClick={() => openRegistroModal('categoria')}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer group"
                      title="Registrar Nueva Especialidad"
                    >
                      <FiPlus size={20} className="text-white group-hover:rotate-90 transition-transform duration-200 sm:hidden" />
                      <FiPlus size={24} className="text-white group-hover:rotate-90 transition-transform duration-200 hidden sm:block" />
                    </button>
                  </div>
                </div>
              )}

              {/* TIPOS DE HELADO CONTENT */}
              {activeTab === 'tipos' && (
                <div className="space-y-8">
                  {/* Vista de registros existentes */}
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Tipos de Helado Registrados</h2>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total: {productos.length} productos
                      </div>
                    </div>

                    {loadingProductos ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : productos.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <IoIceCream size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tipos de helado registrados</h3>
                        <p className="text-gray-500 mb-6">
                          Crea tu primer tipo de helado para comenzar a gestionar tu inventario.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productos.map((producto) => (
                          <div key={producto.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  Precio base: <span className="font-medium text-green-600">Q{formatPrice(producto.precio_base)}</span>
                                </p>
                                {producto.categoria && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Categoría: {producto.categoria.nombre}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {producto.esta_activo ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <MdCheckCircle size={12} />
                                      Activo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <MdBlock size={12} />
                                      Inactivo
                                    </span>
                                  )}
                                </div>
                              </div>
                              {producto.image && (
                                <div className="ml-3">
                                  <img
                                    src={getFullImageUrl(producto.image.url)}
                                    alt={producto.nombre}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    title={`Click para ver imagen de ${producto.nombre}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (producto.image) {
                                        openImageModal(getFullImageUrl(producto.image.url), producto.nombre);
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal('producto', producto)}
                                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FiEdit2 size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteProducto(producto)}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FiTrash2 size={14} />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botón para abrir modal de registro */}
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button
                      onClick={() => openRegistroModal('producto')}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer group"
                      title="Registrar Nuevo Tipo de Helado"
                    >
                      <FiPlus size={20} className="text-white group-hover:rotate-90 transition-transform duration-200 sm:hidden" />
                      <FiPlus size={24} className="text-white group-hover:rotate-90 transition-transform duration-200 hidden sm:block" />
                    </button>
                  </div>
                </div>
              )}

              {/* SABORES CONTENT */}
              {activeTab === 'sabores' && (
                <div className="space-y-8">
                  {/* Vista de registros existentes */}
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Sabores Registrados</h2>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total: {sabores.length} sabores
                      </div>
                    </div>

                    {loadingSabores ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : sabores.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <GiStrawberry size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sabores registrados</h3>
                        <p className="text-gray-500 mb-6">
                          Agrega tu primer sabor para comenzar a ofrecer diferentes opciones a tus clientes.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sabores.map((sabor) => (
                          <div key={sabor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{sabor.nombre}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {sabor.esta_activo ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <MdCheckCircle size={12} />
                                      Activo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <MdBlock size={12} />
                                      Inactivo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal('sabor', sabor)}
                                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FiEdit2 size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteSabor(sabor)}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FiTrash2 size={14} />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botón para abrir modal de registro */}
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button
                      onClick={() => openRegistroModal('sabor')}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer group"
                      title="Registrar Nuevo Sabor"
                    >
                      <FiPlus size={20} className="text-white group-hover:rotate-90 transition-transform duration-200 sm:hidden" />
                      <FiPlus size={24} className="text-white group-hover:rotate-90 transition-transform duration-200 hidden sm:block" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Categoria Modal */}
      {/* Modal de Imagen */}
      {imageModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <img
              src={imageModal.imageUrl}
              alt={imageModal.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all cursor-pointer"
              title="Cerrar"
            >
              <FiX size={24} />
            </button>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
              {imageModal.title}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {registroModalConfig.isOpen && (
        <RegistroModal
          isOpen={registroModalConfig.isOpen}
          onClose={closeRegistroModal}
          title={getModalConfig().title}
          fields={getModalConfig().fields}
          onSave={handleModalSave}
          loading={registroModalConfig.loading}
          editData={registroModalConfig.editData}
          isEditing={registroModalConfig.isEditing}
        />
      )}

      {/* Confirm Dialog */}
      {dialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={closeDialog}
          onConfirm={dialog.onConfirm}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          danger={dialog.danger}
        />
      )}
    </>
  );
}