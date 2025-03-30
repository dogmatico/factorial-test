import type { UserLoggedInEvent } from '../../session-management/events/index.ts';
import { registerBusinessEventHandler } from '../../shared/business-events-bus/index.ts';
import { getOrderManagementService } from '../services/OrderManagementService.ts';

export function handleUserLoggedId() {
	registerBusinessEventHandler<UserLoggedInEvent>(
		'shop-service/session-management/USER_LOGGED_IN',
		({ event }) => {
			const orderManagementService = getOrderManagementService();
			// For testing purposes, hardcoded customer id;
			return orderManagementService.createSessionOrder(event.sessionId, 1);
		},
	);
}
