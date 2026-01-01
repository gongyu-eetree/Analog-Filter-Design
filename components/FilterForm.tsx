
import React, { useState } from 'react';
import { FilterParams, FilterType, FilterTopology, ApproximationType } from '../types';

interface FilterFormProps {
  params: FilterParams;
  setParams: (p: FilterParams) => void;
  onSimulate: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ params, setParams, onSimulate }) => {
  const [showSimSettings, setShowSimSettings] = useState(false);

  const handleChange = (field: keyof FilterParams, value: any) => {
    setParams({ ...params, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Topology</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(FilterTopology).map((t) => (
            <button
              key={t}
              onClick={() => handleChange('topology', t)}
              className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase transition-all border ${params.topology === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Approximation</label>
        <select 
          value={params.approximation}
          onChange={(e) => handleChange('approximation', e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
        >
          <option value={ApproximationType.BUTTERWORTH}>Butterworth</option>
          <option value={ApproximationType.CHEBYSHEV}>Chebyshev</option>
          <option value={ApproximationType.ELLIPTIC}>Elliptic (Cauer)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(params.approximation === ApproximationType.CHEBYSHEV || params.approximation === ApproximationType.ELLIPTIC) && (
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Passband Ripple (dB)</label>
            <input 
              type="number" step="0.01" min="0.01" max="3"
              value={params.ripple}
              onChange={(e) => handleChange('ripple', parseFloat(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
            />
          </div>
        )}
        {params.approximation === ApproximationType.ELLIPTIC && (
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stopband Atten (As)</label>
            <input 
              type="number" step="1" min="20" max="100"
              value={params.stopbandAtten}
              onChange={(e) => handleChange('stopbandAtten', parseFloat(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order (N)</label>
          <input 
            type="number" min="1" max="9"
            value={params.order}
            onChange={(e) => handleChange('order', parseInt(e.target.value))}
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gain (Ao)</label>
          <input 
            type="number" step="0.1" disabled={params.topology === FilterTopology.PASSIVE}
            value={params.gain}
            onChange={(e) => handleChange('gain', parseFloat(e.target.value))}
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cutoff Freq (fc) [Hz]</label>
        <input 
          type="number"
          value={params.cutoffFreq}
          onChange={(e) => handleChange('cutoffFreq', parseFloat(e.target.value))}
          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Source Rs [Ω]</label>
          <input 
            type="number"
            value={params.rs}
            onChange={(e) => handleChange('rs', parseFloat(e.target.value))}
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load Rl [Ω]</label>
          <input 
            type="number"
            value={params.rl}
            onChange={(e) => handleChange('rl', parseFloat(e.target.value))}
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
          />
        </div>
      </div>

      {/* Simulation Control Section */}
      <div className="pt-2">
        <button 
          type="button"
          onClick={() => setShowSimSettings(!showSimSettings)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
        >
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className={`fas fa-chart-line ${showSimSettings ? 'text-cyan-600' : ''}`}></i>
            Simulation Control
          </span>
          <i className={`fas fa-chevron-${showSimSettings ? 'up' : 'down'} text-[9px] text-slate-400 group-hover:text-slate-600`}></i>
        </button>

        {showSimSettings && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Start Freq (Hz)</label>
                <input 
                  type="number"
                  value={params.simStartFreq}
                  onChange={(e) => handleChange('simStartFreq', parseFloat(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">End Freq (Hz)</label>
                <input 
                  type="number"
                  value={params.simEndFreq}
                  onChange={(e) => handleChange('simEndFreq', parseFloat(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Simulation Points (Steps)</label>
              <input 
                type="number" min="10" max="1000"
                value={params.simPoints}
                onChange={(e) => handleChange('simPoints', parseInt(e.target.value))}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono"
              />
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={onSimulate}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-2"
      >
        Synthesize Filter
      </button>
    </div>
  );
};

export default FilterForm;
