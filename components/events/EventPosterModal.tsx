'use client';

import Modal from '@/components/ui/Modal';
import EventPosterGenerator from '@/components/events/EventPosterGenerator';
import { MosqueEvent } from '@/types';

interface EventPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MosqueEvent | null;
  onPosterSaved?: (event: MosqueEvent, posterUrl: string) => void;
}

export default function EventPosterModal({
  isOpen,
  onClose,
  event,
  onPosterSaved,
}: EventPosterModalProps) {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Buat Poster — ${event.title}`}
      size="lg"
    >
      <EventPosterGenerator
        event={event}
        onPosterSaved={(url) => {
          onPosterSaved?.(event, url);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
