---
name: investigate
description: Explore codebase and answer questions without making changes
---

# Investigate

Research the following question: $ARGUMENTS

## Process

1. **Search** — Use Glob and Grep to find relevant files
2. **Read** — Read key files to understand the pattern or behavior
3. **Trace** — Follow data flow end-to-end (types → logic → UI)
4. **Summarize** — Report findings with specific file paths and line numbers

## Rules

- **Read-only**: Do NOT edit any files
- **Be specific**: Reference `file.ts:42` not "somewhere in the auth module"
- **Show evidence**: Include relevant code snippets in your summary
- **Answer the question**: Stay focused on what was asked, don't explore tangents
