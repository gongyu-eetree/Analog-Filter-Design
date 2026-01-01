
// Butterworth polynomial coefficients (Standard Normalized)
// Index corresponds to order n
export const BUTTERWORTH_POLYNOMIALS: { [key: number]: number[] } = {
  1: [1, 1],
  2: [1, 1.414, 1],
  3: [1, 2, 2, 1],
  4: [1, 2.613, 3.414, 2.613, 1],
  5: [1, 3.236, 5.236, 5.236, 3.236, 1],
  6: [1, 3.864, 7.464, 9.142, 7.464, 3.864, 1],
  7: [1, 4.494, 10.098, 14.592, 14.592, 10.098, 4.494, 1],
};

// g-values for LC filter design (Butterworth)
export const G_VALUES: { [key: number]: number[] } = {
  1: [2.000],
  2: [1.414, 1.414],
  3: [1.000, 2.000, 1.000],
  4: [0.7654, 1.8478, 1.8478, 0.7654],
  5: [0.6180, 1.6180, 2.0000, 1.6180, 0.6180],
  6: [0.5176, 1.4142, 1.9318, 1.9318, 1.4142, 0.5176],
  7: [0.4450, 1.2470, 1.8019, 2.0000, 1.8019, 1.2470, 0.4450],
};
