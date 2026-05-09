import React, { useState, useEffect } from 'react';
import { formatDurationMs } from '../../lib/shared/time/formatters.js';

interface CountdownProps {
	targetTime: number; // UTC timestamp
	onReset?: () => void;
	className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetTime, onReset, className }) => {
	const [timeLeft, setTimeLeft] = useState('');

	useEffect(() => {
		const update = () => {
			const now = Date.now();
			const diff = targetTime - now;

			if (diff <= 0) {
				setTimeLeft('RESET');
				if (onReset) onReset();
				return;
			}

			// Using the original formatter logic
			setTimeLeft(formatDurationMs(diff));
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [targetTime, onReset]);

	return <span className={className}>{timeLeft}</span>;
};
