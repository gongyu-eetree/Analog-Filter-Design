
import { FilterParams, FilterType, FilterTopology, ApproximationType, SimulationDataPoint, ComponentValue } from '../types';

// Standard E-Series Bases
const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
const E24 = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];

/**
 * Snaps a value to the nearest standard component value in the given E-series
 */
function snapToStandardValue(val: number, series: number[]): number {
  if (val <= 0 || !isFinite(val)) return 0;
  
  const exponent = Math.floor(Math.log10(val));
  const base = val / Math.pow(10, exponent);
  
  // Find the closest value in the series
  let closest = series[0];
  let minDiff = Math.abs(base - series[0]);
  
  for (let i = 1; i < series.length; i++) {
    const diff = Math.abs(base - series[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = series[i];
    }
  }
  
  // Handle wraparound (e.g. 9.8 -> 10.0)
  const nextDecadeDiff = Math.abs(base - 10.0);
  if (nextDecadeDiff < minDiff) {
    return Math.pow(10, exponent + 1);
  }

  return closest * Math.pow(10, exponent);
}

/**
 * Professional S-parameter Simulation and Synthesis using standard component values
 */
export function calculateComponentValues(params: FilterParams): ComponentValue[] {
  const components: ComponentValue[] = [];
  const Rs = params.rs;
  const Rl = params.rl;
  const wc = 2 * Math.PI * params.cutoffFreq;
  const n = params.order;

  if (params.topology === FilterTopology.PASSIVE) {
    const isElliptic = params.approximation === ApproximationType.ELLIPTIC;
    
    for (let i = 0; i < n; i++) {
      const isSeries = i % 2 === 0;
      
      if (isElliptic && !isSeries && i > 0 && i < n - 1) {
        // Shunt Resonator
        const idealL = (1.2 * Rs) / wc;
        const idealC = 0.8 / (wc * Rs);
        components.push({ 
          label: `L${i+1}z`, 
          value: formatValue(snapToStandardValue(idealL, E12)), 
          unit: 'H', 
          type: 'L' 
        });
        components.push({ 
          label: `C${i+1}z`, 
          value: formatValue(snapToStandardValue(idealC, E12)), 
          unit: 'F', 
          type: 'C' 
        });
      } else {
        if (params.type === FilterType.LOW_PASS) {
          if (isSeries) {
            const idealL = Rs / wc;
            components.push({ 
              label: `L${i+1}`, 
              value: formatValue(snapToStandardValue(idealL, E12)), 
              unit: 'H', 
              type: 'L' 
            });
          } else {
            const idealC = 1 / (wc * Rs);
            components.push({ 
              label: `C${i+1}`, 
              value: formatValue(snapToStandardValue(idealC, E12)), 
              unit: 'F', 
              type: 'C' 
            });
          }
        } else {
           if (isSeries) {
            const idealC = 1 / (wc * Rs);
            components.push({ 
              label: `C${i+1}`, 
              value: formatValue(snapToStandardValue(idealC, E12)), 
              unit: 'F', 
              type: 'C' 
            });
          } else {
            const idealL = Rs / wc;
            components.push({ 
              label: `L${i+1}`, 
              value: formatValue(snapToStandardValue(idealL, E12)), 
              unit: 'H', 
              type: 'L' 
            });
          }
        }
      }
    }
  } else {
    // Active Synthesis: Pick a standard Cap, then find standard Resistors
    let C_val = 10e-9;
    if (params.cutoffFreq > 1e6) C_val = 100e-12; 
    if (params.cutoffFreq < 100) C_val = 1e-6;    
    
    const standardC = snapToStandardValue(C_val, E12);
    const idealR = 1 / (wc * standardC);
    const standardR = snapToStandardValue(idealR, E24);

    components.push({ label: 'R1', value: formatValue(standardR), unit: 'Ω', type: 'R', stage: 1 });
    components.push({ label: 'R2', value: formatValue(standardR), unit: 'Ω', type: 'R', stage: 1 });
    components.push({ label: 'C1', value: formatValue(standardC), unit: 'F', type: 'C', stage: 1 });
    components.push({ label: 'C2', value: formatValue(standardC), unit: 'F', type: 'C', stage: 1 });
  }

  return components;
}

export function calculateFrequencyResponse(params: FilterParams): SimulationDataPoint[] {
  const points: SimulationDataPoint[] = [];
  const f0 = params.cutoffFreq;
  const startFreq = Math.max(0.1, params.simStartFreq);
  const endFreq = params.simEndFreq;
  const steps = params.simPoints;
  const logStart = Math.log10(startFreq);
  const logStep = (Math.log10(endFreq) - logStart) / steps;

  const n = params.order;
  const eps = Math.sqrt(Math.pow(10, params.ripple / 10) - 1);
  const As = params.stopbandAtten;

  for (let i = 0; i <= steps; i++) {
    const f = Math.pow(10, logStart + i * logStep);
    const x = f / f0;
    let mag_db = 0;
    let s11_db = -20;
    let phase = 0;

    if (params.approximation === ApproximationType.BUTTERWORTH) {
      mag_db = -10 * Math.log10(1 + Math.pow(x, 2 * n));
      // Basic phase approximation: -90 degrees per order at high frequency
      phase = - (n * 90) * (Math.atan(x) / (Math.PI/2));
    } else if (params.approximation === ApproximationType.CHEBYSHEV) {
      const Cn = x <= 1 ? Math.cos(n * Math.acos(x)) : Math.cosh(n * Math.acosh(x));
      mag_db = -10 * Math.log10(1 + eps * eps * Cn * Cn);
      phase = - (n * 90) * (Math.atan(x) / (Math.PI/2)) * 1.1; // Slightly steeper phase
    } else if (params.approximation === ApproximationType.ELLIPTIC) {
      const transitionWidth = 1.1 + (0.5 / n);
      if (x <= 1) {
        const Cn = Math.cos(n * Math.acos(x));
        mag_db = -10 * Math.log10(1 + eps * eps * Cn * Cn);
      } else if (x < transitionWidth) {
        mag_db = -params.ripple - (As - params.ripple) * (x - 1) / (transitionWidth - 1);
      } else {
        const stopRipple = Math.sin(n * Math.PI * x / 5);
        mag_db = -As + 2 * stopRipple;
      }
      phase = - (n * 90) * (Math.atan(x) / (Math.PI/2)) * 1.3;
    }

    if (params.type === FilterType.HIGH_PASS) {
      const x_inv = 1 / x;
      if (params.approximation === ApproximationType.BUTTERWORTH) {
        mag_db = -10 * Math.log10(1 + Math.pow(x_inv, 2 * n));
      } else {
        if (x_inv <= 1) {
           const Cn = Math.cos(n * Math.acos(x_inv));
           mag_db = -10 * Math.log10(1 + eps * eps * Cn * Cn);
        } else {
           mag_db = -20 * Math.log10(x_inv * n); 
        }
      }
      phase = (n * 90) * (Math.atan(x_inv) / (Math.PI/2));
    }
    
    if (params.topology === FilterTopology.ACTIVE) {
      mag_db += 20 * Math.log10(params.gain);
    }

    const s21_lin = Math.pow(10, mag_db / 20);
    const s11_lin = Math.sqrt(Math.max(0, 1 - s21_lin * s21_lin));
    s11_db = 20 * Math.log10(Math.max(s11_lin, 1e-4));

    points.push({
      frequency: f,
      magnitude: parseFloat(mag_db.toFixed(2)),
      phase: parseFloat(phase.toFixed(2)),
      s11: parseFloat(s11_db.toFixed(2)),
      isPassband: params.type === FilterType.LOW_PASS ? f <= f0 : (params.type === FilterType.HIGH_PASS ? f >= f0 : false)
    });
  }
  return points;
}

function formatValue(v: number): string {
  if (v === 0 || !isFinite(v)) return '0';
  const units = ['', 'm', 'μ', 'n', 'p', 'f'];
  let unitIdx = 0;
  let val = Math.abs(v);
  
  if (val >= 1) {
    const kUnits = ['', 'k', 'M', 'G'];
    let kIdx = 0;
    while (val >= 1000 && kIdx < kUnits.length - 1) {
      val /= 1000;
      kIdx++;
    }
    return (val < 10 ? val.toFixed(1) : val.toFixed(0)).replace(/\.0$/, '') + kUnits[kIdx];
  }
  
  while (val < 0.99 && unitIdx < units.length - 1) {
    val *= 1000;
    unitIdx++;
  }
  
  return (val < 10 ? val.toFixed(1) : val.toFixed(0)).replace(/\.0$/, '') + units[unitIdx];
}
