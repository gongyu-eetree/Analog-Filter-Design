
import React from 'react';
import { ComponentValue, FilterTopology, FilterType, FilterParams, ApproximationType } from '../types';

interface CircuitViewProps {
  params: FilterParams;
  components: ComponentValue[];
}

const CircuitView: React.FC<CircuitViewProps> = ({ params, components }) => {
  const isPassive = params.topology === FilterTopology.PASSIVE;
  const isLPF = params.type === FilterType.LOW_PASS;
  const isElliptic = params.approximation === ApproximationType.ELLIPTIC;

  // Render Symbols
  const Inductor = ({ x, y, label, value, horizontal = true }: any) => (
    <g transform={`translate(${x},${y})`}>
      <path 
        d={horizontal ? "M 0 0 L 10 0 C 10 -10, 20 -10, 20 0 C 20 -10, 30 -10, 30 0 C 30 -10, 40 -10, 40 0 L 50 0" : "M 0 0 L 0 10 C -10 10, -10 20, 0 20 C -10 20, -10 30, 0 30 C -10 30, -10 40, 0 40 L 0 50"} 
        stroke="currentColor" fill="none" strokeWidth="1.5"
      />
      <text x={horizontal ? 25 : 12} y={horizontal ? -15 : 25} fontSize="8" className="font-bold fill-slate-900" textAnchor="middle">{label}</text>
      <text x={horizontal ? 25 : 12} y={horizontal ? -5 : 35} fontSize="7" className="fill-cyan-600 font-mono" textAnchor="middle">{value}</text>
    </g>
  );

  const Capacitor = ({ x, y, label, value, horizontal = true }: any) => (
    <g transform={`translate(${x},${y})`}>
      {horizontal ? (
        <path d="M 0 0 L 20 0 M 20 -10 L 20 10 M 30 -10 L 30 10 M 30 0 L 50 0" stroke="currentColor" fill="none" strokeWidth="1.5"/>
      ) : (
        <path d="M 0 0 L 0 20 M -10 20 L 10 20 M -10 30 L 10 30 M 0 30 L 0 50" stroke="currentColor" fill="none" strokeWidth="1.5"/>
      )}
      <text x={horizontal ? 25 : 15} y={horizontal ? -15 : 25} fontSize="8" className="font-bold fill-slate-900" textAnchor="middle">{label}</text>
      <text x={horizontal ? 25 : 15} y={horizontal ? -5 : 35} fontSize="7" className="fill-cyan-600 font-mono" textAnchor="middle">{value}</text>
    </g>
  );

  const Resonator = ({ x, y, labelL, valL, labelC, valC }: any) => (
    <g transform={`translate(${x},${y})`}>
       <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
       <g transform="translate(-25, 10)">
          <Inductor x={0} y={0} label={labelL} value={valL} horizontal={false} />
       </g>
       <g transform="translate(25, 10)">
          <Capacitor x={0} y={0} label={labelC} value={valC} horizontal={false} />
       </g>
       <path d="M -25 10 L 25 10 M -25 60 L 25 60" stroke="currentColor" strokeWidth="1.5" />
       <line x1="0" y1="60" x2="0" y2="70" stroke="currentColor" strokeWidth="1.5" />
    </g>
  );

  const Resistor = ({ x, y, label, value, horizontal = true }: any) => (
    <g transform={`translate(${x},${y})`}>
      <path 
        d={horizontal ? "M 0 0 L 10 0 L 13 -5 L 18 5 L 23 -5 L 28 5 L 33 -5 L 38 5 L 40 0 L 50 0" : "M 0 0 L 0 10 L -5 13 L 5 18 L -5 23 L 5 28 L -5 33 L 5 38 L 0 40 L 0 50"} 
        stroke="currentColor" fill="none" strokeWidth="1.5"
      />
      <text x={horizontal ? 25 : 12} y={horizontal ? -15 : 25} fontSize="8" className="font-bold fill-slate-900" textAnchor="middle">{label}</text>
      <text x={horizontal ? 25 : 12} y={horizontal ? -5 : 35} fontSize="7" className="fill-cyan-600 font-mono" textAnchor="middle">{value}</text>
    </g>
  );

  const Ground = ({ x, y }: any) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="-8" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="-5" y1="3" x2="5" y2="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="-2" y1="6" x2="2" y2="6" stroke="currentColor" strokeWidth="1.5"/>
    </g>
  );

  const renderPassiveLadder = () => {
    let xOffset = 20;
    const yBaseline = 60;
    const nodes: React.ReactElement[] = [];

    // Source Resistor
    nodes.push(<Resistor key="rs" x={xOffset} y={yBaseline} label="Rs" value={`${params.rs}Ω`} horizontal={true} />);
    xOffset += 50;

    // Build unique set of stage numbers
    const stages = Math.ceil(params.order);
    
    for (let i = 0; i < stages; i++) {
      const isSeries = i % 2 === 0;
      const compL = components.find(c => c.label === `L${i+1}`);
      const compC = components.find(c => c.label === `C${i+1}`);
      const compLz = components.find(c => c.label === `L${i+1}z`);
      const compCz = components.find(c => c.label === `C${i+1}z`);

      if (isSeries) {
        if (compL) nodes.push(<Inductor key={`ser-${i}`} x={xOffset} y={yBaseline} label={compL.label} value={compL.value + compL.unit} />);
        else if (compC) nodes.push(<Capacitor key={`ser-${i}`} x={xOffset} y={yBaseline} label={compC.label} value={compC.value + compC.unit} />);
        else nodes.push(<line key={`link-${i}`} x1={xOffset} y1={yBaseline} x2={xOffset+50} y2={yBaseline} stroke="currentColor" strokeWidth="1.5" />);
        xOffset += 50;
      } else {
        if (compLz && compCz) {
           nodes.push(<Resonator key={`res-${i}`} x={xOffset} y={yBaseline} labelL={compLz.label} valL={compLz.value + compLz.unit} labelC={compCz.label} valC={compCz.value + compCz.unit} />);
           nodes.push(<Ground key={`gnd-${i}`} x={xOffset} y={yBaseline + 70 + 60} />);
        } else if (compC) {
           nodes.push(<line key={`line-${i}`} x1={xOffset} y1={yBaseline} x2={xOffset} y2={yBaseline+10} stroke="currentColor" strokeWidth="1.5" />);
           nodes.push(<Capacitor key={`sh-${i}`} x={xOffset} y={yBaseline + 10} label={compC.label} value={compC.value + compC.unit} horizontal={false} />);
           nodes.push(<Ground key={`gnd-${i}`} x={xOffset} y={yBaseline + 60} />);
        } else if (compL) {
           nodes.push(<line key={`line-${i}`} x1={xOffset} y1={yBaseline} x2={xOffset} y2={yBaseline+10} stroke="currentColor" strokeWidth="1.5" />);
           nodes.push(<Inductor key={`sh-${i}`} x={xOffset} y={yBaseline + 10} label={compL.label} value={compL.value + compL.unit} horizontal={false} />);
           nodes.push(<Ground key={`gnd-${i}`} x={xOffset} y={yBaseline + 60} />);
        }
      }
    }

    // Final connector and Load
    nodes.push(<line key="final-link" x1={xOffset} y1={yBaseline} x2={xOffset + 20} y2={yBaseline} stroke="currentColor" strokeWidth="1.5" />);
    xOffset += 20;
    nodes.push(<line key="rl-down" x1={xOffset} y1={yBaseline} x2={xOffset} y2={yBaseline + 10} stroke="currentColor" strokeWidth="1.5" />);
    nodes.push(<Resistor key="rl" x={xOffset} y={yBaseline + 10} label="Rl" value={`${params.rl}Ω`} horizontal={false} />);
    nodes.push(<Ground key="gnd-rl" x={xOffset} y={yBaseline + 60} />);

    return nodes;
  };

  const renderActiveSchematic = () => {
    return (
      <g transform="translate(40, 40)">
        <path d="M 0 40 L 20 40" stroke="currentColor" strokeWidth="1.5" />
        <Resistor x={20} y={40} label="R1" value={components.find(c => c.label === 'R1')?.value + 'Ω'} />
        <Resistor x={70} y={40} label="R2" value={components.find(c => c.label === 'R2')?.value + 'Ω'} />
        <path d="M 120 40 L 140 40" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 140 20 L 140 80 L 190 50 Z" stroke="currentColor" fill="white" strokeWidth="1.5" />
        <text x="145" y="45" fontSize="10" className="fill-slate-400">+</text>
        <text x="145" y="65" fontSize="10" className="fill-slate-400">-</text>
        <path d="M 190 50 L 210 50" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 70 40 L 70 10 L 165 10 L 165 25" stroke="currentColor" fill="none" strokeWidth="1.5" />
        <Capacitor x={100} y={10} label="C1" value={components.find(c => c.label === 'C1')?.value + 'F'} />
        <path d="M 130 40 L 130 50" stroke="currentColor" strokeWidth="1.5" />
        <Capacitor x={130} y={50} label="C2" value={components.find(c => c.label === 'C2')?.value + 'F'} horizontal={false} />
        <Ground x={130} y={100} />
      </g>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          <i className="fas fa-microchip mr-2 text-cyan-600"></i> Engineering Schematic
        </h3>
        <div className="flex gap-2">
           <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black rounded uppercase text-slate-500">IEEE Std 315</span>
           <span className="px-2 py-0.5 bg-cyan-100 text-[8px] font-black rounded uppercase text-cyan-700">{params.approximation}</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto overflow-y-hidden border border-slate-100 rounded-xl bg-slate-50/30 p-4 custom-scrollbar">
        <svg 
          width={isPassive ? 200 + (params.order * 60) : 350} 
          height={isElliptic ? 220 : 180} 
          viewBox={`0 0 ${isPassive ? 200 + (params.order * 60) : 350} ${isElliptic ? 220 : 180}`} 
          className="text-slate-400 mx-auto"
        >
          {isPassive ? renderPassiveLadder() : renderActiveSchematic()}
        </svg>
      </div>

      <div className="mt-6">
         <div className="flex items-center justify-between mb-3">
           <span className="text-[10px] font-black text-slate-400 uppercase">Component Bill of Materials</span>
           <span className="text-[9px] font-bold text-slate-300">Total: {components.length} Items</span>
         </div>
         <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
            {components.map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-mono font-bold text-slate-600">{comp.label}</span>
                <span className="text-[10px] font-mono font-black text-cyan-600">{comp.value}{comp.unit}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default CircuitView;
