
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var morderedit2 = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules\carbon-components-svelte\src\Button\ButtonSkeleton.svelte generated by Svelte v3.44.3 */

    const file$5 = "node_modules\\carbon-components-svelte\\src\\Button\\ButtonSkeleton.svelte";

    // (41:0) {:else}
    function create_else_block$4(ctx) {
    	let div;
    	let mounted;
    	let dispose;
    	let div_levels = [/*$$restProps*/ ctx[3]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--skeleton", true);
    			toggle_class(div, "bx--btn", true);
    			toggle_class(div, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(div, "bx--btn--sm", /*size*/ ctx[1] === 'small' || /*small*/ ctx[2]);
    			toggle_class(div, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(div, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    			add_location(div, file$5, 41, 2, 950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[9], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler_1*/ ctx[10], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler_1*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(div, "bx--skeleton", true);
    			toggle_class(div, "bx--btn", true);
    			toggle_class(div, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(div, "bx--btn--sm", /*size*/ ctx[1] === 'small' || /*small*/ ctx[2]);
    			toggle_class(div, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(div, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(41:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if href}
    function create_if_block$4(ctx) {
    	let a;
    	let t_value = "" + "";
    	let t;
    	let a_rel_value;
    	let mounted;
    	let dispose;

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{
    			rel: a_rel_value = /*$$restProps*/ ctx[3].target === '_blank'
    			? 'noopener noreferrer'
    			: undefined
    		},
    		{ role: "button" },
    		/*$$restProps*/ ctx[3]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			set_attributes(a, a_data);
    			toggle_class(a, "bx--skeleton", true);
    			toggle_class(a, "bx--btn", true);
    			toggle_class(a, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(a, "bx--btn--sm", /*size*/ ctx[1] === 'small' || /*small*/ ctx[2]);
    			toggle_class(a, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(a, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    			add_location(a, file$5, 22, 2, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler*/ ctx[5], false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler*/ ctx[6], false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
    				dirty & /*$$restProps*/ 8 && a_rel_value !== (a_rel_value = /*$$restProps*/ ctx[3].target === '_blank'
    				? 'noopener noreferrer'
    				: undefined) && { rel: a_rel_value },
    				{ role: "button" },
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));

    			toggle_class(a, "bx--skeleton", true);
    			toggle_class(a, "bx--btn", true);
    			toggle_class(a, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(a, "bx--btn--sm", /*size*/ ctx[1] === 'small' || /*small*/ ctx[2]);
    			toggle_class(a, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(a, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(22:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[0]) return create_if_block$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = ["href","size","small"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonSkeleton', slots, []);
    	let { href = undefined } = $$props;
    	let { size = "default" } = $$props;
    	let { small = false } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('href' in $$new_props) $$invalidate(0, href = $$new_props.href);
    		if ('size' in $$new_props) $$invalidate(1, size = $$new_props.size);
    		if ('small' in $$new_props) $$invalidate(2, small = $$new_props.small);
    	};

    	$$self.$capture_state = () => ({ href, size, small });

    	$$self.$inject_state = $$new_props => {
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('size' in $$props) $$invalidate(1, size = $$new_props.size);
    		if ('small' in $$props) $$invalidate(2, small = $$new_props.small);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		href,
    		size,
    		small,
    		$$restProps,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class ButtonSkeleton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { href: 0, size: 1, small: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonSkeleton",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get href() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var ButtonSkeleton$1 = ButtonSkeleton;

    /* node_modules\carbon-components-svelte\src\Button\Button.svelte generated by Svelte v3.44.3 */
    const file$4 = "node_modules\\carbon-components-svelte\\src\\Button\\Button.svelte";
    const get_default_slot_changes = dirty => ({ props: dirty[0] & /*buttonProps*/ 512 });
    const get_default_slot_context = ctx => ({ props: /*buttonProps*/ ctx[9] });

    // (169:0) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[0] && create_if_block_4(ctx);
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	var switch_value = /*icon*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-hidden": "true",
    				class: "bx--btn__icon",
    				"aria-label": /*iconDescription*/ ctx[4]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let button_levels = [/*buttonProps*/ ctx[9]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(button, button_data);
    			add_location(button, file$4, 169, 2, 4570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (switch_instance) {
    				mount_component(switch_instance, button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[33](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_2*/ ctx[24], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_2*/ ctx[25], false, false, false),
    					listen_dev(button, "mouseenter", /*mouseenter_handler_2*/ ctx[26], false, false, false),
    					listen_dev(button, "mouseleave", /*mouseleave_handler_2*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasIconOnly*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 16) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[4];

    			if (switch_value !== (switch_value = /*icon*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, button, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty[0] & /*buttonProps*/ 512 && /*buttonProps*/ ctx[9]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			/*button_binding*/ ctx[33](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(169:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (149:28) 
    function create_if_block_2$3(ctx) {
    	let a;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[0] && create_if_block_3$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	var switch_value = /*icon*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-hidden": "true",
    				class: "bx--btn__icon",
    				"aria-label": /*iconDescription*/ ctx[4]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let a_levels = [/*buttonProps*/ ctx[9]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(a, a_data);
    			add_location(a, file$4, 150, 2, 4187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			if (switch_instance) {
    				mount_component(switch_instance, a, null);
    			}

    			/*a_binding*/ ctx[32](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler_1*/ ctx[20], false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler_1*/ ctx[21], false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler_1*/ ctx[22], false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler_1*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasIconOnly*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(a, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 16) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[4];

    			if (switch_value !== (switch_value = /*icon*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, a, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [dirty[0] & /*buttonProps*/ 512 && /*buttonProps*/ ctx[9]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			/*a_binding*/ ctx[32](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(149:28) ",
    		ctx
    	});

    	return block;
    }

    // (147:13) 
    function create_if_block_1$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, buttonProps*/ 262656)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(147:13) ",
    		ctx
    	});

    	return block;
    }

    // (136:0) {#if skeleton}
    function create_if_block$3(ctx) {
    	let buttonskeleton;
    	let current;

    	const buttonskeleton_spread_levels = [
    		{ href: /*href*/ ctx[8] },
    		{ size: /*size*/ ctx[2] },
    		/*$$restProps*/ ctx[10],
    		{
    			style: /*hasIconOnly*/ ctx[0] && 'width: 3rem;'
    		}
    	];

    	let buttonskeleton_props = {};

    	for (let i = 0; i < buttonskeleton_spread_levels.length; i += 1) {
    		buttonskeleton_props = assign(buttonskeleton_props, buttonskeleton_spread_levels[i]);
    	}

    	buttonskeleton = new ButtonSkeleton$1({
    			props: buttonskeleton_props,
    			$$inline: true
    		});

    	buttonskeleton.$on("click", /*click_handler*/ ctx[28]);
    	buttonskeleton.$on("mouseover", /*mouseover_handler*/ ctx[29]);
    	buttonskeleton.$on("mouseenter", /*mouseenter_handler*/ ctx[30]);
    	buttonskeleton.$on("mouseleave", /*mouseleave_handler*/ ctx[31]);

    	const block = {
    		c: function create() {
    			create_component(buttonskeleton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(buttonskeleton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const buttonskeleton_changes = (dirty[0] & /*href, size, $$restProps, hasIconOnly*/ 1285)
    			? get_spread_update(buttonskeleton_spread_levels, [
    					dirty[0] & /*href*/ 256 && { href: /*href*/ ctx[8] },
    					dirty[0] & /*size*/ 4 && { size: /*size*/ ctx[2] },
    					dirty[0] & /*$$restProps*/ 1024 && get_spread_object(/*$$restProps*/ ctx[10]),
    					dirty[0] & /*hasIconOnly*/ 1 && {
    						style: /*hasIconOnly*/ ctx[0] && 'width: 3rem;'
    					}
    				])
    			: {};

    			buttonskeleton.$set(buttonskeleton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonskeleton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonskeleton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(buttonskeleton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(136:0) {#if skeleton}",
    		ctx
    	});

    	return block;
    }

    // (178:4) {#if hasIconOnly}
    function create_if_block_4(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[4]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$4, 178, 6, 4719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iconDescription*/ 16) set_data_dev(t, /*iconDescription*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(178:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    // (159:4) {#if hasIconOnly}
    function create_if_block_3$1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[4]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$4, 159, 6, 4331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iconDescription*/ 16) set_data_dev(t, /*iconDescription*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(159:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$3, create_if_block_2$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*skeleton*/ ctx[6]) return 0;
    		if (/*as*/ ctx[5]) return 1;
    		if (/*href*/ ctx[8] && !/*disabled*/ ctx[7]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let buttonProps;

    	const omit_props_names = [
    		"kind","size","expressive","isSelected","hasIconOnly","icon","iconDescription","tooltipAlignment","tooltipPosition","as","skeleton","disabled","href","tabindex","type","ref"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { kind = "primary" } = $$props;
    	let { size = "default" } = $$props;
    	let { expressive = false } = $$props;
    	let { isSelected = false } = $$props;
    	let { hasIconOnly = false } = $$props;
    	let { icon = undefined } = $$props;
    	let { iconDescription = undefined } = $$props;
    	let { tooltipAlignment = "center" } = $$props;
    	let { tooltipPosition = "bottom" } = $$props;
    	let { as = false } = $$props;
    	let { skeleton = false } = $$props;
    	let { disabled = false } = $$props;
    	let { href = undefined } = $$props;
    	let { tabindex = "0" } = $$props;
    	let { type = "button" } = $$props;
    	let { ref = null } = $$props;
    	const ctx = getContext("ComposedModal");

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('kind' in $$new_props) $$invalidate(11, kind = $$new_props.kind);
    		if ('size' in $$new_props) $$invalidate(2, size = $$new_props.size);
    		if ('expressive' in $$new_props) $$invalidate(12, expressive = $$new_props.expressive);
    		if ('isSelected' in $$new_props) $$invalidate(13, isSelected = $$new_props.isSelected);
    		if ('hasIconOnly' in $$new_props) $$invalidate(0, hasIconOnly = $$new_props.hasIconOnly);
    		if ('icon' in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ('iconDescription' in $$new_props) $$invalidate(4, iconDescription = $$new_props.iconDescription);
    		if ('tooltipAlignment' in $$new_props) $$invalidate(14, tooltipAlignment = $$new_props.tooltipAlignment);
    		if ('tooltipPosition' in $$new_props) $$invalidate(15, tooltipPosition = $$new_props.tooltipPosition);
    		if ('as' in $$new_props) $$invalidate(5, as = $$new_props.as);
    		if ('skeleton' in $$new_props) $$invalidate(6, skeleton = $$new_props.skeleton);
    		if ('disabled' in $$new_props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ('href' in $$new_props) $$invalidate(8, href = $$new_props.href);
    		if ('tabindex' in $$new_props) $$invalidate(16, tabindex = $$new_props.tabindex);
    		if ('type' in $$new_props) $$invalidate(17, type = $$new_props.type);
    		if ('ref' in $$new_props) $$invalidate(1, ref = $$new_props.ref);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		kind,
    		size,
    		expressive,
    		isSelected,
    		hasIconOnly,
    		icon,
    		iconDescription,
    		tooltipAlignment,
    		tooltipPosition,
    		as,
    		skeleton,
    		disabled,
    		href,
    		tabindex,
    		type,
    		ref,
    		getContext,
    		ButtonSkeleton: ButtonSkeleton$1,
    		ctx,
    		buttonProps
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('kind' in $$props) $$invalidate(11, kind = $$new_props.kind);
    		if ('size' in $$props) $$invalidate(2, size = $$new_props.size);
    		if ('expressive' in $$props) $$invalidate(12, expressive = $$new_props.expressive);
    		if ('isSelected' in $$props) $$invalidate(13, isSelected = $$new_props.isSelected);
    		if ('hasIconOnly' in $$props) $$invalidate(0, hasIconOnly = $$new_props.hasIconOnly);
    		if ('icon' in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ('iconDescription' in $$props) $$invalidate(4, iconDescription = $$new_props.iconDescription);
    		if ('tooltipAlignment' in $$props) $$invalidate(14, tooltipAlignment = $$new_props.tooltipAlignment);
    		if ('tooltipPosition' in $$props) $$invalidate(15, tooltipPosition = $$new_props.tooltipPosition);
    		if ('as' in $$props) $$invalidate(5, as = $$new_props.as);
    		if ('skeleton' in $$props) $$invalidate(6, skeleton = $$new_props.skeleton);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ('href' in $$props) $$invalidate(8, href = $$new_props.href);
    		if ('tabindex' in $$props) $$invalidate(16, tabindex = $$new_props.tabindex);
    		if ('type' in $$props) $$invalidate(17, type = $$new_props.type);
    		if ('ref' in $$props) $$invalidate(1, ref = $$new_props.ref);
    		if ('buttonProps' in $$props) $$invalidate(9, buttonProps = $$new_props.buttonProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ref*/ 2) {
    			if (ctx && ref) {
    				ctx.declareRef(ref);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*icon*/ 8) {
    			$$invalidate(0, hasIconOnly = icon && !$$slots.default);
    		}

    		$$invalidate(9, buttonProps = {
    			type: href && !disabled ? undefined : type,
    			tabindex,
    			disabled: disabled === true ? true : undefined,
    			href,
    			"aria-pressed": hasIconOnly && kind === "ghost" && !href
    			? isSelected
    			: undefined,
    			...$$restProps,
    			class: [
    				"bx--btn",
    				expressive && "bx--btn--expressive",
    				(size === "small" && !expressive || size === "sm" && !expressive || size === "small" && !expressive) && "bx--btn--sm",
    				size === "field" && !expressive || size === "md" && !expressive && "bx--btn--md",
    				size === "field" && "bx--btn--field",
    				size === "small" && "bx--btn--sm",
    				size === "lg" && "bx--btn--lg",
    				size === "xl" && "bx--btn--xl",
    				kind && `bx--btn--${kind}`,
    				disabled && "bx--btn--disabled",
    				hasIconOnly && "bx--btn--icon-only",
    				hasIconOnly && "bx--tooltip__trigger",
    				hasIconOnly && "bx--tooltip--a11y",
    				hasIconOnly && tooltipPosition && `bx--btn--icon-only--${tooltipPosition}`,
    				hasIconOnly && tooltipAlignment && `bx--tooltip--align-${tooltipAlignment}`,
    				hasIconOnly && isSelected && kind === "ghost" && "bx--btn--selected",
    				$$restProps.class
    			].filter(Boolean).join(" ")
    		});
    	};

    	return [
    		hasIconOnly,
    		ref,
    		size,
    		icon,
    		iconDescription,
    		as,
    		skeleton,
    		disabled,
    		href,
    		buttonProps,
    		$$restProps,
    		kind,
    		expressive,
    		isSelected,
    		tooltipAlignment,
    		tooltipPosition,
    		tabindex,
    		type,
    		$$scope,
    		slots,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1,
    		click_handler_2,
    		mouseover_handler_2,
    		mouseenter_handler_2,
    		mouseleave_handler_2,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		a_binding,
    		button_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				kind: 11,
    				size: 2,
    				expressive: 12,
    				isSelected: 13,
    				hasIconOnly: 0,
    				icon: 3,
    				iconDescription: 4,
    				tooltipAlignment: 14,
    				tooltipPosition: 15,
    				as: 5,
    				skeleton: 6,
    				disabled: 7,
    				href: 8,
    				tabindex: 16,
    				type: 17,
    				ref: 1
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get kind() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kind(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expressive() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expressive(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasIconOnly() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasIconOnly(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDescription() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDescription(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipAlignment() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipAlignment(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipPosition() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipPosition(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get skeleton() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skeleton(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Button$1 = Button;

    /* node_modules\carbon-components-svelte\src\Loading\Loading.svelte generated by Svelte v3.44.3 */

    const file$3 = "node_modules\\carbon-components-svelte\\src\\Loading\\Loading.svelte";

    // (53:0) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let label;
    	let t0;
    	let t1;
    	let svg;
    	let title;
    	let t2;
    	let circle;
    	let div_aria_live_value;
    	let if_block = /*small*/ ctx[0] && create_if_block_2$2(ctx);

    	let div_levels = [
    		{ "aria-atomic": "true" },
    		{ "aria-labelledby": /*id*/ ctx[4] },
    		{
    			"aria-live": div_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off'
    		},
    		/*$$restProps*/ ctx[6]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(/*description*/ ctx[3]);
    			t1 = space();
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t2 = text(/*description*/ ctx[3]);
    			if (if_block) if_block.c();
    			circle = svg_element("circle");
    			attr_dev(label, "id", /*id*/ ctx[4]);
    			toggle_class(label, "bx--visually-hidden", true);
    			add_location(label, file$3, 63, 4, 1781);
    			add_location(title, file$3, 65, 6, 1925);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$3, 73, 6, 2133);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$3, 64, 4, 1859);
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--loading", true);
    			toggle_class(div, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div, file$3, 53, 2, 1479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, title);
    			append_dev(title, t2);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 8) set_data_dev(t0, /*description*/ ctx[3]);

    			if (dirty & /*id*/ 16) {
    				attr_dev(label, "id", /*id*/ ctx[4]);
    			}

    			if (dirty & /*description*/ 8) set_data_dev(t2, /*description*/ ctx[3]);

    			if (/*small*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(svg, circle);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*spinnerRadius*/ 32) {
    				attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				{ "aria-atomic": "true" },
    				dirty & /*id*/ 16 && { "aria-labelledby": /*id*/ ctx[4] },
    				dirty & /*active*/ 2 && div_aria_live_value !== (div_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off') && { "aria-live": div_aria_live_value },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			toggle_class(div, "bx--loading", true);
    			toggle_class(div, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div, "bx--loading--stop", !/*active*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if withOverlay}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let label;
    	let t0;
    	let t1;
    	let svg;
    	let title;
    	let t2;
    	let circle;
    	let div0_aria_live_value;
    	let if_block = /*small*/ ctx[0] && create_if_block_1$2(ctx);
    	let div1_levels = [/*$$restProps*/ ctx[6]];
    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			t0 = text(/*description*/ ctx[3]);
    			t1 = space();
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t2 = text(/*description*/ ctx[3]);
    			if (if_block) if_block.c();
    			circle = svg_element("circle");
    			attr_dev(label, "id", /*id*/ ctx[4]);
    			toggle_class(label, "bx--visually-hidden", true);
    			add_location(label, file$3, 34, 6, 933);
    			add_location(title, file$3, 36, 8, 1081);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$3, 44, 8, 1305);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$3, 35, 6, 1013);
    			attr_dev(div0, "aria-atomic", "true");
    			attr_dev(div0, "aria-labelledby", /*id*/ ctx[4]);
    			attr_dev(div0, "aria-live", div0_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off');
    			toggle_class(div0, "bx--loading", true);
    			toggle_class(div0, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div0, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div0, file$3, 25, 4, 634);
    			set_attributes(div1, div1_data);
    			toggle_class(div1, "bx--loading-overlay", true);
    			toggle_class(div1, "bx--loading-overlay--stop", !/*active*/ ctx[1]);
    			add_location(div1, file$3, 20, 2, 513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(label, t0);
    			append_dev(div0, t1);
    			append_dev(div0, svg);
    			append_dev(svg, title);
    			append_dev(title, t2);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 8) set_data_dev(t0, /*description*/ ctx[3]);

    			if (dirty & /*id*/ 16) {
    				attr_dev(label, "id", /*id*/ ctx[4]);
    			}

    			if (dirty & /*description*/ 8) set_data_dev(t2, /*description*/ ctx[3]);

    			if (/*small*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(svg, circle);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*spinnerRadius*/ 32) {
    				attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			}

    			if (dirty & /*id*/ 16) {
    				attr_dev(div0, "aria-labelledby", /*id*/ ctx[4]);
    			}

    			if (dirty & /*active*/ 2 && div0_aria_live_value !== (div0_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off')) {
    				attr_dev(div0, "aria-live", div0_aria_live_value);
    			}

    			if (dirty & /*small*/ 1) {
    				toggle_class(div0, "bx--loading--small", /*small*/ ctx[0]);
    			}

    			if (dirty & /*active*/ 2) {
    				toggle_class(div0, "bx--loading--stop", !/*active*/ ctx[1]);
    			}

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]]));
    			toggle_class(div1, "bx--loading-overlay", true);
    			toggle_class(div1, "bx--loading-overlay--stop", !/*active*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(20:0) {#if withOverlay}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if small}
    function create_if_block_2$2(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__background", true);
    			add_location(circle, file$3, 67, 8, 1980);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*spinnerRadius*/ 32) {
    				attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(67:6) {#if small}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if small}
    function create_if_block_1$2(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__background", true);
    			add_location(circle, file$3, 38, 10, 1140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*spinnerRadius*/ 32) {
    				attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(38:8) {#if small}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*withOverlay*/ ctx[2]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let spinnerRadius;
    	const omit_props_names = ["small","active","withOverlay","description","id"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loading', slots, []);
    	let { small = false } = $$props;
    	let { active = true } = $$props;
    	let { withOverlay = true } = $$props;
    	let { description = "Active loading indicator" } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('small' in $$new_props) $$invalidate(0, small = $$new_props.small);
    		if ('active' in $$new_props) $$invalidate(1, active = $$new_props.active);
    		if ('withOverlay' in $$new_props) $$invalidate(2, withOverlay = $$new_props.withOverlay);
    		if ('description' in $$new_props) $$invalidate(3, description = $$new_props.description);
    		if ('id' in $$new_props) $$invalidate(4, id = $$new_props.id);
    	};

    	$$self.$capture_state = () => ({
    		small,
    		active,
    		withOverlay,
    		description,
    		id,
    		spinnerRadius
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('small' in $$props) $$invalidate(0, small = $$new_props.small);
    		if ('active' in $$props) $$invalidate(1, active = $$new_props.active);
    		if ('withOverlay' in $$props) $$invalidate(2, withOverlay = $$new_props.withOverlay);
    		if ('description' in $$props) $$invalidate(3, description = $$new_props.description);
    		if ('id' in $$props) $$invalidate(4, id = $$new_props.id);
    		if ('spinnerRadius' in $$props) $$invalidate(5, spinnerRadius = $$new_props.spinnerRadius);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*small*/ 1) {
    			$$invalidate(5, spinnerRadius = small ? "42" : "44");
    		}
    	};

    	return [small, active, withOverlay, description, id, spinnerRadius, $$restProps];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			small: 0,
    			active: 1,
    			withOverlay: 2,
    			description: 3,
    			id: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get small() {
    		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withOverlay() {
    		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withOverlay(value) {
    		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Loading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Loading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Loading$1 = Loading;

    /* node_modules\carbon-components-svelte\src\Form\Form.svelte generated by Svelte v3.44.3 */

    const file$2 = "node_modules\\carbon-components-svelte\\src\\Form\\Form.svelte";

    function create_fragment$2(ctx) {
    	let form;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let form_levels = [/*$$restProps*/ ctx[1]];
    	let form_data = {};

    	for (let i = 0; i < form_levels.length; i += 1) {
    		form_data = assign(form_data, form_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			if (default_slot) default_slot.c();
    			set_attributes(form, form_data);
    			toggle_class(form, "bx--form", true);
    			add_location(form, file$2, 6, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);

    			if (default_slot) {
    				default_slot.m(form, null);
    			}

    			/*form_binding*/ ctx[10](form);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(form, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(form, "keydown", /*keydown_handler*/ ctx[5], false, false, false),
    					listen_dev(form, "mouseover", /*mouseover_handler*/ ctx[6], false, false, false),
    					listen_dev(form, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(form, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(form, form_data = get_spread_update(form_levels, [dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]]));
    			toggle_class(form, "bx--form", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (default_slot) default_slot.d(detaching);
    			/*form_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const omit_props_names = ["ref"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Form', slots, ['default']);
    	let { ref = null } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function submit_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function form_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('ref' in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ ref });

    	$$self.$inject_state = $$new_props => {
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ref,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		keydown_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		submit_handler,
    		form_binding
    	];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { ref: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get ref() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Form$1 = Form;

    const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ms-global/image/upload/';

    var pathArray = (document.currentScript && document.currentScript.src || new URL('MorderEdit2.js', document.baseURI).href).split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;
    const BASE_URL =  url; //'https://catalog.boost-pop.com'; //'http://127.0.0.1:8000'; // 
    const GET_ALL_SIZES_API = BASE_URL + '/client-api/get-all-sizes/';
    const GET_ALL_COLORS_API = BASE_URL + '/client-api/get-all-colors/';
    const GET_ALL_VARIENTS_API = BASE_URL + '/client-api/get-all-variants/';
    const MORDER_GET_API = BASE_URL + '/morders/api-get-order-data';

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    async function apiGetMOrder(order_id) {
        const response = await fetch_wraper(`${MORDER_GET_API}/${order_id}`, {});
        return response;
    }
    async function apiSaveMOrder(order_id, data) {
        const response = await fetch_wraper(`${MORDER_GET_API}/${order_id}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;

    }
    async function apiGetAllSizes() {
        return await fetch_wraper(GET_ALL_SIZES_API);
    }

    async function apiGetAllColors() {
        return await fetch_wraper(GET_ALL_COLORS_API);
    }

    async function apiGetAllVariants() {
        return await fetch_wraper(GET_ALL_VARIENTS_API);
    }
    function fetch_wraper(url, requestOptions, custom_fetch, isRetry = false) {
        console.log('fetch_wraper: ', url);
        let headers_json= {
            'Content-Type': 'application/json',
            'Content-Type': 'application/json; charset=UTF-8',
            'X-CSRFToken': getCookie('csrftoken'),
        };
        var myHeaders = new Headers(headers_json);
        var requestOptions = Object.assign({}, {
                method: "GET",
                mode:'cors',
                credentials: 'include',//'',
                headers: myHeaders,
                redirect: 'follow'
            },requestOptions);
        
        let response;
        try {
            if(custom_fetch) {
                response = custom_fetch(url, requestOptions);
            }
            else {
                response = fetch(url, requestOptions);
            }
        }
        catch (error) {
            console.error(error);
          }
        return response.then((data)=>{
            if(data.status == 401) {
                let userInfo = get(userInfoStore);
                userInfo.isLogin = false;
                userInfo.access = null;
                userInfoStore.set(userInfo);
                if(!isRetry) {
                    return fetch_wraper(url, requestOptions, custom_fetch, true);
                }
            }
            console.log(url, ' ==> ', data.status);
            return data.json()
        }).then((info)=> {
            return info;
        });
    }

    /* src\MentriesServerTable.svelte generated by Svelte v3.44.3 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\MentriesServerTable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i].id;
    	child_ctx[21] = list[i].name;
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (123:0) {#if ALL_COLORS_DICT && ALL_SIZES_DICT && product}
    function create_if_block$1(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th;
    	let t1;
    	let t2;
    	let t3;
    	let tbody;
    	let if_block = /*product*/ ctx[0].verients.length != 0 && create_if_block_3(ctx);
    	let each_value_4 = /*sorted_sizes*/ ctx[1];
    	validate_each_argument(each_value_4);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_1[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value = /*sorted_colors*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "צבע";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th, "class", "sticky-col const-size-cell svelte-kewhjq");
    			add_location(th, file$1, 126, 16, 4153);
    			add_location(tr, file$1, 125, 8, 4131);
    			add_location(thead, file$1, 124, 4, 4114);
    			add_location(tbody, file$1, 138, 4, 4544);
    			attr_dev(table, "class", "entries-table svelte-kewhjq");
    			add_location(table, file$1, 123, 0, 4079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th);
    			append_dev(tr, t1);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t3);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[0].verients.length != 0) {
    				if (if_block) ; else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(tr, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*sorted_sizes*/ 2) {
    				each_value_4 = /*sorted_sizes*/ ctx[1];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_4.length;
    			}

    			if (dirty & /*product, find_entry_quantity, sorted_colors, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed*/ 125) {
    				each_value = /*sorted_colors*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(123:0) {#if ALL_COLORS_DICT && ALL_SIZES_DICT && product}",
    		ctx
    	});

    	return block;
    }

    // (128:16) {#if product.verients.length != 0}
    function create_if_block_3(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "מודל";
    			attr_dev(th, "class", "const-size-cell svelte-kewhjq");
    			add_location(th, file$1, 128, 20, 4274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(128:16) {#if product.verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (131:16) {#each sorted_sizes as size}
    function create_each_block_4(ctx) {
    	let th;
    	let t0_value = /*size*/ ctx[17].size + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(th, "class", "svelte-kewhjq");
    			add_location(th, file$1, 131, 20, 4402);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sorted_sizes*/ 2 && t0_value !== (t0_value = /*size*/ ctx[17].size + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(131:16) {#each sorted_sizes as size}",
    		ctx
    	});

    	return block;
    }

    // (145:16) {#if product.verients.length != 0}
    function create_if_block_2$1(ctx) {
    	let td;
    	let each_value_3 = /*product*/ ctx[0].verients;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			td = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(td, file$1, 145, 16, 4913);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 1) {
    				each_value_3 = /*product*/ ctx[0].verients;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(145:16) {#if product.verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (147:20) {#each product.verients as varient }
    function create_each_block_3(ctx) {
    	let div;
    	let t0_value = /*varient*/ ctx[24].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "varient-box cls-cell");
    			add_location(div, file$1, 147, 20, 4997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 1 && t0_value !== (t0_value = /*varient*/ ctx[24].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(147:20) {#each product.verients as varient }",
    		ctx
    	});

    	return block;
    }

    // (162:20) {:else}
    function create_else_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*product*/ ctx[0].verients;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*find_entry_quantity, product, sorted_colors, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed*/ 125) {
    				each_value_2 = /*product*/ ctx[0].verients;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(162:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (158:20) {#if product.verients.length == 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let input;
    	let input_value_value;
    	let input_data_color_value;
    	let input_data_size_value;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[6](/*size*/ ctx[17], /*color*/ ctx[14], null);
    			attr_dev(input, "class", "size-input cls-cell svelte-kewhjq");
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].color);
    			attr_dev(input, "data-color", input_data_color_value = /*color*/ ctx[14]);
    			attr_dev(input, "data-size", input_data_size_value = /*size*/ ctx[17]);
    			attr_dev(input, "data-ver", null);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[4][/*size*/ ctx[17]].size);
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$1, 159, 24, 5434);
    			attr_dev(div, "class", "cell-wraper");
    			add_location(div, file$1, 158, 24, 5383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product, sorted_colors*/ 5 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[6](/*size*/ ctx[17], /*color*/ ctx[14], null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*ALL_COLORS_DICT, sorted_colors*/ 12) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].color);
    			}

    			if (dirty & /*sorted_colors*/ 4 && input_data_color_value !== (input_data_color_value = /*color*/ ctx[14])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty & /*product*/ 1 && input_data_size_value !== (input_data_size_value = /*size*/ ctx[17])) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty & /*ALL_SIZES_DICT, product*/ 17 && input_placeholder_value !== (input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[4][/*size*/ ctx[17]].size)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(158:20) {#if product.verients.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (164:24) {#each product.verients as {id, name}
    function create_each_block_2(ctx) {
    	let div;
    	let input;
    	let input_value_value;
    	let input_id_value;
    	let input_data_color_value;
    	let input_data_size_value;
    	let input_data_ver_value;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[6](/*size*/ ctx[17], /*color*/ ctx[14], /*id*/ ctx[20]);
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].color);
    			attr_dev(input, "id", input_id_value = "input_entery_" + /*product*/ ctx[0].id + "_" + /*size*/ ctx[17] + "_" + /*color*/ ctx[14] + "_" + /*id*/ ctx[20]);
    			attr_dev(input, "data-color", input_data_color_value = /*color*/ ctx[14]);
    			attr_dev(input, "data-size", input_data_size_value = /*size*/ ctx[17]);
    			attr_dev(input, "data-ver", input_data_ver_value = /*id*/ ctx[20]);
    			attr_dev(input, "class", "size-input cls-cell svelte-kewhjq");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = "" + (/*ALL_SIZES_DICT*/ ctx[4][/*size*/ ctx[17]].size + " (" + /*name*/ ctx[21] + ")"));
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$1, 165, 24, 5970);
    			attr_dev(div, "class", "cell-wraper");
    			add_location(div, file$1, 164, 24, 5919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product, sorted_colors*/ 5 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[6](/*size*/ ctx[17], /*color*/ ctx[14], /*id*/ ctx[20])) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*ALL_COLORS_DICT, sorted_colors*/ 12) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].color);
    			}

    			if (dirty & /*product, sorted_colors*/ 5 && input_id_value !== (input_id_value = "input_entery_" + /*product*/ ctx[0].id + "_" + /*size*/ ctx[17] + "_" + /*color*/ ctx[14] + "_" + /*id*/ ctx[20])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*sorted_colors*/ 4 && input_data_color_value !== (input_data_color_value = /*color*/ ctx[14])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty & /*product*/ 1 && input_data_size_value !== (input_data_size_value = /*size*/ ctx[17])) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty & /*product*/ 1 && input_data_ver_value !== (input_data_ver_value = /*id*/ ctx[20])) {
    				attr_dev(input, "data-ver", input_data_ver_value);
    			}

    			if (dirty & /*ALL_SIZES_DICT, product*/ 17 && input_placeholder_value !== (input_placeholder_value = "" + (/*ALL_SIZES_DICT*/ ctx[4][/*size*/ ctx[17]].size + " (" + /*name*/ ctx[21] + ")"))) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(164:24) {#each product.verients as {id, name}",
    		ctx
    	});

    	return block;
    }

    // (155:16) {#each product.sizes as size}
    function create_each_block_1(ctx) {
    	let td;

    	function select_block_type(ctx, dirty) {
    		if (/*product*/ ctx[0].verients.length == 0) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			attr_dev(td, "class", "size-cell");
    			add_location(td, file$1, 155, 16, 5257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_block.m(td, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(155:16) {#each product.sizes as size}",
    		ctx
    	});

    	return block;
    }

    // (140:8) {#each sorted_colors as color, color_idx}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let div1;
    	let div0;
    	let t0_value = /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let td1;
    	let button;
    	let svg;
    	let path;
    	let t4;
    	let if_block = /*product*/ ctx[0].verients.length != 0 && create_if_block_2$1(ctx);
    	let each_value_1 = /*product*/ ctx[0].sizes;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			td1 = element("td");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t4 = space();
    			attr_dev(div0, "class", "inner");
    			set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].color);
    			add_location(div0, file$1, 142, 40, 4703);
    			attr_dev(div1, "class", "color-box");
    			add_location(div1, file$1, 142, 16, 4679);
    			attr_dev(td0, "class", "sticky-col");
    			add_location(td0, file$1, 141, 16, 4638);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M30.9 2.3h-8.6L21.6 1c-.3-.6-.9-1-1.5-1h-8.2c-.6 0-1.2.4-1.5.9l-.7 1.4H1.1C.5 2.3 0 2.8 0 3.4v2.2c0 .6.5 1.1 1.1 1.1h29.7c.6 0 1.1-.5 1.1-1.1V3.4c.1-.6-.4-1.1-1-1.1zM3.8 32.8A3.4 3.4 0 0 0 7.2 36h17.6c1.8 0 3.3-1.4 3.4-3.2L29.7 9H2.3l1.5 23.8z");
    			add_location(path, file$1, 176, 109, 6741);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16px");
    			attr_dev(svg, "height", "16px");
    			attr_dev(svg, "viewBox", "0 0 32 36");
    			add_location(svg, file$1, 176, 20, 6652);
    			attr_dev(button, "class", "remove-button");
    			add_location(button, file$1, 175, 16, 6600);
    			attr_dev(td1, "class", "delete-cell-style");
    			add_location(td1, file$1, 174, 16, 6552);
    			add_location(tr, file$1, 140, 12, 4616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(tr, t1);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(td1, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(tr, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ALL_COLORS_DICT, sorted_colors*/ 12) {
    				set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].color);
    			}

    			if (dirty & /*ALL_COLORS_DICT, sorted_colors*/ 12 && t0_value !== (t0_value = /*ALL_COLORS_DICT*/ ctx[3][/*color*/ ctx[14]].name + "")) set_data_dev(t0, t0_value);

    			if (/*product*/ ctx[0].verients.length != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(tr, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*find_entry_quantity, product, sorted_colors, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed*/ 125) {
    				each_value_1 = /*product*/ ctx[0].sizes;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(140:8) {#each sorted_colors as color, color_idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*ALL_COLORS_DICT*/ ctx[3] && /*ALL_SIZES_DICT*/ ctx[4] && /*product*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*ALL_COLORS_DICT*/ ctx[3] && /*ALL_SIZES_DICT*/ ctx[4] && /*product*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MentriesServerTable', slots, []);
    	let { product } = $$props;
    	let { ALL_SIZES } = $$props;
    	let { ALL_COLORS } = $$props;
    	let { ALL_VERIENTS } = $$props;
    	let sizes_ids_set = new Set();
    	let colors_ids_set = new Set();
    	let verients_ids_set = new Set();
    	let sorted_sizes = [];
    	let sorted_colors = [];
    	let sorted_verients = [];
    	let ALL_COLORS_DICT = undefined;
    	let ALL_SIZES_DICT = undefined;

    	function input_amount_changed(e) {
    		let el = e.target;
    		let size_id = el.dataset.size;
    		let color_id = el.dataset.color;
    		let verient_id = el.dataset.verient;
    		let quantity = el.value;
    		console.log('input_amount_changed:', size_id, color_id, verient_id, quantity);
    		let found = false;

    		product.entries.forEach(entry => {
    			if (entry.size == size_id && entry.color == color_id && entry.verient == verient_id) {
    				entry.quantity = quantity;
    				found = true;
    			}
    		});

    		if (!found) {
    			product.entries.push({
    				id: null,
    				size: size_id,
    				color: color_id,
    				varient: verient_id,
    				quantity
    			});
    		}
    	}

    	function find_entry_quantity(size, color, verient) {
    		for (let entry of product.entries) {
    			if (entry.size == size && entry.color == color && entry.verient == verient) {
    				return entry.quantity;
    			}
    		}

    		return undefined;
    	}

    	const writable_props = ['product', 'ALL_SIZES', 'ALL_COLORS', 'ALL_VERIENTS'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MentriesServerTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('product' in $$props) $$invalidate(0, product = $$props.product);
    		if ('ALL_SIZES' in $$props) $$invalidate(7, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(8, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(9, ALL_VERIENTS = $$props.ALL_VERIENTS);
    	};

    	$$self.$capture_state = () => ({
    		Form: Form$1,
    		apiGetAllSizes,
    		product,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		sizes_ids_set,
    		colors_ids_set,
    		verients_ids_set,
    		sorted_sizes,
    		sorted_colors,
    		sorted_verients,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		input_amount_changed,
    		find_entry_quantity
    	});

    	$$self.$inject_state = $$props => {
    		if ('product' in $$props) $$invalidate(0, product = $$props.product);
    		if ('ALL_SIZES' in $$props) $$invalidate(7, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(8, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(9, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('sizes_ids_set' in $$props) $$invalidate(10, sizes_ids_set = $$props.sizes_ids_set);
    		if ('colors_ids_set' in $$props) colors_ids_set = $$props.colors_ids_set;
    		if ('verients_ids_set' in $$props) verients_ids_set = $$props.verients_ids_set;
    		if ('sorted_sizes' in $$props) $$invalidate(1, sorted_sizes = $$props.sorted_sizes);
    		if ('sorted_colors' in $$props) $$invalidate(2, sorted_colors = $$props.sorted_colors);
    		if ('sorted_verients' in $$props) sorted_verients = $$props.sorted_verients;
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(3, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(4, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ALL_COLORS*/ 256) {
    			{

    				if (ALL_COLORS) {
    					let ALL_COLORS_DICT_temp = {};

    					ALL_COLORS.forEach(color => {
    						ALL_COLORS_DICT_temp[color.id] = color;
    					});

    					$$invalidate(3, ALL_COLORS_DICT = ALL_COLORS_DICT_temp);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*ALL_SIZES*/ 128) {
    			{

    				if (ALL_SIZES) {
    					let ALL_SIZES_DICT_temp = {};

    					ALL_SIZES.forEach(size => {
    						ALL_SIZES_DICT_temp[size.id] = size;
    					});

    					$$invalidate(4, ALL_SIZES_DICT = ALL_SIZES_DICT_temp);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*product, ALL_SIZES, sorted_sizes*/ 131) {
    			{
    				product.entries;
    				let sizes_temp_set = new Set();
    				let colors_temp_set = new Set();
    				let verients_temp_set = new Set();

    				// add product.colors to colors_ids_set
    				for (let color_id of product.colors) {
    					console.log('adding color_id:', color_id);
    					colors_temp_set.add(color_id);
    				}

    				// add product.sizes to sizes_ids_set
    				for (let size_id of product.sizes) {
    					console.log('adding size_id:', size_id);
    					sizes_temp_set.add(size_id);
    				}

    				// add product.varients to varients_ids_set
    				for (let verient_id of product.verients) {
    					console.log('adding verient_id:', verient_id);
    					verients_temp_set.add(verient_id);
    				}

    				for (let entry of product.entries) {
    					sizes_temp_set.add(entry.size);
    					colors_temp_set.add(entry.color);
    					verients_temp_set.add(entry.verient);
    				}

    				// order sizes_ids_set by code
    				// sizes_ids_set: [1,2,7,3]
    				// ALL_SIZES: [{id:1, code: '3'}, {id:2, code: '4'}, {id:7, code: '2'}, {id:3, code: '1'}]
    				let ALL_SIZES_ordered = ALL_SIZES.sort((a, b) => {
    					return a.code.localeCompare(b.code);
    				});

    				console.log('ALL_SIZES_ordered:', ALL_SIZES_ordered);
    				console.log('sizes_ids_set:', sizes_ids_set);
    				let sorted_sizes_temp = [];

    				for (let size of ALL_SIZES_ordered) {
    					if (sizes_temp_set.has(size.id)) {
    						sorted_sizes_temp.push(size);
    					}
    				}

    				$$invalidate(1, sorted_sizes = [...sorted_sizes_temp.reverse()]);
    				console.log('sorted_sizes:', sorted_sizes);
    				$$invalidate(2, sorted_colors = [...colors_temp_set]);
    			}
    		}
    	};

    	return [
    		product,
    		sorted_sizes,
    		sorted_colors,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		input_amount_changed,
    		find_entry_quantity,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS
    	];
    }

    class MentriesServerTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			product: 0,
    			ALL_SIZES: 7,
    			ALL_COLORS: 8,
    			ALL_VERIENTS: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MentriesServerTable",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*product*/ ctx[0] === undefined && !('product' in props)) {
    			console_1$1.warn("<MentriesServerTable> was created without expected prop 'product'");
    		}

    		if (/*ALL_SIZES*/ ctx[7] === undefined && !('ALL_SIZES' in props)) {
    			console_1$1.warn("<MentriesServerTable> was created without expected prop 'ALL_SIZES'");
    		}

    		if (/*ALL_COLORS*/ ctx[8] === undefined && !('ALL_COLORS' in props)) {
    			console_1$1.warn("<MentriesServerTable> was created without expected prop 'ALL_COLORS'");
    		}

    		if (/*ALL_VERIENTS*/ ctx[9] === undefined && !('ALL_VERIENTS' in props)) {
    			console_1$1.warn("<MentriesServerTable> was created without expected prop 'ALL_VERIENTS'");
    		}
    	}

    	get product() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set product(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_SIZES() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_SIZES(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_COLORS() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_COLORS(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_VERIENTS() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_VERIENTS(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MorderEdit2.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;
    const file = "src\\MorderEdit2.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[19] = list;
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (77:4) {#if headerData}
    function create_if_block_2(ctx) {
    	let div0;
    	let t0;
    	let t1_value = new Date(/*headerData*/ ctx[0][0].created).toLocaleString('Israel') + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4_value = new Date(/*headerData*/ ctx[0][0].updated).toLocaleString('Israel') + "";
    	let t4;
    	let t5;
    	let table;
    	let thead;
    	let tr0;
    	let td0;
    	let t7;
    	let td1;
    	let t9;
    	let td2;
    	let t11;
    	let td3;
    	let t13;
    	let td4;
    	let t15;
    	let td5;
    	let t17;
    	let td6;
    	let t19;
    	let td7;
    	let t21;
    	let tbody;
    	let tr1;
    	let td8;
    	let t22_value = /*headerData*/ ctx[0][0].id + "";
    	let t22;
    	let t23;
    	let td9;
    	let t24_value = /*headerData*/ ctx[0][0].name + "";
    	let t24;
    	let t25;
    	let td10;
    	let t26_value = /*headerData*/ ctx[0][0].email + "";
    	let t26;
    	let t27;
    	let td11;
    	let textarea;
    	let t28;
    	let td12;
    	let t29_value = /*headerData*/ ctx[0][0].phone + "";
    	let t29;
    	let t30;
    	let td13;
    	let t31_value = /*headerData*/ ctx[0][0].status + "";
    	let t31;
    	let t32;
    	let td14;
    	let t33_value = /*headerData*/ ctx[0][0].client_name + "";
    	let t33;
    	let t34;
    	let td15;
    	let t35_value = /*headerData*/ ctx[0][0].agent + "";
    	let t35;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("נוצר ב");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text("עודכן ב");
    			t4 = text(t4_value);
    			t5 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "מזהה";
    			t7 = space();
    			td1 = element("td");
    			td1.textContent = "שם";
    			t9 = space();
    			td2 = element("td");
    			td2.textContent = "דואר אלקטרוני";
    			t11 = space();
    			td3 = element("td");
    			td3.textContent = "הודעה";
    			t13 = space();
    			td4 = element("td");
    			td4.textContent = "טלפון";
    			t15 = space();
    			td5 = element("td");
    			td5.textContent = "סטטוס";
    			t17 = space();
    			td6 = element("td");
    			td6.textContent = "שם לקוח";
    			t19 = space();
    			td7 = element("td");
    			td7.textContent = "סוכן";
    			t21 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td8 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			td9 = element("td");
    			t24 = text(t24_value);
    			t25 = space();
    			td10 = element("td");
    			t26 = text(t26_value);
    			t27 = space();
    			td11 = element("td");
    			textarea = element("textarea");
    			t28 = space();
    			td12 = element("td");
    			t29 = text(t29_value);
    			t30 = space();
    			td13 = element("td");
    			t31 = text(t31_value);
    			t32 = space();
    			td14 = element("td");
    			t33 = text(t33_value);
    			t34 = space();
    			td15 = element("td");
    			t35 = text(t35_value);
    			attr_dev(div0, "class", "created svelte-p9zetx");
    			add_location(div0, file, 77, 4, 2546);
    			attr_dev(div1, "class", "updated svelte-p9zetx");
    			add_location(div1, file, 80, 4, 2659);
    			attr_dev(td0, "class", "svelte-p9zetx");
    			add_location(td0, file, 86, 20, 2871);
    			attr_dev(td1, "class", "svelte-p9zetx");
    			add_location(td1, file, 87, 20, 2906);
    			attr_dev(td2, "class", "svelte-p9zetx");
    			add_location(td2, file, 88, 20, 2939);
    			attr_dev(td3, "class", "svelte-p9zetx");
    			add_location(td3, file, 89, 20, 2983);
    			attr_dev(td4, "class", "svelte-p9zetx");
    			add_location(td4, file, 90, 20, 3019);
    			attr_dev(td5, "class", "svelte-p9zetx");
    			add_location(td5, file, 91, 20, 3055);
    			attr_dev(td6, "class", "svelte-p9zetx");
    			add_location(td6, file, 92, 20, 3091);
    			attr_dev(td7, "class", "svelte-p9zetx");
    			add_location(td7, file, 93, 20, 3129);
    			attr_dev(tr0, "class", "svelte-p9zetx");
    			add_location(tr0, file, 85, 16, 2845);
    			attr_dev(thead, "class", "svelte-p9zetx");
    			add_location(thead, file, 84, 12, 2820);
    			attr_dev(td8, "class", "svelte-p9zetx");
    			add_location(td8, file, 98, 20, 3252);
    			attr_dev(td9, "class", "svelte-p9zetx");
    			add_location(td9, file, 99, 20, 3301);
    			attr_dev(td10, "class", "svelte-p9zetx");
    			add_location(td10, file, 100, 20, 3352);
    			add_location(textarea, file, 101, 24, 3408);
    			attr_dev(td11, "class", "svelte-p9zetx");
    			add_location(td11, file, 101, 20, 3404);
    			attr_dev(td12, "class", "svelte-p9zetx");
    			add_location(td12, file, 102, 20, 3484);
    			attr_dev(td13, "class", "svelte-p9zetx");
    			add_location(td13, file, 103, 20, 3536);
    			attr_dev(td14, "class", "svelte-p9zetx");
    			add_location(td14, file, 104, 20, 3589);
    			attr_dev(td15, "class", "svelte-p9zetx");
    			add_location(td15, file, 105, 20, 3647);
    			add_location(tr1, file, 97, 16, 3226);
    			attr_dev(tbody, "class", "svelte-p9zetx");
    			add_location(tbody, file, 96, 12, 3201);
    			attr_dev(table, "class", "headers-table svelte-p9zetx");
    			add_location(table, file, 83, 8, 2777);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t7);
    			append_dev(tr0, td1);
    			append_dev(tr0, t9);
    			append_dev(tr0, td2);
    			append_dev(tr0, t11);
    			append_dev(tr0, td3);
    			append_dev(tr0, t13);
    			append_dev(tr0, td4);
    			append_dev(tr0, t15);
    			append_dev(tr0, td5);
    			append_dev(tr0, t17);
    			append_dev(tr0, td6);
    			append_dev(tr0, t19);
    			append_dev(tr0, td7);
    			append_dev(table, t21);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td8);
    			append_dev(td8, t22);
    			append_dev(tr1, t23);
    			append_dev(tr1, td9);
    			append_dev(td9, t24);
    			append_dev(tr1, t25);
    			append_dev(tr1, td10);
    			append_dev(td10, t26);
    			append_dev(tr1, t27);
    			append_dev(tr1, td11);
    			append_dev(td11, textarea);
    			set_input_value(textarea, /*headerData*/ ctx[0][0].message);
    			append_dev(tr1, t28);
    			append_dev(tr1, td12);
    			append_dev(td12, t29);
    			append_dev(tr1, t30);
    			append_dev(tr1, td13);
    			append_dev(td13, t31);
    			append_dev(tr1, t32);
    			append_dev(tr1, td14);
    			append_dev(td14, t33);
    			append_dev(tr1, t34);
    			append_dev(tr1, td15);
    			append_dev(td15, t35);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*headerData*/ 1 && t1_value !== (t1_value = new Date(/*headerData*/ ctx[0][0].created).toLocaleString('Israel') + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*headerData*/ 1 && t4_value !== (t4_value = new Date(/*headerData*/ ctx[0][0].updated).toLocaleString('Israel') + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*headerData*/ 1 && t22_value !== (t22_value = /*headerData*/ ctx[0][0].id + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*headerData*/ 1 && t24_value !== (t24_value = /*headerData*/ ctx[0][0].name + "")) set_data_dev(t24, t24_value);
    			if (dirty & /*headerData*/ 1 && t26_value !== (t26_value = /*headerData*/ ctx[0][0].email + "")) set_data_dev(t26, t26_value);

    			if (dirty & /*headerData*/ 1) {
    				set_input_value(textarea, /*headerData*/ ctx[0][0].message);
    			}

    			if (dirty & /*headerData*/ 1 && t29_value !== (t29_value = /*headerData*/ ctx[0][0].phone + "")) set_data_dev(t29, t29_value);
    			if (dirty & /*headerData*/ 1 && t31_value !== (t31_value = /*headerData*/ ctx[0][0].status + "")) set_data_dev(t31, t31_value);
    			if (dirty & /*headerData*/ 1 && t33_value !== (t33_value = /*headerData*/ ctx[0][0].client_name + "")) set_data_dev(t33, t33_value);
    			if (dirty & /*headerData*/ 1 && t35_value !== (t35_value = /*headerData*/ ctx[0][0].agent + "")) set_data_dev(t35, t35_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(77:4) {#if headerData}",
    		ctx
    	});

    	return block;
    }

    // (113:4) {#if productsData}
    function create_if_block_1(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t3;
    	let td2;
    	let t5;
    	let td3;
    	let t7;
    	let td4;
    	let t9;
    	let td5;
    	let t11;
    	let td6;
    	let t13;
    	let td7;
    	let t15;
    	let tbody;
    	let current;
    	let each_value = /*productsData*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "מזהה";
    			t1 = space();
    			td1 = element("td");
    			td1.textContent = "שם מוצר";
    			t3 = space();
    			td2 = element("td");
    			td2.textContent = "מחיר";
    			t5 = space();
    			td3 = element("td");
    			td3.textContent = "רקמה?";
    			t7 = space();
    			td4 = element("td");
    			td4.textContent = "הדפסה?";
    			t9 = space();
    			td5 = element("td");
    			td5.textContent = "חשוב להזמנה";
    			t11 = space();
    			td6 = element("td");
    			td6.textContent = "הערות";
    			t13 = space();
    			td7 = element("td");
    			td7.textContent = "ברקוד";
    			t15 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(td0, "class", "svelte-p9zetx");
    			add_location(td0, file, 124, 20, 4049);
    			attr_dev(td1, "class", "svelte-p9zetx");
    			add_location(td1, file, 125, 20, 4084);
    			attr_dev(td2, "class", "svelte-p9zetx");
    			add_location(td2, file, 126, 20, 4122);
    			attr_dev(td3, "class", "svelte-p9zetx");
    			add_location(td3, file, 127, 20, 4157);
    			attr_dev(td4, "class", "svelte-p9zetx");
    			add_location(td4, file, 128, 20, 4193);
    			attr_dev(td5, "class", "svelte-p9zetx");
    			add_location(td5, file, 129, 20, 4230);
    			attr_dev(td6, "class", "svelte-p9zetx");
    			add_location(td6, file, 130, 20, 4272);
    			attr_dev(td7, "class", "svelte-p9zetx");
    			add_location(td7, file, 131, 20, 4308);
    			add_location(tr, file, 123, 16, 4023);
    			attr_dev(thead, "class", "svelte-p9zetx");
    			add_location(thead, file, 122, 12, 3998);
    			add_location(tbody, file, 134, 12, 4381);
    			attr_dev(table, "class", "product-table svelte-p9zetx");
    			add_location(table, file, 121, 8, 3955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			append_dev(table, t15);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*productsData, ALL_SIZES, ALL_COLORS, ALL_VERIENTS, CLOUDINARY_BASE_URL*/ 30) {
    				each_value = /*productsData*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(113:4) {#if productsData}",
    		ctx
    	});

    	return block;
    }

    // (136:16) {#each productsData as product}
    function create_each_block(ctx) {
    	let tr0;
    	let td0;
    	let pre;
    	let t0_value = /*product*/ ctx[18].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let t2;
    	let t3_value = /*product*/ ctx[18].product.title + "";
    	let t3;
    	let t4;
    	let td2;
    	let t5_value = /*product*/ ctx[18].price + "";
    	let t5;
    	let t6;
    	let td3;
    	let input0;
    	let t7;
    	let td4;
    	let input1;
    	let t8;
    	let td5;
    	let input2;
    	let t9;
    	let td6;
    	let textarea;
    	let t10;
    	let td7;
    	let t11_value = (/*product*/ ctx[18].pbarcode || '') + "";
    	let t11;
    	let t12;
    	let td8;
    	let button0;
    	let t14;
    	let button1;
    	let t16;
    	let tr1;
    	let td9;
    	let mentriesservertable;
    	let t17;
    	let current;
    	let mounted;
    	let dispose;

    	function input0_change_handler() {
    		/*input0_change_handler*/ ctx[9].call(input0, /*each_value*/ ctx[19], /*product_index*/ ctx[20]);
    	}

    	function input1_change_handler() {
    		/*input1_change_handler*/ ctx[10].call(input1, /*each_value*/ ctx[19], /*product_index*/ ctx[20]);
    	}

    	function input2_change_handler() {
    		/*input2_change_handler*/ ctx[11].call(input2, /*each_value*/ ctx[19], /*product_index*/ ctx[20]);
    	}

    	function textarea_input_handler_1() {
    		/*textarea_input_handler_1*/ ctx[12].call(textarea, /*each_value*/ ctx[19], /*product_index*/ ctx[20]);
    	}

    	mentriesservertable = new MentriesServerTable({
    			props: {
    				product: /*product*/ ctx[18],
    				ALL_SIZES: /*ALL_SIZES*/ ctx[2],
    				ALL_COLORS: /*ALL_COLORS*/ ctx[3],
    				ALL_VERIENTS: /*ALL_VERIENTS*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			pre = element("pre");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			t5 = text(t5_value);
    			t6 = space();
    			td3 = element("td");
    			input0 = element("input");
    			t7 = space();
    			td4 = element("td");
    			input1 = element("input");
    			t8 = space();
    			td5 = element("td");
    			input2 = element("input");
    			t9 = space();
    			td6 = element("td");
    			textarea = element("textarea");
    			t10 = space();
    			td7 = element("td");
    			t11 = text(t11_value);
    			t12 = space();
    			td8 = element("td");
    			button0 = element("button");
    			button0.textContent = "מחק";
    			t14 = space();
    			button1 = element("button");
    			button1.textContent = "הוסף צבע/מידה/מודל";
    			t16 = space();
    			tr1 = element("tr");
    			td9 = element("td");
    			create_component(mentriesservertable.$$.fragment);
    			t17 = space();
    			add_location(pre, file, 138, 24, 4503);
    			attr_dev(td0, "class", "svelte-p9zetx");
    			add_location(td0, file, 138, 20, 4499);
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*product*/ ctx[18].product.cimage))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "25");
    			attr_dev(img, "height", "25");
    			attr_dev(img, "loading", "lazy");
    			add_location(img, file, 140, 24, 4583);
    			attr_dev(td1, "class", "svelte-p9zetx");
    			add_location(td1, file, 139, 20, 4553);
    			attr_dev(td2, "class", "svelte-p9zetx");
    			add_location(td2, file, 144, 20, 4793);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 145, 24, 4843);
    			attr_dev(td3, "class", "svelte-p9zetx");
    			add_location(td3, file, 145, 20, 4839);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file, 146, 24, 4931);
    			attr_dev(td4, "class", "svelte-p9zetx");
    			add_location(td4, file, 146, 20, 4927);
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file, 147, 24, 5016);
    			attr_dev(td5, "class", "svelte-p9zetx");
    			add_location(td5, file, 147, 20, 5012);
    			add_location(textarea, file, 148, 24, 5100);
    			attr_dev(td6, "class", "svelte-p9zetx");
    			add_location(td6, file, 148, 20, 5096);
    			attr_dev(td7, "class", "svelte-p9zetx");
    			add_location(td7, file, 149, 20, 5167);
    			add_location(button0, file, 151, 24, 5252);
    			add_location(button1, file, 152, 24, 5298);
    			attr_dev(td8, "class", "svelte-p9zetx");
    			add_location(td8, file, 150, 20, 5222);
    			add_location(tr0, file, 137, 16, 4473);
    			attr_dev(td9, "colspan", "10");
    			attr_dev(td9, "class", "svelte-p9zetx");
    			add_location(td9, file, 156, 20, 5443);
    			attr_dev(tr1, "class", "details svelte-p9zetx");
    			add_location(tr1, file, 155, 16, 5401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(td0, pre);
    			append_dev(pre, t0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, img);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(tr0, t4);
    			append_dev(tr0, td2);
    			append_dev(td2, t5);
    			append_dev(tr0, t6);
    			append_dev(tr0, td3);
    			append_dev(td3, input0);
    			set_input_value(input0, /*product*/ ctx[18].embroidery);
    			append_dev(tr0, t7);
    			append_dev(tr0, td4);
    			append_dev(td4, input1);
    			set_input_value(input1, /*product*/ ctx[18].prining);
    			append_dev(tr0, t8);
    			append_dev(tr0, td5);
    			append_dev(td5, input2);
    			set_input_value(input2, /*product*/ ctx[18].ergent);
    			append_dev(tr0, t9);
    			append_dev(tr0, td6);
    			append_dev(td6, textarea);
    			set_input_value(textarea, /*product*/ ctx[18].comment);
    			append_dev(tr0, t10);
    			append_dev(tr0, td7);
    			append_dev(td7, t11);
    			append_dev(tr0, t12);
    			append_dev(tr0, td8);
    			append_dev(td8, button0);
    			append_dev(td8, t14);
    			append_dev(td8, button1);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td9);
    			mount_component(mentriesservertable, td9, null);
    			append_dev(tr1, t17);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", input0_change_handler),
    					listen_dev(input1, "change", input1_change_handler),
    					listen_dev(input2, "change", input2_change_handler),
    					listen_dev(textarea, "input", textarea_input_handler_1)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*productsData*/ 2) && t0_value !== (t0_value = /*product*/ ctx[18].id + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*productsData*/ 2 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*product*/ ctx[18].product.cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*productsData*/ 2) && t3_value !== (t3_value = /*product*/ ctx[18].product.title + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*productsData*/ 2) && t5_value !== (t5_value = /*product*/ ctx[18].price + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*productsData*/ 2) {
    				set_input_value(input0, /*product*/ ctx[18].embroidery);
    			}

    			if (dirty & /*productsData*/ 2) {
    				set_input_value(input1, /*product*/ ctx[18].prining);
    			}

    			if (dirty & /*productsData*/ 2) {
    				set_input_value(input2, /*product*/ ctx[18].ergent);
    			}

    			if (dirty & /*productsData*/ 2) {
    				set_input_value(textarea, /*product*/ ctx[18].comment);
    			}

    			if ((!current || dirty & /*productsData*/ 2) && t11_value !== (t11_value = (/*product*/ ctx[18].pbarcode || '') + "")) set_data_dev(t11, t11_value);
    			const mentriesservertable_changes = {};
    			if (dirty & /*productsData*/ 2) mentriesservertable_changes.product = /*product*/ ctx[18];
    			if (dirty & /*ALL_SIZES*/ 4) mentriesservertable_changes.ALL_SIZES = /*ALL_SIZES*/ ctx[2];
    			if (dirty & /*ALL_COLORS*/ 8) mentriesservertable_changes.ALL_COLORS = /*ALL_COLORS*/ ctx[3];
    			if (dirty & /*ALL_VERIENTS*/ 16) mentriesservertable_changes.ALL_VERIENTS = /*ALL_VERIENTS*/ ctx[4];
    			mentriesservertable.$set(mentriesservertable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mentriesservertable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mentriesservertable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(tr1);
    			destroy_component(mentriesservertable);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(136:16) {#each productsData as product}",
    		ctx
    	});

    	return block;
    }

    // (172:8) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("עדכן עכשיו");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(172:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (170:8) {#if updateing_to_server}
    function create_if_block(ctx) {
    	let loading;
    	let current;

    	loading = new Loading$1({
    			props: { withOverlay: false },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(170:8) {#if updateing_to_server}",
    		ctx
    	});

    	return block;
    }

    // (169:4) <Button class="update-btn" disabled={updateing_to_server} on:click={()=>{save_data()}}>
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*updateing_to_server*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(169:4) <Button class=\\\"update-btn\\\" disabled={updateing_to_server} on:click={()=>{save_data()}}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let button;
    	let current;
    	let if_block0 = /*headerData*/ ctx[0] && create_if_block_2(ctx);
    	let if_block1 = /*productsData*/ ctx[1] && create_if_block_1(ctx);

    	button = new Button$1({
    			props: {
    				class: "update-btn",
    				disabled: /*updateing_to_server*/ ctx[5],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(button.$$.fragment);
    			attr_dev(main, "class", "svelte-p9zetx");
    			add_location(main, file, 75, 0, 2512);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t1);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*headerData*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(main, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*productsData*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*productsData*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const button_changes = {};
    			if (dirty & /*updateing_to_server*/ 32) button_changes.disabled = /*updateing_to_server*/ ctx[5];

    			if (dirty & /*$$scope, updateing_to_server*/ 2097184) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MorderEdit2', slots, []);
    	let { id } = $$props;
    	let updateing = false;

    	//let ALL_PROVIDERS;
    	let headerData = undefined;

    	let serverData = undefined;
    	let data = undefined;
    	let productsData;

    	async function load_order_from_server() {
    		updateing = true;
    		let resp = await apiGetMOrder(id);
    		console.log('resp:', resp);
    		data = serverData = JSON.parse(JSON.stringify(resp));

    		$$invalidate(0, headerData = [
    			{
    				'created': data.created,
    				'updated': data.updated,
    				'id': data.id,
    				'name': data.name,
    				'email': data.email,
    				'message': data.message,
    				'phone': data.phone,
    				'status': data.status,
    				'client_id': data.client,
    				'client_name': data.client_businessName,
    				'agent': data.agent_name
    			}
    		]);

    		$$invalidate(1, productsData = data.products);

    		//groupedProducts = group the productsData by product field (ID: int)
    		updateing = false;
    	}

    	let ALL_SIZES;
    	let ALL_COLORS;
    	let ALL_VERIENTS;
    	let updateing_to_server = false;

    	onMount(async () => {
    		$$invalidate(2, ALL_SIZES = await apiGetAllSizes());
    		$$invalidate(3, ALL_COLORS = await apiGetAllColors());
    		$$invalidate(4, ALL_VERIENTS = await apiGetAllVariants());
    		await load_order_from_server();
    	}); //ALL_PROVIDERS = await apiGetProviders();

    	async function save_data() {
    		// move headerData to data
    		data.created = headerData[0].created;

    		data.updated = headerData[0].updated;
    		data.id = headerData[0].id;
    		data.name = headerData[0].name;
    		data.email = headerData[0].email;
    		data.message = headerData[0].message;
    		data.phone = headerData[0].phone;
    		data.status = headerData[0].status;
    		data.client = headerData[0].client_id;
    		data.client_businessName = headerData[0].client_name;
    		console.log('save data: ', data);
    		$$invalidate(5, updateing_to_server = true);
    		await apiSaveMOrder(data.id, data);
    		$$invalidate(5, updateing_to_server = false);
    		alert('saved');
    	}

    	const writable_props = ['id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<MorderEdit2> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		headerData[0].message = this.value;
    		$$invalidate(0, headerData);
    	}

    	function input0_change_handler(each_value, product_index) {
    		each_value[product_index].embroidery = this.value;
    		$$invalidate(1, productsData);
    	}

    	function input1_change_handler(each_value, product_index) {
    		each_value[product_index].prining = this.value;
    		$$invalidate(1, productsData);
    	}

    	function input2_change_handler(each_value, product_index) {
    		each_value[product_index].ergent = this.value;
    		$$invalidate(1, productsData);
    	}

    	function textarea_input_handler_1(each_value, product_index) {
    		each_value[product_index].comment = this.value;
    		$$invalidate(1, productsData);
    	}

    	const click_handler = () => {
    		save_data();
    	};

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(7, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		Loading: Loading$1,
    		onMount,
    		apiGetAllColors,
    		apiGetAllSizes,
    		apiGetAllVariants,
    		apiGetMOrder,
    		apiSaveMOrder,
    		CLOUDINARY_BASE_URL,
    		MentriesServerTable,
    		id,
    		updateing,
    		headerData,
    		serverData,
    		data,
    		productsData,
    		load_order_from_server,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		updateing_to_server,
    		save_data
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(7, id = $$props.id);
    		if ('updateing' in $$props) updateing = $$props.updateing;
    		if ('headerData' in $$props) $$invalidate(0, headerData = $$props.headerData);
    		if ('serverData' in $$props) serverData = $$props.serverData;
    		if ('data' in $$props) data = $$props.data;
    		if ('productsData' in $$props) $$invalidate(1, productsData = $$props.productsData);
    		if ('ALL_SIZES' in $$props) $$invalidate(2, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(3, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(4, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('updateing_to_server' in $$props) $$invalidate(5, updateing_to_server = $$props.updateing_to_server);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		headerData,
    		productsData,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		updateing_to_server,
    		save_data,
    		id,
    		textarea_input_handler,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		textarea_input_handler_1,
    		click_handler
    	];
    }

    class MorderEdit2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MorderEdit2",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[7] === undefined && !('id' in props)) {
    			console_1.warn("<MorderEdit2> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<MorderEdit2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MorderEdit2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const morderEdit2 = new MorderEdit2({
        target: document.getElementById("morderedit2-target"),
        props: JSON.parse(document.getElementById("morderedit2-props").textContent),
                                            //     documentstockenter-props documentstockerenter-props
    }); // documentstockenter-target  documentstockerenter-target

    return morderEdit2;

})();
//# sourceMappingURL=MorderEdit2.js.map
