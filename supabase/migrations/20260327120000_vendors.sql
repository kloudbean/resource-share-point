
-- Approved vendor directory (admin-managed; agents see active rows)
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  business_name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  website text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX vendors_category_idx ON public.vendors (lower(category));
CREATE INDEX vendors_active_sort_idx ON public.vendors (is_active, sort_order, business_name);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage vendors" ON public.vendors
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view active vendors" ON public.vendors
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
