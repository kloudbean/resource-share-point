
-- Events / Calendar
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  location text,
  event_type text NOT NULL DEFAULT 'general',
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active events" ON public.events FOR SELECT TO authenticated USING (is_active = true);

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'attending',
  notify_email boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, agent_id)
);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage own RSVPs" ON public.event_rsvps FOR ALL TO authenticated USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())) WITH CHECK (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all RSVPs" ON public.event_rsvps FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Training Courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'General',
  is_mandatory boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active courses" ON public.courses FOR SELECT TO authenticated USING (is_active = true);

-- Course Modules (videos + questionnaires)
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  module_type text NOT NULL DEFAULT 'video',
  video_url text,
  content jsonb,
  duration_minutes int,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage modules" ON public.course_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active modules" ON public.course_modules FOR SELECT TO authenticated USING (is_active = true);

-- Course Progress
CREATE TABLE public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  score int,
  watched_seconds int NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agent_id, module_id)
);
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage own progress" ON public.course_progress FOR ALL TO authenticated USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())) WITH CHECK (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all progress" ON public.course_progress FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Pre-Construction Projects
CREATE TABLE public.precon_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  developer text,
  location text,
  description text,
  price_range text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'selling',
  external_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.precon_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage precon" ON public.precon_projects FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active precon" ON public.precon_projects FOR SELECT TO authenticated USING (is_active = true);

-- Pre-Construction Assets
CREATE TABLE public.precon_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.precon_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  asset_type text NOT NULL DEFAULT 'general',
  file_url text NOT NULL,
  file_name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.precon_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage precon assets" ON public.precon_assets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active precon assets" ON public.precon_assets FOR SELECT TO authenticated USING (is_active = true);

-- Support Tickets
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage own tickets" ON public.support_tickets FOR ALL TO authenticated USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())) WITH CHECK (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Support Messages
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticket participants can view messages" ON public.support_messages FOR SELECT TO authenticated USING (
  ticket_id IN (SELECT id FROM support_tickets WHERE agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Authenticated can insert messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (
  ticket_id IN (SELECT id FROM support_tickets WHERE agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'admin')
);

-- Office Locations
CREATE TABLE public.office_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage locations" ON public.office_locations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active locations" ON public.office_locations FOR SELECT TO authenticated USING (is_active = true);

-- Meeting Rooms
CREATE TABLE public.meeting_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES public.office_locations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  capacity int,
  amenities text,
  is_virtual boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.meeting_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage rooms" ON public.meeting_rooms FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active rooms" ON public.meeting_rooms FOR SELECT TO authenticated USING (is_active = true);

-- Room Bookings
CREATE TABLE public.room_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.meeting_rooms(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  is_virtual boolean NOT NULL DEFAULT false,
  meeting_link text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage own bookings" ON public.room_bookings FOR ALL TO authenticated USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())) WITH CHECK (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all bookings" ON public.room_bookings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view all bookings" ON public.room_bookings FOR SELECT TO authenticated USING (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_bookings;

-- Storage bucket for course videos and precon assets
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('precon-assets', 'precon-assets', true);

-- Storage policies
CREATE POLICY "Admin upload course videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-videos' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view course videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'course-videos');
CREATE POLICY "Admin upload precon assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'precon-assets' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view precon assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'precon-assets');
