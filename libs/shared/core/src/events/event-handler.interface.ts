/**
 * Generic interface for domain event handlers.
 * Follows the Event-Driven Architecture pattern.
 *
 * @template TEvent The type of event this handler processes.
 */
export interface IEventHandler<TEvent> {
  /**
   * Handles the given domain event.
   * @param event The event to process.
   * @returns Promise that resolves when handling is complete.
   */
  handle(event: TEvent): Promise<void>;
}
