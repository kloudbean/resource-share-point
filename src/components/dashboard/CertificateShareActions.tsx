import SocialShareIconRow from "@/components/share/SocialShareIconRow";

function buildShareText(agentName: string, reco: string, courseTitle: string) {
  return `I completed "${courseTitle}" — ${agentName} · RECO# ${reco} · REMAX Excellence Canada`;
}

interface CertificateShareActionsProps {
  agentName: string;
  reco: string;
  courseTitle: string;
  className?: string;
}

export default function CertificateShareActions({ agentName, reco, courseTitle, className }: CertificateShareActionsProps) {
  const text = buildShareText(agentName, reco, courseTitle);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className={className ?? ""}>
      <SocialShareIconRow preface={text} linkUrl={origin || undefined} className="justify-center" />
      <p className="mt-3 w-full text-center text-[11px] text-muted-foreground">
        Instagram: use <strong>Copy</strong>, then paste into a story or post.
      </p>
    </div>
  );
}
