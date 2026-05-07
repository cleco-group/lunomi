export default function POS() {
  return (
    <div className="min-h-screen p-8" style={{ background: '#061820' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">POS Terminal</h1>
        <div className="p-8 rounded-2xl text-center" 
             style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-white/70 text-lg">
            🚧 POS Terminal sedang dalam pengembangan
          </p>
          <p className="text-white/50 text-sm mt-2">
            Fitur ini akan segera tersedia
          </p>
        </div>
      </div>
    </div>
  );
}
