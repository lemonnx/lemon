import { useCallback, useMemo, useState } from 'react';

export default function TodoInput({ onSubmit }) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [important, setImportant] = useState(false);
	const [startTime, setStartTime] = useState(defaultDeadlineLocal());
	const [endTime, setEndTime] = useState(defaultDeadlineLocal());

	const titleValid = useMemo(() => {
		const t = title.trim();
		return t.length >= 1 && t.length <= 120;
	}, [title]);
	const descValid = useMemo(() => description.length <= 500, [description]);
	const timeValid = useMemo(() => {
		if (!startTime || !endTime) return true; // 允许不设置时间
		return new Date(startTime) <= new Date(endTime);
	}, [startTime, endTime]);
	const canSubmit = titleValid && descValid && timeValid;

	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		if (!canSubmit) return;
		await onSubmit({
			title: title.trim(),
			description: description.trim(),
			important,
			startTime: startTime ? new Date(startTime) : null,
			endTime: endTime ? new Date(endTime) : null
		});
		setTitle('');
		setDescription('');
		setImportant(false);
		setStartTime(defaultDeadlineLocal());
		setEndTime(defaultDeadlineLocal());
	}, [canSubmit, onSubmit, title, description, important, startTime, endTime]);

	return (
		<form className="card" onSubmit={handleSubmit} aria-label="新建待办">
			<div className="input-row" style={{ marginBottom: 8 }}>
				<input
					type="text"
					placeholder="标题（必填，1~120）"
					aria-label="标题"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<label className="switch" aria-label="重要">
					<input
						type="checkbox"
						checked={important}
						onChange={(e) => setImportant(e.target.checked)}
						aria-checked={important}
					/>
					<span>重要</span>
				</label>
				<button className="btn btn-primary" type="submit" disabled={!canSubmit} aria-disabled={!canSubmit}>
					添加
				</button>
			</div>
			<div className="input-row" style={{ marginBottom: 8 }}>
				<input
					type="datetime-local"
					aria-label="开始时间"
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
				/>
				<input
					type="datetime-local"
					aria-label="结束时间"
					value={endTime}
					onChange={(e) => setEndTime(e.target.value)}
				/>
			</div>
			<textarea
				placeholder="描述（可选，≤500）"
				aria-label="描述"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
			<div className="item-meta" style={{ marginTop: 6 }}>
				<span style={{ color: canSubmit ? 'var(--muted)' : 'var(--danger)' }}>
					{!titleValid ? '标题需 1~120 字符' : !descValid ? '描述长度 ≤ 500' : !timeValid ? '结束时间必须晚于开始时间' : ' '}
				</span>
			</div>
		</form>
	);
}

function defaultDeadlineLocal() {
	const d = new Date();
	d.setMinutes(0, 0, 0);
	d.setHours(d.getHours() + 1);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const mi = String(d.getMinutes()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}


