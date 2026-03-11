import * as fs from 'fs';
import * as os from 'os';

import { findCodexCliPath, resolveCodexCliPath, resolveConfiguredCodexCliPath } from '@/utils/codexCli';

jest.mock('fs');
jest.mock('os');

describe('codexCli', () => {
  const mockedExists = fs.existsSync as jest.Mock;
  const mockedStat = fs.statSync as jest.Mock;
  const mockedHome = os.homedir as jest.Mock;
  const mockedHostname = os.hostname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedHome.mockReturnValue('/Users/test');
    mockedHostname.mockReturnValue('test-host');
    mockedExists.mockReturnValue(false);
    mockedStat.mockReturnValue({ isFile: () => true });
  });

  describe('findCodexCliPath', () => {
    it('finds codex from a provided PATH entry', () => {
      mockedExists.mockImplementation((target: string) => target === '/custom/bin/codex');

      expect(findCodexCliPath('/custom/bin')).toBe('/custom/bin/codex');
    });

    it('falls back to common install locations', () => {
      mockedExists.mockImplementation((target: string) => target === '/opt/homebrew/bin/codex');

      expect(findCodexCliPath('')).toBe('/opt/homebrew/bin/codex');
    });
  });

  describe('resolveConfiguredCodexCliPath', () => {
    it('prefers hostname-specific configured path', () => {
      mockedExists.mockImplementation((target: string) => target === '/configured/host/codex');

      const result = resolveConfiguredCodexCliPath(
        { 'test-host': '/configured/host/codex' },
        '/configured/legacy/codex',
        ''
      );

      expect(result).toBe('/configured/host/codex');
    });

    it('falls back to legacy configured path', () => {
      mockedExists.mockImplementation((target: string) => target === '/configured/legacy/codex');

      const result = resolveConfiguredCodexCliPath(
        { 'other-host': '/configured/host/codex' },
        '/configured/legacy/codex',
        ''
      );

      expect(result).toBe('/configured/legacy/codex');
    });

    it('falls back to environment PATH auto-detection', () => {
      mockedExists.mockImplementation((target: string) => target === '/env/bin/codex');

      const result = resolveConfiguredCodexCliPath({}, '', 'PATH=/env/bin');

      expect(result).toBe('/env/bin/codex');
    });
  });

  describe('resolveCodexCliPath', () => {
    it('uses environment PATH when no manual paths are provided', () => {
      mockedExists.mockImplementation((target: string) => target === '/runtime/bin/codex');

      const result = resolveCodexCliPath('PATH=/runtime/bin');

      expect(result).toBe('/runtime/bin/codex');
    });
  });
});
