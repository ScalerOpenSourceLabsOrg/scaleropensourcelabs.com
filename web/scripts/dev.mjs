// `npm run dev`: next dev, plus the Firebase emulator when .env.local points at one.
//
// WHY THIS EXISTS. With NEXT_PUBLIC_FIRESTORE_EMULATOR set, the site talks to a local
// Auth + Firestore on 9099/8080 and to nothing else. Nothing used to start that process,
// so a closed terminal or a reboot left the site up and the database gone: sign-in
// refused on 9099, or — worse, because the browser keeps its cached session — a
// dashboard showing your name above "Could not load your details". Now one command
// brings up both, in order.
//
// AND IT REMEMBERS. The emulator keeps everything in memory, so even a correct restart
// used to wipe every account and profile and send you back through onboarding. It now
// imports on start and exports on exit (Ctrl+C) to a folder OUTSIDE the repo — on the
// maintainers' machine files under the repo path get deleted by antivirus, and emulator
// dumps have no business in git anyway. Override with OSC_EMULATOR_DATA.
//
// Without the env var this is exactly `next dev`; contributors who never touch Firebase
// see no difference. If the emulator is already up (another terminal, an e2e run) it is
// reused, not started twice — a second copy fails with port errors that look unrelated.
// Arguments pass through: `npm run dev -- -p 3001`.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { connect } from "node:net";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(web, "..");
const args = process.argv.slice(2);
const win = process.platform === "win32";
// Paths go through cmd.exe on Windows (see run), so they need quoting there only.
const q = (p) => (win ? `"${p}"` : p);

function envLocal(name) {
  if (process.env[name] !== undefined) return process.env[name];
  try {
    const line = readFileSync(join(web, ".env.local"), "utf8")
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith(`${name}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

function open(port) {
  return new Promise((done) => {
    const s = connect({ host: "127.0.0.1", port });
    s.once("connect", () => (s.destroy(), done(true)));
    s.once("error", () => done(false));
  });
}

const children = [];
let interrupted = false;
// Set once this script starts the emulator: where to save before stopping it.
let save = null;

// child.kill() on Windows ends only the cmd.exe wrapper; java and next live on as
// orphans holding the ports. taskkill /T takes the whole tree.
function stop(child) {
  if (win) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGINT");
}

function run(cmd, cmdArgs, cwd) {
  // shell on Windows so npx/next resolve to their .cmd shims.
  const child = spawn(cmd, cmdArgs, { cwd, stdio: "inherit", shell: win });
  children.push(child);
  // Either one dying takes the other with it: a site without its database is the
  // exact state this script exists to prevent. Not after Ctrl+C, though — then every
  // process got the signal already, and the emulator is busy writing its export.
  child.on("exit", (code) => {
    process.exitCode = code ?? 0;
    if (interrupted) return;
    for (const c of children) {
      if (c === child || c.exitCode !== null) continue;
      // A forced stop skips --export-on-exit, so export explicitly first.
      if (save && c === children[0]) {
        spawnSync("npx", ["--yes", "firebase-tools", "emulators:export", q(save.dir), "--project", save.project, "--force"], {
          cwd: root,
          stdio: "ignore",
          shell: win,
        });
      }
      stop(c);
    }
  });
  return child;
}

// Ctrl+C reaches every process in the console on its own; the emulator needs that
// signal (not a kill) to write its export, so this process just waits for them.
process.on("SIGINT", () => {
  interrupted = true;
});

const emulator = envLocal("NEXT_PUBLIC_FIRESTORE_EMULATOR");
if (emulator) {
  const fsPort = Number(emulator.split(":")[1]) || 8080;
  if ((await open(fsPort)) && (await open(9099))) {
    console.log("[dev] Firebase emulator already running — reusing it.");
  } else {
    const project = envLocal("NEXT_PUBLIC_FIREBASE_PROJECT_ID") || "demo-osc";
    const base = process.env.LOCALAPPDATA || join(homedir(), ".cache");
    const data = process.env.OSC_EMULATOR_DATA || join(base, "osc-dev", "emulator-data");
    mkdirSync(data, { recursive: true });
    const flags = ["--only", "auth,firestore", "--project", project, "--export-on-exit", q(data)];
    // --import refuses a folder with no export in it, i.e. the very first run.
    if (existsSync(join(data, "firebase-export-metadata.json"))) flags.push("--import", q(data));
    console.log(`[dev] Starting Firebase emulator (data kept in ${data})…`);
    run("npx", ["--yes", "firebase-tools", "emulators:start", ...flags], root);
    save = { dir: data, project };

    // A first launch downloads the JARs, which can take a minute or two.
    const deadline = Date.now() + 180_000;
    while (!((await open(fsPort)) && (await open(9099)))) {
      if (children[0].exitCode !== null) process.exit(children[0].exitCode || 1);
      if (Date.now() > deadline) {
        console.error("[dev] Emulator did not come up in 3 minutes. Is Java installed?");
        stop(children[0]);
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

run("npx", ["next", "dev", ...args], web);
