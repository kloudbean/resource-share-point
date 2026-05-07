import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type WorksheetRequest = {
  projectName: string;
  modelName?: string;
  floorType?: string;
  directionExposure?: string;
  choices?: string[];
  needParking?: boolean;
  needLocker?: boolean;
  date?: string;
  additionalComments?: string;
  cooperatingBroker: {
    brokerageName: string;
    agentName?: string;
    agentEmail?: string;
    officePhone?: string;
    cellPhone?: string;
    recoNumber?: string;
  };
  purchasers: Array<Record<string, unknown>>;
  idAttachment: {
    filename: string;
    mimeType: string;
    contentBase64: string;
  };
  metadata?: {
    agentId?: string | null;
  };
};

function row(label: string, value: unknown): string {
  const v = value == null || value === "" ? "-" : String(value);
  return `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:600;">${label}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">${v}</td></tr>`;
}

async function sendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  attachment: WorksheetRequest["idAttachment"];
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      attachments: [
        {
          filename: params.attachment.filename || "client-id.png",
          content: params.attachment.contentBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email send failed: ${text}`);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("PRECON_WORKSHEET_ADMIN_EMAIL");
    const fromEmail = Deno.env.get("PRECON_WORKSHEET_FROM_EMAIL") || "onboarding@resend.dev";

    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured.");
    if (!adminEmail) throw new Error("PRECON_WORKSHEET_ADMIN_EMAIL is not configured.");

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized.");

    const payload: WorksheetRequest = await req.json();
    if (!payload.projectName?.trim()) throw new Error("Project name is required.");
    if (!payload.cooperatingBroker?.brokerageName?.trim()) throw new Error("Brokerage name is required.");
    if (!payload.idAttachment?.contentBase64) throw new Error("Client ID attachment is required.");

    const mime = payload.idAttachment.mimeType;
    if (mime !== "image/jpeg" && mime !== "image/png") {
      throw new Error("Attachment must be JPG or PNG.");
    }

    const purchaser1 = payload.purchasers?.[0] || {};
    const subject = `Pre-Con Worksheet: ${payload.projectName}`;
    const agentEmail = payload.cooperatingBroker.agentEmail || user.email;
    if (!agentEmail) throw new Error("Agent email missing.");

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#0f172a;">
        <h2 style="margin-bottom:8px;">Pre-Con Worksheet Submission</h2>
        <p style="margin-top:0;">Project: <strong>${payload.projectName}</strong></p>
        <table style="border-collapse:collapse;width:100%;max-width:900px;margin-top:8px;">
          ${row("Project", payload.projectName)}
          ${row("Model", payload.modelName)}
          ${row("Floor type", payload.floorType)}
          ${row("Direction / exposure", payload.directionExposure)}
          ${row("Need parking", payload.needParking ? "Yes" : "No")}
          ${row("Need locker", payload.needLocker ? "Yes" : "No")}
          ${row("Choices", (payload.choices || []).join(", "))}
          ${row("Date", payload.date)}
          ${row("Brokerage", payload.cooperatingBroker.brokerageName)}
          ${row("Agent name", payload.cooperatingBroker.agentName)}
          ${row("Agent email", payload.cooperatingBroker.agentEmail)}
          ${row("Office phone", payload.cooperatingBroker.officePhone)}
          ${row("Cell phone", payload.cooperatingBroker.cellPhone)}
          ${row("RECO #", payload.cooperatingBroker.recoNumber)}
          ${row("Purchaser 1", `${purchaser1["firstName"] || ""} ${purchaser1["lastName"] || ""}`.trim())}
          ${row("Purchaser 1 Email", purchaser1["email"])}
          ${row("Additional comments", payload.additionalComments)}
        </table>
        <p style="margin-top:12px;">Client ID image is attached to this email.</p>
      </div>
    `;

    await sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: adminEmail,
      subject: `${subject} (Admin Copy)`,
      html,
      attachment: payload.idAttachment,
    });

    await sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: agentEmail,
      subject: `${subject} (Agent Copy)`,
      html,
      attachment: payload.idAttachment,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

