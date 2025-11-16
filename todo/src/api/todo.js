import Dexie from 'dexie';
import { startOfToday, endOfToday } from '../utils/date';

const db = new Dexie('todo_indexeddb');
db.version(1).stores({
	todos: '++id, title, description, important, deadline, done, createdAt'
});

export async function add({ title, description = '', important = false, deadline }) {
	const now = new Date();
	const id = await db.table('todos').add({
		title: String(title).trim(),
		description: description ? String(description).trim() : '',
		important: !!important,
		deadline: deadline ? new Date(deadline).toISOString() : null,
		done: false,
		createdAt: now.toISOString()
	});
	return id;
}

export async function done(id, value = true) {
	await db.table('todos').update(id, { done: !!value });
}

export async function remove(id) {
	await db.table('todos').delete(id);
}

export async function listToday(baseDate = new Date()) {
	const start = startOfToday(baseDate).toISOString();
	const end = endOfToday(baseDate).toISOString();
	const all = await db.table('todos').toArray();
	const today = all.filter(t => {
		if (!t.deadline) return false;
		return t.deadline >= start && t.deadline <= end;
	});
	return sortTodos(today);
}

export async function listTomorrow(baseDate = new Date()) {
	const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1, 0, 0, 0, 0).toISOString();
	const end = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1, 23, 59, 59, 999).toISOString();
	const all = await db.table('todos').toArray();
	const ts = all.filter(t => {
		if (!t.deadline) return false;
		return t.deadline >= start && t.deadline <= end;
	});
	return sortTodos(ts);
}

export async function listAll() {
	const all = await db.table('todos').toArray();
	return sortTodos(all);
}

function sortTodos(list) {
	return [...list].sort((a, b) => {
		// 先 important=1 再 deadline ASC，同组内时间升序
		if (a.important !== b.important) return a.important ? -1 : 1;
		const da = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
		const dbt = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
		if (da !== dbt) return da - dbt;
		// 创建时间作为稳定次序
		const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
		const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
		return ca - cb;
	});
}

export { db };


