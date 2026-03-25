# cursor-rules-to-claude

Converts **Cursor** `.cursor/rules` (`*.mdc`) into:

- **`CLAUDE.md`** — merged “always apply” rules at the repo root
- **`.claude/rules/*.md`** — scoped rules (with path hints in a leading comment)

## Usage

```bash
npx cursor-rules-to-claude --help
```

MIT.
