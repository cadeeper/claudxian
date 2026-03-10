import type ClaudianPlugin from '../../main';
import type { McpServerManager } from '../mcp';
import { BACKEND_CLAUDE, BACKEND_CODEX, type BackendId } from '../types';
import type { AgentSessionService } from './AgentSessionService';
import { ClaudianService } from './ClaudianService';
import { CodexSessionService } from './CodexSessionService';

/**
 * Creates a concrete session service for the requested backend.
 *
 * Today only Claude is implemented. The switch lives here so future backends
 * can be added without touching the chat UI wiring again.
 */
export function createAgentSessionService(
  plugin: ClaudianPlugin,
  mcpManager: McpServerManager,
  backendId: BackendId,
): AgentSessionService {
  switch (backendId) {
    case BACKEND_CLAUDE:
      return new ClaudianService(plugin, mcpManager);
    case BACKEND_CODEX:
      return new CodexSessionService(plugin, mcpManager);
    default:
      throw new Error(`Backend "${backendId}" is not implemented yet.`);
  }
}
