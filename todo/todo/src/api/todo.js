import Dexie from 'dexie';
import { startOfToday, endOfToday } from '../utils/date';

const db = new Dexie('todo_indexeddb');
db.version(1).stores({
	todos: '++id, title, description, important, deadline, done, createdAt'
});
db.version(2).stores({
	todos: '++id, title, description, important, deadline, done, createdAt, startTime, endTime, status'
}).upgrade(async (tx) => {
	// 迁移旧数据：将deadline作为endTime，startTime设为null，status设为pending
	await tx.table('todos').toCollection().modify((todo) => {
		todo.startTime = null;
		todo.endTime = todo.deadline;
		todo.status = todo.done ? 'completed' : 'pending';
	});
});

export async function add({ title, description = '', important = false, deadline, startTime, endTime }) {
	const now = new Date();
	const id = await db.table('todos').add({
		title: String(title).trim(),
		description: description ? String(description).trim() : '',
		important: !!important,
		deadline: deadline ? new Date(deadline).toISOString() : null, // 保留兼容性
		startTime: startTime ? new Date(startTime).toISOString() : null,
		endTime: endTime ? new Date(endTime).toISOString() : null,
		done: false,
		status: 'pending', // pending, inProgress, completed, partiallyDone
		createdAt: now.toISOString()
	});
	return id;
}

export async function done(id, value = true) {
	await db.table('todos').update(id, { 
		done: !!value,
		status: value ? 'completed' : 'pending'
	});
}

export async function updateStatus(id, status) {
	await db.table('todos').update(id, { 
		status,
		done: status === 'completed'
	});
}

export async function updateStartTime(id, startTime) {
	await db.table('todos').update(id, { 
		startTime: startTime ? new Date(startTime).toISOString() : null
	});
}

export async function updateEndTime(id, endTime) {
	await db.table('todos').update(id, { 
		endTime: endTime ? new Date(endTime).toISOString() : null
	});
}

export async function getById(id) {
	return await db.table('todos').get(id);
}

export async function remove(id) {
	await db.table('todos').delete(id);
}

export async function listToday(baseDate = new Date()) {
	const start = startOfToday(baseDate).toISOString();
	const end = endOfToday(baseDate).toISOString();
	const all = await db.table('todos').toArray();
	const today = all.filter(t => {
		// 优先使用 startTime 和 endTime，如果没有则使用 deadline（兼容旧数据）
		const taskStart = t.startTime || t.deadline;
		const taskEnd = t.endTime || t.deadline;
		
		// 如果都没有时间，不显示
		if (!taskStart && !taskEnd) return false;
		
		// 开始时间在今天，或结束时间在今天，或任务跨今天
		const startDate = taskStart ? new Date(taskStart) : null;
		const endDate = taskEnd ? new Date(taskEnd) : null;
		const todayStart = new Date(start);
		const todayEnd = new Date(end);
		
		// 开始时间在今天
		if (startDate && startDate >= todayStart && startDate <= todayEnd) return true;
		// 结束时间在今天
		if (endDate && endDate >= todayStart && endDate <= todayEnd) return true;
		// 任务跨今天（开始时间在今天之前，结束时间在今天之后）
		if (startDate && endDate && startDate <= todayStart && endDate >= todayEnd) return true;
		// 兼容旧数据：使用 deadline
		if (t.deadline) {
			const deadline = new Date(t.deadline);
			if (deadline >= todayStart && deadline <= todayEnd) return true;
		}
		
		return false;
	});
	return sortTodos(today);
}

export async function listTomorrow(baseDate = new Date()) {
	const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1, 0, 0, 0, 0).toISOString();
	const end = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1, 23, 59, 59, 999).toISOString();
	const all = await db.table('todos').toArray();
	const ts = all.filter(t => {
		// 优先使用 startTime 和 endTime，如果没有则使用 deadline（兼容旧数据）
		const taskStart = t.startTime || t.deadline;
		const taskEnd = t.endTime || t.deadline;
		
		// 如果都没有时间，不显示
		if (!taskStart && !taskEnd) return false;
		
		// 开始时间在明天，或结束时间在明天，或任务跨明天
		const startDate = taskStart ? new Date(taskStart) : null;
		const endDate = taskEnd ? new Date(taskEnd) : null;
		const tomorrowStart = new Date(start);
		const tomorrowEnd = new Date(end);
		
		// 开始时间在明天
		if (startDate && startDate >= tomorrowStart && startDate <= tomorrowEnd) return true;
		// 结束时间在明天
		if (endDate && endDate >= tomorrowStart && endDate <= tomorrowEnd) return true;
		// 任务跨明天（开始时间在明天之前，结束时间在明天之后）
		if (startDate && endDate && startDate <= tomorrowStart && endDate >= tomorrowEnd) return true;
		// 兼容旧数据：使用 deadline
		if (t.deadline) {
			const deadline = new Date(t.deadline);
			if (deadline >= tomorrowStart && deadline <= tomorrowEnd) return true;
		}
		
		return false;
	});
	return sortTodos(ts);
}

export async function listAll() {
	const all = await db.table('todos').toArray();
	return sortTodos(all);
}

function sortTodos(list) {
	return [...list].sort((a, b) => {
		// 先 important=1 再时间 ASC，同组内时间升序
		if (a.important !== b.important) return a.important ? -1 : 1;
		// 优先使用 startTime，如果没有则使用 endTime，最后使用 deadline
		const da = (a.startTime ? new Date(a.startTime).getTime() : 
		           (a.endTime ? new Date(a.endTime).getTime() : 
		           (a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER)));
		const dbt = (b.startTime ? new Date(b.startTime).getTime() : 
		            (b.endTime ? new Date(b.endTime).getTime() : 
		            (b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER)));
		if (da !== dbt) return da - dbt;
		// 创建时间作为稳定次序
		const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
		const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
		return ca - cb;
	});
}

export { db };


