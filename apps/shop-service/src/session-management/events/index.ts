export interface UserLoggedInEvent {
	type: 'shop-service/session-management/USER_LOGGED_IN';
	userId: string;
}

export function makeUserLoggedInEvent(payload: {
	userId: string;
}): UserLoggedInEvent {
	return {
		type: 'shop-service/session-management/USER_LOGGED_IN',
		...payload,
	};
}

export interface UserLoggedOutEvent {
	type: 'shop-service/session-management/USER_LOGGED_OUT';
	userId: string;
}
export function makeUserLoggedOutEvent(payload: {
	userId: string;
}): UserLoggedOutEvent {
	return {
		type: 'shop-service/session-management/USER_LOGGED_OUT',
		...payload,
	};
}
