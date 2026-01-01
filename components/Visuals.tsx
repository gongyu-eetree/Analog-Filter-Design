
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';
import { SimulationDataPoint } from '../types';

interface VisualsProps {
  data: SimulationDataPoint[];
}

const Visuals: React.FC<VisualsProps> = ({ data }) => {
  const formatXAxis = (v: number) => {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + 'G';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k';
    return v.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl text-[10px] font-mono backdrop-blur-md">
          <p className="text-slate-400 mb-2 border-b border-slate-800 pb-2 flex justify-between gap-4">
            <span className="uppercase tracking-widest font-black">Frequency</span> 
            <span className="text-white font-bold">{formatXAxis(label)} Hz</span>
          </p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex justify-between gap-8 py-1">
              <span className="uppercase tracking-widest" style={{ color: p.color }}>{p.name}</span>
              <span className="text-white font-bold">
                {p.name.includes('Phase') ? `${p.value}°` : `${p.value} dB`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12">
      {/* Magnitude and S11 Plot */}
      <div className="relative">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
           <i className="fas fa-signal text-cyan-600"></i> Magnitude Response (S21, S11)
        </h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorS11" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 5" stroke="#e2e8f0" />
              <XAxis 
                dataKey="frequency" 
                scale="log" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                type="number"
                stroke="#cbd5e1"
              />
              <YAxis 
                domain={[-80, 5]} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                stroke="#cbd5e1"
                label={{ value: 'Response (dB)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                name="S21 (Insertion Loss)"
                type="monotone" 
                dataKey="magnitude" 
                stroke="#0891b2" 
                fill="url(#colorMag)" 
                strokeWidth={3}
                animationDuration={800}
              />
              <Area 
                name="S11 (Return Loss)"
                type="monotone" 
                dataKey="s11" 
                stroke="#f43f5e" 
                fill="url(#colorS11)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Phase Response Plot */}
      <div className="relative">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
           <i className="fas fa-wave-square text-amber-500"></i> Phase Response (Degrees)
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 5" stroke="#e2e8f0" />
              <XAxis 
                dataKey="frequency" 
                scale="log" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                type="number"
                stroke="#cbd5e1"
              />
              <YAxis 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                stroke="#cbd5e1"
                label={{ value: 'Phase (Deg)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                name="Phase Shift"
                type="monotone" 
                dataKey="phase" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-center mt-4 gap-8">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-cyan-600 rounded"></div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">S21</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 border-2 border-rose-500 border-dashed rounded"></div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">S11</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-amber-500 rounded"></div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Phase</span>
           </div>
        </div>
    </div>
  );
};

export default Visuals;
