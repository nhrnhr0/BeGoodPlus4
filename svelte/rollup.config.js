import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';

const production = process.env.VITE_IS_PRODUCTION;
console.log('========================================');
console.log('========= ', 'production? ', production , ' =========');
console.log('========================================');
function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

function componentExportDetails(componentName) {
	return {
    input: `src/main-${componentName.toLowerCase()}.js`,
		output: {
			sourcemap: true,
			format: 'iife',
    name: `${componentName.toLowerCase()}`,
    file: `public/build/${componentName}.js`,
		},
		plugins: [
			replace({
				preventAssignment: true,
				// 2 level deep object should be stringify
				process: JSON.stringify({
					env: {
						isProd: production,
						serverBaseUrl: process.env.VITE_SERVER_LOCATION
					},
				}),
			}),
			svelte({
				compilerOptions: {
					// enable run-time checks when not in production
					dev: !production
				}
			}),
			
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css({ output: `${componentName}.css` }),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),

			// In dev mode, call `npm run start` once
			// the bundle has been generated
			!production && serve(),

			// Watch the `public` directory and refresh the
			// browser on changes when not in production
			!production && livereload('public'),

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser()
		],
		watch: {
			clearScreen: false
		}
	};
}

let exportable = [];

// Add your component names here!
[
  "App",
  "CampainEditor",
  // "MyComponent",
].forEach((d) => exportable.push(componentExportDetails(d)));

export default exportable;