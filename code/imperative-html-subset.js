const html = {
	append(parent, child, ...children) {
		if (typeof child == 'string') {
			parent.appendChild(document.createTextNode(child));
		} else if (typeof child == 'function') {
			return this.append(parent, child(), ...children);
		} else if (Array.isArray(child)) {
			if (child.length > 0) {
				return this.append(parent, ...child, ...children)
			}
		} else {
			parent.appendChild(child);
		}
		if (children.length > 0) {
			this.append(parent, ...children);
		}
	},

	set(parent, attributes) {
		for (let attr in attributes) {
			if (attr == "style") {
				for (let key in attributes[attr]) {
					parent.style[key.replaceAll("_", "-")] = attributes[attr][key];
				}
			} else {
				parent.setAttribute(attr.replaceAll("_", "-"), attributes[attr]);
			}
		}
	},

	create(tagName, attributes = {}, ...children) {
		let element = document.createElement(tagName);
		this.set(element, attributes);
		this.append(element, children);
		return element;
	},

	insert(...elements) {
		let script = document.currentScript;
		for (let element of elements) {
			script.parentNode.insertBefore(element, script);
		}
	},

	declare (tagNames) {
		let declarations = {};
		for (let tagName of tagNames.split(" ")) {
			if (!(tagName in this)) {
				this[tagName] = (attributes = {}, ...children) => this.create(tagName, attributes, ...children);
			}
			declarations[tagName] = this[tagName];
		}
		return declarations;
	},
};
