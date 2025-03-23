import type { BusinessEvent } from './interfaces.ts';
import { getAppWithEventBus } from './setup.ts';

export function dispatchBusinessEvent(event: BusinessEvent) {
	const { businessEvent } = getAppWithEventBus();

	businessEvent.emit(event.type, { event });
}
