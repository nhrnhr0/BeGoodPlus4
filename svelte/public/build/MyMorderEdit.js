
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
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
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
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
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
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
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

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
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
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
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
                    config = config(options);
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
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
        if (text.data === data)
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
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
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
     * @param {StartStopNotifier=} start
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
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\carbon-components-svelte\src\Button\ButtonSkeleton.svelte generated by Svelte v3.59.2 */

    const file$8 = "node_modules\\carbon-components-svelte\\src\\Button\\ButtonSkeleton.svelte";

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
    			add_location(div, file$8, 41, 2, 950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler_1*/ ctx[8], false, false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[9], false, false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler_1*/ ctx[10], false, false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler_1*/ ctx[11], false, false, false, false)
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
    			add_location(a, file$8, 22, 2, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[4], false, false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler*/ ctx[5], false, false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler*/ ctx[6], false, false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false, false)
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

    function create_fragment$8(ctx) {
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { href: 0, size: 1, small: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonSkeleton",
    			options,
    			id: create_fragment$8.name
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

    /* node_modules\carbon-components-svelte\src\Button\Button.svelte generated by Svelte v3.59.2 */
    const file$7 = "node_modules\\carbon-components-svelte\\src\\Button\\Button.svelte";
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
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
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
    			add_location(button, file$7, 169, 2, 4570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (switch_instance) mount_component(switch_instance, button, null);
    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[33](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_2*/ ctx[24], false, false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_2*/ ctx[25], false, false, false, false),
    					listen_dev(button, "mouseenter", /*mouseenter_handler_2*/ ctx[26], false, false, false, false),
    					listen_dev(button, "mouseleave", /*mouseleave_handler_2*/ ctx[27], false, false, false, false)
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

    			if (dirty[0] & /*icon*/ 8 && switch_value !== (switch_value = /*icon*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
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
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
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
    			add_location(a, file$7, 150, 2, 4187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			if (switch_instance) mount_component(switch_instance, a, null);
    			/*a_binding*/ ctx[32](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler_1*/ ctx[20], false, false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler_1*/ ctx[21], false, false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler_1*/ ctx[22], false, false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler_1*/ ctx[23], false, false, false, false)
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

    			if (dirty[0] & /*icon*/ 8 && switch_value !== (switch_value = /*icon*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
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
    			add_location(span, file$7, 178, 6, 4719);
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
    			add_location(span, file$7, 159, 6, 4331);
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

    function create_fragment$7(ctx) {
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    			instance$7,
    			create_fragment$7,
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
    			id: create_fragment$7.name
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

    /* node_modules\carbon-components-svelte\src\Loading\Loading.svelte generated by Svelte v3.59.2 */

    const file$6 = "node_modules\\carbon-components-svelte\\src\\Loading\\Loading.svelte";

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
    			add_location(label, file$6, 63, 4, 1781);
    			add_location(title, file$6, 65, 6, 1925);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$6, 73, 6, 2133);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$6, 64, 4, 1859);
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--loading", true);
    			toggle_class(div, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div, file$6, 53, 2, 1479);
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
    	let div_data_1 = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div_data_1 = assign(div_data_1, div1_levels[i]);
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
    			add_location(label, file$6, 34, 6, 933);
    			add_location(title, file$6, 36, 8, 1081);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "r", /*spinnerRadius*/ ctx[5]);
    			toggle_class(circle, "bx--loading__stroke", true);
    			add_location(circle, file$6, 44, 8, 1305);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			toggle_class(svg, "bx--loading__svg", true);
    			add_location(svg, file$6, 35, 6, 1013);
    			attr_dev(div0, "aria-atomic", "true");
    			attr_dev(div0, "aria-labelledby", /*id*/ ctx[4]);
    			attr_dev(div0, "aria-live", div0_aria_live_value = /*active*/ ctx[1] ? 'assertive' : 'off');
    			toggle_class(div0, "bx--loading", true);
    			toggle_class(div0, "bx--loading--small", /*small*/ ctx[0]);
    			toggle_class(div0, "bx--loading--stop", !/*active*/ ctx[1]);
    			add_location(div0, file$6, 25, 4, 634);
    			set_attributes(div1, div_data_1);
    			toggle_class(div1, "bx--loading-overlay", true);
    			toggle_class(div1, "bx--loading-overlay--stop", !/*active*/ ctx[1]);
    			add_location(div1, file$6, 20, 2, 513);
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

    			set_attributes(div1, div_data_1 = get_spread_update(div1_levels, [dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]]));
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
    			add_location(circle, file$6, 67, 8, 1980);
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
    			add_location(circle, file$6, 38, 10, 1140);
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

    function create_fragment$6(ctx) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
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
    			id: create_fragment$6.name
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

    /* node_modules\carbon-components-svelte\src\Form\Form.svelte generated by Svelte v3.59.2 */

    const file$5 = "node_modules\\carbon-components-svelte\\src\\Form\\Form.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(form, file$5, 6, 0, 150);
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
    					listen_dev(form, "click", /*click_handler*/ ctx[4], false, false, false, false),
    					listen_dev(form, "keydown", /*keydown_handler*/ ctx[5], false, false, false, false),
    					listen_dev(form, "mouseover", /*mouseover_handler*/ ctx[6], false, false, false, false),
    					listen_dev(form, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false, false),
    					listen_dev(form, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[9]), false, true, false, false)
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { ref: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$5.name
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
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
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
    const GET_ALL_MORDER_STATUSES_API = BASE_URL + '/client-api/get-all-morder-statuses/';
    const MORDER_GET_API = BASE_URL + '/morders/api-get-order-data';
    const MORDER_EDIT_API = BASE_URL + '/morders/api-edit-order';
    const GET_ALL_PROVIDERS_API_URL =  BASE_URL + '/svelte/api/providers/';
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

    async function apiGetProviders() {
        let response = await fetch_wraper(GET_ALL_PROVIDERS_API_URL);
        return response;
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

    async function apiGetAllMorderStatuses() {
        return await fetch_wraper(GET_ALL_MORDER_STATUSES_API);
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

    /* src\MentriesServerTable.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;
    const file$4 = "src\\MentriesServerTable.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[29] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[29] = i;
    	return child_ctx;
    }

    function get_each_context_5$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_6$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (167:0) {#if ALL_COLORS_DICT && ALL_SIZES_DICT}
    function create_if_block$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*sorted_verients*/ ctx[5].length == 0 && /*sorted_colors*/ ctx[4].length == 1 && /*sorted_sizes*/ ctx[3].length == 1) return create_if_block_1$3;
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
    		source: "(167:0) {#if ALL_COLORS_DICT && ALL_SIZES_DICT}",
    		ctx
    	});

    	return block;
    }

    // (184:2) {:else}
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
    	let t8_value = /*product*/ ctx[0].entries.reduce(/*func_6*/ ctx[17], 0) + "";
    	let t8;
    	let table_id_value;
    	let if_block0 = /*sorted_verients*/ ctx[5].length != 0 && create_if_block_7$2(ctx);
    	let each_value_6 = /*sorted_sizes*/ ctx[3];
    	validate_each_argument(each_value_6);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_2[i] = create_each_block_6$1(get_each_context_6$1(ctx, each_value_6, i));
    	}

    	let each_value_1 = /*sorted_colors*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	let if_block1 = /*product*/ ctx[0].verients.length > 0 && create_if_block_2$3(ctx);
    	let each_value = /*sorted_sizes*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
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
    			add_location(th, file$4, 187, 10, 6247);
    			attr_dev(tr, "class", "svelte-13qct7y");
    			add_location(tr, file$4, 186, 8, 6232);
    			attr_dev(thead, "class", "svelte-13qct7y");
    			add_location(thead, file$4, 185, 6, 6216);
    			attr_dev(tbody, "class", "svelte-13qct7y");
    			add_location(tbody, file$4, 198, 6, 6558);
    			attr_dev(td0, "class", "svelte-13qct7y");
    			add_location(td0, file$4, 298, 8, 10655);
    			attr_dev(td1, "class", "total-cell full-total svelte-13qct7y");
    			add_location(td1, file$4, 314, 8, 11106);
    			attr_dev(tfoot, "class", "svelte-13qct7y");
    			add_location(tfoot, file$4, 297, 6, 10639);
    			attr_dev(table, "class", "entries-table svelte-13qct7y");
    			attr_dev(table, "id", table_id_value = "entries-table-" + /*product*/ ctx[0].id);
    			add_location(table, file$4, 184, 4, 6148);
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
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(tr, null);
    				}
    			}

    			append_dev(table, t3);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(tbody, null);
    				}
    			}

    			append_dev(table, t4);
    			append_dev(table, tfoot);
    			append_dev(tfoot, td0);
    			append_dev(tfoot, t5);
    			if (if_block1) if_block1.m(tfoot, null);
    			append_dev(tfoot, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tfoot, null);
    				}
    			}

    			append_dev(tfoot, t7);
    			append_dev(tfoot, td1);
    			append_dev(td1, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (/*sorted_verients*/ ctx[5].length != 0) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_7$2(ctx);
    					if_block0.c();
    					if_block0.m(tr, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*sorted_sizes*/ 8) {
    				each_value_6 = /*sorted_sizes*/ ctx[3];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6$1(ctx, each_value_6, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_6$1(child_ctx);
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
    				each_value_1 = /*sorted_colors*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
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

    			if (dirty[0] & /*product, sorted_sizes*/ 9) {
    				each_value = /*sorted_sizes*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tfoot, t7);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*product*/ 1 && t8_value !== (t8_value = /*product*/ ctx[0].entries.reduce(/*func_6*/ ctx[17], 0) + "")) set_data_dev(t8, t8_value);

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
    		source: "(184:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (168:2) {#if sorted_verients.length == 0 && sorted_colors.length == 1 && sorted_sizes.length == 1}
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
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[7](/*sorted_sizes*/ ctx[3][0].id, /*sorted_colors*/ ctx[4][0], null);
    			attr_dev(input, "class", "size-input cls-cell svelte-13qct7y");
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[1][/*sorted_colors*/ ctx[4][0]]?.color);
    			attr_dev(input, "data-color", input_data_color_value = /*sorted_colors*/ ctx[4][0]);
    			attr_dev(input, "data-size", input_data_size_value = /*sorted_sizes*/ ctx[3][0].id);
    			attr_dev(input, "data-ver", null);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[2][/*sorted_sizes*/ ctx[3][0].id].size);
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$4, 169, 6, 5652);
    			attr_dev(div, "class", "single-input-wraper svelte-13qct7y");
    			add_location(div, file$4, 168, 4, 5612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes, sorted_colors*/ 24 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[7](/*sorted_sizes*/ ctx[3][0].id, /*sorted_colors*/ ctx[4][0], null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 18) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[1][/*sorted_colors*/ ctx[4][0]]?.color);
    			}

    			if (dirty[0] & /*sorted_colors*/ 16 && input_data_color_value !== (input_data_color_value = /*sorted_colors*/ ctx[4][0])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*sorted_sizes*/ 8 && input_data_size_value !== (input_data_size_value = /*sorted_sizes*/ ctx[3][0].id)) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*ALL_SIZES_DICT, sorted_sizes*/ 12 && input_placeholder_value !== (input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[2][/*sorted_sizes*/ ctx[3][0].id].size)) {
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
    		source: "(168:2) {#if sorted_verients.length == 0 && sorted_colors.length == 1 && sorted_sizes.length == 1}",
    		ctx
    	});

    	return block;
    }

    // (189:10) {#if sorted_verients.length != 0}
    function create_if_block_7$2(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "מודל";
    			attr_dev(th, "class", "const-size-cell svelte-13qct7y");
    			add_location(th, file$4, 189, 12, 6351);
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
    		source: "(189:10) {#if sorted_verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (192:10) {#each sorted_sizes as size}
    function create_each_block_6$1(ctx) {
    	let th;
    	let t0_value = /*size*/ ctx[21].size + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(th, "class", "svelte-13qct7y");
    			add_location(th, file$4, 192, 12, 6456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes*/ 8 && t0_value !== (t0_value = /*size*/ ctx[21].size + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6$1.name,
    		type: "each",
    		source: "(192:10) {#each sorted_sizes as size}",
    		ctx
    	});

    	return block;
    }

    // (208:14) {:else}
    function create_else_block_3$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "-";
    			attr_dev(div, "class", "svelte-13qct7y");
    			add_location(div, file$4, 208, 16, 6939);
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
    		id: create_else_block_3$1.name,
    		type: "else",
    		source: "(208:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (203:14) {#if color}
    function create_if_block_6$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1_value = /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "inner svelte-13qct7y");
    			set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]].color);
    			add_location(div0, file$4, 204, 18, 6751);
    			attr_dev(div1, "class", "color-box svelte-13qct7y");
    			add_location(div1, file$4, 203, 16, 6709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 18) {
    				set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]].color);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 18 && t1_value !== (t1_value = /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(203:14) {#if color}",
    		ctx
    	});

    	return block;
    }

    // (213:12) {#if sorted_verients.length != 0}
    function create_if_block_5$2(ctx) {
    	let td;
    	let each_value_5 = /*sorted_verients*/ ctx[5];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5$1(get_each_context_5$1(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			td = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(td, "class", "svelte-13qct7y");
    			add_location(td, file$4, 213, 14, 7051);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(td, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_verients*/ 32) {
    				each_value_5 = /*sorted_verients*/ ctx[5];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5$1(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5$1(child_ctx);
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
    		source: "(213:12) {#if sorted_verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (215:16) {#each sorted_verients as varient}
    function create_each_block_5$1(ctx) {
    	let div;
    	let t0_value = (/*varient*/ ctx[34]?.name || "") + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "varient-box cls-cell svelte-13qct7y");
    			add_location(div, file$4, 215, 18, 7125);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_verients*/ 32 && t0_value !== (t0_value = (/*varient*/ ctx[34]?.name || "") + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5$1.name,
    		type: "each",
    		source: "(215:16) {#each sorted_verients as varient}",
    		ctx
    	});

    	return block;
    }

    // (241:16) {:else}
    function create_else_block_2$1(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*sorted_verients*/ ctx[5];
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
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*find_entry_quantity, sorted_sizes, sorted_colors, sorted_verients, ALL_COLORS_DICT, ALL_SIZES_DICT, input_amount_changed*/ 254) {
    				each_value_4 = /*sorted_verients*/ ctx[5];
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
    		source: "(241:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (225:16) {#if sorted_verients.length == 0}
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
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[30].id, /*color*/ ctx[24], null);
    			attr_dev(input, "class", "size-input cls-cell svelte-13qct7y");
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]]?.color);
    			attr_dev(input, "data-color", input_data_color_value = /*color*/ ctx[24]);
    			attr_dev(input, "data-size", input_data_size_value = /*size_obj*/ ctx[30].id);
    			attr_dev(input, "data-ver", null);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[2][/*size_obj*/ ctx[30].id].size);
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$4, 226, 20, 7571);
    			attr_dev(div, "class", "cell-wraper svelte-13qct7y");
    			add_location(div, file$4, 225, 18, 7525);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes, sorted_colors*/ 24 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[30].id, /*color*/ ctx[24], null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 18) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]]?.color);
    			}

    			if (dirty[0] & /*sorted_colors*/ 16 && input_data_color_value !== (input_data_color_value = /*color*/ ctx[24])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*sorted_sizes*/ 8 && input_data_size_value !== (input_data_size_value = /*size_obj*/ ctx[30].id)) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*ALL_SIZES_DICT, sorted_sizes*/ 12 && input_placeholder_value !== (input_placeholder_value = /*ALL_SIZES_DICT*/ ctx[2][/*size_obj*/ ctx[30].id].size)) {
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
    		source: "(225:16) {#if sorted_verients.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (242:18) {#each sorted_verients as ver, idx}
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
    			input.value = input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[30].id, /*color*/ ctx[24], /*ver*/ ctx[27]?.id || null);
    			set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]]?.color);
    			attr_dev(input, "data-color", input_data_color_value = /*color*/ ctx[24]);
    			attr_dev(input, "data-size", input_data_size_value = /*size_obj*/ ctx[30].id);
    			attr_dev(input, "data-ver", input_data_ver_value = /*ver*/ ctx[27]?.id || null);
    			attr_dev(input, "class", "size-input cls-cell svelte-13qct7y");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", input_placeholder_value = "" + (/*ALL_SIZES_DICT*/ ctx[2][/*size_obj*/ ctx[30].id].size + "(" + (/*ver*/ ctx[27]?.name || '') + ")"));
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "9999");
    			add_location(input, file$4, 243, 22, 8327);
    			attr_dev(div, "class", "cell-wraper svelte-13qct7y");
    			add_location(div, file$4, 242, 20, 8279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_amount_changed*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sorted_sizes, sorted_colors, sorted_verients*/ 56 && input_value_value !== (input_value_value = /*find_entry_quantity*/ ctx[7](/*size_obj*/ ctx[30].id, /*color*/ ctx[24], /*ver*/ ctx[27]?.id || null)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS_DICT, sorted_colors*/ 18) {
    				set_style(input, "border", "2px solid " + /*ALL_COLORS_DICT*/ ctx[1][/*color*/ ctx[24]]?.color);
    			}

    			if (dirty[0] & /*sorted_colors*/ 16 && input_data_color_value !== (input_data_color_value = /*color*/ ctx[24])) {
    				attr_dev(input, "data-color", input_data_color_value);
    			}

    			if (dirty[0] & /*sorted_sizes*/ 8 && input_data_size_value !== (input_data_size_value = /*size_obj*/ ctx[30].id)) {
    				attr_dev(input, "data-size", input_data_size_value);
    			}

    			if (dirty[0] & /*sorted_verients*/ 32 && input_data_ver_value !== (input_data_ver_value = /*ver*/ ctx[27]?.id || null)) {
    				attr_dev(input, "data-ver", input_data_ver_value);
    			}

    			if (dirty[0] & /*ALL_SIZES_DICT, sorted_sizes, sorted_verients*/ 44 && input_placeholder_value !== (input_placeholder_value = "" + (/*ALL_SIZES_DICT*/ ctx[2][/*size_obj*/ ctx[30].id].size + "(" + (/*ver*/ ctx[27]?.name || '') + ")"))) {
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
    		source: "(242:18) {#each sorted_verients as ver, idx}",
    		ctx
    	});

    	return block;
    }

    // (222:12) {#each sorted_sizes as size_obj}
    function create_each_block_3$1(ctx) {
    	let td;

    	function select_block_type_2(ctx, dirty) {
    		if (/*sorted_verients*/ ctx[5].length == 0) return create_if_block_4$2;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			attr_dev(td, "class", "size-cell svelte-13qct7y");
    			add_location(td, file$4, 222, 14, 7348);
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
    		source: "(222:12) {#each sorted_sizes as size_obj}",
    		ctx
    	});

    	return block;
    }

    // (272:14) {:else}
    function create_else_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*sorted_verients*/ ctx[5];
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
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*product, sorted_colors, sorted_verients*/ 49) {
    				each_value_2 = /*sorted_verients*/ ctx[5];
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
    		source: "(272:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (264:14) {#if sorted_verients.length == 0}
    function create_if_block_3$2(ctx) {
    	let div;
    	let t_value = /*product*/ ctx[0].entries.filter(func).reduce(/*func_1*/ ctx[12], 0) + "";
    	let t;

    	function func(...args) {
    		return /*func*/ ctx[11](/*color*/ ctx[24], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "center-text svelte-13qct7y");
    			add_location(div, file$4, 264, 16, 9194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*product, sorted_colors*/ 17 && t_value !== (t_value = /*product*/ ctx[0].entries.filter(func).reduce(/*func_1*/ ctx[12], 0) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(264:14) {#if sorted_verients.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (273:16) {#each sorted_verients as ver, idx}
    function create_each_block_2$3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*product*/ ctx[0].entries.filter(func_2).reduce(/*func_3*/ ctx[14], 0) + "";
    	let t1;
    	let t2;

    	function func_2(...args) {
    		return /*func_2*/ ctx[13](/*color*/ ctx[24], /*ver*/ ctx[27], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(")\n                  ");
    			attr_dev(div, "class", "center-text svelte-13qct7y");
    			add_location(div, file$4, 273, 18, 9562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*product, sorted_colors, sorted_verients*/ 49 && t1_value !== (t1_value = /*product*/ ctx[0].entries.filter(func_2).reduce(/*func_3*/ ctx[14], 0) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(273:16) {#each sorted_verients as ver, idx}",
    		ctx
    	});

    	return block;
    }

    // (200:8) {#each sorted_colors as color, color_idx}
    function create_each_block_1$4(ctx) {
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
    		if (/*color*/ ctx[24]) return create_if_block_6$2;
    		return create_else_block_3$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*sorted_verients*/ ctx[5].length != 0 && create_if_block_5$2(ctx);
    	let each_value_3 = /*sorted_sizes*/ ctx[3];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	function select_block_type_3(ctx, dirty) {
    		if (/*sorted_verients*/ ctx[5].length == 0) return create_if_block_3$2;
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
    			add_location(td0, file$4, 201, 12, 6643);
    			attr_dev(td1, "class", "total-cell svelte-13qct7y");
    			add_location(td1, file$4, 262, 12, 9106);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M30.9 2.3h-8.6L21.6 1c-.3-.6-.9-1-1.5-1h-8.2c-.6 0-1.2.4-1.5.9l-.7 1.4H1.1C.5 2.3 0 2.8 0 3.4v2.2c0 .6.5 1.1 1.1 1.1h29.7c.6 0 1.1-.5 1.1-1.1V3.4c.1-.6-.4-1.1-1-1.1zM3.8 32.8A3.4 3.4 0 0 0 7.2 36h17.6c1.8 0 3.3-1.4 3.4-3.2L29.7 9H2.3l1.5 23.8z");
    			attr_dev(path, "class", "svelte-13qct7y");
    			add_location(path, file$4, 287, 19, 10186);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16px");
    			attr_dev(svg, "height", "16px");
    			attr_dev(svg, "viewBox", "0 0 32 36");
    			attr_dev(svg, "class", "svelte-13qct7y");
    			add_location(svg, file$4, 286, 16, 10080);
    			attr_dev(button, "class", "remove-button svelte-13qct7y");
    			add_location(button, file$4, 285, 14, 9995);
    			attr_dev(td2, "class", "delete-cell-style svelte-13qct7y");
    			add_location(td2, file$4, 284, 12, 9950);
    			attr_dev(tr, "class", "svelte-13qct7y");
    			add_location(tr, file$4, 200, 10, 6626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			if_block0.m(td0, null);
    			append_dev(tr, t0);
    			if (if_block1) if_block1.m(tr, null);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tr, null);
    				}
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
    						if (is_function(/*clear_sizes_entries*/ ctx[8](/*color*/ ctx[24]))) /*clear_sizes_entries*/ ctx[8](/*color*/ ctx[24]).apply(this, arguments);
    					},
    					false,
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

    			if (/*sorted_verients*/ ctx[5].length != 0) {
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
    				each_value_3 = /*sorted_sizes*/ ctx[3];
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
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(200:8) {#each sorted_colors as color, color_idx}",
    		ctx
    	});

    	return block;
    }

    // (302:8) {#if product.verients.length > 0}
    function create_if_block_2$3(ctx) {
    	let td;

    	const block = {
    		c: function create() {
    			td = element("td");
    			attr_dev(td, "class", "svelte-13qct7y");
    			add_location(td, file$4, 302, 10, 10775);
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
    		source: "(302:8) {#if product.verients.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (305:8) {#each sorted_sizes as size}
    function create_each_block$4(ctx) {
    	let td;
    	let t_value = /*product*/ ctx[0].entries.filter(func_4).reduce(/*func_5*/ ctx[16], 0) + "";
    	let t;

    	function func_4(...args) {
    		return /*func_4*/ ctx[15](/*size*/ ctx[21], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "total-cell svelte-13qct7y");
    			add_location(td, file$4, 305, 10, 10843);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*product, sorted_sizes*/ 9 && t_value !== (t_value = /*product*/ ctx[0].entries.filter(func_4).reduce(/*func_5*/ ctx[16], 0) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(305:8) {#each sorted_sizes as size}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*ALL_COLORS_DICT*/ ctx[1] && /*ALL_SIZES_DICT*/ ctx[2] && create_if_block$3(ctx);

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
    			if (/*ALL_COLORS_DICT*/ ctx[1] && /*ALL_SIZES_DICT*/ ctx[2]) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MentriesServerTable', slots, []);
    	let { product } = $$props;
    	let { ALL_SIZES } = $$props;
    	let { ALL_VERIENTS } = $$props;
    	let sizes_ids_set = new Set();
    	let colors_ids_set = new Set();
    	let verients_ids_set = new Set();
    	let sorted_sizes = [];
    	let sorted_colors = [];
    	let sorted_verients = [];
    	let { ALL_COLORS_DICT = undefined } = $$props;
    	let { ALL_SIZES_DICT = undefined } = $$props;

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

    	$$self.$$.on_mount.push(function () {
    		if (product === undefined && !('product' in $$props || $$self.$$.bound[$$self.$$.props['product']])) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'product'");
    		}

    		if (ALL_SIZES === undefined && !('ALL_SIZES' in $$props || $$self.$$.bound[$$self.$$.props['ALL_SIZES']])) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'ALL_SIZES'");
    		}

    		if (ALL_VERIENTS === undefined && !('ALL_VERIENTS' in $$props || $$self.$$.bound[$$self.$$.props['ALL_VERIENTS']])) {
    			console_1$3.warn("<MentriesServerTable> was created without expected prop 'ALL_VERIENTS'");
    		}
    	});

    	const writable_props = ['product', 'ALL_SIZES', 'ALL_VERIENTS', 'ALL_COLORS_DICT', 'ALL_SIZES_DICT'];

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
    		if ('ALL_VERIENTS' in $$props) $$invalidate(10, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(1, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(2, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    	};

    	$$self.$capture_state = () => ({
    		Form: Form$1,
    		apiGetAllSizes,
    		product,
    		ALL_SIZES,
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
    		if ('ALL_VERIENTS' in $$props) $$invalidate(10, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('sizes_ids_set' in $$props) sizes_ids_set = $$props.sizes_ids_set;
    		if ('colors_ids_set' in $$props) colors_ids_set = $$props.colors_ids_set;
    		if ('verients_ids_set' in $$props) verients_ids_set = $$props.verients_ids_set;
    		if ('sorted_sizes' in $$props) $$invalidate(3, sorted_sizes = $$props.sorted_sizes);
    		if ('sorted_colors' in $$props) $$invalidate(4, sorted_colors = $$props.sorted_colors);
    		if ('sorted_verients' in $$props) $$invalidate(5, sorted_verients = $$props.sorted_verients);
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(1, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(2, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*product, ALL_SIZES, ALL_VERIENTS*/ 1537) {
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
    				debugger;

    				let ALL_SIZES_ordered = ALL_SIZES;

    				//console.log('ALL_SIZES_ordered:', ALL_SIZES_ordered);
    				//console.log('sizes_ids_set:', sizes_ids_set);
    				let sorted_sizes_temp = [];

    				for (let size of ALL_SIZES_ordered) {
    					if (sizes_temp_set.has(size.id)) {
    						sorted_sizes_temp.push(size);
    					}
    				}

    				$$invalidate(3, sorted_sizes = [...sorted_sizes_temp.reverse()]);

    				//console.log('sorted_sizes:', sorted_sizes);
    				$$invalidate(4, sorted_colors = [...colors_temp_set]);

    				$$invalidate(5, sorted_verients = [...verients_temp_set].filter(v => v != null).map(ver_id => ALL_VERIENTS.find(ver => ver.id == ver_id)));
    			}
    		}
    	};

    	return [
    		product,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		sorted_sizes,
    		sorted_colors,
    		sorted_verients,
    		input_amount_changed,
    		find_entry_quantity,
    		clear_sizes_entries,
    		ALL_SIZES,
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
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				product: 0,
    				ALL_SIZES: 9,
    				ALL_VERIENTS: 10,
    				ALL_COLORS_DICT: 1,
    				ALL_SIZES_DICT: 2
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MentriesServerTable",
    			options,
    			id: create_fragment$4.name
    		});
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

    	get ALL_VERIENTS() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_VERIENTS(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_COLORS_DICT() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_COLORS_DICT(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_SIZES_DICT() {
    		throw new Error("<MentriesServerTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_SIZES_DICT(value) {
    		throw new Error("<MentriesServerTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\simple-svelte-autocomplete\src\SimpleAutocomplete.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1$1, console: console_1$2 } = globals;
    const file$3 = "node_modules\\simple-svelte-autocomplete\\src\\SimpleAutocomplete.svelte";

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

    function get_each_context$3(ctx, list, i) {
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

    function get_each_context_1$3(ctx, list, i) {
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
    function create_if_block_11$1(ctx) {
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
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
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
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(1144:39) ",
    		ctx
    	});

    	return block;
    }

    // (1142:4) {#if !multiple && value}
    function create_if_block_10$1(ctx) {
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
    			add_location(option, file$3, 1142, 6, 27728);
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
    		id: create_if_block_10$1.name,
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
    			add_location(option, file$3, 1145, 8, 27849);
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
    function create_if_block_9$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selectedItem*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
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
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
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
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
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
    		id: create_if_block_9$1.name,
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
    			add_location(span0, file$3, 1160, 12, 28273);
    			attr_dev(span1, "class", "tag is-delete svelte-lduj97");
    			add_location(span1, file$3, 1161, 12, 28339);
    			attr_dev(div, "class", "tags has-addons svelte-lduj97");
    			add_location(div, file$3, 1159, 10, 28231);
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
    					false,
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
    function create_each_block_1$3(ctx) {
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(1154:6) {#each selectedItem as tagItem}",
    		ctx
    	});

    	return block;
    }

    // (1187:4) {#if clearable}
    function create_if_block_8$1(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✖";
    			attr_dev(span, "class", "autocomplete-clear-button svelte-lduj97");
    			add_location(span, file$3, 1187, 6, 29082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clear*/ ctx[45], false, false, false, false);
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
    		id: create_if_block_8$1.name,
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
    			add_location(div, file$3, 1234, 6, 30903);
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
    			add_location(div, file$3, 1230, 6, 30728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (create_slot_or_fallback) {
    				create_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*selectItem*/ ctx[35], false, false, false, false);
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
    			add_location(div, file$3, 1226, 6, 30578);
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
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    			add_location(div, file$3, 1198, 12, 29548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", click_handler, false, false, false, false),
    					listen_dev(div, "pointerenter", pointerenter_handler, false, false, false, false)
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

    			if (!current || dirty[0] & /*highlightIndex, filteredListItems*/ 201326592 | dirty[1] & /*isConfirmed*/ 32768) {
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
    			html_tag = new HtmlTag(false);
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
    			html_tag = new HtmlTag(false);
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
    function create_each_block$3(ctx) {
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
    		id: create_each_block$3.name,
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
    			add_location(div, file$3, 1221, 8, 30378);
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

    function create_fragment$3(ctx) {
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
    		if (!/*multiple*/ ctx[6] && /*value*/ ctx[2]) return create_if_block_10$1;
    		if (/*multiple*/ ctx[6] && /*selectedItem*/ ctx[1]) return create_if_block_11$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*multiple*/ ctx[6] && /*selectedItem*/ ctx[1] && create_if_block_9$1(ctx);
    	let if_block2 = /*clearable*/ ctx[31] && create_if_block_8$1(ctx);
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
    			add_location(select, file$3, 1140, 2, 27641);
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
    			add_location(input_1, file$3, 1168, 4, 28507);
    			attr_dev(div0, "class", "input-container svelte-lduj97");
    			add_location(div0, file$3, 1151, 2, 27987);

    			attr_dev(div1, "class", div1_class_value = "" + ((/*dropdownClassName*/ ctx[24]
    			? /*dropdownClassName*/ ctx[24]
    			: '') + " autocomplete-list " + (/*showList*/ ctx[32] ? '' : 'hidden') + " is-fullwidth" + " svelte-lduj97"));

    			add_location(div1, file$3, 1190, 2, 29176);

    			attr_dev(div2, "class", div2_class_value = "" + ((/*className*/ ctx[15] ? /*className*/ ctx[15] : '') + " " + (/*hideArrow*/ ctx[9] || !/*items*/ ctx[0].length
    			? 'hide-arrow'
    			: '') + " " + (/*multiple*/ ctx[6] ? 'is-multiple' : '') + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[33] + " svelte-lduj97"));

    			toggle_class(div2, "show-clear", /*clearable*/ ctx[31]);
    			toggle_class(div2, "is-loading", /*showLoadingIndicator*/ ctx[10] && /*loading*/ ctx[30]);
    			add_location(div2, file$3, 1134, 0, 27381);
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
    					listen_dev(window, "click", /*onDocumentClick*/ ctx[37], false, false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[78]),
    					listen_dev(input_1, "input", /*onInput*/ ctx[40], false, false, false, false),
    					listen_dev(input_1, "focus", /*onFocusInternal*/ ctx[43], false, false, false, false),
    					listen_dev(input_1, "blur", /*onBlurInternal*/ ctx[44], false, false, false, false),
    					listen_dev(input_1, "keydown", /*onKeyDown*/ ctx[38], false, false, false, false),
    					listen_dev(input_1, "click", /*onInputClick*/ ctx[42], false, false, false, false),
    					listen_dev(input_1, "keypress", /*onKeyPress*/ ctx[39], false, false, false, false)
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
    					if_block1 = create_if_block_9$1(ctx);
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
    					if_block2 = create_if_block_8$1(ctx);
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

    			if (!current || dirty[0] & /*className, hideArrow, items, multiple*/ 33345 | dirty[1] & /*clearable*/ 1) {
    				toggle_class(div2, "show-clear", /*clearable*/ ctx[31]);
    			}

    			if (!current || dirty[0] & /*className, hideArrow, items, multiple, showLoadingIndicator, loading*/ 1073776193) {
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
    		id: create_fragment$3.name,
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

    function instance$3($$self, $$props, $$invalidate) {
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

    	$$self.$$.on_mount.push(function () {
    		if (text === undefined && !('text' in $$props || $$self.$$.bound[$$self.$$.props['text']])) {
    			console_1$2.warn("<SimpleAutocomplete> was created without expected prop 'text'");
    		}
    	});

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

    	Object_1$1.keys($$props).forEach(key => {
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
    			instance$3,
    			create_fragment$3,
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
    			id: create_fragment$3.name
    		});
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

    /* src\components\popups\MorderAddProductEntryPopup.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\components\\popups\\MorderAddProductEntryPopup.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
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
    			add_location(div0, file$2, 51, 8, 1780);
    			attr_dev(div1, "id", "singleAmountPopup");
    			set_style(div1, "z-index", /*modal_zIndex*/ ctx[9]);
    			attr_dev(div1, "class", "modal active svelte-nfr7vy");
    			add_location(div1, file$2, 50, 4, 1689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*closeModal*/ ctx[10], false, false, false, false);
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

    	let each_value_1 = /*ALL_SIZES*/ ctx[1].sort(func);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*ALL_VERIENTS*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			add_location(button0, file$2, 55, 20, 2129);
    			attr_dev(div0, "class", "modal-title svelte-nfr7vy");
    			add_location(div0, file$2, 56, 20, 2228);
    			attr_dev(button1, "title", "Close");
    			attr_dev(button1, "class", "close-btn left");
    			add_location(button1, file$2, 57, 20, 2350);
    			attr_dev(div1, "class", "modal-header svelte-nfr7vy");
    			add_location(div1, file$2, 54, 16, 2082);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "product_id");
    			input0.value = input0_value_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.product.id;
    			add_location(input0, file$2, 61, 20, 2533);
    			attr_dev(input1, "type", "hidden");
    			attr_dev(input1, "name", "entry_id");
    			input1.value = input1_value_value = /*$morderAddProductEntryPopupStore*/ ctx[8].product.entry_id;
    			add_location(input1, file$2, 62, 20, 2655);
    			attr_dev(label0, "for", "color");
    			add_location(label0, file$2, 64, 24, 2826);
    			attr_dev(option0, "default", "");
    			option0.__value = "undefined";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 66, 32, 3000);
    			attr_dev(select0, "class", "form-control");
    			attr_dev(select0, "name", "color");
    			attr_dev(select0, "id", "color");
    			if (/*selected_color*/ ctx[3] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[12].call(select0));
    			add_location(select0, file$2, 65, 28, 2885);
    			attr_dev(label1, "for", "size");
    			add_location(label1, file$2, 72, 24, 3297);
    			attr_dev(option1, "default", "");
    			option1.__value = "undefined";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 74, 32, 3468);
    			attr_dev(select1, "class", "form-control");
    			attr_dev(select1, "name", "size");
    			attr_dev(select1, "id", "size");
    			if (/*selected_size*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[13].call(select1));
    			add_location(select1, file$2, 73, 28, 3356);
    			attr_dev(label2, "for", "varient");
    			add_location(label2, file$2, 82, 24, 3887);
    			attr_dev(option2, "default", "");
    			option2.__value = "undefined";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 84, 32, 4070);
    			attr_dev(select2, "class", "form-control");
    			attr_dev(select2, "name", "varient");
    			attr_dev(select2, "id", "varient");
    			if (/*selected_verient*/ ctx[5] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[14].call(select2));
    			add_location(select2, file$2, 83, 28, 3949);
    			attr_dev(label3, "for", "amount");
    			add_location(label3, file$2, 90, 24, 4400);
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "name", "amount");
    			attr_dev(input2, "id", "amount");
    			add_location(input2, file$2, 91, 28, 4461);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$2, 63, 24, 2777);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "class", "btn btn-primary");
    			add_location(button2, file$2, 96, 20, 4736);
    			attr_dev(div3, "class", "modal-body svelte-nfr7vy");
    			add_location(div3, file$2, 60, 16, 2488);
    			attr_dev(div4, "class", "modal_content svelte-nfr7vy");
    			set_style(div4, "z-index", /*modal_zIndex*/ ctx[9] + 10);
    			add_location(div4, file$2, 53, 12, 1929);
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
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(select0, null);
    				}
    			}

    			select_option(select0, /*selected_color*/ ctx[3], true);
    			append_dev(div2, t12);
    			append_dev(div2, label1);
    			append_dev(div2, t14);
    			append_dev(div2, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(select1, null);
    				}
    			}

    			select_option(select1, /*selected_size*/ ctx[4], true);
    			append_dev(div2, t16);
    			append_dev(div2, label2);
    			append_dev(div2, t18);
    			append_dev(div2, select2);
    			append_dev(select2, option2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select2, null);
    				}
    			}

    			select_option(select2, /*selected_verient*/ ctx[5], true);
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
    					listen_dev(button0, "click", /*closeModal*/ ctx[10], false, false, false, false),
    					listen_dev(button1, "click", /*closeModal*/ ctx[10], false, false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[12]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[13]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[14]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(button2, "click", /*add_entry_btn_clicked*/ ctx[11], false, false, false, false),
    					listen_dev(div4, "click", stop_propagation(click_handler), false, false, true, false)
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
    				each_value_1 = /*ALL_SIZES*/ ctx[1].sort(func);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    			add_location(option, file$2, 68, 32, 3141);
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
    function create_each_block_1$2(ctx) {
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
    			add_location(option, file$2, 78, 32, 3733);
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(76:32) {#each ALL_SIZES.sort((a, b) => {                                     return a.code.localeCompare(b.code);                                 }) as size}",
    		ctx
    	});

    	return block;
    }

    // (86:32) {#each ALL_VERIENTS as varient}
    function create_each_block$2(ctx) {
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
    			add_location(option, file$2, 86, 32, 4216);
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
    		id: create_each_block$2.name,
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

    function create_fragment$2(ctx) {
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = (a, b) => {
    	return a.code.localeCompare(b.code);
    };

    const click_handler = () => {
    	
    };

    function instance$2($$self, $$props, $$invalidate) {
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

    	$$self.$$.on_mount.push(function () {
    		if (ALL_COLORS === undefined && !('ALL_COLORS' in $$props || $$self.$$.bound[$$self.$$.props['ALL_COLORS']])) {
    			console_1$1.warn("<MorderAddProductEntryPopup> was created without expected prop 'ALL_COLORS'");
    		}

    		if (ALL_SIZES === undefined && !('ALL_SIZES' in $$props || $$self.$$.bound[$$self.$$.props['ALL_SIZES']])) {
    			console_1$1.warn("<MorderAddProductEntryPopup> was created without expected prop 'ALL_SIZES'");
    		}

    		if (ALL_VERIENTS === undefined && !('ALL_VERIENTS' in $$props || $$self.$$.bound[$$self.$$.props['ALL_VERIENTS']])) {
    			console_1$1.warn("<MorderAddProductEntryPopup> was created without expected prop 'ALL_VERIENTS'");
    		}
    	});

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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			ALL_COLORS: 0,
    			ALL_SIZES: 1,
    			ALL_VERIENTS: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MorderAddProductEntryPopup",
    			options,
    			id: create_fragment$2.name
    		});
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

    /* src\CollectingTable.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\CollectingTable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[11] = list;
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (89:16) {#each ALL_PROVIDERS as provider}
    function create_each_block_1$1(ctx) {
    	let option;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.__value = option_value_value = /*provider*/ ctx[13].label;
    			option.value = option.__value;
    			add_location(option, file$1, 89, 18, 2801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ALL_PROVIDERS*/ 1 && option_value_value !== (option_value_value = /*provider*/ ctx[13].label)) {
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
    		source: "(89:16) {#each ALL_PROVIDERS as provider}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#each orderd_entries as entry}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1_value = /*ALL_COLORS_DICT*/ ctx[1][/*entry*/ ctx[10].color].name + "";
    	let t1;
    	let t2;
    	let td1;
    	let div3;
    	let t3_value = /*ALL_SIZES_DICT*/ ctx[2][/*entry*/ ctx[10].size].size + "";
    	let t3;
    	let t4;
    	let td2;
    	let div4;
    	let t5_value = (/*ALL_VERIENTS_DICT*/ ctx[3][/*entry*/ ctx[10].varient]?.name || "") + "";
    	let t5;
    	let t6;
    	let td3;
    	let div7;
    	let div5;
    	let input0;
    	let t7;
    	let div6;
    	let t8;
    	let t9_value = /*entry*/ ctx[10].quantity + "";
    	let t9;
    	let t10;
    	let td4;
    	let div9;
    	let div8;
    	let input1;
    	let input1_list_value;
    	let t11;
    	let datalist;
    	let datalist_id_value;
    	let t12;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[6].call(input0, /*each_value*/ ctx[11], /*entry_index*/ ctx[12]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*entry*/ ctx[10], /*each_value*/ ctx[11], /*entry_index*/ ctx[12]);
    	}

    	function keydown_handler(...args) {
    		return /*keydown_handler*/ ctx[8](/*entry*/ ctx[10], /*each_value*/ ctx[11], /*entry_index*/ ctx[12], ...args);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[9].call(input1, /*each_value*/ ctx[11], /*entry_index*/ ctx[12]);
    	}

    	let each_value_1 = /*ALL_PROVIDERS*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			td1 = element("td");
    			div3 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			div4 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			td3 = element("td");
    			div7 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t7 = space();
    			div6 = element("div");
    			t8 = text("/ ");
    			t9 = text(t9_value);
    			t10 = space();
    			td4 = element("td");
    			div9 = element("div");
    			div8 = element("div");
    			input1 = element("input");
    			t11 = space();
    			datalist = element("datalist");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			attr_dev(div0, "class", "inner svelte-1rvd8gi");
    			set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[1][/*entry*/ ctx[10].color].color);
    			add_location(div0, file$1, 49, 14, 1366);
    			attr_dev(div1, "class", "color-box svelte-1rvd8gi");
    			add_location(div1, file$1, 48, 12, 1327);
    			attr_dev(div2, "class", "cell-group svelte-1rvd8gi");
    			add_location(div2, file$1, 47, 10, 1289);
    			attr_dev(td0, "class", "svelte-1rvd8gi");
    			add_location(td0, file$1, 46, 8, 1273);
    			attr_dev(div3, "class", "cell-group svelte-1rvd8gi");
    			add_location(div3, file$1, 55, 10, 1578);
    			attr_dev(td1, "class", "svelte-1rvd8gi");
    			add_location(td1, file$1, 54, 8, 1562);
    			attr_dev(div4, "class", "cell-group svelte-1rvd8gi");
    			add_location(div4, file$1, 60, 10, 1708);
    			attr_dev(td2, "class", "svelte-1rvd8gi");
    			add_location(td2, file$1, 59, 8, 1692);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-1rvd8gi");
    			add_location(input0, file$1, 66, 14, 1923);
    			attr_dev(div5, "class", "div svelte-1rvd8gi");
    			add_location(div5, file$1, 65, 12, 1890);
    			attr_dev(div6, "class", "div svelte-1rvd8gi");
    			add_location(div6, file$1, 68, 12, 2019);
    			attr_dev(div7, "class", "cell-group split-cell svelte-1rvd8gi");
    			add_location(div7, file$1, 64, 11, 1841);
    			attr_dev(td3, "class", "svelte-1rvd8gi");
    			add_location(td3, file$1, 63, 13, 1825);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "list", input1_list_value = "providers-" + /*entry*/ ctx[10].id);
    			attr_dev(input1, "class", "svelte-1rvd8gi");
    			add_location(input1, file$1, 86, 14, 2594);
    			attr_dev(datalist, "id", datalist_id_value = "providers-" + /*entry*/ ctx[10].id);
    			add_location(datalist, file$1, 87, 14, 2694);
    			attr_dev(div8, "class", "temp");
    			set_style(div8, "width", "120px");
    			add_location(div8, file$1, 85, 12, 2539);
    			attr_dev(div9, "class", "cell-group svelte-1rvd8gi");
    			add_location(div9, file$1, 84, 10, 2501);
    			attr_dev(td4, "class", "svelte-1rvd8gi");
    			add_location(td4, file$1, 83, 8, 2485);
    			add_location(tr, file$1, 45, 6, 1259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div2, t0);
    			append_dev(div2, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, div3);
    			append_dev(div3, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, div4);
    			append_dev(div4, t5);
    			append_dev(td2, t6);
    			append_dev(tr, td3);
    			append_dev(td3, div7);
    			append_dev(div7, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*entry*/ ctx[10].sheets_taken_quantity);
    			append_dev(div7, t7);
    			append_dev(div7, div6);
    			append_dev(div6, t8);
    			append_dev(div6, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td4);
    			append_dev(td4, div9);
    			append_dev(div9, div8);
    			append_dev(div8, input1);
    			set_input_value(input1, /*entry*/ ctx[10].sheets_provider);
    			append_dev(div8, t11);
    			append_dev(div8, datalist);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(datalist, null);
    				}
    			}

    			append_dev(tr, t12);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(div6, "click", click_handler, false, false, false, false),
    					listen_dev(div6, "keydown", keydown_handler, false, false, false, false),
    					listen_dev(input1, "input", input1_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*ALL_COLORS_DICT, orderd_entries*/ 18) {
    				set_style(div0, "background-color", /*ALL_COLORS_DICT*/ ctx[1][/*entry*/ ctx[10].color].color);
    			}

    			if (dirty & /*ALL_COLORS_DICT, orderd_entries*/ 18 && t1_value !== (t1_value = /*ALL_COLORS_DICT*/ ctx[1][/*entry*/ ctx[10].color].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*ALL_SIZES_DICT, orderd_entries*/ 20 && t3_value !== (t3_value = /*ALL_SIZES_DICT*/ ctx[2][/*entry*/ ctx[10].size].size + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*ALL_VERIENTS_DICT, orderd_entries*/ 24 && t5_value !== (t5_value = (/*ALL_VERIENTS_DICT*/ ctx[3][/*entry*/ ctx[10].varient]?.name || "") + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*orderd_entries*/ 16 && input0.value !== /*entry*/ ctx[10].sheets_taken_quantity) {
    				set_input_value(input0, /*entry*/ ctx[10].sheets_taken_quantity);
    			}

    			if (dirty & /*orderd_entries*/ 16 && t9_value !== (t9_value = /*entry*/ ctx[10].quantity + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*orderd_entries*/ 16 && input1_list_value !== (input1_list_value = "providers-" + /*entry*/ ctx[10].id)) {
    				attr_dev(input1, "list", input1_list_value);
    			}

    			if (dirty & /*orderd_entries*/ 16 && input1.value !== /*entry*/ ctx[10].sheets_provider) {
    				set_input_value(input1, /*entry*/ ctx[10].sheets_provider);
    			}

    			if (dirty & /*ALL_PROVIDERS*/ 1) {
    				each_value_1 = /*ALL_PROVIDERS*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(datalist, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*orderd_entries*/ 16 && datalist_id_value !== (datalist_id_value = "providers-" + /*entry*/ ctx[10].id)) {
    				attr_dev(datalist, "id", datalist_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(45:4) {#each orderd_entries as entry}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
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
    	let tbody;
    	let each_value = /*orderd_entries*/ ctx[4];
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
    			th0 = element("th");
    			th0.textContent = "צבע";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "מידה";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "מודל";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "כמות נלקחת";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "ספק";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-1rvd8gi");
    			add_location(th0, file$1, 36, 6, 1069);
    			attr_dev(th1, "class", "svelte-1rvd8gi");
    			add_location(th1, file$1, 37, 6, 1091);
    			attr_dev(th2, "class", "svelte-1rvd8gi");
    			add_location(th2, file$1, 38, 6, 1114);
    			attr_dev(th3, "class", "svelte-1rvd8gi");
    			add_location(th3, file$1, 39, 6, 1137);
    			attr_dev(th4, "class", "svelte-1rvd8gi");
    			add_location(th4, file$1, 40, 6, 1166);
    			add_location(tr, file$1, 35, 4, 1057);
    			add_location(thead, file$1, 34, 2, 1044);
    			add_location(tbody, file$1, 43, 2, 1207);
    			attr_dev(table, "class", "collecting-table table svelte-1rvd8gi");
    			add_location(table, file$1, 33, 0, 1002);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*orderd_entries, ALL_PROVIDERS, ALL_VERIENTS_DICT, ALL_SIZES_DICT, ALL_COLORS_DICT*/ 31) {
    				each_value = /*orderd_entries*/ ctx[4];
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('CollectingTable', slots, []);
    	let { ALL_PROVIDERS } = $$props;
    	let { ALL_COLORS_DICT } = $$props;
    	let { ALL_SIZES_DICT } = $$props;
    	let { ALL_VERIENTS_DICT } = $$props;
    	let { product } = $$props;
    	let orderd_entries = [];

    	$$self.$$.on_mount.push(function () {
    		if (ALL_PROVIDERS === undefined && !('ALL_PROVIDERS' in $$props || $$self.$$.bound[$$self.$$.props['ALL_PROVIDERS']])) {
    			console.warn("<CollectingTable> was created without expected prop 'ALL_PROVIDERS'");
    		}

    		if (ALL_COLORS_DICT === undefined && !('ALL_COLORS_DICT' in $$props || $$self.$$.bound[$$self.$$.props['ALL_COLORS_DICT']])) {
    			console.warn("<CollectingTable> was created without expected prop 'ALL_COLORS_DICT'");
    		}

    		if (ALL_SIZES_DICT === undefined && !('ALL_SIZES_DICT' in $$props || $$self.$$.bound[$$self.$$.props['ALL_SIZES_DICT']])) {
    			console.warn("<CollectingTable> was created without expected prop 'ALL_SIZES_DICT'");
    		}

    		if (ALL_VERIENTS_DICT === undefined && !('ALL_VERIENTS_DICT' in $$props || $$self.$$.bound[$$self.$$.props['ALL_VERIENTS_DICT']])) {
    			console.warn("<CollectingTable> was created without expected prop 'ALL_VERIENTS_DICT'");
    		}

    		if (product === undefined && !('product' in $$props || $$self.$$.bound[$$self.$$.props['product']])) {
    			console.warn("<CollectingTable> was created without expected prop 'product'");
    		}
    	});

    	const writable_props = [
    		'ALL_PROVIDERS',
    		'ALL_COLORS_DICT',
    		'ALL_SIZES_DICT',
    		'ALL_VERIENTS_DICT',
    		'product'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CollectingTable> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler(each_value, entry_index) {
    		each_value[entry_index].sheets_taken_quantity = this.value;
    		(((($$invalidate(4, orderd_entries), $$invalidate(5, product)), $$invalidate(1, ALL_COLORS_DICT)), $$invalidate(2, ALL_SIZES_DICT)), $$invalidate(3, ALL_VERIENTS_DICT));
    	}

    	const click_handler = (entry, each_value, entry_index) => {
    		$$invalidate(4, each_value[entry_index].sheets_taken_quantity = entry.quantity, orderd_entries);
    	};

    	const keydown_handler = (entry, each_value, entry_index, event) => {
    		if (event.key === "Enter" || event.key === " ") {
    			$$invalidate(4, each_value[entry_index].sheets_taken_quantity = entry.quantity, orderd_entries);
    		}
    	};

    	function input1_input_handler(each_value, entry_index) {
    		each_value[entry_index].sheets_provider = this.value;
    		(((($$invalidate(4, orderd_entries), $$invalidate(5, product)), $$invalidate(1, ALL_COLORS_DICT)), $$invalidate(2, ALL_SIZES_DICT)), $$invalidate(3, ALL_VERIENTS_DICT));
    	}

    	$$self.$$set = $$props => {
    		if ('ALL_PROVIDERS' in $$props) $$invalidate(0, ALL_PROVIDERS = $$props.ALL_PROVIDERS);
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(1, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(2, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    		if ('ALL_VERIENTS_DICT' in $$props) $$invalidate(3, ALL_VERIENTS_DICT = $$props.ALL_VERIENTS_DICT);
    		if ('product' in $$props) $$invalidate(5, product = $$props.product);
    	};

    	$$self.$capture_state = () => ({
    		ALL_PROVIDERS,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		ALL_VERIENTS_DICT,
    		product,
    		orderd_entries
    	});

    	$$self.$inject_state = $$props => {
    		if ('ALL_PROVIDERS' in $$props) $$invalidate(0, ALL_PROVIDERS = $$props.ALL_PROVIDERS);
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(1, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(2, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    		if ('ALL_VERIENTS_DICT' in $$props) $$invalidate(3, ALL_VERIENTS_DICT = $$props.ALL_VERIENTS_DICT);
    		if ('product' in $$props) $$invalidate(5, product = $$props.product);
    		if ('orderd_entries' in $$props) $$invalidate(4, orderd_entries = $$props.orderd_entries);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*product, ALL_COLORS_DICT, ALL_SIZES_DICT, ALL_VERIENTS_DICT*/ 46) {
    			{
    				$$invalidate(4, orderd_entries = product.entries.sort((a, b) => {
    					// sort by:
    					// ALL_COLORS_DICT[a.color]
    					// ALL_SIZES_DICT[a.size]
    					// ALL_VERIENTS_DICT[a.varient]
    					if (ALL_COLORS_DICT[a.color].color > ALL_COLORS_DICT[b.color].color) return 1;

    					if (ALL_COLORS_DICT[a.color].color < ALL_COLORS_DICT[b.color].color) return -1;

    					// colors are equal
    					if (ALL_SIZES_DICT[a.size].size > ALL_SIZES_DICT[b.size].size) return 1;

    					if (ALL_SIZES_DICT[a.size].size < ALL_SIZES_DICT[b.size].size) return -1;

    					// sizes are equal
    					if (ALL_VERIENTS_DICT[a.varient]?.name == ALL_VERIENTS_DICT[b.varient]?.name) {
    						return 0;
    					} else if (ALL_VERIENTS_DICT[a.varient]?.name > ALL_VERIENTS_DICT[b.varient]?.name) {
    						return 1;
    					} else {
    						return -1;
    					}
    				}));
    			}
    		}
    	};

    	return [
    		ALL_PROVIDERS,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		ALL_VERIENTS_DICT,
    		orderd_entries,
    		product,
    		input0_input_handler,
    		click_handler,
    		keydown_handler,
    		input1_input_handler
    	];
    }

    class CollectingTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			ALL_PROVIDERS: 0,
    			ALL_COLORS_DICT: 1,
    			ALL_SIZES_DICT: 2,
    			ALL_VERIENTS_DICT: 3,
    			product: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CollectingTable",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get ALL_PROVIDERS() {
    		throw new Error("<CollectingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_PROVIDERS(value) {
    		throw new Error("<CollectingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_COLORS_DICT() {
    		throw new Error("<CollectingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_COLORS_DICT(value) {
    		throw new Error("<CollectingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_SIZES_DICT() {
    		throw new Error("<CollectingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_SIZES_DICT(value) {
    		throw new Error("<CollectingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ALL_VERIENTS_DICT() {
    		throw new Error("<CollectingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ALL_VERIENTS_DICT(value) {
    		throw new Error("<CollectingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get product() {
    		throw new Error("<CollectingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set product(value) {
    		throw new Error("<CollectingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MyMorderEdit.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1, console: console_1, document: document_1 } = globals;
    const file = "src\\MyMorderEdit.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	child_ctx[61] = list;
    	child_ctx[62] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[63] = list[i];
    	child_ctx[64] = list;
    	child_ctx[65] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i];
    	child_ctx[69] = list;
    	child_ctx[70] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[71] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[74] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[80] = list[i];
    	return child_ctx;
    }

    // (391:2) {#if headerData}
    function create_if_block_8(ctx) {
    	let div0;
    	let t0;
    	let t1_value = new Date(/*headerData*/ ctx[4][0].created).toLocaleString("Israel") + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4_value = new Date(/*headerData*/ ctx[4][0].updated).toLocaleString("Israel") + "";
    	let t4;
    	let t5;
    	let div2;
    	let t6;
    	let t7_value = /*headerData*/ ctx[4][0].id + "";
    	let t7;
    	let t8;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t10;
    	let th1;
    	let t12;
    	let th2;
    	let t14;
    	let th3;
    	let t16;
    	let th4;
    	let t18;
    	let th5;
    	let t20;
    	let th6;
    	let t22;
    	let th7;
    	let t24;
    	let th8;
    	let t26;
    	let th9;
    	let t28;
    	let tbody;
    	let tr1;
    	let td0;
    	let input0;
    	let t29;
    	let t30_value = /*headerData*/ ctx[4][0].agent + "";
    	let t30;
    	let t31;
    	let td1;
    	let input1;
    	let t32;
    	let td2;
    	let input2;
    	let t33;
    	let td3;
    	let textarea0;
    	let t34;
    	let td4;
    	let input3;
    	let t35;
    	let td5;
    	let select;
    	let t36;
    	let textarea1;
    	let t37;
    	let td6;
    	let input4;
    	let t38;
    	let label0;
    	let t40;
    	let input5;
    	let t41;
    	let label1;
    	let t43;
    	let input6;
    	let t44;
    	let td7;
    	let input7;
    	let t45;
    	let td8;
    	let input8;
    	let t46;
    	let td9;
    	let t47;
    	let t48;
    	let mounted;
    	let dispose;
    	let each_value_6 = /*ALL_STATUSES*/ ctx[7];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let if_block0 = /*headerData*/ ctx[4][0].sheets_price_prop_link && create_if_block_11(ctx);
    	let if_block1 = /*headerData*/ ctx[4][0].sheets_order_link && create_if_block_10(ctx);
    	let if_block2 = /*headerData*/ ctx[4][0].client_sign_url && create_if_block_9(ctx);

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
    			div2 = element("div");
    			t6 = text("מזהה: ");
    			t7 = text(t7_value);
    			t8 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "שם בחשבונית";
    			t10 = space();
    			th1 = element("th");
    			th1.textContent = "שם איש קשר";
    			t12 = space();
    			th2 = element("th");
    			th2.textContent = "דואר אלקטרוני";
    			t14 = space();
    			th3 = element("th");
    			th3.textContent = "הודעה מהעגלה";
    			t16 = space();
    			th4 = element("th");
    			th4.textContent = "טלפון";
    			t18 = space();
    			th5 = element("th");
    			th5.textContent = "סטטוס";
    			t20 = space();
    			th6 = element("th");
    			th6.textContent = "כתובת";
    			t22 = space();
    			th7 = element("th");
    			th7.textContent = "ח.פ.";
    			t24 = space();
    			th8 = element("th");
    			th8.textContent = "לקחת ספקים?";
    			t26 = space();
    			th9 = element("th");
    			th9.textContent = "קישורים";
    			t28 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t29 = text("\n            סוכן: ");
    			t30 = text(t30_value);
    			t31 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t32 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t33 = space();
    			td3 = element("td");
    			textarea0 = element("textarea");
    			t34 = space();
    			td4 = element("td");
    			input3 = element("input");
    			t35 = space();
    			td5 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t36 = space();
    			textarea1 = element("textarea");
    			t37 = space();
    			td6 = element("td");
    			input4 = element("input");
    			t38 = space();
    			label0 = element("label");
    			label0.textContent = "האם חברת משלוחים";
    			t40 = space();
    			input5 = element("input");
    			t41 = space();
    			label1 = element("label");
    			label1.textContent = "ישוב";
    			t43 = space();
    			input6 = element("input");
    			t44 = space();
    			td7 = element("td");
    			input7 = element("input");
    			t45 = space();
    			td8 = element("td");
    			input8 = element("input");
    			t46 = space();
    			td9 = element("td");
    			if (if_block0) if_block0.c();
    			t47 = space();
    			if (if_block1) if_block1.c();
    			t48 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "created svelte-1sy0stl");
    			add_location(div0, file, 391, 4, 11557);
    			attr_dev(div1, "class", "updated svelte-1sy0stl");
    			add_location(div1, file, 394, 4, 11665);
    			attr_dev(div2, "class", "id");
    			add_location(div2, file, 397, 4, 11774);
    			attr_dev(th0, "class", "svelte-1sy0stl");
    			add_location(th0, file, 404, 10, 11905);
    			attr_dev(th1, "class", "svelte-1sy0stl");
    			add_location(th1, file, 405, 10, 11936);
    			attr_dev(th2, "class", "svelte-1sy0stl");
    			add_location(th2, file, 406, 10, 11968);
    			attr_dev(th3, "class", "svelte-1sy0stl");
    			add_location(th3, file, 407, 10, 12001);
    			attr_dev(th4, "class", "svelte-1sy0stl");
    			add_location(th4, file, 408, 10, 12033);
    			attr_dev(th5, "class", "svelte-1sy0stl");
    			add_location(th5, file, 409, 10, 12058);
    			attr_dev(th6, "class", "svelte-1sy0stl");
    			add_location(th6, file, 410, 10, 12083);
    			attr_dev(th7, "class", "svelte-1sy0stl");
    			add_location(th7, file, 411, 10, 12110);
    			attr_dev(th8, "class", "svelte-1sy0stl");
    			add_location(th8, file, 412, 10, 12134);
    			attr_dev(th9, "class", "svelte-1sy0stl");
    			add_location(th9, file, 413, 10, 12165);
    			add_location(tr0, file, 403, 8, 11890);
    			attr_dev(thead, "class", "svelte-1sy0stl");
    			add_location(thead, file, 402, 6, 11874);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "שם");
    			attr_dev(input0, "class", "svelte-1sy0stl");
    			add_location(input0, file, 420, 12, 12352);
    			attr_dev(td0, "class", "header-cell svelte-1sy0stl");
    			add_location(td0, file, 419, 10, 12315);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "שם איש קשר");
    			attr_dev(input1, "class", "svelte-1sy0stl");
    			add_location(input1, file, 424, 12, 12526);
    			attr_dev(td1, "class", "header-cell svelte-1sy0stl");
    			add_location(td1, file, 423, 10, 12489);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "placeholder", "אימייל");
    			attr_dev(input2, "class", "svelte-1sy0stl");
    			add_location(input2, file, 427, 12, 12676);
    			attr_dev(td2, "class", "header-cell svelte-1sy0stl");
    			add_location(td2, file, 426, 10, 12639);
    			attr_dev(textarea0, "placeholder", "הודעה");
    			add_location(textarea0, file, 429, 34, 12803);
    			attr_dev(td3, "class", "header-cell svelte-1sy0stl");
    			add_location(td3, file, 429, 10, 12779);
    			attr_dev(input3, "type", "phone");
    			attr_dev(input3, "placeholder", "טלפון");
    			attr_dev(input3, "class", "svelte-1sy0stl");
    			add_location(input3, file, 431, 12, 12924);
    			attr_dev(td4, "class", "header-cell svelte-1sy0stl");
    			add_location(td4, file, 430, 10, 12887);
    			attr_dev(select, "class", "status-select svelte-1sy0stl");
    			if (/*headerData*/ ctx[4][0].status2 === void 0) add_render_callback(() => /*select_change_handler*/ ctx[32].call(select));
    			add_location(select, file, 434, 12, 13063);
    			attr_dev(textarea1, "cols", "18");
    			attr_dev(textarea1, "placeholder", "הערות לסטטוס");
    			add_location(textarea1, file, 439, 12, 13331);
    			attr_dev(td5, "class", "header-cell svelte-1sy0stl");
    			add_location(td5, file, 433, 10, 13026);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "כתובת");
    			attr_dev(input4, "class", "svelte-1sy0stl");
    			add_location(input4, file, 442, 12, 13482);
    			attr_dev(label0, "for", "is_delivery_company");
    			add_location(label0, file, 443, 12, 13571);
    			attr_dev(input5, "id", "is_delivery_company");
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "svelte-1sy0stl");
    			add_location(input5, file, 444, 12, 13641);
    			attr_dev(label1, "for", "settlement");
    			set_style(label1, "margin-left", "10px");
    			add_location(label1, file, 446, 12, 13795);
    			attr_dev(input6, "id", "settlement");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "ישוב");
    			attr_dev(input6, "class", "svelte-1sy0stl");
    			add_location(input6, file, 447, 12, 13871);
    			attr_dev(td6, "class", "header-cell svelte-1sy0stl");
    			add_location(td6, file, 441, 10, 13445);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "svelte-1sy0stl");
    			add_location(input7, file, 451, 12, 14057);
    			attr_dev(td7, "class", "header-cell svelte-1sy0stl");
    			add_location(td7, file, 450, 10, 14020);
    			set_style(input8, "width", "20px");
    			set_style(input8, "height", "20px");
    			attr_dev(input8, "type", "checkbox");
    			attr_dev(input8, "class", "svelte-1sy0stl");
    			add_location(input8, file, 455, 12, 14219);
    			attr_dev(td8, "class", "header-cell svelte-1sy0stl");
    			add_location(td8, file, 453, 10, 14148);
    			attr_dev(td9, "class", "header-cell svelte-1sy0stl");
    			add_location(td9, file, 456, 15, 14344);
    			attr_dev(tr1, "class", "svelte-1sy0stl");
    			add_location(tr1, file, 417, 8, 12233);
    			add_location(tbody, file, 416, 6, 12217);
    			attr_dev(table, "class", "headers-table svelte-1sy0stl");
    			add_location(table, file, 401, 4, 11838);
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
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t6);
    			append_dev(div2, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t10);
    			append_dev(tr0, th1);
    			append_dev(tr0, t12);
    			append_dev(tr0, th2);
    			append_dev(tr0, t14);
    			append_dev(tr0, th3);
    			append_dev(tr0, t16);
    			append_dev(tr0, th4);
    			append_dev(tr0, t18);
    			append_dev(tr0, th5);
    			append_dev(tr0, t20);
    			append_dev(tr0, th6);
    			append_dev(tr0, t22);
    			append_dev(tr0, th7);
    			append_dev(tr0, t24);
    			append_dev(tr0, th8);
    			append_dev(tr0, t26);
    			append_dev(tr0, th9);
    			append_dev(table, t28);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*headerData*/ ctx[4][0].name);
    			append_dev(td0, t29);
    			append_dev(td0, t30);
    			append_dev(tr1, t31);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*headerData*/ ctx[4][0].contact_name);
    			append_dev(tr1, t32);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*headerData*/ ctx[4][0].email);
    			append_dev(tr1, t33);
    			append_dev(tr1, td3);
    			append_dev(td3, textarea0);
    			set_input_value(textarea0, /*headerData*/ ctx[4][0].message);
    			append_dev(tr1, t34);
    			append_dev(tr1, td4);
    			append_dev(td4, input3);
    			set_input_value(input3, /*headerData*/ ctx[4][0].phone);
    			append_dev(tr1, t35);
    			append_dev(tr1, td5);
    			append_dev(td5, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select, null);
    				}
    			}

    			select_option(select, /*headerData*/ ctx[4][0].status2, true);
    			append_dev(td5, t36);
    			append_dev(td5, textarea1);
    			set_input_value(textarea1, /*headerData*/ ctx[4][0].status_msg);
    			append_dev(tr1, t37);
    			append_dev(tr1, td6);
    			append_dev(td6, input4);
    			set_input_value(input4, /*headerData*/ ctx[4][0].address);
    			append_dev(td6, t38);
    			append_dev(td6, label0);
    			append_dev(td6, t40);
    			append_dev(td6, input5);
    			input5.checked = /*headerData*/ ctx[4][0].is_delivery_company;
    			append_dev(td6, t41);
    			append_dev(td6, label1);
    			append_dev(td6, t43);
    			append_dev(td6, input6);
    			set_input_value(input6, /*headerData*/ ctx[4][0].settlement);
    			append_dev(tr1, t44);
    			append_dev(tr1, td7);
    			append_dev(td7, input7);
    			set_input_value(input7, /*headerData*/ ctx[4][0].private_company);
    			append_dev(tr1, t45);
    			append_dev(tr1, td8);
    			append_dev(td8, input8);
    			input8.checked = /*headerData*/ ctx[4][0].export_to_suppliers;
    			append_dev(td8, t46);
    			append_dev(tr1, td9);
    			if (if_block0) if_block0.m(td9, null);
    			append_dev(td9, t47);
    			if (if_block1) if_block1.m(td9, null);
    			append_dev(td9, t48);
    			if (if_block2) if_block2.m(td9, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[27]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[28]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[29]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[30]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[31]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[32]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[33]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[34]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[35]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[36]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[37]),
    					listen_dev(input8, "change", /*input8_change_handler*/ ctx[38])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headerData*/ 16 && t1_value !== (t1_value = new Date(/*headerData*/ ctx[4][0].created).toLocaleString("Israel") + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*headerData*/ 16 && t4_value !== (t4_value = new Date(/*headerData*/ ctx[4][0].updated).toLocaleString("Israel") + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*headerData*/ 16 && t7_value !== (t7_value = /*headerData*/ ctx[4][0].id + "")) set_data_dev(t7, t7_value);

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && input0.value !== /*headerData*/ ctx[4][0].name) {
    				set_input_value(input0, /*headerData*/ ctx[4][0].name);
    			}

    			if (dirty[0] & /*headerData*/ 16 && t30_value !== (t30_value = /*headerData*/ ctx[4][0].agent + "")) set_data_dev(t30, t30_value);

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && input1.value !== /*headerData*/ ctx[4][0].contact_name) {
    				set_input_value(input1, /*headerData*/ ctx[4][0].contact_name);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && input2.value !== /*headerData*/ ctx[4][0].email) {
    				set_input_value(input2, /*headerData*/ ctx[4][0].email);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144) {
    				set_input_value(textarea0, /*headerData*/ ctx[4][0].message);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144) {
    				set_input_value(input3, /*headerData*/ ctx[4][0].phone);
    			}

    			if (dirty[0] & /*ALL_STATUSES, headerData*/ 144) {
    				each_value_6 = /*ALL_STATUSES*/ ctx[7];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144) {
    				select_option(select, /*headerData*/ ctx[4][0].status2);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144) {
    				set_input_value(textarea1, /*headerData*/ ctx[4][0].status_msg);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && input4.value !== /*headerData*/ ctx[4][0].address) {
    				set_input_value(input4, /*headerData*/ ctx[4][0].address);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144) {
    				input5.checked = /*headerData*/ ctx[4][0].is_delivery_company;
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && input6.value !== /*headerData*/ ctx[4][0].settlement) {
    				set_input_value(input6, /*headerData*/ ctx[4][0].settlement);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && input7.value !== /*headerData*/ ctx[4][0].private_company) {
    				set_input_value(input7, /*headerData*/ ctx[4][0].private_company);
    			}

    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144) {
    				input8.checked = /*headerData*/ ctx[4][0].export_to_suppliers;
    			}

    			if (/*headerData*/ ctx[4][0].sheets_price_prop_link) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(td9, t47);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*headerData*/ ctx[4][0].sheets_order_link) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(td9, t48);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*headerData*/ ctx[4][0].client_sign_url) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_9(ctx);
    					if_block2.c();
    					if_block2.m(td9, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(391:2) {#if headerData}",
    		ctx
    	});

    	return block;
    }

    // (436:14) {#each ALL_STATUSES as opt}
    function create_each_block_6(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[80].name + "";
    	let t;
    	let option_value_value;
    	let option_selected_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[80].id;
    			option.value = option.__value;
    			option.selected = option_selected_value = /*opt*/ ctx[80].name == /*headerData*/ ctx[4][0].status2;
    			add_location(option, file, 436, 16, 13187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_STATUSES*/ 128 && t_value !== (t_value = /*opt*/ ctx[80].name + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_STATUSES*/ 128 && option_value_value !== (option_value_value = /*opt*/ ctx[80].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty[0] & /*ALL_STATUSES, headerData*/ 144 && option_selected_value !== (option_selected_value = /*opt*/ ctx[80].name == /*headerData*/ ctx[4][0].status2)) {
    				prop_dev(option, "selected", option_selected_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(436:14) {#each ALL_STATUSES as opt}",
    		ctx
    	});

    	return block;
    }

    // (458:12) {#if headerData[0].sheets_price_prop_link}
    function create_if_block_11(ctx) {
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let br;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text("הצעת מחיר");
    			t1 = space();
    			br = element("br");
    			attr_dev(a, "href", a_href_value = /*headerData*/ ctx[4][0].sheets_price_prop_link);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 458, 14, 14438);
    			add_location(br, file, 459, 14, 14531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && a_href_value !== (a_href_value = /*headerData*/ ctx[4][0].sheets_price_prop_link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(458:12) {#if headerData[0].sheets_price_prop_link}",
    		ctx
    	});

    	return block;
    }

    // (462:12) {#if headerData[0].sheets_order_link}
    function create_if_block_10(ctx) {
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("הזמנה");
    			attr_dev(a, "href", a_href_value = /*headerData*/ ctx[4][0].sheets_order_link);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 462, 14, 14620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && a_href_value !== (a_href_value = /*headerData*/ ctx[4][0].sheets_order_link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(462:12) {#if headerData[0].sheets_order_link}",
    		ctx
    	});

    	return block;
    }

    // (465:12) {#if headerData[0].client_sign_url}
    function create_if_block_9(ctx) {
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("חתימה");
    			attr_dev(a, "href", a_href_value = /*headerData*/ ctx[4][0].client_sign_url);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 465, 14, 14770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headerData, ALL_STATUSES*/ 144 && a_href_value !== (a_href_value = /*headerData*/ ctx[4][0].client_sign_url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(465:12) {#if headerData[0].client_sign_url}",
    		ctx
    	});

    	return block;
    }

    // (474:2) {#if data?.products}
    function create_if_block_4(ctx) {
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
    	let tbody;
    	let current;
    	let each_value_2 = /*data*/ ctx[5].products;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
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
    			th3.textContent = "הערה פרטית";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "הערה ציבורית";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "ברקוד";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "פעולות";
    			t13 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-1sy0stl");
    			add_location(th0, file, 485, 10, 15175);
    			attr_dev(th1, "class", "svelte-1sy0stl");
    			add_location(th1, file, 486, 10, 15199);
    			attr_dev(th2, "class", "svelte-1sy0stl");
    			add_location(th2, file, 487, 10, 15226);
    			attr_dev(th3, "class", "svelte-1sy0stl");
    			add_location(th3, file, 488, 10, 15250);
    			attr_dev(th4, "class", "svelte-1sy0stl");
    			add_location(th4, file, 489, 10, 15280);
    			attr_dev(th5, "class", "svelte-1sy0stl");
    			add_location(th5, file, 492, 10, 15386);
    			attr_dev(th6, "colspan", "2");
    			attr_dev(th6, "class", "svelte-1sy0stl");
    			add_location(th6, file, 493, 10, 15411);
    			add_location(tr, file, 484, 8, 15160);
    			attr_dev(thead, "class", "svelte-1sy0stl");
    			add_location(thead, file, 483, 6, 15144);
    			add_location(tbody, file, 496, 6, 15474);
    			attr_dev(table, "class", "product-table svelte-1sy0stl");
    			add_location(table, file, 482, 4, 15108);
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
    			append_dev(table, t13);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*add_entry_btn_clicked, ALL_VERIENTS, data, ALL_SIZES, ALL_COLORS, ALL_COLORS_DICT, ALL_SIZES_DICT, collectingState, ALL_PROVIDERS, ALL_VERIENTS_DICT, current_selected_sim_idx*/ 4589359) {
    				each_value_2 = /*data*/ ctx[5].products;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
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
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(474:2) {#if data?.products}",
    		ctx
    	});

    	return block;
    }

    // (552:14) {#if current_selected_sim_idx != -1}
    function create_if_block_7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[44](/*product*/ ctx[68]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "חבר מוצר להדמייה";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn connect-btn svelte-1sy0stl");
    			toggle_class(button, "active", /*data*/ ctx[5] && /*data*/ ctx[5]?.simulations && /*current_selected_sim_idx*/ ctx[17] != -1 && /*data*/ ctx[5].simulations[/*current_selected_sim_idx*/ ctx[17]].products && /*data*/ ctx[5].simulations[/*current_selected_sim_idx*/ ctx[17]].products[/*product*/ ctx[68].id]);
    			add_location(button, file, 552, 16, 17792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data, current_selected_sim_idx*/ 131104) {
    				toggle_class(button, "active", /*data*/ ctx[5] && /*data*/ ctx[5]?.simulations && /*current_selected_sim_idx*/ ctx[17] != -1 && /*data*/ ctx[5].simulations[/*current_selected_sim_idx*/ ctx[17]].products && /*data*/ ctx[5].simulations[/*current_selected_sim_idx*/ ctx[17]].products[/*product*/ ctx[68].id]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(552:14) {#if current_selected_sim_idx != -1}",
    		ctx
    	});

    	return block;
    }

    // (630:12) {:else}
    function create_else_block_4(ctx) {
    	let td;
    	let collectingtable;
    	let updating_product;
    	let current;

    	function collectingtable_product_binding(value) {
    		/*collectingtable_product_binding*/ ctx[46](value, /*product*/ ctx[68], /*each_value_2*/ ctx[69], /*product_index*/ ctx[70]);
    	}

    	let collectingtable_props = {
    		ALL_COLORS_DICT: /*ALL_COLORS_DICT*/ ctx[8],
    		ALL_PROVIDERS: /*ALL_PROVIDERS*/ ctx[3],
    		ALL_SIZES_DICT: /*ALL_SIZES_DICT*/ ctx[9],
    		ALL_VERIENTS_DICT: /*ALL_VERIENTS_DICT*/ ctx[10]
    	};

    	if (/*product*/ ctx[68] !== void 0) {
    		collectingtable_props.product = /*product*/ ctx[68];
    	}

    	collectingtable = new CollectingTable({
    			props: collectingtable_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(collectingtable, 'product', collectingtable_product_binding));

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(collectingtable.$$.fragment);
    			attr_dev(td, "colspan", "8");
    			attr_dev(td, "class", "svelte-1sy0stl");
    			add_location(td, file, 630, 14, 21942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(collectingtable, td, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const collectingtable_changes = {};
    			if (dirty[0] & /*ALL_COLORS_DICT*/ 256) collectingtable_changes.ALL_COLORS_DICT = /*ALL_COLORS_DICT*/ ctx[8];
    			if (dirty[0] & /*ALL_PROVIDERS*/ 8) collectingtable_changes.ALL_PROVIDERS = /*ALL_PROVIDERS*/ ctx[3];
    			if (dirty[0] & /*ALL_SIZES_DICT*/ 512) collectingtable_changes.ALL_SIZES_DICT = /*ALL_SIZES_DICT*/ ctx[9];
    			if (dirty[0] & /*ALL_VERIENTS_DICT*/ 1024) collectingtable_changes.ALL_VERIENTS_DICT = /*ALL_VERIENTS_DICT*/ ctx[10];

    			if (!updating_product && dirty[0] & /*data*/ 32) {
    				updating_product = true;
    				collectingtable_changes.product = /*product*/ ctx[68];
    				add_flush_callback(() => updating_product = false);
    			}

    			collectingtable.$set(collectingtable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collectingtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collectingtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(collectingtable);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(630:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (587:12) {#if collectingState == false}
    function create_if_block_5(ctx) {
    	let td0;
    	let previous_key = /*product*/ ctx[68].id;
    	let t0;
    	let td1;
    	let form;
    	let input0;
    	let input0_value_value;
    	let t1;
    	let input1;
    	let input1_value_value;
    	let t2;
    	let div0;
    	let select0;
    	let option0;
    	let t4;
    	let select1;
    	let option1;
    	let t6;
    	let t7;
    	let input2;
    	let t8;
    	let div1;
    	let t9;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block(ctx);
    	let each_value_5 = /*ALL_COLORS*/ ctx[1];
    	validate_each_argument(each_value_5);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_1[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value_4 = /*ALL_SIZES*/ ctx[0];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let if_block = /*product*/ ctx[68].verients.length != 0 && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			key_block.c();
    			t0 = space();
    			td1 = element("td");
    			form = element("form");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			div0 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "צבע";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "מידה";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div1 = element("div");
    			t9 = space();
    			button = element("button");
    			button.textContent = "הוסף";
    			attr_dev(td0, "colspan", "7");
    			attr_dev(td0, "class", "svelte-1sy0stl");
    			add_location(td0, file, 587, 14, 19706);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "product_id");
    			input0.value = input0_value_value = /*product*/ ctx[68].product.id;
    			attr_dev(input0, "class", "svelte-1sy0stl");
    			add_location(input0, file, 594, 18, 20070);
    			attr_dev(input1, "type", "hidden");
    			attr_dev(input1, "name", "entry_id");
    			input1.value = input1_value_value = /*product*/ ctx[68].id;
    			attr_dev(input1, "class", "svelte-1sy0stl");
    			add_location(input1, file, 595, 18, 20157);
    			attr_dev(option0, "default", "");
    			option0.__value = "undefined";
    			option0.value = option0.__value;
    			add_location(option0, file, 599, 22, 20415);
    			attr_dev(select0, "class", "form-control svelte-1sy0stl");
    			attr_dev(select0, "name", "color");
    			attr_dev(select0, "id", "color");
    			add_location(select0, file, 598, 20, 20339);
    			attr_dev(option1, "default", "");
    			option1.__value = "undefined";
    			option1.value = option1.__value;
    			add_location(option1, file, 607, 22, 20804);
    			attr_dev(select1, "class", "form-control svelte-1sy0stl");
    			attr_dev(select1, "name", "size");
    			attr_dev(select1, "id", "size");
    			add_location(select1, file, 606, 20, 20730);
    			attr_dev(input2, "class", "form-control svelte-1sy0stl");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "כמות");
    			attr_dev(input2, "name", "amount");
    			attr_dev(input2, "id", "amount");
    			attr_dev(input2, "min", "0");
    			add_location(input2, file, 623, 20, 21617);
    			attr_dev(div0, "class", "form-group svelte-1sy0stl");
    			add_location(div0, file, 596, 18, 20234);
    			attr_dev(div1, "class", "error-msg");
    			add_location(div1, file, 625, 18, 21758);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-secondary");
    			add_location(button, file, 626, 18, 21802);
    			attr_dev(form, "class", "add-entry-form svelte-1sy0stl");
    			attr_dev(form, "action", "");
    			attr_dev(form, "method", "post");
    			add_location(form, file, 593, 16, 19964);
    			attr_dev(td1, "colspan", "1");
    			attr_dev(td1, "class", "svelte-1sy0stl");
    			add_location(td1, file, 592, 14, 19931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			key_block.m(td0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, td1, anchor);
    			append_dev(td1, form);
    			append_dev(form, input0);
    			append_dev(form, t1);
    			append_dev(form, input1);
    			append_dev(form, t2);
    			append_dev(form, div0);
    			append_dev(div0, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(select0, null);
    				}
    			}

    			append_dev(div0, t4);
    			append_dev(div0, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select1, null);
    				}
    			}

    			append_dev(div0, t6);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t7);
    			append_dev(div0, input2);
    			append_dev(form, t8);
    			append_dev(form, div1);
    			append_dev(form, t9);
    			append_dev(form, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", /*add_entry_btn_clicked*/ ctx[22], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*data*/ 32 && safe_not_equal(previous_key, previous_key = /*product*/ ctx[68].id)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(td0, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}

    			if (!current || dirty[0] & /*data*/ 32 && input0_value_value !== (input0_value_value = /*product*/ ctx[68].product.id)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (!current || dirty[0] & /*data*/ 32 && input1_value_value !== (input1_value_value = /*product*/ ctx[68].id)) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty[0] & /*ALL_COLORS*/ 2) {
    				each_value_5 = /*ALL_COLORS*/ ctx[1];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_5(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_5.length;
    			}

    			if (dirty[0] & /*ALL_SIZES*/ 1) {
    				each_value_4 = /*ALL_SIZES*/ ctx[0];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (/*product*/ ctx[68].verients.length != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(div0, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
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
    			if (detaching) detach_dev(td0);
    			key_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(td1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(587:12) {#if collectingState == false}",
    		ctx
    	});

    	return block;
    }

    // (589:16) {#key product.id}
    function create_key_block(ctx) {
    	let mentriesservertable;
    	let updating_product;
    	let current;

    	function mentriesservertable_product_binding(value) {
    		/*mentriesservertable_product_binding*/ ctx[45](value, /*product*/ ctx[68], /*each_value_2*/ ctx[69], /*product_index*/ ctx[70]);
    	}

    	let mentriesservertable_props = {
    		ALL_SIZES: /*ALL_SIZES*/ ctx[0],
    		ALL_COLORS_DICT: /*ALL_COLORS_DICT*/ ctx[8],
    		ALL_SIZES_DICT: /*ALL_SIZES_DICT*/ ctx[9],
    		ALL_VERIENTS: /*ALL_VERIENTS*/ ctx[2]
    	};

    	if (/*product*/ ctx[68] !== void 0) {
    		mentriesservertable_props.product = /*product*/ ctx[68];
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
    			if (dirty[0] & /*ALL_SIZES*/ 1) mentriesservertable_changes.ALL_SIZES = /*ALL_SIZES*/ ctx[0];
    			if (dirty[0] & /*ALL_COLORS_DICT*/ 256) mentriesservertable_changes.ALL_COLORS_DICT = /*ALL_COLORS_DICT*/ ctx[8];
    			if (dirty[0] & /*ALL_SIZES_DICT*/ 512) mentriesservertable_changes.ALL_SIZES_DICT = /*ALL_SIZES_DICT*/ ctx[9];
    			if (dirty[0] & /*ALL_VERIENTS*/ 4) mentriesservertable_changes.ALL_VERIENTS = /*ALL_VERIENTS*/ ctx[2];

    			if (!updating_product && dirty[0] & /*data*/ 32) {
    				updating_product = true;
    				mentriesservertable_changes.product = /*product*/ ctx[68];
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
    		source: "(589:16) {#key product.id}",
    		ctx
    	});

    	return block;
    }

    // (601:22) {#each ALL_COLORS as color}
    function create_each_block_5(ctx) {
    	let option;
    	let t_value = /*color*/ ctx[77]["name"] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*color*/ ctx[77]["id"];
    			option.value = option.__value;
    			add_location(option, file, 601, 24, 20536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_COLORS*/ 2 && t_value !== (t_value = /*color*/ ctx[77]["name"] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_COLORS*/ 2 && option_value_value !== (option_value_value = /*color*/ ctx[77]["id"])) {
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
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(601:22) {#each ALL_COLORS as color}",
    		ctx
    	});

    	return block;
    }

    // (609:22) {#each ALL_SIZES as size}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*size*/ ctx[74]["size"] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*size*/ ctx[74]["id"];
    			option.value = option.__value;
    			add_location(option, file, 609, 24, 20924);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_SIZES*/ 1 && t_value !== (t_value = /*size*/ ctx[74]["size"] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_SIZES*/ 1 && option_value_value !== (option_value_value = /*size*/ ctx[74]["id"])) {
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
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(609:22) {#each ALL_SIZES as size}",
    		ctx
    	});

    	return block;
    }

    // (614:20) {#if product.verients.length != 0}
    function create_if_block_6(ctx) {
    	let select;
    	let option;
    	let each_value_3 = /*ALL_VERIENTS*/ ctx[2];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
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
    			add_location(option, file, 615, 24, 21257);
    			attr_dev(select, "class", "form-control svelte-1sy0stl");
    			attr_dev(select, "name", "varient");
    			attr_dev(select, "id", "varient");
    			add_location(select, file, 614, 22, 21175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_VERIENTS*/ 4) {
    				each_value_3 = /*ALL_VERIENTS*/ ctx[2];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(614:20) {#if product.verients.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (617:24) {#each ALL_VERIENTS as varient}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*varient*/ ctx[71]["name"] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*varient*/ ctx[71]["id"];
    			option.value = option.__value;
    			add_location(option, file, 617, 26, 21387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ALL_VERIENTS*/ 4 && t_value !== (t_value = /*varient*/ ctx[71]["name"] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*ALL_VERIENTS*/ 4 && option_value_value !== (option_value_value = /*varient*/ ctx[71]["id"])) {
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
    		source: "(617:24) {#each ALL_VERIENTS as varient}",
    		ctx
    	});

    	return block;
    }

    // (498:8) {#each data.products as product}
    function create_each_block_2(ctx) {
    	let tr0;
    	let td0;
    	let t0_value = /*product*/ ctx[68].product.id + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let t3_value = /*product*/ ctx[68].product.title + "";
    	let t3;
    	let t4;
    	let td2;
    	let t5_value = /*product*/ ctx[68].price + "";
    	let t5;
    	let t6;
    	let t7;
    	let td3;
    	let textarea0;
    	let t8;
    	let td4;
    	let textarea1;
    	let t9;
    	let td5;
    	let t10_value = (/*product*/ ctx[68].pbarcode || "") + "";
    	let t10;
    	let t11;
    	let td6;
    	let button;
    	let t13;
    	let t14;
    	let tr1;
    	let current_block_type_index;
    	let if_block1;
    	let t15;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[39](/*product*/ ctx[68], /*each_value_2*/ ctx[69], /*product_index*/ ctx[70]);
    	}

    	function keydown_handler(...args) {
    		return /*keydown_handler*/ ctx[40](/*product*/ ctx[68], /*each_value_2*/ ctx[69], /*product_index*/ ctx[70], ...args);
    	}

    	function textarea0_input_handler_1() {
    		/*textarea0_input_handler_1*/ ctx[41].call(textarea0, /*each_value_2*/ ctx[69], /*product_index*/ ctx[70]);
    	}

    	function textarea1_input_handler_1() {
    		/*textarea1_input_handler_1*/ ctx[42].call(textarea1, /*each_value_2*/ ctx[69], /*product_index*/ ctx[70]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[43](/*product*/ ctx[68]);
    	}

    	let if_block0 = /*current_selected_sim_idx*/ ctx[17] != -1 && create_if_block_7(ctx);
    	const if_block_creators = [create_if_block_5, create_else_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*collectingState*/ ctx[18] == false) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

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
    			textarea0 = element("textarea");
    			t8 = space();
    			td4 = element("td");
    			textarea1 = element("textarea");
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			button = element("button");
    			button.textContent = "מחק";
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			tr1 = element("tr");
    			if_block1.c();
    			t15 = space();
    			attr_dev(td0, "class", "cell-border svelte-1sy0stl");
    			add_location(td0, file, 499, 12, 15550);
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*product*/ ctx[68].product.cimage))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*product*/ ctx[68].product.title);
    			attr_dev(img, "width", "25px");
    			attr_dev(img, "height", "25px");
    			attr_dev(img, "loading", "lazy");
    			add_location(img, file, 501, 14, 15651);
    			attr_dev(td1, "class", "cell-border svelte-1sy0stl");
    			add_location(td1, file, 500, 12, 15612);
    			attr_dev(td2, "class", "cell-border svelte-1sy0stl");
    			attr_dev(td2, "tabindex", "-1");
    			add_location(td2, file, 505, 12, 15864);
    			attr_dev(textarea0, "placeholder", "הערה פרטית");
    			add_location(textarea0, file, 524, 14, 16557);
    			attr_dev(td3, "class", "cell-border svelte-1sy0stl");
    			add_location(td3, file, 523, 12, 16518);
    			attr_dev(textarea1, "placeholder", "הערה פומבית");
    			add_location(textarea1, file, 527, 14, 16701);
    			attr_dev(td4, "class", "cell-border svelte-1sy0stl");
    			add_location(td4, file, 526, 12, 16662);
    			attr_dev(td5, "class", "cell-border svelte-1sy0stl");
    			add_location(td5, file, 537, 12, 17186);
    			attr_dev(button, "class", "btn btn-danger");
    			add_location(button, file, 539, 14, 17303);
    			attr_dev(td6, "class", "cell-border svelte-1sy0stl");
    			attr_dev(td6, "colspan", "2");
    			add_location(td6, file, 538, 12, 17252);
    			attr_dev(tr0, "class", "svelte-1sy0stl");
    			add_location(tr0, file, 498, 10, 15533);
    			attr_dev(tr1, "class", "details svelte-1sy0stl");
    			add_location(tr1, file, 585, 10, 19628);
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
    			append_dev(td3, textarea0);
    			set_input_value(textarea0, /*product*/ ctx[68].private_comment);
    			append_dev(tr0, t8);
    			append_dev(tr0, td4);
    			append_dev(td4, textarea1);
    			set_input_value(textarea1, /*product*/ ctx[68].public_comment);
    			append_dev(tr0, t9);
    			append_dev(tr0, td5);
    			append_dev(td5, t10);
    			append_dev(tr0, t11);
    			append_dev(tr0, td6);
    			append_dev(td6, button);
    			append_dev(td6, t13);
    			if (if_block0) if_block0.m(td6, null);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, tr1, anchor);
    			if_blocks[current_block_type_index].m(tr1, null);
    			append_dev(tr1, t15);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(td2, "click", click_handler, false, false, false, false),
    					listen_dev(td2, "keydown", keydown_handler, false, false, false, false),
    					listen_dev(textarea0, "input", textarea0_input_handler_1),
    					listen_dev(textarea1, "input", textarea1_input_handler_1),
    					listen_dev(button, "click", click_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*data*/ 32) && t0_value !== (t0_value = /*product*/ ctx[68].product.id + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*data*/ 32 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*product*/ ctx[68].product.cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*data*/ 32 && img_alt_value !== (img_alt_value = /*product*/ ctx[68].product.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty[0] & /*data*/ 32) && t3_value !== (t3_value = /*product*/ ctx[68].product.title + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*data*/ 32) && t5_value !== (t5_value = /*product*/ ctx[68].price + "")) set_data_dev(t5, t5_value);

    			if (dirty[0] & /*data*/ 32) {
    				set_input_value(textarea0, /*product*/ ctx[68].private_comment);
    			}

    			if (dirty[0] & /*data*/ 32) {
    				set_input_value(textarea1, /*product*/ ctx[68].public_comment);
    			}

    			if ((!current || dirty[0] & /*data*/ 32) && t10_value !== (t10_value = (/*product*/ ctx[68].pbarcode || "") + "")) set_data_dev(t10, t10_value);

    			if (/*current_selected_sim_idx*/ ctx[17] != -1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(td6, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

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
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(tr1, t15);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(tr1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(498:8) {#each data.products as product}",
    		ctx
    	});

    	return block;
    }

    // (663:10) 
    function create_item_slot(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t;
    	let html_tag;
    	let raw_value = /*label*/ ctx[66] + "";

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			html_tag = new HtmlTag(false);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[67].title);
    			set_style(img, "height", "25px");
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*item*/ ctx[67].cimage))) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 665, 16, 23089);
    			html_tag.a = null;
    			attr_dev(div0, "class", "inner");
    			add_location(div0, file, 664, 14, 23053);
    			attr_dev(div1, "class", "search-item");
    			add_location(div1, file, 663, 12, 23013);
    			attr_dev(div2, "slot", "item");
    			add_location(div2, file, 662, 10, 22964);
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
    			if (dirty[2] & /*item*/ 32 && img_alt_value !== (img_alt_value = /*item*/ ctx[67].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[2] & /*item*/ 32 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*item*/ ctx[67].cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[2] & /*label*/ 16 && raw_value !== (raw_value = /*label*/ ctx[66] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_item_slot.name,
    		type: "slot",
    		source: "(663:10) ",
    		ctx
    	});

    	return block;
    }

    // (692:8) {:else}
    function create_else_block_3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "הוסף";
    			button.disabled = true;
    			add_location(button, file, 692, 10, 24141);
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
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(692:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (672:8) {#if selectedProduct}
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t0;
    	let html_tag;
    	let raw_value = /*selectedProduct*/ ctx[6]?.title + "";
    	let t1;
    	let button;
    	let button_disabled_value;
    	let t2;
    	let div2;
    	let pre;
    	let t3;
    	let mounted;
    	let dispose;

    	function select_block_type_2(ctx, dirty) {
    		if (/*add_product_status*/ ctx[13] == "sending") return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			html_tag = new HtmlTag(false);
    			t1 = space();
    			button = element("button");
    			if_block.c();
    			t2 = space();
    			div2 = element("div");
    			pre = element("pre");
    			t3 = text(/*add_product_message*/ ctx[12]);
    			attr_dev(img, "alt", img_alt_value = /*selectedProduct*/ ctx[6]?.title);
    			set_style(img, "height", "25px");
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*selectedProduct*/ ctx[6]?.cimage))) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 674, 14, 23418);
    			html_tag.a = null;
    			attr_dev(div0, "class", "inner");
    			add_location(div0, file, 673, 12, 23384);
    			attr_dev(div1, "class", "selected-product");
    			add_location(div1, file, 672, 10, 23341);
    			button.disabled = button_disabled_value = /*add_product_status*/ ctx[13] == "sending";
    			attr_dev(button, "class", "btn btn-secondary");
    			add_location(button, file, 679, 10, 23635);
    			add_location(pre, file, 689, 12, 24065);
    			set_style(div2, "color", /*add_product_status_color*/ ctx[14]);
    			add_location(div2, file, 688, 10, 24005);
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
    				dispose = listen_dev(button, "click", /*addNewProductButtonClick*/ ctx[21], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedProduct*/ 64 && img_alt_value !== (img_alt_value = /*selectedProduct*/ ctx[6]?.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*selectedProduct*/ 64 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*selectedProduct*/ ctx[6]?.cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*selectedProduct*/ 64 && raw_value !== (raw_value = /*selectedProduct*/ ctx[6]?.title + "")) html_tag.p(raw_value);

    			if (current_block_type !== (current_block_type = select_block_type_2(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty[0] & /*add_product_status*/ 8192 && button_disabled_value !== (button_disabled_value = /*add_product_status*/ ctx[13] == "sending")) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (dirty[0] & /*add_product_message*/ 4096) set_data_dev(t3, /*add_product_message*/ ctx[12]);

    			if (dirty[0] & /*add_product_status_color*/ 16384) {
    				set_style(div2, "color", /*add_product_status_color*/ ctx[14]);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(672:8) {#if selectedProduct}",
    		ctx
    	});

    	return block;
    }

    // (685:12) {:else}
    function create_else_block_2(ctx) {
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(685:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (681:12) {#if add_product_status == "sending"}
    function create_if_block_3(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "sr-only");
    			add_location(span, file, 682, 16, 23872);
    			attr_dev(div, "class", "spinner-border");
    			attr_dev(div, "role", "status");
    			add_location(div, file, 681, 14, 23813);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(681:12) {#if add_product_status == \\\"sending\\\"}",
    		ctx
    	});

    	return block;
    }

    // (744:16) {#each Object.keys(sim.products || {}) as product_idx}
    function create_each_block_1(ctx) {
    	let tr;
    	let td0;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].title + "";
    	let t1;
    	let t2;
    	let td1;
    	let input;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[52].call(input, /*product_idx*/ ctx[63], /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			img = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			td1 = element("td");
    			input = element("input");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].img))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "25px");
    			attr_dev(img, "height", "25px");
    			add_location(img, file, 746, 22, 25963);
    			attr_dev(td0, "class", "svelte-1sy0stl");
    			add_location(td0, file, 745, 20, 25936);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "width", "min-content");
    			attr_dev(input, "class", "svelte-1sy0stl");
    			add_location(input, file, 750, 22, 26186);
    			attr_dev(td1, "class", "svelte-1sy0stl");
    			add_location(td1, file, 749, 20, 26159);
    			attr_dev(tr, "class", "svelte-1sy0stl");
    			add_location(tr, file, 744, 18, 25911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, img);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, input);
    			set_input_value(input, /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].amount);
    			append_dev(tr, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data*/ 32 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].img))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*data*/ 32 && t1_value !== (t1_value = /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].title + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*data*/ 32 && to_number(input.value) !== /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].amount) {
    				set_input_value(input, /*sim*/ ctx[60].products[/*product_idx*/ ctx[63]].amount);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(744:16) {#each Object.keys(sim.products || {}) as product_idx}",
    		ctx
    	});

    	return block;
    }

    // (768:16) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("שחזר");
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
    		source: "(768:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (766:16) {#if !sim.deleted}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("מחק");
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
    		source: "(766:16) {#if !sim.deleted}",
    		ctx
    	});

    	return block;
    }

    // (705:6) {#each data?.simulations || [] as sim, i}
    function create_each_block(ctx) {
    	let tr1;
    	let td0;
    	let input;
    	let t0;
    	let td1;
    	let img;
    	let img_src_value;
    	let t1;
    	let td2;
    	let div0;
    	let textarea;
    	let t2;
    	let td3;
    	let button0;
    	let t4;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t6;
    	let th1;
    	let t8;
    	let tbody;
    	let t9;
    	let td4;
    	let div1;
    	let button1;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[49].call(input, /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	function textarea_input_handler() {
    		/*textarea_input_handler*/ ctx[50].call(textarea, /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[51](/*i*/ ctx[62]);
    	}

    	let each_value_1 = Object.keys(/*sim*/ ctx[60].products || {});
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_block_type_3(ctx, dirty) {
    		if (!/*sim*/ ctx[60].deleted) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[53](/*sim*/ ctx[60], /*each_value*/ ctx[61], /*i*/ ctx[62]);
    	}

    	const block = {
    		c: function create() {
    			tr1 = element("tr");
    			td0 = element("td");
    			input = element("input");
    			t0 = space();
    			td1 = element("td");
    			img = element("img");
    			t1 = space();
    			td2 = element("td");
    			div0 = element("div");
    			textarea = element("textarea");
    			t2 = space();
    			td3 = element("td");
    			button0 = element("button");
    			button0.textContent = "קשר מוצרים";
    			t4 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "שם מוצר";
    			t6 = space();
    			th1 = element("th");
    			th1.textContent = "כמות";
    			t8 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			td4 = element("td");
    			div1 = element("div");
    			button1 = element("button");
    			if_block.c();
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "svelte-1sy0stl");
    			add_location(input, file, 707, 12, 24600);
    			attr_dev(td0, "class", "svelte-1sy0stl");
    			add_location(td0, file, 706, 10, 24583);
    			if (!src_url_equal(img.src, img_src_value = /*sim*/ ctx[60].cimage)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "sim-img svelte-1sy0stl");
    			add_location(img, file, 710, 12, 24690);
    			attr_dev(td1, "class", "svelte-1sy0stl");
    			add_location(td1, file, 709, 10, 24673);
    			attr_dev(textarea, "name", "sim-" + /*i*/ ctx[62]);
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "placeholder", "תיאור הדמייה");
    			add_location(textarea, file, 714, 14, 24818);
    			attr_dev(div0, "class", "sim-description");
    			add_location(div0, file, 713, 12, 24774);
    			attr_dev(td2, "class", "svelte-1sy0stl");
    			add_location(td2, file, 712, 10, 24757);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "connect-btn svelte-1sy0stl");
    			toggle_class(button0, "active", /*current_selected_sim_idx*/ ctx[17] == /*i*/ ctx[62]);
    			add_location(button0, file, 719, 12, 25045);
    			attr_dev(th0, "class", "svelte-1sy0stl");
    			add_location(th0, file, 738, 18, 25706);
    			attr_dev(th1, "class", "svelte-1sy0stl");
    			add_location(th1, file, 739, 18, 25741);
    			attr_dev(tr0, "class", "svelte-1sy0stl");
    			add_location(tr0, file, 737, 16, 25683);
    			attr_dev(thead, "class", "svelte-1sy0stl");
    			add_location(thead, file, 736, 14, 25659);
    			add_location(tbody, file, 742, 14, 25814);
    			attr_dev(table, "class", "product-table simulation-table svelte-1sy0stl");
    			add_location(table, file, 735, 12, 25598);
    			attr_dev(td3, "class", "svelte-1sy0stl");
    			add_location(td3, file, 717, 10, 24972);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 759, 14, 26479);
    			attr_dev(div1, "class", "delete-action");
    			add_location(div1, file, 758, 12, 26437);
    			attr_dev(td4, "class", "svelte-1sy0stl");
    			add_location(td4, file, 757, 10, 26420);
    			attr_dev(tr1, "data-idx", /*i*/ ctx[62]);
    			attr_dev(tr1, "class", "svelte-1sy0stl");
    			toggle_class(tr1, "deleted", /*sim*/ ctx[60].deleted);
    			add_location(tr1, file, 705, 8, 24527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td0);
    			append_dev(td0, input);
    			set_input_value(input, /*sim*/ ctx[60].order);
    			append_dev(tr1, t0);
    			append_dev(tr1, td1);
    			append_dev(td1, img);
    			append_dev(tr1, t1);
    			append_dev(tr1, td2);
    			append_dev(td2, div0);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*sim*/ ctx[60].description);
    			append_dev(tr1, t2);
    			append_dev(tr1, td3);
    			append_dev(td3, button0);
    			append_dev(td3, t4);
    			append_dev(td3, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t6);
    			append_dev(tr0, th1);
    			append_dev(table, t8);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}

    			append_dev(tr1, t9);
    			append_dev(tr1, td4);
    			append_dev(td4, div1);
    			append_dev(div1, button1);
    			if_block.m(button1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(textarea, "input", textarea_input_handler),
    					listen_dev(button0, "click", click_handler_3, false, false, false, false),
    					listen_dev(button1, "click", click_handler_4, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*data*/ 32 && to_number(input.value) !== /*sim*/ ctx[60].order) {
    				set_input_value(input, /*sim*/ ctx[60].order);
    			}

    			if (dirty[0] & /*data*/ 32 && !src_url_equal(img.src, img_src_value = /*sim*/ ctx[60].cimage)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*data*/ 32) {
    				set_input_value(textarea, /*sim*/ ctx[60].description);
    			}

    			if (dirty[0] & /*current_selected_sim_idx*/ 131072) {
    				toggle_class(button0, "active", /*current_selected_sim_idx*/ ctx[17] == /*i*/ ctx[62]);
    			}

    			if (dirty[0] & /*data*/ 32) {
    				each_value_1 = Object.keys(/*sim*/ ctx[60].products || {});
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button1, null);
    				}
    			}

    			if (dirty[0] & /*data*/ 32) {
    				toggle_class(tr1, "deleted", /*sim*/ ctx[60].deleted);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr1);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(705:6) {#each data?.simulations || [] as sim, i}",
    		ctx
    	});

    	return block;
    }

    // (805:6) {:else}
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
    		source: "(805:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (803:6) {#if updateing_to_server}
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
    		source: "(803:6) {#if updateing_to_server}",
    		ctx
    	});

    	return block;
    }

    // (796:4) <Button       class="update-btn"       disabled={updateing_to_server}       on:click={() => {         save_data();       }}     >
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type_4(ctx, dirty) {
    		if (/*updateing_to_server*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_4(ctx);
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
    			current_block_type_index = select_block_type_4(ctx);

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
    		source: "(796:4) <Button       class=\\\"update-btn\\\"       disabled={updateing_to_server}       on:click={() => {         save_data();       }}     >",
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
    	let a;
    	let t3;
    	let div0;
    	let t4;
    	let label0;
    	let input0;
    	let t5;
    	let span;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let div4;
    	let h3;
    	let t11;
    	let div2;
    	let label1;
    	let t13;
    	let div1;
    	let autocomplete;
    	let updating_selectedItem;
    	let t14;
    	let t15;
    	let div3;
    	let button0;
    	let t17;
    	let div6;
    	let table;
    	let t18;
    	let tr0;
    	let td0;
    	let t20;
    	let tr1;
    	let td1;
    	let input1;
    	let t21;
    	let img;
    	let img_src_value;
    	let t22;
    	let td2;
    	let div5;
    	let textarea;
    	let t23;
    	let td3;
    	let button1;
    	let t25;
    	let div7;
    	let button2;
    	let current;
    	let mounted;
    	let dispose;

    	morderaddproductentrypopup = new MorderAddProductEntryPopup({
    			props: {
    				ALL_COLORS: /*ALL_COLORS*/ ctx[1],
    				ALL_SIZES: /*ALL_SIZES*/ ctx[0],
    				ALL_VERIENTS: /*ALL_VERIENTS*/ ctx[2]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*headerData*/ ctx[4] && create_if_block_8(ctx);
    	let if_block1 = /*data*/ ctx[5]?.products && create_if_block_4(ctx);

    	function autocomplete_selectedItem_binding(value) {
    		/*autocomplete_selectedItem_binding*/ ctx[47](value);
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
    		searchFunction: /*searchProducts*/ ctx[20],
    		delay: "200",
    		localFiltering: false,
    		labelFieldName: "title",
    		valueFieldName: "value",
    		$$slots: {
    			item: [
    				create_item_slot,
    				({ label, item }) => ({ 66: label, 67: item }),
    				({ label, item }) => [0, 0, (label ? 16 : 0) | (item ? 32 : 0)]
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*selectedProduct*/ ctx[6] !== void 0) {
    		autocomplete_props.selectedItem = /*selectedProduct*/ ctx[6];
    	}

    	autocomplete = new SimpleAutocomplete({
    			props: autocomplete_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete, 'selectedItem', autocomplete_selectedItem_binding));
    	autocomplete.$on("focus", /*focus_handler*/ ctx[48]);

    	function select_block_type_1(ctx, dirty) {
    		if (/*selectedProduct*/ ctx[6]) return create_if_block_2;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);
    	let each_value = /*data*/ ctx[5]?.simulations || [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	button2 = new Button$1({
    			props: {
    				class: "update-btn",
    				disabled: /*updateing_to_server*/ ctx[11],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_5*/ ctx[55]);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			create_component(morderaddproductentrypopup.$$.fragment);
    			t1 = space();
    			main = element("main");
    			a = element("a");
    			a.textContent = "חזרה להזמנות";
    			t3 = space();
    			div0 = element("div");
    			t4 = text("ליקוט\n    ");
    			label0 = element("label");
    			input0 = element("input");
    			t5 = space();
    			span = element("span");
    			t6 = text("\n    הזמנה");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			div4 = element("div");
    			h3 = element("h3");
    			h3.textContent = "הוסף מוצר";
    			t11 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "שם מוצר";
    			t13 = space();
    			div1 = element("div");
    			create_component(autocomplete.$$.fragment);
    			t14 = space();
    			if_block2.c();
    			t15 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "צור מוצר חדש";
    			t17 = space();
    			div6 = element("div");
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t18 = space();
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "הדמייה חדשה:";
    			t20 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			input1 = element("input");
    			t21 = space();
    			img = element("img");
    			t22 = space();
    			td2 = element("td");
    			div5 = element("div");
    			textarea = element("textarea");
    			t23 = space();
    			td3 = element("td");
    			button1 = element("button");
    			button1.textContent = "הוסף הדמייה";
    			t25 = space();
    			div7 = element("div");
    			create_component(button2.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css");
    			add_location(link, file, 373, 2, 10888);
    			attr_dev(a, "href", "/admin/morders/morder/");
    			attr_dev(a, "class", "back-btn");
    			add_location(a, file, 379, 2, 11165);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-1sy0stl");
    			add_location(input0, file, 385, 6, 11404);
    			attr_dev(span, "class", "slider round svelte-1sy0stl");
    			add_location(span, file, 386, 6, 11472);
    			attr_dev(label0, "class", "switch svelte-1sy0stl");
    			add_location(label0, file, 384, 4, 11375);
    			attr_dev(div0, "class", "collecting-switch svelte-1sy0stl");
    			add_location(div0, file, 382, 2, 11329);
    			add_location(h3, file, 640, 4, 22219);
    			attr_dev(label1, "for", "product_name");
    			add_location(label1, file, 643, 6, 22345);
    			attr_dev(div1, "class", "search-wraper");
    			add_location(div1, file, 644, 6, 22393);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file, 642, 4, 22314);
    			attr_dev(button0, "class", "btn btn-secondary");
    			add_location(button0, file, 698, 6, 24278);
    			attr_dev(div3, "class", "new-product-btn-wraper svelte-1sy0stl");
    			add_location(div3, file, 697, 4, 24235);
    			attr_dev(div4, "id", "new-product-form");
    			add_location(div4, file, 639, 2, 22187);
    			attr_dev(td0, "colspan", "2");
    			attr_dev(td0, "class", "svelte-1sy0stl");
    			add_location(td0, file, 776, 8, 26864);
    			attr_dev(tr0, "class", "svelte-1sy0stl");
    			add_location(tr0, file, 775, 6, 26851);
    			attr_dev(input1, "type", "file");
    			attr_dev(input1, "id", "selectedFileSim");
    			attr_dev(input1, "accept", "image/png, image/gif, image/jpeg");
    			attr_dev(input1, "class", "svelte-1sy0stl");
    			add_location(input1, file, 780, 10, 26979);
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "height", "50px");
    			if (!src_url_equal(img.src, img_src_value = /*simImage*/ ctx[15])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "sim-img svelte-1sy0stl");
    			add_location(img, file, 781, 10, 27107);
    			attr_dev(td1, "colspan", "1");
    			attr_dev(td1, "class", "sim-image-td svelte-1sy0stl");
    			add_location(td1, file, 779, 8, 26931);
    			attr_dev(textarea, "name", "sim-new");
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "placeholder", "תיאור הדמייה");
    			add_location(textarea, file, 785, 12, 27264);
    			attr_dev(div5, "class", "sim-description");
    			add_location(div5, file, 784, 10, 27222);
    			attr_dev(td2, "colspan", "1");
    			attr_dev(td2, "class", "svelte-1sy0stl");
    			add_location(td2, file, 783, 8, 27195);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 789, 10, 27429);
    			attr_dev(td3, "class", "svelte-1sy0stl");
    			add_location(td3, file, 788, 8, 27414);
    			attr_dev(tr1, "class", "svelte-1sy0stl");
    			add_location(tr1, file, 778, 6, 26918);
    			attr_dev(table, "class", "simulation svelte-1sy0stl");
    			add_location(table, file, 703, 4, 24444);
    			attr_dev(div6, "class", "table-wraper svelte-1sy0stl");
    			add_location(div6, file, 702, 2, 24413);
    			attr_dev(div7, "class", "update-btn-wraper svelte-1sy0stl");
    			add_location(div7, file, 794, 2, 27553);
    			attr_dev(main, "class", "svelte-1sy0stl");
    			add_location(main, file, 377, 0, 11105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
    			insert_dev(target, t0, anchor);
    			mount_component(morderaddproductentrypopup, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, a);
    			append_dev(main, t3);
    			append_dev(main, div0);
    			append_dev(div0, t4);
    			append_dev(div0, label0);
    			append_dev(label0, input0);
    			append_dev(label0, t5);
    			append_dev(label0, span);
    			append_dev(div0, t6);
    			append_dev(main, t7);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t8);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t9);
    			append_dev(main, div4);
    			append_dev(div4, h3);
    			append_dev(div4, t11);
    			append_dev(div4, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t13);
    			append_dev(div2, div1);
    			mount_component(autocomplete, div1, null);
    			append_dev(div1, t14);
    			if_block2.m(div1, null);
    			append_dev(div4, t15);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(main, t17);
    			append_dev(main, div6);
    			append_dev(div6, table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(table, null);
    				}
    			}

    			append_dev(table, t18);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(table, t20);
    			append_dev(table, tr1);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			append_dev(td1, t21);
    			append_dev(td1, img);
    			append_dev(tr1, t22);
    			append_dev(tr1, td2);
    			append_dev(td2, div5);
    			append_dev(div5, textarea);
    			set_input_value(textarea, /*SimDescriptionNew*/ ctx[16]);
    			append_dev(tr1, t23);
    			append_dev(tr1, td3);
    			append_dev(td3, button1);
    			append_dev(main, t25);
    			append_dev(main, div7);
    			mount_component(button2, div7, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*update_collecting_state*/ ctx[25], false, false, false, false),
    					listen_dev(button0, "click", new_product_btn_click, false, false, false, false),
    					listen_dev(input1, "change", /*handleImageUploadSim*/ ctx[23], false, false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler_1*/ ctx[54]),
    					listen_dev(button1, "click", /*addNewSimBtnClicked*/ ctx[24], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const morderaddproductentrypopup_changes = {};
    			if (dirty[0] & /*ALL_COLORS*/ 2) morderaddproductentrypopup_changes.ALL_COLORS = /*ALL_COLORS*/ ctx[1];
    			if (dirty[0] & /*ALL_SIZES*/ 1) morderaddproductentrypopup_changes.ALL_SIZES = /*ALL_SIZES*/ ctx[0];
    			if (dirty[0] & /*ALL_VERIENTS*/ 4) morderaddproductentrypopup_changes.ALL_VERIENTS = /*ALL_VERIENTS*/ ctx[2];
    			morderaddproductentrypopup.$set(morderaddproductentrypopup_changes);

    			if (/*headerData*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(main, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[5]?.products) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*data*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t9);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const autocomplete_changes = {};

    			if (dirty[2] & /*$$scope, label, item*/ 2097200) {
    				autocomplete_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selectedItem && dirty[0] & /*selectedProduct*/ 64) {
    				updating_selectedItem = true;
    				autocomplete_changes.selectedItem = /*selectedProduct*/ ctx[6];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete.$set(autocomplete_changes);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			}

    			if (dirty[0] & /*data, current_selected_sim_idx*/ 131104) {
    				each_value = /*data*/ ctx[5]?.simulations || [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, t18);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*simImage*/ 32768 && !src_url_equal(img.src, img_src_value = /*simImage*/ ctx[15])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*SimDescriptionNew*/ 65536) {
    				set_input_value(textarea, /*SimDescriptionNew*/ ctx[16]);
    			}

    			const button2_changes = {};
    			if (dirty[0] & /*updateing_to_server*/ 2048) button2_changes.disabled = /*updateing_to_server*/ ctx[11];

    			if (dirty[0] & /*updateing_to_server*/ 2048 | dirty[2] & /*$$scope*/ 2097152) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(morderaddproductentrypopup.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(autocomplete.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(morderaddproductentrypopup.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(autocomplete.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
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
    			destroy_each(each_blocks, detaching);
    			destroy_component(button2);
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MyMorderEdit', slots, []);
    	let { id } = $$props;
    	let updateing = false;
    	let ALL_PROVIDERS;
    	let headerData = undefined;
    	let serverData = undefined;
    	let data = undefined;
    	let selectedProduct = undefined;

    	//let productsData;
    	async function get_order_from_server() {
    		let resp = await apiGetMOrder(id);
    		return resp;
    	}

    	async function load_order_from_server(resp = undefined) {
    		updateing = true;

    		if (resp == undefined) {
    			resp = await get_order_from_server();
    		}

    		// console.log("resp:", resp);
    		$$invalidate(5, data = serverData = JSON.parse(JSON.stringify(resp)));

    		console.log("data:", data);

    		$$invalidate(4, headerData = [
    			{
    				created: data.created,
    				updated: data.updated,
    				id: data.id,
    				name: data.name,
    				email: data.email,
    				message: data.message,
    				phone: data.phone,
    				status2: data.status2,
    				status_msg: data.status_msg,
    				client_id: data.client,
    				client_name: data.client_businessName,
    				agent: data.agent_name,
    				sheets_price_prop_link: data.sheets_price_prop_link,
    				sheets_order_link: data.sheets_order_link,
    				client_sign_url: data.client_sign_url,
    				export_to_suppliers: data.export_to_suppliers,
    				address: data.address,
    				settlement: data.settlement,
    				is_delivery_company: data.is_delivery_company,
    				private_company: data.private_company
    			}
    		]);

    		//productsData = data.products;
    		console.log("headerData:", headerData);

    		//groupedProducts = group the productsData by product field (ID: int)
    		updateing = false;
    	}

    	let ALL_SIZES;
    	let ALL_COLORS;
    	let ALL_VERIENTS;
    	let ALL_STATUSES;
    	let ALL_COLORS_DICT;
    	let ALL_SIZES_DICT;
    	let ALL_VERIENTS_DICT;
    	let updateing_to_server = false;

    	onMount(async () => {

    		// TODO: set collectingState based on the hash
    		// ALL_SIZES = await apiGetAllSizes();
    		// ALL_COLORS = await apiGetAllColors();
    		// ALL_VERIENTS = await apiGetAllVariants();
    		// ALL_STATUSES = await apiGetAllMorderStatuses();
    		let promises = [
    			apiGetAllSizes(),
    			apiGetAllColors(),
    			apiGetAllVariants(),
    			apiGetAllMorderStatuses(),
    			get_order_from_server(),
    			apiGetProviders()
    		];

    		let results = await Promise.all(promises);
    		$$invalidate(0, ALL_SIZES = results[0]);
    		$$invalidate(1, ALL_COLORS = results[1]);
    		$$invalidate(2, ALL_VERIENTS = results[2]);
    		debugger;
    		$$invalidate(7, ALL_STATUSES = results[3]);
    		let resp = results[4];
    		$$invalidate(3, ALL_PROVIDERS = results[5]);
    		await load_order_from_server(resp);

    		// based on the hash, set collectingState
    		debugger;

    		if (window.location.hash == "#collecting") {
    			$$invalidate(18, collectingState = true);

    			// set the value of the checkbox
    			document.querySelector(".collecting-switch input").checked = true;
    		} else {
    			$$invalidate(18, collectingState = false);

    			// set the value of the checkbox
    			document.querySelector(".collecting-switch input").checked = false;
    		}
    	});

    	async function save_data() {
    		// move headerData to data
    		$$invalidate(5, data.created = headerData[0].created, data);

    		$$invalidate(5, data.updated = headerData[0].updated, data);
    		$$invalidate(5, data.id = headerData[0].id, data);
    		$$invalidate(5, data.name = headerData[0].name, data);
    		$$invalidate(5, data.email = headerData[0].email, data);
    		$$invalidate(5, data.message = headerData[0].message, data);
    		$$invalidate(5, data.phone = headerData[0].phone, data);

    		// data.status = headerData[0].status;
    		$$invalidate(5, data.status2 = headerData[0].status2, data);

    		$$invalidate(5, data.status_msg = headerData[0].status_msg, data);
    		$$invalidate(5, data.client = headerData[0].client_id, data);
    		$$invalidate(5, data.client_businessName = headerData[0].client_name, data);
    		$$invalidate(5, data.export_to_suppliers = headerData[0].export_to_suppliers, data);
    		$$invalidate(5, data.address = headerData[0].address, data);
    		$$invalidate(5, data.settlement = headerData[0].settlement, data);
    		$$invalidate(5, data.contact_name = headerData[0].contact_name, data);
    		$$invalidate(5, data.private_company = headerData[0].private_company, data);
    		$$invalidate(11, updateing_to_server = true);
    		await apiSaveMOrder(data.id, data);
    		$$invalidate(11, updateing_to_server = false);
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
    		$$invalidate(12, add_product_message = "");
    		$$invalidate(13, add_product_status = "sending");
    		$$invalidate(14, add_product_status_color = "black");
    		let sendData = {};
    		console.log("looking for ", selectedProduct.id, " in ", data.products);

    		if (data.products.find(product => product.product.id == selectedProduct.id)) {
    			$$invalidate(12, add_product_message = "מוצר כבר נמצא בהזמנה");
    			$$invalidate(13, add_product_status = "error");
    			$$invalidate(14, add_product_status_color = "red");
    			return;
    		}

    		sendData["order_id"] = data.id;
    		sendData["product_id"] = selectedProduct.id;
    		console.log("data: ", sendData);

    		apiAddNewProductToMorder(sendData).then(newEntry => {
    			//e.target.reset();
    			data.products.push(newEntry.data);

    			$$invalidate(5, data.products = [...data.products], data);
    			$$invalidate(6, selectedProduct = undefined);
    			$$invalidate(13, add_product_status = "unset");
    		}).catch(err => {
    			console.log(err);
    			$$invalidate(13, add_product_status = "unset");
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
    						$$invalidate(5, data.products[i].entries[j].quantity = amount, data);
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

    				$$invalidate(5, data.products[i].entries = [...data.products[i].entries], data);
    				break;
    			}
    		}
    	}

    	function handleImageUploadSim(e) {
    		let file = e.target.files[0];
    		let reader = new FileReader();
    		reader.readAsDataURL(file);

    		reader.onload = function () {
    			let image = reader.result;
    			$$invalidate(15, simImage = image);
    		};
    	}

    	let simImage;
    	let SimDescriptionNew;

    	function addNewSimBtnClicked(e) {
    		e.preventDefault();
    		debugger;

    		if (data == undefined) {
    			$$invalidate(5, data = {});
    		}

    		if (!data?.simulations) {
    			$$invalidate(5, data.simulations = [], data);
    		}

    		data.simulations.push({
    			cimage: simImage,
    			description: SimDescriptionNew
    		});

    		$$invalidate(5, data.simulations = [...data.simulations], data);
    		$$invalidate(15, simImage = "");
    		$$invalidate(16, SimDescriptionNew = "");
    	}

    	let current_selected_sim_idx = -1;
    	let collectingState = false;

    	function update_collecting_state(e) {
    		$$invalidate(18, collectingState = e.target.checked);
    		debugger;

    		if (collectingState) {
    			window.location.hash = "#collecting";
    		} else {
    			window.location.hash = "";
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console_1.warn("<MyMorderEdit> was created without expected prop 'id'");
    		}
    	});

    	const writable_props = ['id'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<MyMorderEdit> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		headerData[0].name = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input1_input_handler() {
    		headerData[0].contact_name = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input2_input_handler() {
    		headerData[0].email = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function textarea0_input_handler() {
    		headerData[0].message = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input3_input_handler() {
    		headerData[0].phone = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function select_change_handler() {
    		headerData[0].status2 = select_value(this);
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function textarea1_input_handler() {
    		headerData[0].status_msg = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input4_input_handler() {
    		headerData[0].address = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input5_change_handler() {
    		headerData[0].is_delivery_company = this.checked;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input6_input_handler() {
    		headerData[0].settlement = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input7_input_handler() {
    		headerData[0].private_company = this.value;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	function input8_change_handler() {
    		headerData[0].export_to_suppliers = this.checked;
    		$$invalidate(4, headerData);
    		$$invalidate(7, ALL_STATUSES);
    	}

    	const click_handler = (product, each_value_2, product_index) => {
    		let new_price = prompt("מחיר חדש:", product.price);

    		if (new_price != null) {
    			$$invalidate(5, each_value_2[product_index].price = new_price, data);
    		}
    	};

    	const keydown_handler = (product, each_value_2, product_index, event) => {
    		if (event.key === "Enter" || event.key === " ") {
    			let new_price = prompt("מחיר חדש:", product.price);

    			if (new_price != null) {
    				$$invalidate(5, each_value_2[product_index].price = new_price, data);
    			}
    		}
    	};

    	function textarea0_input_handler_1(each_value_2, product_index) {
    		each_value_2[product_index].private_comment = this.value;
    		$$invalidate(5, data);
    	}

    	function textarea1_input_handler_1(each_value_2, product_index) {
    		each_value_2[product_index].public_comment = this.value;
    		$$invalidate(5, data);
    	}

    	const click_handler_1 = product => {
    		if (confirm("בטוח שברצונך למחוק את המוצר?")) {
    			// Save it!
    			apiDeleteMOrderItem(product.id);

    			$$invalidate(5, data.products = [...data.products.filter(item => item.id != product.id)], data);
    		}
    	};

    	const click_handler_2 = product => {
    		//data.simulations[current_selected_sim_idx].products = {product_id: amount:Int}
    		// set data.simulations[current_selected_sim_idx].products = [...data.simulations[current_selected_sim_idx].products, newData];
    		// if it already exists, remove it
    		if (data.simulations[current_selected_sim_idx].products && data.simulations[current_selected_sim_idx].products[product.id]) {
    			delete data.simulations[current_selected_sim_idx].products[product.id];
    			$$invalidate(5, data.simulations = [...data.simulations], data);
    		} else {
    			console.log(product);
    			debugger;
    			let total_amount = product.entries.reduce((acc, curr) => acc + curr.quantity, 0);

    			if (!data.simulations[current_selected_sim_idx].products) {
    				$$invalidate(5, data.simulations[current_selected_sim_idx].products = {}, data);
    			}

    			$$invalidate(
    				5,
    				data.simulations[current_selected_sim_idx].products[product.id] = {
    					amount: total_amount,
    					title: product.product.title,
    					img: product.product.cimage
    				},
    				data
    			);
    		}
    	};

    	function mentriesservertable_product_binding(value, product, each_value_2, product_index) {
    		each_value_2[product_index] = value;
    		$$invalidate(5, data);
    	}

    	function collectingtable_product_binding(value, product, each_value_2, product_index) {
    		each_value_2[product_index] = value;
    		$$invalidate(5, data);
    	}

    	function autocomplete_selectedItem_binding(value) {
    		selectedProduct = value;
    		$$invalidate(6, selectedProduct);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler(each_value, i) {
    		each_value[i].order = to_number(this.value);
    		$$invalidate(5, data);
    	}

    	function textarea_input_handler(each_value, i) {
    		each_value[i].description = this.value;
    		$$invalidate(5, data);
    	}

    	const click_handler_3 = i => {
    		if (current_selected_sim_idx == i) {
    			$$invalidate(17, current_selected_sim_idx = -1);
    		} else {
    			$$invalidate(17, current_selected_sim_idx = i);
    		}
    	};

    	function input_input_handler_1(product_idx, each_value, i) {
    		each_value[i].products[product_idx].amount = to_number(this.value);
    		$$invalidate(5, data);
    	}

    	const click_handler_4 = (sim, each_value, i) => {
    		$$invalidate(5, each_value[i].deleted = !sim.deleted, data);
    	};

    	function textarea_input_handler_1() {
    		SimDescriptionNew = this.value;
    		$$invalidate(16, SimDescriptionNew);
    	}

    	const click_handler_5 = () => {
    		save_data();
    	};

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(26, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		Loading: Loading$1,
    		onMount,
    		apiAddNewProductToMorder,
    		apiDeleteMOrderItem,
    		apiGetAllColors,
    		apiGetAllMorderStatuses,
    		apiGetAllSizes,
    		apiGetAllVariants,
    		apiGetMOrder,
    		apiSaveMOrder,
    		apiSearchProducts,
    		apiGetProviders,
    		CLOUDINARY_BASE_URL,
    		MentriesServerTable,
    		AutoComplete: SimpleAutocomplete,
    		MorderAddProductEntryPopup,
    		morderAddProductEntryPopupStore,
    		CollectingTable,
    		id,
    		updateing,
    		ALL_PROVIDERS,
    		headerData,
    		serverData,
    		data,
    		selectedProduct,
    		get_order_from_server,
    		load_order_from_server,
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		ALL_STATUSES,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		ALL_VERIENTS_DICT,
    		updateing_to_server,
    		save_data,
    		searchProducts,
    		add_product_message,
    		add_product_status,
    		add_product_status_color,
    		addNewProductButtonClick,
    		add_entry_btn_clicked,
    		new_product_btn_click,
    		handleImageUploadSim,
    		simImage,
    		SimDescriptionNew,
    		addNewSimBtnClicked,
    		current_selected_sim_idx,
    		collectingState,
    		update_collecting_state
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(26, id = $$props.id);
    		if ('updateing' in $$props) updateing = $$props.updateing;
    		if ('ALL_PROVIDERS' in $$props) $$invalidate(3, ALL_PROVIDERS = $$props.ALL_PROVIDERS);
    		if ('headerData' in $$props) $$invalidate(4, headerData = $$props.headerData);
    		if ('serverData' in $$props) serverData = $$props.serverData;
    		if ('data' in $$props) $$invalidate(5, data = $$props.data);
    		if ('selectedProduct' in $$props) $$invalidate(6, selectedProduct = $$props.selectedProduct);
    		if ('ALL_SIZES' in $$props) $$invalidate(0, ALL_SIZES = $$props.ALL_SIZES);
    		if ('ALL_COLORS' in $$props) $$invalidate(1, ALL_COLORS = $$props.ALL_COLORS);
    		if ('ALL_VERIENTS' in $$props) $$invalidate(2, ALL_VERIENTS = $$props.ALL_VERIENTS);
    		if ('ALL_STATUSES' in $$props) $$invalidate(7, ALL_STATUSES = $$props.ALL_STATUSES);
    		if ('ALL_COLORS_DICT' in $$props) $$invalidate(8, ALL_COLORS_DICT = $$props.ALL_COLORS_DICT);
    		if ('ALL_SIZES_DICT' in $$props) $$invalidate(9, ALL_SIZES_DICT = $$props.ALL_SIZES_DICT);
    		if ('ALL_VERIENTS_DICT' in $$props) $$invalidate(10, ALL_VERIENTS_DICT = $$props.ALL_VERIENTS_DICT);
    		if ('updateing_to_server' in $$props) $$invalidate(11, updateing_to_server = $$props.updateing_to_server);
    		if ('add_product_message' in $$props) $$invalidate(12, add_product_message = $$props.add_product_message);
    		if ('add_product_status' in $$props) $$invalidate(13, add_product_status = $$props.add_product_status);
    		if ('add_product_status_color' in $$props) $$invalidate(14, add_product_status_color = $$props.add_product_status_color);
    		if ('simImage' in $$props) $$invalidate(15, simImage = $$props.simImage);
    		if ('SimDescriptionNew' in $$props) $$invalidate(16, SimDescriptionNew = $$props.SimDescriptionNew);
    		if ('current_selected_sim_idx' in $$props) $$invalidate(17, current_selected_sim_idx = $$props.current_selected_sim_idx);
    		if ('collectingState' in $$props) $$invalidate(18, collectingState = $$props.collectingState);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ALL_COLORS*/ 2) {
    			{

    				if (ALL_COLORS) {
    					let ALL_COLORS_DICT_temp = {};

    					ALL_COLORS.forEach(color => {
    						ALL_COLORS_DICT_temp[color.id] = color;
    					});

    					$$invalidate(8, ALL_COLORS_DICT = ALL_COLORS_DICT_temp);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*ALL_SIZES*/ 1) {
    			{

    				if (ALL_SIZES) {
    					let ALL_SIZES_DICT_temp = {};

    					ALL_SIZES.forEach(size => {
    						ALL_SIZES_DICT_temp[size.id] = size;
    					});

    					$$invalidate(9, ALL_SIZES_DICT = ALL_SIZES_DICT_temp);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*ALL_VERIENTS*/ 4) {
    			{

    				if (ALL_VERIENTS) {
    					let ALL_VERIENTS_DICT_temp = {};

    					ALL_VERIENTS.forEach(ver => {
    						ALL_VERIENTS_DICT_temp[ver.id] = ver;
    					});

    					$$invalidate(10, ALL_VERIENTS_DICT = ALL_VERIENTS_DICT_temp);
    				}
    			}
    		}
    	};

    	return [
    		ALL_SIZES,
    		ALL_COLORS,
    		ALL_VERIENTS,
    		ALL_PROVIDERS,
    		headerData,
    		data,
    		selectedProduct,
    		ALL_STATUSES,
    		ALL_COLORS_DICT,
    		ALL_SIZES_DICT,
    		ALL_VERIENTS_DICT,
    		updateing_to_server,
    		add_product_message,
    		add_product_status,
    		add_product_status_color,
    		simImage,
    		SimDescriptionNew,
    		current_selected_sim_idx,
    		collectingState,
    		save_data,
    		searchProducts,
    		addNewProductButtonClick,
    		add_entry_btn_clicked,
    		handleImageUploadSim,
    		addNewSimBtnClicked,
    		update_collecting_state,
    		id,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea0_input_handler,
    		input3_input_handler,
    		select_change_handler,
    		textarea1_input_handler,
    		input4_input_handler,
    		input5_change_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_change_handler,
    		click_handler,
    		keydown_handler,
    		textarea0_input_handler_1,
    		textarea1_input_handler_1,
    		click_handler_1,
    		click_handler_2,
    		mentriesservertable_product_binding,
    		collectingtable_product_binding,
    		autocomplete_selectedItem_binding,
    		focus_handler,
    		input_input_handler,
    		textarea_input_handler,
    		click_handler_3,
    		input_input_handler_1,
    		click_handler_4,
    		textarea_input_handler_1,
    		click_handler_5
    	];
    }

    class MyMorderEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 26 }, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MyMorderEdit",
    			options,
    			id: create_fragment.name
    		});
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
