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

	load(src, asynchronous=false) {
		const request = new XMLHttpRequest();
		request.open("GET", src, asynchronous);
		const range = document.createRange();
		if (asynchronous) {
			return new Promise((resolve, reject) => {
				request.onload = () => {
					resolve(range.createContextualFragment(request.response.trim()));
				};
				request.onerror = reject;
				request.send();
			});
		} else {
			let fragment = null;
			request.onload = () => {
				fragment = range.createContextualFragment(request.response.trim());
			};
			request.send();
			return fragment;
		}
	},

	include(src, asynchronous=true) {
		let script = document.currentScript;
		let loaded = this.load(src, asynchronous);
		if (asynchronous) {
			loaded.then((fragment) => script.parentNode.insertBefore(fragment, script));
		} else {
			script.parentNode.insertBefore(loaded, script);
		}
	},
};

