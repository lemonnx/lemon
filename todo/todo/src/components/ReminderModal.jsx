import { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/date';

export default function ReminderModal({ todo, type, onClose, onConfirm }) {
	const [newStartTime, setNewStartTime] = useState('');
	const [newEndTime, setNewEndTime] = useState('');

	useEffect(() => {
		if (type === 'start' && !newStartTime) {
			const d = new Date();
			d.setMinutes(0, 0, 0);
			d.setHours(d.getHours() + 1);
			const yyyy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			const hh = String(d.getHours()).padStart(2, '0');
			const mi = String(d.getMinutes()).padStart(2, '0');
			setNewStartTime(`${yyyy}-${mm}-${dd}T${hh}:${mi}`);
		}
		if (type === 'end' && !newEndTime) {
			const d = new Date();
			d.setMinutes(0, 0, 0);
			d.setHours(d.getHours() + 1);
			const yyyy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			const hh = String(d.getHours()).padStart(2, '0');
			const mi = String(d.getMinutes()).padStart(2, '0');
			setNewEndTime(`${yyyy}-${mm}-${dd}T${hh}:${mi}`);
		}
	}, [type, newStartTime, newEndTime]);

	if (!todo) return null;

	const handleConfirm = (action, data = {}) => {
		onConfirm(action, data);
		onClose();
	};

	if (type === 'start') {
		return (
			<div className="modal-overlay" onClick={onClose}>
				<div className="modal-content" onClick={(e) => e.stopPropagation()}>
					<h2>任务提醒</h2>
					<p>任务 <strong>{todo.title}</strong> 的开始时间已到达（{formatDateTime(todo.startTime)}）</p>
					<p>任务是否正在进行中？</p>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
						<button
							className="btn btn-primary"
							onClick={() => handleConfirm('started')}
						>
							已开始（标记为进行中）
						</button>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<label>未开始（延期至）：</label>
							<input
								type="datetime-local"
								value={newStartTime}
								onChange={(e) => setNewStartTime(e.target.value)}
								style={{ padding: 8 }}
							/>
							<button
								className="btn"
								onClick={() => handleConfirm('postpone', { newStartTime: newStartTime ? new Date(newStartTime) : null })}
								disabled={!newStartTime}
							>
								延期
							</button>
						</div>
						<button
							className="btn btn-danger"
							onClick={() => handleConfirm('cancel')}
						>
							取消待办（删除）
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (type === 'end') {
		return (
			<div className="modal-overlay" onClick={onClose}>
				<div className="modal-content" onClick={(e) => e.stopPropagation()}>
					<h2>任务提醒</h2>
					<p>任务 <strong>{todo.title}</strong> 的结束时间已到达（{formatDateTime(todo.endTime)}）</p>
					<p>任务是否已完成？</p>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
						<button
							className="btn btn-primary"
							onClick={() => handleConfirm('completed')}
						>
							是（标记为已完成）
						</button>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<label>部分完成（下次完成时间）：</label>
							<input
								type="datetime-local"
								value={newEndTime}
								onChange={(e) => setNewEndTime(e.target.value)}
								style={{ padding: 8 }}
							/>
							<button
								className="btn"
								onClick={() => handleConfirm('partiallyDone', { newEndTime: newEndTime ? new Date(newEndTime) : null })}
								disabled={!newEndTime}
							>
								部分完成
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return null;
}

