import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { parseEnvironmentVariables } from './env';
import { expandHomePath, parsePathEntries, resolveNvmDefaultBin } from './path';

function isExistingFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function dedupePaths(entries: string[]): string[] {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = process.platform === 'win32' ? entry.toLowerCase() : entry;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function findFirstExistingPath(entries: string[], candidates: string[]): string | null {
  for (const dir of entries) {
    for (const candidate of candidates) {
      const fullPath = path.join(dir, candidate);
      if (isExistingFile(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

function resolveCodexFromPathEntries(entries: string[]): string | null {
  if (entries.length === 0) {
    return null;
  }

  const candidates = process.platform === 'win32'
    ? ['codex.exe', 'codex']
    : ['codex'];

  return findFirstExistingPath(entries, candidates);
}

export function findCodexCliPath(pathValue?: string): string | null {
  const homeDir = os.homedir();
  const customEntries = dedupePaths(parsePathEntries(pathValue));
  const customResolution = resolveCodexFromPathEntries(customEntries);
  if (customResolution) {
    return customResolution;
  }

  const commonPaths: string[] = process.platform === 'win32'
    ? [
        path.join(homeDir, 'AppData', 'Roaming', 'npm', 'codex.exe'),
        path.join(homeDir, 'AppData', 'Local', 'Programs', 'Codex', 'codex.exe'),
        path.join(homeDir, '.local', 'bin', 'codex.exe'),
      ]
    : [
        path.join(homeDir, '.local', 'bin', 'codex'),
        path.join(homeDir, '.volta', 'bin', 'codex'),
        path.join(homeDir, '.asdf', 'shims', 'codex'),
        path.join(homeDir, '.asdf', 'bin', 'codex'),
        path.join(homeDir, 'bin', 'codex'),
        path.join(homeDir, '.npm-global', 'bin', 'codex'),
        '/usr/local/bin/codex',
        '/opt/homebrew/bin/codex',
      ];

  const npmPrefix = process.env.npm_config_prefix;
  if (npmPrefix) {
    commonPaths.push(
      process.platform === 'win32'
        ? path.join(expandHomePath(npmPrefix), 'codex.exe')
        : path.join(expandHomePath(npmPrefix), 'bin', 'codex')
    );
  }

  const nvmBin = resolveNvmDefaultBin(homeDir);
  if (nvmBin) {
    commonPaths.push(path.join(nvmBin, process.platform === 'win32' ? 'codex.exe' : 'codex'));
  }

  for (const candidate of commonPaths) {
    if (isExistingFile(candidate)) {
      return candidate;
    }
  }

  const envEntries = dedupePaths(parsePathEntries(process.env.PATH));
  return resolveCodexFromPathEntries(envEntries);
}

export function resolveCodexCliPath(envText: string): string | null {
  const customEnv = parseEnvironmentVariables(envText || '');
  return findCodexCliPath(customEnv.PATH);
}
