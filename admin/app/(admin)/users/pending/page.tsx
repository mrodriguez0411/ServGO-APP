'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, UserStatus } from '@/lib/supabase';
import { getPendingUsers, updateUserStatus } from '@/lib/userService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckIcon, XMarkIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function PendingUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const pendingUsers = await getPendingUsers();
      setUsers(pendingUsers);
    } catch (err) {
      console.error('Error al cargar usuarios pendientes:', err);
      setError('Error al cargar los usuarios pendientes. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, status: UserStatus, reason?: string) => {
    try {
      setProcessing(userId);
      await updateUserStatus(userId, status, reason);
      // Recargar la lista de usuarios pendientes
      await loadPendingUsers();
    } catch (err) {
      console.error('Error al actualizar el estado del usuario:', err);
      setError('Error al actualizar el estado del usuario. Por favor, inténtalo de nuevo.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Usuarios Pendientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Revisa y gestiona las solicitudes de registro de nuevos usuarios.
          </p>
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios pendientes</h3>
                <p className="mt-1 text-sm text-gray-500">No hay solicitudes de registro pendientes en este momento.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Nombre
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Teléfono
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Fecha de registro
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {user.full_name}
                        <div className="mt-1 text-xs text-gray-500">
                          {user.user_type === 'provider' ? 'Proveedor' : 'Cliente'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.phone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(user.created_at), 'PPp', { locale: es })}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 space-x-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver detalles
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'approved')}
                          className="text-green-600 hover:text-green-900 ml-2"
                          disabled={processing === user.id}
                        >
                          {processing === user.id ? 'Procesando...' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Ingrese el motivo del rechazo:');
                            if (reason) {
                              handleUpdateStatus(user.id, 'rejected', reason);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 ml-2"
                          disabled={processing === user.id}
                        >
                          {processing === user.id ? 'Procesando...' : 'Rechazar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
