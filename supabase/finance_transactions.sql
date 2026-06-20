CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  amount numeric(15, 2) NOT NULL CHECK (amount >= 0),
  date date NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS finance_transactions_updated_at ON public.finance_transactions;
CREATE TRIGGER finance_transactions_updated_at
  BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Authenticated users can update finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Authenticated users can delete finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can read permitted finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can insert permitted finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can update permitted finance_transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can delete permitted finance_transactions" ON public.finance_transactions;

CREATE POLICY "Users can read permitted finance_transactions"
  ON public.finance_transactions FOR SELECT
  TO authenticated
  USING (
    public.can_access_menu('finance')
    AND public.can_access_finance_category(category)
  );

CREATE POLICY "Users can insert permitted finance_transactions"
  ON public.finance_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_access_menu('finance')
    AND public.can_access_finance_category(category)
  );

CREATE POLICY "Users can update permitted finance_transactions"
  ON public.finance_transactions FOR UPDATE
  TO authenticated
  USING (
    public.can_access_menu('finance')
    AND public.can_access_finance_category(category)
  )
  WITH CHECK (
    public.can_access_menu('finance')
    AND public.can_access_finance_category(category)
  );

CREATE POLICY "Users can delete permitted finance_transactions"
  ON public.finance_transactions FOR DELETE
  TO authenticated
  USING (
    public.can_access_menu('finance')
    AND public.can_access_finance_category(category)
  );
