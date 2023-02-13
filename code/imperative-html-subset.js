const html = new Proxy({
	appendChildren(parent, ...children) {
		for (let child of children) {
			if (typeof child == 'string') {
				parent.appendChild(document.createTextNode(child));
			} else if (typeof child == 'function') {
				this.appendChildren(parent, child());
			} else if (Array.isArray(child)) {
				this.appendChildren(parent, ...child)
			} else {
				parent.appendChild(child);
			}
		}
	},

	setAttributes(parent, attributes) {
		for (let attr in attributes) {
			if (attr == "style") {
				for (let key in attributes[attr]) {
					parent.style[key.replaceAll("_", "-")] = attributes[attr][key];
				}
			} else if (attr == "listen") {
				if (Array.isArray(attributes[attr])) {
					for (const name of attributes[attr]) {
						data.listen(name, parent);
					}
				} else {
					data.listen(attributes[attr], parent);
				}
			} else if (typeof attributes[attr] == "function") {
				parent[attr] = attributes[attr];
			} else {
				parent.setAttribute(attr.replaceAll("_", "-"), attributes[attr]);
			}
		}
	},

	create(tagName, attributes = {}, ...children) {
		let element = document.createElement(tagName);
		this.setAttributes(element, attributes);
		this.appendChildren(element, children);
		if ('refresh' in element) {
			element.refresh();
		}
		return element;
	},

	insert(...elements) {
		let script = document.currentScript;
		for (let element of elements) {
			script.parentNode.insertBefore(element, script);
		}
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
	listen(name, listener) {
		if (!(name in this._listeners)) {
			this._listeners[name] = [];
		}
		this._listeners[name].push(listener);
	},

	mark_dirty(name) {
		this._dirty.add(name);
	},

	notify() {
		let listeners = new Set();
		for (const name of this._dirty) {
			for (const listener of this._listeners[name]) {
				listeners.add(listener);
			}
		}
		for (const listener of listeners) {
			listener.refresh();
		}
		this._dirty.clear();
	},

	set(values) {
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
}, {
	set(target, prop, value) {
		if (!(prop in target) || target[prop] != value) {
			target._dirty.add(prop);
		}
		target[prop] = value;
	}
});
