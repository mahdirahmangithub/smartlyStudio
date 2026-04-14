const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "../icons/icons.ts");
const OUT = path.resolve(__dirname, "../src/components/Icon/iconData.ts");

let content = fs.readFileSync(SRC, "utf-8");

// 1. Fix multiline descriptions (newlines inside "..." strings)
content = content.replace(/description:\s*"([^"]*)"/gs, (match) =>
  match.replace(/\n+/g, " ").replace(/\s{2,}/g, " ")
);

// 2. Deduplicate keys — suffix second occurrence
const lines = content.split("\n");
const seen = new Set();
const entryRegex = /^(\s+)"([^"]+)":\s*\{$/;

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(entryRegex);
  if (!m) continue;

  const name = m[2];
  if (!seen.has(name)) {
    seen.add(name);
    continue;
  }

  // Find category within next few lines
  let category = "";
  for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
    const cm = lines[j].match(/category:\s*"([^"]+)"/);
    if (cm) {
      category = cm[1];
      break;
    }
  }

  const suffix = category === "logo-color" ? "_color" : "_alt";
  lines[i] = lines[i].replace(`"${name}"`, `"${name}${suffix}"`);
}

content = lines.join("\n");

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, content);

// Count entries
const keyCount = (content.match(/^\s+"[^"]+": \{$/gm) || []).length;
console.log(`Generated iconData.ts with ${keyCount} icons.`);
