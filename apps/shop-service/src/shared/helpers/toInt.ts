/**
 * To normalize id of SQLite
 */
export function toInt(val: string | number): number {
	if (Number.isInteger(val)) {
		return val as number;
	}

	return Number.parseInt(val as string, 10);
}
