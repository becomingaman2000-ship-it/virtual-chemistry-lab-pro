import { Link } from "@tanstack/react-router";
import { AuroraLogo } from "./AuroraLogo";

const cols = [
  { title: "Product", links: [["ChemVM", "/"], ["KineticsVM (soon)", "/"], ["Roadmap", "/"]] },
  { title: "Company", links: [["About Project X", "/about"], ["Careers", "/"], ["Contact", "/contact"]] },
  { title: "Resources", links: [["Curriculum Guide", "/syllabus"], ["Help Center", "/"], ["System Requirements", "/"]] },
  { title: "Legal", links: [["Terms of Service", "/"], ["Privacy Policy", "/"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 px-4 pb-8">
      <div className="glass mx-auto max-w-7xl rounded-3xl p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <AuroraLogo size={30} />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              A fully interactive virtual chemistry laboratory built for ZIMSEC and Cambridge
              students — mix, react, and observe real chemical behavior from any device.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {c.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-foreground/80 transition hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} ChemVM — Made by <span className="font-semibold text-foreground">Project X</span>.</p>
          <p className="font-mono uppercase tracking-widest">Virtual Chemistry Laboratory · v0.1</p>
        </div>
      </div>
    </footer>
  );
}
