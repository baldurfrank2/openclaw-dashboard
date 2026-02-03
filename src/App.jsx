import { useState } from "react";

const tabs = [
  { name: "Tasks", icon: "◆", count: 18 },
  { name: "Projects", icon: "◇", count: 7 },
  { name: "Memory", icon: "◈", count: null },
  { name: "Captures", icon: "○", count: 92 },
  { name: "Docs", icon: "◎", count: null },
  { name: "People", icon: "◉", count: 14 }
];

const stats = [
  { label: "This Week", value: "18", trend: "+6", trendUp: true, accent: "cyan" },
  { label: "In Progress", value: "7", trend: "-2", trendUp: false, accent: "purple" },
  { label: "Total Tasks", value: "124", trend: "+14", trendUp: true, accent: "blue" },
  { label: "Completion", value: "86%", trend: "+4%", trendUp: true, accent: "green" }
];

const columns = [
  {
    title: "Backlog",
    color: "slate",
    tasks: [
      { title: "Launch alpha onboarding", tag: "Research", owner: "Avery", time: "2d", priority: "medium" },
      { title: "Audit capture permissions", tag: "Security", owner: "Riley", time: "3d", priority: "high" },
      { title: "UX pass for mission map", tag: "Design", owner: "Jules", time: "5d", priority: "low" }
    ]
  },
  {
    title: "In Progress",
    color: "cyan",
    tasks: [
      { title: "Realtime sync for memory layer", tag: "Core", owner: "Morgan", time: "Today", priority: "high" },
      { title: "Telemetry dashboards", tag: "Data", owner: "Kai", time: "1d", priority: "medium" }
    ]
  },
  {
    title: "Review",
    color: "purple",
    tasks: [
      { title: "Mission briefing templates", tag: "Docs", owner: "Quinn", time: "Today", priority: "medium" },
      { title: "Agent scheduling logic", tag: "Ops", owner: "Sam", time: "2d", priority: "low" }
    ]
  },
  {
    title: "Done",
    color: "green",
    tasks: [
      { title: "Capture streams upgrade", tag: "Platform", owner: "Logan", time: "Done", priority: "done" },
      { title: "New glass UI tokens", tag: "Design", owner: "Avery", time: "Done", priority: "done" },
      { title: "Docs migration", tag: "Docs", owner: "Riley", time: "Done", priority: "done" }
    ]
  }
];

const activity = [
  { title: "Mission Control synced with Ops", time: "8m ago", detail: "New priority tags added", type: "sync" },
  { title: "Capture pipeline stabilized", time: "24m ago", detail: "Latency down 18%", type: "success" },
  { title: "Memory cluster expanded", time: "1h ago", detail: "2 new nodes online", type: "expand" },
  { title: "Projects archive refreshed", time: "3h ago", detail: "12 legacy items moved", type: "archive" }
];

const quick = [
  { label: "Active agents", value: "14", icon: "●" },
  { label: "Captures today", value: "92", icon: "◐" },
  { label: "Alerts", value: "3", icon: "◆", alert: true }
];

const tagClasses = {
  Research: "tag-research",
  Security: "tag-security",
  Design: "tag-design",
  Core: "tag-core",
  Data: "tag-data",
  Docs: "tag-docs",
  Ops: "tag-ops",
  Platform: "tag-platform"
};

const accentColors = {
  cyan: "from-neon-cyan/20 to-neon-cyan/5",
  purple: "from-neon-purple/20 to-neon-purple/5",
  blue: "from-neon-blue/20 to-neon-blue/5",
  green: "from-neon-green/20 to-neon-green/5"
};

