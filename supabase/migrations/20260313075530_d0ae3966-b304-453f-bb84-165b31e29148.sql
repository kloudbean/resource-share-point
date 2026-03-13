
-- Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active announcements" ON public.announcements
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Shared documents table
CREATE TABLE public.shared_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  category TEXT NOT NULL DEFAULT 'General',
  uploaded_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active documents" ON public.shared_documents
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage documents" ON public.shared_documents
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_documents_updated_at BEFORE UPDATE ON public.shared_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for shared documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete documents" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents' AND has_role(auth.uid(), 'admin'));

-- Enable realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
