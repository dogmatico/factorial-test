import type { BusinessEventHandler } from './interfaces.ts';
import { getAppWithEventBus } from './setup.ts';

export function registerBusinessEventHandler<
	T extends { type: string } = { type: string },
>(eventType: string, handler: BusinessEventHandler<T>): () => void {
	const { businessEvent } = getAppWithEventBus();

	businessEvent.addListener(eventType, handler);

	return () => businessEvent.removeListener(eventType, handler);
}
