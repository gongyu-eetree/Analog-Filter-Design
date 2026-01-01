
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterParams, FilterType, FilterTopology, ApproximationType, OptimizationGoal, SimulationDataPoint, ComponentValue } from './types';
import { calculateFrequencyResponse, calculateComponentValues } from './services/filterMath';
import { getFilterInsights } from './services/geminiService';
import FilterForm from './components/FilterForm';
import Visuals from './components/Visuals';
import CircuitView from './components/CircuitView';
import { marked } from 'marked';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [params, setParams] = useState<FilterParams>({
    type: FilterType.LOW_PASS,
    topology: FilterTopology.PASSIVE,
    approximation: ApproximationType.BUTTERWORTH,
    ripple: 0.1,
    stopbandAtten: 40,
    order: 5,
    cutoffFreq: 1000000,
    cutoffFreq2: 5000000,
    rs: 50,
    rl: 50,
    gain: 1,
    optimization: OptimizationGoal.MIN_COMPONENTS,
    simStartFreq: 1000,
    simEndFreq: 100000000,
    simPoints: 400
  });

  const [simData, setSimData] = useState<SimulationDataPoint[]>([]);
  const [components, setComponents] = useState<ComponentValue[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = useCallback(() => {
    const data = calculateFrequencyResponse(params);
    const comps = calculateComponentValues(params);
    setSimData(data);
    setComponents(comps);
  }, [params]);

  const handleSynthesize = useCallback(async () => {
    setLoading(true);
    handleUpdate();
    const aiInsight = await getFilterInsights(params);
    setInsight(aiInsight);
    setStep(3);
    setLoading(false);
  }, [params, handleUpdate]);

  useEffect(() => {
    handleUpdate();
  }, [params, handleUpdate]);

  const insightHtml = useMemo(() => {
    if (!insight) return null;
    return { __html: marked.parse(insight) };
  }, [insight]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-cyan-400 p-2 rounded-lg rotate-3 shadow-lg shadow-cyan-500/20">
            <i className="fas fa-wave-square text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tighter leading-none">ANALOG DESIGNER <span className="text-cyan-600">PRO</span></h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instrument-Grade Synthesis Suite</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-3 transition-all ${step >= s ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step === s ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-200 text-slate-500'}`}>
                {s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-cyan-700' : 'text-slate-400'}`}>
                {s === 1 ? 'Filter Type' : s === 2 ? 'Specifications' : 'Realization'}
              </span>
              {s < 3 && <div className="w-12 h-[2px] bg-slate-200 ml-2"></div>}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-cog"></i></button>
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase">Beta V2.8</span>
        </div>
      </nav>

      <main className="flex-grow p-6 max-w-[1800px] mx-auto w-full grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Step 1: Choose Model</h3>
                {[
                  { id: FilterType.LOW_PASS, label: 'Low Pass (LPF)', icon: 'fa-arrow-down' },
                  { id: FilterType.HIGH_PASS, label: 'High Pass (HPF)', icon: 'fa-arrow-up' },
                  { id: FilterType.BAND_PASS, label: 'Band Pass (BPF)', icon: 'fa-arrows-alt-h' }
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setParams({ ...params, type: t.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${params.type === t.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${params.type === t.id ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <i className={`fas ${t.icon}`}></i>
                      </div>
                      <span className="text-sm font-bold">{t.label}</span>
                    </div>
                  </button>
                ))}
                <button 
                  onClick={() => setStep(2)}
                  className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  Configure Parameters <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 2: Engineering Specs</h3>
                  <button onClick={() => setStep(1)} className="text-[10px] font-bold text-cyan-600 uppercase">Back</button>
                </div>
                <FilterForm params={params} setParams={setParams} onSimulate={handleSynthesize} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 3: Synthesis Results</h3>
                  <button onClick={() => setStep(2)} className="text-[10px] font-bold text-cyan-600 uppercase">Back to Specs</button>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                   <i className="fas fa-microchip text-emerald-500 mt-1"></i>
                   <div>
                     <p className="text-xs font-bold text-emerald-900">Network Synthesized</p>
                     <p className="text-[10px] text-emerald-600 mt-0.5">{params.approximation} {params.order}th Order</p>
                   </div>
                </div>
                {loading ? (
                   <div className="w-full bg-slate-100 py-3 rounded-xl flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synthesizing...</span>
                   </div>
                ) : (
                  <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors">
                    <i className="fas fa-file-export mr-2"></i> Export SPICE Netlist
                  </button>
                )}
              </div>
            )}
          </div>
          
          {step === 3 && <CircuitView params={params} components={components} />}
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                   Simulation Analyzer
                   <span className="bg-cyan-100 text-cyan-700 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Active Probe</span>
                 </h2>
                 <p className="text-xs text-slate-400 mt-1 font-medium">Insertion Loss (S21), Return Loss (S11), and Phase response</p>
               </div>
            </div>
            <Visuals data={simData} />
          </div>

          {step === 3 && insight && (
            <div className="bg-[#0f172a] p-10 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
                      <i className="fas fa-microchip text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest leading-none">Design Insight Report</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Expert Component Selection & Analysis</p>
                    </div>
                 </div>
                 <div className="prose-report" dangerouslySetInnerHTML={insightHtml || { __html: '' }} />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
