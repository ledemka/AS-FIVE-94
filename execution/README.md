# Execution Scripts

This directory contains **deterministic Python scripts** that handle the actual work.

## Principles
- Scripts must be **deterministic** — same input always produces same output
- Use environment variables from `../.env` for API keys and config
- Output intermediate files to `../.tmp/`
- Comment thoroughly — another developer (or AI) should understand every step
- Handle errors gracefully with clear error messages

## Standards
- Use `python-dotenv` to load environment variables
- Use `argparse` for CLI arguments when applicable
- Include a `if __name__ == "__main__":` block
- Log progress to stdout for orchestration visibility

## Naming Convention
Use descriptive snake_case names: `scrape_single_site.py`, `generate_report.py`, etc.
