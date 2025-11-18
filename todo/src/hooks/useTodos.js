import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
	add as apiAdd, 
	done as apiDone, 
	remove as apiRemove, 
	listToday, 
	listTomorrow, 
	listAll, 
	updateStatus,
	updateStartTime,
	updateEndTime,
	getById,
	db 
} from '../api/todo';

export function useTodos() {
	const [view, setView] = useState('today'); // today | tomorrow | all
	const [todos, setTodos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const reload = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			let data = [];
			if (view === 'today') data = await listToday();
			else if (view === 'tomorrow') data = await listTomorrow();
			else data = await listAll();
			setTodos(data);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}, [view]);

	useEffect(() => {
		reload();
	}, [reload]);

	// 注意：Dexie v4 未提供 db.on('changes')（需要额外插件）。
	// 如需跨标签页自动刷新，可改用 Dexie liveQuery 或添加可用的观察机制。

	const add = useCallback(async (payload) => {
		await apiAdd(payload);
		await reload();
	}, [reload]);

	const toggleDone = useCallback(async (id, value) => {
		await apiDone(id, value);
		await reload();
	}, [reload]);

	const remove = useCallback(async (id) => {
		await apiRemove(id);
		await reload();
	}, [reload]);

	const updateTodoStatus = useCallback(async (id, status) => {
		await updateStatus(id, status);
		await reload();
	}, [reload]);

	const updateTodoStartTime = useCallback(async (id, startTime) => {
		await updateStartTime(id, startTime);
		await reload();
	}, [reload]);

	const updateTodoEndTime = useCallback(async (id, endTime) => {
		await updateEndTime(id, endTime);
		await reload();
	}, [reload]);

	const getTodoById = useCallback(async (id) => {
		return await getById(id);
	}, []);

	const getAllTodos = useCallback(async () => {
		return await listAll();
	}, []);

	const state = useMemo(() => ({ view, todos, loading, error }), [view, todos, loading, error]);
	const actions = useMemo(() => ({ 
		setView, 
		add, 
		toggleDone, 
		remove, 
		reload,
		updateTodoStatus,
		updateTodoStartTime,
		updateTodoEndTime,
		getTodoById,
		getAllTodos
	}), [setView, add, toggleDone, remove, reload, updateTodoStatus, updateTodoStartTime, updateTodoEndTime, getTodoById, getAllTodos]);

	return [state, actions];
}


