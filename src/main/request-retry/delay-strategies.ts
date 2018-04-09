export type DelayStrategy = (attempt: number) => number;

function ExponentialBackoff(base: number): DelayStrategy {
  return attempt => base * 2 ** attempt;
}

export const DelayStrategies = {
  ExponentialBackoff: ExponentialBackoff
};
