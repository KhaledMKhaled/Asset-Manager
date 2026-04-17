export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center p-12 glass rounded-3xl max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
          Smarketing CRM V5
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          The autonomous, bilingual, AI-first operating system for unified sales and marketing.
        </p>
        
        <div className="flex gap-4 justify-center pt-4">
          <button className="px-6 py-3 rounded-full bg-brand-600 text-white font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">
            Open Dashboard
          </button>
          <button className="px-6 py-3 rounded-full glass font-medium hover:bg-white/40 dark:hover:bg-slate-800/60 transition">
            Configure App
          </button>
        </div>
      </div>
    </div>
  );
}
