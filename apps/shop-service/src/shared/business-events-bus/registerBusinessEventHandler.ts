import type { BusinessEventHandler } from './interfaces.ts';
import { getAppWithEventBus } from './setup.ts';

export function registerBusinessEventHandler(
	eventType: string,
	handler: BusinessEventHandler,
): () => void {
	const { businessEvent } = getAppWithEventBus();

	businessEvent.addListener(eventType, handler);

	return () => businessEvent.removeListener(eventType, handler);
}
