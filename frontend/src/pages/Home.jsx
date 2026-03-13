export default function Home() {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-7 grid grid-cols-2 gap-6">

      {/* ── Facebook ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#1877F2] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-condensed text-lg font-bold uppercase tracking-wide text-atsc-azul-oscuro">
              Facebook <span className="text-sm font-normal text-atsc-gris-texto normal-case tracking-normal">@atscfutsal</span>
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-atsc-gris-claro shadow-sm overflow-hidden">
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fatscfutsal&tabs=timeline&width=600&height=640&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
            width="600" height="640"
            className="w-full border-none block"
            scrolling="no"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      </div>

      {/* ── Instagram ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </div>
          <div>
            <h2 className="font-condensed text-lg font-bold uppercase tracking-wide text-atsc-azul-oscuro">
              Instagram <span className="text-sm font-normal text-atsc-gris-texto normal-case tracking-normal">@atscfutsal</span>
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-atsc-gris-claro shadow-sm overflow-hidden">
          <iframe
            src="https://www.instagram.com/atscfutsal/embed"
            width="600" height="640"
            className="w-full border-none block"
            scrolling="yes"
            allowTransparency
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-atsc-gris-claro">
            <span className="text-sm font-semibold text-atsc-gris-texto">@atscfutsal</span>
            <a
              href="https://www.instagram.com/atscfutsal/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#bc1888] hover:opacity-70 transition-opacity"
            >
              Ver perfil completo →
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
