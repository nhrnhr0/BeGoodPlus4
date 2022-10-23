
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var mymorderedit = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
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
    function to_number(value) {
        return value === '' ? null : +value;
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

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\carbon-components-svelte\src\Button\ButtonSkeleton.svelte generated by Svelte v3.44.3 */

    const file$7 = "node_modules\\carbon-components-svelte\\src\\Button\\ButtonSkeleton.svelte";

    // (41:0) {:else}
    function create_else_block$5(ctx) {
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
    			add_location(div, file$7, 41, 2, 950);
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(41:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if href}
    function create_if_block$6(ctx) {
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
    			add_location(a, file$7, 22, 2, 477);
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(22:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[0]) return create_if_block$6;
    		return create_else_block$5;
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { href: 0, size: 1, small: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonSkeleton",
    			options,
    			id: create_fragment$7.name
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
    const file$6 = "node_modules\\carbon-components-svelte\\src\\Button\\Button.svelte";
    const get_default_slot_changes = dirty => ({ props: dirty[0] & /*buttonProps*/ 512 });
    const get_default_slot_context = ctx => ({ props: /*buttonProps*/ ctx[9] });

    // (169:0) {:else}
    function create_else_block$4(ctx) {
    	let button;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[0] && create_if_block_4$3(ctx);
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
    			add_location(button, file$6, 169, 2, 4570);
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
    					if_block = create_if_block_4$3(ctx);
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
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(169:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (149:28) 
    function create_if_block_2$5(ctx) {
    	let a;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[0] && create_if_block_3$3(ctx);
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
    			add_location(a, file$6, 150, 2, 4187);
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
    					if_block = create_if_block_3$3(ctx);
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
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(149:28) ",
    		ctx
    	});

    	return block;
    }

    // (147:13) 
    function create_if_block_1$5(ctx) {
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(147:13) ",
    		ctx
    	});

    	return block;
    }

    // (136:0) {#if skeleton}
    function create_if_block$5(ctx) {
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(136:0) {#if skeleton}",
    		ctx
    	});

    	return block;
    }

    // (178:4) {#if hasIconOnly}
    function create_if_block_4$3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[4]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$6, 178, 6, 4719);
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
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(178:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    // (159:4) {#if hasIconOnly}
    function create_if_block_3$3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[4]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$6, 159, 6, 4331);
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
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(159:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_if_block_1$5, create_if_block_2$5, create_else_block$4];
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    			instance$6,
    			create_fragment$6,
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
    			id: create_fragment$6.name
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

    const file$5 = "node_modules\\carbon-components-svelte\\src\\Loading\\Loading.svelte";

    // (53:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let label;
    	let t0;
    	let t1;
    	let svg;
    	let title;
    	let t2;
    	let circle;
    	let div_aria_live_value;
    	let if_block = /*small*/ ctx[0] && create_if_block_2$4(ctx);

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
    			add_location(label, file$5, 63, 4, 1781);
    			add_location(title, file$5, 65, 6, 1925);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$5, 73, 6, 2133);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$5, 64, 4, 1859);
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--loading", true);
    			toggle_class(div, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div, file$5, 53, 2, 1479);
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
    					if_block = create_if_block_2$4(ctx);
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if withOverlay}
    function create_if_block$4(ctx) {
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
    	let if_block = /*small*/ ctx[0] && create_if_block_1$4(ctx);
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
    			add_location(label, file$5, 34, 6, 933);
    			add_location(title, file$5, 36, 8, 1081);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$5, 44, 8, 1305);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$5, 35, 6, 1013);
    			attr_dev(div0, "aria-atomic", "true");
    			attr_dev(div0, "aria-labelledby", /*id*/ ctx[4]);
    			attr_dev(div0, "aria-live", div0_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off');
    			toggle_class(div0, "bx--loading", true);
    			toggle_class(div0, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div0, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div0, file$5, 25, 4, 634);
    			set_attributes(div1, div1_data);
    			toggle_class(div1, "bx--loading-overlay", true);
    			toggle_class(div1, "bx--loading-overlay--stop", !/*active*/ ctx[1]);
    			add_location(div1, file$5, 20, 2, 513);
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
    					if_block = create_if_block_1$4(ctx);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(20:0) {#if withOverlay}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if small}
    function create_if_block_2$4(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__background", true);
    			add_location(circle, file$5, 67, 8, 1980);
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
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(67:6) {#if small}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if small}
    function create_if_block_1$4(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__background", true);
    			add_location(circle, file$5, 38, 10, 1140);
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
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(38:8) {#if small}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*withOverlay*/ ctx[2]) return create_if_block$4;
    		return create_else_block$3;
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

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
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
    			id: create_fragment$5.name
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

    const file$4 = "node_modules\\carbon-components-svelte\\src\\Form\\Form.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(form, file$4, 6, 0, 150);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { ref: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$4.name
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ms-global/image/upload/';

    var pathArray = (document.currentScript && document.currentScript.src || new URL('MyMorderEdit.js', document.baseURI).href).split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;
    const BASE_URL =  url; //'https://catalog.boost-pop.com'; //'http://127.0.0.1:8000'; // 
    const SEARCH_API_URL = BASE_URL + '/search';
    const GET_ALL_SIZES_API = BASE_URL + '/client-api/get-all-sizes/';
    const GET_ALL_COLORS_API = BASE_URL + '/client-api/get-all-colors/';
    const GET_ALL_VARIENTS_API = BASE_URL + '/client-api/get-all-variants/';
    const MORDER_GET_API = BASE_URL + '/morders/api-get-order-data';
    const MORDER_EDIT_API = BASE_URL + '/morders/api-edit-order';
    const MORDER_DELETE_PRODUCT = BASE_URL + '/morders/delete-product';

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

    async function apiAddNewProductToMorder(data) {
        const response = await fetch_wraper(`${MORDER_EDIT_API}/add-new-product`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }

    async function apiDeleteMOrderItem(row_id) {
        const response = await fetch_wraper(`${MORDER_DELETE_PRODUCT}/${row_id}`, {
            method: 'DELETE',
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

    function apiSearchProducts(keyword, show_hidden=false) {
        let url = SEARCH_API_URL + '?q=' + encodeURIComponent(keyword);
        if(show_hidden){
            url += '&show_hidden=true';
        }
        return fetch_wraper(url);
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

    const { console: console_1$3 } = globals;
    const file$3 = "src\\MentriesServerTable.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (205:0) {#if ALL_COLORS_DICT && ALL_SIZES_DICT}
    function create_if_block$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*sorted_verients*/ ctx[3].length == 0 && /*sorted_colors*/ ctx[2].length == 1 && /*sorted_sizes*/ ctx[1].length == 1) return create_if_block_1$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(205:0) {#if ALL_COLORS_DICT && ALL_SIZES_DICT}",
    		ctx
    	});

    	return block;
    }

    // (222:2) {:else}
    function create_else_block$2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th;
    	let t1;
    	let t2;
    	let t3;
    	let tbody;
    	let t4;
    	let tfoot;
    	let td0;
    	let t5;
    	let t6;
    	let t7;
    	let td1;
    	let t8_value = /*product*/ ctx[0].entries.reduce(/*func_6*/ ctx[18], 0) + "";
    	let t8;
    	let table_id_value;
    	let if_block0 = /*sorted_verients*/ ctx[3].length != 0 && create_if_block_7$2(ctx);
    	let each_value_6 = /*sorted_sizes*/ ctx[1];
    	validate_each_argument(each_value_6);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_2[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let each_value_1 = /*sorted_colors*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	let if_block1 = /*product*/ ctx[0].verients.length > 0 && create_if_block_2$3(ctx);
    	let each_value = /*sorted_sizes*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "צבע";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			tfoot = element("tfoot");
    			td0 = element("td");
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			td1 = element("td");
    			t8 = text(t8_value);
    			attr_dev(th, "class", "sticky-col const-size-cell svelte-13qct7y");
    			add_location(th, file$3, 225, 10, 6785);
    			attr_dev(tr, "class", "svelte-13qct7y");
    			add_location(tr, file$3, 224, 8, 6770);
    			attr_dev(thead, "class", "svelte-13qct7y");
    			add_location(thead, file$3, 223, 6, 6754);
    			attr_dev(tbody, "class", "svelte-13qct7y");
    			add_location(tbody, file$3, 236, 6, 7096);
    			attr_dev(td0, "class", "svelte-13qct7y");
    			add_location(td0, file$3, 352, 8, 11528);
    			attr_dev(td1, "class", "total-cell full-total svelte-13qct7y");
    			add_location(td1, file$3, 368, 8, 11979);
    			attr_dev(tfoot, "class", "svelte-13qct7y");
    			add_location(tfoot, file$3, 351, 6, 11512);
    			attr_dev(table, "class", "entries-table svelte-13qct7y");
    			attr_dev(table, "id", table_id_value = "entries-table-" + /*product*/ ctx[0].id);
    			add_location(table, file$3, 222, 4, 6686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th);
    			append_dev(tr, t1);
    			if (if_block0) if_block0.m(tr, null);
    			append_dev(tr, t2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(tr, null);
    			}

    			append_dev(table, t3);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody, null);
    			}

    			append_dev(table, t4);
    			append_dev(table, tfoot);
    			append_dev(tfoot, td0);
    			append_dev(tfoot, t5);
    			if (if_block1) if_block1.m(tfoot, null);
    			append_dev(tfoot, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tfoot, null);
    			}

    			append_dev(tfoot, t7);
    			append_dev(tfoot, td1);
    			append_dev(td1, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (/*sorted_verients*/ ctx[3].length != 0) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_7$2(ctx);
    					if_block0.c();
    					if_block0.m(tr, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*sorted_sizes*/ 2) {
    				each_value_6 = /*sorted_sizes*/ ctx[1];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_6(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_6.length;
    			}

    			if (dirty[0] & /*clear_sizes_entries, sorted_colors, product, sorted_verients, sorted_sizes, find_entry_quantity, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed*/ 511) {
    				each_value_1 = /*sorted_colors*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (/*product*/ ctx[0].verients.length > 0) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$3(ctx);
    					if_block1.c();
    					if_block1.m(tfoot, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*product, sorted_sizes*/ 3) {
    				each_value = /*sorted_sizes*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tfoot, t7);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*product*/ 1 && t8_value !== (t8_value = /*product*/ ctx[0].entries.reduce(/*func_6*/ ctx[18], 0) + "")) set_data_dev(t8, t8_value);

    			if (dirty[0] & /*product*/ 1 && table_id_value !== (table_id_value = "entries-table-" + /*product*/ ctx[0].id)) {
    				attr_dev(table, "id", table_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(222:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (206:2) {#if sorted_verients.length == 0 && sorted_colors.length == 1 && sorted_sizes.length == 1}
    function create_if_block_1$3(ctx) {
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
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[7](/*sorted_sizes*/ ctx[1][0].id, /*sorted_colors*/ ctx[2][0], null);
    			attr_dev(input, "class", "size-input cls-cell svelte-13qct7y");
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[4][/*sorted_colors*/ ctx[2][0]]?.color);
    			attr_dev(input, "data-color", input_data_color_value = /*sorted_colors*/ ctx[2][0]);
    			attr_dev(input, "data-size", input_data_size_value = /*sorted_sizes*/ ctx[1][0].id);
    			attr_dev(input, "data-ver", null);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[5][/*sorted_sizes*/ ctx[1][0].id].size);
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$3, 207, 6, 6190);
    			attr_dev(div, "class", "single-input-wraper svelte-13qct7y");
    			add_location(div, file$3, 206, 4, 6150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes, sorted_colors*/ 6 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[7](/*sorted_sizes*/ ctx[1][0].id, /*sorted_colors*/ ctx[2][0], null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 20) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[4][/*sorted_colors*/ ctx[2][0]]?.color);
    			}

    			if (dirty[0] & /*sorted_colors*/ 4 && input_data_color_value !== (input_data_color_value = /*sorted_colors*/ ctx[2][0])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*sorted_sizes*/ 2 && input_data_size_value !== (input_data_size_value = /*sorted_sizes*/ ctx[1][0].id)) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*ALL_SIZES_DICT, sorted_sizes*/ 34 && input_placeholder_value !== (input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[5][/*sorted_sizes*/ ctx[1][0].id].size)) {
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(206:2) {#if sorted_verients.length == 0 && sorted_colors.length == 1 && sorted_sizes.length == 1}",
    		ctx
    	});

    	return block;
    }

    // (227:10) {#if sorted_verients.length != 0}
    function create_if_block_7$2(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "מודל";
    			attr_dev(th, "class", "const-size-cell svelte-13qct7y");
    			add_location(th, file$3, 227, 12, 6889);
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
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(227:10) {#if sorted_verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (230:10) {#each sorted_sizes as size}
    function create_each_block_6(ctx) {
    	let th;
    	let t0_value = /*size*/ ctx[22].size + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(th, "class", "svelte-13qct7y");
    			add_location(th, file$3, 230, 12, 6994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes*/ 2 && t0_value !== (t0_value = /*size*/ ctx[22].size + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(230:10) {#each sorted_sizes as size}",
    		ctx
    	});

    	return block;
    }

    // (249:14) {:else}
    function create_else_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "-";
    			attr_dev(div, "class", "svelte-13qct7y");
    			add_location(div, file$3, 249, 16, 7535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(249:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (241:14) {#if color}
    function create_if_block_6$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1_value = /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "inner svelte-13qct7y");
    			set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]].color);
    			add_location(div0, file$3, 242, 18, 7289);
    			attr_dev(div1, "class", "color-box svelte-13qct7y");
    			add_location(div1, file$3, 241, 16, 7247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 20) {
    				set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]].color);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 20 && t1_value !== (t1_value = /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(241:14) {#if color}",
    		ctx
    	});

    	return block;
    }

    // (254:12) {#if sorted_verients.length != 0}
    function create_if_block_5$2(ctx) {
    	let td;
    	let each_value_5 = /*sorted_verients*/ ctx[3];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			td = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(td, "class", "svelte-13qct7y");
    			add_location(td, file$3, 254, 14, 7647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_verients*/ 8) {
    				each_value_5 = /*sorted_verients*/ ctx[3];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(254:12) {#if sorted_verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (256:16) {#each sorted_verients as varient}
    function create_each_block_5(ctx) {
    	let div;
    	let t0_value = (/*varient*/ ctx[35]?.name || "") + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "varient-box cls-cell svelte-13qct7y");
    			add_location(div, file$3, 256, 18, 7721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_verients*/ 8 && t0_value !== (t0_value = (/*varient*/ ctx[35]?.name || "") + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(256:16) {#each sorted_verients as varient}",
    		ctx
    	});

    	return block;
    }

    // (282:16) {:else}
    function create_else_block_2$1(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*sorted_verients*/ ctx[3];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
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
    			if (dirty[0] & /*find_entry_quantity, sorted_sizes, sorted_colors, sorted_verients, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed*/ 254) {
    				each_value_4 = /*sorted_verients*/ ctx[3];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(282:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (266:16) {#if sorted_verients.length == 0}
    function create_if_block_4$2(ctx) {
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
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[31].id, /*color*/ ctx[25], null);
    			attr_dev(input, "class", "size-input cls-cell svelte-13qct7y");
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]]?.color);
    			attr_dev(input, "data-color", input_data_color_value = /*color*/ ctx[25]);
    			attr_dev(input, "data-size", input_data_size_value = /*size_obj*/ ctx[31].id);
    			attr_dev(input, "data-ver", null);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[5][/*size_obj*/ ctx[31].id].size);
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$3, 267, 20, 8167);
    			attr_dev(div, "class", "cell-wraper svelte-13qct7y");
    			add_location(div, file$3, 266, 18, 8121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes, sorted_colors*/ 6 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[31].id, /*color*/ ctx[25], null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 20) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]]?.color);
    			}

    			if (dirty[0] & /*sorted_colors*/ 4 && input_data_color_value !== (input_data_color_value = /*color*/ ctx[25])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*sorted_sizes*/ 2 && input_data_size_value !== (input_data_size_value = /*size_obj*/ ctx[31].id)) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*ALL_SIZES_DICT, sorted_sizes*/ 34 && input_placeholder_value !== (input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[5][/*size_obj*/ ctx[31].id].size)) {
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
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(266:16) {#if sorted_verients.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (283:18) {#each sorted_verients as ver, idx}
    function create_each_block_4$1(ctx) {
    	let div;
    	let input;
    	let input_value_value;
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
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[31].id, /*color*/ ctx[25], /*ver*/ ctx[28]?.id || null);
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]]?.color);
    			attr_dev(input, "data-color", input_data_color_value = /*color*/ ctx[25]);
    			attr_dev(input, "data-size", input_data_size_value = /*size_obj*/ ctx[31].id);
    			attr_dev(input, "data-ver", input_data_ver_value = /*ver*/ ctx[28]?.id || null);
    			attr_dev(input, "class", "size-input cls-cell svelte-13qct7y");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = "" + (/*ALL_SIZES_DICT*/ ctx[5][/*size_obj*/ ctx[31].id].size + "(" + (/*ver*/ ctx[28]?.name || '') + ")"));
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$3, 284, 22, 8923);
    			attr_dev(div, "class", "cell-wraper svelte-13qct7y");
    			add_location(div, file$3, 283, 20, 8875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes, sorted_colors, sorted_verients*/ 14 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[31].id, /*color*/ ctx[25], /*ver*/ ctx[28]?.id || null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 20) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[4][/*color*/ ctx[25]]?.color);
    			}

    			if (dirty[0] & /*sorted_colors*/ 4 && input_data_color_value !== (input_data_color_value = /*color*/ ctx[25])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*sorted_sizes*/ 2 && input_data_size_value !== (input_data_size_value = /*size_obj*/ ctx[31].id)) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*sorted_verients*/ 8 && input_data_ver_value !== (input_data_ver_value = /*ver*/ ctx[28]?.id || null)) {
    				attr_dev(input, "data-ver", input_data_ver_value);
    			}

    			if (dirty[0] & /*ALL_SIZES_DICT, sorted_sizes, sorted_verients*/ 42 && input_placeholder_value !== (input_placeholder_value = "" + (/*ALL_SIZES_DICT*/ ctx[5][/*size_obj*/ ctx[31].id].size + "(" + (/*ver*/ ctx[28]?.name || '') + ")"))) {
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
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(283:18) {#each sorted_verients as ver, idx}",
    		ctx
    	});

    	return block;
    }

    // (263:12) {#each sorted_sizes as size_obj}
    function create_each_block_3$1(ctx) {
    	let td;

    	function select_block_type_2(ctx, dirty) {
    		if (/*sorted_verients*/ ctx[3].length == 0) return create_if_block_4$2;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			attr_dev(td, "class", "size-cell svelte-13qct7y");
    			add_location(td, file$3, 263, 14, 7944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_block.m(td, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(263:12) {#each sorted_sizes as size_obj}",
    		ctx
    	});

    	return block;
    }

    // (319:14) {:else}
    function create_else_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*sorted_verients*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
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
    			if (dirty[0] & /*product, sorted_colors, sorted_verients*/ 13) {
    				each_value_2 = /*sorted_verients*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$3(child_ctx);
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
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(319:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (311:14) {#if sorted_verients.length == 0}
    function create_if_block_3$2(ctx) {
    	let div;
    	let t_value = /*product*/ ctx[0].entries.filter(func).reduce(/*func_1*/ ctx[13], 0) + "";
    	let t;

    	function func(...args) {
    		return /*func*/ ctx[12](/*color*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "center-text svelte-13qct7y");
    			add_location(div, file$3, 311, 16, 9948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*product, sorted_colors*/ 5 && t_value !== (t_value = /*product*/ ctx[0].entries.filter(func).reduce(/*func_1*/ ctx[13], 0) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(311:14) {#if sorted_verients.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (320:16) {#each sorted_verients as ver, idx}
    function create_each_block_2$3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*product*/ ctx[0].entries.filter(func_2).reduce(/*func_3*/ ctx[15], 0) + "";
    	let t1;
    	let t2;

    	function func_2(...args) {
    		return /*func_2*/ ctx[14](/*color*/ ctx[25], /*ver*/ ctx[28], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(")\n                  ");
    			attr_dev(div, "class", "center-text svelte-13qct7y");
    			add_location(div, file$3, 320, 18, 10316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*product, sorted_colors, sorted_verients*/ 13 && t1_value !== (t1_value = /*product*/ ctx[0].entries.filter(func_2).reduce(/*func_3*/ ctx[15], 0) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(320:16) {#each sorted_verients as ver, idx}",
    		ctx
    	});

    	return block;
    }

    // (238:8) {#each sorted_colors as color, color_idx}
    function create_each_block_1$3(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let t1;
    	let t2;
    	let td1;
    	let t3;
    	let td2;
    	let button;
    	let svg;
    	let path;
    	let t4;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*color*/ ctx[25]) return create_if_block_6$2;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*sorted_verients*/ ctx[3].length != 0 && create_if_block_5$2(ctx);
    	let each_value_3 = /*sorted_sizes*/ ctx[1];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	function select_block_type_3(ctx, dirty) {
    		if (/*sorted_verients*/ ctx[3].length == 0) return create_if_block_3$2;
    		return create_else_block_1$1;
    	}

    	let current_block_type_1 = select_block_type_3(ctx);
    	let if_block2 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			td1 = element("td");
    			if_block2.c();
    			t3 = space();
    			td2 = element("td");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t4 = space();
    			attr_dev(td0, "class", "sticky-col svelte-13qct7y");
    			add_location(td0, file$3, 239, 12, 7181);
    			attr_dev(td1, "class", "total-cell svelte-13qct7y");
    			add_location(td1, file$3, 309, 12, 9860);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M30.9 2.3h-8.6L21.6 1c-.3-.6-.9-1-1.5-1h-8.2c-.6 0-1.2.4-1.5.9l-.7 1.4H1.1C.5 2.3 0 2.8 0 3.4v2.2c0 .6.5 1.1 1.1 1.1h29.7c.6 0 1.1-.5 1.1-1.1V3.4c.1-.6-.4-1.1-1-1.1zM3.8 32.8A3.4 3.4 0 0 0 7.2 36h17.6c1.8 0 3.3-1.4 3.4-3.2L29.7 9H2.3l1.5 23.8z");
    			attr_dev(path, "class", "svelte-13qct7y");
    			add_location(path, file$3, 341, 19, 11059);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16px");
    			attr_dev(svg, "height", "16px");
    			attr_dev(svg, "viewBox", "0 0 32 36");
    			attr_dev(svg, "class", "svelte-13qct7y");
    			add_location(svg, file$3, 336, 16, 10881);
    			attr_dev(button, "class", "remove-button svelte-13qct7y");
    			add_location(button, file$3, 332, 14, 10749);
    			attr_dev(td2, "class", "delete-cell-style svelte-13qct7y");
    			add_location(td2, file$3, 331, 12, 10704);
    			attr_dev(tr, "class", "svelte-13qct7y");
    			add_location(tr, file$3, 238, 10, 7164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			if_block0.m(td0, null);
    			append_dev(tr, t0);
    			if (if_block1) if_block1.m(tr, null);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			if_block2.m(td1, null);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(tr, t4);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*clear_sizes_entries*/ ctx[8](/*color*/ ctx[25]))) /*clear_sizes_entries*/ ctx[8](/*color*/ ctx[25]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(td0, null);
    				}
    			}

    			if (/*sorted_verients*/ ctx[3].length != 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$2(ctx);
    					if_block1.c();
    					if_block1.m(tr, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*find_entry_quantity, sorted_sizes, sorted_colors, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed, sorted_verients*/ 254) {
    				each_value_3 = /*sorted_sizes*/ ctx[1];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_3(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(td1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(238:8) {#each sorted_colors as color, color_idx}",
    		ctx
    	});

    	return block;
    }

    // (356:8) {#if product.verients.length > 0}
    function create_if_block_2$3(ctx) {
    	let td;

    	const block = {
    		c: function create() {
    			td = element("td");
    			attr_dev(td, "class", "svelte-13qct7y");
    			add_location(td, file$3, 356, 10, 11648);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(356:8) {#if product.verients.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (359:8) {#each sorted_sizes as size}
    function create_each_block$3(ctx) {
    	let td;
    	let t_value = /*product*/ ctx[0].entries.filter(func_4).reduce(/*func_5*/ ctx[17], 0) + "";
    	let t;

    	function func_4(...args) {
    		return /*func_4*/ ctx[16](/*size*/ ctx[22], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "total-cell svelte-13qct7y");
    			add_location(td, file$3, 359, 10, 11716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*product, sorted_sizes*/ 3 && t_value !== (t_value = /*product*/ ctx[0].entries.filter(func_4).reduce(/*func_5*/ ctx[17], 0) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(359:8) {#each sorted_sizes as size}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*ALL_COLORS_DICT*/ ctx[4] && /*ALL_SIZES_DICT*/ ctx[5] && create_if_block$3(ctx);

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
    		p: function update(ctx, dirty) {
    			if (/*ALL_COLORS_DICT*/ ctx[4] && /*ALL_SIZES_DICT*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		let verient_id = el.dataset.ver;
    		size_id = parseInt(size_id);
    		color_id = parseInt(color_id);
    		verient_id = verient_id ? parseInt(verient_id) : null;
    		let quantity = el.value;

    		//console.log('input_amount_changed:', size_id, color_id, verient_id, quantity);
    		let found = false;

    		product.entries.forEach(entry => {
    			if (entry.size == size_id && entry.color == color_id && entry.varient == verient_id) {
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

    		console.log("input_amount_changed", found, size_id, color_id, verient_id, quantity);
    		$$invalidate(0, product.entries = [...product.entries], product);
    	}

    	function find_entry_quantity(size, color, verient) {
    		for (let entry of product.entries) {
    			if (entry.size == size && entry.color == color && entry.varient == verient) {
    				return entry.quantity;
    			}
    		}

    		return undefined;
    	}

    	function clear_sizes_entries(color_key) {
    		let clear_entries = product.entries.filter(v => v.color == color_key);

    		// console.log('removing ', clear_entries, ' out of ', product.entries);
    		clear_entries.forEach(cell => {
    			let query = `#entries-table-${product.id} .size-input[data-color='${cell.color}'][data-size='${cell.size}']` + (sorted_verients.length > 0
    			? `[data-ver='${cell.varient}']`
    			: "");

    			let el = document.querySelector(query);

    			// console.log('query: ', query, ' el ', el);
    			if (el) {
    				el.value = "";
    				var event = new Event("change");
    				el.dispatchEvent(event);
    			}
    		}); //cell.quantity = 0;
    	} //console.log(clear_entries);
    	//TODO: go over this function

    	const writable_props = ['product', 'ALL_SIZES', 'ALL_COLORS', 'ALL_VERIENTS'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<MentriesServerTable> was created with unknown prop '${key}'`);
    	});

    	const func = (color, v) => v.color == color;

    	const func_1 = (acc, curr) => {
    		return acc + parseInt(curr.quantity || "0");
    	};

    	const func_2 = (color, ver, v) => v.color == color && v.varient == ver.id;

    	const func_3 = (acc, curr) => {
    		return acc + parseInt(curr.quantity || "0");
    	};

    	const func_4 = (size, v) => v.size == size.id;

    	const func_5 = (acc, curr) => {
    		return acc + parseInt(curr.quantity || "0");
    	};

    	const func_6 = (acc, curr) => {
    		return acc + parseInt(curr.quantity || "0");
    	};

    	$$self.$$set = $$props => {
    		if ('product' in $$props) $$invalidate(0, product = $$props.product);
    		if ('ALL_SIZES' in $$props) $$invalidate(9, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(10, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(11, ALL_VERIENTS = $$props.ALL_VERIENTS);
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
    		find_entry_quantity,
    		clear_sizes_entries
    	});

    	$$self.$inject_state = $$props => {
    		if ('product' in $$props) $$invalidate(0, product = $$props.product);
    		if ('ALL_SIZES' in $$props) $$invalidate(9, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(10, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(11, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('sizes_ids_set' in $$props) sizes_ids_set = $$props.sizes_ids_set;
    		if ('colors_ids_set' in $$props) colors_ids_set = $$props.colors_ids_set;
    		if ('verients_ids_set' in $$props) verients_ids_set = $$props.verients_ids_set;
    		if ('sorted_sizes' in $$props) $$invalidate(1, sorted_sizes = $$props.sorted_sizes);
    		if ('sorted_colors' in $$props) $$invalidate(2, sorted_colors = $$props.sorted_colors);
    		if ('sorted_verients' in $$props) $$invalidate(3, sorted_verients = $$props.sorted_verients);
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(4, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(5, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ALL_COLORS*/ 1024) {
    			{

    				if (ALL_COLORS) {
    					let ALL_COLORS_DICT_temp = {};

    					ALL_COLORS.forEach(color => {
    						ALL_COLORS_DICT_temp[color.id] = color;
    					});

    					$$invalidate(4, ALL_COLORS_DICT = ALL_COLORS_DICT_temp);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*ALL_SIZES*/ 512) {
    			{

    				if (ALL_SIZES) {
    					let ALL_SIZES_DICT_temp = {};

    					ALL_SIZES.forEach(size => {
    						ALL_SIZES_DICT_temp[size.id] = size;
    					});

    					$$invalidate(5, ALL_SIZES_DICT = ALL_SIZES_DICT_temp);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*product, ALL_SIZES, ALL_VERIENTS*/ 2561) {
    			{
    				product.entries;
    				let sizes_temp_set = new Set();
    				let colors_temp_set = new Set();
    				let verients_temp_set = new Set();

    				// add product.colors to colors_ids_set
    				if (product.product.show_sizes_popup) {
    					for (let color_id of product.colors) {
    						//console.log('adding color_id:', color_id);
    						colors_temp_set.add(color_id);
    					}

    					// add product.sizes to sizes_ids_set
    					for (let size_id of product.sizes) {
    						//console.log('adding size_id:', size_id);
    						sizes_temp_set.add(size_id);
    					}

    					// add product.varients to varients_ids_set
    					for (let verient_id of product.verients) {
    						//console.log('adding verient_id:', verient_id);
    						verients_temp_set.add(verient_id);
    					}
    				} else // insert the defult no-color one-size
    				if (product.entries.length == 0) {
    					const DEFULT_COLOR = {
    						id: 76, // if a product should not have size and colors table, and entries are empty
    						name: "no color",
    						color: "#FFFFFF00",
    						code: "00"
    					};

    					const DEFULT_SIZE = { id: 86, size: "one size", code: "cc" };
    					colors_temp_set.add(DEFULT_COLOR.id);
    					sizes_temp_set.add(DEFULT_SIZE.id);
    				}

    				for (let entry of product.entries) {
    					sizes_temp_set.add(entry.size);
    					colors_temp_set.add(entry.color);
    					verients_temp_set.add(entry.varient);
    				}

    				// order sizes_ids_set by code
    				// sizes_ids_set: [1,2,7,3]
    				// ALL_SIZES: [{id:1, code: '3'}, {id:2, code: '4'}, {id:7, code: '2'}, {id:3, code: '1'}]
    				let ALL_SIZES_ordered = ALL_SIZES.sort((a, b) => {
    					return a.code.localeCompare(b.code);
    				});

    				//console.log('ALL_SIZES_ordered:', ALL_SIZES_ordered);
    				//console.log('sizes_ids_set:', sizes_ids_set);
    				let sorted_sizes_temp = [];

    				for (let size of ALL_SIZES_ordered) {
    					if (sizes_temp_set.has(size.id)) {
    						sorted_sizes_temp.push(size);
    					}
    				}

    				$$invalidate(1, sorted_sizes = [...sorted_sizes_temp.reverse()]);

    				//console.log('sorted_sizes:', sorted_sizes);
    				$$invalidate(2, sorted_colors = [...colors_temp_set]);

    				$$invalidate(3, sorted_verients = [...verients_temp_set].filter(v => v != null).map(ver_id => ALL_VERIENTS.find(ver => ver.id == ver_id)));
    			}
    		}
    	};

    	return [
    		product,
    		sorted_sizes,
    		sorted_colors,
    		sorted_verients,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		input_amount_changed,
    		find_entry_quantity,
    		clear_sizes_entries,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		func,
    		func_1,
    		func_2,
    		func_3,
    		func_4,
    		func_5,
    		func_6
    	];
    }

    class MentriesServerTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				product: 0,
    				ALL_SIZES: 9,
    				ALL_COLORS: 10,
    				ALL_VERIENTS: 11
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MentriesServerTable",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*product*/ ctx[0] === undefined && !('product' in props)) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'product'");
    		}

    		if (/*ALL_SIZES*/ ctx[9] === undefined && !('ALL_SIZES' in props)) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'ALL_SIZES'");
    		}

    		if (/*ALL_COLORS*/ ctx[10] === undefined && !('ALL_COLORS' in props)) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'ALL_COLORS'");
    		}

    		if (/*ALL_VERIENTS*/ ctx[11] === undefined && !('ALL_VERIENTS' in props)) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'ALL_VERIENTS'");
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

    /* node_modules\simple-svelte-autocomplete\src\SimpleAutocomplete.svelte generated by Svelte v3.44.3 */

    const { Object: Object_1, console: console_1$2 } = globals;
    const file$2 = "node_modules\\simple-svelte-autocomplete\\src\\SimpleAutocomplete.svelte";

    const get_no_results_slot_changes = dirty => ({
    	noResultsText: dirty[0] & /*noResultsText*/ 2048
    });

    const get_no_results_slot_context = ctx => ({ noResultsText: /*noResultsText*/ ctx[11] });

    const get_create_slot_changes = dirty => ({
    	createText: dirty[0] & /*createText*/ 8192
    });

    const get_create_slot_context = ctx => ({ createText: /*createText*/ ctx[13] });

    const get_loading_slot_changes = dirty => ({
    	loadingText: dirty[0] & /*loadingText*/ 4096
    });

    const get_loading_slot_context = ctx => ({ loadingText: /*loadingText*/ ctx[12] });

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[108] = list[i];
    	child_ctx[110] = i;
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	item: dirty[0] & /*filteredListItems*/ 134217728,
    	label: dirty[0] & /*filteredListItems*/ 134217728
    });

    const get_item_slot_context = ctx => ({
    	item: /*listItem*/ ctx[108].item,
    	label: /*listItem*/ ctx[108].highlighted
    	? /*listItem*/ ctx[108].highlighted
    	: /*listItem*/ ctx[108].label
    });

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[111] = list[i];
    	return child_ctx;
    }

    const get_tag_slot_changes = dirty => ({
    	label: dirty[0] & /*selectedItem*/ 2,
    	item: dirty[0] & /*selectedItem*/ 2
    });

    const get_tag_slot_context = ctx => ({
    	label: /*safeLabelFunction*/ ctx[34](/*tagItem*/ ctx[111]),
    	item: /*tagItem*/ ctx[111],
    	unselectItem: /*unselectItem*/ ctx[41]
    });

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[110] = list[i];
    	return child_ctx;
    }

    // (1144:39) 
    function create_if_block_11(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*selectedItem*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
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
    			if (dirty[0] & /*valueFunction, selectedItem*/ 18 | dirty[1] & /*safeLabelFunction*/ 8) {
    				each_value_2 = /*selectedItem*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$2(child_ctx);
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
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(1144:39) ",
    		ctx
    	});

    	return block;
    }

    // (1142:4) {#if !multiple && value}
    function create_if_block_10(ctx) {
    	let option;
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(/*text*/ ctx[3]);
    			option.__value = /*value*/ ctx[2];
    			option.value = option.__value;
    			option.selected = true;
    			attr_dev(option, "class", "svelte-lduj97");
    			add_location(option, file$2, 1142, 6, 27728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*text*/ 8) set_data_dev(t, /*text*/ ctx[3]);

    			if (dirty[0] & /*value*/ 4) {
    				prop_dev(option, "__value", /*value*/ ctx[2]);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(1142:4) {#if !multiple && value}",
    		ctx
    	});

    	return block;
    }

    // (1145:6) {#each selectedItem as i}
    function create_each_block_2$2(ctx) {
    	let option;
    	let t0_value = /*safeLabelFunction*/ ctx[34](/*i*/ ctx[110]) + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*valueFunction*/ ctx[4](/*i*/ ctx[110], true);
    			option.value = option.__value;
    			option.selected = true;
    			attr_dev(option, "class", "svelte-lduj97");
    			add_location(option, file$2, 1145, 8, 27849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedItem*/ 2 && t0_value !== (t0_value = /*safeLabelFunction*/ ctx[34](/*i*/ ctx[110]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*valueFunction, selectedItem*/ 18 && option_value_value !== (option_value_value = /*valueFunction*/ ctx[4](/*i*/ ctx[110], true))) {
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
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(1145:6) {#each selectedItem as i}",
    		ctx
    	});

    	return block;
    }

    // (1153:4) {#if multiple && selectedItem}
    function create_if_block_9(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selectedItem*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
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
    			if (dirty[0] & /*selectedItem*/ 2 | dirty[1] & /*unselectItem, safeLabelFunction*/ 1032 | dirty[2] & /*$$scope*/ 8192) {
    				each_value_1 = /*selectedItem*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(1153:4) {#if multiple && selectedItem}",
    		ctx
    	});

    	return block;
    }

    // (1159:25)            
    function fallback_block_4(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*safeLabelFunction*/ ctx[34](/*tagItem*/ ctx[111]) + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = space();
    			attr_dev(span0, "class", "tag svelte-lduj97");
    			add_location(span0, file$2, 1160, 12, 28273);
    			attr_dev(span1, "class", "tag is-delete svelte-lduj97");
    			add_location(span1, file$2, 1161, 12, 28339);
    			attr_dev(div, "class", "tags has-addons svelte-lduj97");
    			add_location(div, file$2, 1159, 10, 28231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			insert_dev(target, t2, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					span1,
    					"click",
    					prevent_default(function () {
    						if (is_function(/*unselectItem*/ ctx[41](/*tagItem*/ ctx[111]))) /*unselectItem*/ ctx[41](/*tagItem*/ ctx[111]).apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedItem*/ 2 && t0_value !== (t0_value = /*safeLabelFunction*/ ctx[34](/*tagItem*/ ctx[111]) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_4.name,
    		type: "fallback",
    		source: "(1159:25)            ",
    		ctx
    	});

    	return block;
    }

    // (1154:6) {#each selectedItem as tagItem}
    function create_each_block_1$2(ctx) {
    	let current;
    	const tag_slot_template = /*#slots*/ ctx[76].tag;
    	const tag_slot = create_slot(tag_slot_template, ctx, /*$$scope*/ ctx[75], get_tag_slot_context);
    	const tag_slot_or_fallback = tag_slot || fallback_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (tag_slot_or_fallback) tag_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (tag_slot_or_fallback) {
    				tag_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tag_slot) {
    				if (tag_slot.p && (!current || dirty[0] & /*selectedItem*/ 2 | dirty[2] & /*$$scope*/ 8192)) {
    					update_slot_base(
    						tag_slot,
    						tag_slot_template,
    						ctx,
    						/*$$scope*/ ctx[75],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[75])
    						: get_slot_changes(tag_slot_template, /*$$scope*/ ctx[75], dirty, get_tag_slot_changes),
    						get_tag_slot_context
    					);
    				}
    			} else {
    				if (tag_slot_or_fallback && tag_slot_or_fallback.p && (!current || dirty[0] & /*selectedItem*/ 2)) {
    					tag_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tag_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tag_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tag_slot_or_fallback) tag_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(1154:6) {#each selectedItem as tagItem}",
    		ctx
    	});

    	return block;
    }

    // (1187:4) {#if clearable}
    function create_if_block_8(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✖";
    			attr_dev(span, "class", "autocomplete-clear-button svelte-lduj97");
    			add_location(span, file$2, 1187, 6, 29082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clear*/ ctx[45], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(1187:4) {#if clearable}",
    		ctx
    	});

    	return block;
    }

    // (1234:28) 
    function create_if_block_7$1(ctx) {
    	let div;
    	let current;
    	const no_results_slot_template = /*#slots*/ ctx[76]["no-results"];
    	const no_results_slot = create_slot(no_results_slot_template, ctx, /*$$scope*/ ctx[75], get_no_results_slot_context);
    	const no_results_slot_or_fallback = no_results_slot || fallback_block_3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.c();
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-lduj97");
    			add_location(div, file$2, 1234, 6, 30903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (no_results_slot_or_fallback) {
    				no_results_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (no_results_slot) {
    				if (no_results_slot.p && (!current || dirty[0] & /*noResultsText*/ 2048 | dirty[2] & /*$$scope*/ 8192)) {
    					update_slot_base(
    						no_results_slot,
    						no_results_slot_template,
    						ctx,
    						/*$$scope*/ ctx[75],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[75])
    						: get_slot_changes(no_results_slot_template, /*$$scope*/ ctx[75], dirty, get_no_results_slot_changes),
    						get_no_results_slot_context
    					);
    				}
    			} else {
    				if (no_results_slot_or_fallback && no_results_slot_or_fallback.p && (!current || dirty[0] & /*noResultsText*/ 2048)) {
    					no_results_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(no_results_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(no_results_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(1234:28) ",
    		ctx
    	});

    	return block;
    }

    // (1230:21) 
    function create_if_block_6$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const create_slot_template = /*#slots*/ ctx[76].create;
    	const create_slot_1 = create_slot(create_slot_template, ctx, /*$$scope*/ ctx[75], get_create_slot_context);
    	const create_slot_or_fallback = create_slot_1 || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (create_slot_or_fallback) create_slot_or_fallback.c();
    			attr_dev(div, "class", "autocomplete-list-item-create svelte-lduj97");
    			add_location(div, file$2, 1230, 6, 30728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (create_slot_or_fallback) {
    				create_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*selectItem*/ ctx[35], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (create_slot_1) {
    				if (create_slot_1.p && (!current || dirty[0] & /*createText*/ 8192 | dirty[2] & /*$$scope*/ 8192)) {
    					update_slot_base(
    						create_slot_1,
    						create_slot_template,
    						ctx,
    						/*$$scope*/ ctx[75],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[75])
    						: get_slot_changes(create_slot_template, /*$$scope*/ ctx[75], dirty, get_create_slot_changes),
    						get_create_slot_context
    					);
    				}
    			} else {
    				if (create_slot_or_fallback && create_slot_or_fallback.p && (!current || dirty[0] & /*createText*/ 8192)) {
    					create_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(create_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(create_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (create_slot_or_fallback) create_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(1230:21) ",
    		ctx
    	});

    	return block;
    }

    // (1226:37) 
    function create_if_block_5$1(ctx) {
    	let div;
    	let current;
    	const loading_slot_template = /*#slots*/ ctx[76].loading;
    	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[75], get_loading_slot_context);
    	const loading_slot_or_fallback = loading_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (loading_slot_or_fallback) loading_slot_or_fallback.c();
    			attr_dev(div, "class", "autocomplete-list-item-loading svelte-lduj97");
    			add_location(div, file$2, 1226, 6, 30578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (loading_slot_or_fallback) {
    				loading_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (loading_slot) {
    				if (loading_slot.p && (!current || dirty[0] & /*loadingText*/ 4096 | dirty[2] & /*$$scope*/ 8192)) {
    					update_slot_base(
    						loading_slot,
    						loading_slot_template,
    						ctx,
    						/*$$scope*/ ctx[75],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[75])
    						: get_slot_changes(loading_slot_template, /*$$scope*/ ctx[75], dirty, get_loading_slot_changes),
    						get_loading_slot_context
    					);
    				}
    			} else {
    				if (loading_slot_or_fallback && loading_slot_or_fallback.p && (!current || dirty[0] & /*loadingText*/ 4096)) {
    					loading_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (loading_slot_or_fallback) loading_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(1226:37) ",
    		ctx
    	});

    	return block;
    }

    // (1195:4) {#if filteredListItems && filteredListItems.length > 0}
    function create_if_block$2(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*filteredListItems*/ ctx[27];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*maxItemsToShowInList*/ ctx[5] > 0 && /*filteredListItems*/ ctx[27].length > /*maxItemsToShowInList*/ ctx[5] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*highlightIndex, filteredListItems, maxItemsToShowInList*/ 201326624 | dirty[1] & /*isConfirmed, onListItemClick*/ 32800 | dirty[2] & /*$$scope*/ 8192) {
    				each_value = /*filteredListItems*/ ctx[27];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*maxItemsToShowInList*/ ctx[5] > 0 && /*filteredListItems*/ ctx[27].length > /*maxItemsToShowInList*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
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
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(1195:4) {#if filteredListItems && filteredListItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (1236:48) {noResultsText}
    function fallback_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*noResultsText*/ ctx[11]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noResultsText*/ 2048) set_data_dev(t, /*noResultsText*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(1236:48) {noResultsText}",
    		ctx
    	});

    	return block;
    }

    // (1232:41) {createText}
    function fallback_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*createText*/ ctx[13]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*createText*/ 8192) set_data_dev(t, /*createText*/ ctx[13]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(1232:41) {createText}",
    		ctx
    	});

    	return block;
    }

    // (1228:43) {loadingText}
    function fallback_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*loadingText*/ ctx[12]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*loadingText*/ 4096) set_data_dev(t, /*loadingText*/ ctx[12]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(1228:43) {loadingText}",
    		ctx
    	});

    	return block;
    }

    // (1197:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}
    function create_if_block_2$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[108] && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[108]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*filteredListItems*/ 134217728) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$1(ctx);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(1197:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}",
    		ctx
    	});

    	return block;
    }

    // (1198:10) {#if listItem}
    function create_if_block_3$1(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const item_slot_template = /*#slots*/ ctx[76].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[75], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[79](/*listItem*/ ctx[108]);
    	}

    	function pointerenter_handler() {
    		return /*pointerenter_handler*/ ctx[80](/*i*/ ctx[110]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (item_slot_or_fallback) item_slot_or_fallback.c();

    			attr_dev(div, "class", div_class_value = "autocomplete-list-item " + (/*i*/ ctx[110] === /*highlightIndex*/ ctx[26]
    			? 'selected'
    			: '') + " svelte-lduj97");

    			toggle_class(div, "confirmed", /*isConfirmed*/ ctx[46](/*listItem*/ ctx[108].item));
    			add_location(div, file$2, 1198, 12, 29548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", click_handler, false, false, false),
    					listen_dev(div, "pointerenter", pointerenter_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty[0] & /*filteredListItems*/ 134217728 | dirty[2] & /*$$scope*/ 8192)) {
    					update_slot_base(
    						item_slot,
    						item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[75],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[75])
    						: get_slot_changes(item_slot_template, /*$$scope*/ ctx[75], dirty, get_item_slot_changes),
    						get_item_slot_context
    					);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && (!current || dirty[0] & /*filteredListItems*/ 134217728)) {
    					item_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*highlightIndex*/ 67108864 && div_class_value !== (div_class_value = "autocomplete-list-item " + (/*i*/ ctx[110] === /*highlightIndex*/ ctx[26]
    			? 'selected'
    			: '') + " svelte-lduj97")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty[0] & /*highlightIndex, filteredListItems*/ 201326592 | dirty[1] & /*isConfirmed*/ 32768) {
    				toggle_class(div, "confirmed", /*isConfirmed*/ ctx[46](/*listItem*/ ctx[108].item));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(1198:10) {#if listItem}",
    		ctx
    	});

    	return block;
    }

    // (1212:16) {:else}
    function create_else_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[108].label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 134217728 && raw_value !== (raw_value = /*listItem*/ ctx[108].label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(1212:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1210:16) {#if listItem.highlighted}
    function create_if_block_4$1(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[108].highlighted + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 134217728 && raw_value !== (raw_value = /*listItem*/ ctx[108].highlighted + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(1210:16) {#if listItem.highlighted}",
    		ctx
    	});

    	return block;
    }

    // (1209:85)                  
    function fallback_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*listItem*/ ctx[108].highlighted) return create_if_block_4$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(1209:85)                  ",
    		ctx
    	});

    	return block;
    }

    // (1196:6) {#each filteredListItems as listItem, i}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[108] && (/*maxItemsToShowInList*/ ctx[5] <= 0 || /*i*/ ctx[110] < /*maxItemsToShowInList*/ ctx[5]) && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[108] && (/*maxItemsToShowInList*/ ctx[5] <= 0 || /*i*/ ctx[110] < /*maxItemsToShowInList*/ ctx[5])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 134217760) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(1196:6) {#each filteredListItems as listItem, i}",
    		ctx
    	});

    	return block;
    }

    // (1221:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
    function create_if_block_1$2(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*filteredListItems*/ ctx[27].length - /*maxItemsToShowInList*/ ctx[5] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("...");
    			t1 = text(t1_value);
    			t2 = text(" results not shown");
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-lduj97");
    			add_location(div, file$2, 1221, 8, 30378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 134217760 && t1_value !== (t1_value = /*filteredListItems*/ ctx[27].length - /*maxItemsToShowInList*/ ctx[5] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(1221:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let select;
    	let t0;
    	let div0;
    	let t1;
    	let input_1;
    	let input_1_class_value;
    	let input_1_id_value;
    	let input_1_autocomplete_value;
    	let input_1_readonly_value;
    	let t2;
    	let t3;
    	let div1;
    	let current_block_type_index;
    	let if_block3;
    	let div1_class_value;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*multiple*/ ctx[6] && /*value*/ ctx[2]) return create_if_block_10;
    		if (/*multiple*/ ctx[6] && /*selectedItem*/ ctx[1]) return create_if_block_11;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*multiple*/ ctx[6] && /*selectedItem*/ ctx[1] && create_if_block_9(ctx);
    	let if_block2 = /*clearable*/ ctx[31] && create_if_block_8(ctx);
    	const if_block_creators = [create_if_block$2, create_if_block_5$1, create_if_block_6$1, create_if_block_7$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*filteredListItems*/ ctx[27] && /*filteredListItems*/ ctx[27].length > 0) return 0;
    		if (/*loading*/ ctx[30] && /*loadingText*/ ctx[12]) return 1;
    		if (/*create*/ ctx[7]) return 2;
    		if (/*noResultsText*/ ctx[11]) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			select = element("select");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			input_1 = element("input");
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			div1 = element("div");
    			if (if_block3) if_block3.c();
    			attr_dev(select, "name", /*selectName*/ ctx[19]);
    			attr_dev(select, "id", /*selectId*/ ctx[20]);
    			select.multiple = /*multiple*/ ctx[6];
    			attr_dev(select, "class", "svelte-lduj97");
    			add_location(select, file$2, 1140, 2, 27641);
    			attr_dev(input_1, "type", "text");

    			attr_dev(input_1, "class", input_1_class_value = "" + ((/*inputClassName*/ ctx[16]
    			? /*inputClassName*/ ctx[16]
    			: '') + " input autocomplete-input" + " svelte-lduj97"));

    			attr_dev(input_1, "id", input_1_id_value = /*inputId*/ ctx[17] ? /*inputId*/ ctx[17] : '');
    			attr_dev(input_1, "autocomplete", input_1_autocomplete_value = /*html5autocomplete*/ ctx[22] ? 'on' : 'some-other-text');
    			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[14]);
    			attr_dev(input_1, "name", /*name*/ ctx[18]);
    			input_1.disabled = /*disabled*/ ctx[25];
    			attr_dev(input_1, "title", /*title*/ ctx[21]);
    			input_1.readOnly = input_1_readonly_value = /*readonly*/ ctx[23] || /*lock*/ ctx[8] && /*selectedItem*/ ctx[1];
    			add_location(input_1, file$2, 1168, 4, 28507);
    			attr_dev(div0, "class", "input-container svelte-lduj97");
    			add_location(div0, file$2, 1151, 2, 27987);

    			attr_dev(div1, "class", div1_class_value = "" + ((/*dropdownClassName*/ ctx[24]
    			? /*dropdownClassName*/ ctx[24]
    			: '') + " autocomplete-list " + (/*showList*/ ctx[32] ? '' : 'hidden') + " is-fullwidth" + " svelte-lduj97"));

    			add_location(div1, file$2, 1190, 2, 29176);

    			attr_dev(div2, "class", div2_class_value = "" + ((/*className*/ ctx[15] ? /*className*/ ctx[15] : '') + " " + (/*hideArrow*/ ctx[9] || !/*items*/ ctx[0].length
    			? 'hide-arrow'
    			: '') + " " + (/*multiple*/ ctx[6] ? 'is-multiple' : '') + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[33] + " svelte-lduj97"));

    			toggle_class(div2, "show-clear", /*clearable*/ ctx[31]);
    			toggle_class(div2, "is-loading", /*showLoadingIndicator*/ ctx[10] && /*loading*/ ctx[30]);
    			add_location(div2, file$2, 1134, 0, 27381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, select);
    			if (if_block0) if_block0.m(select, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, input_1);
    			/*input_1_binding*/ ctx[77](input_1);
    			set_input_value(input_1, /*text*/ ctx[3]);
    			append_dev(div0, t2);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			/*div1_binding*/ ctx[81](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*onDocumentClick*/ ctx[37], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[78]),
    					listen_dev(input_1, "input", /*onInput*/ ctx[40], false, false, false),
    					listen_dev(input_1, "focus", /*onFocusInternal*/ ctx[43], false, false, false),
    					listen_dev(input_1, "blur", /*onBlurInternal*/ ctx[44], false, false, false),
    					listen_dev(input_1, "keydown", /*onKeyDown*/ ctx[38], false, false, false),
    					listen_dev(input_1, "click", /*onInputClick*/ ctx[42], false, false, false),
    					listen_dev(input_1, "keypress", /*onKeyPress*/ ctx[39], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(select, null);
    				}
    			}

    			if (!current || dirty[0] & /*selectName*/ 524288) {
    				attr_dev(select, "name", /*selectName*/ ctx[19]);
    			}

    			if (!current || dirty[0] & /*selectId*/ 1048576) {
    				attr_dev(select, "id", /*selectId*/ ctx[20]);
    			}

    			if (!current || dirty[0] & /*multiple*/ 64) {
    				prop_dev(select, "multiple", /*multiple*/ ctx[6]);
    			}

    			if (/*multiple*/ ctx[6] && /*selectedItem*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*multiple, selectedItem*/ 66) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*inputClassName*/ 65536 && input_1_class_value !== (input_1_class_value = "" + ((/*inputClassName*/ ctx[16]
    			? /*inputClassName*/ ctx[16]
    			: '') + " input autocomplete-input" + " svelte-lduj97"))) {
    				attr_dev(input_1, "class", input_1_class_value);
    			}

    			if (!current || dirty[0] & /*inputId*/ 131072 && input_1_id_value !== (input_1_id_value = /*inputId*/ ctx[17] ? /*inputId*/ ctx[17] : '')) {
    				attr_dev(input_1, "id", input_1_id_value);
    			}

    			if (!current || dirty[0] & /*html5autocomplete*/ 4194304 && input_1_autocomplete_value !== (input_1_autocomplete_value = /*html5autocomplete*/ ctx[22] ? 'on' : 'some-other-text')) {
    				attr_dev(input_1, "autocomplete", input_1_autocomplete_value);
    			}

    			if (!current || dirty[0] & /*placeholder*/ 16384) {
    				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*name*/ 262144) {
    				attr_dev(input_1, "name", /*name*/ ctx[18]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 33554432) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[25]);
    			}

    			if (!current || dirty[0] & /*title*/ 2097152) {
    				attr_dev(input_1, "title", /*title*/ ctx[21]);
    			}

    			if (!current || dirty[0] & /*readonly, lock, selectedItem*/ 8388866 && input_1_readonly_value !== (input_1_readonly_value = /*readonly*/ ctx[23] || /*lock*/ ctx[8] && /*selectedItem*/ ctx[1])) {
    				prop_dev(input_1, "readOnly", input_1_readonly_value);
    			}

    			if (dirty[0] & /*text*/ 8 && input_1.value !== /*text*/ ctx[3]) {
    				set_input_value(input_1, /*text*/ ctx[3]);
    			}

    			if (/*clearable*/ ctx[31]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block3) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block3 = if_blocks[current_block_type_index];

    					if (!if_block3) {
    						if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block3.c();
    					} else {
    						if_block3.p(ctx, dirty);
    					}

    					transition_in(if_block3, 1);
    					if_block3.m(div1, null);
    				} else {
    					if_block3 = null;
    				}
    			}

    			if (!current || dirty[0] & /*dropdownClassName*/ 16777216 | dirty[1] & /*showList*/ 2 && div1_class_value !== (div1_class_value = "" + ((/*dropdownClassName*/ ctx[24]
    			? /*dropdownClassName*/ ctx[24]
    			: '') + " autocomplete-list " + (/*showList*/ ctx[32] ? '' : 'hidden') + " is-fullwidth" + " svelte-lduj97"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty[0] & /*className, hideArrow, items, multiple*/ 33345 && div2_class_value !== (div2_class_value = "" + ((/*className*/ ctx[15] ? /*className*/ ctx[15] : '') + " " + (/*hideArrow*/ ctx[9] || !/*items*/ ctx[0].length
    			? 'hide-arrow'
    			: '') + " " + (/*multiple*/ ctx[6] ? 'is-multiple' : '') + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[33] + " svelte-lduj97"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty[0] & /*className, hideArrow, items, multiple*/ 33345 | dirty[1] & /*clearable*/ 1) {
    				toggle_class(div2, "show-clear", /*clearable*/ ctx[31]);
    			}

    			if (dirty[0] & /*className, hideArrow, items, multiple, showLoadingIndicator, loading*/ 1073776193) {
    				toggle_class(div2, "is-loading", /*showLoadingIndicator*/ ctx[10] && /*loading*/ ctx[30]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
    			/*input_1_binding*/ ctx[77](null);
    			if (if_block2) if_block2.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div1_binding*/ ctx[81](null);
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

    function safeStringFunction(theFunction, argument) {
    	if (typeof theFunction !== "function") {
    		console.error("Not a function: " + theFunction + ", argument: " + argument);
    	}

    	let originalResult;

    	try {
    		originalResult = theFunction(argument);
    	} catch(error) {
    		console.warn("Error executing Autocomplete function on value: " + argument + " function: " + theFunction);
    	}

    	let result = originalResult;

    	if (result === undefined || result === null) {
    		result = "";
    	}

    	if (typeof result !== "string") {
    		result = result.toString();
    	}

    	return result;
    }

    function numberOfMatches(listItem, searchWords) {
    	if (!listItem) {
    		return 0;
    	}

    	const itemKeywords = listItem.keywords;
    	let matches = 0;

    	searchWords.forEach(searchWord => {
    		if (itemKeywords.includes(searchWord)) {
    			matches++;
    		}
    	});

    	return matches;
    }

    function defaultItemSortFunction(obj1, obj2, searchWords) {
    	return numberOfMatches(obj2, searchWords) - numberOfMatches(obj1, searchWords);
    }

    function removeAccents(str) {
    	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let showList;
    	let clearable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SimpleAutocomplete', slots, ['tag','item','loading','create','no-results']);
    	let { items = [] } = $$props;
    	let { searchFunction = false } = $$props;
    	let { labelFieldName = undefined } = $$props;
    	let { keywordsFieldName = labelFieldName } = $$props;
    	let { valueFieldName = undefined } = $$props;

    	let { labelFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return labelFieldName ? item[labelFieldName] : item;
    	} } = $$props;

    	let { keywordsFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return keywordsFieldName
    		? item[keywordsFieldName]
    		: labelFunction(item);
    	} } = $$props;

    	let { valueFunction = function (item, forceSingle = false) {
    		if (item === undefined || item === null) {
    			return item;
    		}

    		if (!multiple || forceSingle) {
    			return valueFieldName ? item[valueFieldName] : item;
    		} else {
    			return item.map(i => valueFieldName ? i[valueFieldName] : i);
    		}
    	} } = $$props;

    	let { keywordsCleanFunction = function (keywords) {
    		return keywords;
    	} } = $$props;

    	let { textCleanFunction = function (userEnteredText) {
    		return userEnteredText;
    	} } = $$props;

    	let { beforeChange = function (oldSelectedItem, newSelectedItem) {
    		return true;
    	} } = $$props;

    	let { onChange = function (newSelectedItem) {
    		
    	} } = $$props;

    	let { onFocus = function () {
    		
    	} } = $$props;

    	let { onBlur = function () {
    		
    	} } = $$props;

    	let { onCreate = function (text) {
    		if (debug) {
    			console.log("onCreate: " + text);
    		}
    	} } = $$props;

    	let { selectFirstIfEmpty = false } = $$props;
    	let { minCharactersToSearch = 1 } = $$props;
    	let { maxItemsToShowInList = 0 } = $$props;
    	let { multiple = false } = $$props;
    	let { create = false } = $$props;
    	let { ignoreAccents = true } = $$props;
    	let { matchAllKeywords = true } = $$props;
    	let { sortByMatchedKeywords = false } = $$props;
    	let { itemFilterFunction = undefined } = $$props;
    	let { itemSortFunction = undefined } = $$props;
    	let { lock = false } = $$props;
    	let { delay = 0 } = $$props;
    	let { localFiltering = true } = $$props;
    	let { hideArrow = false } = $$props;
    	let { showClear = false } = $$props;
    	let { showLoadingIndicator = false } = $$props;
    	let { noResultsText = "No results found" } = $$props;
    	let { loadingText = "Loading results..." } = $$props;
    	let { createText = "Not found, add anyway?" } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { className = undefined } = $$props;
    	let { inputClassName = undefined } = $$props;
    	let { inputId = undefined } = $$props;
    	let { name = undefined } = $$props;
    	let { selectName = undefined } = $$props;
    	let { selectId = undefined } = $$props;
    	let { title = undefined } = $$props;
    	let { html5autocomplete = undefined } = $$props;
    	let { readonly = undefined } = $$props;
    	let { dropdownClassName = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let { debug = false } = $$props;
    	let { selectedItem = multiple ? [] : undefined } = $$props;
    	let { value = undefined } = $$props;
    	let { highlightedItem = undefined } = $$props;

    	// --- Internal State ----
    	const uniqueId = "sautocomplete-" + Math.floor(Math.random() * 1000);

    	// HTML elements
    	let input;

    	let list;

    	// UI state
    	let opened = false;

    	let loading = false;
    	let highlightIndex = -1;
    	let { text } = $$props;
    	let filteredTextLength = 0;

    	// view model
    	let filteredListItems;

    	let listItems = [];

    	// requests/responses counters
    	let lastRequestId = 0;

    	let lastResponseId = 0;

    	// other state
    	let inputDelayTimeout;

    	function safeLabelFunction(item) {
    		// console.log("labelFunction: " + labelFunction);
    		// console.log("safeLabelFunction, item: " + item);
    		return safeStringFunction(labelFunction, item);
    	}

    	function safeKeywordsFunction(item) {
    		// console.log("safeKeywordsFunction");
    		const keywords = safeStringFunction(keywordsFunction, item);

    		let result = safeStringFunction(keywordsCleanFunction, keywords);
    		result = result.toLowerCase().trim();

    		if (ignoreAccents) {
    			result = removeAccents(result);
    		}

    		if (debug) {
    			console.log("Extracted keywords: '" + result + "' from item: " + JSON.stringify(item));
    		}

    		return result;
    	}

    	function prepareListItems() {
    		let timerId;

    		if (debug) {
    			timerId = `Autocomplete prepare list ${inputId ? `(id: ${inputId})` : ""}`;
    			console.time(timerId);
    			console.log("Prepare items to search");
    			console.log("items: " + JSON.stringify(items));
    		}

    		if (!Array.isArray(items)) {
    			console.warn("Autocomplete items / search function did not return array but", items);
    			$$invalidate(0, items = []);
    		}

    		const length = items ? items.length : 0;
    		listItems = new Array(length);

    		if (length > 0) {
    			items.forEach((item, i) => {
    				const listItem = getListItem(item);

    				if (listItem == undefined) {
    					console.log("Undefined item for: ", item);
    				}

    				listItems[i] = listItem;
    			});
    		}

    		if (debug) {
    			console.log(listItems.length + " items to search");
    			console.timeEnd(timerId);
    		}
    	}

    	function getListItem(item) {
    		return {
    			// keywords representation of the item
    			keywords: safeKeywordsFunction(item),
    			// item label
    			label: safeLabelFunction(item),
    			// store reference to the origial item
    			item
    		};
    	}

    	function onSelectedItemChanged() {
    		$$invalidate(2, value = valueFunction(selectedItem));
    		$$invalidate(3, text = !multiple ? safeLabelFunction(selectedItem) : "");
    		$$invalidate(27, filteredListItems = listItems);
    		onChange(selectedItem);
    	}

    	function prepareUserEnteredText(userEnteredText) {
    		if (userEnteredText === undefined || userEnteredText === null) {
    			return "";
    		}

    		const textFiltered = userEnteredText.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ").trim();
    		$$invalidate(74, filteredTextLength = textFiltered.length);

    		if (minCharactersToSearch > 1) {
    			if (filteredTextLength < minCharactersToSearch) {
    				return "";
    			}
    		}

    		const cleanUserEnteredText = textCleanFunction(textFiltered);
    		const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();

    		if (debug) {
    			console.log("Change user entered text '" + userEnteredText + "' into '" + textFilteredLowerCase + "'");
    		}

    		return textFilteredLowerCase;
    	}

    	async function search() {
    		let timerId;

    		if (debug) {
    			timerId = `Autocomplete search ${inputId ? `(id: ${inputId})` : ""})`;
    			console.time(timerId);
    			console.log("Searching user entered text: '" + text + "'");
    		}

    		const textFiltered = prepareUserEnteredText(text);

    		if (textFiltered === "") {
    			if (searchFunction) {
    				// we will need to rerun the search
    				$$invalidate(0, items = []);

    				if (debug) {
    					console.log("User entered text is empty clear list of items");
    				}
    			} else {
    				$$invalidate(27, filteredListItems = listItems);

    				if (debug) {
    					console.log("User entered text is empty set the list of items to all items");
    				}
    			}

    			closeIfMinCharsToSearchReached();

    			if (debug) {
    				console.timeEnd(timerId);
    			}

    			return;
    		}

    		if (!searchFunction) {
    			processListItems(textFiltered);
    		} else // external search which provides items
    		{
    			lastRequestId = lastRequestId + 1;
    			const currentRequestId = lastRequestId;
    			$$invalidate(30, loading = true);

    			// searchFunction is a generator
    			if (searchFunction.constructor.name === "AsyncGeneratorFunction") {
    				for await (const chunk of searchFunction(textFiltered)) {
    					// a chunk of an old response: throw it away
    					if (currentRequestId < lastResponseId) {
    						return false;
    					}

    					// a chunk for a new response: reset the item list
    					if (currentRequestId > lastResponseId) {
    						$$invalidate(0, items = []);
    					}

    					lastResponseId = currentRequestId;
    					$$invalidate(0, items = [...items, ...chunk]);
    					processListItems(textFiltered);
    				}

    				// there was nothing in the chunk
    				if (lastResponseId < currentRequestId) {
    					lastResponseId = currentRequestId;
    					$$invalidate(0, items = []);
    					processListItems(textFiltered);
    				}
    			} else // searchFunction is a regular function
    			{
    				let result = await searchFunction(textFiltered);

    				// If a response to a newer request has been received
    				// while responses to this request were being loaded,
    				// then we can just throw away this outdated results.
    				if (currentRequestId < lastResponseId) {
    					return false;
    				}

    				lastResponseId = currentRequestId;
    				$$invalidate(0, items = result);
    				processListItems(textFiltered);
    			}

    			$$invalidate(30, loading = false);
    		}

    		if (debug) {
    			console.timeEnd(timerId);
    			console.log("Search found " + filteredListItems.length + " items");
    		}
    	}

    	function defaultItemFilterFunction(listItem, searchWords) {
    		var matches = numberOfMatches(listItem, searchWords);

    		if (matchAllKeywords) {
    			return matches >= searchWords.length;
    		} else {
    			return matches > 0;
    		}
    	}

    	function processListItems(textFiltered) {
    		// cleans, filters, orders, and highlights the list items
    		prepareListItems();

    		const textFilteredWithoutAccents = ignoreAccents
    		? removeAccents(textFiltered)
    		: textFiltered;

    		const searchWords = textFilteredWithoutAccents.split(/\s+/g);

    		// local search
    		let tempfilteredListItems;

    		if (localFiltering) {
    			if (itemFilterFunction) {
    				tempfilteredListItems = listItems.filter(item => itemFilterFunction(item.item, searchWords));
    			} else {
    				tempfilteredListItems = listItems.filter(item => defaultItemFilterFunction(item, searchWords));
    			}

    			if (itemSortFunction) {
    				tempfilteredListItems = tempfilteredListItems.sort((item1, item2) => itemSortFunction(item1.item, item2.item, searchWords));
    			} else {
    				if (sortByMatchedKeywords) {
    					tempfilteredListItems = tempfilteredListItems.sort((item1, item2) => defaultItemSortFunction(item1, item2, searchWords));
    				}
    			}
    		} else {
    			tempfilteredListItems = listItems;
    		}

    		const hlfilter = highlightFilter(searchWords, "label");
    		const filteredListItemsHighlighted = tempfilteredListItems.map(hlfilter);
    		$$invalidate(27, filteredListItems = filteredListItemsHighlighted);
    		closeIfMinCharsToSearchReached();
    		return true;
    	}

    	// $: text, search();
    	function selectListItem(listItem) {
    		if (debug) {
    			console.log("selectListItem", listItem);
    		}

    		if ("undefined" === typeof listItem && create) {
    			// allow undefined items if create is enabled
    			const createdItem = onCreate(text);

    			if ("undefined" !== typeof createdItem) {
    				prepareListItems();
    				$$invalidate(27, filteredListItems = listItems);
    				const index = findItemIndex(createdItem, filteredListItems);

    				if (index >= 0) {
    					$$invalidate(26, highlightIndex = index);
    					listItem = filteredListItems[highlightIndex];
    				}
    			}
    		}

    		if ("undefined" === typeof listItem) {
    			if (debug) {
    				console.log(`listItem is undefined. Can not select.`);
    			}

    			return false;
    		}

    		const newSelectedItem = listItem.item;

    		if (beforeChange(selectedItem, newSelectedItem)) {
    			// simple selection
    			if (!multiple) {
    				$$invalidate(1, selectedItem = undefined); // triggers change even if the the same item is selected
    				$$invalidate(1, selectedItem = newSelectedItem);
    			} else // first selection of multiple ones
    			if (!selectedItem) {
    				$$invalidate(1, selectedItem = [newSelectedItem]);
    			} else // selecting something already selected => unselect it
    			if (selectedItem.includes(newSelectedItem)) {
    				$$invalidate(1, selectedItem = selectedItem.filter(i => i !== newSelectedItem));
    			} else // adds the element to the selection
    			{
    				$$invalidate(1, selectedItem = [...selectedItem, newSelectedItem]);
    			}
    		}

    		return true;
    	}

    	function selectItem() {
    		if (debug) {
    			console.log("selectItem", highlightIndex);
    		}

    		const listItem = filteredListItems[highlightIndex];

    		if (selectListItem(listItem)) {
    			close();

    			if (multiple) {
    				input.focus();
    			}
    		}
    	}

    	function up() {
    		if (debug) {
    			console.log("up");
    		}

    		open();

    		if (highlightIndex > 0) {
    			$$invalidate(26, highlightIndex--, highlightIndex);
    		}

    		highlight();
    	}

    	function down() {
    		if (debug) {
    			console.log("down");
    		}

    		open();

    		if (highlightIndex < filteredListItems.length - 1) {
    			$$invalidate(26, highlightIndex++, highlightIndex);
    		}

    		highlight();
    	}

    	function highlight() {
    		if (debug) {
    			console.log("highlight");
    		}

    		const query = ".selected";

    		if (debug) {
    			console.log("Seaching DOM element: " + query + " in " + list);
    		}

    		const el = list && list.querySelector(query);

    		if (el) {
    			if (typeof el.scrollIntoViewIfNeeded === "function") {
    				if (debug) {
    					console.log("Scrolling selected item into view");
    				}

    				el.scrollIntoViewIfNeeded();
    			} else {
    				if (debug) {
    					console.warn("Could not scroll selected item into view, scrollIntoViewIfNeeded not supported");
    				}
    			}
    		} else {
    			if (debug) {
    				console.warn("Selected item not found to scroll into view");
    			}
    		}
    	}

    	function onListItemClick(listItem) {
    		if (debug) {
    			console.log("onListItemClick");
    		}

    		if (selectListItem(listItem)) {
    			close();

    			if (multiple) {
    				input.focus();
    			}
    		}
    	}

    	function onDocumentClick(e) {
    		if (debug) {
    			console.log("onDocumentClick: " + JSON.stringify(e.composedPath()));
    		}

    		if (e.composedPath().some(path => path.classList && path.classList.contains(uniqueId))) {
    			if (debug) {
    				console.log("onDocumentClick inside");
    			}

    			// resetListToAllItemsAndOpen();
    			highlight();
    		} else {
    			if (debug) {
    				console.log("onDocumentClick outside");
    			}

    			close();
    		}
    	}

    	function onKeyDown(e) {
    		if (debug) {
    			console.log("onKeyDown");
    		}

    		let key = e.key;
    		if (key === "Tab" && e.shiftKey) key = "ShiftTab";

    		const fnmap = {
    			Tab: opened ? down.bind(this) : null,
    			ShiftTab: opened ? up.bind(this) : null,
    			ArrowDown: down.bind(this),
    			ArrowUp: up.bind(this),
    			Escape: onEsc.bind(this),
    			Backspace: multiple && selectedItem && selectedItem.length && !text
    			? onBackspace.bind(this)
    			: null
    		};

    		const fn = fnmap[key];

    		if (typeof fn === "function") {
    			fn(e);
    		}
    	}

    	function onKeyPress(e) {
    		if (debug) {
    			console.log("onKeyPress");
    		}

    		if (e.key === "Enter" && opened) {
    			e.preventDefault();
    			onEnter();
    		}
    	}

    	function onEnter() {
    		selectItem();
    	}

    	function onInput(e) {
    		if (debug) {
    			console.log("onInput");
    		}

    		$$invalidate(3, text = e.target.value);

    		if (inputDelayTimeout) {
    			clearTimeout(inputDelayTimeout);
    		}

    		if (delay) {
    			inputDelayTimeout = setTimeout(processInput, delay);
    		} else {
    			processInput();
    		}
    	}

    	function unselectItem(tag) {
    		if (debug) {
    			console.log("unselectItem", tag);
    		}

    		$$invalidate(1, selectedItem = selectedItem.filter(i => i !== tag));
    		input.focus();
    	}

    	function processInput() {
    		if (search()) {
    			$$invalidate(26, highlightIndex = 0);
    			open();
    		}
    	}

    	function onInputClick() {
    		if (debug) {
    			console.log("onInputClick");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function onEsc(e) {
    		if (debug) {
    			console.log("onEsc");
    		}

    		//if (text) return clear();
    		e.stopPropagation();

    		if (opened) {
    			input.focus();
    			close();
    		}
    	}

    	function onBackspace(e) {
    		if (debug) {
    			console.log("onBackspace");
    		}

    		unselectItem(selectedItem[selectedItem.length - 1]);
    	}

    	function onFocusInternal() {
    		if (debug) {
    			console.log("onFocus");
    		}

    		onFocus();
    		resetListToAllItemsAndOpen();
    	}

    	function onBlurInternal() {
    		if (debug) {
    			console.log("onBlur");
    		}

    		onBlur();
    	}

    	function resetListToAllItemsAndOpen() {
    		if (debug) {
    			console.log("resetListToAllItemsAndOpen");
    		}

    		if (!text) {
    			$$invalidate(27, filteredListItems = listItems);
    		} else // When an async component is initialized, the item list
    		// must be loaded when the input is focused.
    		if (!listItems.length && selectedItem && searchFunction) {
    			search();
    		}

    		open();

    		// find selected item
    		if (selectedItem) {
    			if (debug) {
    				console.log("Searching currently selected item: " + JSON.stringify(selectedItem));
    			}

    			const index = findItemIndex(selectedItem, filteredListItems);

    			if (index >= 0) {
    				$$invalidate(26, highlightIndex = index);
    				highlight();
    			}
    		}
    	}

    	function findItemIndex(item, items) {
    		if (debug) {
    			console.log("Finding index for item", item);
    		}

    		let index = -1;

    		for (let i = 0; i < items.length; i++) {
    			const listItem = items[i];

    			if ("undefined" === typeof listItem) {
    				if (debug) {
    					console.log(`listItem ${i} is undefined. Skipping.`);
    				}

    				continue;
    			}

    			if (debug) {
    				console.log("Item " + i + ": " + JSON.stringify(listItem));
    			}

    			if (item == listItem.item) {
    				index = i;
    				break;
    			}
    		}

    		if (debug) {
    			if (index >= 0) {
    				console.log("Found index for item: " + index);
    			} else {
    				console.warn("Not found index for item: " + item);
    			}
    		}

    		return index;
    	}

    	function open() {
    		if (debug) {
    			console.log("open");
    		}

    		// check if the search text has more than the min chars required
    		if (isMinCharsToSearchReached()) {
    			return;
    		}

    		$$invalidate(73, opened = true);
    	}

    	function close() {
    		if (debug) {
    			console.log("close");
    		}

    		$$invalidate(73, opened = false);
    		$$invalidate(30, loading = false);

    		if (!text && selectFirstIfEmpty) {
    			$$invalidate(26, highlightIndex = 0);
    			selectItem();
    		}
    	}

    	function isMinCharsToSearchReached() {
    		return minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch;
    	}

    	function closeIfMinCharsToSearchReached() {
    		if (isMinCharsToSearchReached()) {
    			close();
    		}
    	}

    	function clear() {
    		if (debug) {
    			console.log("clear");
    		}

    		$$invalidate(3, text = "");
    		$$invalidate(1, selectedItem = multiple ? [] : undefined);

    		setTimeout(() => {
    			input.focus();
    			close();
    		});
    	}

    	function highlightFilter(keywords, field) {
    		return item => {
    			let label = item[field];
    			const newItem = Object.assign({ highlighted: undefined }, item);
    			newItem.highlighted = label;
    			const labelLowercase = label.toLowerCase();

    			const labelLowercaseNoAc = ignoreAccents
    			? removeAccents(labelLowercase)
    			: labelLowercase;

    			if (keywords && keywords.length) {
    				const positions = [];

    				for (let i = 0; i < keywords.length; i++) {
    					let keyword = keywords[i];

    					if (ignoreAccents) {
    						keyword = removeAccents(keyword);
    					}

    					const keywordLen = keyword.length;
    					let pos1 = 0;

    					do {
    						pos1 = labelLowercaseNoAc.indexOf(keyword, pos1);

    						if (pos1 >= 0) {
    							let pos2 = pos1 + keywordLen;
    							positions.push([pos1, pos2]);
    							pos1 = pos2;
    						}
    					} while (pos1 !== -1);
    				}

    				if (positions.length > 0) {
    					const keywordPatterns = new Set();

    					for (let i = 0; i < positions.length; i++) {
    						const pair = positions[i];
    						const pos1 = pair[0];
    						const pos2 = pair[1];
    						const keywordPattern = labelLowercase.substring(pos1, pos2);
    						keywordPatterns.add(keywordPattern);
    					}

    					for (let keywordPattern of keywordPatterns) {
    						// FIXME pst: workarond for wrong replacement <b> tags
    						if (keywordPattern === "b") {
    							continue;
    						}

    						const reg = new RegExp("(" + keywordPattern + ")", "ig");
    						const newHighlighted = newItem.highlighted.replace(reg, "<b>$1</b>");
    						newItem.highlighted = newHighlighted;
    					}
    				}
    			}

    			return newItem;
    		};
    	}

    	function isConfirmed(listItem) {
    		if (!selectedItem) {
    			return false;
    		}

    		if (multiple) {
    			return selectedItem.includes(listItem);
    		} else {
    			return listItem == selectedItem;
    		}
    	}

    	const writable_props = [
    		'items',
    		'searchFunction',
    		'labelFieldName',
    		'keywordsFieldName',
    		'valueFieldName',
    		'labelFunction',
    		'keywordsFunction',
    		'valueFunction',
    		'keywordsCleanFunction',
    		'textCleanFunction',
    		'beforeChange',
    		'onChange',
    		'onFocus',
    		'onBlur',
    		'onCreate',
    		'selectFirstIfEmpty',
    		'minCharactersToSearch',
    		'maxItemsToShowInList',
    		'multiple',
    		'create',
    		'ignoreAccents',
    		'matchAllKeywords',
    		'sortByMatchedKeywords',
    		'itemFilterFunction',
    		'itemSortFunction',
    		'lock',
    		'delay',
    		'localFiltering',
    		'hideArrow',
    		'showClear',
    		'showLoadingIndicator',
    		'noResultsText',
    		'loadingText',
    		'createText',
    		'placeholder',
    		'className',
    		'inputClassName',
    		'inputId',
    		'name',
    		'selectName',
    		'selectId',
    		'title',
    		'html5autocomplete',
    		'readonly',
    		'dropdownClassName',
    		'disabled',
    		'debug',
    		'selectedItem',
    		'value',
    		'highlightedItem',
    		'text'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<SimpleAutocomplete> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(28, input);
    		});
    	}

    	function input_1_input_handler() {
    		text = this.value;
    		$$invalidate(3, text);
    	}

    	const click_handler = listItem => onListItemClick(listItem);

    	const pointerenter_handler = i => {
    		$$invalidate(26, highlightIndex = i);
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			list = $$value;
    			$$invalidate(29, list);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('searchFunction' in $$props) $$invalidate(48, searchFunction = $$props.searchFunction);
    		if ('labelFieldName' in $$props) $$invalidate(49, labelFieldName = $$props.labelFieldName);
    		if ('keywordsFieldName' in $$props) $$invalidate(50, keywordsFieldName = $$props.keywordsFieldName);
    		if ('valueFieldName' in $$props) $$invalidate(51, valueFieldName = $$props.valueFieldName);
    		if ('labelFunction' in $$props) $$invalidate(52, labelFunction = $$props.labelFunction);
    		if ('keywordsFunction' in $$props) $$invalidate(53, keywordsFunction = $$props.keywordsFunction);
    		if ('valueFunction' in $$props) $$invalidate(4, valueFunction = $$props.valueFunction);
    		if ('keywordsCleanFunction' in $$props) $$invalidate(54, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ('textCleanFunction' in $$props) $$invalidate(55, textCleanFunction = $$props.textCleanFunction);
    		if ('beforeChange' in $$props) $$invalidate(56, beforeChange = $$props.beforeChange);
    		if ('onChange' in $$props) $$invalidate(57, onChange = $$props.onChange);
    		if ('onFocus' in $$props) $$invalidate(58, onFocus = $$props.onFocus);
    		if ('onBlur' in $$props) $$invalidate(59, onBlur = $$props.onBlur);
    		if ('onCreate' in $$props) $$invalidate(60, onCreate = $$props.onCreate);
    		if ('selectFirstIfEmpty' in $$props) $$invalidate(61, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ('minCharactersToSearch' in $$props) $$invalidate(62, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ('maxItemsToShowInList' in $$props) $$invalidate(5, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ('multiple' in $$props) $$invalidate(6, multiple = $$props.multiple);
    		if ('create' in $$props) $$invalidate(7, create = $$props.create);
    		if ('ignoreAccents' in $$props) $$invalidate(63, ignoreAccents = $$props.ignoreAccents);
    		if ('matchAllKeywords' in $$props) $$invalidate(64, matchAllKeywords = $$props.matchAllKeywords);
    		if ('sortByMatchedKeywords' in $$props) $$invalidate(65, sortByMatchedKeywords = $$props.sortByMatchedKeywords);
    		if ('itemFilterFunction' in $$props) $$invalidate(66, itemFilterFunction = $$props.itemFilterFunction);
    		if ('itemSortFunction' in $$props) $$invalidate(67, itemSortFunction = $$props.itemSortFunction);
    		if ('lock' in $$props) $$invalidate(8, lock = $$props.lock);
    		if ('delay' in $$props) $$invalidate(68, delay = $$props.delay);
    		if ('localFiltering' in $$props) $$invalidate(69, localFiltering = $$props.localFiltering);
    		if ('hideArrow' in $$props) $$invalidate(9, hideArrow = $$props.hideArrow);
    		if ('showClear' in $$props) $$invalidate(70, showClear = $$props.showClear);
    		if ('showLoadingIndicator' in $$props) $$invalidate(10, showLoadingIndicator = $$props.showLoadingIndicator);
    		if ('noResultsText' in $$props) $$invalidate(11, noResultsText = $$props.noResultsText);
    		if ('loadingText' in $$props) $$invalidate(12, loadingText = $$props.loadingText);
    		if ('createText' in $$props) $$invalidate(13, createText = $$props.createText);
    		if ('placeholder' in $$props) $$invalidate(14, placeholder = $$props.placeholder);
    		if ('className' in $$props) $$invalidate(15, className = $$props.className);
    		if ('inputClassName' in $$props) $$invalidate(16, inputClassName = $$props.inputClassName);
    		if ('inputId' in $$props) $$invalidate(17, inputId = $$props.inputId);
    		if ('name' in $$props) $$invalidate(18, name = $$props.name);
    		if ('selectName' in $$props) $$invalidate(19, selectName = $$props.selectName);
    		if ('selectId' in $$props) $$invalidate(20, selectId = $$props.selectId);
    		if ('title' in $$props) $$invalidate(21, title = $$props.title);
    		if ('html5autocomplete' in $$props) $$invalidate(22, html5autocomplete = $$props.html5autocomplete);
    		if ('readonly' in $$props) $$invalidate(23, readonly = $$props.readonly);
    		if ('dropdownClassName' in $$props) $$invalidate(24, dropdownClassName = $$props.dropdownClassName);
    		if ('disabled' in $$props) $$invalidate(25, disabled = $$props.disabled);
    		if ('debug' in $$props) $$invalidate(71, debug = $$props.debug);
    		if ('selectedItem' in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('highlightedItem' in $$props) $$invalidate(47, highlightedItem = $$props.highlightedItem);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('$$scope' in $$props) $$invalidate(75, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		items,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		onFocus,
    		onBlur,
    		onCreate,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		maxItemsToShowInList,
    		multiple,
    		create,
    		ignoreAccents,
    		matchAllKeywords,
    		sortByMatchedKeywords,
    		itemFilterFunction,
    		itemSortFunction,
    		lock,
    		delay,
    		localFiltering,
    		hideArrow,
    		showClear,
    		showLoadingIndicator,
    		noResultsText,
    		loadingText,
    		createText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		selectName,
    		selectId,
    		title,
    		html5autocomplete,
    		readonly,
    		dropdownClassName,
    		disabled,
    		debug,
    		selectedItem,
    		value,
    		highlightedItem,
    		uniqueId,
    		input,
    		list,
    		opened,
    		loading,
    		highlightIndex,
    		text,
    		filteredTextLength,
    		filteredListItems,
    		listItems,
    		lastRequestId,
    		lastResponseId,
    		inputDelayTimeout,
    		safeStringFunction,
    		safeLabelFunction,
    		safeKeywordsFunction,
    		prepareListItems,
    		getListItem,
    		onSelectedItemChanged,
    		prepareUserEnteredText,
    		numberOfMatches,
    		search,
    		defaultItemFilterFunction,
    		defaultItemSortFunction,
    		processListItems,
    		selectListItem,
    		selectItem,
    		up,
    		down,
    		highlight,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onEnter,
    		onInput,
    		unselectItem,
    		processInput,
    		onInputClick,
    		onEsc,
    		onBackspace,
    		onFocusInternal,
    		onBlurInternal,
    		resetListToAllItemsAndOpen,
    		findItemIndex,
    		open,
    		close,
    		isMinCharsToSearchReached,
    		closeIfMinCharsToSearchReached,
    		clear,
    		highlightFilter,
    		removeAccents,
    		isConfirmed,
    		clearable,
    		showList
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('searchFunction' in $$props) $$invalidate(48, searchFunction = $$props.searchFunction);
    		if ('labelFieldName' in $$props) $$invalidate(49, labelFieldName = $$props.labelFieldName);
    		if ('keywordsFieldName' in $$props) $$invalidate(50, keywordsFieldName = $$props.keywordsFieldName);
    		if ('valueFieldName' in $$props) $$invalidate(51, valueFieldName = $$props.valueFieldName);
    		if ('labelFunction' in $$props) $$invalidate(52, labelFunction = $$props.labelFunction);
    		if ('keywordsFunction' in $$props) $$invalidate(53, keywordsFunction = $$props.keywordsFunction);
    		if ('valueFunction' in $$props) $$invalidate(4, valueFunction = $$props.valueFunction);
    		if ('keywordsCleanFunction' in $$props) $$invalidate(54, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ('textCleanFunction' in $$props) $$invalidate(55, textCleanFunction = $$props.textCleanFunction);
    		if ('beforeChange' in $$props) $$invalidate(56, beforeChange = $$props.beforeChange);
    		if ('onChange' in $$props) $$invalidate(57, onChange = $$props.onChange);
    		if ('onFocus' in $$props) $$invalidate(58, onFocus = $$props.onFocus);
    		if ('onBlur' in $$props) $$invalidate(59, onBlur = $$props.onBlur);
    		if ('onCreate' in $$props) $$invalidate(60, onCreate = $$props.onCreate);
    		if ('selectFirstIfEmpty' in $$props) $$invalidate(61, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ('minCharactersToSearch' in $$props) $$invalidate(62, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ('maxItemsToShowInList' in $$props) $$invalidate(5, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ('multiple' in $$props) $$invalidate(6, multiple = $$props.multiple);
    		if ('create' in $$props) $$invalidate(7, create = $$props.create);
    		if ('ignoreAccents' in $$props) $$invalidate(63, ignoreAccents = $$props.ignoreAccents);
    		if ('matchAllKeywords' in $$props) $$invalidate(64, matchAllKeywords = $$props.matchAllKeywords);
    		if ('sortByMatchedKeywords' in $$props) $$invalidate(65, sortByMatchedKeywords = $$props.sortByMatchedKeywords);
    		if ('itemFilterFunction' in $$props) $$invalidate(66, itemFilterFunction = $$props.itemFilterFunction);
    		if ('itemSortFunction' in $$props) $$invalidate(67, itemSortFunction = $$props.itemSortFunction);
    		if ('lock' in $$props) $$invalidate(8, lock = $$props.lock);
    		if ('delay' in $$props) $$invalidate(68, delay = $$props.delay);
    		if ('localFiltering' in $$props) $$invalidate(69, localFiltering = $$props.localFiltering);
    		if ('hideArrow' in $$props) $$invalidate(9, hideArrow = $$props.hideArrow);
    		if ('showClear' in $$props) $$invalidate(70, showClear = $$props.showClear);
    		if ('showLoadingIndicator' in $$props) $$invalidate(10, showLoadingIndicator = $$props.showLoadingIndicator);
    		if ('noResultsText' in $$props) $$invalidate(11, noResultsText = $$props.noResultsText);
    		if ('loadingText' in $$props) $$invalidate(12, loadingText = $$props.loadingText);
    		if ('createText' in $$props) $$invalidate(13, createText = $$props.createText);
    		if ('placeholder' in $$props) $$invalidate(14, placeholder = $$props.placeholder);
    		if ('className' in $$props) $$invalidate(15, className = $$props.className);
    		if ('inputClassName' in $$props) $$invalidate(16, inputClassName = $$props.inputClassName);
    		if ('inputId' in $$props) $$invalidate(17, inputId = $$props.inputId);
    		if ('name' in $$props) $$invalidate(18, name = $$props.name);
    		if ('selectName' in $$props) $$invalidate(19, selectName = $$props.selectName);
    		if ('selectId' in $$props) $$invalidate(20, selectId = $$props.selectId);
    		if ('title' in $$props) $$invalidate(21, title = $$props.title);
    		if ('html5autocomplete' in $$props) $$invalidate(22, html5autocomplete = $$props.html5autocomplete);
    		if ('readonly' in $$props) $$invalidate(23, readonly = $$props.readonly);
    		if ('dropdownClassName' in $$props) $$invalidate(24, dropdownClassName = $$props.dropdownClassName);
    		if ('disabled' in $$props) $$invalidate(25, disabled = $$props.disabled);
    		if ('debug' in $$props) $$invalidate(71, debug = $$props.debug);
    		if ('selectedItem' in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('highlightedItem' in $$props) $$invalidate(47, highlightedItem = $$props.highlightedItem);
    		if ('input' in $$props) $$invalidate(28, input = $$props.input);
    		if ('list' in $$props) $$invalidate(29, list = $$props.list);
    		if ('opened' in $$props) $$invalidate(73, opened = $$props.opened);
    		if ('loading' in $$props) $$invalidate(30, loading = $$props.loading);
    		if ('highlightIndex' in $$props) $$invalidate(26, highlightIndex = $$props.highlightIndex);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('filteredTextLength' in $$props) $$invalidate(74, filteredTextLength = $$props.filteredTextLength);
    		if ('filteredListItems' in $$props) $$invalidate(27, filteredListItems = $$props.filteredListItems);
    		if ('listItems' in $$props) listItems = $$props.listItems;
    		if ('lastRequestId' in $$props) lastRequestId = $$props.lastRequestId;
    		if ('lastResponseId' in $$props) lastResponseId = $$props.lastResponseId;
    		if ('inputDelayTimeout' in $$props) inputDelayTimeout = $$props.inputDelayTimeout;
    		if ('clearable' in $$props) $$invalidate(31, clearable = $$props.clearable);
    		if ('showList' in $$props) $$invalidate(32, showList = $$props.showList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*items*/ 1) {
    			// -- Reactivity --
    			(prepareListItems());
    		}

    		if ($$self.$$.dirty[0] & /*selectedItem*/ 2) {
    			(onSelectedItemChanged());
    		}

    		if ($$self.$$.dirty[0] & /*filteredListItems, highlightIndex*/ 201326592) {
    			$$invalidate(47, highlightedItem = filteredListItems && highlightIndex && highlightIndex >= 0 && highlightIndex < filteredListItems.length
    			? filteredListItems[highlightIndex].item
    			: null);
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 1 | $$self.$$.dirty[2] & /*opened, filteredTextLength*/ 6144) {
    			$$invalidate(32, showList = opened && (items && items.length > 0 || filteredTextLength > 0));
    		}

    		if ($$self.$$.dirty[0] & /*lock, multiple, selectedItem*/ 322 | $$self.$$.dirty[2] & /*showClear*/ 256) {
    			$$invalidate(31, clearable = showClear || (lock || multiple) && selectedItem);
    		}
    	};

    	return [
    		items,
    		selectedItem,
    		value,
    		text,
    		valueFunction,
    		maxItemsToShowInList,
    		multiple,
    		create,
    		lock,
    		hideArrow,
    		showLoadingIndicator,
    		noResultsText,
    		loadingText,
    		createText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		selectName,
    		selectId,
    		title,
    		html5autocomplete,
    		readonly,
    		dropdownClassName,
    		disabled,
    		highlightIndex,
    		filteredListItems,
    		input,
    		list,
    		loading,
    		clearable,
    		showList,
    		uniqueId,
    		safeLabelFunction,
    		selectItem,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		unselectItem,
    		onInputClick,
    		onFocusInternal,
    		onBlurInternal,
    		clear,
    		isConfirmed,
    		highlightedItem,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		onFocus,
    		onBlur,
    		onCreate,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		ignoreAccents,
    		matchAllKeywords,
    		sortByMatchedKeywords,
    		itemFilterFunction,
    		itemSortFunction,
    		delay,
    		localFiltering,
    		showClear,
    		debug,
    		highlightFilter,
    		opened,
    		filteredTextLength,
    		$$scope,
    		slots,
    		input_1_binding,
    		input_1_input_handler,
    		click_handler,
    		pointerenter_handler,
    		div1_binding
    	];
    }

    class SimpleAutocomplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				items: 0,
    				searchFunction: 48,
    				labelFieldName: 49,
    				keywordsFieldName: 50,
    				valueFieldName: 51,
    				labelFunction: 52,
    				keywordsFunction: 53,
    				valueFunction: 4,
    				keywordsCleanFunction: 54,
    				textCleanFunction: 55,
    				beforeChange: 56,
    				onChange: 57,
    				onFocus: 58,
    				onBlur: 59,
    				onCreate: 60,
    				selectFirstIfEmpty: 61,
    				minCharactersToSearch: 62,
    				maxItemsToShowInList: 5,
    				multiple: 6,
    				create: 7,
    				ignoreAccents: 63,
    				matchAllKeywords: 64,
    				sortByMatchedKeywords: 65,
    				itemFilterFunction: 66,
    				itemSortFunction: 67,
    				lock: 8,
    				delay: 68,
    				localFiltering: 69,
    				hideArrow: 9,
    				showClear: 70,
    				showLoadingIndicator: 10,
    				noResultsText: 11,
    				loadingText: 12,
    				createText: 13,
    				placeholder: 14,
    				className: 15,
    				inputClassName: 16,
    				inputId: 17,
    				name: 18,
    				selectName: 19,
    				selectId: 20,
    				title: 21,
    				html5autocomplete: 22,
    				readonly: 23,
    				dropdownClassName: 24,
    				disabled: 25,
    				debug: 71,
    				selectedItem: 1,
    				value: 2,
    				highlightedItem: 47,
    				text: 3,
    				highlightFilter: 72
    			},
    			null,
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SimpleAutocomplete",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[3] === undefined && !('text' in props)) {
    			console_1$2.warn("<SimpleAutocomplete> was created without expected prop 'text'");
    		}
    	}

    	get items() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beforeChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beforeChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocus() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocus(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBlur() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBlur(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCreate() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCreate(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectFirstIfEmpty() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectFirstIfEmpty(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minCharactersToSearch() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minCharactersToSearch(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxItemsToShowInList() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxItemsToShowInList(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get create() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set create(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ignoreAccents() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ignoreAccents(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get matchAllKeywords() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matchAllKeywords(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortByMatchedKeywords() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortByMatchedKeywords(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilterFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilterFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemSortFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemSortFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lock() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lock(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get localFiltering() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set localFiltering(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideArrow() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideArrow(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClear() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClear(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showLoadingIndicator() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showLoadingIndicator(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noResultsText() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noResultsText(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadingText() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadingText(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createText() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createText(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectId() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectId(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get html5autocomplete() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set html5autocomplete(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debug() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedItem() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedItem(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlightedItem() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlightedItem(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlightFilter() {
    		return this.$$.ctx[72];
    	}

    	set highlightFilter(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let MorderAddProductEntryPopupInitialState = {
        isOpen: false,
        product:undefined
    };

    function createMorderAddProductEntryStore() {
        const { subscribe, set, update } = writable(MorderAddProductEntryPopupInitialState);

        return {
            subscribe,
            open: (product) => {
                update(state => ({ ...state, isOpen: true, product: product }));
            },
            close: () => {
                update(state => ({ ...state, isOpen: false, product: undefined }));
            },
            
        }
    }

    const morderAddProductEntryPopupStore = createMorderAddProductEntryStore();

    /* src\components\popups\MorderAddProductEntryPopup.svelte generated by Svelte v3.44.3 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\components\\popups\\MorderAddProductEntryPopup.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (50:0) {#if $morderAddProductEntryPopupStore.isOpen && $morderAddProductEntryPopupStore.product != undefined}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let mounted;
    	let dispose;
    	let if_block = /*$morderAddProductEntryPopupStore*/ ctx[8].isOpen && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "overlay svelte-nfr7vy");
    			set_style(div0, "z-index", /*modal_zIndex*/ ctx[9] + 5);
    			add_location(div0, file$1, 51, 8, 1780);
    			attr_dev(div1, "id", "singleAmountPopup");
    			set_style(div1, "z-index", /*modal_zIndex*/ ctx[9]);
    			attr_dev(div1, "class", "modal active svelte-nfr7vy");
    			add_location(div1, file$1, 50, 4, 1689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*closeModal*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*$morderAddProductEntryPopupStore*/ ctx[8].isOpen) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$morderAddProductEntryPopupStore*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(50:0) {#if $morderAddProductEntryPopupStore.isOpen && $morderAddProductEntryPopupStore.product != undefined}",
    		ctx
    	});

    	return block;
    }

    // (53:12) {#if $morderAddProductEntryPopupStore.isOpen}
    function create_if_block_1$1(ctx) {
    	let div4;
    	let div1;
    	let button0;
    	let t1;
    	let div0;
    	let t2;
    	let t3_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.product.title + "";
    	let t3;
    	let t4;
    	let button1;
    	let t6;
    	let div3;
    	let input0;
    	let input0_value_value;
    	let t7;
    	let input1;
    	let input1_value_value;
    	let t8;
    	let div2;
    	let label0;
    	let t10;
    	let select0;
    	let option0;
    	let t12;
    	let label1;
    	let t14;
    	let select1;
    	let option1;
    	let t16;
    	let label2;
    	let t18;
    	let select2;
    	let option2;
    	let t20;
    	let label3;
    	let t22;
    	let input2;
    	let t23;
    	let t24;
    	let button2;
    	let div4_intro;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*ALL_COLORS*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*ALL_SIZES*/ ctx[1].sort(func$1);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*ALL_VERIENTS*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*error_message*/ ctx[7] != '' && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "x";
    			t1 = space();
    			div0 = element("div");
    			t2 = text("ערוך משתנים ל ");
    			t3 = text(t3_value);
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "x";
    			t6 = space();
    			div3 = element("div");
    			input0 = element("input");
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "צבע";
    			t10 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "בחר צבע";

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t12 = space();
    			label1 = element("label");
    			label1.textContent = "מידה";
    			t14 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "בחר מידה";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t16 = space();
    			label2 = element("label");
    			label2.textContent = "מודל";
    			t18 = space();
    			select2 = element("select");
    			option2 = element("option");
    			option2.textContent = "בחר מודל";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			label3 = element("label");
    			label3.textContent = "כמות";
    			t22 = space();
    			input2 = element("input");
    			t23 = space();
    			if (if_block) if_block.c();
    			t24 = space();
    			button2 = element("button");
    			button2.textContent = "שמור";
    			attr_dev(button0, "title", "Close");
    			attr_dev(button0, "class", "close-btn right");
    			add_location(button0, file$1, 55, 20, 2129);
    			attr_dev(div0, "class", "modal-title svelte-nfr7vy");
    			add_location(div0, file$1, 56, 20, 2228);
    			attr_dev(button1, "title", "Close");
    			attr_dev(button1, "class", "close-btn left");
    			add_location(button1, file$1, 57, 20, 2350);
    			attr_dev(div1, "class", "modal-header svelte-nfr7vy");
    			add_location(div1, file$1, 54, 16, 2082);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "product_id");
    			input0.value = input0_value_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.product.id;
    			add_location(input0, file$1, 61, 20, 2533);
    			attr_dev(input1, "type", "hidden");
    			attr_dev(input1, "name", "entry_id");
    			input1.value = input1_value_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.entry_id;
    			add_location(input1, file$1, 62, 20, 2655);
    			attr_dev(label0, "for", "color");
    			add_location(label0, file$1, 64, 24, 2826);
    			attr_dev(option0, "default", "");
    			option0.__value = "undefined";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 66, 32, 3000);
    			attr_dev(select0, "class", "form-control");
    			attr_dev(select0, "name", "color");
    			attr_dev(select0, "id", "color");
    			if (/*selected_color*/ ctx[3] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[12].call(select0));
    			add_location(select0, file$1, 65, 28, 2885);
    			attr_dev(label1, "for", "size");
    			add_location(label1, file$1, 72, 24, 3297);
    			attr_dev(option1, "default", "");
    			option1.__value = "undefined";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 74, 32, 3468);
    			attr_dev(select1, "class", "form-control");
    			attr_dev(select1, "name", "size");
    			attr_dev(select1, "id", "size");
    			if (/*selected_size*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[13].call(select1));
    			add_location(select1, file$1, 73, 28, 3356);
    			attr_dev(label2, "for", "varient");
    			add_location(label2, file$1, 82, 24, 3887);
    			attr_dev(option2, "default", "");
    			option2.__value = "undefined";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 84, 32, 4070);
    			attr_dev(select2, "class", "form-control");
    			attr_dev(select2, "name", "varient");
    			attr_dev(select2, "id", "varient");
    			if (/*selected_verient*/ ctx[5] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[14].call(select2));
    			add_location(select2, file$1, 83, 28, 3949);
    			attr_dev(label3, "for", "amount");
    			add_location(label3, file$1, 90, 24, 4400);
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "name", "amount");
    			attr_dev(input2, "id", "amount");
    			add_location(input2, file$1, 91, 28, 4461);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$1, 63, 24, 2777);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "class", "btn btn-primary");
    			add_location(button2, file$1, 96, 20, 4736);
    			attr_dev(div3, "class", "modal-body svelte-nfr7vy");
    			add_location(div3, file$1, 60, 16, 2488);
    			attr_dev(div4, "class", "modal_content svelte-nfr7vy");
    			set_style(div4, "z-index", /*modal_zIndex*/ ctx[9] + 10);
    			add_location(div4, file$1, 53, 12, 1929);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, input0);
    			append_dev(div3, t7);
    			append_dev(div3, input1);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t10);
    			append_dev(div2, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*selected_color*/ ctx[3]);
    			append_dev(div2, t12);
    			append_dev(div2, label1);
    			append_dev(div2, t14);
    			append_dev(div2, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*selected_size*/ ctx[4]);
    			append_dev(div2, t16);
    			append_dev(div2, label2);
    			append_dev(div2, t18);
    			append_dev(div2, select2);
    			append_dev(select2, option2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			select_option(select2, /*selected_verient*/ ctx[5]);
    			append_dev(div2, t20);
    			append_dev(div2, label3);
    			append_dev(div2, t22);
    			append_dev(div2, input2);
    			set_input_value(input2, /*selected_amount*/ ctx[6]);
    			append_dev(div3, t23);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t24);
    			append_dev(div3, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*closeModal*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*closeModal*/ ctx[10], false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[12]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[13]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[14]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(button2, "click", /*add_entry_btn_clicked*/ ctx[11], false, false, false),
    					listen_dev(div4, "click", stop_propagation(click_handler), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$morderAddProductEntryPopupStore*/ 256 && t3_value !== (t3_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.product.title + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*$morderAddProductEntryPopupStore*/ 256 && input0_value_value !== (input0_value_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.product.id)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*$morderAddProductEntryPopupStore*/ 256 && input1_value_value !== (input1_value_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.entry_id)) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*ALL_COLORS*/ 1) {
    				each_value_2 = /*ALL_COLORS*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*selected_color, ALL_COLORS*/ 9) {
    				select_option(select0, /*selected_color*/ ctx[3]);
    			}

    			if (dirty & /*ALL_SIZES*/ 2) {
    				each_value_1 = /*ALL_SIZES*/ ctx[1].sort(func$1);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selected_size, ALL_SIZES*/ 18) {
    				select_option(select1, /*selected_size*/ ctx[4]);
    			}

    			if (dirty & /*ALL_VERIENTS*/ 4) {
    				each_value = /*ALL_VERIENTS*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected_verient, ALL_VERIENTS*/ 36) {
    				select_option(select2, /*selected_verient*/ ctx[5]);
    			}

    			if (dirty & /*selected_amount*/ 64 && to_number(input2.value) !== /*selected_amount*/ ctx[6]) {
    				set_input_value(input2, /*selected_amount*/ ctx[6]);
    			}

    			if (/*error_message*/ ctx[7] != '') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(div3, t24);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (!div4_intro) {
    				add_render_callback(() => {
    					div4_intro = create_in_transition(div4, fly, { y: 200, duration: 200 });
    					div4_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(53:12) {#if $morderAddProductEntryPopupStore.isOpen}",
    		ctx
    	});

    	return block;
    }

    // (68:32) {#each ALL_COLORS as color}
    function create_each_block_2$1(ctx) {
    	let option;
    	let t_value = /*color*/ ctx[22]['name'] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*color*/ ctx[22]['id'];
    			option.value = option.__value;
    			add_location(option, file$1, 68, 32, 3141);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ALL_COLORS*/ 1 && t_value !== (t_value = /*color*/ ctx[22]['name'] + "")) set_data_dev(t, t_value);

    			if (dirty & /*ALL_COLORS*/ 1 && option_value_value !== (option_value_value = /*color*/ ctx[22]['id'])) {
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
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(68:32) {#each ALL_COLORS as color}",
    		ctx
    	});

    	return block;
    }

    // (76:32) {#each ALL_SIZES.sort((a, b) => {                                     return a.code.localeCompare(b.code);                                 }) as size}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*size*/ ctx[19]['size'] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*size*/ ctx[19]['id'];
    			option.value = option.__value;
    			add_location(option, file$1, 78, 32, 3733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ALL_SIZES*/ 2 && t_value !== (t_value = /*size*/ ctx[19]['size'] + "")) set_data_dev(t, t_value);

    			if (dirty & /*ALL_SIZES*/ 2 && option_value_value !== (option_value_value = /*size*/ ctx[19]['id'])) {
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(76:32) {#each ALL_SIZES.sort((a, b) => {                                     return a.code.localeCompare(b.code);                                 }) as size}",
    		ctx
    	});

    	return block;
    }

    // (86:32) {#each ALL_VERIENTS as varient}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*varient*/ ctx[16]['name'] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*varient*/ ctx[16]['id'];
    			option.value = option.__value;
    			add_location(option, file$1, 86, 32, 4216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ALL_VERIENTS*/ 4 && t_value !== (t_value = /*varient*/ ctx[16]['name'] + "")) set_data_dev(t, t_value);

    			if (dirty & /*ALL_VERIENTS*/ 4 && option_value_value !== (option_value_value = /*varient*/ ctx[16]['id'])) {
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(86:32) {#each ALL_VERIENTS as varient}",
    		ctx
    	});

    	return block;
    }

    // (94:24) {#if error_message != ''}
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*error_message*/ ctx[7]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error_message*/ 128) set_data_dev(t, /*error_message*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(94:24) {#if error_message != ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*$morderAddProductEntryPopupStore*/ ctx[8].isOpen && /*$morderAddProductEntryPopupStore*/ ctx[8].product != undefined && create_if_block$1(ctx);

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
    			if (/*$morderAddProductEntryPopupStore*/ ctx[8].isOpen && /*$morderAddProductEntryPopupStore*/ ctx[8].product != undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$morderAddProductEntryPopupStore*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
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

    const func$1 = (a, b) => {
    	return a.code.localeCompare(b.code);
    };

    const click_handler = () => {
    	
    };

    function instance$1($$self, $$props, $$invalidate) {
    	let $morderAddProductEntryPopupStore;
    	validate_store(morderAddProductEntryPopupStore, 'morderAddProductEntryPopupStore');
    	component_subscribe($$self, morderAddProductEntryPopupStore, $$value => $$invalidate(8, $morderAddProductEntryPopupStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MorderAddProductEntryPopup', slots, []);
    	let { ALL_COLORS } = $$props;
    	let { ALL_SIZES } = $$props;
    	let { ALL_VERIENTS } = $$props;
    	let modal_zIndex = 10;
    	let selected_color = undefined;
    	let selected_size = undefined;
    	let selected_verient = undefined;
    	let selected_amount = 1;
    	let error_message = '';

    	function closeModal() {
    		morderAddProductEntryPopupStore.close();
    	}

    	function add_entry_btn_clicked(e) {
    		e.preventDefault();

    		if (selected_color == undefined) {
    			$$invalidate(7, error_message = 'חייב לבחור צבע');
    			return;
    		} else if (selected_size == undefined) {
    			$$invalidate(7, error_message = 'חייב לבחור מידה');
    			return;
    		}

    		console.log('looking for ', selected_size, selected_color, selected_verient, selected_amount, ' in ', $morderAddProductEntryPopupStore.product.entries);
    		let entry = $morderAddProductEntryPopupStore.product.entries.find(entry => entry.size == selected_size && entry.color == selected_color && entry.varient == selected_verient);

    		if (entry) {
    			entry.quantity = selected_amount;
    		} else {
    			$morderAddProductEntryPopupStore.product.entries.push({
    				size: selected_size,
    				color: selected_color,
    				varient: selected_verient,
    				quantity: selected_amount
    			});
    		}

    		morderAddProductEntryPopupStore.close();
    	}

    	const writable_props = ['ALL_COLORS', 'ALL_SIZES', 'ALL_VERIENTS'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MorderAddProductEntryPopup> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selected_color = select_value(this);
    		$$invalidate(3, selected_color);
    		$$invalidate(0, ALL_COLORS);
    	}

    	function select1_change_handler() {
    		selected_size = select_value(this);
    		$$invalidate(4, selected_size);
    		$$invalidate(1, ALL_SIZES);
    	}

    	function select2_change_handler() {
    		selected_verient = select_value(this);
    		$$invalidate(5, selected_verient);
    		$$invalidate(2, ALL_VERIENTS);
    	}

    	function input2_input_handler() {
    		selected_amount = to_number(this.value);
    		$$invalidate(6, selected_amount);
    	}

    	$$self.$$set = $$props => {
    		if ('ALL_COLORS' in $$props) $$invalidate(0, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_SIZES' in $$props) $$invalidate(1, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(2, ALL_VERIENTS = $$props.ALL_VERIENTS);
    	};

    	$$self.$capture_state = () => ({
    		morderAddProductEntryPopupStore,
    		fly,
    		ALL_COLORS,
    		ALL_SIZES,
    		ALL_VERIENTS,
    		modal_zIndex,
    		selected_color,
    		selected_size,
    		selected_verient,
    		selected_amount,
    		error_message,
    		closeModal,
    		add_entry_btn_clicked,
    		$morderAddProductEntryPopupStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('ALL_COLORS' in $$props) $$invalidate(0, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_SIZES' in $$props) $$invalidate(1, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(2, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('modal_zIndex' in $$props) $$invalidate(9, modal_zIndex = $$props.modal_zIndex);
    		if ('selected_color' in $$props) $$invalidate(3, selected_color = $$props.selected_color);
    		if ('selected_size' in $$props) $$invalidate(4, selected_size = $$props.selected_size);
    		if ('selected_verient' in $$props) $$invalidate(5, selected_verient = $$props.selected_verient);
    		if ('selected_amount' in $$props) $$invalidate(6, selected_amount = $$props.selected_amount);
    		if ('error_message' in $$props) $$invalidate(7, error_message = $$props.error_message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ALL_COLORS,
    		ALL_SIZES,
    		ALL_VERIENTS,
    		selected_color,
    		selected_size,
    		selected_verient,
    		selected_amount,
    		error_message,
    		$morderAddProductEntryPopupStore,
    		modal_zIndex,
    		closeModal,
    		add_entry_btn_clicked,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		input2_input_handler
    	];
    }

    class MorderAddProductEntryPopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			ALL_COLORS: 0,
    			ALL_SIZES: 1,
    			ALL_VERIENTS: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MorderAddProductEntryPopup",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ALL_COLORS*/ ctx[0] === undefined && !('ALL_COLORS' in props)) {
    			console_1$1.warn("<MorderAddProductEntryPopup> was created without expected prop 'ALL_COLORS'");
    		}

    		if (/*ALL_SIZES*/ ctx[1] === undefined && !('ALL_SIZES' in props)) {
    			console_1$1.warn("<MorderAddProductEntryPopup> was created without expected prop 'ALL_SIZES'");
    		}

    		if (/*ALL_VERIENTS*/ ctx[2] === undefined && !('ALL_VERIENTS' in props)) {
    			console_1$1.warn("<MorderAddProductEntryPopup> was created without expected prop 'ALL_VERIENTS'");
    		}
    	}

    	get ALL_COLORS() {
    		throw new Error("<MorderAddProductEntryPopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_COLORS(value) {
    		throw new Error("<MorderAddProductEntryPopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_SIZES() {
    		throw new Error("<MorderAddProductEntryPopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_SIZES(value) {
    		throw new Error("<MorderAddProductEntryPopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_VERIENTS() {
    		throw new Error("<MorderAddProductEntryPopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_VERIENTS(value) {
    		throw new Error("<MorderAddProductEntryPopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MyMorderEdit.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;

    const file = "src\\MyMorderEdit.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	child_ctx[40] = list;
    	child_ctx[41] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[48] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    // (270:2) {#if headerData}
    function create_if_block_7(ctx) {
    	let div0;
    	let t0;
    	let t1_value = new Date(/*headerData*/ ctx[0][0].created).toLocaleString("Israel") + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4_value = new Date(/*headerData*/ ctx[0][0].updated).toLocaleString("Israel") + "";
    	let t4;
    	let t5;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t7;
    	let th1;
    	let t9;
    	let th2;
    	let t11;
    	let th3;
    	let t13;
    	let th4;
    	let t15;
    	let th5;
    	let t17;
    	let th6;
    	let t19;
    	let th7;
    	let t21;
    	let tbody;
    	let tr1;
    	let td0;
    	let t22_value = /*headerData*/ ctx[0][0].id + "";
    	let t22;
    	let t23;
    	let td1;
    	let input0;
    	let t24;
    	let td2;
    	let input1;
    	let t25;
    	let td3;
    	let textarea0;
    	let t26;
    	let td4;
    	let input2;
    	let t27;
    	let td5;
    	let select;
    	let t28;
    	let textarea1;
    	let t29;
    	let td6;
    	let t30_value = /*headerData*/ ctx[0][0].client_name + "";
    	let t30;
    	let t31;
    	let td7;
    	let t32_value = /*headerData*/ ctx[0][0].agent + "";
    	let t32;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*STATUS_OPTIONS*/ ctx[14];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

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
    			th0 = element("th");
    			th0.textContent = "מזהה";
    			t7 = space();
    			th1 = element("th");
    			th1.textContent = "שם";
    			t9 = space();
    			th2 = element("th");
    			th2.textContent = "דואר אלקטרוני";
    			t11 = space();
    			th3 = element("th");
    			th3.textContent = "הודעה";
    			t13 = space();
    			th4 = element("th");
    			th4.textContent = "טלפון";
    			t15 = space();
    			th5 = element("th");
    			th5.textContent = "סטטוס";
    			t17 = space();
    			th6 = element("th");
    			th6.textContent = "שם העסק";
    			t19 = space();
    			th7 = element("th");
    			th7.textContent = "סוכן";
    			t21 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t24 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t25 = space();
    			td3 = element("td");
    			textarea0 = element("textarea");
    			t26 = space();
    			td4 = element("td");
    			input2 = element("input");
    			t27 = space();
    			td5 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t28 = space();
    			textarea1 = element("textarea");
    			t29 = space();
    			td6 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td7 = element("td");
    			t32 = text(t32_value);
    			attr_dev(div0, "class", "created svelte-czqtu8");
    			add_location(div0, file, 270, 4, 7780);
    			attr_dev(div1, "class", "updated svelte-czqtu8");
    			add_location(div1, file, 273, 4, 7888);
    			attr_dev(th0, "class", "svelte-czqtu8");
    			add_location(th0, file, 279, 10, 8064);
    			attr_dev(th1, "class", "svelte-czqtu8");
    			add_location(th1, file, 280, 10, 8088);
    			attr_dev(th2, "class", "svelte-czqtu8");
    			add_location(th2, file, 281, 10, 8110);
    			attr_dev(th3, "class", "svelte-czqtu8");
    			add_location(th3, file, 282, 10, 8143);
    			attr_dev(th4, "class", "svelte-czqtu8");
    			add_location(th4, file, 283, 10, 8168);
    			attr_dev(th5, "class", "svelte-czqtu8");
    			add_location(th5, file, 284, 10, 8193);
    			attr_dev(th6, "class", "svelte-czqtu8");
    			add_location(th6, file, 285, 10, 8218);
    			attr_dev(th7, "class", "svelte-czqtu8");
    			add_location(th7, file, 286, 10, 8245);
    			add_location(tr0, file, 278, 8, 8049);
    			attr_dev(thead, "class", "svelte-czqtu8");
    			add_location(thead, file, 277, 6, 8033);
    			attr_dev(td0, "class", "header-cell svelte-czqtu8");
    			add_location(td0, file, 291, 10, 8325);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "שם");
    			attr_dev(input0, "class", "svelte-czqtu8");
    			add_location(input0, file, 293, 12, 8420);
    			attr_dev(td1, "class", "header-cell svelte-czqtu8");
    			add_location(td1, file, 292, 10, 8383);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "אימייל");
    			attr_dev(input1, "class", "svelte-czqtu8");
    			add_location(input1, file, 300, 12, 8608);
    			attr_dev(td2, "class", "header-cell svelte-czqtu8");
    			add_location(td2, file, 299, 10, 8571);
    			attr_dev(textarea0, "placeholder", "הודעה");
    			add_location(textarea0, file, 307, 13, 8802);
    			attr_dev(td3, "class", "header-cell svelte-czqtu8");
    			add_location(td3, file, 306, 10, 8765);
    			attr_dev(input2, "type", "phone");
    			attr_dev(input2, "placeholder", "טלפון");
    			attr_dev(input2, "class", "svelte-czqtu8");
    			add_location(input2, file, 310, 12, 8933);
    			attr_dev(td4, "class", "header-cell svelte-czqtu8");
    			add_location(td4, file, 309, 10, 8896);
    			attr_dev(select, "class", "status-select svelte-czqtu8");
    			if (/*headerData*/ ctx[0][0].status === void 0) add_render_callback(() => /*select_change_handler*/ ctx[20].call(select));
    			add_location(select, file, 317, 12, 9126);
    			attr_dev(textarea1, "cols", "18");
    			attr_dev(textarea1, "placeholder", "הערות לסטטוס");
    			add_location(textarea1, file, 324, 12, 9426);
    			attr_dev(td5, "class", "header-cell svelte-czqtu8");
    			add_location(td5, file, 316, 10, 9089);
    			attr_dev(td6, "class", "header-cell svelte-czqtu8");
    			add_location(td6, file, 330, 10, 9594);
    			attr_dev(td7, "class", "header-cell svelte-czqtu8");
    			add_location(td7, file, 331, 10, 9661);
    			add_location(tr1, file, 290, 8, 8310);
    			add_location(tbody, file, 289, 6, 8294);
    			attr_dev(table, "class", "headers-table svelte-czqtu8");
    			add_location(table, file, 276, 4, 7997);
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
    			append_dev(tr0, th0);
    			append_dev(tr0, t7);
    			append_dev(tr0, th1);
    			append_dev(tr0, t9);
    			append_dev(tr0, th2);
    			append_dev(tr0, t11);
    			append_dev(tr0, th3);
    			append_dev(tr0, t13);
    			append_dev(tr0, th4);
    			append_dev(tr0, t15);
    			append_dev(tr0, th5);
    			append_dev(tr0, t17);
    			append_dev(tr0, th6);
    			append_dev(tr0, t19);
    			append_dev(tr0, th7);
    			append_dev(table, t21);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t22);
    			append_dev(tr1, t23);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*headerData*/ ctx[0][0].name);
    			append_dev(tr1, t24);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*headerData*/ ctx[0][0].email);
    			append_dev(tr1, t25);
    			append_dev(tr1, td3);
    			append_dev(td3, textarea0);
    			set_input_value(textarea0, /*headerData*/ ctx[0][0].message);
    			append_dev(tr1, t26);
    			append_dev(tr1, td4);
    			append_dev(td4, input2);
    			set_input_value(input2, /*headerData*/ ctx[0][0].phone);
    			append_dev(tr1, t27);
    			append_dev(tr1, td5);
    			append_dev(td5, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*headerData*/ ctx[0][0].status);
    			append_dev(td5, t28);
    			append_dev(td5, textarea1);
    			set_input_value(textarea1, /*headerData*/ ctx[0][0].status_msg);
    			append_dev(tr1, t29);
    			append_dev(tr1, td6);
    			append_dev(td6, t30);
    			append_dev(tr1, t31);
    			append_dev(tr1, td7);
    			append_dev(td7, t32);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[17]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[18]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[20]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[21])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headerData*/ 1 && t1_value !== (t1_value = new Date(/*headerData*/ ctx[0][0].created).toLocaleString("Israel") + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*headerData*/ 1 && t4_value !== (t4_value = new Date(/*headerData*/ ctx[0][0].updated).toLocaleString("Israel") + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*headerData*/ 1 && t22_value !== (t22_value = /*headerData*/ ctx[0][0].id + "")) set_data_dev(t22, t22_value);

    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385 && input0.value !== /*headerData*/ ctx[0][0].name) {
    				set_input_value(input0, /*headerData*/ ctx[0][0].name);
    			}

    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385 && input1.value !== /*headerData*/ ctx[0][0].email) {
    				set_input_value(input1, /*headerData*/ ctx[0][0].email);
    			}

    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385) {
    				set_input_value(textarea0, /*headerData*/ ctx[0][0].message);
    			}

    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385) {
    				set_input_value(input2, /*headerData*/ ctx[0][0].phone);
    			}

    			if (dirty[0] & /*STATUS_OPTIONS, headerData*/ 16385) {
    				each_value_4 = /*STATUS_OPTIONS*/ ctx[14];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385) {
    				select_option(select, /*headerData*/ ctx[0][0].status);
    			}

    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385) {
    				set_input_value(textarea1, /*headerData*/ ctx[0][0].status_msg);
    			}

    			if (dirty[0] & /*headerData*/ 1 && t30_value !== (t30_value = /*headerData*/ ctx[0][0].client_name + "")) set_data_dev(t30, t30_value);
    			if (dirty[0] & /*headerData*/ 1 && t32_value !== (t32_value = /*headerData*/ ctx[0][0].agent + "")) set_data_dev(t32, t32_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(270:2) {#if headerData}",
    		ctx
    	});

    	return block;
    }

    // (319:14) {#each STATUS_OPTIONS as opt}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[51][1] + "";
    	let t;
    	let option_selected_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*opt*/ ctx[51][0];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*opt*/ ctx[51][0] == /*headerData*/ ctx[0][0].status;
    			add_location(option, file, 319, 16, 9251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headerData, STATUS_OPTIONS*/ 16385 && option_selected_value !== (option_selected_value = /*opt*/ ctx[51][0] == /*headerData*/ ctx[0][0].status)) {
    				prop_dev(option, "selected", option_selected_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(319:14) {#each STATUS_OPTIONS as opt}",
    		ctx
    	});

    	return block;
    }

    // (338:2) {#if data?.products}
    function create_if_block_3(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let th8;
    	let t17;
    	let tbody;
    	let current;
    	let each_value = /*data*/ ctx[1].products;
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
    			th0 = element("th");
    			th0.textContent = "מזהה";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "שם מוצר";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "מחיר";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "רקמה?";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "הדפסה?";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "חשוב להזמנה";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "הערות";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "ברקוד";
    			t15 = space();
    			th8 = element("th");
    			th8.textContent = "פעולות";
    			t17 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-czqtu8");
    			add_location(th0, file, 349, 10, 10015);
    			attr_dev(th1, "class", "svelte-czqtu8");
    			add_location(th1, file, 350, 10, 10039);
    			attr_dev(th2, "class", "svelte-czqtu8");
    			add_location(th2, file, 351, 10, 10066);
    			attr_dev(th3, "class", "svelte-czqtu8");
    			add_location(th3, file, 352, 10, 10090);
    			attr_dev(th4, "class", "svelte-czqtu8");
    			add_location(th4, file, 353, 10, 10115);
    			attr_dev(th5, "class", "svelte-czqtu8");
    			add_location(th5, file, 354, 10, 10141);
    			attr_dev(th6, "class", "svelte-czqtu8");
    			add_location(th6, file, 355, 10, 10172);
    			attr_dev(th7, "class", "svelte-czqtu8");
    			add_location(th7, file, 356, 10, 10197);
    			attr_dev(th8, "colspan", "2");
    			attr_dev(th8, "class", "svelte-czqtu8");
    			add_location(th8, file, 357, 10, 10222);
    			add_location(tr, file, 348, 8, 10000);
    			attr_dev(thead, "class", "svelte-czqtu8");
    			add_location(thead, file, 347, 6, 9984);
    			add_location(tbody, file, 360, 6, 10285);
    			attr_dev(table, "class", "product-table svelte-czqtu8");
    			add_location(table, file, 346, 4, 9948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(tr, t11);
    			append_dev(tr, th6);
    			append_dev(tr, t13);
    			append_dev(tr, th7);
    			append_dev(tr, t15);
    			append_dev(tr, th8);
    			append_dev(table, t17);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*add_entry_btn_clicked, ALL_VERIENTS, data, ALL_SIZES, ALL_COLORS*/ 8250) {
    				each_value = /*data*/ ctx[1].products;
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(338:2) {#if data?.products}",
    		ctx
    	});

    	return block;
    }

    // (391:16) {#if product.embroidery}
    function create_if_block_6(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	function textarea_input_handler() {
    		/*textarea_input_handler*/ ctx[24].call(textarea, /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "placeholder", "תיאור רקמה");
    			add_location(textarea, file, 391, 18, 11318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*product*/ ctx[39].embroideryComment);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", textarea_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data*/ 2) {
    				set_input_value(textarea, /*product*/ ctx[39].embroideryComment);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(391:16) {#if product.embroidery}",
    		ctx
    	});

    	return block;
    }

    // (407:16) {#if product.prining}
    function create_if_block_5(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	function textarea_input_handler_1() {
    		/*textarea_input_handler_1*/ ctx[26].call(textarea, /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "placeholder", "תיאור הדפסה");
    			add_location(textarea, file, 407, 18, 11855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*product*/ ctx[39].priningComment);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", textarea_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data*/ 2) {
    				set_input_value(textarea, /*product*/ ctx[39].priningComment);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(407:16) {#if product.prining}",
    		ctx
    	});

    	return block;
    }

    // (449:14) {#key product.id}
    function create_key_block(ctx) {
    	let mentriesservertable;
    	let updating_product;
    	let current;

    	function mentriesservertable_product_binding(value) {
    		/*mentriesservertable_product_binding*/ ctx[30](value, /*product*/ ctx[39], /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	let mentriesservertable_props = {
    		ALL_SIZES: /*ALL_SIZES*/ ctx[3],
    		ALL_COLORS: /*ALL_COLORS*/ ctx[4],
    		ALL_VERIENTS: /*ALL_VERIENTS*/ ctx[5]
    	};

    	if (/*product*/ ctx[39] !== void 0) {
    		mentriesservertable_props.product = /*product*/ ctx[39];
    	}

    	mentriesservertable = new MentriesServerTable({
    			props: mentriesservertable_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(mentriesservertable, 'product', mentriesservertable_product_binding));

    	const block = {
    		c: function create() {
    			create_component(mentriesservertable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mentriesservertable, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const mentriesservertable_changes = {};
    			if (dirty[0] & /*ALL_SIZES*/ 8) mentriesservertable_changes.ALL_SIZES = /*ALL_SIZES*/ ctx[3];
    			if (dirty[0] & /*ALL_COLORS*/ 16) mentriesservertable_changes.ALL_COLORS = /*ALL_COLORS*/ ctx[4];
    			if (dirty[0] & /*ALL_VERIENTS*/ 32) mentriesservertable_changes.ALL_VERIENTS = /*ALL_VERIENTS*/ ctx[5];

    			if (!updating_product && dirty[0] & /*data*/ 2) {
    				updating_product = true;
    				mentriesservertable_changes.product = /*product*/ ctx[39];
    				add_flush_callback(() => updating_product = false);
    			}

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
    			destroy_component(mentriesservertable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(449:14) {#key product.id}",
    		ctx
    	});

    	return block;
    }

    // (475:20) {#each ALL_COLORS as color}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*color*/ ctx[48]["name"] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*color*/ ctx[48]["id"];
    			option.value = option.__value;
    			add_location(option, file, 475, 22, 14249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_COLORS*/ 16 && t_value !== (t_value = /*color*/ ctx[48]["name"] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_COLORS*/ 16 && option_value_value !== (option_value_value = /*color*/ ctx[48]["id"])) {
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
    		source: "(475:20) {#each ALL_COLORS as color}",
    		ctx
    	});

    	return block;
    }

    // (483:20) {#each ALL_SIZES.sort((a, b) => {                       return a.code.localeCompare(b.code);                     }) as size}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*size*/ ctx[45]["size"] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*size*/ ctx[45]["id"];
    			option.value = option.__value;
    			add_location(option, file, 485, 22, 14722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_SIZES*/ 8 && t_value !== (t_value = /*size*/ ctx[45]["size"] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_SIZES*/ 8 && option_value_value !== (option_value_value = /*size*/ ctx[45]["id"])) {
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
    		source: "(483:20) {#each ALL_SIZES.sort((a, b) => {                       return a.code.localeCompare(b.code);                     }) as size}",
    		ctx
    	});

    	return block;
    }

    // (490:18) {#if product.verients.length != 0}
    function create_if_block_4(ctx) {
    	let select;
    	let option;
    	let each_value_1 = /*ALL_VERIENTS*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "מודל";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(option, "default", "");
    			option.__value = "undefined";
    			option.value = option.__value;
    			add_location(option, file, 491, 22, 15043);
    			attr_dev(select, "class", "form-control svelte-czqtu8");
    			attr_dev(select, "name", "varient");
    			attr_dev(select, "id", "varient");
    			add_location(select, file, 490, 20, 14963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_VERIENTS*/ 32) {
    				each_value_1 = /*ALL_VERIENTS*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(490:18) {#if product.verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (493:22) {#each ALL_VERIENTS as varient}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*varient*/ ctx[42]["name"] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*varient*/ ctx[42]["id"];
    			option.value = option.__value;
    			add_location(option, file, 493, 24, 15169);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_VERIENTS*/ 32 && t_value !== (t_value = /*varient*/ ctx[42]["name"] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_VERIENTS*/ 32 && option_value_value !== (option_value_value = /*varient*/ ctx[42]["id"])) {
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
    		source: "(493:22) {#each ALL_VERIENTS as varient}",
    		ctx
    	});

    	return block;
    }

    // (362:8) {#each data.products as product}
    function create_each_block(ctx) {
    	let tr0;
    	let td0;
    	let t0_value = /*product*/ ctx[39].product.id + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let t3_value = /*product*/ ctx[39].product.title + "";
    	let t3;
    	let t4;
    	let td2;
    	let t5_value = /*product*/ ctx[39].price + "";
    	let t5;
    	let t6;
    	let t7;
    	let td3;
    	let div0;
    	let input0;
    	let t8;
    	let t9;
    	let label0;
    	let t11;
    	let td4;
    	let div1;
    	let input1;
    	let t12;
    	let t13;
    	let label1;
    	let t15;
    	let td5;
    	let div2;
    	let input2;
    	let t16;
    	let label2;
    	let t18;
    	let td6;
    	let textarea;
    	let t19;
    	let td7;
    	let t20_value = (/*product*/ ctx[39].pbarcode || "") + "";
    	let t20;
    	let t21;
    	let td8;
    	let button0;
    	let t23;
    	let tr1;
    	let td9;
    	let previous_key = /*product*/ ctx[39].id;
    	let t24;
    	let td10;
    	let form;
    	let input3;
    	let input3_value_value;
    	let t25;
    	let input4;
    	let input4_value_value;
    	let t26;
    	let div3;
    	let select0;
    	let option0;
    	let t28;
    	let select1;
    	let option1;
    	let t30;
    	let t31;
    	let input5;
    	let t32;
    	let div4;
    	let t33;
    	let button1;
    	let t35;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[22](/*product*/ ctx[39], /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	function input0_change_handler() {
    		/*input0_change_handler*/ ctx[23].call(input0, /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	let if_block0 = /*product*/ ctx[39].embroidery && create_if_block_6(ctx);

    	function input1_change_handler() {
    		/*input1_change_handler*/ ctx[25].call(input1, /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	let if_block1 = /*product*/ ctx[39].prining && create_if_block_5(ctx);

    	function input2_change_handler() {
    		/*input2_change_handler*/ ctx[27].call(input2, /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	function textarea_input_handler_2() {
    		/*textarea_input_handler_2*/ ctx[28].call(textarea, /*each_value*/ ctx[40], /*product_index*/ ctx[41]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[29](/*product*/ ctx[39]);
    	}

    	let key_block = create_key_block(ctx);
    	let each_value_3 = /*ALL_COLORS*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*ALL_SIZES*/ ctx[3].sort(func);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block2 = /*product*/ ctx[39].verients.length != 0 && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			t5 = text(t5_value);
    			t6 = text("₪");
    			t7 = space();
    			td3 = element("td");
    			div0 = element("div");
    			input0 = element("input");
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			label0 = element("label");
    			label0.textContent = "רקמה";
    			t11 = space();
    			td4 = element("td");
    			div1 = element("div");
    			input1 = element("input");
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			label1 = element("label");
    			label1.textContent = "הדפסה";
    			t15 = space();
    			td5 = element("td");
    			div2 = element("div");
    			input2 = element("input");
    			t16 = space();
    			label2 = element("label");
    			label2.textContent = "חשוב להזמנה";
    			t18 = space();
    			td6 = element("td");
    			textarea = element("textarea");
    			t19 = space();
    			td7 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td8 = element("td");
    			button0 = element("button");
    			button0.textContent = "מחק";
    			t23 = space();
    			tr1 = element("tr");
    			td9 = element("td");
    			key_block.c();
    			t24 = space();
    			td10 = element("td");
    			form = element("form");
    			input3 = element("input");
    			t25 = space();
    			input4 = element("input");
    			t26 = space();
    			div3 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "צבע";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t28 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "מידה";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t30 = space();
    			if (if_block2) if_block2.c();
    			t31 = space();
    			input5 = element("input");
    			t32 = space();
    			div4 = element("div");
    			t33 = space();
    			button1 = element("button");
    			button1.textContent = "הוסף";
    			t35 = space();
    			attr_dev(td0, "class", "cell-border svelte-czqtu8");
    			add_location(td0, file, 363, 12, 10361);
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*product*/ ctx[39].product.cimage))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*product*/ ctx[39].product.title);
    			attr_dev(img, "width", "25px");
    			attr_dev(img, "height", "25px");
    			attr_dev(img, "loading", "lazy");
    			add_location(img, file, 365, 14, 10462);
    			attr_dev(td1, "class", "cell-border svelte-czqtu8");
    			add_location(td1, file, 364, 12, 10423);
    			attr_dev(td2, "class", "cell-border svelte-czqtu8");
    			add_location(td2, file, 376, 12, 10788);
    			attr_dev(input0, "name", "embro");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-czqtu8");
    			add_location(input0, file, 385, 16, 11116);
    			attr_dev(label0, "for", "embro");
    			attr_dev(label0, "class", "svelte-czqtu8");
    			add_location(label0, file, 396, 16, 11491);
    			attr_dev(div0, "class", "d-flex-wraper svelte-czqtu8");
    			add_location(div0, file, 384, 14, 11072);
    			attr_dev(td3, "class", "cell-border svelte-czqtu8");
    			add_location(td3, file, 383, 12, 11033);
    			attr_dev(input1, "name", "prining");
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-czqtu8");
    			add_location(input1, file, 401, 16, 11657);
    			attr_dev(label1, "for", "prining");
    			attr_dev(label1, "class", "svelte-czqtu8");
    			add_location(label1, file, 412, 16, 12026);
    			attr_dev(div1, "class", "d-flex-wraper svelte-czqtu8");
    			add_location(div1, file, 400, 14, 11613);
    			attr_dev(td4, "class", "cell-border svelte-czqtu8");
    			add_location(td4, file, 399, 12, 11574);
    			attr_dev(input2, "name", "ergent");
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-czqtu8");
    			add_location(input2, file, 417, 16, 12195);
    			attr_dev(label2, "for", "ergent");
    			attr_dev(label2, "class", "svelte-czqtu8");
    			add_location(label2, file, 422, 16, 12349);
    			attr_dev(div2, "class", "d-flex-wraper svelte-czqtu8");
    			add_location(div2, file, 416, 14, 12151);
    			attr_dev(td5, "class", "cell-border svelte-czqtu8");
    			add_location(td5, file, 415, 12, 12112);
    			attr_dev(textarea, "placeholder", "הערות");
    			add_location(textarea, file, 427, 15, 12480);
    			attr_dev(td6, "class", "cell-border svelte-czqtu8");
    			add_location(td6, file, 426, 12, 12441);
    			attr_dev(td7, "class", "cell-border svelte-czqtu8");
    			add_location(td7, file, 429, 12, 12572);
    			attr_dev(button0, "class", "btn btn-danger");
    			add_location(button0, file, 431, 14, 12689);
    			attr_dev(td8, "class", "cell-border svelte-czqtu8");
    			attr_dev(td8, "colspan", "2");
    			add_location(td8, file, 430, 12, 12638);
    			add_location(tr0, file, 362, 10, 10344);
    			attr_dev(td9, "colspan", "9");
    			attr_dev(td9, "class", "svelte-czqtu8");
    			add_location(td9, file, 447, 12, 13232);
    			attr_dev(input3, "type", "hidden");
    			attr_dev(input3, "name", "product_id");
    			input3.value = input3_value_value = /*product*/ ctx[39].product.id;
    			attr_dev(input3, "class", "svelte-czqtu8");
    			add_location(input3, file, 464, 16, 13727);
    			attr_dev(input4, "type", "hidden");
    			attr_dev(input4, "name", "entry_id");
    			input4.value = input4_value_value = /*product*/ ctx[39].id;
    			attr_dev(input4, "class", "svelte-czqtu8");
    			add_location(input4, file, 469, 16, 13882);
    			attr_dev(option0, "default", "");
    			option0.__value = "undefined";
    			option0.value = option0.__value;
    			add_location(option0, file, 473, 20, 14132);
    			attr_dev(select0, "class", "form-control svelte-czqtu8");
    			attr_dev(select0, "name", "color");
    			attr_dev(select0, "id", "color");
    			add_location(select0, file, 472, 18, 14058);
    			attr_dev(option1, "default", "");
    			option1.__value = "undefined";
    			option1.value = option1.__value;
    			add_location(option1, file, 481, 20, 14507);
    			attr_dev(select1, "class", "form-control svelte-czqtu8");
    			attr_dev(select1, "name", "size");
    			attr_dev(select1, "id", "size");
    			add_location(select1, file, 480, 18, 14435);
    			attr_dev(input5, "class", "form-control svelte-czqtu8");
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "placeholder", "כמות");
    			attr_dev(input5, "name", "amount");
    			attr_dev(input5, "id", "amount");
    			attr_dev(input5, "min", "0");
    			add_location(input5, file, 499, 18, 15389);
    			attr_dev(div3, "class", "form-group svelte-czqtu8");
    			add_location(div3, file, 470, 16, 13957);
    			attr_dev(div4, "class", "error-msg");
    			add_location(div4, file, 508, 16, 15664);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "btn btn-secondary");
    			add_location(button1, file, 509, 16, 15706);
    			attr_dev(form, "class", "add-entry-form svelte-czqtu8");
    			attr_dev(form, "action", "");
    			attr_dev(form, "method", "post");
    			add_location(form, file, 458, 14, 13544);
    			attr_dev(td10, "colspan", "1");
    			attr_dev(td10, "class", "svelte-czqtu8");
    			add_location(td10, file, 457, 12, 13513);
    			attr_dev(tr1, "class", "details svelte-czqtu8");
    			add_location(tr1, file, 446, 10, 13199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(td0, t0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, img);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(tr0, t4);
    			append_dev(tr0, td2);
    			append_dev(td2, t5);
    			append_dev(td2, t6);
    			append_dev(tr0, t7);
    			append_dev(tr0, td3);
    			append_dev(td3, div0);
    			append_dev(div0, input0);
    			input0.checked = /*product*/ ctx[39].embroidery;
    			append_dev(div0, t8);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t9);
    			append_dev(div0, label0);
    			append_dev(tr0, t11);
    			append_dev(tr0, td4);
    			append_dev(td4, div1);
    			append_dev(div1, input1);
    			input1.checked = /*product*/ ctx[39].prining;
    			append_dev(div1, t12);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t13);
    			append_dev(div1, label1);
    			append_dev(tr0, t15);
    			append_dev(tr0, td5);
    			append_dev(td5, div2);
    			append_dev(div2, input2);
    			set_input_value(input2, /*product*/ ctx[39].ergent);
    			append_dev(div2, t16);
    			append_dev(div2, label2);
    			append_dev(tr0, t18);
    			append_dev(tr0, td6);
    			append_dev(td6, textarea);
    			set_input_value(textarea, /*product*/ ctx[39].comment);
    			append_dev(tr0, t19);
    			append_dev(tr0, td7);
    			append_dev(td7, t20);
    			append_dev(tr0, t21);
    			append_dev(tr0, td8);
    			append_dev(td8, button0);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td9);
    			key_block.m(td9, null);
    			append_dev(tr1, t24);
    			append_dev(tr1, td10);
    			append_dev(td10, form);
    			append_dev(form, input3);
    			append_dev(form, t25);
    			append_dev(form, input4);
    			append_dev(form, t26);
    			append_dev(form, div3);
    			append_dev(div3, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			append_dev(div3, t28);
    			append_dev(div3, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			append_dev(div3, t30);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t31);
    			append_dev(div3, input5);
    			append_dev(form, t32);
    			append_dev(form, div4);
    			append_dev(form, t33);
    			append_dev(form, button1);
    			append_dev(tr1, t35);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(td2, "click", click_handler, false, false, false),
    					listen_dev(input0, "change", input0_change_handler),
    					listen_dev(input1, "change", input1_change_handler),
    					listen_dev(input2, "change", input2_change_handler),
    					listen_dev(textarea, "input", textarea_input_handler_2),
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(form, "submit", /*add_entry_btn_clicked*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*data*/ 2) && t0_value !== (t0_value = /*product*/ ctx[39].product.id + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*data*/ 2 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*product*/ ctx[39].product.cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*data*/ 2 && img_alt_value !== (img_alt_value = /*product*/ ctx[39].product.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty[0] & /*data*/ 2) && t3_value !== (t3_value = /*product*/ ctx[39].product.title + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*data*/ 2) && t5_value !== (t5_value = /*product*/ ctx[39].price + "")) set_data_dev(t5, t5_value);

    			if (dirty[0] & /*data*/ 2) {
    				input0.checked = /*product*/ ctx[39].embroidery;
    			}

    			if (/*product*/ ctx[39].embroidery) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div0, t9);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*data*/ 2) {
    				input1.checked = /*product*/ ctx[39].prining;
    			}

    			if (/*product*/ ctx[39].prining) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(div1, t13);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*data*/ 2) {
    				set_input_value(input2, /*product*/ ctx[39].ergent);
    			}

    			if (dirty[0] & /*data*/ 2) {
    				set_input_value(textarea, /*product*/ ctx[39].comment);
    			}

    			if ((!current || dirty[0] & /*data*/ 2) && t20_value !== (t20_value = (/*product*/ ctx[39].pbarcode || "") + "")) set_data_dev(t20, t20_value);

    			if (dirty[0] & /*data*/ 2 && safe_not_equal(previous_key, previous_key = /*product*/ ctx[39].id)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(td9, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}

    			if (!current || dirty[0] & /*data*/ 2 && input3_value_value !== (input3_value_value = /*product*/ ctx[39].product.id)) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (!current || dirty[0] & /*data*/ 2 && input4_value_value !== (input4_value_value = /*product*/ ctx[39].id)) {
    				prop_dev(input4, "value", input4_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS*/ 16) {
    				each_value_3 = /*ALL_COLORS*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*ALL_SIZES*/ 8) {
    				each_value_2 = /*ALL_SIZES*/ ctx[3].sort(func);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (/*product*/ ctx[39].verients.length != 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					if_block2.m(div3, t31);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(tr1);
    			key_block.d(detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(362:8) {#each data.products as product}",
    		ctx
    	});

    	return block;
    }

    // (541:10) 
    function create_item_slot(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t;
    	let html_tag;
    	let raw_value = /*label*/ ctx[37] + "";

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			html_tag = new HtmlTag();
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[38].title);
    			set_style(img, "height", "25px");
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*item*/ ctx[38].cimage))) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 543, 16, 16780);
    			html_tag.a = null;
    			attr_dev(div0, "class", "inner");
    			add_location(div0, file, 542, 14, 16744);
    			attr_dev(div1, "class", "search-item");
    			add_location(div1, file, 541, 12, 16704);
    			attr_dev(div2, "slot", "item");
    			add_location(div2, file, 540, 10, 16655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t);
    			html_tag.m(raw_value, div0);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[1] & /*item*/ 128 && img_alt_value !== (img_alt_value = /*item*/ ctx[38].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[1] & /*item*/ 128 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*item*/ ctx[38].cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[1] & /*label*/ 64 && raw_value !== (raw_value = /*label*/ ctx[37] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_item_slot.name,
    		type: "slot",
    		source: "(541:10) ",
    		ctx
    	});

    	return block;
    }

    // (582:8) {:else}
    function create_else_block_2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "הוסף";
    			button.disabled = true;
    			add_location(button, file, 582, 10, 18011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(582:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (554:8) {#if selectedProduct}
    function create_if_block_1(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t0;
    	let html_tag;
    	let raw_value = /*selectedProduct*/ ctx[2]?.title + "";
    	let t1;
    	let button;
    	let button_disabled_value;
    	let t2;
    	let div2;
    	let pre;
    	let t3;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*add_product_status*/ ctx[8] == "sending") return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			html_tag = new HtmlTag();
    			t1 = space();
    			button = element("button");
    			if_block.c();
    			t2 = space();
    			div2 = element("div");
    			pre = element("pre");
    			t3 = text(/*add_product_message*/ ctx[7]);
    			attr_dev(img, "alt", img_alt_value = /*selectedProduct*/ ctx[2]?.title);
    			set_style(img, "height", "25px");
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*selectedProduct*/ ctx[2]?.cimage))) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 556, 14, 17179);
    			html_tag.a = null;
    			attr_dev(div0, "class", "inner");
    			add_location(div0, file, 555, 12, 17145);
    			attr_dev(div1, "class", "selected-product");
    			add_location(div1, file, 554, 10, 17102);
    			button.disabled = button_disabled_value = /*add_product_status*/ ctx[8] == "sending";
    			attr_dev(button, "class", "btn btn-secondary");
    			add_location(button, file, 565, 10, 17458);
    			add_location(pre, file, 579, 12, 17935);
    			set_style(div2, "color", /*add_product_status_color*/ ctx[9]);
    			add_location(div2, file, 578, 10, 17875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			html_tag.m(raw_value, div0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, pre);
    			append_dev(pre, t3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addNewProductButtonClick*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedProduct*/ 4 && img_alt_value !== (img_alt_value = /*selectedProduct*/ ctx[2]?.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*selectedProduct*/ 4 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*selectedProduct*/ ctx[2]?.cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*selectedProduct*/ 4 && raw_value !== (raw_value = /*selectedProduct*/ ctx[2]?.title + "")) html_tag.p(raw_value);

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty[0] & /*add_product_status*/ 256 && button_disabled_value !== (button_disabled_value = /*add_product_status*/ ctx[8] == "sending")) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (dirty[0] & /*add_product_message*/ 128) set_data_dev(t3, /*add_product_message*/ ctx[7]);

    			if (dirty[0] & /*add_product_status_color*/ 512) {
    				set_style(div2, "color", /*add_product_status_color*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(554:8) {#if selectedProduct}",
    		ctx
    	});

    	return block;
    }

    // (575:12) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("הוסף");
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(575:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (571:12) {#if add_product_status == "sending"}
    function create_if_block_2(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "sr-only");
    			add_location(span, file, 572, 16, 17742);
    			attr_dev(div, "class", "spinner-border");
    			attr_dev(div, "role", "status");
    			add_location(div, file, 571, 14, 17683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(571:12) {#if add_product_status == \\\"sending\\\"}",
    		ctx
    	});

    	return block;
    }

    // (605:6) {:else}
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
    		source: "(605:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (603:6) {#if updateing_to_server}
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
    		source: "(603:6) {#if updateing_to_server}",
    		ctx
    	});

    	return block;
    }

    // (596:4) <Button       class="update-btn"       disabled={updateing_to_server}       on:click={() => {         save_data();       }}     >
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*updateing_to_server*/ ctx[6]) return 0;
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
    		source: "(596:4) <Button       class=\\\"update-btn\\\"       disabled={updateing_to_server}       on:click={() => {         save_data();       }}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let morderaddproductentrypopup;
    	let t1;
    	let main;
    	let t2;
    	let t3;
    	let div3;
    	let h3;
    	let t5;
    	let div1;
    	let label;
    	let t7;
    	let div0;
    	let autocomplete;
    	let updating_selectedItem;
    	let t8;
    	let t9;
    	let div2;
    	let button0;
    	let t11;
    	let div4;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	morderaddproductentrypopup = new MorderAddProductEntryPopup({
    			props: {
    				ALL_COLORS: /*ALL_COLORS*/ ctx[4],
    				ALL_SIZES: /*ALL_SIZES*/ ctx[3],
    				ALL_VERIENTS: /*ALL_VERIENTS*/ ctx[5]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*headerData*/ ctx[0] && create_if_block_7(ctx);
    	let if_block1 = /*data*/ ctx[1]?.products && create_if_block_3(ctx);

    	function autocomplete_selectedItem_binding(value) {
    		/*autocomplete_selectedItem_binding*/ ctx[31](value);
    	}

    	let autocomplete_props = {
    		id: "search_input",
    		loadingText: "מחפש מוצרים...",
    		createText: "לא נמצאו תוצאות חיפוש",
    		showLoadingIndicator: "true",
    		noResultsText: "",
    		create: "true",
    		placeholder: "חיפוש...",
    		className: "autocomplete-cls",
    		searchFunction: /*searchProducts*/ ctx[11],
    		delay: "200",
    		localFiltering: false,
    		labelFieldName: "title",
    		valueFieldName: "value",
    		$$slots: {
    			item: [
    				create_item_slot,
    				({ label, item }) => ({ 37: label, 38: item }),
    				({ label, item }) => [0, (label ? 64 : 0) | (item ? 128 : 0)]
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*selectedProduct*/ ctx[2] !== void 0) {
    		autocomplete_props.selectedItem = /*selectedProduct*/ ctx[2];
    	}

    	autocomplete = new SimpleAutocomplete({
    			props: autocomplete_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete, 'selectedItem', autocomplete_selectedItem_binding));
    	autocomplete.$on("focus", /*focus_handler*/ ctx[32]);

    	function select_block_type(ctx, dirty) {
    		if (/*selectedProduct*/ ctx[2]) return create_if_block_1;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	button1 = new Button$1({
    			props: {
    				class: "update-btn",
    				disabled: /*updateing_to_server*/ ctx[6],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_2*/ ctx[33]);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			create_component(morderaddproductentrypopup.$$.fragment);
    			t1 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = "הוסף מוצר";
    			t5 = space();
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "שם מוצר";
    			t7 = space();
    			div0 = element("div");
    			create_component(autocomplete.$$.fragment);
    			t8 = space();
    			if_block2.c();
    			t9 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "צור מוצר חדש";
    			t11 = space();
    			div4 = element("div");
    			create_component(button1.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css");
    			add_location(link, file, 261, 2, 7523);
    			add_location(h3, file, 518, 4, 15910);
    			attr_dev(label, "for", "product_name");
    			add_location(label, file, 521, 6, 16036);
    			attr_dev(div0, "class", "search-wraper");
    			add_location(div0, file, 522, 6, 16084);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file, 520, 4, 16005);
    			attr_dev(button0, "class", "btn btn-secondary");
    			add_location(button0, file, 588, 6, 18148);
    			attr_dev(div2, "class", "new-product-btn-wraper svelte-czqtu8");
    			add_location(div2, file, 587, 4, 18105);
    			attr_dev(div3, "id", "new-product-form");
    			add_location(div3, file, 517, 2, 15878);
    			attr_dev(div4, "class", "update-btn-wraper svelte-czqtu8");
    			add_location(div4, file, 594, 2, 18276);
    			attr_dev(main, "class", "svelte-czqtu8");
    			add_location(main, file, 268, 0, 7750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			mount_component(morderaddproductentrypopup, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t3);
    			append_dev(main, div3);
    			append_dev(div3, h3);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div1, label);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			mount_component(autocomplete, div0, null);
    			append_dev(div0, t8);
    			if_block2.m(div0, null);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(main, t11);
    			append_dev(main, div4);
    			mount_component(button1, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button0, "click", new_product_btn_click, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const morderaddproductentrypopup_changes = {};
    			if (dirty[0] & /*ALL_COLORS*/ 16) morderaddproductentrypopup_changes.ALL_COLORS = /*ALL_COLORS*/ ctx[4];
    			if (dirty[0] & /*ALL_SIZES*/ 8) morderaddproductentrypopup_changes.ALL_SIZES = /*ALL_SIZES*/ ctx[3];
    			if (dirty[0] & /*ALL_VERIENTS*/ 32) morderaddproductentrypopup_changes.ALL_VERIENTS = /*ALL_VERIENTS*/ ctx[5];
    			morderaddproductentrypopup.$set(morderaddproductentrypopup_changes);

    			if (/*headerData*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(main, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[1]?.products) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*data*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const autocomplete_changes = {};

    			if (dirty[1] & /*$$scope, label, item*/ 8388800) {
    				autocomplete_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selectedItem && dirty[0] & /*selectedProduct*/ 4) {
    				updating_selectedItem = true;
    				autocomplete_changes.selectedItem = /*selectedProduct*/ ctx[2];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete.$set(autocomplete_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			}

    			const button1_changes = {};
    			if (dirty[0] & /*updateing_to_server*/ 64) button1_changes.disabled = /*updateing_to_server*/ ctx[6];

    			if (dirty[0] & /*updateing_to_server*/ 64 | dirty[1] & /*$$scope*/ 8388608) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(morderaddproductentrypopup.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(autocomplete.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(morderaddproductentrypopup.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(autocomplete.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			destroy_component(morderaddproductentrypopup, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(autocomplete);
    			if_block2.d();
    			destroy_component(button1);
    			mounted = false;
    			dispose();
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

    function new_product_btn_click() {
    	var href = "/admin/catalogImages/catalogimage/add/";

    	if (href.indexOf("?") === -1) {
    		href += "?_popup=1";
    	} else {
    		href += "&_popup=1";
    	}

    	var win = window.open(href, "_blank", "height=500,width=800,resizable=yes,scrollbars=yes");
    	win.focus();
    	return false;
    }

    const func = (a, b) => {
    	return a.code.localeCompare(b.code);
    };

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MyMorderEdit', slots, []);
    	let { id } = $$props;
    	let updateing = false;

    	//let ALL_PROVIDERS;
    	let headerData = undefined;

    	let serverData = undefined;
    	let data = undefined;
    	let selectedProduct = undefined;

    	//let productsData;
    	async function load_order_from_server() {
    		updateing = true;
    		let resp = await apiGetMOrder(id);
    		console.log("resp:", resp);
    		$$invalidate(1, data = serverData = JSON.parse(JSON.stringify(resp)));

    		$$invalidate(0, headerData = [
    			{
    				created: data.created,
    				updated: data.updated,
    				id: data.id,
    				name: data.name,
    				email: data.email,
    				message: data.message,
    				phone: data.phone,
    				status: data.status,
    				status_msg: data.status_msg,
    				client_id: data.client,
    				client_name: data.client_businessName,
    				agent: data.agent_name
    			}
    		]);

    		//productsData = data.products;
    		//groupedProducts = group the productsData by product field (ID: int)
    		updateing = false;
    	}

    	let ALL_SIZES;
    	let ALL_COLORS;
    	let ALL_VERIENTS;
    	let updateing_to_server = false;

    	onMount(async () => {

    		$$invalidate(3, ALL_SIZES = await apiGetAllSizes());
    		$$invalidate(4, ALL_COLORS = await apiGetAllColors());
    		$$invalidate(5, ALL_VERIENTS = await apiGetAllVariants());
    		await load_order_from_server();
    	}); //ALL_PROVIDERS = await apiGetProviders();

    	async function save_data() {
    		// move headerData to data
    		$$invalidate(1, data.created = headerData[0].created, data);

    		$$invalidate(1, data.updated = headerData[0].updated, data);
    		$$invalidate(1, data.id = headerData[0].id, data);
    		$$invalidate(1, data.name = headerData[0].name, data);
    		$$invalidate(1, data.email = headerData[0].email, data);
    		$$invalidate(1, data.message = headerData[0].message, data);
    		$$invalidate(1, data.phone = headerData[0].phone, data);
    		$$invalidate(1, data.status = headerData[0].status, data);
    		$$invalidate(1, data.status_msg = headerData[0].status_msg, data);
    		$$invalidate(1, data.client = headerData[0].client_id, data);
    		$$invalidate(1, data.client_businessName = headerData[0].client_name, data);
    		console.log("save data: ", data);
    		$$invalidate(6, updateing_to_server = true);
    		await apiSaveMOrder(data.id, data);
    		$$invalidate(6, updateing_to_server = false);
    		alert("saved");
    	}

    	async function searchProducts(keyword) {
    		let json = await apiSearchProducts(keyword, true);
    		let data = json;
    		return data.all;
    	}

    	// function autocompleteItemSelected(val) {
    	//     console.log('autocompleteItemSelected: ' , val);
    	//     selectedProduct = val;
    	// }
    	let add_product_message = "";

    	let add_product_status = "unset";
    	let add_product_status_color = "black";

    	function addNewProductButtonClick(e) {
    		e.preventDefault();
    		$$invalidate(7, add_product_message = "");
    		$$invalidate(8, add_product_status = "sending");
    		$$invalidate(9, add_product_status_color = "black");
    		let sendData = {};
    		console.log("looking for ", selectedProduct.id, " in ", data.products);

    		if (data.products.find(product => product.product.id == selectedProduct.id)) {
    			$$invalidate(7, add_product_message = "מוצר כבר נמצא בהזמנה");
    			$$invalidate(8, add_product_status = "error");
    			$$invalidate(9, add_product_status_color = "red");
    			return;
    		}

    		sendData["order_id"] = data.id;
    		sendData["product_id"] = selectedProduct.id;
    		console.log("data: ", sendData);

    		apiAddNewProductToMorder(sendData).then(newEntry => {
    			//e.target.reset();
    			data.products.push(newEntry.data);

    			$$invalidate(1, data.products = [...data.products], data);
    			$$invalidate(2, selectedProduct = undefined);
    			$$invalidate(8, add_product_status = "unset");
    		}).catch(err => {
    			console.log(err);
    			$$invalidate(8, add_product_status = "unset");
    		});
    	} //productAmountEditModel.hide();

    	function add_entry_btn_clicked(e) {
    		e.preventDefault();
    		let form = e.target;
    		let formData = new FormData(form);
    		let formDictData = {};

    		formData.forEach((value, key) => {
    			formDictData[key] = value;
    		});

    		// let product = data.products.find(product=> product.id == formDictData['entry_id']);
    		// if(product) {
    		if (formDictData["color"] == "undefined") {
    			alert("יש לבחור צבע");
    			return;
    		} else if (formDictData["size"] == "undefined") {
    			alert("יש לבחור מידה");
    			return;
    		}

    		let selected_color = parseInt(formDictData["color"]);
    		let selected_size = parseInt(formDictData["size"]);

    		let selected_verient = formDictData["varient"] == "undefined" || formDictData["varient"] == ""
    		? null
    		: parseInt(formDictData["varient"]);

    		let amount = parseInt(formDictData["amount"] == "undefined" || formDictData["amount"] == ""
    		? "0"
    		: formDictData["amount"]);

    		for (let i = 0; i < data.products.length; i++) {
    			if (data.products[i].id == formDictData["entry_id"]) {
    				if (selected_verient == null && product.verients.length != 0) {
    					alert("יש לבחור מודל");
    					return;
    				}

    				let found = false;

    				for (let j = 0; j < data.products[i].entries.length; j++) {
    					if (data.products[i].entries[j].color == selected_color && data.products[i].entries[j].size == selected_size && data.products[i].entries[j].varient == selected_verient) {
    						found = true;
    						$$invalidate(1, data.products[i].entries[j].quantity = amount, data);
    					}
    				}

    				if (!found) {
    					data.products[i].entries.push({
    						id: null,
    						size: selected_size,
    						color: selected_color,
    						varient: selected_verient,
    						quantity: amount
    					});
    				}

    				$$invalidate(1, data.products[i].entries = [...data.products[i].entries], data);
    				break;
    			}
    		}
    	}

    	//         let entry = product.entries.find(entry=> entry.color == selected_color && entry.size == selected_size && entry.varient == selected_verient);
    	//         if(entry) {
    	//             entry.quantity = amount;
    	//             console.log('entry found, update quantity');
    	//         }else {
    	//             product.entries.push({
    	//                 id:null,
    	//                 size: selected_size,
    	//                 color: selected_color,
    	//                 varient: selected_verient,
    	//                 quantity: amount
    	//             });
    	//             console.log('entry not found, creating new');
    	//         }
    	//         console.log(product.entries);
    	//     }else {
    	//         alert('מוצר לא נמצא');
    	//     }
    	// }
    	// [('new', 'חדש'), ('in_progress', 'סחורה הוזמנה'), ('in_progress2', 'מוכן לליקוט',), (
    	//     'in_progress3', 'בהדפסה',), ('in_progress4', 'מוכן בבית דפוס'), ('in_progress5', 'ארוז מוכן למשלוח'), ('done', 'סופק'), ]
    	const STATUS_OPTIONS = [
    		["new", "חדש"],
    		["price_proposal", "הצעת מחיר"],
    		["in_progress", "סחורה הוזמנה"],
    		["in_progress2", "מוכן לליקוט"],
    		["in_progress3", "בהדפסה"],
    		["in_progress4", "מוכן בבית דפוס"],
    		["in_progress5", "ארוז מוכן למשלוח"],
    		["done", "סופק"]
    	];

    	const writable_props = ['id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<MyMorderEdit> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		headerData[0].name = this.value;
    		$$invalidate(0, headerData);
    		$$invalidate(14, STATUS_OPTIONS);
    	}

    	function input1_input_handler() {
    		headerData[0].email = this.value;
    		$$invalidate(0, headerData);
    		$$invalidate(14, STATUS_OPTIONS);
    	}

    	function textarea0_input_handler() {
    		headerData[0].message = this.value;
    		$$invalidate(0, headerData);
    		$$invalidate(14, STATUS_OPTIONS);
    	}

    	function input2_input_handler() {
    		headerData[0].phone = this.value;
    		$$invalidate(0, headerData);
    		$$invalidate(14, STATUS_OPTIONS);
    	}

    	function select_change_handler() {
    		headerData[0].status = select_value(this);
    		$$invalidate(0, headerData);
    		$$invalidate(14, STATUS_OPTIONS);
    	}

    	function textarea1_input_handler() {
    		headerData[0].status_msg = this.value;
    		$$invalidate(0, headerData);
    		$$invalidate(14, STATUS_OPTIONS);
    	}

    	const click_handler = (product, each_value, product_index) => {
    		let new_price = prompt("מחיר חדש:", product.price);
    		$$invalidate(1, each_value[product_index].price = new_price, data);
    	};

    	function input0_change_handler(each_value, product_index) {
    		each_value[product_index].embroidery = this.checked;
    		$$invalidate(1, data);
    	}

    	function textarea_input_handler(each_value, product_index) {
    		each_value[product_index].embroideryComment = this.value;
    		$$invalidate(1, data);
    	}

    	function input1_change_handler(each_value, product_index) {
    		each_value[product_index].prining = this.checked;
    		$$invalidate(1, data);
    	}

    	function textarea_input_handler_1(each_value, product_index) {
    		each_value[product_index].priningComment = this.value;
    		$$invalidate(1, data);
    	}

    	function input2_change_handler(each_value, product_index) {
    		each_value[product_index].ergent = this.value;
    		$$invalidate(1, data);
    	}

    	function textarea_input_handler_2(each_value, product_index) {
    		each_value[product_index].comment = this.value;
    		$$invalidate(1, data);
    	}

    	const click_handler_1 = product => {
    		if (confirm("בטוח שברצונך למחוק את המוצר?")) {
    			// Save it!
    			apiDeleteMOrderItem(product.id);

    			$$invalidate(1, data.products = [...data.products.filter(item => item.id != product.id)], data);
    		}
    	};

    	function mentriesservertable_product_binding(value, product, each_value, product_index) {
    		each_value[product_index] = value;
    		$$invalidate(1, data);
    	}

    	function autocomplete_selectedItem_binding(value) {
    		selectedProduct = value;
    		$$invalidate(2, selectedProduct);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler_2 = () => {
    		save_data();
    	};

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(15, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		Loading: Loading$1,
    		onMount,
    		apiAddNewProductToMorder,
    		apiDeleteMOrderItem,
    		apiGetAllColors,
    		apiGetAllSizes,
    		apiGetAllVariants,
    		apiGetMOrder,
    		apiSaveMOrder,
    		apiSearchProducts,
    		CLOUDINARY_BASE_URL,
    		MentriesServerTable,
    		AutoComplete: SimpleAutocomplete,
    		MorderAddProductEntryPopup,
    		morderAddProductEntryPopupStore,
    		id,
    		updateing,
    		headerData,
    		serverData,
    		data,
    		selectedProduct,
    		load_order_from_server,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		updateing_to_server,
    		save_data,
    		searchProducts,
    		add_product_message,
    		add_product_status,
    		add_product_status_color,
    		addNewProductButtonClick,
    		add_entry_btn_clicked,
    		STATUS_OPTIONS,
    		new_product_btn_click
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(15, id = $$props.id);
    		if ('updateing' in $$props) updateing = $$props.updateing;
    		if ('headerData' in $$props) $$invalidate(0, headerData = $$props.headerData);
    		if ('serverData' in $$props) serverData = $$props.serverData;
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('selectedProduct' in $$props) $$invalidate(2, selectedProduct = $$props.selectedProduct);
    		if ('ALL_SIZES' in $$props) $$invalidate(3, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(4, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(5, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('updateing_to_server' in $$props) $$invalidate(6, updateing_to_server = $$props.updateing_to_server);
    		if ('add_product_message' in $$props) $$invalidate(7, add_product_message = $$props.add_product_message);
    		if ('add_product_status' in $$props) $$invalidate(8, add_product_status = $$props.add_product_status);
    		if ('add_product_status_color' in $$props) $$invalidate(9, add_product_status_color = $$props.add_product_status_color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		headerData,
    		data,
    		selectedProduct,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		updateing_to_server,
    		add_product_message,
    		add_product_status,
    		add_product_status_color,
    		save_data,
    		searchProducts,
    		addNewProductButtonClick,
    		add_entry_btn_clicked,
    		STATUS_OPTIONS,
    		id,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		input2_input_handler,
    		select_change_handler,
    		textarea1_input_handler,
    		click_handler,
    		input0_change_handler,
    		textarea_input_handler,
    		input1_change_handler,
    		textarea_input_handler_1,
    		input2_change_handler,
    		textarea_input_handler_2,
    		click_handler_1,
    		mentriesservertable_product_binding,
    		autocomplete_selectedItem_binding,
    		focus_handler,
    		click_handler_2
    	];
    }

    class MyMorderEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 15 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MyMorderEdit",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[15] === undefined && !('id' in props)) {
    			console_1.warn("<MyMorderEdit> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<MyMorderEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MyMorderEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const myMorderEdit = new MyMorderEdit({
        target: document.getElementById("mymorderedit-target"),
        props: JSON.parse(document.getElementById("mymorderedit-props").textContent),
                                            //     documentstockenter-props documentstockerenter-props
    }); // documentstockenter-target  documentstockerenter-target

    return myMorderEdit;

})();
//# sourceMappingURL=MyMorderEdit.js.map
