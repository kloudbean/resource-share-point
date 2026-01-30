-- Table to store resource/button links (manageable by admin)
CREATE TABLE public.resource_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    drive_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track content views/clicks by agents
CREATE TABLE public.content_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
    resource_key VARCHAR(100) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    duration_seconds INTEGER DEFAULT 0,
    session_id VARCHAR(100)
);

-- Enable RLS
ALTER TABLE public.resource_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

-- Resource links policies - everyone can read, only admins can modify
CREATE POLICY "Anyone can view active resource links"
ON public.resource_links FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert resource links"
ON public.resource_links FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resource links"
ON public.resource_links FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resource links"
ON public.resource_links FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Content views policies
CREATE POLICY "Agents can insert their own views"
ON public.content_views FOR INSERT
WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can view their own activity"
ON public.content_views FOR SELECT
USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all content views"
ON public.content_views FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on resource_links
CREATE TRIGGER update_resource_links_updated_at
BEFORE UPDATE ON public.resource_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default resource links
INSERT INTO public.resource_links (resource_key, title, description, category) VALUES
('scripts', 'Scripts Library', 'Mike Ferry, Buyer/Seller, Objections & more', 'Resources'),
('training', 'Training Videos', 'Video tutorials and training content', 'Resources'),
('coaching', 'Coaching Materials', 'KN''s worksheets – PDF & Excel', 'Resources'),
('social', 'Social & Marketing', 'Social media assets and marketing materials', 'Marketing'),
('resale', 'Resale', 'Resale property marketing materials', 'Marketing'),
('preconstruction', 'Pre-Construction', 'Pre-construction project materials', 'Marketing'),
('educational', 'Educational', 'Educational content and guides', 'Marketing'),
('seasonal', 'Seasonal', 'Holiday and seasonal marketing content', 'Marketing'),
('personal-brand', 'Daily Life / Personal Brand', 'Personal branding and lifestyle content', 'Marketing'),
('email-templates', 'Email Templates', 'Pre-written email templates', 'Communications'),
('content-calendars', 'Content Calendars', 'Monthly content planning calendars', 'Communications'),
('marketing-support', 'Marketing Support', 'Request marketing assistance', 'Support'),
('deal-processing', 'Deal Processing', 'How to submit a deal & required documents', 'Support'),
('direct-deposit', 'Direct Deposit Info', 'Information required & process explained', 'Support'),
('vendors', 'Vendors', 'Approved vendor list and contacts', 'Support'),
('office-info', 'Office Information', 'Hours, address & contact details', 'Office'),
('meeting-room', 'Meeting Room Booking', 'Reserve meeting rooms', 'Office'),
('precon-portal', 'Pre-Construction Portal', 'Access the pre-con portal', 'Office');

-- Create index for faster analytics queries
CREATE INDEX idx_content_views_agent_id ON public.content_views(agent_id);
CREATE INDEX idx_content_views_resource_key ON public.content_views(resource_key);
CREATE INDEX idx_content_views_viewed_at ON public.content_views(viewed_at);