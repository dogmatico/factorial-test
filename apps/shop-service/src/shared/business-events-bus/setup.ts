import type { Express } from 'express';

import { EventEmitter } from 'node:events';

/**
 * Internal augmentation. Other modules should use the helper functions
 * to access the business bus.
 * @private
 */
export interface ExpressWithEventBus extends Express {
	businessEvent: EventEmitter;
}

let _augmentedApp: ExpressWithEventBus;

export function setupBusinessEventsBus(app: Express) {
	const businessEvent = new EventEmitter();

	_augmentedApp = app as ExpressWithEventBus;
	_augmentedApp.businessEvent = businessEvent;
}

export function getAppWithEventBus() {
	return _augmentedApp;
}
