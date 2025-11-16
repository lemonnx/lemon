import TodoItem from './TodoItem.jsx';

export default function TodoList({ view, todos, loading, onToggle, onRemove, onSwitch }) {
	return (
		<div className="card">
			<div className="header">
				<div className="title">待办列表</div>
				<div className="tabs" role="tablist" aria-label="视图切换">
					<button className="tab" role="tab" aria-selected={view === 'today'} onClick={() => onSwitch('today')}>今日</button>
					<button className="tab" role="tab" aria-selected={view === 'tomorrow'} onClick={() => onSwitch('tomorrow')}>明日</button>
					<button className="tab" role="tab" aria-selected={view === 'all'} onClick={() => onSwitch('all')}>全部</button>
				</div>
			</div>
			{loading ? <div className="item-meta">加载中...</div> : null}
			<div className="list" role="list" aria-busy={loading}>
				{todos.length === 0 && !loading ? <div className="item-meta">暂无数据</div> : null}
				{todos.map(t => (
					<TodoItem key={t.id} todo={t} onToggle={onToggle} onRemove={onRemove} />
				))}
			</div>
		</div>
	);
}


