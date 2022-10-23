
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35736/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var editdocsignature = (function () {
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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

    var pathArray = (document.currentScript && document.currentScript.src || new URL('EditDocSignature.js', document.baseURI).href).split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;
    const BASE_URL =  url; //'https://catalog.boost-pop.com'; //'http://127.0.0.1:8000'; // 
    const GET_ALL_SIZES_API = BASE_URL + '/client-api/get-all-sizes/';
    const GET_ALL_COLORS_API = BASE_URL + '/client-api/get-all-colors/';
    const GET_ALL_VARIENTS_API = BASE_URL + '/client-api/get-all-variants/';
    const API_EDIT_DOC_SIGNATURE = BASE_URL + '/api-edit-doc-signature';

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

    function supressWarnings() {
      const origWarn = console.warn;

      console.warn = (message) => {
        if (message.includes('unknown prop')) return
        if (message.includes('unexpected slot')) return
        origWarn(message);
      };

      onMount(() => {
        console.warn = origWarn;
      });
    }

    /* node_modules\svelte-markdown\src\Parser.svelte generated by Svelte v3.44.3 */

    function get_each_context_5$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (19:2) {#if renderers[type]}
    function create_if_block_1$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$3, create_if_block_3$2, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[0] === 'table') return 0;
    		if (/*type*/ ctx[0] === 'list') return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
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
    			current_block_type_index = select_block_type_1(ctx);

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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(19:2) {#if renderers[type]}",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if !type}
    function create_if_block$5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*tokens*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tokens, renderers*/ 34) {
    				each_value = /*tokens*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(14:0) {#if !type}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {:else}
    function create_else_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*$$restProps*/ ctx[6]];
    	var switch_value = /*renderers*/ ctx[5][/*type*/ ctx[0]];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot_11] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$$restProps*/ 64)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*$$restProps*/ ctx[6])])
    			: {};

    			if (dirty & /*$$scope, tokens, renderers, $$restProps*/ 8388706) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5][/*type*/ ctx[0]])) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(69:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:30) 
    function create_if_block_3$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4$2, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*ordered*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
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
    			current_block_type_index = select_block_type_2(ctx);

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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(51:30) ",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if type === 'table'}
    function create_if_block_2$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*renderers*/ ctx[5].table;

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty & /*$$scope, renderers, rows, $$restProps, header*/ 8388716) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].table)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(20:4) {#if type === 'table'}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {:else}
    function create_else_block_2(ctx) {
    	let t_value = /*$$restProps*/ ctx[6].raw + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$$restProps*/ 64 && t_value !== (t_value = /*$$restProps*/ ctx[6].raw + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(73:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if tokens}
    function create_if_block_5$2(ctx) {
    	let parser;
    	let current;

    	parser = new Parser({
    			props: {
    				tokens: /*tokens*/ ctx[1],
    				renderers: /*renderers*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parser_changes = {};
    			if (dirty & /*tokens*/ 2) parser_changes.tokens = /*tokens*/ ctx[1];
    			if (dirty & /*renderers*/ 32) parser_changes.renderers = /*renderers*/ ctx[5];
    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(71:8) {#if tokens}",
    		ctx
    	});

    	return block;
    }

    // (70:6) <svelte:component this={renderers[type]} {...$$restProps}>
    function create_default_slot_11(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5$2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*tokens*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_3(ctx);
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
    			current_block_type_index = select_block_type_3(ctx);

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
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(70:6) <svelte:component this={renderers[type]} {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    // (60:6) {:else}
    function create_else_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ ordered: /*ordered*/ ctx[4] }, /*$$restProps*/ ctx[6]];
    	var switch_value = /*renderers*/ ctx[5].list;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot_9] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*ordered, $$restProps*/ 80)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*ordered*/ 16 && { ordered: /*ordered*/ ctx[4] },
    					dirty & /*$$restProps*/ 64 && get_spread_object(/*$$restProps*/ ctx[6])
    				])
    			: {};

    			if (dirty & /*$$scope, $$restProps, renderers*/ 8388704) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].list)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(60:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:6) {#if ordered}
    function create_if_block_4$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ ordered: /*ordered*/ ctx[4] }, /*$$restProps*/ ctx[6]];
    	var switch_value = /*renderers*/ ctx[5].list;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot_7] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*ordered, $$restProps*/ 80)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*ordered*/ 16 && { ordered: /*ordered*/ ctx[4] },
    					dirty & /*$$restProps*/ 64 && get_spread_object(/*$$restProps*/ ctx[6])
    				])
    			: {};

    			if (dirty & /*$$scope, $$restProps, renderers*/ 8388704) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].list)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(52:6) {#if ordered}",
    		ctx
    	});

    	return block;
    }

    // (63:12) <svelte:component this={renderers.unorderedlistitem || renderers.listitem} {...item}>
    function create_default_slot_10(ctx) {
    	let parser;
    	let t;
    	let current;

    	parser = new Parser({
    			props: {
    				tokens: /*item*/ ctx[18].tokens,
    				renderers: /*renderers*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parser_changes = {};
    			if (dirty & /*$$restProps*/ 64) parser_changes.tokens = /*item*/ ctx[18].tokens;
    			if (dirty & /*renderers*/ 32) parser_changes.renderers = /*renderers*/ ctx[5];
    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(63:12) <svelte:component this={renderers.unorderedlistitem || renderers.listitem} {...item}>",
    		ctx
    	});

    	return block;
    }

    // (62:10) {#each $$restProps.items as item}
    function create_each_block_5$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*item*/ ctx[18]];
    	var switch_value = /*renderers*/ ctx[5].unorderedlistitem || /*renderers*/ ctx[5].listitem;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot_10] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$$restProps*/ 64)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*item*/ ctx[18])])
    			: {};

    			if (dirty & /*$$scope, $$restProps, renderers*/ 8388704) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].unorderedlistitem || /*renderers*/ ctx[5].listitem)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5$1.name,
    		type: "each",
    		source: "(62:10) {#each $$restProps.items as item}",
    		ctx
    	});

    	return block;
    }

    // (61:8) <svelte:component this={renderers.list} {ordered} {...$$restProps}>
    function create_default_slot_9(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_5 = /*$$restProps*/ ctx[6].items;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5$1(get_each_context_5$1(ctx, each_value_5, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderers, $$restProps*/ 96) {
    				each_value_5 = /*$$restProps*/ ctx[6].items;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5$1(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_5$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_5.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_5.length; i += 1) {
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(61:8) <svelte:component this={renderers.list} {ordered} {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    // (55:12) <svelte:component this={renderers.orderedlistitem || renderers.listitem} {...item}>
    function create_default_slot_8(ctx) {
    	let parser;
    	let t;
    	let current;

    	parser = new Parser({
    			props: {
    				tokens: /*item*/ ctx[18].tokens,
    				renderers: /*renderers*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parser_changes = {};
    			if (dirty & /*$$restProps*/ 64) parser_changes.tokens = /*item*/ ctx[18].tokens;
    			if (dirty & /*renderers*/ 32) parser_changes.renderers = /*renderers*/ ctx[5];
    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(55:12) <svelte:component this={renderers.orderedlistitem || renderers.listitem} {...item}>",
    		ctx
    	});

    	return block;
    }

    // (54:10) {#each $$restProps.items as item}
    function create_each_block_4$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*item*/ ctx[18]];
    	var switch_value = /*renderers*/ ctx[5].orderedlistitem || /*renderers*/ ctx[5].listitem;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot_8] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$$restProps*/ 64)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*item*/ ctx[18])])
    			: {};

    			if (dirty & /*$$scope, $$restProps, renderers*/ 8388704) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].orderedlistitem || /*renderers*/ ctx[5].listitem)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(54:10) {#each $$restProps.items as item}",
    		ctx
    	});

    	return block;
    }

    // (53:8) <svelte:component this={renderers.list} {ordered} {...$$restProps}>
    function create_default_slot_7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_4 = /*$$restProps*/ ctx[6].items;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderers, $$restProps*/ 96) {
    				each_value_4 = /*$$restProps*/ ctx[6].items;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_4$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_4.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_4.length; i += 1) {
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(53:8) <svelte:component this={renderers.list} {ordered} {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    // (25:14) <svelte:component                 this={renderers.tablecell}                 header={true}                 align={$$restProps.align[i] || 'center'}                 >
    function create_default_slot_6(ctx) {
    	let parser;
    	let t;
    	let current;

    	parser = new Parser({
    			props: {
    				tokens: /*headerItem*/ ctx[16].tokens,
    				renderers: /*renderers*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parser_changes = {};
    			if (dirty & /*header*/ 4) parser_changes.tokens = /*headerItem*/ ctx[16].tokens;
    			if (dirty & /*renderers*/ 32) parser_changes.renderers = /*renderers*/ ctx[5];
    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(25:14) <svelte:component                 this={renderers.tablecell}                 header={true}                 align={$$restProps.align[i] || 'center'}                 >",
    		ctx
    	});

    	return block;
    }

    // (24:12) {#each header as headerItem, i}
    function create_each_block_3$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*renderers*/ ctx[5].tablecell;

    	function switch_props(ctx) {
    		return {
    			props: {
    				header: true,
    				align: /*$$restProps*/ ctx[6].align[/*i*/ ctx[15]] || 'center',
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*$$restProps*/ 64) switch_instance_changes.align = /*$$restProps*/ ctx[6].align[/*i*/ ctx[15]] || 'center';

    			if (dirty & /*$$scope, header, renderers*/ 8388644) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].tablecell)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(24:12) {#each header as headerItem, i}",
    		ctx
    	});

    	return block;
    }

    // (23:10) <svelte:component this={renderers.tablerow}>
    function create_default_slot_5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_3 = /*header*/ ctx[2];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderers, $$restProps, header*/ 100) {
    				each_value_3 = /*header*/ ctx[2];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(23:10) <svelte:component this={renderers.tablerow}>",
    		ctx
    	});

    	return block;
    }

    // (22:8) <svelte:component this={renderers.tablehead}>
    function create_default_slot_4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*renderers*/ ctx[5].tablerow;

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty & /*$$scope, header, renderers, $$restProps*/ 8388708) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].tablerow)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(22:8) <svelte:component this={renderers.tablehead}>",
    		ctx
    	});

    	return block;
    }

    // (39:16) <svelte:component                   this={renderers.tablecell}                   header={false}                   align={$$restProps.align[i] || 'center'}                   >
    function create_default_slot_3(ctx) {
    	let parser;
    	let current;

    	parser = new Parser({
    			props: {
    				tokens: /*cells*/ ctx[13].tokens,
    				renderers: /*renderers*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parser_changes = {};
    			if (dirty & /*rows*/ 8) parser_changes.tokens = /*cells*/ ctx[13].tokens;
    			if (dirty & /*renderers*/ 32) parser_changes.renderers = /*renderers*/ ctx[5];
    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(39:16) <svelte:component                   this={renderers.tablecell}                   header={false}                   align={$$restProps.align[i] || 'center'}                   >",
    		ctx
    	});

    	return block;
    }

    // (38:14) {#each row as cells, i}
    function create_each_block_2$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*renderers*/ ctx[5].tablecell;

    	function switch_props(ctx) {
    		return {
    			props: {
    				header: false,
    				align: /*$$restProps*/ ctx[6].align[/*i*/ ctx[15]] || 'center',
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*$$restProps*/ 64) switch_instance_changes.align = /*$$restProps*/ ctx[6].align[/*i*/ ctx[15]] || 'center';

    			if (dirty & /*$$scope, rows, renderers*/ 8388648) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].tablecell)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(38:14) {#each row as cells, i}",
    		ctx
    	});

    	return block;
    }

    // (37:12) <svelte:component this={renderers.tablerow}>
    function create_default_slot_2(ctx) {
    	let t;
    	let current;
    	let each_value_2 = /*row*/ ctx[10];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderers, $$restProps, rows*/ 104) {
    				each_value_2 = /*row*/ ctx[10];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(37:12) <svelte:component this={renderers.tablerow}>",
    		ctx
    	});

    	return block;
    }

    // (36:10) {#each rows as row}
    function create_each_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*renderers*/ ctx[5].tablerow;

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty & /*$$scope, rows, renderers, $$restProps*/ 8388712) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].tablerow)) {
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
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(36:10) {#each rows as row}",
    		ctx
    	});

    	return block;
    }

    // (35:8) <svelte:component this={renderers.tablebody}>
    function create_default_slot_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*rows*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderers, rows, $$restProps*/ 104) {
    				each_value_1 = /*rows*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(35:8) <svelte:component this={renderers.tablebody}>",
    		ctx
    	});

    	return block;
    }

    // (21:6) <svelte:component this={renderers.table}>
    function create_default_slot(ctx) {
    	let switch_instance0;
    	let t;
    	let switch_instance1;
    	let switch_instance1_anchor;
    	let current;
    	var switch_value = /*renderers*/ ctx[5].tablehead;

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance0 = new switch_value(switch_props(ctx));
    	}

    	var switch_value_1 = /*renderers*/ ctx[5].tablebody;

    	function switch_props_1(ctx) {
    		return {
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value_1) {
    		switch_instance1 = new switch_value_1(switch_props_1(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance0) create_component(switch_instance0.$$.fragment);
    			t = space();
    			if (switch_instance1) create_component(switch_instance1.$$.fragment);
    			switch_instance1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance0) {
    				mount_component(switch_instance0, target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (switch_instance1) {
    				mount_component(switch_instance1, target, anchor);
    			}

    			insert_dev(target, switch_instance1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance0_changes = {};

    			if (dirty & /*$$scope, renderers, header, $$restProps*/ 8388708) {
    				switch_instance0_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderers*/ ctx[5].tablehead)) {
    				if (switch_instance0) {
    					group_outros();
    					const old_component = switch_instance0;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance0 = new switch_value(switch_props(ctx));
    					create_component(switch_instance0.$$.fragment);
    					transition_in(switch_instance0.$$.fragment, 1);
    					mount_component(switch_instance0, t.parentNode, t);
    				} else {
    					switch_instance0 = null;
    				}
    			} else if (switch_value) {
    				switch_instance0.$set(switch_instance0_changes);
    			}

    			const switch_instance1_changes = {};

    			if (dirty & /*$$scope, rows, renderers, $$restProps*/ 8388712) {
    				switch_instance1_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value_1 !== (switch_value_1 = /*renderers*/ ctx[5].tablebody)) {
    				if (switch_instance1) {
    					group_outros();
    					const old_component = switch_instance1;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value_1) {
    					switch_instance1 = new switch_value_1(switch_props_1(ctx));
    					create_component(switch_instance1.$$.fragment);
    					transition_in(switch_instance1.$$.fragment, 1);
    					mount_component(switch_instance1, switch_instance1_anchor.parentNode, switch_instance1_anchor);
    				} else {
    					switch_instance1 = null;
    				}
    			} else if (switch_value_1) {
    				switch_instance1.$set(switch_instance1_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance0) transition_in(switch_instance0.$$.fragment, local);
    			if (switch_instance1) transition_in(switch_instance1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance0) transition_out(switch_instance0.$$.fragment, local);
    			if (switch_instance1) transition_out(switch_instance1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (switch_instance0) destroy_component(switch_instance0, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance1_anchor);
    			if (switch_instance1) destroy_component(switch_instance1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:6) <svelte:component this={renderers.table}>",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#each tokens as token}
    function create_each_block$1(ctx) {
    	let parser;
    	let current;
    	const parser_spread_levels = [/*token*/ ctx[7], { renderers: /*renderers*/ ctx[5] }];
    	let parser_props = {};

    	for (let i = 0; i < parser_spread_levels.length; i += 1) {
    		parser_props = assign(parser_props, parser_spread_levels[i]);
    	}

    	parser = new Parser({ props: parser_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parser_changes = (dirty & /*tokens, renderers*/ 34)
    			? get_spread_update(parser_spread_levels, [
    					dirty & /*tokens*/ 2 && get_spread_object(/*token*/ ctx[7]),
    					dirty & /*renderers*/ 32 && { renderers: /*renderers*/ ctx[5] }
    				])
    			: {};

    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:2) {#each tokens as token}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_if_block_1$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*type*/ ctx[0]) return 0;
    		if (/*renderers*/ ctx[5][/*type*/ ctx[0]]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	const omit_props_names = ["type","tokens","header","rows","ordered","renderers"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Parser', slots, []);
    	let { type = undefined } = $$props;
    	let { tokens = undefined } = $$props;
    	let { header = undefined } = $$props;
    	let { rows = undefined } = $$props;
    	let { ordered = false } = $$props;
    	let { renderers } = $$props;
    	supressWarnings();

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('type' in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ('tokens' in $$new_props) $$invalidate(1, tokens = $$new_props.tokens);
    		if ('header' in $$new_props) $$invalidate(2, header = $$new_props.header);
    		if ('rows' in $$new_props) $$invalidate(3, rows = $$new_props.rows);
    		if ('ordered' in $$new_props) $$invalidate(4, ordered = $$new_props.ordered);
    		if ('renderers' in $$new_props) $$invalidate(5, renderers = $$new_props.renderers);
    	};

    	$$self.$capture_state = () => ({
    		supressWarnings,
    		type,
    		tokens,
    		header,
    		rows,
    		ordered,
    		renderers
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('type' in $$props) $$invalidate(0, type = $$new_props.type);
    		if ('tokens' in $$props) $$invalidate(1, tokens = $$new_props.tokens);
    		if ('header' in $$props) $$invalidate(2, header = $$new_props.header);
    		if ('rows' in $$props) $$invalidate(3, rows = $$new_props.rows);
    		if ('ordered' in $$props) $$invalidate(4, ordered = $$new_props.ordered);
    		if ('renderers' in $$props) $$invalidate(5, renderers = $$new_props.renderers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, tokens, header, rows, ordered, renderers, $$restProps];
    }

    class Parser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			type: 0,
    			tokens: 1,
    			header: 2,
    			rows: 3,
    			ordered: 4,
    			renderers: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parser",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*renderers*/ ctx[5] === undefined && !('renderers' in props)) {
    			console.warn("<Parser> was created without expected prop 'renderers'");
    		}
    	}

    	get type() {
    		throw new Error("<Parser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Parser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tokens() {
    		throw new Error("<Parser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tokens(value) {
    		throw new Error("<Parser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Parser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Parser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<Parser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<Parser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ordered() {
    		throw new Error("<Parser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordered(value) {
    		throw new Error("<Parser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderers() {
    		throw new Error("<Parser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderers(value) {
    		throw new Error("<Parser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var marked_umd = createCommonjsModule(function (module, exports) {
    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2022, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    (function (global, factory) {
      factory(exports) ;
    })(commonjsGlobal, (function (exports) {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
          writable: false
        });
        return Constructor;
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;

        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

        return arr2;
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
        if (it) return (it = it.call(o)).next.bind(it);

        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
          if (it) o = it;
          var i = 0;
          return function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          };
        }

        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }

      function getDefaults() {
        return {
          async: false,
          baseUrl: null,
          breaks: false,
          extensions: null,
          gfm: true,
          headerIds: true,
          headerPrefix: '',
          highlight: null,
          langPrefix: 'language-',
          mangle: true,
          pedantic: false,
          renderer: null,
          sanitize: false,
          sanitizer: null,
          silent: false,
          smartypants: false,
          tokenizer: null,
          walkTokens: null,
          xhtml: false
        };
      }
      exports.defaults = getDefaults();
      function changeDefaults(newDefaults) {
        exports.defaults = newDefaults;
      }

      /**
       * Helpers
       */
      var escapeTest = /[&<>"']/;
      var escapeReplace = /[&<>"']/g;
      var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
      var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
      var escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      var getEscapeReplacement = function getEscapeReplacement(ch) {
        return escapeReplacements[ch];
      };

      function escape(html, encode) {
        if (encode) {
          if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
          }
        } else {
          if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
        }

        return html;
      }
      var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
      /**
       * @param {string} html
       */

      function unescape(html) {
        // explicitly match decimal, hex, and named HTML entities
        return html.replace(unescapeTest, function (_, n) {
          n = n.toLowerCase();
          if (n === 'colon') return ':';

          if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
          }

          return '';
        });
      }
      var caret = /(^|[^\[])\^/g;
      /**
       * @param {string | RegExp} regex
       * @param {string} opt
       */

      function edit(regex, opt) {
        regex = typeof regex === 'string' ? regex : regex.source;
        opt = opt || '';
        var obj = {
          replace: function replace(name, val) {
            val = val.source || val;
            val = val.replace(caret, '$1');
            regex = regex.replace(name, val);
            return obj;
          },
          getRegex: function getRegex() {
            return new RegExp(regex, opt);
          }
        };
        return obj;
      }
      var nonWordAndColonTest = /[^\w:]/g;
      var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
      /**
       * @param {boolean} sanitize
       * @param {string} base
       * @param {string} href
       */

      function cleanUrl(sanitize, base, href) {
        if (sanitize) {
          var prot;

          try {
            prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
          } catch (e) {
            return null;
          }

          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
          }
        }

        if (base && !originIndependentUrl.test(href)) {
          href = resolveUrl(base, href);
        }

        try {
          href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
          return null;
        }

        return href;
      }
      var baseUrls = {};
      var justDomain = /^[^:]+:\/*[^/]*$/;
      var protocol = /^([^:]+:)[\s\S]*$/;
      var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;
      /**
       * @param {string} base
       * @param {string} href
       */

      function resolveUrl(base, href) {
        if (!baseUrls[' ' + base]) {
          // we can ignore everything in base after the last slash of its path component,
          // but we might need to add _that_
          // https://tools.ietf.org/html/rfc3986#section-3
          if (justDomain.test(base)) {
            baseUrls[' ' + base] = base + '/';
          } else {
            baseUrls[' ' + base] = rtrim(base, '/', true);
          }
        }

        base = baseUrls[' ' + base];
        var relativeBase = base.indexOf(':') === -1;

        if (href.substring(0, 2) === '//') {
          if (relativeBase) {
            return href;
          }

          return base.replace(protocol, '$1') + href;
        } else if (href.charAt(0) === '/') {
          if (relativeBase) {
            return href;
          }

          return base.replace(domain, '$1') + href;
        } else {
          return base + href;
        }
      }
      var noopTest = {
        exec: function noopTest() {}
      };
      function merge(obj) {
        var i = 1,
            target,
            key;

        for (; i < arguments.length; i++) {
          target = arguments[i];

          for (key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
              obj[key] = target[key];
            }
          }
        }

        return obj;
      }
      function splitCells(tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
          var escaped = false,
              curr = offset;

          while (--curr >= 0 && str[curr] === '\\') {
            escaped = !escaped;
          }

          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
            cells = row.split(/ \|/);
        var i = 0; // First/last cell in a row cannot be empty if it has no leading/trailing pipe

        if (!cells[0].trim()) {
          cells.shift();
        }

        if (cells.length > 0 && !cells[cells.length - 1].trim()) {
          cells.pop();
        }

        if (cells.length > count) {
          cells.splice(count);
        } else {
          while (cells.length < count) {
            cells.push('');
          }
        }

        for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
      }
      /**
       * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
       * /c*$/ is vulnerable to REDOS.
       *
       * @param {string} str
       * @param {string} c
       * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
       */

      function rtrim(str, c, invert) {
        var l = str.length;

        if (l === 0) {
          return '';
        } // Length of suffix matching the invert condition.


        var suffLen = 0; // Step left until we fail to match the invert condition.

        while (suffLen < l) {
          var currChar = str.charAt(l - suffLen - 1);

          if (currChar === c && !invert) {
            suffLen++;
          } else if (currChar !== c && invert) {
            suffLen++;
          } else {
            break;
          }
        }

        return str.slice(0, l - suffLen);
      }
      function findClosingBracket(str, b) {
        if (str.indexOf(b[1]) === -1) {
          return -1;
        }

        var l = str.length;
        var level = 0,
            i = 0;

        for (; i < l; i++) {
          if (str[i] === '\\') {
            i++;
          } else if (str[i] === b[0]) {
            level++;
          } else if (str[i] === b[1]) {
            level--;

            if (level < 0) {
              return i;
            }
          }
        }

        return -1;
      }
      function checkSanitizeDeprecation(opt) {
        if (opt && opt.sanitize && !opt.silent) {
          console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
        }
      } // copied from https://stackoverflow.com/a/5450113/806777

      /**
       * @param {string} pattern
       * @param {number} count
       */

      function repeatString(pattern, count) {
        if (count < 1) {
          return '';
        }

        var result = '';

        while (count > 1) {
          if (count & 1) {
            result += pattern;
          }

          count >>= 1;
          pattern += pattern;
        }

        return result + pattern;
      }

      function outputLink(cap, link, raw, lexer) {
        var href = link.href;
        var title = link.title ? escape(link.title) : null;
        var text = cap[1].replace(/\\([\[\]])/g, '$1');

        if (cap[0].charAt(0) !== '!') {
          lexer.state.inLink = true;
          var token = {
            type: 'link',
            raw: raw,
            href: href,
            title: title,
            text: text,
            tokens: lexer.inlineTokens(text)
          };
          lexer.state.inLink = false;
          return token;
        }

        return {
          type: 'image',
          raw: raw,
          href: href,
          title: title,
          text: escape(text)
        };
      }

      function indentCodeCompensation(raw, text) {
        var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

        if (matchIndentToCode === null) {
          return text;
        }

        var indentToCode = matchIndentToCode[1];
        return text.split('\n').map(function (node) {
          var matchIndentInNode = node.match(/^\s+/);

          if (matchIndentInNode === null) {
            return node;
          }

          var indentInNode = matchIndentInNode[0];

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        }).join('\n');
      }
      /**
       * Tokenizer
       */


      var Tokenizer = /*#__PURE__*/function () {
        function Tokenizer(options) {
          this.options = options || exports.defaults;
        }

        var _proto = Tokenizer.prototype;

        _proto.space = function space(src) {
          var cap = this.rules.block.newline.exec(src);

          if (cap && cap[0].length > 0) {
            return {
              type: 'space',
              raw: cap[0]
            };
          }
        };

        _proto.code = function code(src) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ {1,4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic ? rtrim(text, '\n') : text
            };
          }
        };

        _proto.fences = function fences(src) {
          var cap = this.rules.block.fences.exec(src);

          if (cap) {
            var raw = cap[0];
            var text = indentCodeCompensation(raw, cap[3] || '');
            return {
              type: 'code',
              raw: raw,
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: text
            };
          }
        };

        _proto.heading = function heading(src) {
          var cap = this.rules.block.heading.exec(src);

          if (cap) {
            var text = cap[2].trim(); // remove trailing #s

            if (/#$/.test(text)) {
              var trimmed = rtrim(text, '#');

              if (this.options.pedantic) {
                text = trimmed.trim();
              } else if (!trimmed || / $/.test(trimmed)) {
                // CommonMark requires space before trailing #s
                text = trimmed.trim();
              }
            }

            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[1].length,
              text: text,
              tokens: this.lexer.inline(text)
            };
          }
        };

        _proto.hr = function hr(src) {
          var cap = this.rules.block.hr.exec(src);

          if (cap) {
            return {
              type: 'hr',
              raw: cap[0]
            };
          }
        };

        _proto.blockquote = function blockquote(src) {
          var cap = this.rules.block.blockquote.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ *>[ \t]?/gm, '');
            return {
              type: 'blockquote',
              raw: cap[0],
              tokens: this.lexer.blockTokens(text, []),
              text: text
            };
          }
        };

        _proto.list = function list(src) {
          var cap = this.rules.block.list.exec(src);

          if (cap) {
            var raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine, line, nextLine, rawLine, itemContents, endEarly;
            var bull = cap[1].trim();
            var isordered = bull.length > 1;
            var list = {
              type: 'list',
              raw: '',
              ordered: isordered,
              start: isordered ? +bull.slice(0, -1) : '',
              loose: false,
              items: []
            };
            bull = isordered ? "\\d{1,9}\\" + bull.slice(-1) : "\\" + bull;

            if (this.options.pedantic) {
              bull = isordered ? bull : '[*+-]';
            } // Get next list item


            var itemRegex = new RegExp("^( {0,3}" + bull + ")((?:[\t ][^\\n]*)?(?:\\n|$))"); // Check if current bullet point can start a new List Item

            while (src) {
              endEarly = false;

              if (!(cap = itemRegex.exec(src))) {
                break;
              }

              if (this.rules.block.hr.test(src)) {
                // End list if bullet was actually HR (possibly move into itemRegex?)
                break;
              }

              raw = cap[0];
              src = src.substring(raw.length);
              line = cap[2].split('\n', 1)[0];
              nextLine = src.split('\n', 1)[0];

              if (this.options.pedantic) {
                indent = 2;
                itemContents = line.trimLeft();
              } else {
                indent = cap[2].search(/[^ ]/); // Find first non-space char

                indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent

                itemContents = line.slice(indent);
                indent += cap[1].length;
              }

              blankLine = false;

              if (!line && /^ *$/.test(nextLine)) {
                // Items begin with at most one blank line
                raw += nextLine + '\n';
                src = src.substring(nextLine.length + 1);
                endEarly = true;
              }

              if (!endEarly) {
                var nextBulletRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))");
                var hrRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)");
                var fencesBeginRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}(?:```|~~~)");
                var headingBeginRegex = new RegExp("^ {0," + Math.min(3, indent - 1) + "}#"); // Check if following lines should be included in List Item

                while (src) {
                  rawLine = src.split('\n', 1)[0];
                  line = rawLine; // Re-align to follow commonmark nesting rules

                  if (this.options.pedantic) {
                    line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
                  } // End list item if found code fences


                  if (fencesBeginRegex.test(line)) {
                    break;
                  } // End list item if found start of new heading


                  if (headingBeginRegex.test(line)) {
                    break;
                  } // End list item if found start of new bullet


                  if (nextBulletRegex.test(line)) {
                    break;
                  } // Horizontal rule found


                  if (hrRegex.test(src)) {
                    break;
                  }

                  if (line.search(/[^ ]/) >= indent || !line.trim()) {
                    // Dedent if possible
                    itemContents += '\n' + line.slice(indent);
                  } else if (!blankLine) {
                    // Until blank line, item doesn't need indentation
                    itemContents += '\n' + line;
                  } else {
                    // Otherwise, improper indentation ends this item
                    break;
                  }

                  if (!blankLine && !line.trim()) {
                    // Check if current line is blank
                    blankLine = true;
                  }

                  raw += rawLine + '\n';
                  src = src.substring(rawLine.length + 1);
                }
              }

              if (!list.loose) {
                // If the previous item ended with a blank line, the list is loose
                if (endsWithBlankLine) {
                  list.loose = true;
                } else if (/\n *\n *$/.test(raw)) {
                  endsWithBlankLine = true;
                }
              } // Check for task list items


              if (this.options.gfm) {
                istask = /^\[[ xX]\] /.exec(itemContents);

                if (istask) {
                  ischecked = istask[0] !== '[ ] ';
                  itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
                }
              }

              list.items.push({
                type: 'list_item',
                raw: raw,
                task: !!istask,
                checked: ischecked,
                loose: false,
                text: itemContents
              });
              list.raw += raw;
            } // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic


            list.items[list.items.length - 1].raw = raw.trimRight();
            list.items[list.items.length - 1].text = itemContents.trimRight();
            list.raw = list.raw.trimRight();
            var l = list.items.length; // Item child tokens handled here at end because we needed to have the final item to trim it first

            for (i = 0; i < l; i++) {
              this.lexer.state.top = false;
              list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
              var spacers = list.items[i].tokens.filter(function (t) {
                return t.type === 'space';
              });
              var hasMultipleLineBreaks = spacers.every(function (t) {
                var chars = t.raw.split('');
                var lineBreaks = 0;

                for (var _iterator = _createForOfIteratorHelperLoose(chars), _step; !(_step = _iterator()).done;) {
                  var _char = _step.value;

                  if (_char === '\n') {
                    lineBreaks += 1;
                  }

                  if (lineBreaks > 1) {
                    return true;
                  }
                }

                return false;
              });

              if (!list.loose && spacers.length && hasMultipleLineBreaks) {
                // Having a single line break doesn't mean a list is loose. A single line break is terminating the last list item
                list.loose = true;
                list.items[i].loose = true;
              }
            }

            return list;
          }
        };

        _proto.html = function html(src) {
          var cap = this.rules.block.html.exec(src);

          if (cap) {
            var token = {
              type: 'html',
              raw: cap[0],
              pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: cap[0]
            };

            if (this.options.sanitize) {
              var text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
              token.type = 'paragraph';
              token.text = text;
              token.tokens = this.lexer.inline(text);
            }

            return token;
          }
        };

        _proto.def = function def(src) {
          var cap = this.rules.block.def.exec(src);

          if (cap) {
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            return {
              type: 'def',
              tag: tag,
              raw: cap[0],
              href: cap[2],
              title: cap[3]
            };
          }
        };

        _proto.table = function table(src) {
          var cap = this.rules.block.table.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells(cap[1]).map(function (c) {
                return {
                  text: c
                };
              }),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              item.raw = cap[0];
              var l = item.align.length;
              var i, j, k, row;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.rows.length;

              for (i = 0; i < l; i++) {
                item.rows[i] = splitCells(item.rows[i], item.header.length).map(function (c) {
                  return {
                    text: c
                  };
                });
              } // parse child tokens inside headers and cells
              // header child tokens


              l = item.header.length;

              for (j = 0; j < l; j++) {
                item.header[j].tokens = this.lexer.inline(item.header[j].text);
              } // cell child tokens


              l = item.rows.length;

              for (j = 0; j < l; j++) {
                row = item.rows[j];

                for (k = 0; k < row.length; k++) {
                  row[k].tokens = this.lexer.inline(row[k].text);
                }
              }

              return item;
            }
          }
        };

        _proto.lheading = function lheading(src) {
          var cap = this.rules.block.lheading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1],
              tokens: this.lexer.inline(cap[1])
            };
          }
        };

        _proto.paragraph = function paragraph(src) {
          var cap = this.rules.block.paragraph.exec(src);

          if (cap) {
            var text = cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1];
            return {
              type: 'paragraph',
              raw: cap[0],
              text: text,
              tokens: this.lexer.inline(text)
            };
          }
        };

        _proto.text = function text(src) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
            return {
              type: 'text',
              raw: cap[0],
              text: cap[0],
              tokens: this.lexer.inline(cap[0])
            };
          }
        };

        _proto.escape = function escape$1(src) {
          var cap = this.rules.inline.escape.exec(src);

          if (cap) {
            return {
              type: 'escape',
              raw: cap[0],
              text: escape(cap[1])
            };
          }
        };

        _proto.tag = function tag(src) {
          var cap = this.rules.inline.tag.exec(src);

          if (cap) {
            if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
              this.lexer.state.inLink = true;
            } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
              this.lexer.state.inLink = false;
            }

            if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.lexer.state.inRawBlock = true;
            } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.lexer.state.inRawBlock = false;
            }

            return {
              type: this.options.sanitize ? 'text' : 'html',
              raw: cap[0],
              inLink: this.lexer.state.inLink,
              inRawBlock: this.lexer.state.inRawBlock,
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.link = function link(src) {
          var cap = this.rules.inline.link.exec(src);

          if (cap) {
            var trimmedUrl = cap[2].trim();

            if (!this.options.pedantic && /^</.test(trimmedUrl)) {
              // commonmark requires matching angle brackets
              if (!/>$/.test(trimmedUrl)) {
                return;
              } // ending angle bracket cannot be escaped


              var rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');

              if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
                return;
              }
            } else {
              // find closing parenthesis
              var lastParenIndex = findClosingBracket(cap[2], '()');

              if (lastParenIndex > -1) {
                var start = cap[0].indexOf('!') === 0 ? 5 : 4;
                var linkLen = start + cap[1].length + lastParenIndex;
                cap[2] = cap[2].substring(0, lastParenIndex);
                cap[0] = cap[0].substring(0, linkLen).trim();
                cap[3] = '';
              }
            }

            var href = cap[2];
            var title = '';

            if (this.options.pedantic) {
              // split pedantic href and title
              var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }

            href = href.trim();

            if (/^</.test(href)) {
              if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
                // pedantic allows starting angle bracket without ending angle bracket
                href = href.slice(1);
              } else {
                href = href.slice(1, -1);
              }
            }

            return outputLink(cap, {
              href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
              title: title ? title.replace(this.rules.inline._escapes, '$1') : title
            }, cap[0], this.lexer);
          }
        };

        _proto.reflink = function reflink(src, links) {
          var cap;

          if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
            var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = links[link.toLowerCase()];

            if (!link || !link.href) {
              var text = cap[0].charAt(0);
              return {
                type: 'text',
                raw: text,
                text: text
              };
            }

            return outputLink(cap, link, cap[0], this.lexer);
          }
        };

        _proto.emStrong = function emStrong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.emStrong.lDelim.exec(src);
          if (!match) return; // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well

          if (match[3] && prevChar.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/)) return;
          var nextChar = match[1] || match[2] || '';

          if (!nextChar || nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar))) {
            var lLength = match[0].length - 1;
            var rDelim,
                rLength,
                delimTotal = lLength,
                midDelimTotal = 0;
            var endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
            endReg.lastIndex = 0; // Clip maskedSrc to same section of string as src (move to lexer?)

            maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

            while ((match = endReg.exec(maskedSrc)) != null) {
              rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
              if (!rDelim) continue; // skip single * in __abc*abc__

              rLength = rDelim.length;

              if (match[3] || match[4]) {
                // found another Left Delim
                delimTotal += rLength;
                continue;
              } else if (match[5] || match[6]) {
                // either Left or Right Delim
                if (lLength % 3 && !((lLength + rLength) % 3)) {
                  midDelimTotal += rLength;
                  continue; // CommonMark Emphasis Rules 9-10
                }
              }

              delimTotal -= rLength;
              if (delimTotal > 0) continue; // Haven't found enough closing delimiters
              // Remove extra characters. *a*** -> *a*

              rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal); // Create `em` if smallest delimiter has odd char count. *a***

              if (Math.min(lLength, rLength) % 2) {
                var _text = src.slice(1, lLength + match.index + rLength);

                return {
                  type: 'em',
                  raw: src.slice(0, lLength + match.index + rLength + 1),
                  text: _text,
                  tokens: this.lexer.inlineTokens(_text)
                };
              } // Create 'strong' if smallest delimiter has even char count. **a***


              var text = src.slice(2, lLength + match.index + rLength - 1);
              return {
                type: 'strong',
                raw: src.slice(0, lLength + match.index + rLength + 1),
                text: text,
                tokens: this.lexer.inlineTokens(text)
              };
            }
          }
        };

        _proto.codespan = function codespan(src) {
          var cap = this.rules.inline.code.exec(src);

          if (cap) {
            var text = cap[2].replace(/\n/g, ' ');
            var hasNonSpaceChars = /[^ ]/.test(text);
            var hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);

            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
              text = text.substring(1, text.length - 1);
            }

            text = escape(text, true);
            return {
              type: 'codespan',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.br = function br(src) {
          var cap = this.rules.inline.br.exec(src);

          if (cap) {
            return {
              type: 'br',
              raw: cap[0]
            };
          }
        };

        _proto.del = function del(src) {
          var cap = this.rules.inline.del.exec(src);

          if (cap) {
            return {
              type: 'del',
              raw: cap[0],
              text: cap[2],
              tokens: this.lexer.inlineTokens(cap[2])
            };
          }
        };

        _proto.autolink = function autolink(src, mangle) {
          var cap = this.rules.inline.autolink.exec(src);

          if (cap) {
            var text, href;

            if (cap[2] === '@') {
              text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
              href = 'mailto:' + text;
            } else {
              text = escape(cap[1]);
              href = text;
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.url = function url(src, mangle) {
          var cap;

          if (cap = this.rules.inline.url.exec(src)) {
            var text, href;

            if (cap[2] === '@') {
              text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              var prevCapZero;

              do {
                prevCapZero = cap[0];
                cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);

              text = escape(cap[0]);

              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.inlineText = function inlineText(src, smartypants) {
          var cap = this.rules.inline.text.exec(src);

          if (cap) {
            var text;

            if (this.lexer.state.inRawBlock) {
              text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0];
            } else {
              text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
            }

            return {
              type: 'text',
              raw: cap[0],
              text: text
            };
          }
        };

        return Tokenizer;
      }();

      /**
       * Block-Level Grammar
       */

      var block = {
        newline: /^(?: *(?:\n|$))+/,
        code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
        fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
        hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
        heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
        html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
        + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
        + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
        + ')',
        def: /^ {0,3}\[(label)\]: *(?:\n *)?<?([^\s>]+)>?(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
        table: noopTest,
        lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
        // regex template, placeholders will be replaced according to different paragraph
        // interruption rules of commonmark and the original markdown spec:
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
        text: /^[^\n]+/
      };
      block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
      block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
      block.def = edit(block.def).replace('label', block._label).replace('title', block._title).getRegex();
      block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
      block.listItemStart = edit(/^( *)(bull) */).replace('bull', block.bullet).getRegex();
      block.list = edit(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
      block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
      block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
      block.html = edit(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
      block.paragraph = edit(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('|table', '').replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      block.blockquote = edit(block.blockquote).replace('paragraph', block.paragraph).getRegex();
      /**
       * Normal Block Grammar
       */

      block.normal = merge({}, block);
      /**
       * GFM Block Grammar
       */

      block.gfm = merge({}, block.normal, {
        table: '^ *([^\\n ].*\\|.*)\\n' // Header
        + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
        + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

      });
      block.gfm.table = edit(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      block.gfm.paragraph = edit(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('table', block.gfm.table) // interrupt paragraphs with table
      .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      /**
       * Pedantic grammar (original John Gruber's loose markdown specification)
       */

      block.pedantic = merge({}, block.normal, {
        html: edit('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: noopTest,
        // fences not supported
        paragraph: edit(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
      });
      /**
       * Inline-Level Grammar
       */

      var inline = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: noopTest,
        tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
        // CDATA section
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(ref)\]/,
        nolink: /^!?\[(ref)\](?:\[\])?/,
        reflinkSearch: 'reflink|nolink(?!\\()',
        emStrong: {
          lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
          //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
          //          () Skip orphan inside strong  () Consume to delim (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
          rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[^*]+(?=[^*])|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
          rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\spunctuation])/
      }; // list of punctuation marks from CommonMark spec
      // without * and _ to handle the different emphasis markers * and _

      inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
      inline.escapedEmSt = /\\\*|\\_/g;
      inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();
      inline.emStrong.lDelim = edit(inline.emStrong.lDelim).replace(/punct/g, inline._punctuation).getRegex();
      inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g').replace(/punct/g, inline._punctuation).getRegex();
      inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g').replace(/punct/g, inline._punctuation).getRegex();
      inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
      inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
      inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
      inline.autolink = edit(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
      inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
      inline.tag = edit(inline.tag).replace('comment', inline._comment).replace('attribute', inline._attribute).getRegex();
      inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
      inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
      inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
      inline.link = edit(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
      inline.reflink = edit(inline.reflink).replace('label', inline._label).replace('ref', block._label).getRegex();
      inline.nolink = edit(inline.nolink).replace('ref', block._label).getRegex();
      inline.reflinkSearch = edit(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
      /**
       * Normal Inline Grammar
       */

      inline.normal = merge({}, inline);
      /**
       * Pedantic Inline Grammar
       */

      inline.pedantic = merge({}, inline.normal, {
        strong: {
          start: /^__|\*\*/,
          middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g
        },
        link: edit(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
        reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
      });
      /**
       * GFM Inline Grammar
       */

      inline.gfm = merge({}, inline.normal, {
        escape: edit(inline.escape).replace('])', '~|])').getRegex(),
        _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
      });
      inline.gfm.url = edit(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
      /**
       * GFM + Line Breaks Inline Grammar
       */

      inline.breaks = merge({}, inline.gfm, {
        br: edit(inline.br).replace('{2,}', '*').getRegex(),
        text: edit(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
      });

      /**
       * smartypants text replacement
       * @param {string} text
       */

      function smartypants(text) {
        return text // em-dashes
        .replace(/---/g, "\u2014") // en-dashes
        .replace(/--/g, "\u2013") // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
        .replace(/'/g, "\u2019") // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
        .replace(/"/g, "\u201D") // ellipses
        .replace(/\.{3}/g, "\u2026");
      }
      /**
       * mangle email addresses
       * @param {string} text
       */


      function mangle(text) {
        var out = '',
            i,
            ch;
        var l = text.length;

        for (i = 0; i < l; i++) {
          ch = text.charCodeAt(i);

          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }

          out += '&#' + ch + ';';
        }

        return out;
      }
      /**
       * Block Lexer
       */


      var Lexer = /*#__PURE__*/function () {
        function Lexer(options) {
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || exports.defaults;
          this.options.tokenizer = this.options.tokenizer || new Tokenizer();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          this.tokenizer.lexer = this;
          this.inlineQueue = [];
          this.state = {
            inLink: false,
            inRawBlock: false,
            top: true
          };
          var rules = {
            block: block.normal,
            inline: inline.normal
          };

          if (this.options.pedantic) {
            rules.block = block.pedantic;
            rules.inline = inline.pedantic;
          } else if (this.options.gfm) {
            rules.block = block.gfm;

            if (this.options.breaks) {
              rules.inline = inline.breaks;
            } else {
              rules.inline = inline.gfm;
            }
          }

          this.tokenizer.rules = rules;
        }
        /**
         * Expose Rules
         */


        /**
         * Static Lex Method
         */
        Lexer.lex = function lex(src, options) {
          var lexer = new Lexer(options);
          return lexer.lex(src);
        }
        /**
         * Static Lex Inline Method
         */
        ;

        Lexer.lexInline = function lexInline(src, options) {
          var lexer = new Lexer(options);
          return lexer.inlineTokens(src);
        }
        /**
         * Preprocessing
         */
        ;

        var _proto = Lexer.prototype;

        _proto.lex = function lex(src) {
          src = src.replace(/\r\n|\r/g, '\n');
          this.blockTokens(src, this.tokens);
          var next;

          while (next = this.inlineQueue.shift()) {
            this.inlineTokens(next.src, next.tokens);
          }

          return this.tokens;
        }
        /**
         * Lexing
         */
        ;

        _proto.blockTokens = function blockTokens(src, tokens) {
          var _this = this;

          if (tokens === void 0) {
            tokens = [];
          }

          if (this.options.pedantic) {
            src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
          } else {
            src = src.replace(/^( *)(\t+)/gm, function (_, leading, tabs) {
              return leading + '    '.repeat(tabs.length);
            });
          }

          var token, lastToken, cutSrc, lastParagraphClipped;

          while (src) {
            if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some(function (extTokenizer) {
              if (token = extTokenizer.call({
                lexer: _this
              }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }

              return false;
            })) {
              continue;
            } // newline


            if (token = this.tokenizer.space(src)) {
              src = src.substring(token.raw.length);

              if (token.raw.length === 1 && tokens.length > 0) {
                // if there's a single \n as a spacer, it's terminating the last line,
                // so move it there so that we don't get unecessary paragraph tags
                tokens[tokens.length - 1].raw += '\n';
              } else {
                tokens.push(token);
              }

              continue;
            } // code


            if (token = this.tokenizer.code(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

              if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // fences


            if (token = this.tokenizer.fences(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // heading


            if (token = this.tokenizer.heading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // hr


            if (token = this.tokenizer.hr(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // blockquote


            if (token = this.tokenizer.blockquote(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // list


            if (token = this.tokenizer.list(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // html


            if (token = this.tokenizer.html(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // def


            if (token = this.tokenizer.def(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.raw;
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else if (!this.tokens.links[token.tag]) {
                this.tokens.links[token.tag] = {
                  href: token.href,
                  title: token.title
                };
              }

              continue;
            } // table (gfm)


            if (token = this.tokenizer.table(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // lheading


            if (token = this.tokenizer.lheading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // top-level paragraph
            // prevent paragraph consuming extensions by clipping 'src' to extension start


            cutSrc = src;

            if (this.options.extensions && this.options.extensions.startBlock) {
              (function () {
                var startIndex = Infinity;
                var tempSrc = src.slice(1);
                var tempStart = void 0;

                _this.options.extensions.startBlock.forEach(function (getStartIndex) {
                  tempStart = getStartIndex.call({
                    lexer: this
                  }, tempSrc);

                  if (typeof tempStart === 'number' && tempStart >= 0) {
                    startIndex = Math.min(startIndex, tempStart);
                  }
                });

                if (startIndex < Infinity && startIndex >= 0) {
                  cutSrc = src.substring(0, startIndex + 1);
                }
              })();
            }

            if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
              lastToken = tokens[tokens.length - 1];

              if (lastParagraphClipped && lastToken.type === 'paragraph') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
                this.inlineQueue.pop();
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else {
                tokens.push(token);
              }

              lastParagraphClipped = cutSrc.length !== src.length;
              src = src.substring(token.raw.length);
              continue;
            } // text


            if (token = this.tokenizer.text(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
                this.inlineQueue.pop();
                this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
              } else {
                tokens.push(token);
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          this.state.top = true;
          return tokens;
        };

        _proto.inline = function inline(src, tokens) {
          if (tokens === void 0) {
            tokens = [];
          }

          this.inlineQueue.push({
            src: src,
            tokens: tokens
          });
          return tokens;
        }
        /**
         * Lexing/Compiling
         */
        ;

        _proto.inlineTokens = function inlineTokens(src, tokens) {
          var _this2 = this;

          if (tokens === void 0) {
            tokens = [];
          }

          var token, lastToken, cutSrc; // String with links masked to avoid interference with em and strong

          var maskedSrc = src;
          var match;
          var keepPrevChar, prevChar; // Mask out reflinks

          if (this.tokens.links) {
            var links = Object.keys(this.tokens.links);

            if (links.length > 0) {
              while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                  maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                }
              }
            }
          } // Mask out other blocks


          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          } // Mask out escaped em & strong delimiters


          while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
          }

          while (src) {
            if (!keepPrevChar) {
              prevChar = '';
            }

            keepPrevChar = false; // extensions

            if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some(function (extTokenizer) {
              if (token = extTokenizer.call({
                lexer: _this2
              }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }

              return false;
            })) {
              continue;
            } // escape


            if (token = this.tokenizer.escape(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // tag


            if (token = this.tokenizer.tag(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && token.type === 'text' && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // link


            if (token = this.tokenizer.link(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // reflink, nolink


            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && token.type === 'text' && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // em & strong


            if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // code


            if (token = this.tokenizer.codespan(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // br


            if (token = this.tokenizer.br(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // del (gfm)


            if (token = this.tokenizer.del(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // autolink


            if (token = this.tokenizer.autolink(src, mangle)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // url (gfm)


            if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text
            // prevent inlineText consuming extensions by clipping 'src' to extension start


            cutSrc = src;

            if (this.options.extensions && this.options.extensions.startInline) {
              (function () {
                var startIndex = Infinity;
                var tempSrc = src.slice(1);
                var tempStart = void 0;

                _this2.options.extensions.startInline.forEach(function (getStartIndex) {
                  tempStart = getStartIndex.call({
                    lexer: this
                  }, tempSrc);

                  if (typeof tempStart === 'number' && tempStart >= 0) {
                    startIndex = Math.min(startIndex, tempStart);
                  }
                });

                if (startIndex < Infinity && startIndex >= 0) {
                  cutSrc = src.substring(0, startIndex + 1);
                }
              })();
            }

            if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
              src = src.substring(token.raw.length);

              if (token.raw.slice(-1) !== '_') {
                // Track prevChar before string of ____ started
                prevChar = token.raw.slice(-1);
              }

              keepPrevChar = true;
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _createClass(Lexer, null, [{
          key: "rules",
          get: function get() {
            return {
              block: block,
              inline: inline
            };
          }
        }]);

        return Lexer;
      }();

      /**
       * Renderer
       */

      var Renderer = /*#__PURE__*/function () {
        function Renderer(options) {
          this.options = options || exports.defaults;
        }

        var _proto = Renderer.prototype;

        _proto.code = function code(_code, infostring, escaped) {
          var lang = (infostring || '').match(/\S*/)[0];

          if (this.options.highlight) {
            var out = this.options.highlight(_code, lang);

            if (out != null && out !== _code) {
              escaped = true;
              _code = out;
            }
          }

          _code = _code.replace(/\n$/, '') + '\n';

          if (!lang) {
            return '<pre><code>' + (escaped ? _code : escape(_code, true)) + '</code></pre>\n';
          }

          return '<pre><code class="' + this.options.langPrefix + escape(lang, true) + '">' + (escaped ? _code : escape(_code, true)) + '</code></pre>\n';
        }
        /**
         * @param {string} quote
         */
        ;

        _proto.blockquote = function blockquote(quote) {
          return "<blockquote>\n" + quote + "</blockquote>\n";
        };

        _proto.html = function html(_html) {
          return _html;
        }
        /**
         * @param {string} text
         * @param {string} level
         * @param {string} raw
         * @param {any} slugger
         */
        ;

        _proto.heading = function heading(text, level, raw, slugger) {
          if (this.options.headerIds) {
            var id = this.options.headerPrefix + slugger.slug(raw);
            return "<h" + level + " id=\"" + id + "\">" + text + "</h" + level + ">\n";
          } // ignore IDs


          return "<h" + level + ">" + text + "</h" + level + ">\n";
        };

        _proto.hr = function hr() {
          return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
        };

        _proto.list = function list(body, ordered, start) {
          var type = ordered ? 'ol' : 'ul',
              startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
          return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
        }
        /**
         * @param {string} text
         */
        ;

        _proto.listitem = function listitem(text) {
          return "<li>" + text + "</li>\n";
        };

        _proto.checkbox = function checkbox(checked) {
          return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
        }
        /**
         * @param {string} text
         */
        ;

        _proto.paragraph = function paragraph(text) {
          return "<p>" + text + "</p>\n";
        }
        /**
         * @param {string} header
         * @param {string} body
         */
        ;

        _proto.table = function table(header, body) {
          if (body) body = "<tbody>" + body + "</tbody>";
          return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
        }
        /**
         * @param {string} content
         */
        ;

        _proto.tablerow = function tablerow(content) {
          return "<tr>\n" + content + "</tr>\n";
        };

        _proto.tablecell = function tablecell(content, flags) {
          var type = flags.header ? 'th' : 'td';
          var tag = flags.align ? "<" + type + " align=\"" + flags.align + "\">" : "<" + type + ">";
          return tag + content + ("</" + type + ">\n");
        }
        /**
         * span level renderer
         * @param {string} text
         */
        ;

        _proto.strong = function strong(text) {
          return "<strong>" + text + "</strong>";
        }
        /**
         * @param {string} text
         */
        ;

        _proto.em = function em(text) {
          return "<em>" + text + "</em>";
        }
        /**
         * @param {string} text
         */
        ;

        _proto.codespan = function codespan(text) {
          return "<code>" + text + "</code>";
        };

        _proto.br = function br() {
          return this.options.xhtml ? '<br/>' : '<br>';
        }
        /**
         * @param {string} text
         */
        ;

        _proto.del = function del(text) {
          return "<del>" + text + "</del>";
        }
        /**
         * @param {string} href
         * @param {string} title
         * @param {string} text
         */
        ;

        _proto.link = function link(href, title, text) {
          href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<a href="' + escape(href) + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += '>' + text + '</a>';
          return out;
        }
        /**
         * @param {string} href
         * @param {string} title
         * @param {string} text
         */
        ;

        _proto.image = function image(href, title, text) {
          href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = "<img src=\"" + href + "\" alt=\"" + text + "\"";

          if (title) {
            out += " title=\"" + title + "\"";
          }

          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        return Renderer;
      }();

      /**
       * TextRenderer
       * returns only the textual part of the token
       */
      var TextRenderer = /*#__PURE__*/function () {
        function TextRenderer() {}

        var _proto = TextRenderer.prototype;

        // no need for block level renderers
        _proto.strong = function strong(text) {
          return text;
        };

        _proto.em = function em(text) {
          return text;
        };

        _proto.codespan = function codespan(text) {
          return text;
        };

        _proto.del = function del(text) {
          return text;
        };

        _proto.html = function html(text) {
          return text;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        _proto.link = function link(href, title, text) {
          return '' + text;
        };

        _proto.image = function image(href, title, text) {
          return '' + text;
        };

        _proto.br = function br() {
          return '';
        };

        return TextRenderer;
      }();

      /**
       * Slugger generates header id
       */
      var Slugger = /*#__PURE__*/function () {
        function Slugger() {
          this.seen = {};
        }
        /**
         * @param {string} value
         */


        var _proto = Slugger.prototype;

        _proto.serialize = function serialize(value) {
          return value.toLowerCase().trim() // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
        }
        /**
         * Finds the next safe (unique) slug to use
         * @param {string} originalSlug
         * @param {boolean} isDryRun
         */
        ;

        _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
          var slug = originalSlug;
          var occurenceAccumulator = 0;

          if (this.seen.hasOwnProperty(slug)) {
            occurenceAccumulator = this.seen[originalSlug];

            do {
              occurenceAccumulator++;
              slug = originalSlug + '-' + occurenceAccumulator;
            } while (this.seen.hasOwnProperty(slug));
          }

          if (!isDryRun) {
            this.seen[originalSlug] = occurenceAccumulator;
            this.seen[slug] = 0;
          }

          return slug;
        }
        /**
         * Convert string to unique id
         * @param {object} [options]
         * @param {boolean} [options.dryrun] Generates the next unique slug without
         * updating the internal accumulator.
         */
        ;

        _proto.slug = function slug(value, options) {
          if (options === void 0) {
            options = {};
          }

          var slug = this.serialize(value);
          return this.getNextSafeSlug(slug, options.dryrun);
        };

        return Slugger;
      }();

      /**
       * Parsing & Compiling
       */

      var Parser = /*#__PURE__*/function () {
        function Parser(options) {
          this.options = options || exports.defaults;
          this.options.renderer = this.options.renderer || new Renderer();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.textRenderer = new TextRenderer();
          this.slugger = new Slugger();
        }
        /**
         * Static Parse Method
         */


        Parser.parse = function parse(tokens, options) {
          var parser = new Parser(options);
          return parser.parse(tokens);
        }
        /**
         * Static Parse Inline Method
         */
        ;

        Parser.parseInline = function parseInline(tokens, options) {
          var parser = new Parser(options);
          return parser.parseInline(tokens);
        }
        /**
         * Parse Loop
         */
        ;

        var _proto = Parser.prototype;

        _proto.parse = function parse(tokens, top) {
          if (top === void 0) {
            top = true;
          }

          var out = '',
              i,
              j,
              k,
              l2,
              l3,
              row,
              cell,
              header,
              body,
              token,
              ordered,
              start,
              loose,
              itemBody,
              item,
              checked,
              task,
              checkbox,
              ret;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i]; // Run any renderer extensions

            if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
              ret = this.options.extensions.renderers[token.type].call({
                parser: this
              }, token);

              if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
                out += ret || '';
                continue;
              }
            }

            switch (token.type) {
              case 'space':
                {
                  continue;
                }

              case 'hr':
                {
                  out += this.renderer.hr();
                  continue;
                }

              case 'heading':
                {
                  out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
                  continue;
                }

              case 'code':
                {
                  out += this.renderer.code(token.text, token.lang, token.escaped);
                  continue;
                }

              case 'table':
                {
                  header = ''; // header

                  cell = '';
                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    cell += this.renderer.tablecell(this.parseInline(token.header[j].tokens), {
                      header: true,
                      align: token.align[j]
                    });
                  }

                  header += this.renderer.tablerow(cell);
                  body = '';
                  l2 = token.rows.length;

                  for (j = 0; j < l2; j++) {
                    row = token.rows[j];
                    cell = '';
                    l3 = row.length;

                    for (k = 0; k < l3; k++) {
                      cell += this.renderer.tablecell(this.parseInline(row[k].tokens), {
                        header: false,
                        align: token.align[k]
                      });
                    }

                    body += this.renderer.tablerow(cell);
                  }

                  out += this.renderer.table(header, body);
                  continue;
                }

              case 'blockquote':
                {
                  body = this.parse(token.tokens);
                  out += this.renderer.blockquote(body);
                  continue;
                }

              case 'list':
                {
                  ordered = token.ordered;
                  start = token.start;
                  loose = token.loose;
                  l2 = token.items.length;
                  body = '';

                  for (j = 0; j < l2; j++) {
                    item = token.items[j];
                    checked = item.checked;
                    task = item.task;
                    itemBody = '';

                    if (item.task) {
                      checkbox = this.renderer.checkbox(checked);

                      if (loose) {
                        if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                            item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                          }
                        } else {
                          item.tokens.unshift({
                            type: 'text',
                            text: checkbox
                          });
                        }
                      } else {
                        itemBody += checkbox;
                      }
                    }

                    itemBody += this.parse(item.tokens, loose);
                    body += this.renderer.listitem(itemBody, task, checked);
                  }

                  out += this.renderer.list(body, ordered, start);
                  continue;
                }

              case 'html':
                {
                  // TODO parse inline content if parameter markdown=1
                  out += this.renderer.html(token.text);
                  continue;
                }

              case 'paragraph':
                {
                  out += this.renderer.paragraph(this.parseInline(token.tokens));
                  continue;
                }

              case 'text':
                {
                  body = token.tokens ? this.parseInline(token.tokens) : token.text;

                  while (i + 1 < l && tokens[i + 1].type === 'text') {
                    token = tokens[++i];
                    body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
                  }

                  out += top ? this.renderer.paragraph(body) : body;
                  continue;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        }
        /**
         * Parse Inline Tokens
         */
        ;

        _proto.parseInline = function parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          var out = '',
              i,
              token,
              ret;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i]; // Run any renderer extensions

            if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
              ret = this.options.extensions.renderers[token.type].call({
                parser: this
              }, token);

              if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
                out += ret || '';
                continue;
              }
            }

            switch (token.type) {
              case 'escape':
                {
                  out += renderer.text(token.text);
                  break;
                }

              case 'html':
                {
                  out += renderer.html(token.text);
                  break;
                }

              case 'link':
                {
                  out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'image':
                {
                  out += renderer.image(token.href, token.title, token.text);
                  break;
                }

              case 'strong':
                {
                  out += renderer.strong(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'em':
                {
                  out += renderer.em(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'codespan':
                {
                  out += renderer.codespan(token.text);
                  break;
                }

              case 'br':
                {
                  out += renderer.br();
                  break;
                }

              case 'del':
                {
                  out += renderer.del(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'text':
                {
                  out += renderer.text(token.text);
                  break;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        };

        return Parser;
      }();

      /**
       * Marked
       */

      function marked(src, opt, callback) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        if (typeof opt === 'function') {
          callback = opt;
          opt = null;
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        if (callback) {
          var highlight = opt.highlight;
          var tokens;

          try {
            tokens = Lexer.lex(src, opt);
          } catch (e) {
            return callback(e);
          }

          var done = function done(err) {
            var out;

            if (!err) {
              try {
                if (opt.walkTokens) {
                  marked.walkTokens(tokens, opt.walkTokens);
                }

                out = Parser.parse(tokens, opt);
              } catch (e) {
                err = e;
              }
            }

            opt.highlight = highlight;
            return err ? callback(err) : callback(null, out);
          };

          if (!highlight || highlight.length < 3) {
            return done();
          }

          delete opt.highlight;
          if (!tokens.length) return done();
          var pending = 0;
          marked.walkTokens(tokens, function (token) {
            if (token.type === 'code') {
              pending++;
              setTimeout(function () {
                highlight(token.text, token.lang, function (err, code) {
                  if (err) {
                    return done(err);
                  }

                  if (code != null && code !== token.text) {
                    token.text = code;
                    token.escaped = true;
                  }

                  pending--;

                  if (pending === 0) {
                    done();
                  }
                });
              }, 0);
            }
          });

          if (pending === 0) {
            done();
          }

          return;
        }

        function onError(e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
          }

          throw e;
        }

        try {
          var _tokens = Lexer.lex(src, opt);

          if (opt.walkTokens) {
            if (opt.async) {
              return Promise.all(marked.walkTokens(_tokens, opt.walkTokens)).then(function () {
                return Parser.parse(_tokens, opt);
              })["catch"](onError);
            }

            marked.walkTokens(_tokens, opt.walkTokens);
          }

          return Parser.parse(_tokens, opt);
        } catch (e) {
          onError(e);
        }
      }
      /**
       * Options
       */

      marked.options = marked.setOptions = function (opt) {
        merge(marked.defaults, opt);
        changeDefaults(marked.defaults);
        return marked;
      };

      marked.getDefaults = getDefaults;
      marked.defaults = exports.defaults;
      /**
       * Use Extension
       */

      marked.use = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var opts = merge.apply(void 0, [{}].concat(args));
        var extensions = marked.defaults.extensions || {
          renderers: {},
          childTokens: {}
        };
        var hasExtensions;
        args.forEach(function (pack) {
          // ==-- Parse "addon" extensions --== //
          if (pack.extensions) {
            hasExtensions = true;
            pack.extensions.forEach(function (ext) {
              if (!ext.name) {
                throw new Error('extension name required');
              }

              if (ext.renderer) {
                // Renderer extensions
                var prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;

                if (prevRenderer) {
                  // Replace extension with func to run new extension but fall back if false
                  extensions.renderers[ext.name] = function () {
                    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      args[_key2] = arguments[_key2];
                    }

                    var ret = ext.renderer.apply(this, args);

                    if (ret === false) {
                      ret = prevRenderer.apply(this, args);
                    }

                    return ret;
                  };
                } else {
                  extensions.renderers[ext.name] = ext.renderer;
                }
              }

              if (ext.tokenizer) {
                // Tokenizer Extensions
                if (!ext.level || ext.level !== 'block' && ext.level !== 'inline') {
                  throw new Error("extension level must be 'block' or 'inline'");
                }

                if (extensions[ext.level]) {
                  extensions[ext.level].unshift(ext.tokenizer);
                } else {
                  extensions[ext.level] = [ext.tokenizer];
                }

                if (ext.start) {
                  // Function to check for start of token
                  if (ext.level === 'block') {
                    if (extensions.startBlock) {
                      extensions.startBlock.push(ext.start);
                    } else {
                      extensions.startBlock = [ext.start];
                    }
                  } else if (ext.level === 'inline') {
                    if (extensions.startInline) {
                      extensions.startInline.push(ext.start);
                    } else {
                      extensions.startInline = [ext.start];
                    }
                  }
                }
              }

              if (ext.childTokens) {
                // Child tokens to be visited by walkTokens
                extensions.childTokens[ext.name] = ext.childTokens;
              }
            });
          } // ==-- Parse "overwrite" extensions --== //


          if (pack.renderer) {
            (function () {
              var renderer = marked.defaults.renderer || new Renderer();

              var _loop = function _loop(prop) {
                var prevRenderer = renderer[prop]; // Replace renderer with func to run extension, but fall back if false

                renderer[prop] = function () {
                  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                  }

                  var ret = pack.renderer[prop].apply(renderer, args);

                  if (ret === false) {
                    ret = prevRenderer.apply(renderer, args);
                  }

                  return ret;
                };
              };

              for (var prop in pack.renderer) {
                _loop(prop);
              }

              opts.renderer = renderer;
            })();
          }

          if (pack.tokenizer) {
            (function () {
              var tokenizer = marked.defaults.tokenizer || new Tokenizer();

              var _loop2 = function _loop2(prop) {
                var prevTokenizer = tokenizer[prop]; // Replace tokenizer with func to run extension, but fall back if false

                tokenizer[prop] = function () {
                  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                  }

                  var ret = pack.tokenizer[prop].apply(tokenizer, args);

                  if (ret === false) {
                    ret = prevTokenizer.apply(tokenizer, args);
                  }

                  return ret;
                };
              };

              for (var prop in pack.tokenizer) {
                _loop2(prop);
              }

              opts.tokenizer = tokenizer;
            })();
          } // ==-- Parse WalkTokens extensions --== //


          if (pack.walkTokens) {
            var _walkTokens = marked.defaults.walkTokens;

            opts.walkTokens = function (token) {
              var values = [];
              values.push(pack.walkTokens.call(this, token));

              if (_walkTokens) {
                values = values.concat(_walkTokens.call(this, token));
              }

              return values;
            };
          }

          if (hasExtensions) {
            opts.extensions = extensions;
          }

          marked.setOptions(opts);
        });
      };
      /**
       * Run callback for every token
       */


      marked.walkTokens = function (tokens, callback) {
        var values = [];

        var _loop3 = function _loop3() {
          var token = _step.value;
          values = values.concat(callback.call(marked, token));

          switch (token.type) {
            case 'table':
              {
                for (var _iterator2 = _createForOfIteratorHelperLoose(token.header), _step2; !(_step2 = _iterator2()).done;) {
                  var cell = _step2.value;
                  values = values.concat(marked.walkTokens(cell.tokens, callback));
                }

                for (var _iterator3 = _createForOfIteratorHelperLoose(token.rows), _step3; !(_step3 = _iterator3()).done;) {
                  var row = _step3.value;

                  for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                    var _cell = _step4.value;
                    values = values.concat(marked.walkTokens(_cell.tokens, callback));
                  }
                }

                break;
              }

            case 'list':
              {
                values = values.concat(marked.walkTokens(token.items, callback));
                break;
              }

            default:
              {
                if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) {
                  // Walk any extensions
                  marked.defaults.extensions.childTokens[token.type].forEach(function (childTokens) {
                    values = values.concat(marked.walkTokens(token[childTokens], callback));
                  });
                } else if (token.tokens) {
                  values = values.concat(marked.walkTokens(token.tokens, callback));
                }
              }
          }
        };

        for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
          _loop3();
        }

        return values;
      };
      /**
       * Parse Inline
       * @param {string} src
       */


      marked.parseInline = function (src, opt) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked.parseInline(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        try {
          var tokens = Lexer.lexInline(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }

          return Parser.parseInline(tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      };
      /**
       * Expose
       */


      marked.Parser = Parser;
      marked.parser = Parser.parse;
      marked.Renderer = Renderer;
      marked.TextRenderer = TextRenderer;
      marked.Lexer = Lexer;
      marked.lexer = Lexer.lex;
      marked.Tokenizer = Tokenizer;
      marked.Slugger = Slugger;
      marked.parse = marked;
      var options = marked.options;
      var setOptions = marked.setOptions;
      var use = marked.use;
      var walkTokens = marked.walkTokens;
      var parseInline = marked.parseInline;
      var parse = marked;
      var parser = Parser.parse;
      var lexer = Lexer.lex;

      exports.Lexer = Lexer;
      exports.Parser = Parser;
      exports.Renderer = Renderer;
      exports.Slugger = Slugger;
      exports.TextRenderer = TextRenderer;
      exports.Tokenizer = Tokenizer;
      exports.getDefaults = getDefaults;
      exports.lexer = lexer;
      exports.marked = marked;
      exports.options = options;
      exports.parse = parse;
      exports.parseInline = parseInline;
      exports.parser = parser;
      exports.setOptions = setOptions;
      exports.use = use;
      exports.walkTokens = walkTokens;

      Object.defineProperty(exports, '__esModule', { value: true });

    }));
    });

    const key = {};

    /* node_modules\svelte-markdown\src\renderers\Heading.svelte generated by Svelte v3.44.3 */
    const file$k = "node_modules\\svelte-markdown\\src\\renderers\\Heading.svelte";

    // (28:0) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*raw*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*raw*/ 2) set_data_dev(t, /*raw*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(28:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:22) 
    function create_if_block_5$1(ctx) {
    	let h6;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			if (default_slot) default_slot.c();
    			attr_dev(h6, "id", /*id*/ ctx[2]);
    			add_location(h6, file$k, 26, 2, 596);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);

    			if (default_slot) {
    				default_slot.m(h6, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(h6, "id", /*id*/ ctx[2]);
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
    			if (detaching) detach_dev(h6);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(26:22) ",
    		ctx
    	});

    	return block;
    }

    // (24:22) 
    function create_if_block_4$1(ctx) {
    	let h5;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			if (default_slot) default_slot.c();
    			attr_dev(h5, "id", /*id*/ ctx[2]);
    			add_location(h5, file$k, 24, 2, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);

    			if (default_slot) {
    				default_slot.m(h5, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(h5, "id", /*id*/ ctx[2]);
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
    			if (detaching) detach_dev(h5);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(24:22) ",
    		ctx
    	});

    	return block;
    }

    // (22:22) 
    function create_if_block_3$1(ctx) {
    	let h4;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			if (default_slot) default_slot.c();
    			attr_dev(h4, "id", /*id*/ ctx[2]);
    			add_location(h4, file$k, 22, 2, 490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);

    			if (default_slot) {
    				default_slot.m(h4, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(h4, "id", /*id*/ ctx[2]);
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
    			if (detaching) detach_dev(h4);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(22:22) ",
    		ctx
    	});

    	return block;
    }

    // (20:22) 
    function create_if_block_2$2(ctx) {
    	let h3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			attr_dev(h3, "id", /*id*/ ctx[2]);
    			add_location(h3, file$k, 20, 2, 437);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(h3, "id", /*id*/ ctx[2]);
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
    			if (detaching) detach_dev(h3);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(20:22) ",
    		ctx
    	});

    	return block;
    }

    // (18:22) 
    function create_if_block_1$2(ctx) {
    	let h2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			if (default_slot) default_slot.c();
    			attr_dev(h2, "id", /*id*/ ctx[2]);
    			add_location(h2, file$k, 18, 2, 384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);

    			if (default_slot) {
    				default_slot.m(h2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(h2, "id", /*id*/ ctx[2]);
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
    			if (detaching) detach_dev(h2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(18:22) ",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if depth === 1}
    function create_if_block$4(ctx) {
    	let h1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "id", /*id*/ ctx[2]);
    			add_location(h1, file$k, 16, 2, 331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(h1, "id", /*id*/ ctx[2]);
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
    			if (detaching) detach_dev(h1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(16:0) {#if depth === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$4,
    		create_if_block_1$2,
    		create_if_block_2$2,
    		create_if_block_3$1,
    		create_if_block_4$1,
    		create_if_block_5$1,
    		create_else_block$4
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*depth*/ ctx[0] === 1) return 0;
    		if (/*depth*/ ctx[0] === 2) return 1;
    		if (/*depth*/ ctx[0] === 3) return 2;
    		if (/*depth*/ ctx[0] === 4) return 3;
    		if (/*depth*/ ctx[0] === 5) return 4;
    		if (/*depth*/ ctx[0] === 6) return 5;
    		return 6;
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
    		p: function update(ctx, [dirty]) {
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let id;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Heading', slots, ['default']);
    	let { depth } = $$props;
    	let { raw } = $$props;
    	let { text } = $$props;
    	const { slug, getOptions } = getContext(key);
    	const options = getOptions();
    	const writable_props = ['depth', 'raw', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Heading> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('depth' in $$props) $$invalidate(0, depth = $$props.depth);
    		if ('raw' in $$props) $$invalidate(1, raw = $$props.raw);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		key,
    		depth,
    		raw,
    		text,
    		slug,
    		getOptions,
    		options,
    		id
    	});

    	$$self.$inject_state = $$props => {
    		if ('depth' in $$props) $$invalidate(0, depth = $$props.depth);
    		if ('raw' in $$props) $$invalidate(1, raw = $$props.raw);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text*/ 8) {
    			$$invalidate(2, id = options.headerIds
    			? options.headerPrefix + slug(text)
    			: undefined);
    		}
    	};

    	return [depth, raw, id, text, $$scope, slots];
    }

    class Heading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { depth: 0, raw: 1, text: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Heading",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*depth*/ ctx[0] === undefined && !('depth' in props)) {
    			console.warn("<Heading> was created without expected prop 'depth'");
    		}

    		if (/*raw*/ ctx[1] === undefined && !('raw' in props)) {
    			console.warn("<Heading> was created without expected prop 'raw'");
    		}

    		if (/*text*/ ctx[3] === undefined && !('text' in props)) {
    			console.warn("<Heading> was created without expected prop 'text'");
    		}
    	}

    	get depth() {
    		throw new Error("<Heading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depth(value) {
    		throw new Error("<Heading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raw() {
    		throw new Error("<Heading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raw(value) {
    		throw new Error("<Heading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Heading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Heading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Paragraph.svelte generated by Svelte v3.44.3 */

    const file$j = "node_modules\\svelte-markdown\\src\\renderers\\Paragraph.svelte";

    function create_fragment$m(ctx) {
    	let p;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if (default_slot) default_slot.c();
    			add_location(p, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(p);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Paragraph', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Paragraph> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Paragraph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Paragraph",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Text.svelte generated by Svelte v3.44.3 */

    function create_fragment$l(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, ['default']);
    	let { text } = $$props;
    	let { raw } = $$props;
    	const writable_props = ['text', 'raw'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('raw' in $$props) $$invalidate(1, raw = $$props.raw);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ text, raw });

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('raw' in $$props) $$invalidate(1, raw = $$props.raw);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, raw, $$scope, slots];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { text: 0, raw: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !('text' in props)) {
    			console.warn("<Text> was created without expected prop 'text'");
    		}

    		if (/*raw*/ ctx[1] === undefined && !('raw' in props)) {
    			console.warn("<Text> was created without expected prop 'raw'");
    		}
    	}

    	get text() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raw() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raw(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Image.svelte generated by Svelte v3.44.3 */

    const file$i = "node_modules\\svelte-markdown\\src\\renderers\\Image.svelte";

    function create_fragment$k(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*href*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "title", /*title*/ ctx[1]);
    			attr_dev(img, "alt", /*text*/ ctx[2]);
    			add_location(img, file$i, 6, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*href*/ 1 && !src_url_equal(img.src, img_src_value = /*href*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*title*/ 2) {
    				attr_dev(img, "title", /*title*/ ctx[1]);
    			}

    			if (dirty & /*text*/ 4) {
    				attr_dev(img, "alt", /*text*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Image', slots, []);
    	let { href = '' } = $$props;
    	let { title = undefined } = $$props;
    	let { text = '' } = $$props;
    	const writable_props = ['href', 'title', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ href, title, text });

    	$$self.$inject_state = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, title, text];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { href: 0, title: 1, text: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get href() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Link.svelte generated by Svelte v3.44.3 */

    const file$h = "node_modules\\svelte-markdown\\src\\renderers\\Link.svelte";

    function create_fragment$j(ctx) {
    	let a;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			attr_dev(a, "title", /*title*/ ctx[1]);
    			add_location(a, file$h, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
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

    			if (!current || dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}

    			if (!current || dirty & /*title*/ 2) {
    				attr_dev(a, "title", /*title*/ ctx[1]);
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
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { href = '' } = $$props;
    	let { title = undefined } = $$props;
    	const writable_props = ['href', 'title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ href, title });

    	$$self.$inject_state = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, title, $$scope, slots];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { href: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Em.svelte generated by Svelte v3.44.3 */

    const file$g = "node_modules\\svelte-markdown\\src\\renderers\\Em.svelte";

    function create_fragment$i(ctx) {
    	let em;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			em = element("em");
    			if (default_slot) default_slot.c();
    			add_location(em, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, em, anchor);

    			if (default_slot) {
    				default_slot.m(em, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(em);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Em', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Em> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Em extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Em",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Del.svelte generated by Svelte v3.44.3 */

    const file$f = "node_modules\\svelte-markdown\\src\\renderers\\Del.svelte";

    function create_fragment$h(ctx) {
    	let del;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			del = element("del");
    			if (default_slot) default_slot.c();
    			add_location(del, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, del, anchor);

    			if (default_slot) {
    				default_slot.m(del, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(del);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Del', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Del> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Del extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Del",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Codespan.svelte generated by Svelte v3.44.3 */

    const file$e = "node_modules\\svelte-markdown\\src\\renderers\\Codespan.svelte";

    function create_fragment$g(ctx) {
    	let code;
    	let t_value = /*raw*/ ctx[0].replace(/`/g, '') + "";
    	let t;

    	const block = {
    		c: function create() {
    			code = element("code");
    			t = text(t_value);
    			add_location(code, file$e, 4, 0, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, code, anchor);
    			append_dev(code, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*raw*/ 1 && t_value !== (t_value = /*raw*/ ctx[0].replace(/`/g, '') + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(code);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Codespan', slots, []);
    	let { raw } = $$props;
    	const writable_props = ['raw'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Codespan> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('raw' in $$props) $$invalidate(0, raw = $$props.raw);
    	};

    	$$self.$capture_state = () => ({ raw });

    	$$self.$inject_state = $$props => {
    		if ('raw' in $$props) $$invalidate(0, raw = $$props.raw);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [raw];
    }

    class Codespan extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { raw: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Codespan",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*raw*/ ctx[0] === undefined && !('raw' in props)) {
    			console.warn("<Codespan> was created without expected prop 'raw'");
    		}
    	}

    	get raw() {
    		throw new Error("<Codespan>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raw(value) {
    		throw new Error("<Codespan>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Strong.svelte generated by Svelte v3.44.3 */

    const file$d = "node_modules\\svelte-markdown\\src\\renderers\\Strong.svelte";

    function create_fragment$f(ctx) {
    	let strong;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			if (default_slot) default_slot.c();
    			add_location(strong, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);

    			if (default_slot) {
    				default_slot.m(strong, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(strong);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Strong', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Strong> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Strong extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Strong",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Table.svelte generated by Svelte v3.44.3 */

    const file$c = "node_modules\\svelte-markdown\\src\\renderers\\Table.svelte";

    function create_fragment$e(ctx) {
    	let table;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (default_slot) default_slot.c();
    			add_location(table, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(table);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Table', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\TableHead.svelte generated by Svelte v3.44.3 */

    const file$b = "node_modules\\svelte-markdown\\src\\renderers\\TableHead.svelte";

    function create_fragment$d(ctx) {
    	let thead;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			if (default_slot) default_slot.c();
    			add_location(thead, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);

    			if (default_slot) {
    				default_slot.m(thead, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(thead);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableHead', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableHead> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TableHead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableHead",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\TableBody.svelte generated by Svelte v3.44.3 */

    const file$a = "node_modules\\svelte-markdown\\src\\renderers\\TableBody.svelte";

    function create_fragment$c(ctx) {
    	let tbody;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			if (default_slot) default_slot.c();
    			add_location(tbody, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);

    			if (default_slot) {
    				default_slot.m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(tbody);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableBody', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableBody> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TableBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableBody",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\TableRow.svelte generated by Svelte v3.44.3 */

    const file$9 = "node_modules\\svelte-markdown\\src\\renderers\\TableRow.svelte";

    function create_fragment$b(ctx) {
    	let tr;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (default_slot) default_slot.c();
    			add_location(tr, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			if (default_slot) {
    				default_slot.m(tr, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(tr);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableRow', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableRow> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TableRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableRow",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\TableCell.svelte generated by Svelte v3.44.3 */

    const file$8 = "node_modules\\svelte-markdown\\src\\renderers\\TableCell.svelte";

    // (8:0) {:else}
    function create_else_block$3(ctx) {
    	let td;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if (default_slot) default_slot.c();
    			attr_dev(td, "align", /*align*/ ctx[1]);
    			add_location(td, file$8, 8, 2, 115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			if (default_slot) {
    				default_slot.m(td, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
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

    			if (!current || dirty & /*align*/ 2) {
    				attr_dev(td, "align", /*align*/ ctx[1]);
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
    			if (detaching) detach_dev(td);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(8:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if header}
    function create_if_block$3(ctx) {
    	let th;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (default_slot) default_slot.c();
    			attr_dev(th, "align", /*align*/ ctx[1]);
    			add_location(th, file$8, 6, 2, 74);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);

    			if (default_slot) {
    				default_slot.m(th, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
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

    			if (!current || dirty & /*align*/ 2) {
    				attr_dev(th, "align", /*align*/ ctx[1]);
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
    			if (detaching) detach_dev(th);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(6:0) {#if header}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*header*/ ctx[0]) return 0;
    		return 1;
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
    		p: function update(ctx, [dirty]) {
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableCell', slots, ['default']);
    	let { header } = $$props;
    	let { align } = $$props;
    	const writable_props = ['header', 'align'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableCell> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('align' in $$props) $$invalidate(1, align = $$props.align);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ header, align });

    	$$self.$inject_state = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('align' in $$props) $$invalidate(1, align = $$props.align);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [header, align, $$scope, slots];
    }

    class TableCell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { header: 0, align: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableCell",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*header*/ ctx[0] === undefined && !('header' in props)) {
    			console.warn("<TableCell> was created without expected prop 'header'");
    		}

    		if (/*align*/ ctx[1] === undefined && !('align' in props)) {
    			console.warn("<TableCell> was created without expected prop 'align'");
    		}
    	}

    	get header() {
    		throw new Error("<TableCell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<TableCell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<TableCell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<TableCell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\List.svelte generated by Svelte v3.44.3 */

    const file$7 = "node_modules\\svelte-markdown\\src\\renderers\\List.svelte";

    // (8:0) {:else}
    function create_else_block$2(ctx) {
    	let ul;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			add_location(ul, file$7, 8, 2, 117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(8:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if ordered}
    function create_if_block$2(ctx) {
    	let ol;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			ol = element("ol");
    			if (default_slot) default_slot.c();
    			attr_dev(ol, "start", /*start*/ ctx[1]);
    			add_location(ol, file$7, 6, 2, 76);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);

    			if (default_slot) {
    				default_slot.m(ol, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
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

    			if (!current || dirty & /*start*/ 2) {
    				attr_dev(ol, "start", /*start*/ ctx[1]);
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
    			if (detaching) detach_dev(ol);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(6:0) {#if ordered}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*ordered*/ ctx[0]) return 0;
    		return 1;
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
    		p: function update(ctx, [dirty]) {
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, ['default']);
    	let { ordered } = $$props;
    	let { start } = $$props;
    	const writable_props = ['ordered', 'start'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ordered' in $$props) $$invalidate(0, ordered = $$props.ordered);
    		if ('start' in $$props) $$invalidate(1, start = $$props.start);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ ordered, start });

    	$$self.$inject_state = $$props => {
    		if ('ordered' in $$props) $$invalidate(0, ordered = $$props.ordered);
    		if ('start' in $$props) $$invalidate(1, start = $$props.start);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ordered, start, $$scope, slots];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { ordered: 0, start: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ordered*/ ctx[0] === undefined && !('ordered' in props)) {
    			console.warn("<List> was created without expected prop 'ordered'");
    		}

    		if (/*start*/ ctx[1] === undefined && !('start' in props)) {
    			console.warn("<List> was created without expected prop 'start'");
    		}
    	}

    	get ordered() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordered(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\ListItem.svelte generated by Svelte v3.44.3 */

    const file$6 = "node_modules\\svelte-markdown\\src\\renderers\\ListItem.svelte";

    function create_fragment$8(ctx) {
    	let li;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			add_location(li, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListItem', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Hr.svelte generated by Svelte v3.44.3 */

    const file$5 = "node_modules\\svelte-markdown\\src\\renderers\\Hr.svelte";

    function create_fragment$7(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			add_location(hr, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hr', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hr> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Hr extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hr",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Html.svelte generated by Svelte v3.44.3 */

    function create_fragment$6(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*text*/ ctx[0], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) html_tag.p(/*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Html', slots, []);
    	let { text } = $$props;
    	const writable_props = ['text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Html> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ text });

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text];
    }

    class Html extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Html",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !('text' in props)) {
    			console.warn("<Html> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<Html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Blockquote.svelte generated by Svelte v3.44.3 */

    const file$4 = "node_modules\\svelte-markdown\\src\\renderers\\Blockquote.svelte";

    function create_fragment$5(ctx) {
    	let blockquote;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			blockquote = element("blockquote");
    			if (default_slot) default_slot.c();
    			add_location(blockquote, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, blockquote, anchor);

    			if (default_slot) {
    				default_slot.m(blockquote, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(blockquote);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Blockquote', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Blockquote> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Blockquote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blockquote",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Code.svelte generated by Svelte v3.44.3 */

    const file$3 = "node_modules\\svelte-markdown\\src\\renderers\\Code.svelte";

    function create_fragment$4(ctx) {
    	let pre;
    	let code;
    	let t;

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			code = element("code");
    			t = text(/*text*/ ctx[1]);
    			add_location(code, file$3, 5, 18, 74);
    			attr_dev(pre, "class", /*lang*/ ctx[0]);
    			add_location(pre, file$3, 5, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			append_dev(pre, code);
    			append_dev(code, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*lang*/ 1) {
    				attr_dev(pre, "class", /*lang*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Code', slots, []);
    	let { lang } = $$props;
    	let { text } = $$props;
    	const writable_props = ['lang', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Code> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('lang' in $$props) $$invalidate(0, lang = $$props.lang);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ lang, text });

    	$$self.$inject_state = $$props => {
    		if ('lang' in $$props) $$invalidate(0, lang = $$props.lang);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lang, text];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { lang: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*lang*/ ctx[0] === undefined && !('lang' in props)) {
    			console.warn("<Code> was created without expected prop 'lang'");
    		}

    		if (/*text*/ ctx[1] === undefined && !('text' in props)) {
    			console.warn("<Code> was created without expected prop 'text'");
    		}
    	}

    	get lang() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-markdown\src\renderers\Br.svelte generated by Svelte v3.44.3 */

    const file$2 = "node_modules\\svelte-markdown\\src\\renderers\\Br.svelte";

    function create_fragment$3(ctx) {
    	let br;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			br = element("br");
    			if (default_slot) default_slot.c();
    			add_location(br, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
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
    			if (detaching) detach_dev(br);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Br', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Br> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Br extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Br",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const defaultRenderers = {
      heading: Heading,
      paragraph: Paragraph,
      text: Text,
      image: Image,
      link: Link,
      em: Em,
      strong: Strong,
      codespan: Codespan,
      del: Del,
      table: Table,
      tablehead: TableHead,
      tablebody: TableBody,
      tablerow: TableRow,
      tablecell: TableCell,
      list: List,
      orderedlistitem: null,
      unorderedlistitem: null,
      listitem: ListItem,
      hr: Hr,
      html: Html,
      blockquote: Blockquote,
      code: Code,
      br: Br,
    };
    const defaultOptions = {
      baseUrl: null,
      breaks: false,
      gfm: true,
      headerIds: true,
      headerPrefix: '',
      highlight: null,
      langPrefix: 'language-',
      mangle: true,
      pedantic: false,
      renderer: null,
      sanitize: false,
      sanitizer: null,
      silent: false,
      smartLists: false,
      smartypants: false,
      tokenizer: null,
      xhtml: false,
    };

    /* node_modules\svelte-markdown\src\SvelteMarkdown.svelte generated by Svelte v3.44.3 */

    function create_fragment$2(ctx) {
    	let parser;
    	let current;

    	parser = new Parser({
    			props: {
    				tokens: /*tokens*/ ctx[0],
    				renderers: /*combinedRenderers*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parser.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(parser, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const parser_changes = {};
    			if (dirty & /*tokens*/ 1) parser_changes.tokens = /*tokens*/ ctx[0];
    			if (dirty & /*combinedRenderers*/ 2) parser_changes.renderers = /*combinedRenderers*/ ctx[1];
    			parser.$set(parser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parser, detaching);
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
    	let preprocessed;
    	let slugger;
    	let combinedOptions;
    	let combinedRenderers;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvelteMarkdown', slots, []);
    	let { source = [] } = $$props;
    	let { renderers = {} } = $$props;
    	let { options = {} } = $$props;
    	let { isInline = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let tokens;
    	let lexer;
    	let mounted;

    	setContext(key, {
    		slug: val => slugger ? slugger.slug(val) : '',
    		getOptions: () => combinedOptions
    	});

    	onMount(() => {
    		$$invalidate(7, mounted = true);
    	});

    	const writable_props = ['source', 'renderers', 'options', 'isInline'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvelteMarkdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('source' in $$props) $$invalidate(2, source = $$props.source);
    		if ('renderers' in $$props) $$invalidate(3, renderers = $$props.renderers);
    		if ('options' in $$props) $$invalidate(4, options = $$props.options);
    		if ('isInline' in $$props) $$invalidate(5, isInline = $$props.isInline);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		createEventDispatcher,
    		onMount,
    		Parser,
    		Lexer: marked_umd.Lexer,
    		Slugger: marked_umd.Slugger,
    		defaultOptions,
    		defaultRenderers,
    		key,
    		source,
    		renderers,
    		options,
    		isInline,
    		dispatch,
    		tokens,
    		lexer,
    		mounted,
    		preprocessed,
    		combinedOptions,
    		slugger,
    		combinedRenderers
    	});

    	$$self.$inject_state = $$props => {
    		if ('source' in $$props) $$invalidate(2, source = $$props.source);
    		if ('renderers' in $$props) $$invalidate(3, renderers = $$props.renderers);
    		if ('options' in $$props) $$invalidate(4, options = $$props.options);
    		if ('isInline' in $$props) $$invalidate(5, isInline = $$props.isInline);
    		if ('tokens' in $$props) $$invalidate(0, tokens = $$props.tokens);
    		if ('lexer' in $$props) $$invalidate(6, lexer = $$props.lexer);
    		if ('mounted' in $$props) $$invalidate(7, mounted = $$props.mounted);
    		if ('preprocessed' in $$props) $$invalidate(8, preprocessed = $$props.preprocessed);
    		if ('combinedOptions' in $$props) $$invalidate(9, combinedOptions = $$props.combinedOptions);
    		if ('slugger' in $$props) slugger = $$props.slugger;
    		if ('combinedRenderers' in $$props) $$invalidate(1, combinedRenderers = $$props.combinedRenderers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*source*/ 4) {
    			$$invalidate(8, preprocessed = Array.isArray(source));
    		}

    		if ($$self.$$.dirty & /*source*/ 4) {
    			slugger = source ? new marked_umd.Slugger() : undefined;
    		}

    		if ($$self.$$.dirty & /*options*/ 16) {
    			$$invalidate(9, combinedOptions = { ...defaultOptions, ...options });
    		}

    		if ($$self.$$.dirty & /*preprocessed, source, combinedOptions, isInline, lexer, tokens*/ 869) {
    			if (preprocessed) {
    				$$invalidate(0, tokens = source);
    			} else {
    				$$invalidate(6, lexer = new marked_umd.Lexer(combinedOptions));

    				$$invalidate(0, tokens = isInline
    				? lexer.inlineTokens(source)
    				: lexer.lex(source));

    				dispatch('parsed', { tokens });
    			}
    		}

    		if ($$self.$$.dirty & /*renderers*/ 8) {
    			$$invalidate(1, combinedRenderers = { ...defaultRenderers, ...renderers });
    		}

    		if ($$self.$$.dirty & /*mounted, preprocessed, tokens*/ 385) {
    			mounted && !preprocessed && dispatch('parsed', { tokens });
    		}
    	};

    	return [
    		tokens,
    		combinedRenderers,
    		source,
    		renderers,
    		options,
    		isInline,
    		lexer,
    		mounted,
    		preprocessed,
    		combinedOptions
    	];
    }

    class SvelteMarkdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			source: 2,
    			renderers: 3,
    			options: 4,
    			isInline: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteMarkdown",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get source() {
    		throw new Error("<SvelteMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<SvelteMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderers() {
    		throw new Error("<SvelteMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderers(value) {
    		throw new Error("<SvelteMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<SvelteMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SvelteMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isInline() {
    		throw new Error("<SvelteMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isInline(value) {
    		throw new Error("<SvelteMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\Loading\Loading.svelte generated by Svelte v3.44.3 */

    const file$1 = "node_modules\\carbon-components-svelte\\src\\Loading\\Loading.svelte";

    // (53:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let label;
    	let t0;
    	let t1;
    	let svg;
    	let title;
    	let t2;
    	let circle;
    	let div_aria_live_value;
    	let if_block = /*small*/ ctx[0] && create_if_block_2$1(ctx);

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
    			add_location(label, file$1, 63, 4, 1781);
    			add_location(title, file$1, 65, 6, 1925);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$1, 73, 6, 2133);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$1, 64, 4, 1859);
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--loading", true);
    			toggle_class(div, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div, file$1, 53, 2, 1479);
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
    					if_block = create_if_block_2$1(ctx);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if withOverlay}
    function create_if_block$1(ctx) {
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
    	let if_block = /*small*/ ctx[0] && create_if_block_1$1(ctx);
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
    			add_location(label, file$1, 34, 6, 933);
    			add_location(title, file$1, 36, 8, 1081);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$1, 44, 8, 1305);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$1, 35, 6, 1013);
    			attr_dev(div0, "aria-atomic", "true");
    			attr_dev(div0, "aria-labelledby", /*id*/ ctx[4]);
    			attr_dev(div0, "aria-live", div0_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off');
    			toggle_class(div0, "bx--loading", true);
    			toggle_class(div0, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div0, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div0, file$1, 25, 4, 634);
    			set_attributes(div1, div1_data);
    			toggle_class(div1, "bx--loading-overlay", true);
    			toggle_class(div1, "bx--loading-overlay--stop", !/*active*/ ctx[1]);
    			add_location(div1, file$1, 20, 2, 513);
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
    					if_block = create_if_block_1$1(ctx);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:0) {#if withOverlay}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if small}
    function create_if_block_2$1(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__background", true);
    			add_location(circle, file$1, 67, 8, 1980);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(67:6) {#if small}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if small}
    function create_if_block_1$1(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__background", true);
    			add_location(circle, file$1, 38, 10, 1140);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(38:8) {#if small}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*withOverlay*/ ctx[2]) return create_if_block$1;
    		return create_else_block$1;
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
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
    			id: create_fragment$1.name
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

    /* src\EditDocSignature.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;
    const file = "src\\EditDocSignature.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[24] = list;
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    // (227:0) {#if data}
    function create_if_block(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t10;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t12;
    	let th1;
    	let t14;
    	let th2;
    	let t16;
    	let th3;
    	let t18;
    	let th4;
    	let t20;
    	let th5;
    	let t22;
    	let tbody;
    	let t23;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[0].items;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function select_block_type_1(ctx, dirty) {
    		if (/*saveing*/ ctx[4]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "סיכום עיסקה";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "שם הלקוח";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "סטטוס";
    			t6 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "טיוטה";
    			option1 = element("option");
    			option1.textContent = "פומבי";
    			option2 = element("option");
    			option2.textContent = "נחתם";
    			t10 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "תמונה";
    			t12 = space();
    			th1 = element("th");
    			th1.textContent = "שם";
    			t14 = space();
    			th2 = element("th");
    			th2.textContent = "כמות כוללת";
    			t16 = space();
    			th3 = element("th");
    			th3.textContent = "מחיר ליח";
    			t18 = space();
    			th4 = element("th");
    			th4.textContent = "תיאור";
    			t20 = space();
    			th5 = element("th");
    			th5.textContent = "פירוט";
    			t22 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t23 = space();
    			button = element("button");
    			if_block.c();
    			attr_dev(h1, "class", "svelte-1ysyw1");
    			add_location(h1, file, 228, 4, 6047);
    			attr_dev(label0, "for", "client_name");
    			attr_dev(label0, "class", "svelte-1ysyw1");
    			add_location(label0, file, 231, 8, 6113);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "client_name");
    			attr_dev(input, "id", "client_name");
    			attr_dev(input, "class", "svelte-1ysyw1");
    			add_location(input, file, 232, 8, 6163);
    			attr_dev(div0, "class", "svelte-1ysyw1");
    			add_location(div0, file, 230, 6, 6099);
    			attr_dev(label1, "for", "status");
    			attr_dev(label1, "class", "svelte-1ysyw1");
    			add_location(label1, file, 240, 8, 6332);
    			option0.__value = "Draft";
    			option0.value = option0.__value;
    			add_location(option0, file, 242, 10, 6444);
    			option1.__value = "Published";
    			option1.value = option1.__value;
    			add_location(option1, file, 243, 10, 6491);
    			option2.__value = "Signed";
    			option2.value = option2.__value;
    			add_location(option2, file, 244, 10, 6542);
    			attr_dev(select, "name", "status");
    			attr_dev(select, "id", "status");
    			if (/*data*/ ctx[0].status === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file, 241, 8, 6374);
    			attr_dev(div1, "class", "svelte-1ysyw1");
    			add_location(div1, file, 239, 6, 6318);
    			attr_dev(th0, "class", "svelte-1ysyw1");
    			add_location(th0, file, 250, 12, 6681);
    			attr_dev(th1, "class", "svelte-1ysyw1");
    			add_location(th1, file, 251, 12, 6710);
    			attr_dev(th2, "class", "svelte-1ysyw1");
    			add_location(th2, file, 252, 12, 6736);
    			attr_dev(th3, "class", "svelte-1ysyw1");
    			add_location(th3, file, 253, 12, 6770);
    			attr_dev(th4, "class", "svelte-1ysyw1");
    			add_location(th4, file, 254, 12, 6802);
    			attr_dev(th5, "class", "svelte-1ysyw1");
    			add_location(th5, file, 255, 12, 6831);
    			attr_dev(tr, "class", "svelte-1ysyw1");
    			add_location(tr, file, 249, 10, 6664);
    			attr_dev(thead, "class", "svelte-1ysyw1");
    			add_location(thead, file, 248, 8, 6646);
    			attr_dev(tbody, "class", "svelte-1ysyw1");
    			add_location(tbody, file, 258, 8, 6889);
    			attr_dev(table, "class", "items svelte-1ysyw1");
    			add_location(table, file, 247, 6, 6616);
    			attr_dev(form, "action", "POST");
    			attr_dev(form, "class", "svelte-1ysyw1");
    			add_location(form, file, 229, 4, 6072);
    			button.disabled = /*saveing*/ ctx[4];
    			attr_dev(button, "class", "submit-btn svelte-1ysyw1");
    			add_location(button, file, 564, 4, 20018);
    			attr_dev(main, "class", "svelte-1ysyw1");
    			add_location(main, file, 227, 2, 6036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input);
    			set_input_value(input, /*data*/ ctx[0].client_name);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*data*/ ctx[0].status);
    			append_dev(form, t10);
    			append_dev(form, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t12);
    			append_dev(tr, th1);
    			append_dev(tr, t14);
    			append_dev(tr, th2);
    			append_dev(tr, t16);
    			append_dev(tr, th3);
    			append_dev(tr, t18);
    			append_dev(tr, th4);
    			append_dev(tr, t20);
    			append_dev(tr, th5);
    			append_dev(table, t22);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(main, t23);
    			append_dev(main, button);
    			if_block.m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[10]),
    					listen_dev(button, "click", /*submit_btn_clicked*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*data*/ 1 && input.value !== /*data*/ ctx[0].client_name) {
    				set_input_value(input, /*data*/ ctx[0].client_name);
    			}

    			if (dirty[0] & /*data*/ 1) {
    				select_option(select, /*data*/ ctx[0].status);
    			}

    			if (dirty[0] & /*data, ALL_SIZES, ALL_COLORS, ALL_VARIENTS, handleQuantityChange, handleImageUpload*/ 111) {
    				each_value = /*data*/ ctx[0].items;
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

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (!current || dirty[0] & /*saveing*/ 16) {
    				prop_dev(button, "disabled", /*saveing*/ ctx[4]);
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
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(227:0) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (325:18) {#if item?.edit_description}
    function create_if_block_5(ctx) {
    	let div;
    	let textarea;
    	let textarea_id_value;
    	let t;
    	let mounted;
    	let dispose;

    	function textarea_input_handler() {
    		/*textarea_input_handler*/ ctx[13].call(textarea, /*each_value*/ ctx[24], /*item_index*/ ctx[25]);
    	}

    	function blur_handler() {
    		return /*blur_handler*/ ctx[14](/*item*/ ctx[23], /*each_value*/ ctx[24], /*item_index*/ ctx[25]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			textarea = element("textarea");
    			t = text("\n                      \n                      >");
    			attr_dev(textarea, "id", textarea_id_value = "description-" + /*item*/ ctx[23].id);
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "class", "svelte-1ysyw1");
    			add_location(textarea, file, 326, 22, 9196);
    			attr_dev(div, "class", "editing-wraper svelte-1ysyw1");
    			add_location(div, file, 325, 20, 9145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*item*/ ctx[23].description);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", textarea_input_handler),
    					listen_dev(textarea, "blur", blur_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data*/ 1 && textarea_id_value !== (textarea_id_value = "description-" + /*item*/ ctx[23].id)) {
    				attr_dev(textarea, "id", textarea_id_value);
    			}

    			if (dirty[0] & /*data*/ 1) {
    				set_input_value(textarea, /*item*/ ctx[23].description);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(325:18) {#if item?.edit_description}",
    		ctx
    	});

    	return block;
    }

    // (360:18) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/static/hidden-icon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "height", "50px");
    			attr_dev(img, "class", "svelte-1ysyw1");
    			add_location(img, file, 360, 20, 10515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(360:18) {:else}",
    		ctx
    	});

    	return block;
    }

    // (354:18) {#if item.show_details}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/static/shown-icon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "height", "50px");
    			attr_dev(img, "class", "svelte-1ysyw1");
    			add_location(img, file, 354, 20, 10319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(354:18) {#if item.show_details}",
    		ctx
    	});

    	return block;
    }

    // (374:16) {#if item.details_pivot}
    function create_if_block_2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th;
    	let t1;
    	let t2;
    	let tbody;
    	let t3;
    	let if_block_anchor;
    	let each_value_7 = /*item*/ ctx[23].details_pivot["sizes"];
    	validate_each_argument(each_value_7);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_1[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	let each_value_4 = /*item*/ ctx[23].details_pivot["colors"];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let if_block = /*ALL_COLORS*/ ctx[2] && /*ALL_SIZES*/ ctx[1] && /*ALL_VARIENTS*/ ctx[3] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "צבע / מודל";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(th, "colspan", "2");
    			attr_dev(th, "class", "svelte-1ysyw1");
    			add_location(th, file, 377, 24, 11045);
    			attr_dev(tr, "class", "svelte-1ysyw1");
    			add_location(tr, file, 376, 22, 11016);
    			attr_dev(thead, "class", "svelte-1ysyw1");
    			add_location(thead, file, 375, 20, 10986);
    			attr_dev(tbody, "class", "svelte-1ysyw1");
    			add_location(tbody, file, 385, 20, 11396);
    			attr_dev(table, "class", "details svelte-1ysyw1");
    			add_location(table, file, 374, 18, 10942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t2);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_SIZES, data*/ 3) {
    				each_value_7 = /*item*/ ctx[23].details_pivot["sizes"];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_7(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_7.length;
    			}

    			if (dirty[0] & /*data, handleQuantityChange*/ 33) {
    				each_value_4 = /*item*/ ctx[23].details_pivot["colors"];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (/*ALL_COLORS*/ ctx[2] && /*ALL_SIZES*/ ctx[1] && /*ALL_VARIENTS*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(374:16) {#if item.details_pivot}",
    		ctx
    	});

    	return block;
    }

    // (379:24) {#each item.details_pivot["sizes"] as size_id}
    function create_each_block_7(ctx) {
    	let th;
    	let t_value = /*ALL_SIZES*/ ctx[1].find(func_1)?.size + "";
    	let t;

    	function func_1(...args) {
    		return /*func_1*/ ctx[17](/*size_id*/ ctx[40], ...args);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "class", "svelte-1ysyw1");
    			add_location(th, file, 379, 26, 11175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*ALL_SIZES, data*/ 3 && t_value !== (t_value = /*ALL_SIZES*/ ctx[1].find(func_1)?.size + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(379:24) {#each item.details_pivot[\\\"sizes\\\"] as size_id}",
    		ctx
    	});

    	return block;
    }

    // (398:28) {#each item.details_pivot["sizes"] as size_id}
    function create_each_block_6(ctx) {
    	let td;
    	let input;
    	let input_value_value;
    	let input_data_color_value;
    	let input_data_size_value;
    	let input_data_varient_value;
    	let input_data_item_value;
    	let mounted;
    	let dispose;

    	function func_4(...args) {
    		return /*func_4*/ ctx[20](/*color_id*/ ctx[35], /*size_id*/ ctx[40], /*varient*/ ctx[26], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "step", "1");
    			input.value = input_value_value = /*item*/ ctx[23].details.find(func_4)?.quantity || "";
    			attr_dev(input, "data-color", input_data_color_value = /*color_id*/ ctx[35]);
    			attr_dev(input, "data-size", input_data_size_value = /*size_id*/ ctx[40]);
    			attr_dev(input, "data-varient", input_data_varient_value = /*varient*/ ctx[26]);
    			attr_dev(input, "data-item", input_data_item_value = /*item*/ ctx[23].name);
    			attr_dev(input, "class", "svelte-1ysyw1");
    			add_location(input, file, 400, 32, 12263);
    			attr_dev(td, "class", "svelte-1ysyw1");
    			add_location(td, file, 398, 30, 12079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*handleQuantityChange*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data*/ 1 && input_value_value !== (input_value_value = /*item*/ ctx[23].details.find(func_4)?.quantity || "") && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*data*/ 1 && input_data_color_value !== (input_data_color_value = /*color_id*/ ctx[35])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*data*/ 1 && input_data_size_value !== (input_data_size_value = /*size_id*/ ctx[40])) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*data*/ 1 && input_data_varient_value !== (input_data_varient_value = /*varient*/ ctx[26])) {
    				attr_dev(input, "data-varient", input_data_varient_value);
    			}

    			if (dirty[0] & /*data*/ 1 && input_data_item_value !== (input_data_item_value = /*item*/ ctx[23].name)) {
    				attr_dev(input, "data-item", input_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(398:28) {#each item.details_pivot[\\\"sizes\\\"] as size_id}",
    		ctx
    	});

    	return block;
    }

    // (388:24) {#each item.details_pivot["varients"] as varient}
    function create_each_block_5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*item*/ ctx[23].details.find(func_2).color_name + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = (/*item*/ ctx[23].details.find(func_3)?.varient_name || "") + "";
    	let t2;
    	let t3;

    	function func_2(...args) {
    		return /*func_2*/ ctx[18](/*color_id*/ ctx[35], ...args);
    	}

    	function func_3(...args) {
    		return /*func_3*/ ctx[19](/*varient*/ ctx[26], ...args);
    	}

    	let each_value_6 = /*item*/ ctx[23].details_pivot["sizes"];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(td0, "class", "svelte-1ysyw1");
    			add_location(td0, file, 389, 28, 11608);
    			attr_dev(td1, "class", "svelte-1ysyw1");
    			add_location(td1, file, 393, 28, 11800);
    			attr_dev(tr, "class", "svelte-1ysyw1");
    			add_location(tr, file, 388, 26, 11575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*data*/ 1 && t0_value !== (t0_value = /*item*/ ctx[23].details.find(func_2).color_name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*data*/ 1 && t2_value !== (t2_value = (/*item*/ ctx[23].details.find(func_3)?.varient_name || "") + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*data, handleQuantityChange*/ 33) {
    				each_value_6 = /*item*/ ctx[23].details_pivot["sizes"];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(388:24) {#each item.details_pivot[\\\"varients\\\"] as varient}",
    		ctx
    	});

    	return block;
    }

    // (387:22) {#each item.details_pivot["colors"] as color_id}
    function create_each_block_4(ctx) {
    	let t;
    	let each_value_5 = /*item*/ ctx[23].details_pivot["varients"];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*data, handleQuantityChange*/ 33) {
    				each_value_5 = /*item*/ ctx[23].details_pivot["varients"];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(387:22) {#each item.details_pivot[\\\"colors\\\"] as color_id}",
    		ctx
    	});

    	return block;
    }

    // (446:18) {#if ALL_COLORS && ALL_SIZES && ALL_VARIENTS}
    function create_if_block_3(ctx) {
    	let div;
    	let select0;
    	let option0;
    	let t1;
    	let select1;
    	let option1;
    	let t3;
    	let select2;
    	let option2;
    	let t5;
    	let input;
    	let t6;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*ALL_COLORS*/ ctx[2];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*ALL_SIZES*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*ALL_VARIENTS*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[21](/*item*/ ctx[23], /*each_value*/ ctx[24], /*item_index*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "בחר צבע";

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "בחר מידה";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			select2 = element("select");
    			option2 = element("option");
    			option2.textContent = "בחר מודל";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			input = element("input");
    			t6 = space();
    			button = element("button");
    			button.textContent = "הוסף פריט חדש";
    			option0.__value = "";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-1ysyw1");
    			add_location(option0, file, 448, 24, 14575);
    			attr_dev(select0, "class", "color-select svelte-1ysyw1");
    			add_location(select0, file, 447, 22, 14521);
    			option1.__value = "";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-1ysyw1");
    			add_location(option1, file, 454, 24, 14873);
    			attr_dev(select1, "class", "size-select svelte-1ysyw1");
    			add_location(select1, file, 453, 22, 14820);
    			option2.__value = "";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-1ysyw1");
    			add_location(option2, file, 460, 24, 15171);
    			attr_dev(select2, "class", "varient-select svelte-1ysyw1");
    			add_location(select2, file, 459, 22, 15115);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "step", "1");
    			input.value = "";
    			attr_dev(input, "class", "quantity-input svelte-1ysyw1");
    			add_location(input, file, 466, 22, 15426);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-1ysyw1");
    			add_location(button, file, 473, 22, 15632);
    			attr_dev(div, "class", "add-new-detail svelte-1ysyw1");
    			add_location(div, file, 446, 20, 14470);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			append_dev(div, t1);
    			append_dev(div, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, select2);
    			append_dev(select2, option2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			append_dev(div, t5);
    			append_dev(div, input);
    			append_dev(div, t6);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*ALL_COLORS*/ 4) {
    				each_value_3 = /*ALL_COLORS*/ ctx[2];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty[0] & /*ALL_SIZES*/ 2) {
    				each_value_2 = /*ALL_SIZES*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*ALL_VARIENTS*/ 8) {
    				each_value_1 = /*ALL_VARIENTS*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(446:18) {#if ALL_COLORS && ALL_SIZES && ALL_VARIENTS}",
    		ctx
    	});

    	return block;
    }

    // (450:24) {#each ALL_COLORS as color}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*color*/ ctx[32].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*color*/ ctx[32].id;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1ysyw1");
    			add_location(option, file, 450, 26, 14687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_COLORS*/ 4 && t_value !== (t_value = /*color*/ ctx[32].name + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_COLORS*/ 4 && option_value_value !== (option_value_value = /*color*/ ctx[32].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(450:24) {#each ALL_COLORS as color}",
    		ctx
    	});

    	return block;
    }

    // (456:24) {#each ALL_SIZES as size}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*size*/ ctx[29].size + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*size*/ ctx[29].id;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1ysyw1");
    			add_location(option, file, 456, 26, 14984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_SIZES*/ 2 && t_value !== (t_value = /*size*/ ctx[29].size + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_SIZES*/ 2 && option_value_value !== (option_value_value = /*size*/ ctx[29].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(456:24) {#each ALL_SIZES as size}",
    		ctx
    	});

    	return block;
    }

    // (462:24) {#each ALL_VARIENTS as varient}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*varient*/ ctx[26].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*varient*/ ctx[26].id;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1ysyw1");
    			add_location(option, file, 462, 26, 15288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_VARIENTS*/ 8 && t_value !== (t_value = /*varient*/ ctx[26].name + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_VARIENTS*/ 8 && option_value_value !== (option_value_value = /*varient*/ ctx[26].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(462:24) {#each ALL_VARIENTS as varient}",
    		ctx
    	});

    	return block;
    }

    // (260:10) {#each data.items as item}
    function create_each_block(ctx) {
    	let tr0;
    	let td0;
    	let input0;
    	let input0_id_value;
    	let input0_data_item_value;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let td1;
    	let input1;
    	let t2;
    	let td2;
    	let t3_value = /*item*/ ctx[23].details.reduce(func, 0) + "";
    	let t3;
    	let t4;
    	let td3;
    	let t5_value = /*item*/ ctx[23].price + "";
    	let t5;
    	let t6;
    	let t7;
    	let td4;
    	let div;
    	let sveltemarkdown;
    	let t8;
    	let t9;
    	let td5;
    	let button;
    	let t10;
    	let td6;
    	let t11;
    	let tr1;
    	let current;
    	let mounted;
    	let dispose;

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[11].call(input1, /*each_value*/ ctx[24], /*item_index*/ ctx[25]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[12](/*item*/ ctx[23], /*each_value*/ ctx[24], /*item_index*/ ctx[25], ...args);
    	}

    	sveltemarkdown = new SvelteMarkdown({
    			props: { source: /*item*/ ctx[23].description },
    			$$inline: true
    		});

    	let if_block0 = /*item*/ ctx[23]?.edit_description && create_if_block_5(ctx);

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*item*/ ctx[23], /*each_value*/ ctx[24], /*item_index*/ ctx[25]);
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[23].show_details) return create_if_block_4;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[16](/*item*/ ctx[23], /*each_value*/ ctx[24], /*item_index*/ ctx[25]);
    	}

    	let if_block2 = /*item*/ ctx[23].details_pivot && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td3 = element("td");
    			t5 = text(t5_value);
    			t6 = text("₪");
    			t7 = space();
    			td4 = element("td");
    			div = element("div");
    			create_component(sveltemarkdown.$$.fragment);
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			td5 = element("td");
    			button = element("button");
    			if_block1.c();
    			t10 = space();
    			td6 = element("td");
    			if (if_block2) if_block2.c();
    			t11 = space();
    			tr1 = element("tr");
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "id", input0_id_value = "selectedFile-" + /*item*/ ctx[23].id);
    			set_style(input0, "display", "none");
    			attr_dev(input0, "data-item", input0_data_item_value = /*item*/ ctx[23].id);
    			attr_dev(input0, "class", "svelte-1ysyw1");
    			add_location(input0, file, 266, 16, 7125);
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "height", "50px");
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[23].cimage)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[23].name);
    			attr_dev(img, "class", "svelte-1ysyw1");
    			add_location(img, file, 273, 16, 7370);
    			attr_dev(td0, "class", "svelte-1ysyw1");
    			add_location(td0, file, 261, 14, 6965);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-1ysyw1");
    			add_location(input1, file, 281, 16, 7582);
    			attr_dev(td1, "class", "svelte-1ysyw1");
    			add_location(td1, file, 280, 14, 7561);
    			attr_dev(td2, "class", "svelte-1ysyw1");
    			add_location(td2, file, 284, 14, 7662);
    			attr_dev(td3, "class", "svelte-1ysyw1");
    			add_location(td3, file, 290, 14, 7843);
    			attr_dev(div, "class", "description-wraper svelte-1ysyw1");
    			add_location(div, file, 322, 16, 8982);
    			attr_dev(td4, "class", "description-td svelte-1ysyw1");
    			toggle_class(td4, "editing", /*item*/ ctx[23].edit_description);
    			add_location(td4, file, 301, 14, 8203);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-1ysyw1");
    			add_location(button, file, 349, 16, 10123);
    			attr_dev(td5, "class", "borderless svelte-1ysyw1");
    			attr_dev(td5, "colspan", "2");
    			add_location(td5, file, 347, 14, 9994);
    			attr_dev(td6, "colspan", "3");
    			attr_dev(td6, "class", "details-td svelte-1ysyw1");
    			toggle_class(td6, "blured", !/*item*/ ctx[23].show_details);
    			add_location(td6, file, 368, 14, 10750);
    			attr_dev(tr0, "class", "svelte-1ysyw1");
    			add_location(tr0, file, 260, 12, 6946);
    			attr_dev(tr1, "class", "details-tr svelte-1ysyw1");
    			add_location(tr1, file, 559, 12, 19926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			append_dev(td0, t0);
    			append_dev(td0, img);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*item*/ ctx[23].name);
    			append_dev(tr0, t2);
    			append_dev(tr0, td2);
    			append_dev(td2, t3);
    			append_dev(tr0, t4);
    			append_dev(tr0, td3);
    			append_dev(td3, t5);
    			append_dev(td3, t6);
    			append_dev(tr0, t7);
    			append_dev(tr0, td4);
    			append_dev(td4, div);
    			mount_component(sveltemarkdown, div, null);
    			append_dev(div, t8);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(tr0, t9);
    			append_dev(tr0, td5);
    			append_dev(td5, button);
    			if_block1.m(button, null);
    			append_dev(tr0, t10);
    			append_dev(tr0, td6);
    			if (if_block2) if_block2.m(td6, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tr1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*handleImageUpload*/ ctx[6], false, false, false),
    					listen_dev(
    						td0,
    						"click",
    						function () {
    							if (is_function(document.querySelector(`#selectedFile-${/*item*/ ctx[23].id}`).click())) document.querySelector(`#selectedFile-${/*item*/ ctx[23].id}`).click().apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(td3, "click", click_handler, false, false, false),
    					listen_dev(td4, "click", click_handler_1, false, false, false),
    					listen_dev(button, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*data*/ 1 && input0_id_value !== (input0_id_value = "selectedFile-" + /*item*/ ctx[23].id)) {
    				attr_dev(input0, "id", input0_id_value);
    			}

    			if (!current || dirty[0] & /*data*/ 1 && input0_data_item_value !== (input0_data_item_value = /*item*/ ctx[23].id)) {
    				attr_dev(input0, "data-item", input0_data_item_value);
    			}

    			if (!current || dirty[0] & /*data*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[23].cimage)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*data*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[23].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*data*/ 1 && input1.value !== /*item*/ ctx[23].name) {
    				set_input_value(input1, /*item*/ ctx[23].name);
    			}

    			if ((!current || dirty[0] & /*data*/ 1) && t3_value !== (t3_value = /*item*/ ctx[23].details.reduce(func, 0) + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*data*/ 1) && t5_value !== (t5_value = /*item*/ ctx[23].price + "")) set_data_dev(t5, t5_value);
    			const sveltemarkdown_changes = {};
    			if (dirty[0] & /*data*/ 1) sveltemarkdown_changes.source = /*item*/ ctx[23].description;
    			sveltemarkdown.$set(sveltemarkdown_changes);

    			if (/*item*/ ctx[23]?.edit_description) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(td4, "editing", /*item*/ ctx[23].edit_description);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button, null);
    				}
    			}

    			if (/*item*/ ctx[23].details_pivot) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(td6, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(td6, "blured", !/*item*/ ctx[23].show_details);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sveltemarkdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sveltemarkdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			destroy_component(sveltemarkdown);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tr1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(260:10) {#each data.items as item}",
    		ctx
    	});

    	return block;
    }

    // (568:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("שמירה");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(568:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (566:6) {#if saveing}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("שומר...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(566:6) {#if saveing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*data*/ ctx[0] && create_if_block(ctx);

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*data*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    const func = (acc, detail) => acc + (detail.quantity || 0);

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditDocSignature', slots, []);
    	let { uuid } = $$props;
    	let ALL_SIZES, ALL_COLORS, ALL_VARIENTS;
    	let data;
    	let saveing = false;

    	onMount(async () => {
    		// request api-edit-doc-signature/<uuid:uuid>
    		/**
     * {
          "uuid": "6584772a-71de-466e-95e5-1d4b7e335549",
          "client_name": "שי גארדן",
          "status": "Draft",
          "items": [
          {
          "name": "דגמ\"ח 7 כיסים מחוזק",
          "description": "* דגמ\"ח איכותי 100% כותנה\r\n*  7 כיסים כולל כיס רוכסן\r\n* מתאים לכל סוגי העבודה",
          "cimage": "https://res.cloudinary.com/ms-global/image/upload/v1660551503/site/products/photo_2022-08-15_09-49-15-removebg-preview",
          "price": "50.00",
          "show_details": true,
          "details": [
          {
          "quantity": 1,
          "color_id": 77,
          "color_name": "שחור",
          "size_id": 104,
          "size_code": "ak",
          "size_name": "46",
          "varient_id": 12,
          "varient_name": "עם גומי"
          },
          {
          "quantity": 1,
          "color_id": 81,
          "color_name": "אפור כהה",
          "size_id": 104,
          "size_code": "ak",
          "size_name": "46",
          "varient_id": 12,
          "varient_name": "עם גומי"
          }
          ]
          },
          {
          "name": "מגף איגל",
          "description": "* עור מעובד איכותי וייצוגי\r\n* אפשרות לרמות הגנה שונות\r\n* 02 -- נעל קלה עם תפרים מחוזקים מתאימה לכל סוגי העבודות \r\n* S3 – כיפת מגן מברזל, שכבת נירוסטה לאורך הסוליה",
          "cimage": "https://res.cloudinary.com/ms-global/image/upload/v1635672269/site/products/%D7%9E%D7%92%D7%A3_%D7%90%D7%99%D7%92%D7%9C_DMqWwOX_Mkw9lcY_BvEiz4P_Cjtf4wS_sK7Cy0d_sgRVKb3.png",
          "price": "100.00",
          "show_details": true,
          "details": [
          {
          "quantity": 1,
          "color_id": 77,
          "color_name": "שחור",
          "size_id": 105,
          "size_code": "al",
          "size_name": "47",
          "varient_id": 1,
          "varient_name": "02"
          }
          ]
          }
          ]
          }
    */
    		let tempData = await fetch_wraper(`${API_EDIT_DOC_SIGNATURE}/${uuid}`, {
    			method: "GET",
    			headers: { "Content-Type": "application/json" }
    		});

    		$$invalidate(1, ALL_SIZES = await apiGetAllSizes());

    		apiGetAllColors().then(res => {
    			$$invalidate(2, ALL_COLORS = res);
    		});

    		apiGetAllVariants().then(res => {
    			$$invalidate(3, ALL_VARIENTS = res);
    		});

    		tempData.items.forEach(item => {
    			item.details_pivot = create_pivot_table(item.details);
    		});

    		$$invalidate(0, data = tempData);
    	});

    	function create_pivot_table(details) {
    		console.log("create_pivot_table", details);

    		/*data = {{
          "quantity": 1,
          "color_id": 77,
          "color_name": "שחור",
          "size_id": 104,
          "size_code": "ak",
          "size_name": "46",
          "varient_id": 12,
          "varient_name": "עם גומי"
          },
          {
          "quantity": 1,
          "color_id": 81,
          "color_name": "אפור כהה",
          "size_id": 104,
          "size_code": "ak",
          "size_name": "46",
          "varient_id": 12,
          "varient_name": "עם גומי"
          }}*/
    		let pivot_table = {};

    		/*
    example output table:
          color | varient   | 45
          שחור | עם גומי | 1
          אפור כהה | עם גומי | 1
      */
    		console.log(details);

    		let sizes_set = new Set();
    		let colors_set = new Set();
    		let varients_set = new Set();

    		details.forEach(detail => {
    			sizes_set.add(detail.size_id);
    			colors_set.add(detail.color_id);
    			varients_set.add(detail.varient_id);
    		});

    		let sizes = Array.from(sizes_set);

    		// order sizes by size.code
    		sizes.sort((a, b) => {
    			let size_a = ALL_SIZES.find(size => size.id === a);
    			let size_b = ALL_SIZES.find(size => size.id === b);
    			return size_b.code.localeCompare(size_a.code);
    		});

    		let colors = Array.from(colors_set);
    		let varients = Array.from(varients_set);
    		pivot_table["sizes"] = sizes;
    		pivot_table["colors"] = colors;
    		pivot_table["varients"] = varients;
    		return pivot_table;
    	}

    	function handleQuantityChange(e) {
    		let quantity = e.target.value;
    		let color_id = e.target.dataset.color;
    		let size_id = e.target.dataset.size;
    		let varient_id = e.target.dataset.varient;
    		let item_name = e.target.dataset.item;
    		let item = data.items.find(item => item.name === item_name);
    		console.log("looking for details", color_id, size_id, varient_id, " in ", item.details);
    		let detail = item.details.find(detail => detail.color_id == color_id && detail.size_id == size_id && detail.varient_id == varient_id);
    		quantity = parseFloat(quantity);
    		detail.quantity = quantity;
    		$$invalidate(0, data = { ...data });
    	}

    	function handleImageUpload(e) {
    		let file = e.target.files[0];
    		let reader = new FileReader();
    		let item_id = e.target.dataset.item;
    		let item = data.items.find(item => item.id == item_id);

    		reader.onload = function (e) {
    			let image = e.target.result;
    			item.cimage = image;
    			console.log("image", image);
    			$$invalidate(0, data = { ...data });
    		};

    		reader.readAsDataURL(file);
    	}

    	function submit_btn_clicked(e) {
    		$$invalidate(4, saveing = true);

    		// e.preventDefault();
    		console.log("submitting data", data);

    		fetch_wraper(`${API_EDIT_DOC_SIGNATURE}/${uuid}`, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(data)
    		}).then(res => {
    			$$invalidate(4, saveing = false);
    			debugger;

    			if (res.status === "ok") {
    				//reload
    				window.location.reload();
    			} else {
    				alert("המסמך לא נשמר בהצלחה");
    			}
    		}); // if (res.status === 200) {
    		//   alert("המסמך נשמר בהצלחה");
    		// } else {
    		//   alert("התרחשה שגיאה בשמירת המסמך");
    	} // }

    	const writable_props = ['uuid'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<EditDocSignature> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		data.client_name = this.value;
    		$$invalidate(0, data);
    	}

    	function select_change_handler() {
    		data.status = select_value(this);
    		$$invalidate(0, data);
    	}

    	function input1_input_handler(each_value, item_index) {
    		each_value[item_index].name = this.value;
    		$$invalidate(0, data);
    	}

    	const click_handler = (item, each_value, item_index, e) => {
    		// prompt to change price
    		let new_price = prompt("הכנס מחיר חדש", item.price);

    		if (new_price != null) {
    			$$invalidate(0, each_value[item_index].price = new_price, data);
    		}
    	};

    	function textarea_input_handler(each_value, item_index) {
    		each_value[item_index].description = this.value;
    		$$invalidate(0, data);
    	}

    	const blur_handler = (item, each_value, item_index) => {
    		$$invalidate(0, each_value[item_index].edit_description = false, data);
    		$$invalidate(0, each_value[item_index].edit_description_timestamp = Date.now(), data);
    	};

    	const click_handler_1 = (item, each_value, item_index) => {
    		if (item.edit_description == undefined || item.edit_description == false) {
    			if (item.edit_description_timestamp && Date.now() - item.edit_description_timestamp < 150) ; else {
    				$$invalidate(0, each_value[item_index].edit_description = true, data);
    			}
    		}

    		setTimeout(
    			() => {
    				document.querySelector(`#description-${item.id}`).focus();
    			},
    			0
    		);
    	};

    	const click_handler_2 = (item, each_value, item_index) => $$invalidate(0, each_value[item_index].show_details = !item.show_details, data);
    	const func_1 = (size_id, v) => v.id == size_id;
    	const func_2 = (color_id, v) => v.color_id == color_id;
    	const func_3 = (varient, v) => v.varient_id == varient;
    	const func_4 = (color_id, size_id, varient, v) => v.color_id == color_id && v.size_id == size_id && v.varient_id == varient;

    	const click_handler_3 = (item, each_value, item_index, e) => {
    		// get the closest .color-select and .size-select and .varient-select
    		const color_select = e.target.closest(".add-new-detail").querySelector(".color-select");

    		const varient_select = e.target.closest(".add-new-detail").querySelector(".varient-select");
    		const size_select = e.target.closest(".add-new-detail").querySelector(".size-select");

    		// get the value of the selected option
    		const color_id = color_select.value;

    		const varient_id = varient_select.value;
    		const size_id = size_select.value;

    		// if color is not selected, or size is not selected alert the user and return
    		if (!color_id || !size_id) {
    			alert("יש לבחור צבע ומידה");
    			return;
    		}

    		// get the closest .quantity-input
    		const quantity_input = e.target.closest(".add-new-detail").querySelector(".quantity-input");

    		// get the value of the input
    		const quantity = quantity_input.value;

    		// if quantity is not a number, alert the user and return
    		if (isNaN(quantity)) {
    			alert("יש להזין מספר");
    			return;
    		}

    		// if the detail already exists, update the quantity
    		if (item.details.find(v => v.color_id == color_id && v.size_id == size_id && v.varient_id == varient_id)) {
    			item.details.find(v => v.color_id == color_id && v.size_id == size_id && v.varient_id == varient_id).quantity += quantity;
    		} else {
    			//color_id :  81 color_name :  "אפור כהה" id :  98 quantity :  1 size_code :  "ak" size_id :  104 size_name :  "46" varient_id :  12 varient_name :  "עם גומי"
    			// add the new detail to the item
    			debugger;

    			const curr_size = ALL_SIZES.find(v => v.id == size_id);
    			const curr_color = ALL_COLORS.find(v => v.id == color_id);
    			const curr_varient = ALL_VARIENTS.find(v => v.id == varient_id);

    			item.details.push({
    				id: null,
    				color_id: parseInt(color_id),
    				color_name: curr_color.name,
    				size_id: parseInt(size_id),
    				size_name: curr_size.size,
    				size_code: curr_size.code,
    				varient_id: parseInt(varient_id),
    				varient_name: curr_varient?.name,
    				quantity: parseInt(quantity)
    			});
    		}

    		$$invalidate(0, each_value[item_index].details = [...item.details], data);
    	};

    	$$self.$$set = $$props => {
    		if ('uuid' in $$props) $$invalidate(8, uuid = $$props.uuid);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		apiGetAllColors,
    		apiGetAllSizes,
    		apiGetAllVariants,
    		fetch_wraper,
    		API_EDIT_DOC_SIGNATURE,
    		SvelteMarkdown,
    		Loading: Loading$1,
    		uuid,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VARIENTS,
    		data,
    		saveing,
    		create_pivot_table,
    		handleQuantityChange,
    		handleImageUpload,
    		submit_btn_clicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('uuid' in $$props) $$invalidate(8, uuid = $$props.uuid);
    		if ('ALL_SIZES' in $$props) $$invalidate(1, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(2, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VARIENTS' in $$props) $$invalidate(3, ALL_VARIENTS = $$props.ALL_VARIENTS);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('saveing' in $$props) $$invalidate(4, saveing = $$props.saveing);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*data*/ 1) {
    			{
    				console.log("$:", data?.items);

    				(data?.items || []).forEach(item => {
    					item.details_pivot = create_pivot_table(item.details);
    				});
    			}
    		}
    	};

    	return [
    		data,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VARIENTS,
    		saveing,
    		handleQuantityChange,
    		handleImageUpload,
    		submit_btn_clicked,
    		uuid,
    		input_input_handler,
    		select_change_handler,
    		input1_input_handler,
    		click_handler,
    		textarea_input_handler,
    		blur_handler,
    		click_handler_1,
    		click_handler_2,
    		func_1,
    		func_2,
    		func_3,
    		func_4,
    		click_handler_3
    	];
    }

    class EditDocSignature extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { uuid: 8 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditDocSignature",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*uuid*/ ctx[8] === undefined && !('uuid' in props)) {
    			console_1.warn("<EditDocSignature> was created without expected prop 'uuid'");
    		}
    	}

    	get uuid() {
    		throw new Error("<EditDocSignature>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uuid(value) {
    		throw new Error("<EditDocSignature>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const editDocSignature = new EditDocSignature({
    	target: document.getElementById("editdocsignature-target"),
    	props: JSON.parse(document.getElementById("editdocsignature-props").textContent),
    });

    return editDocSignature;

})();
//# sourceMappingURL=EditDocSignature.js.map
