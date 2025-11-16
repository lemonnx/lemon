import { formatDateTime } from '../utils/date';

export default function TodoItem({ todo, onToggle, onRemove }) {
	const checked = !!todo.done;
	return (
		<div className="item" role="listitem">
			<button
				type="button"
				className="checkbox"
				data-checked={checked}
				aria-label={checked ? '标记为未完成' : '标记为已完成'}
				onClick={() => onToggle(todo.id, !checked)}
			>
				{checked ? (
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path fill="currentColor" d="M20.285 6.709a1 1 0 0 1 .006 1.414l-9 9a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 1.414-1.414l4.293 4.293 8.293-8.293a1 1 0 0 1 1.408 0z"></path>
					</svg>
				) : null}
				<span className="sr-only">{checked ? '已完成' : '未完成'}</span>
			</button>
			<div>
				<div className="item-head">
					<div className={`item-title ${checked ? 'done' : ''}`}>{todo.title}</div>
					{todo.important ? <span className="badge" aria-label="重要">重要</span> : null}
				</div>
				{todo.description ? <div className="item-meta" style={{ marginTop: 4 }}>{todo.description}</div> : null}
				<div className="item-meta" style={{ marginTop: 6 }}>
					{todo.startTime ? `开始：${formatDateTime(todo.startTime)}` : '开始：未指定'} | {todo.endTime ? `结束：${formatDateTime(todo.endTime)}` : '结束：未指定'}
					{todo.status === 'inProgress' ? <span className="status-badge in-progress">进行中</span> : null}
					{todo.status === 'partiallyDone' ? <span className="status-badge partially-done">部分完成</span> : null}
				</div>
			</div>
			<div className="item-actions">
				<button className="btn btn-danger" type="button" onClick={() => onRemove(todo.id)} aria-label="删除">
					删除
				</button>
			</div>
		</div>
	);
}


