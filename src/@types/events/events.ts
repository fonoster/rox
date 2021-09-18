export interface EventEmitter {
  send(payload?: Record<string, string>): void
}
