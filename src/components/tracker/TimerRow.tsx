import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $timerState, startTimer, clearTimer } from '../../store/timerStore';
import { $settings } from '../../store/settingsStore';
import { formatDurationMs } from '../../lib/shared/time/formatters';

interface TimerRowProps {
	timerId: string;
	label: string;
	cycleMinutes: number;
	stages?: number;
	useHerbSetting?: boolean;
}

export const TimerRow: React.FC<TimerRowProps> = ({ 
	timerId, 
	label, 
	cycleMinutes, 
	stages = 4,
	useHerbSetting = false 
}) => {
	const timerStates = useStore($timerState);
	const settings = useStore($settings);
	const [timeLeft, setTimeLeft] = useState<number>(0);
	const [currentStage, setCurrentStage] = useState<number>(0);

	const startTime = timerStates[timerId] || 0;
	
	// Apply 'Speedy Growth' logic if applicable (Herb setting)
	const actualCycleMinutes = (useHerbSetting && settings.herbTicks === '3') ? cycleMinutes * 0.75 : cycleMinutes;
	const totalDurationMs = actualCycleMinutes * stages * 60 * 1000;

	useEffect(() => {
		if (startTime === 0) {
			setTimeLeft(0);
			setCurrentStage(0);
			return;
		}

		const interval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, totalDurationMs - elapsed);
			
			setTimeLeft(remaining);
			
			if (stages > 0) {
				const stageMs = totalDurationMs / stages;
				setCurrentStage(Math.floor(elapsed / stageMs) + 1);
			}

			if (remaining === 0) {
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime, actualCycleMinutes, stages]);

	return (
		<tr 
			className={`farming-timer-row ${timeLeft === 0 && startTime !== 0 ? 'timer-ready' : ''}`}
			data-id={timerId}
		>
			<td className="activity_name">
				<span className="timer-label">{label}</span>
				{startTime !== 0 && (
					<div className="row-actions">
						<button 
							className="btn btn-danger btn-sm" 
							onClick={() => clearTimer(timerId)}
						>
							&times;
						</button>
					</div>
				)}
			</td>
			<td className="activity_notes">
				{startTime === 0 ? (
					<span className="text-muted small">Not started</span>
				) : (
					<span className="timer-status">
						Stage {Math.min(stages, currentStage)} / {stages} ({Math.round(((totalDurationMs - timeLeft) / totalDurationMs) * 100)}%)
					</span>
				)}
			</td>
			<td className="activity_status text-center">
				{startTime === 0 ? (
					<button 
						className="btn btn-primary btn-sm px-3"
						onClick={() => startTimer(timerId, actualCycleMinutes)}
					>
						Start
					</button>
				) : (
					<span className={`countdown ${timeLeft === 0 ? 'text-success fw-bold' : ''}`}>
						{timeLeft === 0 ? 'READY' : formatDurationMs(timeLeft)}
					</span>
				)}
			</td>
		</tr>
	);
};