const columnColors = {
  slate: "bg-slate-500",
  cyan: "bg-neon-cyan",
  purple: "bg-neon-purple",
  green: "bg-neon-green"
};

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-night-950 text-slate-100">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-glow opacity-60" />
        <div className="absolute inset-0 bg-glow-bottom opacity-40" />
        <div className="absolute inset-0 bg-grid bg-[length:24px_24px] opacity-[0.15]" />
        <div className="absolute -top-40 right-20 h-96 w-96 rounded-full bg-aurora-600/20 blur-[150px] animate-pulse-slow" />
        <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-neon-cyan/15 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/3 h-64 w-64 rounded-full bg-neon-purple/15 blur-[120px] animate-pulse-slow" />
      </div>

      <main className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <header className="glass-elevated rounded-2xl lg:rounded-3xl px-5 lg:px-8 py-5 lg:py-6 shadow-glass-lg mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">
                Mission Control
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gradient tracking-tight">
                Openclaw Operations
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-subtle flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 status-pulse" />
                <span className="hidden sm:inline">Systems nominal</span>
                <span className="sm:hidden">Online</span>
              </div>
              <button className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white">
                New mission
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-6 lg:mb-8 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 rounded-full px-4 lg:px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  index === activeTab
                    ? "tab-active text-white"
                    : "tab-inactive text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-xs opacity-60">{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    index === activeTab
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass hover-glow rounded-2xl p-4 lg:p-5 shadow-glass group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColors[stat.accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <p className="text-xs lg:text-sm text-slate-400 font-medium">{stat.label}</p>
                <div className="mt-2 lg:mt-3 flex items-end justify-between">
                  <span className="text-2xl lg:text-3xl font-bold tracking-tight">{stat.value}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.trendUp
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Main Content */}
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Kanban Board */}
          <div className="glass-elevated rounded-2xl lg:rounded-3xl p-5 lg:p-6 shadow-glass-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg lg:text-xl font-semibold">Active Missions</h2>
                <p className="text-sm text-slate-400 mt-0.5">Kanban view across squads</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary rounded-full px-4 py-2 text-xs font-medium text-slate-300">
                  <span className="mr-1.5">◇</span> Filter
                </button>
                <button className="btn-secondary rounded-full px-4 py-2 text-xs font-medium text-slate-300">
                  <span className="mr-1.5">≡</span> View
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {columns.map((column) => (
                <div key={column.title} className="kanban-column p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${columnColors[column.color]}`} />
                      <h3 className="text-sm font-semibold text-slate-200">{column.title}</h3>
                    </div>
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {column.tasks.map((task, taskIndex) => (
                      <div
                        key={task.title}
                        className="glass-subtle task-card rounded-xl p-3.5 cursor-pointer"
                        style={{ animationDelay: `${taskIndex * 50}ms` }}
                      >
                        <p className="text-sm font-medium text-white leading-snug mb-3">
                          {task.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`tag ${tagClasses[task.tag]} px-2 py-1 rounded-md`}>
                            {task.tag}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-medium">
                              {task.owner[0]}
                            </span>
                            <span className={task.time === "Done" ? "text-emerald-400" : ""}>
                              {task.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:space-y-5">
            {/* Quick Pulse */}
            <div className="glass rounded-2xl p-5 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Quick Pulse</h2>
                <span className="activity-dot" />
              </div>
              <div className="space-y-3">
                {quick.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${item.alert ? "text-amber-400" : "text-slate-500"}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    <span className={`text-lg font-bold ${item.alert ? "text-amber-400" : "text-white"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="glass rounded-2xl p-5 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Activity Feed</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                {activity.map((item, index) => (
                  <div
                    key={item.title}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors border-l-2 border-transparent hover:border-neon-cyan/50"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                    <p className="text-xs text-neon-cyan mt-2 font-medium">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Brief */}
            <div className="glass neon-border-purple rounded-2xl p-5 shadow-glass">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-neon-purple">◈</span>
                <h2 className="text-base font-semibold">Mission Brief</h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Prioritize onboarding improvements, stabilize capture throughput, and keep memory
                consistency within <span className="text-white font-medium">0.5% drift</span> for the next sprint.
              </p>
              <div className="divider-glow my-4" />
              <button className="btn-secondary w-full rounded-xl py-2.5 text-sm font-medium text-slate-200 hover:text-white">
                Review full brief
              </button>
            </div>
          </aside>
        </section>

        {/* Footer */}
        <footer className="mt-8 lg:mt-10 text-center">
          <p className="text-xs text-slate-500">
            Openclaw Mission Control • <span className="text-slate-600">v0.1.0</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
