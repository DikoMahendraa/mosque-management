import { createClient } from '@/lib/supabase/client';
import { KajianDonationCampaign, KajianDonationInput } from '@/types';

function mapCampaign(row: Record<string, unknown>): KajianDonationCampaign {
  const start_date =
    typeof row.start_date === 'string' ? row.start_date.slice(0, 10) : String(row.start_date ?? '');
  const end_date =
    typeof row.end_date === 'string' ? row.end_date.slice(0, 10) : String(row.end_date ?? '');

  return {
    id: String(row.id),
    kajian_id: String(row.reference_id ?? ''),
    target_amount: Number(row.target_amount ?? 0),
    collected_amount: Number(row.collected_amount ?? 0),
    start_date,
    end_date,
    status: row.status as KajianDonationCampaign['status'],
  };
}

export const kajianDonationService = {
  async getByKajianIds(kajianIds: string[]): Promise<Map<string, KajianDonationCampaign>> {
    if (kajianIds.length === 0) return new Map();

    const supabase = createClient();
    const { data, error } = await supabase
      .from('donation_campaigns')
      .select('*')
      .eq('reference_type', 'kajian')
      .in('reference_id', kajianIds);

    if (error) throw new Error(error.message);

    return new Map(
      (data ?? []).map((row) => [
        String(row.reference_id),
        mapCampaign(row as Record<string, unknown>),
      ])
    );
  },

  async getByKajianId(kajianId: string): Promise<KajianDonationCampaign | null> {
    const map = await this.getByKajianIds([kajianId]);
    return map.get(kajianId) ?? null;
  },

  async upsertForKajian(
    kajianId: string,
    source: { title: string; description: string },
    donation: KajianDonationInput
  ): Promise<KajianDonationCampaign | null> {
    const existing = await this.getByKajianId(kajianId);

    if (!donation.enabled) {
      if (existing) {
        await this.delete(existing.id);
      }
      return null;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      title: source.title,
      description: source.description,
      reference_type: 'kajian' as const,
      reference_id: kajianId,
      target_amount: donation.target_amount,
      start_date: donation.start_date,
      end_date: donation.end_date,
      status: 'active' as const,
    };

    if (existing) {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapCampaign(data as Record<string, unknown>);
    }

    const { data, error } = await supabase
      .from('donation_campaigns')
      .insert({
        ...payload,
        ...(user ? { created_by: user.id } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapCampaign(data as Record<string, unknown>);
  },

  async delete(campaignId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('donation_campaigns').delete().eq('id', campaignId);
    if (error) throw new Error(error.message);
  },
};
