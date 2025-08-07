# Default target: show available commands
default:
	@just --list

# ──────────────────────────────────────────────
# Core workflow
# ──────────────────────────────────────────────

# Install/refresh dependencies (generates package-lock.json if missing)
install:
	@npm install

# Type-check & compile TypeScript → dist/
build: install
	@npm run build

# Remove build artefacts & deps
clean:
	@rm -rf node_modules dist public/cards

# Drop into the Nix dev shell (needs `nix` installed)
devshell:
	@nix develop

# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

# Serve the generated cards locally
preview: build
	@vercel dev --listen 3000

# Generate each card individually (must have run `just build` first)
language-card: build
	@node dist/language-card.js

contrib-card: build
	@node dist/contrib-card.js

lastcommit-card: build
	@node dist/lastcommit-card.js

commit-history-card: build
	@node dist/commit-history-card.js

all-cards: build
	@node dist/commit-history-card.js
	@node dist/lastcommit-card.js
	@node dist/contrib-card.js
	@node dist/language-card.js
