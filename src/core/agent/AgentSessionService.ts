import type { RewindFilesResult } from '@anthropic-ai/claude-agent-sdk';

import type { BackendCapabilities, BackendId, ChatMessage, Conversation, ImageAttachment, SlashCommand, StreamChunk } from '../types';
import type { ExitPlanModeCallback } from '../types';
import type {
  ApprovalCallback,
  AskUserQuestionCallback,
  EnsureReadyOptions,
  QueryOptions,
} from './ClaudianService';
import type { ApprovalCallbackOptions } from './ClaudianService';
import type { ClosePersistentQueryOptions } from './types';

/**
 * Runtime-agnostic chat session interface used by the UI layer.
 *
 * ClaudianService is the first concrete implementation. Future backends
 * (for example Codex) can implement the same surface without forcing the
 * chat feature to depend on Claude-specific internals.
 */
export interface AgentSessionService {
  getBackendId(): BackendId;
  getBackendCapabilities(): BackendCapabilities;
  onReadyStateChange(listener: (ready: boolean) => void): () => void;
  setPendingResumeAt(uuid: string | undefined): void;
  applyForkState(conv: Pick<Conversation, 'sessionId' | 'sdkSessionId' | 'forkSource'>): string | null;
  ensureReady(options?: EnsureReadyOptions): Promise<boolean>;
  closePersistentQuery(reason?: string, options?: ClosePersistentQueryOptions): void;
  query(
    prompt: string,
    images?: ImageAttachment[],
    previousMessages?: ChatMessage[],
    queryOptions?: QueryOptions,
  ): AsyncGenerator<StreamChunk>;
  cancel(): void;
  resetSession(): void;
  reloadMcpServers(): Promise<void>;
  getSessionId(): string | null;
  consumeSessionInvalidation(): boolean;
  isReady(): boolean;
  setSessionId(id: string | null, externalContextPaths?: string[]): void;
  cleanup(): void;
  setApprovalCallback(callback: ApprovalCallback | null): void;
  setApprovalDismisser(dismisser: (() => void) | null): void;
  setAskUserQuestionCallback(callback: AskUserQuestionCallback | null): void;
  setExitPlanModeCallback(callback: ExitPlanModeCallback | null): void;
  setPermissionModeSyncCallback(callback: ((sdkMode: string) => void) | null): void;
  getSupportedCommands(): Promise<SlashCommand[]>;
  rewind(sdkUserUuid: string, sdkAssistantUuid: string): Promise<RewindFilesResult>;
}

export type { ApprovalCallbackOptions };
