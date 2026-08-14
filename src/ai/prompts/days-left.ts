export function daysLeft(expiryDate: Date): number {
	return Math.max(
		0,
		Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000)
	)
}
