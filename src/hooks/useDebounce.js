import { useCallback, useEffect, useState } from 'react';

export const useDebounce = (value, delay) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

export const useDebouncedCallback = (callback, delay) => {
	const [debounceTimer, setDebounceTimer] = useState(null);

	const debouncedCallback = useCallback(
		(...args) => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			const newTimer = setTimeout(() => {
				callback(...args);
			}, delay);

			setDebounceTimer(newTimer);
		},
		[callback, delay, debounceTimer]
	);

	useEffect(() => {
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	}, [debounceTimer]);

	return debouncedCallback;
};
