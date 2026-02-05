'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserProfile, UserStatus } from '@/lib/supabase';
import { getUserById, updateUserStatus } from '@/lib/userService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  XMarkIcon, 
  PencilIcon, 
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

declare module '@/lib/supabase' {
  interface UserProfile {
    license_url?: string;
    proof_of_address_url?: string;
  }
}

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching user with ID:', id);
      const userData = await getUserById(id as string);
      console.log('Fetched user data:', userData);
      setUser(userData);
      setFormData(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Could not load user information.');
    } finally {
      setLoading(false);
      console.log('Loading complete. User state:', user);
    }
  }, [id]);

  // Debug effect
  useEffect(() => {
    console.log('Component mounted or updated. Current state:', {
      user,
      loading,
      error,
      editing,
      formData,
      processing
    });
  }, [user, loading, error, editing, formData, processing]);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id, loadUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!user || !formData) return;
    
    try {
      setProcessing(true);
      // Update user data in the database
      const { data, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUser(data);
      setEditing(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error updating user information. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (status: UserStatus, reason?: string) => {
    if (!user) return;
    
    try {
      setProcessing(true);
      await updateUserStatus(user.id, status, reason);
      // Refresh user data
      await loadUser();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Error updating user status. Please try again.');
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Mapear el campo del formulario al tipo de documento
      const tipoMap: Record<string, string> = {
        'dni_front_url': 'id_front',
        'dni_back_url': 'id_back',
        'license_url': 'certification',
        'proof_of_address_url': 'other'
      };
      
      const tipo = tipoMap[field];
      if (!tipo) {
        throw new Error('Tipo de documento no válido');
      }

      // Subir el archivo al bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${tipo}_${Date.now()}.${fileExt}`;
      const filePath = `verification/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      // Insertar registro en la tabla documentos
      const { error: docError } = await supabase
        .from('documentos')
        .insert([{
          user_id: user.id,
          tipo: tipo,
          url: publicUrl,
          estado: 'pending',
          subido_en: new Date().toISOString()
        }]);

      if (docError) throw docError;

      // Actualizar el campo correspondiente en el perfil del usuario
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Recargar datos del usuario
      await loadUser();
      
    } catch (err: any) {
      console.error('Error al subir el archivo:', err);
      setError(err.message || 'Error al subir el archivo. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const renderEditableField = (label: string, name: string, type = 'text') => {
    const value = formData?.[name as keyof UserProfile]?.toString() || '';
    return (
      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {editing ? (
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          ) : (
            <span>{value || 'No especificado'}</span>
          )}
        </dd>
      </div>
    );
  };

  const renderDocumentUpload = (label: string, field: string, currentUrl?: string) => (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {currentUrl ? (
          <div className="space-y-2">
            <div className="border rounded-md overflow-hidden max-w-md">
              <Image
                src={currentUrl}
                alt={label}
                width={800}
                height={500}
                className="w-full h-auto"
              />
            </div>
            {editing && (
              <div className="mt-2">
                <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  <PhotoIcon className="h-4 w-4 mr-1" />
                  Cambiar {label}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, field)}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Subir {label}
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => handleFileUpload(e, field)}
                disabled={uploading}
              />
            </label>
          </div>
        )}
        {uploading && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </dd>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Debug information
  console.log('User data:', user);
  console.log('Editing mode:', editing);
  console.log('User has data?', !!user);
  console.log('User ID:', user?.id);
  console.log('User status:', user?.status);
  console.log('Edit button should be visible:', !editing);

  if (error || !user) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'User not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug panel that's always visible
  const DebugPanel = () => (
    <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
      <h3 className="text-sm font-medium text-yellow-400 mb-2">Debug Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-gray-400">User Data:</p>
          <pre className="mt-1 p-2 bg-gray-800 rounded text-green-400 overflow-x-auto">
            {JSON.stringify({
              id: user?.id,
              name: user?.full_name,
              email: user?.email,
              status: user?.status,
              role: user?.role
            }, null, 2)}
          </pre>
        </div>
        <div>
          <p className="text-gray-400">Component State:</p>
          <pre className="mt-1 p-2 bg-gray-800 rounded text-blue-400 overflow-x-auto">
            {JSON.stringify({
              loading,
              error,
              editing,
              processing,
              hasUser: !!user,
              formDataKeys: user ? Object.keys(formData) : []
            }, null, 2)}
          </pre>
        </div>
        <div>
          <p className="text-gray-400">Actions:</p>
          <div className="mt-1 space-y-2">
            <button
              onClick={() => setEditing(!editing)}
              className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              {editing ? 'Cancel Edit' : 'Enable Edit Mode'}
            </button>
            <button
              onClick={loadUser}
              className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Panel de depuración siempre visible */}
      <DebugPanel />
      
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Volver a la lista
        </button>
        
        <div className="flex space-x-3">
          {/* Botón forzado a ser visible */}
          <button
            onClick={() => setEditing(!editing)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar Usuario (Forzado)
          </button>
          
          {/* Mostrar estado actual */}
          <div className="px-4 py-2 text-sm text-gray-500">
            Estado: {loading ? 'Cargando...' : user ? 'Usuario cargado' : 'Sin usuario'}
          </div>
            
            {editing && (
              <button
                onClick={handleSaveChanges}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {processing ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            )}
          </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData?.full_name || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                ) : (
                  user.full_name
                )}
              </h3>
              <div className="mt-1 max-w-2xl text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusStyles[user.status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                </span>
              </div>
            </div>
            
            {user.status === 'pending' && (
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={processing || editing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing || editing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {renderEditableField('Email', 'email', 'email')}
            {renderEditableField('Phone', 'phone', 'tel')}
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">User Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.user_type === 'provider' ? 'Service Provider' : 'Client'}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(user.created_at), 'PPpp', { locale: es })}
              </dd>
            </div>

            {user.user_type === 'provider' && (
              <>
                {renderEditableField('Profession', 'profession')}
                {renderEditableField('Address', 'address')}
                {renderEditableField('City', 'city')}
                {renderEditableField('State/Province', 'province')}
                {renderEditableField('Postal Code', 'postal_code')}
                {renderEditableField('Country', 'country')}
                
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Verification Documents</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-6">
                    {renderDocumentUpload('ID Front', 'dni_front_url', user.dni_front_url)}
                    {renderDocumentUpload('ID Back', 'dni_back_url', user.dni_back_url)}
                    {renderDocumentUpload('Professional License', 'license_url', user.license_url)}
                    {renderDocumentUpload('Proof of Address', 'proof_of_address_url', user.proof_of_address_url)}
                  </dd>
                </div>

                {user.status === 'rejected' && user.rejection_reason && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                    <dd className="mt-1 text-sm text-red-600 sm:mt-0 sm:col-span-2">
                      {user.rejection_reason}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reject User
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please provide a reason for rejecting this user's application.
                    </p>
                    <div className="mt-4">
                      <textarea
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  onClick={() => handleUpdateStatus('rejected', rejectReason)}
                  disabled={!rejectReason.trim() || processing}
                >
                  {processing ? 'Processing...' : 'Reject User'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                          />
                        </div>
                      </div>
                    ) : (
                      <p>No se ha subido el dorso del DNI</p>
                    )}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Rechazar solicitud
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Por favor, ingresa el motivo del rechazo. El usuario recibirá esta información.
                    </p>
                    <div className="mt-4">
                      <textarea
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        placeholder="Motivo del rechazo..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  onClick={() => {
                    if (rejectReason.trim()) {
                      handleUpdateStatus('rejected', rejectReason);
                      setShowRejectModal(false);
                    }
                  }}
                  disabled={!rejectReason.trim() || processing}
                >
                  {processing ? 'Procesando...' : 'Confirmar rechazo'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
