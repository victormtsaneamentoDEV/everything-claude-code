#!/usr/bin/env node
/**
 * Tool-use guards for Claude Code hooks.
 *
 * Claude Code hook matchers only match the tool name (e.g. "Bash", "Edit|Write"),
 * so filtering by command or file path happens here, on the JSON received on stdin.
 *
 * Usage: node guards.js <check>
 * Exit code 2 blocks the tool call (PreToolUse); stderr is shown to Claude.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const check = process.argv[2];

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

const input = readInput();
const toolInput = input.tool_input || {};
const cmd = toolInput.command || '';
const filePath = toolInput.file_path || '';

const checks = {
  // PreToolUse / Bash
  'dev-server'() {
    if (/(npm run dev|pnpm( run)? dev|yarn dev|bun run dev)/.test(cmd) && !process.env.TMUX) {
      console.error('[Hook] BLOCKED: Dev server must run in tmux for log access');
      console.error('[Hook] Use: tmux new-session -d -s dev "npm run dev"');
      console.error('[Hook] Then: tmux attach -t dev');
      process.exit(2);
    }
  },

  // PreToolUse / Bash
  'tmux-reminder'() {
    if (
      /(npm (install|test)|pnpm (install|test)|yarn( (install|test))?\b|bun (install|test)|cargo build|\bmake\b|docker|pytest|vitest|playwright)/.test(cmd) &&
      !process.env.TMUX
    ) {
      console.error('[Hook] Consider running in tmux for session persistence');
      console.error('[Hook] tmux new -s dev  |  tmux attach -t dev');
    }
  },

  // PreToolUse / Bash
  'git-push'() {
    if (/git push/.test(cmd)) {
      console.error('[Hook] Review changes before push...');
    }
  },

  // PreToolUse / Write
  'random-md'() {
    if (/\.(md|txt)$/.test(filePath) && !/(README|CLAUDE|AGENTS|CONTRIBUTING)\.md$/.test(filePath)) {
      console.error('[Hook] BLOCKED: Unnecessary documentation file creation');
      console.error('[Hook] File: ' + filePath);
      console.error('[Hook] Use README.md for documentation instead');
      process.exit(2);
    }
  },

  // PostToolUse / Bash
  'pr-created'() {
    if (!/gh pr create/.test(cmd)) return;
    const resp = input.tool_response || {};
    const out = typeof resp === 'string' ? resp : [resp.stdout, resp.output].filter(Boolean).join('\n');
    const m = out.match(/https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
    if (m) {
      console.error('[Hook] PR created: ' + m[0]);
      console.error('[Hook] To review: gh pr review ' + m[2] + ' --repo ' + m[1]);
    }
  },

  // PostToolUse / Edit|Write
  'prettier'() {
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath) || !fs.existsSync(filePath)) return;
    try {
      execSync('npx --no-install prettier --write "' + filePath + '"', { stdio: 'pipe', timeout: 30000 });
    } catch {}
  },

  // PostToolUse / Edit|Write
  'typecheck'() {
    if (!/\.(ts|tsx)$/.test(filePath) || !fs.existsSync(filePath)) return;
    let dir = path.dirname(filePath);
    while (dir !== path.dirname(dir) && !fs.existsSync(path.join(dir, 'tsconfig.json'))) dir = path.dirname(dir);
    if (!fs.existsSync(path.join(dir, 'tsconfig.json'))) return;
    let out = '';
    try {
      out = execSync('npx --no-install tsc --noEmit --pretty false', { cwd: dir, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
    } catch (e) {
      out = (e.stdout || '') + (e.stderr || '');
    }
    const lines = out.split('\n').filter((l) => l.includes(path.basename(filePath))).slice(0, 10);
    if (lines.length) console.error(lines.join('\n'));
  },

  // PostToolUse / Edit|Write
  'console-log'() {
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath) || !fs.existsSync(filePath)) return;
    const matches = [];
    fs.readFileSync(filePath, 'utf8').split('\n').forEach((l, i) => {
      if (/console\.log/.test(l)) matches.push(i + 1 + ': ' + l.trim());
    });
    if (matches.length) {
      console.error('[Hook] WARNING: console.log found in ' + filePath);
      matches.slice(0, 5).forEach((m) => console.error(m));
      console.error('[Hook] Remove console.log before committing');
    }
  },

  // Stop
  'stop-console-log'() {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      const files = execSync('git diff --name-only HEAD', { encoding: 'utf8', stdio: 'pipe' })
        .split('\n')
        .filter((f) => /\.(ts|tsx|js|jsx)$/.test(f) && fs.existsSync(f));
      let found = false;
      for (const f of files) {
        if (fs.readFileSync(f, 'utf8').includes('console.log')) {
          console.error('[Hook] WARNING: console.log found in ' + f);
          found = true;
        }
      }
      if (found) console.error('[Hook] Remove console.log statements before committing');
    } catch {}
  },
};

if (checks[check]) checks[check]();
process.exit(0);
