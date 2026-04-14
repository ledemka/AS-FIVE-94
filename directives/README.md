# Directives

This directory contains **Standard Operating Procedures (SOPs)** written in Markdown.

Each directive defines:
- **Goal** — What the task accomplishes
- **Inputs** — What data/context is needed
- **Tools/Scripts** — Which `execution/` scripts to use
- **Outputs** — Expected deliverables
- **Edge Cases** — Known gotchas, API limits, error handling

## Rules
- Directives are **living documents** — update them as you learn
- Never delete a directive without asking the user
- Write them like instructions for a mid-level employee
- Reference execution scripts by relative path (e.g., `../execution/script.py`)

## Naming Convention
Use descriptive kebab-case names: `build-sports-app.md`, `scrape-website.md`, etc.
