import { supabase } from './supabase';
import { sendNotification } from './notificationService';

export interface ServiceOffer {
  id?: string;
  service_id: string;
  professional_id: string;
  user_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export async function createServiceOffer(offer: Omit<ServiceOffer, 'id' | 'status' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('service_offers')
      .insert([{ ...offer, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;

    // Notificar al usuario sobre la nueva oferta
    await sendNotification({
      user_id: offer.user_id,
      title: '¡Nueva oferta recibida!',
      message: `Has recibido una oferta por tu servicio.`, 
      type: 'offer_received',
      data: {
        offerId: data.id,
        serviceId: offer.service_id
      }
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error creating service offer:', error);
    return { data: null, error };
  }
}

export async function getServiceOffers(serviceId: string) {
  try {
    const { data, error } = await supabase
      .from('service_offers')
      .select(`
        *,
        professional:profiles(
          id,
          full_name,
          avatar_url,
          rating
        )
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting service offers:', error);
    return { data: null, error };
  }
}

export async function respondToOffer(offerId: string, status: 'accepted' | 'rejected') {
  try {
    // Obtener la oferta actual
    const { data: offer, error: offerError } = await supabase
      .from('service_offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError) throw offerError;

    // Actualizar el estado de la oferta
    const { data, error } = await supabase
      .from('service_offers')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', offerId)
      .select()
      .single();

    if (error) throw error;

    // Notificar al profesional sobre la respuesta
    const notificationMessage = status === 'accepted' 
      ? '¡Tu oferta ha sido aceptada!'
      : 'Lo sentimos, tu oferta ha sido rechazada.';

    await sendNotification({
      user_id: offer.professional_id,
      title: status === 'accepted' ? '¡Oferta Aceptada!' : 'Oferta Rechazada',
      message: notificationMessage,
      type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
      data: {
        offerId: offer.id,
        serviceId: offer.service_id,
        status
      }
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error responding to offer:', error);
    return { data: null, error };
  }
}

export async function getProfessionalOffers(professionalId: string) {
  try {
    const { data, error } = await supabase
      .from('service_offers')
      .select(`
        *,
        service:services(
          id,
          title,
          description,
          status
        )
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting professional offers:', error);
    return { data: null, error };
  }
}
