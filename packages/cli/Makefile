.PHONY: help build dev typecheck lint clean install uninstall link unlink

CLI_NAME := kami
DIST_DIR := dist
SRC_DIR := src
BIN_PATH := /usr/local/bin/$(CLI_NAME)

help:
	@echo ""
	@echo "  Kami Sama CLI"
	@echo "  ─────────────────────────────────────"
	@echo ""
	@echo "  Targets:"
	@echo "    build        Build the CLI for production"
	@echo "    dev          Run in development mode"
	@echo "    typecheck    Run TypeScript type checking"
	@echo "    lint         Run ESLint"
	@echo "    install      Build & symlink to $(BIN_PATH)"
	@echo "    uninstall    Remove the symlink from $(BIN_PATH)"
	@echo "    clean        Remove build artifacts"
	@echo ""
	@echo "  Usage after install:"
	@echo "    kami --help"
	@echo "    kami auth login"
	@echo "    kami catalog anime list"
	@echo ""

# ── Build ────────────────────────────────────────────────

build: $(DIST_DIR)/cli.js

$(DIST_DIR)/cli.js: $(shell find $(SRC_DIR) -name '*.ts' 2>/dev/null)
	npx tsup $(SRC_DIR)/cli.ts --format esm --clean

# ── Development ──────────────────────────────────────────

dev:
	npx tsx $(SRC_DIR)/cli.ts

# ── Quality ──────────────────────────────────────────────

typecheck:
	npx tsc --noEmit

lint:
	npx eslint $(SRC_DIR)/

# ── Install / Uninstall ─────────────────────────────────

install: build
	@echo "Installing $(CLI_NAME) → $(BIN_PATH)"
	@sudo ln -sf $(CURDIR)/$(DIST_DIR)/cli.js $(BIN_PATH)
	@sudo chmod +x $(CURDIR)/$(DIST_DIR)/cli.js
	@echo "✔ Installed. Run '$(CLI_NAME) --help' to verify."

uninstall:
	@echo "Removing $(BIN_PATH)"
	@sudo rm -f $(BIN_PATH)
	@echo "✔ Removed."

link: build
	@echo "Creating symlink without sudo..."
	@mkdir -p $(HOME)/.local/bin
	@ln -sf $(CURDIR)/$(DIST_DIR)/cli.js $(HOME)/.local/bin/$(CLI_NAME)
	@chmod +x $(CURDIR)/$(DIST_DIR)/cli.js
	@echo "✔ Symlinked to ~/.local/bin/$(CLI_NAME)"
	@echo "  Make sure ~/.local/bin is in your PATH:"
	@echo '  export PATH="$$HOME/.local/bin:$$PATH"'

unlink:
	@rm -f $(HOME)/.local/bin/$(CLI_NAME)
	@echo "✔ Removed ~/.local/bin/$(CLI_NAME)"

# ── Cleanup ──────────────────────────────────────────────

clean:
	rm -rf $(DIST_DIR)
