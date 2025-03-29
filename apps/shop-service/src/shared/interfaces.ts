interface APIError {
	/**
	 * Code for programmatic handling
	 */
	code: string;

	/**
	 * Human readable description
	 */
	description: string;

	/**
	 * UUID for helpdesk/debug
	 */
	id?: string;
}

export interface APIResponse<T> {
	isSuccess: boolean;
	data: T | null;
	errors: APIError[];
	warnings: APIError[];
}
