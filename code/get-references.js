const refs = {
	make(name, element, {namespace=this}={}) {
		namespace[name] = element;
		if ('refresh' in element) {
			element.refresh();
		}
		return element;
	},

	query_ids({namespace=this, crawl_children=false}={}) {
		for (const element of document.querySelectorAll('[id]')) {
			if (crawl_children) {
				let refs = this.crawl_dom(element, {
					namespace: {self: element},
					id_stop: true,
				});
				namespace[element.id] = Object.keys(refs).length > 1 ? refs : element;
			} else {
				namespace[element.id] = element;
			}
		}
		return namespace;
	},

	crawl_dom(parent, {namespace=this, self='self', attr='js-ref', array_attr='is-array', id_stop=false} = {}) {
		let refs = parent.hasAttribute(attr) ? { [self] : parent } : namespace;
		for (let child of parent.children) {	
			if (id_stop && child.hasAttribute('id')) {
				continue;
			}
			this.crawl(child, {namespace: refs, self, attr, array_attr, id_stop});
		}
		if (!parent.hasAttribute(attr) || (id_stop && parent.hasAttribute('id'))) {
			return namespace;
		}
		let name = parent.getAttribute(attr);
		refs = Object.keys(refs).length > 1 ? refs : parent;
		if (parent.hasAttribute(array_attr)) {
			if (!(name in namespace)) {
				namespace[name] = [];
			}
			namespace[name].push(refs);
		} else {
			namespace[name] = refs;
		}
		return namespace;
	},
	/*
	query_all({namespace=this, self='self', attr='js-ref', array_attr='is-array'}={}) {
		const selector = `[${attr}]`;
		let tree = new Map();
		let root = {};
		const insert = (obj, name, element) => {
			if (!element.hasAttribute(array_attr)) {
				obj[name] = element;
			} else if (!(name in obj)) {
				obj[name] = [element];
			} else {
				obj[name].push(element);
			}
		}
		for (const element of document.querySelectorAll(selector)) {
			const name = element.getAttribute(attr);
			const parent = element.closest(selector);
			if (parent == null) {
				root[name] = element;
				continue;
			}
			if (!tree.has(parent)) {
				tree.set(parent, {self: parent});
			}
			insert(tree.get(parent), name, element);
		}
		for (const name in root) {
			const element = root[name];
			const value = tree.has(element) ? tree.get(element) : element;
			insert(namespace, name, value);
		}
	},
	*/
};
