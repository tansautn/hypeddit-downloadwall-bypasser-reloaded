import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname);
const SCRIPT_PATH = path.join(ROOT, 'script.js');

/** 4-char random alphanumeric suffix */
function randomSuffix() {
    return crypto.randomBytes(3).toString('hex').slice(0, 4);
}

/** Read the current @version value from script.js */
function readVersion(content) {
    const m = content.match(/^\/\/ @version\s+(.+)$/m);
    return m ? m[1].trim() : null;
}

/** Strip any existing -dev-XXXX tail, return base version */
function baseVersion(ver) {
    return ver.replace(/-dev-[A-Za-z0-9]+$/, '');
}

/** Replace @version line in content string */
function patchVersion(content, newVer) {
    return content.replace(/^(\/\/ @version\s+).+$/m, `$1${newVer}`);
}

// ── Vite plugin: version bumping for dev hot-reload ──────────────────────────
function userscriptDevVersion() {
    let originalVersion = null;
    // Guards against reacting to our own writes (simple set-based mutex)
    const selfWrites = new Set();

    function writeVersion(newVer) {
        const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        const patched = patchVersion(content, newVer);
        selfWrites.add(SCRIPT_PATH);
        fs.writeFileSync(SCRIPT_PATH, patched, 'utf-8');
        // Remove guard on next tick — after the watcher event fires
        setImmediate(() => selfWrites.delete(SCRIPT_PATH));
    }

    function bumpDevVersion() {
        const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        const current = readVersion(content);
        if (!current) return;
        const base = baseVersion(current);
        const newVer = `${base}-dev-${randomSuffix()}`;
        writeVersion(newVer);
        console.log(`\n[userscript] @version bumped → ${newVer}`);
    }

    function restoreVersion() {
        if (!originalVersion) return;
        console.log(`\n[userscript] Restoring @version → ${originalVersion}`);
        writeVersion(originalVersion);
        originalVersion = null;
    }

    return {
        name: 'userscript-dev-version',

        configureServer(server) {
            // ── On start: capture base version and apply first dev suffix ──────
            const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
            const current = readVersion(content);
            if (current) {
                originalVersion = baseVersion(current);
                bumpDevVersion();
                console.log(`[userscript] Dev mode: base version = ${originalVersion}`);
            }

            // ── On file change: bump suffix (skip our own writes) ──────────────
            server.watcher.on('change', (file) => {
                const normalised = path.normalize(file);
                if (normalised !== SCRIPT_PATH) return;
                if (selfWrites.has(SCRIPT_PATH)) return;  // skip self-triggered event
                bumpDevVersion();
            });

            // ── On server close: restore clean version ─────────────────────────
            const doRestore = () => restoreVersion();
            server.httpServer?.once('close', doRestore);

            // Catch Ctrl-C / kill signals
            for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
                process.once(sig, () => { doRestore(); process.exit(); });
            }

            // Also serve script.js raw with full no-cache headers
            server.middlewares.use('/script.js', (_req, res) => {
                const raw = fs.readFileSync(SCRIPT_PATH, 'utf-8');
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.end(raw);
            });
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig({
    plugins: [
        basicSsl(),
        userscriptDevVersion(),
    ],

    root: ROOT,

    server: {
        port: 8443,
        strictPort: true,
        https: true,
        hmr: false,
        watch: {
            include: [SCRIPT_PATH],
        },
    },

    build: { outDir: 'dist' },
});
