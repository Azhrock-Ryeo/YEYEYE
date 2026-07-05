const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { execSync } = require("child_process");

const SRC_BASE = path.join("frontend", "src");
const MOD_BASE = path.join(SRC_BASE, "module");

const R = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

const [,, cmd, arg1] = process.argv;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function fetchFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetchFile(res.headers.location, dest).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const out = fs.createWriteStream(dest);
      res.pipe(out)
      out.on("finish", resolve)
      out.on("error", reject)
    }).on("error", reject)
  })
}

function readManifest(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function getInstalledModules() {
  if (!fs.existsSync(MOD_BASE)) return []
  return fs.readdirSync(MOD_BASE)
    .map(name => path.join(MOD_BASE, name, "pavillion.module.json"))
    .filter(f => fs.existsSync(f))
    .map(f => readManifest(f))
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function cmdInstall(manifestUrl) {
  if (!manifestUrl) {
    console.log(`${RED}[ppm] ERROR: No URL provided.${R}`)
    console.log("Usage: node ppm.js install <raw-github-url-to-pavillion.module.json>")
    process.exit(1)
  }

  console.log(`${CYAN}[ppm] Fetching manifest...${R}`)
  let manifest
  try {
    const raw = await fetchUrl(manifestUrl)
    manifest = JSON.parse(raw)
  } catch (e) {
    console.log(`${RED}[ppm] ERROR: Failed to fetch or parse manifest.\n  ${e.message}${R}`)
    process.exit(1)
  }

  const { module_name, module_id, version, uses = [] } = manifest

  // Derive base URL: strip /module/<ModuleName>/pavillion.module.json
  const baseUrl = manifestUrl
    .replace(/\/pavillion\.module\.json$/, "")
    .replace(/\/[^/]+$/, "")
    .replace(/\/[^/]+$/, "")

  console.log(`${CYAN}[ppm] Installing: ${BOLD}${module_name}${R} ${CYAN}(v${version})${R}`)
  console.log(`${CYAN}[ppm] Scopes: ${uses.join(", ")}${R}`)

  let allOk = true

  for (const scope of uses) {
    const isComponent = scope === "components";
    const files = isComponent ? ["README.md", "types.ts", "style.css", "index.tsx"] : ["README.md", "types.ts", "index.ts"]
    const destDir = path.join(SRC_BASE, scope, module_name)
    ensureDir(destDir)

    for (const file of files) {
      const url = `${baseUrl}/${scope}/${module_name}/${file}`
      const dest = path.join(destDir, file)
      try {
        await fetchFile(url, dest)
        console.log(`${GREEN}[ppm] + ${scope}/${module_name}/${file}${R}`)
      } catch {
        console.log(`${YELLOW}[ppm] WARN: Could not fetch ${scope}/${module_name}/${file}${R}`)
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
        allOk = false
      }
    }
  }

  const modDir = path.join(MOD_BASE, module_name)
  ensureDir(modDir)
  fs.writeFileSync(path.join(modDir, "pavillion.module.json"), JSON.stringify(manifest, null, 2))
  console.log(`${GREEN}[ppm] Manifest saved → ${modDir}${path.sep}pavillion.module.json${R}`)

  if (allOk) {
    console.log(`${GREEN}[ppm] ${module_name} installed successfully.${R}`)
  } else {
    console.log(`${YELLOW}[ppm] ${module_name} installed with warnings. Some files may be missing.${R}`)
  }
}

function cmdList() {
  const modules = getInstalledModules()
  console.log()
  console.log(`${BOLD}${CYAN}  PPM MODULE LIST${R}`)
  console.log(`  ${CYAN}--------------------------------------------${R}`)
  if (modules.length === 0) {
    console.log(`${YELLOW}  No modules installed.${R}`)
  } else {
    for (const m of modules) {
      console.log(`  ${GREEN}${m.module_id} | ${m.module_name} | v${m.version}${R}`)
    }
  }
  console.log(`  ${CYAN}--------------------------------------------${R}`)
  console.log()
}

function cmdStatus() {
  const modules = getInstalledModules()
  const installedNames = new Set(modules.map(m => m.module_name))

  console.log()
  console.log(`${BOLD}${CYAN}  PPM STATUS${R}`)
  console.log(`  ${CYAN}--------------------------------------------${R}`)

  if (modules.length === 0) {
    console.log(`${YELLOW}  No modules installed.${R}`)
  } else {
    for (const m of modules) {
      const missing = (m.depends_on || []).filter(dep => !installedNames.has(dep))
      if (missing.length === 0) console.log(`  ${GREEN}${m.module_id}  ${m.module_name}  v${m.version}  GOOD${R}`)
      else console.log(`  ${YELLOW}${m.module_id}  ${m.module_name}  v${m.version}  MISSING DEPENDENCIES: ${missing.join(", ")}${R}`)
    }
  }

  console.log(`  ${CYAN}--------------------------------------------${R}`)
  console.log()
}

function cmdStatusModule() {
  const modules = getInstalledModules()

  console.log()
  console.log(`${BOLD}${CYAN}  PPM MODULE INTEGRITY CHECK${R}`)
  console.log(`  ${CYAN}--------------------------------------------${R}`)

  if (modules.length === 0) console.log(`${YELLOW}  No modules installed.${R}`);
  else {
    for (const m of modules) {
      const missing = []
      for (const scope of (m.uses || [])) {
        const scopeDir = path.join(SRC_BASE, scope, m.module_name)
        if (!fs.existsSync(scopeDir)) {
          missing.push(`${scope}/${m.module_name} (folder missing)`)
          continue
        }
        const expected = scope === "components" ? ["README.md", "types.ts", "style.css", "index.tsx"] : ["README.md", "types.ts", "index.ts"]
        for (const file of expected)
          if (!fs.existsSync(path.join(scopeDir, file))) missing.push(`${scope}/${m.module_name}/${file}`)
      }

      if (missing.length === 0) {
        console.log(`  ${GREEN}${m.module_id}  ${m.module_name}  OK${R}`)
      } else {
        console.log(`  ${RED}${m.module_id}  ${m.module_name}  MISSING:${R}`)
        for (const f of missing) {
          console.log(`    ${RED}− ${f}${R}`)
        }
      }
    }
  }

  console.log(`  ${CYAN}--------------------------------------------${R}`)
  console.log()
}

function cmdHelp() {
  console.log()
  console.log(`${BOLD}${CYAN}  PPM — Pavillion Package Manager${R}`)
  console.log(`  ${CYAN}--------------------------------------------${R}`)
  console.log()
  console.log(`  ${BOLD}node ppm.js install <url>${R}`)
  console.log(`    Install a module from a raw GitHub pavillion.module.json URL.`)
  console.log()
  console.log(`  ${BOLD}node ppm.js list${R}`)
  console.log(`    List all installed modules (ID, Name, Version).`)
  console.log()
  console.log(`  ${BOLD}node ppm.js status${R}`)
  console.log(`    Check dependency health of all installed modules.`)
  console.log()
  console.log(`  ${BOLD}node ppm.js status module${R}`)
  console.log(`    Check file integrity of all installed modules.`)
  console.log()
  console.log(`  ${CYAN}--------------------------------------------${R}`)
  console.log()
}

switch (cmd) {
  case "install": cmdInstall(arg1); break
  case "list":    cmdList();        break
  case "status":
    if (arg1 === "module") cmdStatusModule()
    else cmdStatus()
    break
  default: cmdHelp()
}