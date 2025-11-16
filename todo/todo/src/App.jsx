import { useEffect, useState, useRef } from 'react';
import TodoInput from './components/TodoInput.jsx';
import TodoList from './components/TodoList.jsx';
import ReminderModal from './components/ReminderModal.jsx';
import { useTodos } from './hooks/useTodos.js';

export default function App() {
	const [state, actions] = useTodos();
	const { view, todos, loading } = state;
	const { 
		setView, 
		add, 
		toggleDone, 
		remove,
		updateTodoStatus,
		updateTodoStartTime,
		updateTodoEndTime,
		getAllTodos
	} = actions;

	const [reminder, setReminder] = useState(null); // { todo, type: 'start' | 'end' }
	const checkedTodosRef = useRef(new Set()); // 记录已检查过的提醒，避免重复弹出

	// 定时检查任务开始和结束时间
	useEffect(() => {
		const checkReminders = async () => {
			// 如果已经有提醒在显示，不检查新的
			if (reminder) return;

			const allTodos = await getAllTodos();
			const now = new Date();

			for (const todo of allTodos) {
				// 跳过已完成的
				if (todo.status === 'completed' || todo.done) continue;

				// 检查开始时间
				if (todo.startTime && todo.status === 'pending') {
					const startTime = new Date(todo.startTime);
					// 开始时间已到达（当前时间 >= 开始时间）
					if (now >= startTime) {
						const startKey = `${todo.id}-start-${Math.floor(startTime.getTime() / 60000)}`;
						if (!checkedTodosRef.current.has(startKey)) {
							checkedTodosRef.current.add(startKey);
							setReminder({ todo, type: 'start' });
							return; // 一次只显示一个提醒
						}
					}
				}

				// 检查结束时间
				if (todo.endTime && todo.status !== 'completed') {
					const endTime = new Date(todo.endTime);
					// 结束时间已到达（当前时间 >= 结束时间）
					if (now >= endTime) {
						const endKey = `${todo.id}-end-${Math.floor(endTime.getTime() / 60000)}`;
						if (!checkedTodosRef.current.has(endKey)) {
							checkedTodosRef.current.add(endKey);
							setReminder({ todo, type: 'end' });
							return; // 一次只显示一个提醒
						}
					}
				}
			}
		};

		// 立即检查一次
		checkReminders();

		// 每30秒检查一次
		const interval = setInterval(checkReminders, 30000);

		return () => clearInterval(interval);
	}, [getAllTodos, reminder]);

	const handleReminderConfirm = async (action, data = {}) => {
		if (!reminder) return;

		const { todo } = reminder;

		try {
			switch (action) {
				case 'started':
					// 标记为进行中
					await updateTodoStatus(todo.id, 'inProgress');
					break;
				case 'postpone':
					// 延期开始时间
					if (data.newStartTime) {
						await updateTodoStartTime(todo.id, data.newStartTime);
					}
					break;
				case 'cancel':
					// 删除待办
					await remove(todo.id);
					break;
				case 'completed':
					// 标记为已完成
					await updateTodoStatus(todo.id, 'completed');
					break;
				case 'partiallyDone':
					// 部分完成，更新结束时间
					await updateTodoStatus(todo.id, 'partiallyDone');
					if (data.newEndTime) {
						await updateTodoEndTime(todo.id, data.newEndTime);
					}
					break;
			}
		} catch (error) {
			console.error('处理提醒操作失败:', error);
		}
	};

	const handleReminderClose = () => {
		// 清除提醒，但不从checkedTodosRef中移除，避免立即重复弹出
		setReminder(null);
	};

	return (
		<div className="container">
			<h1 className="title" style={{ marginBottom: 16 }}>TODO List</h1>
			<TodoInput onSubmit={add} />
			<div style={{ height: 12 }} />
			<TodoList
				view={view}
				todos={todos}
				loading={loading}
				onToggle={toggleDone}
				onRemove={remove}
				onSwitch={setView}
			/>
			<div style={{ marginTop: 16 }} className="item-meta">
				说明：标题必填（1~120），描述可选（≤500）。已完成采用"涂黑复选框"+ 划线展示；排序为重要优先，其次按时间升序。
			</div>
			{reminder && (
				<ReminderModal
					todo={reminder.todo}
					type={reminder.type}
					onClose={handleReminderClose}
					onConfirm={handleReminderConfirm}
				/>
			)}
		</div>
	);
}


