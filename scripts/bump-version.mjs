// Sets one version across every file that carries it:
//   node scripts/bump-version.mjs 2.1.0
//   node scripts/bump-version.mjs patch|minor|major
// Prints the new version on stdout so CI can read it.
import { readFileSync, writeFileSync } from "node:fs";

const files = {
  pkg: "package.json",
  lock: "package-lock.json",
  tauri: "src-tauri/tauri.conf.json",
  cargo: "src-tauri/Cargo.toml",
  cargoLock: "src-tauri/Cargo.lock",
};

const arg = process.argv[2];
if (!arg) {
  console.error("usage: bump-version.mjs <x.y.z | patch | minor | major>");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(files.pkg, "utf8"));
const [maj, min, pat] = pkg.version.split(".").map(Number);
const next =
  arg === "major" ? `${maj + 1}.0.0`
  : arg === "minor" ? `${maj}.${min + 1}.0`
  : arg === "patch" ? `${maj}.${min}.${pat + 1}`
  : arg.replace(/^v/, "");

if (!/^\d+\.\d+\.\d+$/.test(next)) {
  console.error(`not a version: ${arg}`);
  process.exit(1);
}

const editJson = (path, fn) => {
  const data = JSON.parse(readFileSync(path, "utf8"));
  fn(data);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
};

editJson(files.pkg, (d) => { d.version = next; });
editJson(files.lock, (d) => {
  d.version = next;
  if (d.packages?.[""]) d.packages[""].version = next;
});
editJson(files.tauri, (d) => { d.version = next; });

// Only the [package] version line, never a dependency's.
const cargo = readFileSync(files.cargo, "utf8");
writeFileSync(files.cargo, cargo.replace(/^(\[package\][\s\S]*?^version = ")[^"]+(")/m, `$1${next}$2`));

const lock = readFileSync(files.cargoLock, "utf8");
writeFileSync(files.cargoLock, lock.replace(/(name = "sajda"\r?\nversion = ")[^"]+(")/, `$1${next}$2`));

console.log(next);
