/**
 * Convert Cursor MCP config (`mcpServers`) to VS Code / Copilot `mcp.json` shape (`servers`).
 * @see https://code.visualstudio.com/docs/copilot/reference/mcp-configuration
 */

function isNonEmptyObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length > 0;
}

/**
 * VS Code recommends camelCase server ids.
 */
export function toServerId(name) {
  const trimmed = String(name).trim();
  if (!trimmed) return "server";
  const parts = trimmed.split(/[\s_-]+/).filter(Boolean);
  const camel = parts
    .map((p, i) => (i === 0 ? p[0].toLowerCase() + p.slice(1) : p[0].toUpperCase() + p.slice(1)))
    .join("");
  return camel.replace(/[^a-zA-Z0-9]/g, "") || "server";
}

/**
 * Rewrite common Cursor-specific env for VS Code + Snyk MCP.
 */
export function patchEnvForVsCode(env, options) {
  if (!env || typeof env !== "object") return env;
  const next = { ...env };
  if (options.fixSnykIde && next.IDE_CONFIG_PATH === "Cursor") {
    next.IDE_CONFIG_PATH = "VSCode";
  }
  return next;
}

/**
 * @param {Record<string, unknown>} cursorServer
 * @param {{ fixSnykIde?: boolean }} options
 * @returns {Record<string, unknown>}
 */
export function convertServerConfig(cursorServer, options = {}) {
  if (!cursorServer || typeof cursorServer !== "object") {
    throw new Error("Invalid server config");
  }

  const hasCommand = typeof cursorServer.command === "string" && cursorServer.command.length > 0;
  const url = typeof cursorServer.url === "string" ? cursorServer.url : undefined;

  if (hasCommand) {
    const out = {
      type: "stdio",
      command: cursorServer.command,
    };
    if (Array.isArray(cursorServer.args)) {
      out.args = cursorServer.args;
    }
    if (isNonEmptyObject(cursorServer.env)) {
      out.env = patchEnvForVsCode(cursorServer.env, options);
    }
    if (typeof cursorServer.envFile === "string") {
      out.envFile = cursorServer.envFile;
    }
    return out;
  }

  if (url) {
    const out = {
      type: "http",
      url,
    };
    if (isNonEmptyObject(cursorServer.headers)) {
      out.headers = cursorServer.headers;
    }
    return out;
  }

  throw new Error(
    "Server must define either `command` (stdio) or `url` (remote). Unsupported Cursor entry."
  );
}

/**
 * @param {unknown} cursorJson
 * @param {{ sanitizeNames?: boolean, fixSnykIde?: boolean }} options
 */
export function convertCursorMcpToVsCode(cursorJson, options = {}) {
  if (!cursorJson || typeof cursorJson !== "object") {
    throw new Error("Invalid JSON: expected an object");
  }

  const mcpServers = cursorJson.mcpServers;
  if (!mcpServers || typeof mcpServers !== "object" || Array.isArray(mcpServers)) {
    throw new Error('Invalid Cursor config: missing top-level "mcpServers" object');
  }

  const sanitizeNames = options.sanitizeNames !== false;

  const servers = {};
  const nameMap = [];

  for (const [name, cfg] of Object.entries(mcpServers)) {
    const id = sanitizeNames ? toServerId(name) : name;
    if (servers[id]) {
      let n = 2;
      let unique = `${id}${n}`;
      while (servers[unique]) {
        n += 1;
        unique = `${id}${n}`;
      }
      servers[unique] = convertServerConfig(cfg, options);
      nameMap.push({ cursor: name, vscode: unique });
    } else {
      servers[id] = convertServerConfig(cfg, options);
      nameMap.push({ cursor: name, vscode: id });
    }
  }

  const inputs = Array.isArray(cursorJson.inputs) ? cursorJson.inputs : undefined;
  const out = { servers };
  if (inputs) {
    out.inputs = inputs;
  }

  return { mcp: out, nameMap };
}
