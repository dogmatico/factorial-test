export type BusinessEvent<T = unknown> = T & { type: string };

export type BusinessEventHandler<
	T extends { type: string } = { type: string },
> = (payload: {
	event: T;
}) => void;
