'use client';

import Input from '@/components/ui/Input';
import { KajianDonationCampaign, KajianDonationInput } from '@/types';

export const defaultKajianDonationInput: KajianDonationInput = {
  enabled: false,
  target_amount: 0,
  start_date: '',
  end_date: '',
};

interface KajianDonationFieldsProps {
  value: KajianDonationInput;
  onChange: (value: KajianDonationInput) => void;
  errors?: Partial<Record<keyof KajianDonationInput, string>>;
}

export default function KajianDonationFields({ value, onChange, errors }: KajianDonationFieldsProps) {
  const update = (patch: Partial<KajianDonationInput>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">Aktifkan Donasi</p>
          <p className="text-xs text-gray-500">Izinkan jamaah berdonasi untuk kajian ini</p>
        </div>
      </label>

      {value.enabled && (
        <div className="space-y-4 border-t border-rose-100 pt-4">
          <Input
            label="Target Donasi (Rp)"
            type="number"
            min={1}
            required
            value={value.target_amount || ''}
            onChange={(e) => update({ target_amount: Number(e.target.value) || 0 })}
            error={errors?.target_amount}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Mulai Pengumpulan"
              type="date"
              required
              value={value.start_date}
              onChange={(e) => update({ start_date: e.target.value })}
              error={errors?.start_date}
            />
            <Input
              label="Batas Akhir Donasi"
              type="date"
              required
              value={value.end_date}
              onChange={(e) => update({ end_date: e.target.value })}
              error={errors?.end_date}
            />
          </div>
          <p className="text-xs text-gray-500">
            Donasi hanya aktif dalam rentang tanggal di atas.
          </p>
        </div>
      )}
    </div>
  );
}

export function donationInputFromCampaign(
  campaign: KajianDonationCampaign | null | undefined
): KajianDonationInput {
  if (!campaign) return { ...defaultKajianDonationInput };
  return {
    enabled: true,
    target_amount: campaign.target_amount,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
  };
}

export function validateKajianDonationInput(input: KajianDonationInput): Partial<Record<keyof KajianDonationInput, string>> {
  if (!input.enabled) return {};

  const errors: Partial<Record<keyof KajianDonationInput, string>> = {};

  if (!input.target_amount || input.target_amount <= 0) {
    errors.target_amount = 'Target donasi wajib diisi';
  }
  if (!input.start_date) {
    errors.start_date = 'Tanggal mulai wajib diisi';
  }
  if (!input.end_date) {
    errors.end_date = 'Batas akhir wajib diisi';
  }
  if (input.start_date && input.end_date && input.end_date < input.start_date) {
    errors.end_date = 'Batas akhir harus setelah tanggal mulai';
  }

  return errors;
}
