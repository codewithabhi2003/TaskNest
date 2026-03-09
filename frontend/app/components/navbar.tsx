import { Link, useLocation } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="tn-nav">
      <div className="tn-nav-inner">

        {/* ── Logo ── */}
        <Link to="/" className="tn-logo flex items-center">
          <span className="tn-logo-text dark:text-[#f5f4ef]!">
            TaskNest<span className="tn-logo-dot" />
          </span>
        </Link>

        {/* ── Center Links ── */}
        <div className="tn-nav-links flex items-center gap-8">

          {/* FEATURES */}
          <Popover>
            <PopoverTrigger className="tn-nav-link dark:text-white/60! dark:hover:text-white! dark:hover:bg-white/8!">
              Features
              <svg className="inline ml-1 opacity-50" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </PopoverTrigger>

            <PopoverContent className="w-[520px] p-6 dark:bg-[#1a1d24] dark:border-white/10">
              <div className="space-y-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Platform Features
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Task Boards",              desc: "Organise tasks visually with flexible Kanban boards." },
                    { title: "Workspace Collaboration",  desc: "Invite teammates and collaborate in shared workspaces." },
                    { title: "Analytics Dashboard",      desc: "Visual insights into team productivity and progress." },
                    { title: "Project Roadmaps",         desc: "Plan upcoming work with structured roadmap timelines." },
                  ].map((f) => (
                    <div key={f.title} className="feature-card rounded-xl p-3 hover:bg-muted/60 dark:hover:bg-white/5 transition-colors cursor-pointer">
                      <p className="font-semibold text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* ABOUT */}
          <Popover>
            <PopoverTrigger className="tn-nav-link dark:text-white/60! dark:hover:text-white!">
              About
              <svg className="inline ml-1 opacity-50" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </PopoverTrigger>

            <PopoverContent className="w-[420px] p-6 dark:bg-[#1a1d24] dark:border-white/10">
              <div className="space-y-4">
                <p className="text-base font-semibold">About TaskNest</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  TaskNest is a modern project management workspace built to help
                  teams plan, organise, and track their work efficiently. It combines
                  task management, collaboration tools, and productivity analytics
                  into a single streamlined platform.
                </p>
                <div className="border-t dark:border-white/10 pt-3 text-xs text-muted-foreground">
                  Designed for startups, developers, and teams who want a
                  simple but powerful productivity system.
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* CONTACT */}
          <Popover>
            <PopoverTrigger className="tn-nav-link dark:text-white/60! dark:hover:text-white!">
              Contact
              <svg className="inline ml-1 opacity-50" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </PopoverTrigger>

            <PopoverContent className="w-[360px] p-6 dark:bg-[#1a1d24] dark:border-white/10">
              <div className="space-y-4">
                <p className="text-base font-semibold">Get in Touch</p>
                <p className="text-sm text-muted-foreground">
                  Have questions, feedback, or partnership ideas?
                  We'd love to hear from you.
                </p>
                <div className="rounded-xl p-4 bg-muted/40 dark:bg-white/5 border dark:border-white/8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Email Support
                  </p>
                  <a
                    href="mailto:tasknest.notify@gmail.com"
                    className="text-sm font-medium text-foreground hover:text-[#0d0f14] dark:hover:text-[#e8ff47] transition-colors"
                  >
                    tasknest.notify@gmail.com
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  We typically respond within 24 hours.
                </p>
              </div>
            </PopoverContent>
          </Popover>

        </div>

        {/* ── Auth Buttons ── */}
        <div className="tn-auth flex items-center gap-2">
          <Link
            to="/sign-in"
            className="tn-btn-ghost dark:text-white/65! dark:hover:text-white! dark:hover:bg-white/8!"
          >
            Sign In
          </Link>

          {/* Always yellow in dark mode — darker yellow on hover */}
          <Link
            to="/sign-up"
            className="tn-btn-primary dark:bg-[#e8ff47]! dark:text-[#0d0f14]! dark:border-[#e8ff47]! dark:hover:bg-[#d4eb3a]! dark:hover:border-[#d4eb3a]!"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;