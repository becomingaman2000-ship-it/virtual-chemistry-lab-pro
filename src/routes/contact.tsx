import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ChemVM" },
      { name: "description", content: "Ask about plans, report a problem, or request an account upgrade." },
    ],
  }),
  component: ContactPage,
});

const SUPPORT_EMAIL = "hello@projectx.dev";

const REASONS = [
  { id: "plan", label: "Upgrade or billing question" },
  { id: "bug", label: "Report a problem with the lab" },
  { id: "school", label: "School / bulk licensing" },
  { id: "other", label: "Something else" },
];

function ContactPage() {
  const [reason, setReason] = useState(REASONS[0].id);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // The lab is a static, client-only deployment — there is no server to POST
  // to. Rather than a button that silently does nothing, compose a real email
  // the student's own mail client sends.
  const reasonLabel = REASONS.find((r) => r.id === reason)?.label ?? "Enquiry";
  const mailto =
    `mailto:${SUPPORT_EMAIL}` +
    `?subject=${encodeURIComponent(`[ChemVM] ${reasonLabel}`)}` +
    `&body=${encodeURIComponent(`${message}\n\n— ${name || "a ChemVM user"}`)}`;

  const canSend = message.trim().length > 0;

  return (
    <PageTransition>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>
            Get in touch
          </h1>
          <p className="mt-3 text-muted-foreground">
            Paid plans are still being rolled out. Tell us what you need and we will set your account up by hand.
          </p>
        </div>

        <div className="glass mt-8 rounded-3xl p-6 md:p-8">
          <label className="text-sm font-medium" htmlFor="contact-reason">
            What is this about?
          </label>
          <div id="contact-reason" className="mt-2 flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  reason === r.id
                    ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal"
                    : "bg-black/5 text-muted-foreground hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <label className="mt-6 block text-sm font-medium" htmlFor="contact-name">
            Your name
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tendai Moyo"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-turquoise dark:border-white/15 dark:bg-white/5"
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Which syllabus are you studying, and what do you need from ChemVM?"
            className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-turquoise dark:border-white/15 dark:bg-white/5"
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={canSend ? mailto : undefined}
              aria-disabled={!canSend}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                canSend
                  ? "bg-navy text-peach hover:opacity-90 dark:bg-turquoise dark:text-charcoal"
                  : "pointer-events-none bg-black/10 text-muted-foreground dark:bg-white/10"
              }`}
            >
              <Send size={16} /> Send message
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              <Mail size={15} /> {SUPPORT_EMAIL}
            </a>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <MessageSquare size={14} className="mt-0.5 shrink-0" />
            This opens your own email app with the message ready to send — nothing is submitted to a server, so your
            details stay on your device.
          </p>
        </div>

        <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back home
        </Link>
      </section>
    </PageTransition>
  );
}
