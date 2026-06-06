import React from "react";
import TradingCalculator from "@/components/TradingCalculator";
import { ShieldCheck, TrendingUp, TrendingDown, Info, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Trading Risk Calculator - Binance & TradingView Style",
  description: "Hitung risk management trading crypto, forex, dan saham secara akurat. Tentukan leverage, stop loss, margin, posisi size, dan target risk-reward secara dinamis.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0e11] text-[#eaecef]">
      {/* HEADER SECTION */}
      <header className="border-b border-neutral-800 bg-[#12161a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-black text-black shadow-lg shadow-amber-500/20">TR</div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-wider text-white">TRADING RISK CALCULATOR</h1>
              <p className="text-[10px] text-[#f0b90b] font-bold tracking-wider">RISK MANAGEMENT SYSTEM</p>
            </div>
          </div>
        </div>
      </header>

      {/* SUCCESS TIP BAR */}
      <section className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
        <p className="text-xs text-amber-300 font-semibold flex items-center justify-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-[#f0b90b] flex-shrink-0 animate-pulse" />
          <span>
            <strong>Tips Manajemen Risiko:</strong> Jangan pernah mengambil risiko lebih dari <strong>1% - 2%</strong> dari total modal Anda per trade!
          </span>
        </p>
      </section>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TradingCalculator />

        {/* EDUCATIONAL GLOSSARY SECTION */}
        <section className="mt-12 pt-8 border-t border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
            <Info className="h-5 w-5 text-amber-500" />
            <span>Panduan & Rumus Perhitungan</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-400 leading-relaxed">
            <div className="bg-[#12161a] p-5 rounded-xl border border-neutral-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Risk Money & Margin</span>
              </h3>
              <p>
                <strong>Risk Money (Uang Risiko)</strong> didefinisikan sebagai jumlah maksimal uang yang rela Anda hilangkan jika Stop Loss tersentuh. Dihitung dengan rumus:
              </p>
              <code className="block bg-[#161a1e] p-2 rounded text-neutral-300 font-mono mt-1 border border-neutral-800">Risk Money = Balance * (Risk % / 100)</code>
              <p className="mt-2">
                <strong>Required Margin (Modal Terpakai)</strong> adalah jaminan modal sesungguhnya yang didepositokan untuk membuka posisi dengan leverage tertentu.
              </p>
              <code className="block bg-[#161a1e] p-2 rounded text-neutral-300 font-mono mt-1 border border-neutral-800">Margin = Position Size / Leverage</code>
            </div>

            <div className="bg-[#12161a] p-5 rounded-xl border border-neutral-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0ecb81]" />
                <span>Position Size (Ukuran Posisi)</span>
              </h3>
              <p>
                <strong>Position Size (Besar Posisi)</strong> mewakili nilai nosional dari posisi trading Anda yang sebenarnya (termasuk leverage). Hal ini sangat penting untuk menjaga kerugian Anda tetap konstan terlepas dari seberapa jauh
                Stop Loss Anda. Dihitung dengan rumus:
              </p>
              <code className="block bg-[#161a1e] p-2 rounded text-neutral-300 font-mono mt-1 border border-neutral-800">Size = Risk Money / SL %</code>
              <p className="text-neutral-500 mt-1 italic">*SL % = abs(Entry - Stop Loss) / Entry</p>
            </div>

            <div className="bg-[#12161a] p-5 rounded-xl border border-neutral-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Risk Reward Ratio (RR)</span>
              </h3>
              <p>
                <strong>Risk Reward Ratio (Rasio RR)</strong> membandingkan potensi kerugian dengan potensi keuntungan. Rasio RR yang baik memastikan portofolio Anda tetap menguntungkan secara keseluruhan meskipun memiliki win rate di bawah
                50%.
              </p>
              <div className="space-y-1 mt-2 text-[11px]">
                <div className="flex items-center space-x-1">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">Poor RR</span>
                  <span className="text-neutral-500">&lt; 1.5x (Kurang Ideal)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">Good RR</span>
                  <span className="text-neutral-500">1.5x - 2.5x (Bagus)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Excellent RR</span>
                  <span className="text-neutral-500">&gt; 2.5x (Sangat Baik)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 bg-[#12161a] py-6 mt-16 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-neutral-400">&copy; {new Date().getFullYear()} Trading Risk Calculator. Designed for Smart Traders.</p>
          <p className="mt-2 max-w-2xl mx-auto text-[11px] leading-relaxed">
            <strong>Peringatan Risiko:</strong> Perdagangan aset finansial, termasuk cryptocurrency, forex, dan saham, melibatkan risiko kerugian yang tinggi. Leverage dapat melipatgandakan keuntungan sekaligus kerugian Anda. Gunakan
            kalkulator ini hanya sebagai alat bantu analisis teknis.
          </p>
        </div>
      </footer>
    </div>
  );
}
