#!/usr/bin/env python3
import argparse
from build import build_site
from db import migrate_db, seed_db
from routes import generate_routes
from plugins import run_plugins

parser = argparse.ArgumentParser(description="Framework helper CLI")

subparsers = parser.add_subparsers(dest="command")

# Build site
parser_build = subparsers.add_parser("build", help="Build the site")
parser_build.add_argument("--minify", action="store_true", help="Minify assets")

# Database commands
parser_db = subparsers.add_parser("db", help="Database commands")
parser_db.add_argument("action", choices=["migrate", "seed"], help="DB action")

# Routes
parser_routes = subparsers.add_parser("routes", help="Generate routes")

# Plugins
parser_plugins = subparsers.add_parser("plugins", help="Run Python-side plugins")

args = parser.parse_args()

if args.command == "build":
    build_site(minify=args.minify)
elif args.command == "db":
    if args.action == "migrate":
        migrate_db()
    elif args.action == "seed":
        seed_db()
elif args.command == "routes":
    generate_routes()
elif args.command == "plugins":
    run_plugins()
else:
    parser.print_help()
