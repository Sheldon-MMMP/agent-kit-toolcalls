type ProcessLike = {
  env?: Record<string, string | undefined>;
};

export function readEnv(name: string): string | undefined {
  const processLike = (globalThis as typeof globalThis & {
    process?: ProcessLike;
  }).process;

  return processLike?.env?.[name];
}
