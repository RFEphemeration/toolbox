const utils = {
	get(object, key, ...path) {
		return !(key in object) ? undefined
			: path.length == 0 ? object[key]
			: get(object[key], ...path);
	},

	fallback(element, values, attr="src") {
		values = Array.isArray(values) ? values : [values];
		let value = values.shift();
		element.onerror = values.length ? () => this.fallback(element, values, attr) : null;
		element[attr] = value;
	},

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
};

