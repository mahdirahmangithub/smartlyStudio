export interface SyntaxToken {
  type:
    | "keyword"
    | "string"
    | "comment"
    | "number"
    | "operator"
    | "punctuation"
    | "function"
    | "template"
    | "interpolation"
    | "plain";
  value: string;
}

const JS_KEYWORDS = new Set([
  "abstract", "arguments", "async", "await", "boolean", "break", "byte",
  "case", "catch", "char", "class", "const", "continue", "debugger",
  "default", "delete", "do", "double", "else", "enum", "export", "extends",
  "false", "final", "finally", "float", "for", "from", "function", "goto",
  "if", "implements", "import", "in", "instanceof", "int", "interface",
  "let", "long", "native", "new", "null", "of", "package", "private",
  "protected", "public", "return", "short", "static", "super", "switch",
  "synchronized", "this", "throw", "throws", "transient", "true", "try",
  "typeof", "undefined", "var", "void", "volatile", "while", "with",
  "yield",
]);

/**
 * Lightweight regex-based syntax tokenizer.
 * Tokenizes a single line of code (no cross-line state).
 */
export function tokenizeLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;

  while (i < line.length) {
    // Single-line comment
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ type: "comment", value: line.slice(i) });
      return tokens;
    }

    // Template literal (backtick)
    if (line[i] === "`") {
      const start = i;
      i++;
      while (i < line.length && line[i] !== "`") {
        if (line[i] === "$" && line[i + 1] === "{") {
          if (i > start + 1) {
            tokens.push({ type: "template", value: line.slice(start, i) });
          }
          const interpStart = i;
          let depth = 1;
          i += 2;
          while (i < line.length && depth > 0) {
            if (line[i] === "{") depth++;
            else if (line[i] === "}") depth--;
            if (depth > 0) i++;
          }
          i++;
          tokens.push({ type: "interpolation", value: line.slice(interpStart, i) });
          continue;
        }
        if (line[i] === "\\") i++;
        i++;
      }
      if (i < line.length) i++;
      tokens.push({ type: "template", value: line.slice(start, i) });
      continue;
    }

    // String (single or double quote)
    if (line[i] === "'" || line[i] === '"') {
      const quote = line[i];
      const start = i;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === "\\") i++;
        i++;
      }
      if (i < line.length) i++;
      tokens.push({ type: "string", value: line.slice(start, i) });
      continue;
    }

    // Number
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      const start = i;
      while (i < line.length && /[\d.xXa-fA-FeEbBoO_]/.test(line[i])) i++;
      tokens.push({ type: "number", value: line.slice(start, i) });
      continue;
    }

    // Word (keyword, function call, or plain identifier)
    if (/[a-zA-Z_$]/.test(line[i])) {
      const start = i;
      while (i < line.length && /[\w$]/.test(line[i])) i++;
      const word = line.slice(start, i);

      if (JS_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (i < line.length && line[i] === "(") {
        tokens.push({ type: "function", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      continue;
    }

    // Operator
    if (/[=+\-*/<>!&|^~?:%]/.test(line[i])) {
      const start = i;
      while (i < line.length && /[=+\-*/<>!&|^~?:%]/.test(line[i])) i++;
      tokens.push({ type: "operator", value: line.slice(start, i) });
      continue;
    }

    // Punctuation
    if (/[{}()\[\];,.]/.test(line[i])) {
      tokens.push({ type: "punctuation", value: line[i] });
      i++;
      continue;
    }

    // Whitespace and anything else — accumulate as plain
    const start = i;
    while (
      i < line.length &&
      !/[a-zA-Z_$\d"'`/=+\-*<>!&|^~?:%{}()\[\];,.]/.test(line[i])
    ) {
      i++;
    }
    tokens.push({ type: "plain", value: line.slice(start, i) });
  }

  return tokens;
}
