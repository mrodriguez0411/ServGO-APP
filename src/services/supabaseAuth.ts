import supabase from '../lib/supabase';
import { createUserProfile, UserProfile } from './userService';
import { uploadDocument } from './documentService';
import { requestSelfie } from './selfieService';

export type SignUpParams = {
  email: string;
  password: string;
  metadata: {
    full_name: string;
    phone: string;
    userType: 'client' | 'provider';
    direccion: {
      calle: string;
      numero: string;
      piso?: string;
      departamento?: string;
      codigoPostal: string;
      ciudad: string;
      provincia: string;
      pais: string;
    };
    documentos: Array<{
      tipo: 'id_front' | 'id_back' | 'selfie' | 'certification' | 'other';
      url: string;
      file?: any;
    }>;
    selfie?: {
      uri: string;
      type: string;
      name: string;
    };
  };
  onProgress?: (step: string) => void;
}

export async function signUpWithEmail({ email, password, metadata, onProgress }: SignUpParams) {
  // Validar datos requeridos
  if (!email || !password || !metadata?.full_name || !metadata?.phone || !metadata?.direccion) {
    throw new Error('Faltan campos requeridos para el registro');
  }
  
  // Validar campos de dirección requeridos
  const { direccion } = metadata;
  if (!direccion.calle || !direccion.numero || !direccion.codigoPostal || 
      !direccion.ciudad || !direccion.provincia || !direccion.pais) {
    throw new Error('Faltan campos obligatorios en la dirección');
  }
  try {
    onProgress?.('Verificando correo electrónico...');
    
    // 1. Verificar si ya existe un usuario con este correo
    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Ya existe un usuario registrado con este correo electrónico.');
      }
    } catch (error) {
      console.error('Error al verificar correo existente:', error);
      throw error instanceof Error ? error : new Error('Error al verificar el correo electrónico');
    }

    // 2. Registrar el usuario en Auth
    onProgress?.('Creando cuenta...');
    let authData;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            email: email.toLowerCase().trim(),
            full_name: metadata.full_name.trim(),
            phone: metadata.phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo crear el usuario');
      
      authData = data;
    } catch (error) {
      console.error('Error al registrar el usuario en Auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la cuenta';
      throw new Error(`Error al crear la cuenta: ${errorMessage}`);
    }

    // 3. Crear perfil en la base de datos
    onProgress?.('Creando perfil...');
    
    try {
      const { direccion } = metadata;
      const profileData: Partial<UserProfile> = {
        email: email.toLowerCase().trim(),
        nombre: metadata.full_name.trim(),
        telefono: metadata.phone.trim(),
        tipo: metadata.userType || 'client',
        // Campos de dirección
        direccion: `${direccion.calle} ${direccion.numero}`.trim(),
        piso: direccion.piso || null,
        departamento: direccion.departamento || null,
        codigo_postal: direccion.codigoPostal,
        ciudad: direccion.ciudad,
        provincia: direccion.provincia,
        pais: direccion.pais,
        // Estado de verificación
        estado: 'pending',
        is_active: false,
        is_verified: false,
        verification_status: 'pending',
        verification_step: 'documents',
      };

      // Crear perfil en la tabla usuarios
      await createUserProfile(authData.user!.id, profileData);
      
    } catch (error) {
      console.error('Error al crear el perfil del usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el perfil';
      throw new Error(`Error al crear el perfil: ${errorMessage}`);
    }
      
      // 4. Subir documentos de identificación
      if (metadata.documentos && metadata.documentos.length > 0) {
        onProgress?.('Subiendo documentos...');
        
        for (const doc of metadata.documentos) {
          try {
            // Si es un archivo, subirlo primero
            if (doc.file) {
              const filePath = `users/${authData.user!.id}/documents/${Date.now()}_${doc.tipo}.jpg`;
              const { error: uploadError } = await supabase.storage
                .from('user-documents')
                .upload(filePath, doc.file);
                
              if (uploadError) throw uploadError;
              
              // Obtener URL pública
              const { data: urlData } = supabase.storage
                .from('user-documents')
                .getPublicUrl(filePath);
                
              doc.url = urlData.publicUrl;
            }
            
            // Guardar en la base de datos
            await uploadDocument({
              user_id: authData.user!.id,
              tipo: doc.tipo,
              url: doc.url,
              estado: 'pending',
            });
          } catch (docError) {
            const errorMessage = docError instanceof Error ? docError.message : 'Error desconocido';
            console.error(`Error al subir documento ${doc.tipo}:`, errorMessage);
            // Continuar con otros documentos si uno falla
          }
        }
      }
      
      // 5. Subir selfie si está presente
      if (metadata.selfie) {
        onProgress?.('Subiendo selfie...');
        
        try {
          const filePath = `users/${authData.user!.id}/selfie_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('user-documents')
            .upload(filePath, metadata.selfie);
            
          if (uploadError) throw uploadError;
          
          // Obtener URL pública
          const { data: urlData } = supabase.storage
            .from('user-documents')
            .getPublicUrl(filePath);
            
          // Guardar selfie como un documento
          await uploadDocument({
            user_id: authData.user!.id,
            tipo: 'selfie',
            url: urlData.publicUrl,
            estado: 'pending',
          });
        } catch (selfieError) {
          const errorMessage = selfieError instanceof Error ? selfieError.message : 'Error desconocido al subir la selfie';
          console.error('Error al subir selfie:', errorMessage);
          throw new Error('Error al procesar la selfie. Por favor, inténtalo de nuevo.');
        }
      }

      // 6. Enviar código de verificación por SMS
      if (metadata.phone) {
        onProgress?.('Enviando código de verificación...');
        
        try {
          await sendVerificationSMS(metadata.phone);
        } catch (smsError) {
          const errorMessage = smsError instanceof Error ? smsError.message : 'Error desconocido';
          console.error('Error al enviar SMS de verificación:', errorMessage);
          // No fallar el registro si falla el SMS
        }
      }
      
      // 7. Actualizar paso de verificación
      await supabase
        .from('usuarios')
        .update({ verification_step: 'pending_approval' })
        .eq('id', authData.user!.id);
        
      return { 
        data: { 
          ...authData,
          requiresSelfie: !metadata.selfie 
        }, 
        error: null 
      };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el proceso de registro';
    console.error('Error en el proceso de registro:', errorMessage);
    
    // Intentar limpiar en caso de error
    try {
      if (authData?.user?.id) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('usuarios').delete().eq('id', authData.user.id);
      }
    } catch (cleanupError) {
      const cleanupErrorMessage = cleanupError instanceof Error ? cleanupError.message : 'Error desconocido';
      console.error('Error al limpiar después de un fallo:', cleanupErrorMessage);
    }
    
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error en signInWithEmail:', error.message);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al iniciar sesión';
    console.error('Error en signInWithEmail:', errorMessage);
    return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      throw error;
    }
    return { error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cerrar sesión';
    console.error('Error en signOut:', errorMessage);
    return { error: error instanceof Error ? error : new Error(errorMessage) };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener la sesión:', error.message);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener la sesión';
    console.error('Error en getSession:', errorMessage);
    return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
  }
}

// Enviar código de verificación por SMS
export async function sendVerificationSMS(phoneNumber: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-verification-sms', {
      body: { phone: phoneNumber },
    });

    if (error) {
      console.error('Error al enviar SMS de verificación:', error.message);
      throw error;
    }
    
    if (!data) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar SMS de verificación';
    console.error('Error en sendVerificationSMS:', errorMessage);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}

// Verificar código SMS
export async function verifySMSCode(phoneNumber: string, code: string) {
  try {
    const { data, error } = await supabase.functions.invoke('verify-sms-code', {
      body: { phone: phoneNumber, code },
    });

    if (error) {
      console.error('Error al verificar código SMS:', error.message);
      throw error;
    }

    if (!data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    // Actualizar estado de verificación del usuario
    if (data.valid) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          phone_verified: true,
          phone_verified_at: new Date().toISOString(),
          verification_step: 'documents', // Pasar al siguiente paso de verificación
        })
        .eq('telefono', phoneNumber);

      if (updateError) {
        console.error('Error al actualizar estado de verificación:', updateError.message);
        throw updateError;
      }
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al verificar código SMS';
    console.error('Error en verifySMSCode:', errorMessage);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}

// Subir documento de verificación
export async function uploadVerificationDocument(userId: string, file: File, type: string) {
  // Subir archivo a almacenamiento
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `verification/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error al subir documento:', uploadError.message);
      throw uploadError;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Guardar referencia en la tabla de documentos
    const { data: docData, error: docError } = await supabase
      .from('documentos')
      .insert([
        {
          user_id: userId,
          tipo: type as any,
          url: publicUrl,
          estado: 'pending',
        },
      ])
      .select()
      .single();

    if (docError) {
      console.error('Error al guardar referencia del documento:', docError.message);
      throw docError;
    }

    // Verificar si ya subió todos los documentos requeridos
    await checkVerificationStatus(userId);

    return docData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir documento de verificación';
    console.error('Error en uploadVerificationDocument:', errorMessage);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}

// Verificar estado de verificación del usuario
async function checkVerificationStatus(userId: string) {
  try {
    const { data: documents, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('user_id', userId)
      .eq('estado', 'pending');

    if (error) {
      console.error('Error al verificar documentos pendientes:', error.message);
      throw error;
    }

    // Si no hay documentos pendientes, actualizar estado de verificación
    if (documents.length === 0) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          verification_step: 'completed',
          verification_status: 'in_review',
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error al actualizar estado de verificación:', updateError.message);
        throw updateError;
      }
    }

    return documents;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al verificar estado de verificación';
    console.error('Error en checkVerificationStatus:', errorMessage);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => subscription.subscription.unsubscribe();
}
