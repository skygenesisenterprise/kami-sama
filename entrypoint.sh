#!/bin/sh
set -e

export PATH="/usr/local/go/bin:/go/bin:/root/go/bin:/root/.local/share/corepack:/root/.local/share/corepack/shims:/usr/local/bin:/usr/bin:/bin:${PATH}"
export NODE_ENV="${NODE_ENV:-development}"
export LOG_LEVEL="${LOG_LEVEL:-info}"
export PRISMA_SCHEMA_DEPLOY="${PRISMA_SCHEMA_DEPLOY:-true}"
export PRISMA_DB_PUSH="${PRISMA_DB_PUSH:-false}"
export ALLOW_MIGRATION_FAILURE="${ALLOW_MIGRATION_FAILURE:-true}"

# ── Logging ────────────────────────────────────────────────────────────────────

timestamp_utc() {
    date -u '+%Y-%m-%dT%H:%M:%SZ'
}

should_log() {
    requested_level="$1"

    case "${LOG_LEVEL:-info}" in
        debug)  return 0 ;;
        info)   [ "${requested_level}" != "debug" ] ;;
        warn)   [ "${requested_level}" = "warn" ] || [ "${requested_level}" = "error" ] ;;
        error)  [ "${requested_level}" = "error" ] ;;
        *)      return 0 ;;
    esac
}

log_debug() {
    if should_log debug; then
        echo "[DEBUG] $(timestamp_utc) - $1"
    fi
}

log_info() {
    if should_log info; then
        echo "[INFO] $(timestamp_utc) - $1"
    fi
}

log_warn() {
    if should_log warn; then
        echo "[WARN] $(timestamp_utc) - $1" >&2
    fi
}

log_error() {
    if should_log error; then
        echo "[ERROR] $(timestamp_utc) - $1" >&2
    fi
}

# ── Runtime defaults ──────────────────────────────────────────────────────────

configure_runtime() {
    export USE_EMBEDDED_DB="${USE_EMBEDDED_DB:-false}"
    export FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    export API_PORT="${API_PORT:-8080}"
    export SERVER_PORT="${SERVER_PORT:-${API_PORT}}"
    export GIN_MODE="${GIN_MODE:-debug}"
}

# ── Display ───────────────────────────────────────────────────────────────────

display_header() {
    echo ""
    echo "Kami-Sama development container"
    echo ""
    log_info "Node env: ${NODE_ENV}"
    log_info "Frontend: http://localhost:${FRONTEND_PORT}"
    log_info "API:      http://localhost:${API_PORT}"
    echo ""
}

# ── Helpers ───────────────────────────────────────────────────────────────────

setup_pnpm() {
    if command -v pnpm >/dev/null 2>&1; then
        return 0
    fi

    if command -v corepack >/dev/null 2>&1; then
        corepack enable >/dev/null 2>&1 || true
        corepack prepare pnpm@9.15.4 --activate >/dev/null 2>&1 || true
    fi

    if command -v pnpm >/dev/null 2>&1; then
        return 0
    fi

    log_warn "pnpm is not available; falling back to npx where possible"
}

find_prisma_dir() {
    for dir in /app/server/prisma ./server/prisma; do
        if [ -f "${dir}/schema.prisma" ]; then
            echo "${dir}"
            return 0
        fi
    done
    return 1
}

find_prisma_bin() {
    for bin in \
        /app/prisma/node_modules/.bin/prisma \
        /app/server/prisma/node_modules/.bin/prisma \
        ./node_modules/.bin/prisma \
        ./server/prisma/node_modules/.bin/prisma
    do
        if [ -x "${bin}" ]; then
            echo "${bin}"
            return 0
        fi
    done

    if command -v prisma >/dev/null 2>&1; then
        command -v prisma
        return 0
    fi

    if command -v npx >/dev/null 2>&1; then
        echo "npx prisma"
        return 0
    fi

    return 1
}

run_prisma_schema_deploy() {
    if [ "${PRISMA_SCHEMA_DEPLOY:-true}" != "true" ]; then
        log_info "Prisma schema deployment disabled"
        return 0
    fi

    prisma_dir="$(find_prisma_dir || true)"
    if [ -z "${prisma_dir}" ]; then
        log_warn "server/prisma/schema.prisma not found; skipping database schema setup"
        return 0
    fi

    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL is required to deploy the Prisma schema"
        return 1
    fi

    cd "${prisma_dir}"

    prisma_bin="$(find_prisma_bin || true)"
    if [ -z "${prisma_bin}" ] && [ -f package.json ] && command -v npm >/dev/null 2>&1; then
        log_info "Installing Prisma dependencies..."
        if [ -f package-lock.json ]; then
            npm ci --no-audit --no-fund || return 1
        else
            npm install --no-audit --no-fund || return 1
        fi
        prisma_bin="$(find_prisma_bin || true)"
    fi

    if [ -z "${prisma_bin}" ]; then
        log_error "Prisma CLI is not available"
        return 1
    fi

    log_info "Generating Prisma client..."
    # shellcheck disable=SC2086
    DATABASE_URL="${DATABASE_URL}" ${prisma_bin} generate

    if [ "${PRISMA_DB_PUSH:-false}" != "true" ]; then
        log_info "Prisma db push disabled; leaving database schema ownership to Go migrations"
        return 0
    fi

    log_info "Synchronizing Prisma schema..."
    # shellcheck disable=SC2086
    DATABASE_URL="${DATABASE_URL}" ${prisma_bin} db push --accept-data-loss
}

# ── Commands ──────────────────────────────────────────────────────────────────

run_server() {
    configure_runtime
    setup_pnpm

    log_info "Kami-Sama frontend starting"
    log_info "Frontend listening on 0.0.0.0:${FRONTEND_PORT}"

    if [ -d /app/apps ]; then
        cd /app/apps
    elif [ -d ./apps ]; then
        cd ./apps
    else
        log_error "Next.js app directory not found at /app/apps or ./apps"
        return 1
    fi
    rm -rf .next/cache 2>/dev/null || true

    if command -v pnpm >/dev/null 2>&1; then
        exec pnpm next dev -p "${FRONTEND_PORT}" -H 0.0.0.0 --turbopack "$@"
    fi

    if command -v npx >/dev/null 2>&1; then
        exec npx next dev -p "${FRONTEND_PORT}" -H 0.0.0.0 --turbopack "$@"
    fi

    log_error "Neither pnpm nor npx is available"
    return 1
}

run_air() {
    configure_runtime

    log_info "Kami-Sama API starting (hot-reload)"

    if ! run_prisma_schema_deploy; then
        if [ "${ALLOW_MIGRATION_FAILURE}" = "true" ]; then
            log_warn "Prisma schema deployment failed; continuing because ALLOW_MIGRATION_FAILURE=true"
        else
            log_error "Prisma schema deployment failed"
            return 1
        fi
    fi

    log_info "Starting air for Go hot-reload"
    cd /app
    exec air "$@"
}

# ── Entrypoint ────────────────────────────────────────────────────────────────

role="${1:-server}"

case "${role}" in
    server)
        shift || true
        run_server "$@"
        ;;
    air)
        shift || true
        run_air "$@"
        ;;
    *)
        configure_runtime
        display_header
        exec "$@"
        ;;
esac
