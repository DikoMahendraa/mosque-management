import { createClient } from '@/lib/supabase/client';
import { EventRegistration } from '@/types';

function mapRegistration(row: Record<string, unknown>): EventRegistration {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    name: String(row.name ?? ''),
    address: String(row.address ?? ''),
    age: Number(row.age ?? 0),
    phone: row.phone ? String(row.phone) : null,
    created_at: String(row.created_at ?? ''),
  };
}

export const eventRegistrationService = {
  async getByEventId(eventId: string): Promise<EventRegistration[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row: Record<string, unknown>) => mapRegistration(row));
  },
};
