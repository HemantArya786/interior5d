class APICache {
	constructor() {
		this.cache = new Map();
		this.pendingRequests = new Map();
		this.defaultTTL = 5 * 60 * 1000;
	}
	generateKey(url, params = {}) {
		const sortedParams = Object.keys(params)
			.sort()
			.reduce((result, key) => {
				result[key] = params[key];
				return result;
			}, {});
		return `${url}?${JSON.stringify(sortedParams)}`;
	}

	isValid(entry) {
		return Date.now() - entry.timestamp < entry.ttl;
	}

	get(url, params = {}) {
		const key = this.generateKey(url, params);
		const entry = this.cache.get(key);

		if (entry && this.isValid(entry)) {
			console.log('✅ Cache hit:', key);
			return Promise.resolve(entry.data);
		}

		return null;
	}

	set(url, params = {}, data, ttl = this.defaultTTL) {
		const key = this.generateKey(url, params);
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		});
		console.log('📝 Cache set:', key);
	}

	async deduplicate(url, params = {}, requestFn) {
		const key = this.generateKey(url, params);
		const cached = this.get(url, params);
		if (cached) {
			return cached;
		}
		if (this.pendingRequests.has(key)) {
			console.log('⏳ Request already pending:', key);
			return this.pendingRequests.get(key);
		}

		console.log('🔄 Making new request:', key);
		const requestPromise = requestFn()
			.then((response) => {
				this.set(url, params, response);
				this.pendingRequests.delete(key);
				return response;
			})
			.catch((error) => {
				this.pendingRequests.delete(key);
				throw error;
			});

		this.pendingRequests.set(key, requestPromise);
		return requestPromise;
	}

	clear() {
		this.cache.clear();
		this.pendingRequests.clear();
		console.log('🗑️ Cache cleared');
	}

	cleanup() {
		for (const [key, entry] of this.cache.entries()) {
			if (!this.isValid(entry)) {
				this.cache.delete(key);
			}
		}
	}
	clearByPattern(pattern) {
		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
				console.log('🗑️ Cache cleared for pattern:', pattern, key);
			}
		}
	}
}

export const apiCache = new APICache();

// Auto cleanup every 10 minutes
setInterval(() => {
	apiCache.cleanup();
}, 10 * 60 * 1000);
