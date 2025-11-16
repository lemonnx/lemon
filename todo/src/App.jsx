import TodoInput from './components/TodoInput.jsx';
import TodoList from './components/TodoList.jsx';
import { useTodos } from './hooks/useTodos.js';

export default function App() {
	const [state, actions] = useTodos();
	const { view, todos, loading } = state;
	const { setView, add, toggleDone, remove } = actions;

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
				说明：标题必填（1~120），描述可选（≤500）。已完成采用“涂黑复选框”+ 划线展示；排序为重要优先，其次按时间升序。
			</div>
		</div>
	);
}


