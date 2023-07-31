const utils = {
	ready(func) {
		if (document.readyState !== 'loading') {
			func();
		} else {
			document.addEventListener('DOMContentLoaded', func);
		}
	},

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

	insert({before=document.currentScript}, ...elements) {
		for (const element of elements) {
			before.parentNode.insertBefore(element, before);
		}
	},

	load({src, asynchronous=false}) {
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

	include({src, asynchronous=true, before=document.currentScript}) {
		let loaded = this.load({src, asynchronous});
		if (asynchronous) {
			loaded.then((fragment) => this.insert({before}, fragment));
		} else {
			this.insert({before}, loaded);
		}
	},

	namespace() {
		let refs = {};
		let ref = (name, value) => {
			refs[name] = value;
			return value;
		}
		return [ref, refs];
	},

	query_ids({parent=document, namespace={}, crawl_children=false, crawl_options={}}={}) {
		for (const element of parent.querySelectorAll('[id]')) {
			if (crawl_children) {
				this.crawl_refs({...crawl_options, parent: element, namespace, id_stop: true});
			} else {
				namespace[element.id] = element;
			}
		}
		return namespace;
	},

	crawl_refs({parent=document, namespace={}, id_stop=false, self='element', attr='data-ref', array_attr='data-is-array'}={}) {
		let name = (id_stop && parent.id) || parent.getAttribute(attr);
		let refs = name ? { [self]: parent } : namespace;
		for (let child of id_stop ? parent.children.filter(c => !c.id) : parent.children) {
			this.crawl_refs({parent:child, namespace:refs, self, attr, array_attr, id_stop})
		}
		if (name) {
			let value = Object.keys(refs).length > 1 ? refs : parent;
			if (parent.hasAttribute(array_attr)) {
				if (!(name in namespace)) {
					namespace[name] = [];
				}
				namespace[name].push(value);
			} else {
				namespace[name] = value;
			}
		}
		return namespace;
	},
};

