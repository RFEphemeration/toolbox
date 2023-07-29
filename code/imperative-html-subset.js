const html = new Proxy({
	process(func, ...children) {
		for (let child of children) {
			if (child == null) {
				continue;
			} else if (Array.isArray(child)) {
				this.process(func, ...child);
			} else if (typeof child == 'string') {
				func(document.createTextNode(child));
			} else if (typeof child == 'function') {
				this.process(func, child());
			} else if (child instanceof Promise) {
				const temp = document.createElement('div');
				child.then((fragment) => {
					temp.replaceWith(fragment)
				});
				func(temp);
			} else {
				func(child);
			}
		}
	},

	setAttributes(node, attributes) {
		for (let attr in attributes) {
			if (attr == 'style') {
				for (let key in attributes[attr]) {
					node.style[key.replaceAll('_', '-')] = attributes[attr][key];
				}
			} else if (attr == 'data-listen') {
				if (Array.isArray(attributes[attr])) {
					data.listen(node, attributes[attr]);
				} else {
					data.listen(node, attributes[attr].split(' '));
				}
			} else if (attr == 'data-value') {
				data.process_value(node, attributes[attr]);
			} else if (attr == 'data-refresh') {
				node.refresh = attributes[attr];
			} else if (attr == 'events') {
				for (let event in value) {
					node.addEventListener(event, value[event]);
				}
			} else if (typeof attributes[attr] == 'function') {
				node[attr] = attributes[attr];
			} else if (typeof value == 'boolean') {
				node.toggleAttribute(attr, value);
			} else {
				node.setAttribute(attr.replaceAll('_', '-'), attributes[attr]);
			}
		}
	},

	create(tagName, attributes = {}, ...children) {
		let element = document.createElement(tagName);
		this.setAttributes(element, attributes);
		this.process(element.appendChild.bind(element), ...children);
		if ('refresh' in element) {
			element.refresh();
		}
		return element;
	},

	insert(...elements) {
		let script = document.currentScript;
		this.process((element) => {
			script.parentNode.insertBefore(element, script);
		}, ...elements);
	},

	bind() {
		let bound = {};
		for (const prop in this) {
			bound[prop] = typeof this[prop] == 'function' ? this[prop].bind(this) : this[prop];
		}
		return bound;
	},
}, {
	get(target, prop) {
		if (prop in target) {
			return target[prop];
		}
		let tagName = prop.replaceAll('_', '-');
		return (attributes={}, ...children) => target.create(tagName, attributes, children);
	}
});

const data = new Proxy({
	_listeners: {},
	_dirty: new Set(),
	_refreshing : false,
	listen(listener, paths) {
		for (let path of (typeof paths == 'string' ? [paths] : paths)) {
			while (path.length) {
				this._listeners[path] = this._listeners[path] || [];
				this._listeners[path].push(listener);
				path = path.substring(0, path.lastIndexOf('.'));
			}
		}
	},

	// use when modifying an array/object
	mark_dirty(...names) {
		names.forEach(name => this._dirty.add(name));
		this.notify();
	},

	async notify(immediate = false) {
		if (this._refreshing) {
			return;
		}
		this._refreshing = true;
		if (!immediate) {
			await new Promise(resolve => ((requestAnimationFrame || (r => setTimeout(r, 0)))(resolve)));
		}
		let listeners = new Set();
		let errors = [];
		while (this._dirty.size > 0) {
			for (const name of this._dirty) {
				for (const listener of this._listeners[name] || []) {
					listeners.add(listener);
				}
			}
			this._dirty.clear();
			for(const listener of listeners) {
				try {
					listener.refresh();
				} catch (error) {
					errors.push({listener, error});
				}
			}
			listeners.clear();
		}
		this._refreshing = false;
		if (errors.length) {
			for (let error of errors) {
				console.error("[data] listener refresh threw an error", error);
			}
			throw new Error("[data] one or more listener refresh threw an error", {cause:errors});
		}
	},

	set_silently(values) {
		for (const key in values) {
			this[key] = values[key];
		}
	},

	set_nested(name, values) {
		if (!(name in this)) {
			let parent = this;
			this[name] = new Proxy({}, {
				set(target, prop, value) {
					if (!(prop in target) || target[prop] != value) {
						parent._dirty.add(name + "." + prop);
						parent._dirty.add(name);
					}
					target[prop] = value;
				}
			});
		}
		for (const key in values) {
			this[name][key] = values[key];
		}
	},

	query_listeners(element_root = document, refresh_dict = window) {
		for (const element of element_root.querySelectorAll('[data-value]')) {
			this.process_value(element, element.dataset.value);
		}
		for (const element of element_root.querySelectorAll('[data-listen]')) {
			if ('refresh' in element.dataset) {
				element.refresh = Function(element.dataset.refresh);
			} else if ('refreshPath' in element.dataset) {
				element.refresh = utils.get(refresh_dict, element.dataset.refreshPath.split('.'));
				if (element.refresh == undefined) {
					continue;
				}
			} else {
				continue;
			}
			this.listen(element, element.dataset.listen.split(' '));
			element.refresh();
		}
	},

	process_value(node, path) {
		if (typeof path != 'string' || !(node instanceof Node)) {
			return;
		}
		let parent = this;
		let value_path = path.split('.');
		if (node.nodeType == Node.ELEMENT_NODE) {
			node.refresh = function() {
				this.innerText = utils.get(parent, ...value_path);
			}
		} else if (node.nodeType == Node.TEXT_NODE) {
			node.refresh = function() {
				this.nodeValue = utils.get(parent, ...value_path);
			}
		}
		this.listen(node, [path]);
	},

	value(path) {
		let node = document.createTextNode("");
		this.process_value(node, path);
		node.refresh();
		return node;
	},
}, {
	set(target, prop, value) {
		if (!(prop in target) || target[prop] != value) {
			target._dirty.add(prop);
		}
		target[prop] = value;
		target.notify();
	},
});
