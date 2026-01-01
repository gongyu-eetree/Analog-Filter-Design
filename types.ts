
export enum FilterType {
  LOW_PASS = 'LOW_PASS',
  HIGH_PASS = 'HIGH_PASS',
  BAND_PASS = 'BAND_PASS',
}

export enum FilterTopology {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
}

export enum ApproximationType {
  BUTTERWORTH = 'BUTTERWORTH',
  CHEBYSHEV = 'CHEBYSHEV',
  ELLIPTIC = 'ELLIPTIC',
}

export enum OptimizationGoal {
  MIN_NOISE = 'MIN_NOISE',
  MIN_COMPONENTS = 'MIN_COMPONENTS',
  MAX_POWER_EFFICIENCY = 'MAX_POWER_EFFICIENCY'
}

export interface FilterParams {
  type: FilterType;
  topology: FilterTopology;
  approximation: ApproximationType;
  ripple: number; // dB for Chebyshev/Elliptic passband
  stopbandAtten: number; // dB for Elliptic stopband
  order: number;
  cutoffFreq: number;
  cutoffFreq2?: number;
  rs: number; // Source Impedance
  rl: number; // Load Impedance
  gain: number;
  optimization: OptimizationGoal;
  // Simulation Range Parameters
  simStartFreq: number;
  simEndFreq: number;
  simPoints: number;
}

export interface SimulationDataPoint {
  frequency: number;
  magnitude: number;
  phase: number;
  s11: number; // Return Loss in dB
  isPassband: boolean;
}

export interface ComponentValue {
  label: string;
  value: string;
  unit: string;
  stage?: number;
  type: 'L' | 'C' | 'R' | 'LC_SERIES' | 'LC_PARALLEL';
}
