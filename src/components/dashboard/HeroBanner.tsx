import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import heroImage from "@/assets/dashboard-hero.jpg";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface HeroBannerProps {
  agentName: string;
  avatarUrl: string | null;
  initials: string;
  recoNumber: string | null;
}

const HeroBanner = ({ agentName, avatarUrl, initials, recoNumber }: HeroBannerProps) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <img
        src={heroImage}
        alt="Dashboard banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      <div className="relative z-10 px-8 py-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-4 border-primary-foreground/30 shadow-lg">
            <AvatarImage src={avatarUrl || undefined} alt={agentName} />
            <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-primary-foreground/70 text-sm font-body">{greeting}</p>
            <h1 className="font-display text-3xl font-bold text-primary-foreground">
              {agentName}
            </h1>
            {recoNumber && (
              <p className="text-primary-foreground/60 text-sm mt-1">RECO# {recoNumber}</p>
            )}
          </div>
        </div>
        <img
          src={remaxLogo}
          alt="REMAX Excellence"
          className="h-12 w-auto brightness-0 invert opacity-60 hidden md:block"
        />
      </div>
    </div>
  );
};

export default HeroBanner;
