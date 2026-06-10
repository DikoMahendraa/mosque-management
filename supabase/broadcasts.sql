-- Create broadcast_messages table
CREATE TABLE public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type text NOT NULL, -- 'kajian' or 'event'
  reference_id uuid NOT NULL,   -- kajian_id or event_id
  title text NOT NULL,
  message text NOT NULL,
  recipient_type text NOT NULL DEFAULT 'all', -- 'all' or 'selected'
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'sending', 'completed', 'failed'
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

-- Create broadcast_recipients table
CREATE TABLE public.broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL REFERENCES public.broadcast_messages(id) ON DELETE CASCADE,
  jamaah_id uuid NOT NULL REFERENCES public.jamaah(id) ON DELETE CASCADE,
  jamaah_name text NOT NULL,
  jamaah_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER broadcast_messages_updated_at
  BEFORE UPDATE ON public.broadcast_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- RLS policies for broadcast_messages
CREATE POLICY "Authenticated users can read broadcast_messages"
  ON public.broadcast_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert broadcast_messages"
  ON public.broadcast_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update broadcast_messages"
  ON public.broadcast_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete broadcast_messages"
  ON public.broadcast_messages FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS policies for broadcast_recipients
CREATE POLICY "Authenticated users can read broadcast_recipients"
  ON public.broadcast_recipients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert broadcast_recipients"
  ON public.broadcast_recipients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update broadcast_recipients"
  ON public.broadcast_recipients FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_broadcast_messages_reference ON public.broadcast_messages(reference_type, reference_id);
CREATE INDEX idx_broadcast_messages_status ON public.broadcast_messages(status);
CREATE INDEX idx_broadcast_recipients_broadcast ON public.broadcast_recipients(broadcast_id);
CREATE INDEX idx_broadcast_recipients_status ON public.broadcast_recipients(status);
