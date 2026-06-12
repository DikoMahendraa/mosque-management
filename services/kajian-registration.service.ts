import { createClient } from '@/lib/supabase/client';
import { KajianRegistration } from '@/types';

function mapRegistration(row: Record<string, unknown>): KajianRegistration {
  return {
    id: String(row.id),
    kajian_id: String(row.kajian_id),
    name: String(row.name ?? ''),
    address: String(row.address ?? ''),
    age: Number(row.age ?? 0),
    phone: row.phone ? String(row.phone) : null,
    created_at: String(row.created_at ?? ''),
  };
}

export const kajianRegistrationService = {
  async getByKajianId(kajianId: string): Promise<KajianRegistration[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('kajian_registrations')
      .select('*')
      .eq('kajian_id', kajianId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row: Record<string, unknown>) => mapRegistration(row));
  },
};
