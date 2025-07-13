import { Brain, Settings, BarChart3, Users, ClipboardList, Gauge } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Djobea AI</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Gauge className="w-4 h-4" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ClipboardList className="w-4 h-4" />
              Demandes
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Users className="w-4 h-4" />
              Prestataires
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-lg"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
              Paramètres
            </a>
          </nav>

          {/* AI Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
            <Brain className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Analytics IA</span>
          </div>
        </div>
      </div>
    </header>
  )
}
