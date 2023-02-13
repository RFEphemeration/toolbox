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
		return element;
	},

	insert(...elements) {
		let script = document.currentScript;
		for (let element of elements) {
			script.parentNode.insertBefore(element, script);
		}
	},

	refs: {},
	ref(name, element, {namespace=this.refs}={}) {
		namespace[name] = element;
		if ('refresh' in element) {
			element.refresh();
		}
		return element;
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
