// uses imperative-html: https://github.com/johnnesky/imperative-html

///// usage example /////

let program_data = {
	count : 0,
};

div({class: "counter_wrapper"},
	button({
		onclick(event) {
			program_data.count++;
			references.counter_display.refresh();
		},
	}),
	ref("counter_display", span({
		refresh() {
			this.innerText = program_data.count;
		},
	}))
);

///// references / refresh support classes //////

class DependencyError extends Error {}

class ReferenceError extends Error {}

class ReferenceNamespace {
	constructor(name) {
		this.name = name;
		this.references = {};
		this.dependency_queues = {};
		this.dependency_stack = [];
	}

	// if refresh is called on creation, you can only reference things defined above you in refresh
	// if you want to reference something that comes later, you can use get("") instead and it will
	// update the dependency queue
	// we could also consider using connectedCallback for when an element is added to the dom (will it be called on all of them or just the parent ones?)
	ref(name, element) {
		this.references[name] = element;
		this.update_dependencies(name);
		if ('refresh' in element) {
			this.try_refresh(element);
		}
		return element;
	}

	get(name) {
		if (name in this.references) {
			return this.references[name];
		} else {
			if (this.dependency_stack.length == 0) {
				throw new ReferenceError(`${name} does not exist in ${this.name} and we are not in a try_refresh context`);
			}
			let dependent = this.dependency_stack[this.dependency_stack.length - 1];
			if (!(dependent in this.dependency_queues)) {
				this.dependency_queues[dependent] = new Set();
			}
			this.dependency_queues[dependent].add(name);
			throw new DependencyError(`${name} is not yet defined in ${this.name}`);
		}
	}

	try_refresh(element) {
		try {
			this.dependency_stack.push(element);
			element.refresh();
		} catch (e) {
			if (!(e instanceof DependencyError)) {
				throw e;
			}
		} finally {
			this.dependency_stack.pop();
		}
	}

	update_dependencies(name) {
		let to_delete = [];
		for (const dependent_element in this.dependency_queues) {
			this.dependency_queues[dependent_element].delete(name);
			if (this.dependency_queues[dependent_element].size == 0) {
				this.try_refresh(dependent_element);
				// check again in case more things were added during this try_refresh;
				if (this.dependency_queues[dependent_element].size == 0) {
					to_delete.push(dependent_element);
				}
			}
		}
		for (const dependent_element of to_delete) {
			delete this.dependency_queues[dependent_element];
		}
	}

	destructure() {
		return { ref: this.ref.bind(this), get: this.get.bind(this), dict : this.references };
	}
}

let global_reference_namespace = new ReferenceNamespace("global");
let {ref, get, dict : references} = global_reference_namespace.destructure();

/////// Other options considered //////


refreshable_elements = []


ref(refresh_fuction) {
	let element = refresh_fuction();
	refreshable_elements[element] = refresh_fuction;
	return element;
}

refresh(element) {
	let replacement = refreshable_elements[element]();
	element.replaceWith(replacement);
	refreshable_elements[replacement] = refreshable_elements[element];
	delete refreshable_elements[element];
}

set(name, element) {
	element_references[name] = element;
	return element;
}

/*
consider modifications to the api, where the refresh attribute is called like so:

p({refresh : (element) => {
	element.innerText = ...; // or whatever
}});
// inside p evaluation, after construction of dom element
p.refresh.bind(p);
p.refresh();

also considering an init attribute, but I think this would need to wait
until after we are added to the dom, and this requires periodic searches...

*/

let program_data = {
	count : 0,
};


div({class : "counter_wrapper"},
	button({
		init : (element) => {
			// when does init get called? such that it can see its siblings
			element.counter_display = element.nextSibling;
		},
		onclick : (event) => { 
			program_data.count++;
			event.target.counter_display.refresh();
		},
	}),
	span({
		refresh : (element) => {
			element.innerText = program_data.count;
		}
	})
)

/* wouldn't need to modify the api for this one, could just do
references.forEach(element => {
	element.refresh.bind(element);
	element.refresh();
};
*/

references = {};

references.counter_display = span({
	refresh : (element) => {
		element.innerText = program_data.count;
	}
})

div({class : "counter_wrapper"},
	button({
		onclick : (event) => {
			program_data.count++;
			references.counter_display.refresh();
		},
	}),
	references.counter_display
);



// lists will be appended as children in order
// calling the anonymous function is optional because
// the library will default call functions with no arguments
// it's essentially a way of creating an expression that can contain statements


div({class: "counter_wrapper"},
	() => {
		let c = span({
			refresh : (element) => {
				element.innerText = program_data.count;
			},
		});
		c.refresh.bind(c);
		c.refresh();
		let b = button({
			onclick : (event) => {
				program_data.count++;
				c.refresh();
			},
		});
		return [b, c];
	} ()
)

