export function startOfToday(date = new Date()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfToday(date = new Date()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function startOfTomorrow(date = new Date()) {
	const t = new Date(date);
	t.setDate(t.getDate() + 1);
	return startOfToday(t);
}

export function endOfTomorrow(date = new Date()) {
	const t = new Date(date);
	t.setDate(t.getDate() + 1);
	return endOfToday(t);
}

export function formatDateTime(dt) {
	if (!dt) return '';
	const d = typeof dt === 'string' || typeof dt === 'number' ? new Date(dt) : dt;
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `${y}-${m}-${day} ${hh}:${mm}`;
}


