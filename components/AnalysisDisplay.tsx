
import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSpanish = result.language === 'es';

  const labels = {
    analysis: isSpanish ? "📊 ANÁLISIS" : "📊 ANALYSIS",
    competitor: isSpanish ? "🔄 CONVERSIÓN DE COMPETIDOR" : "🔄 COMPETITOR CONVERSION",
    recommendations: isSpanish ? "✅ PRODUCTO(S) RECOMENDADO(S)" : "✅ RECOMMENDED PRODUCT(S)",
    quote: isSpanish ? "📋 PLANTILLA DE COTIZACIÓN" : "📋 QUOTE TEMPLATE",
    draft: isSpanish ? "📧 RESPUESTA BORRADOR" : "📧 DRAFT RESPONSE",
    leadScore: isSpanish ? "🎯 CALIFICACIÓN DEL LEAD" : "🎯 LEAD SCORE",
    notes: isSpanish ? "⚠️ NOTAS PARA EL EQUIPO" : "⚠️ NOTES FOR SALES TEAM",
    copy: isSpanish ? "Copiar Borrador" : "Copy Draft",
    copied: isSpanish ? "¡Copiado!" : "Copied!",
    currentlyUsing: isSpanish ? "Usa Actualmente" : "Currently Using",
    tatiEquivalent: isSpanish ? "Equivalente TATI" : "TATI Equivalent",
    switchingAngle: isSpanish ? "Ángulo de Venta" : "Switching Angle"
  };

  const getScoreColor = (rating: string) => {
    switch (rating) {
      case 'HOT': return 'bg-red-500 text-white';
      case 'WARM': return 'bg-yellow-400 text-slate-900';
      case 'COLD': return 'bg-blue-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getScoreEmoji = (rating: string) => {
    switch (rating) {
      case 'HOT': return '🔥';
      case 'WARM': return '🟡';
      case 'COLD': return '🔵';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Lead Score Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 tracking-tight">{labels.leadScore}</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${getScoreColor(result.leadScore.rating)}`}>
            {getScoreEmoji(result.leadScore.rating)} {result.leadScore.rating} ({result.leadScore.score} pts)
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Signals Detected</p>
            <div className="flex flex-wrap gap-2">
              {result.leadScore.signals.map((s, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-tight">
                  <i className="fa-solid fa-check text-green-500 mr-1"></i> {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Action</p>
            <p className="text-sm font-medium text-slate-700">{result.leadScore.recommendedAction}</p>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 tracking-tight">{labels.analysis}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Need</p>
            <p className="text-sm text-slate-700 font-medium leading-tight">{result.analysis.customerNeed}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Application</p>
            <p className="text-sm text-slate-700 font-medium leading-tight">{result.analysis.application}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Key Factors</p>
            <p className="text-sm text-slate-700 font-medium leading-tight">{result.analysis.keyFactors}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Urgency</p>
            <p className="text-sm text-slate-700 font-medium leading-tight">{result.analysis.urgency}</p>
          </div>
        </div>
      </section>

      {/* Competitor Conversion */}
      {result.competitorConversion && (
        <section className="bg-indigo-50 rounded-xl border border-indigo-200 shadow-sm overflow-hidden border-l-4 border-l-indigo-600">
          <div className="bg-indigo-100/50 px-6 py-3 border-b border-indigo-200">
            <h3 className="font-bold text-indigo-900 tracking-tight">{labels.competitor}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase mb-1">{labels.currentlyUsing}</p>
              <p className="text-indigo-900 font-bold">{result.competitorConversion.currentlyUsing}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase mb-1">{labels.tatiEquivalent}</p>
              <p className="text-indigo-900 font-bold">{result.competitorConversion.tatiEquivalent}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase mb-1">{labels.switchingAngle}</p>
              <p className="text-sm text-indigo-800 italic">{result.competitorConversion.switchingAngle}</p>
            </div>
          </div>
        </section>
      )}

      {/* Recommendations */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 tracking-tight">{labels.recommendations}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-1">Primary: {result.recommendations.primary}</p>
            <p className="text-blue-800 text-sm italic leading-relaxed">→ {result.recommendations.primaryReasoning}</p>
          </div>
          {result.recommendations.alternative && (
            <div className="p-4 bg-slate-50 border-l-4 border-slate-400 rounded-lg">
              <p className="text-sm font-bold text-slate-900 mb-1">Alternative: {result.recommendations.alternative}</p>
              <p className="text-slate-700 text-sm italic leading-relaxed">→ {result.recommendations.alternativeReasoning}</p>
            </div>
          )}
        </div>
      </section>

      {/* Quote Template */}
      {result.quoteTemplate && (
        <section className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-200 flex justify-between items-center">
            <h3 className="font-bold text-emerald-900 tracking-tight">{labels.quote}</h3>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded uppercase">Quote-Ready</span>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-left border border-slate-200 font-bold text-slate-600 uppercase tracking-tight text-[10px]">Product</th>
                    <th className="p-3 text-center border border-slate-200 font-bold text-slate-600 uppercase tracking-tight text-[10px]">Quantity</th>
                    <th className="p-3 text-center border border-slate-200 font-bold text-slate-600 uppercase tracking-tight text-[10px]">Unit Price</th>
                    <th className="p-3 text-center border border-slate-200 font-bold text-slate-600 uppercase tracking-tight text-[10px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.quoteTemplate.lineItems.map((item, i) => (
                    <tr key={i}>
                      <td className="p-3 border border-slate-200 font-medium text-slate-800">{item.product}</td>
                      <td className="p-3 border border-slate-200 text-center text-slate-800">{item.quantity}</td>
                      <td className="p-3 border border-slate-200 text-center text-slate-400 italic font-mono">$ ______</td>
                      <td className="p-3 border border-slate-200 text-center text-slate-400 italic font-mono">$ ______</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/30">
                    <td colSpan={3} className="p-3 border border-slate-200 text-right font-bold text-slate-600 uppercase text-[10px]">Total Quote Estimate</td>
                    <td className="p-3 border border-slate-200 text-center font-bold text-emerald-800 font-mono italic">$ ______</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-slate-400 uppercase font-bold tracking-widest mr-2">Location:</span>
                <span className="text-slate-700 font-bold">{result.quoteTemplate.location || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold tracking-widest mr-2">Company:</span>
                <span className="text-slate-700 font-bold">{result.quoteTemplate.company || '—'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Draft Response Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 tracking-tight">{labels.draft}</h3>
          <button 
            onClick={() => copyToClipboard(result.draft)}
            className="text-xs font-medium px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            {copied ? labels.copied : labels.copy}
          </button>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap text-slate-800 leading-relaxed font-mono text-xs sm:text-sm">
            {result.draft}
          </div>
        </div>
      </section>

      {/* Internal Notes Section */}
      <section className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm overflow-hidden">
        <div className="bg-orange-100 px-6 py-3 border-b border-orange-200">
          <h3 className="font-bold text-orange-900 tracking-tight">{labels.notes}</h3>
        </div>
        <div className="p-6">
          <p className="text-orange-900 text-sm leading-relaxed font-medium">
            {result.internalNotes}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AnalysisDisplay;
