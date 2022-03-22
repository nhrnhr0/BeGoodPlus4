
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35733/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var campaineditor = (function () {
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
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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

    /* node_modules\simple-svelte-autocomplete\src\SimpleAutocomplete.svelte generated by Svelte v3.44.3 */

    const { Object: Object_1, console: console_1$1 } = globals;
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

    function get_each_context_1$1(ctx, list, i) {
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

    function get_each_context_2(ctx, list, i) {
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
    			if (dirty[0] & /*valueFunction, selectedItem*/ 18 | dirty[1] & /*safeLabelFunction*/ 8) {
    				each_value_2 = /*selectedItem*/ ctx[1];
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
    function create_each_block_2(ctx) {
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
    		id: create_each_block_2.name,
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
    			if (dirty[0] & /*selectedItem*/ 2 | dirty[1] & /*unselectItem, safeLabelFunction*/ 1032 | dirty[2] & /*$$scope*/ 8192) {
    				each_value_1 = /*selectedItem*/ ctx[1];
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
    function create_each_block_1$1(ctx) {
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
    		id: create_each_block_1$1.name,
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
    function create_if_block_7(ctx) {
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(1234:28) ",
    		ctx
    	});

    	return block;
    }

    // (1230:21) 
    function create_if_block_6(ctx) {
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(1230:21) ",
    		ctx
    	});

    	return block;
    }

    // (1226:37) 
    function create_if_block_5(ctx) {
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(1226:37) ",
    		ctx
    	});

    	return block;
    }

    // (1195:4) {#if filteredListItems && filteredListItems.length > 0}
    function create_if_block$1(ctx) {
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

    	let if_block = /*maxItemsToShowInList*/ ctx[5] > 0 && /*filteredListItems*/ ctx[27].length > /*maxItemsToShowInList*/ ctx[5] && create_if_block_1$1(ctx);

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
    					if_block = create_if_block_1$1(ctx);
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
    		id: create_if_block$1.name,
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
    function create_if_block_2$1(ctx) {
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
    		id: create_if_block_2$1.name,
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
    function create_else_block(ctx) {
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(1212:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1210:16) {#if listItem.highlighted}
    function create_if_block_4(ctx) {
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
    		id: create_if_block_4.name,
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
    		if (/*listItem*/ ctx[108].highlighted) return create_if_block_4;
    		return create_else_block;
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
    	let if_block = /*listItem*/ ctx[108] && (/*maxItemsToShowInList*/ ctx[5] <= 0 || /*i*/ ctx[110] < /*maxItemsToShowInList*/ ctx[5]) && create_if_block_2$1(ctx);

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
    					if_block = create_if_block_2$1(ctx);
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
    function create_if_block_1$1(ctx) {
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
    		id: create_if_block_1$1.name,
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
    	const if_block_creators = [create_if_block$1, create_if_block_5, create_if_block_6, create_if_block_7];
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<SimpleAutocomplete> was created with unknown prop '${key}'`);
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
    			console_1$1.warn("<SimpleAutocomplete> was created without expected prop 'text'");
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

    const ADMIN_API_URL = '/admin-api/';
    const GET_CAMPAIN_PRODUCTS_URL = ADMIN_API_URL + 'get-campaign-products/';


    const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ms-global/image/upload/';

    var pathArray = (document.currentScript && document.currentScript.src || new URL('CampainEditor.js', document.baseURI).href).split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;
    const BASE_URL =  url; //'https://catalog.boost-pop.com'; //'http://127.0.0.1:8000'; // 
    const SEARCH_API_URL = BASE_URL + '/search';
    const GET_PRODUCT_COST_PRICE_URL = BASE_URL + '/admin-api/get_product_cost_price/';

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
    function deepEqual(object1, object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            const val1 = object1[key];
            const val2 = object2[key];
            const areObjects = isObject(val1) && isObject(val2);
            if (
                areObjects && !deepEqual(val1, val2) ||
                !areObjects && val1 !== val2
            ) {
                return false;
            }
        }
        return true;
    }

    function isObject(object) {
        return object != null && typeof object === 'object';
    }

    function apiSearchProducts(keyword) {
        const url = SEARCH_API_URL + '?q=' + encodeURIComponent(keyword);
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

    const durationUnitRegex = /[a-zA-Z]/;
    const range = (size, startAt = 0) => [...Array(size).keys()].map(i => i + startAt);
    // export const characterRange = (startChar, endChar) =>
    //   String.fromCharCode(
    //     ...range(
    //       endChar.charCodeAt(0) - startChar.charCodeAt(0),
    //       startChar.charCodeAt(0)
    //     )
    //   );
    // export const zip = (arr, ...arrs) =>
    //   arr.map((val, i) => arrs.reduce((list, curr) => [...list, curr[i]], [val]));

    /* node_modules\svelte-loading-spinners\dist\Jumper.svelte generated by Svelte v3.44.3 */
    const file$1 = "node_modules\\svelte-loading-spinners\\dist\\Jumper.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (44:2) {#each range(3, 1) as version}
    function create_each_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-1cy66mt");
    			set_style(div, "animation-delay", /*durationNum*/ ctx[5] / 3 * (/*version*/ ctx[6] - 1) + /*durationUnit*/ ctx[4]);
    			add_location(div, file$1, 44, 4, 991);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(44:2) {#each range(3, 1) as version}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = range(3, 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-1cy66mt");
    			set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			set_style(div, "--color", /*color*/ ctx[0]);
    			set_style(div, "--duration", /*duration*/ ctx[2]);
    			add_location(div, file$1, 40, 0, 852);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*durationNum, range, durationUnit*/ 48) {
    				each_value = range(3, 1);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*size, unit*/ 10) {
    				set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div, "--color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*duration*/ 4) {
    				set_style(div, "--duration", /*duration*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('Jumper', slots, []);
    	let { color = "#FF3E00" } = $$props;
    	let { unit = "px" } = $$props;
    	let { duration = "1s" } = $$props;
    	let { size = "60" } = $$props;
    	let durationUnit = duration.match(durationUnitRegex)[0];
    	let durationNum = duration.replace(durationUnitRegex, "");
    	const writable_props = ['color', 'unit', 'duration', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Jumper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		range,
    		durationUnitRegex,
    		color,
    		unit,
    		duration,
    		size,
    		durationUnit,
    		durationNum
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('durationUnit' in $$props) $$invalidate(4, durationUnit = $$props.durationUnit);
    		if ('durationNum' in $$props) $$invalidate(5, durationNum = $$props.durationNum);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, unit, duration, size, durationUnit, durationNum];
    }

    class Jumper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { color: 0, unit: 1, duration: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jumper",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get color() {
    		throw new Error("<Jumper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Jumper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<Jumper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<Jumper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Jumper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Jumper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Jumper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Jumper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\CampainEditor.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;

    const file = "src\\CampainEditor.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[23] = list;
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[26] = list;
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (97:0) {#if object_id}
    function create_if_block(ctx) {
    	let main;
    	let table;
    	let thead;
    	let tr0;
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
    	let t10;
    	let tr1;
    	let td0;
    	let t11;
    	let td1;
    	let form;
    	let autocomplete;
    	let updating_value;
    	let t12;
    	let td2;
    	let t13;
    	let current;
    	let if_block0 = /*data*/ ctx[2] && create_if_block_3(ctx);

    	function autocomplete_value_binding(value) {
    		/*autocomplete_value_binding*/ ctx[15](value);
    	}

    	let autocomplete_props = {
    		id: "search_input",
    		loadingText: "מחפש מוצרים...",
    		createText: "לא נמצאו תוצאות חיפוש",
    		showLoadingIndicator: "true",
    		noResultsText: "",
    		onChange: /*autocompleteItemSelected*/ ctx[6],
    		create: "true",
    		placeholder: "חיפוש...",
    		className: "autocomplete-cls",
    		searchFunction: /*searchProducts*/ ctx[7],
    		delay: "200",
    		localFiltering: false,
    		labelFieldName: "title",
    		valueFieldName: "value",
    		$$slots: {
    			item: [
    				create_item_slot,
    				({ label, item }) => ({ 20: label, 21: item }),
    				({ label, item }) => (label ? 1048576 : 0) | (item ? 2097152 : 0)
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*searchValue*/ ctx[4] !== void 0) {
    		autocomplete_props.value = /*searchValue*/ ctx[4];
    	}

    	autocomplete = new SimpleAutocomplete({
    			props: autocomplete_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete, 'value', autocomplete_value_binding));
    	autocomplete.$on("focus", /*focus_handler*/ ctx[16]);
    	let if_block1 = /*need_update*/ ctx[1] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "פעולות";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "סדר";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "תמונה";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "מחיר עלות (לפני מע\"מ)";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "מחירים";
    			t9 = space();
    			tbody = element("tbody");
    			if (if_block0) if_block0.c();
    			t10 = space();
    			tr1 = element("tr");
    			td0 = element("td");
    			t11 = space();
    			td1 = element("td");
    			form = element("form");
    			create_component(autocomplete.$$.fragment);
    			t12 = space();
    			td2 = element("td");
    			t13 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(th0, "class", "svelte-6mk2rj");
    			add_location(th0, file, 107, 4, 2873);
    			attr_dev(th1, "class", "svelte-6mk2rj");
    			add_location(th1, file, 108, 4, 2894);
    			attr_dev(th2, "class", "svelte-6mk2rj");
    			add_location(th2, file, 109, 4, 2912);
    			attr_dev(th3, "class", "svelte-6mk2rj");
    			add_location(th3, file, 110, 4, 2932);
    			attr_dev(th4, "class", "svelte-6mk2rj");
    			add_location(th4, file, 111, 4, 2968);
    			add_location(tr0, file, 106, 3, 2863);
    			add_location(thead, file, 105, 2, 2851);
    			attr_dev(td0, "class", "svelte-6mk2rj");
    			add_location(td0, file, 203, 4, 5405);
    			attr_dev(form, "action", "");
    			add_location(form, file, 205, 5, 5443);
    			attr_dev(td1, "colspan", "1");
    			attr_dev(td1, "class", "svelte-6mk2rj");
    			add_location(td1, file, 204, 4, 5420);
    			attr_dev(td2, "class", "svelte-6mk2rj");
    			add_location(td2, file, 218, 4, 6221);
    			add_location(tr1, file, 202, 3, 5395);
    			add_location(tbody, file, 114, 2, 3009);
    			attr_dev(table, "class", "main-table svelte-6mk2rj");
    			add_location(table, file, 104, 1, 2821);
    			attr_dev(main, "class", "svelte-6mk2rj");
    			add_location(main, file, 97, 0, 2719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);
    			if (if_block0) if_block0.m(tbody, null);
    			append_dev(tbody, t10);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t11);
    			append_dev(tr1, td1);
    			append_dev(td1, form);
    			mount_component(autocomplete, form, null);
    			append_dev(tr1, t12);
    			append_dev(tr1, td2);
    			append_dev(main, t13);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*data*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(tbody, t10);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const autocomplete_changes = {};

    			if (dirty & /*$$scope, label, item*/ 271581184) {
    				autocomplete_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*searchValue*/ 16) {
    				updating_value = true;
    				autocomplete_changes.value = /*searchValue*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			autocomplete.$set(autocomplete_changes);

    			if (/*need_update*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*need_update*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			destroy_component(autocomplete);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(97:0) {#if object_id}",
    		ctx
    	});

    	return block;
    }

    // (116:3) {#if data}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			if (dirty & /*data, CLOUDINARY_BASE_URL*/ 4) {
    				each_value = /*data*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(116:3) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (156:7) {#each product.priceTable as price, i }
    function create_each_block_1(ctx) {
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let input1;
    	let t1;
    	let div0;
    	let t2_value = ((/*price*/ ctx[25].cach_price / /*product*/ ctx[22].cost_price - 1) * 100).toFixed(2) + "";
    	let t2;
    	let t3;
    	let t4;
    	let td2;
    	let input2;
    	let t5;
    	let div1;
    	let t6_value = ((/*price*/ ctx[25].credit_price / 1.17 / /*price*/ ctx[25].cach_price - 1) * 100).toFixed(2) + "";
    	let t6;
    	let t7;
    	let t8;
    	let td3;
    	let button;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[10].call(input0, /*each_value_1*/ ctx[26], /*i*/ ctx[27]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[11].call(input1, /*each_value_1*/ ctx[26], /*i*/ ctx[27]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[12].call(input2, /*each_value_1*/ ctx[26], /*i*/ ctx[27]);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[13](/*product*/ ctx[22], /*i*/ ctx[27], /*each_value*/ ctx[23], /*j*/ ctx[24], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = text(" %");
    			t4 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t5 = space();
    			div1 = element("div");
    			t6 = text(t6_value);
    			t7 = text(" %");
    			t8 = space();
    			td3 = element("td");
    			button = element("button");
    			button.textContent = "מחק";
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "name", "");
    			attr_dev(input0, "id", "");
    			add_location(input0, file, 159, 10, 4040);
    			attr_dev(td0, "class", "svelte-6mk2rj");
    			add_location(td0, file, 158, 9, 4024);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "");
    			attr_dev(input1, "id", "");
    			add_location(input1, file, 162, 10, 4144);
    			attr_dev(div0, "class", "price-diff");
    			add_location(div0, file, 163, 10, 4221);
    			attr_dev(td1, "class", "svelte-6mk2rj");
    			add_location(td1, file, 161, 9, 4128);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "name", "");
    			attr_dev(input2, "id", "");
    			add_location(input2, file, 168, 10, 4385);
    			attr_dev(div1, "class", "price-diff");
    			add_location(div1, file, 169, 10, 4464);
    			attr_dev(td2, "class", "svelte-6mk2rj");
    			add_location(td2, file, 167, 9, 4369);
    			add_location(button, file, 174, 10, 4635);
    			attr_dev(td3, "class", "svelte-6mk2rj");
    			add_location(td3, file, 173, 9, 4619);
    			add_location(tr, file, 156, 8, 3998);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*price*/ ctx[25].amount);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*price*/ ctx[25].cach_price);
    			append_dev(td1, t1);
    			append_dev(td1, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*price*/ ctx[25].credit_price);
    			append_dev(td2, t5);
    			append_dev(td2, div1);
    			append_dev(div1, t6);
    			append_dev(div1, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td3);
    			append_dev(td3, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(button, "click", prevent_default(click_handler_1), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 4 && to_number(input0.value) !== /*price*/ ctx[25].amount) {
    				set_input_value(input0, /*price*/ ctx[25].amount);
    			}

    			if (dirty & /*data*/ 4 && to_number(input1.value) !== /*price*/ ctx[25].cach_price) {
    				set_input_value(input1, /*price*/ ctx[25].cach_price);
    			}

    			if (dirty & /*data*/ 4 && t2_value !== (t2_value = ((/*price*/ ctx[25].cach_price / /*product*/ ctx[22].cost_price - 1) * 100).toFixed(2) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*data*/ 4 && to_number(input2.value) !== /*price*/ ctx[25].credit_price) {
    				set_input_value(input2, /*price*/ ctx[25].credit_price);
    			}

    			if (dirty & /*data*/ 4 && t6_value !== (t6_value = ((/*price*/ ctx[25].credit_price / 1.17 / /*price*/ ctx[25].cach_price - 1) * 100).toFixed(2) + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(156:7) {#each product.priceTable as price, i }",
    		ctx
    	});

    	return block;
    }

    // (117:3) {#each data as product, j}
    function create_each_block(ctx) {
    	let tr2;
    	let td0;
    	let button0;
    	let t1;
    	let td1;
    	let input;
    	let t2;
    	let td2;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t3;
    	let span;
    	let t4_value = /*product*/ ctx[22].title + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*product*/ ctx[22].cost_price + "";
    	let t6;
    	let t7;
    	let t8;
    	let td5;
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
    	let tbody;
    	let t17;
    	let tr1;
    	let td4;
    	let button1;
    	let t19;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[8](/*j*/ ctx[24], ...args);
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[9].call(input, /*each_value*/ ctx[23], /*j*/ ctx[24]);
    	}

    	let each_value_1 = /*product*/ ctx[22].priceTable;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[14](/*product*/ ctx[22], /*each_value*/ ctx[23], /*j*/ ctx[24]);
    	}

    	const block = {
    		c: function create() {
    			tr2 = element("tr");
    			td0 = element("td");
    			button0 = element("button");
    			button0.textContent = "מחק";
    			t1 = space();
    			td1 = element("td");
    			input = element("input");
    			t2 = space();
    			td2 = element("td");
    			img = element("img");
    			t3 = space();
    			span = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = text(" ₪");
    			t8 = space();
    			td5 = element("td");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "כמות";
    			t10 = space();
    			th1 = element("th");
    			th1.textContent = "מחיר ליח' (לפני מע\"מ)";
    			t12 = space();
    			th2 = element("th");
    			th2.textContent = "מחיר מומלץ לצרכן (כולל מע\"מ)";
    			t14 = space();
    			th3 = element("th");
    			th3.textContent = "פעולות";
    			t16 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t17 = space();
    			tr1 = element("tr");
    			td4 = element("td");
    			button1 = element("button");
    			button1.textContent = "הוסף מחיר";
    			t19 = space();
    			add_location(button0, file, 119, 5, 3088);
    			attr_dev(td0, "class", "svelte-6mk2rj");
    			add_location(td0, file, 118, 4, 3077);
    			attr_dev(input, "type", "number");
    			add_location(input, file, 129, 5, 3328);
    			attr_dev(td1, "class", "svelte-6mk2rj");
    			add_location(td1, file, 128, 4, 3317);
    			attr_dev(img, "width", "50px");
    			attr_dev(img, "height", "50px");
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + /*product*/ ctx[22].cimg))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*product*/ ctx[22].title);
    			add_location(img, file, 132, 5, 3405);
    			add_location(span, file, 133, 5, 3508);
    			attr_dev(td2, "class", "svelte-6mk2rj");
    			add_location(td2, file, 131, 4, 3394);
    			attr_dev(td3, "class", "svelte-6mk2rj");
    			add_location(td3, file, 141, 4, 3664);
    			attr_dev(th0, "class", "svelte-6mk2rj");
    			add_location(th0, file, 148, 8, 3770);
    			attr_dev(th1, "class", "svelte-6mk2rj");
    			add_location(th1, file, 149, 8, 3793);
    			attr_dev(th2, "class", "svelte-6mk2rj");
    			add_location(th2, file, 150, 8, 3833);
    			attr_dev(th3, "class", "svelte-6mk2rj");
    			add_location(th3, file, 151, 8, 3880);
    			add_location(tr0, file, 147, 7, 3756);
    			add_location(thead, file, 146, 6, 3740);
    			add_location(button1, file, 187, 9, 5004);
    			attr_dev(td4, "class", "svelte-6mk2rj");
    			add_location(td4, file, 186, 8, 4989);
    			add_location(tr1, file, 185, 7, 4975);
    			add_location(tbody, file, 154, 6, 3933);
    			attr_dev(table, "class", "svelte-6mk2rj");
    			add_location(table, file, 145, 5, 3725);
    			attr_dev(td5, "class", "svelte-6mk2rj");
    			add_location(td5, file, 144, 4, 3714);
    			add_location(tr2, file, 117, 3, 3067);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr2, anchor);
    			append_dev(tr2, td0);
    			append_dev(td0, button0);
    			append_dev(tr2, t1);
    			append_dev(tr2, td1);
    			append_dev(td1, input);
    			set_input_value(input, /*product*/ ctx[22].order);
    			append_dev(tr2, t2);
    			append_dev(tr2, td2);
    			append_dev(td2, img);
    			append_dev(td2, t3);
    			append_dev(td2, span);
    			append_dev(span, t4);
    			append_dev(tr2, t5);
    			append_dev(tr2, td3);
    			append_dev(td3, t6);
    			append_dev(td3, t7);
    			append_dev(tr2, t8);
    			append_dev(tr2, td5);
    			append_dev(td5, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t10);
    			append_dev(tr0, th1);
    			append_dev(tr0, t12);
    			append_dev(tr0, th2);
    			append_dev(tr0, t14);
    			append_dev(tr0, th3);
    			append_dev(table, t16);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t17);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td4);
    			append_dev(td4, button1);
    			append_dev(tr2, t19);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(click_handler), false, true, false),
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(button1, "click", prevent_default(click_handler_2), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 4 && to_number(input.value) !== /*product*/ ctx[22].order) {
    				set_input_value(input, /*product*/ ctx[22].order);
    			}

    			if (dirty & /*data*/ 4 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + /*product*/ ctx[22].cimg))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 4 && img_alt_value !== (img_alt_value = /*product*/ ctx[22].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*data*/ 4 && t4_value !== (t4_value = /*product*/ ctx[22].title + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*data*/ 4 && t6_value !== (t6_value = /*product*/ ctx[22].cost_price + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*data*/ 4) {
    				each_value_1 = /*product*/ ctx[22].priceTable;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t17);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(117:3) {#each data as product, j}",
    		ctx
    	});

    	return block;
    }

    // (208:7) 
    function create_item_slot(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t;
    	let html_tag;
    	let raw_value = /*label*/ ctx[20] + "";

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			html_tag = new HtmlTag();
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[21].title);
    			set_style(img, "height", "25px");
    			if (!src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*item*/ ctx[21].cimage))) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 210, 10, 5992);
    			html_tag.a = null;
    			attr_dev(div0, "class", "inner");
    			add_location(div0, file, 209, 9, 5961);
    			attr_dev(div1, "class", "search-item");
    			add_location(div1, file, 208, 8, 5925);
    			attr_dev(div2, "slot", "item");
    			add_location(div2, file, 207, 7, 5864);
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
    			if (dirty & /*item*/ 2097152 && img_alt_value !== (img_alt_value = /*item*/ ctx[21].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*item*/ 2097152 && !src_url_equal(img.src, img_src_value = "" + (CLOUDINARY_BASE_URL + "f_auto,w_auto/" + /*item*/ ctx[21].cimage))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*label*/ 1048576 && raw_value !== (raw_value = /*label*/ ctx[20] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_item_slot.name,
    		type: "slot",
    		source: "(208:7) ",
    		ctx
    	});

    	return block;
    }

    // (226:1) {#if need_update}
    function create_if_block_1(ctx) {
    	let button;
    	let t;
    	let button_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*updateing*/ ctx[3] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = text("\r\n\t\t\t\tעדכן מידע לשרת");
    			attr_dev(button, "class", "float-btn svelte-6mk2rj");
    			add_location(button, file, 226, 2, 6299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*update_data_to_server*/ ctx[5]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*updateing*/ ctx[3]) {
    				if (if_block) {
    					if (dirty & /*updateing*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
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

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, fly, { x: -50 }, true);
    				button_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (!button_transition) button_transition = create_bidirectional_transition(button, fly, { x: -50 }, false);
    			button_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (detaching && button_transition) button_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(226:1) {#if need_update}",
    		ctx
    	});

    	return block;
    }

    // (228:3) {#if updateing}
    function create_if_block_2(ctx) {
    	let jumper;
    	let current;

    	jumper = new Jumper({
    			props: {
    				size: "30",
    				color: "#FF3E00",
    				unit: "px",
    				duration: "1s"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jumper.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jumper, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jumper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jumper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jumper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(228:3) {#if updateing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*object_id*/ ctx[0] && create_if_block(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*object_id*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*object_id*/ 1) {
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CampainEditor', slots, []);
    	let { object_id } = $$props;
    	let need_update = false;
    	let data;
    	let server_data;
    	let updateing = false;

    	onMount(async () => {
    		let url = GET_CAMPAIN_PRODUCTS_URL + object_id;
    		console.log('url', url);
    		let resp = await fetch(url).then(response => response.json()).then(data => data);
    		$$invalidate(2, data = JSON.parse(JSON.stringify(resp)));
    		server_data = JSON.parse(JSON.stringify(resp));
    		setInterval(check_server_updates, 500);
    	});

    	function check_server_updates() {
    		//console.log('check_server_updates: ', JSON.stringify(data),'======', JSON.stringify(server_data));
    		console.log('data:', data);

    		console.log('server_data:', server_data);

    		if (deepEqual(data, server_data)) {
    			console.log('equal');
    			$$invalidate(1, need_update = false);
    		} else {
    			console.log('not equal');
    			$$invalidate(1, need_update = true);
    		}
    	}

    	function admin_api_get_cost_price(prudct_id) {
    		let url = GET_PRODUCT_COST_PRICE_URL + prudct_id;
    		return fetch(url).then(response => response.json());
    	}

    	function update_data_to_server() {
    		// post the data to the server and the same api point as GET_CAMPAIN_PRODUCTS_URL
    		$$invalidate(3, updateing = true);

    		let response = fetch_wraper(GET_CAMPAIN_PRODUCTS_URL + object_id, {
    			method: 'POST',
    			body: JSON.stringify(data)
    		});

    		console.log('response:', response);

    		response.then(resp => {
    			console.log('resp:', resp);
    			server_data = JSON.parse(JSON.stringify(resp));
    			$$invalidate(2, data = JSON.parse(JSON.stringify(resp)));
    			$$invalidate(3, updateing = false);
    			$$invalidate(1, need_update = false);
    		});
    	}

    	function autocompleteItemSelected(item) {
    		if (data) {
    			console.log(data);
    			console.log(item);

    			admin_api_get_cost_price(item.id).then(resp => {
    				console.log('const_price:', resp);
    				item.cost_price = resp['cost_price'];

    				let newProduct = {
    					order: data.length,
    					cimg: item.cimage,
    					title: item.title,
    					catalogImage: item.id,
    					priceTable: [],
    					cost_price: item.cost_price
    				};

    				data.push(newProduct);
    				console.log(data);
    				$$invalidate(2, data);
    			});
    		}
    	}

    	let searchValue;

    	async function searchProducts(keyword) {
    		let json = await apiSearchProducts(keyword);
    		let data = json;
    		return data.all;
    	}

    	const writable_props = ['object_id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<CampainEditor> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (j, e) => {
    		// product.priceTable[i];
    		//product.priceTable = product.priceTable;
    		data.splice(j, 1);

    		$$invalidate(2, data);
    	};

    	function input_input_handler(each_value, j) {
    		each_value[j].order = to_number(this.value);
    		$$invalidate(2, data);
    	}

    	function input0_input_handler(each_value_1, i) {
    		each_value_1[i].amount = to_number(this.value);
    		$$invalidate(2, data);
    	}

    	function input1_input_handler(each_value_1, i) {
    		each_value_1[i].cach_price = to_number(this.value);
    		$$invalidate(2, data);
    	}

    	function input2_input_handler(each_value_1, i) {
    		each_value_1[i].credit_price = to_number(this.value);
    		$$invalidate(2, data);
    	}

    	const click_handler_1 = (product, i, each_value, j, e) => {
    		// product.priceTable[i];
    		//product.priceTable = product.priceTable;
    		product.priceTable.splice(i, 1);

    		$$invalidate(2, each_value[j].priceTable = product.priceTable, data);
    	};

    	const click_handler_2 = (product, each_value, j) => {
    		product.priceTable.push({
    			'amount': 1,
    			'cach_price': product.cost_price * 2,
    			'credit_price': product.cost_price * 2 * 2
    		});

    		$$invalidate(2, each_value[j].priceTable = product.priceTable, data);
    	};

    	function autocomplete_value_binding(value) {
    		searchValue = value;
    		$$invalidate(4, searchValue);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('object_id' in $$props) $$invalidate(0, object_id = $$props.object_id);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		fly,
    		AutoComplete: SimpleAutocomplete,
    		apiSearchProducts,
    		fetch_wraper,
    		Jumper,
    		deepEqual,
    		GET_CAMPAIN_PRODUCTS_URL,
    		CLOUDINARY_BASE_URL,
    		GET_PRODUCT_COST_PRICE_URL,
    		object_id,
    		need_update,
    		data,
    		server_data,
    		updateing,
    		check_server_updates,
    		admin_api_get_cost_price,
    		update_data_to_server,
    		autocompleteItemSelected,
    		searchValue,
    		searchProducts
    	});

    	$$self.$inject_state = $$props => {
    		if ('object_id' in $$props) $$invalidate(0, object_id = $$props.object_id);
    		if ('need_update' in $$props) $$invalidate(1, need_update = $$props.need_update);
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('server_data' in $$props) server_data = $$props.server_data;
    		if ('updateing' in $$props) $$invalidate(3, updateing = $$props.updateing);
    		if ('searchValue' in $$props) $$invalidate(4, searchValue = $$props.searchValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		object_id,
    		need_update,
    		data,
    		updateing,
    		searchValue,
    		update_data_to_server,
    		autocompleteItemSelected,
    		searchProducts,
    		click_handler,
    		input_input_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler_1,
    		click_handler_2,
    		autocomplete_value_binding,
    		focus_handler
    	];
    }

    class CampainEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { object_id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CampainEditor",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*object_id*/ ctx[0] === undefined && !('object_id' in props)) {
    			console_1.warn("<CampainEditor> was created without expected prop 'object_id'");
    		}
    	}

    	get object_id() {
    		throw new Error("<CampainEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set object_id(value) {
    		throw new Error("<CampainEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const campainEditor = new CampainEditor({
    	target: document.getElementById("campaineditor-target"),
    	props: JSON.parse(document.getElementById("campaineditor-props").textContent),
    });

    return campainEditor;

})();
//# sourceMappingURL=CampainEditor.js.map
