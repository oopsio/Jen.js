# This file is part of Jen.js.
# Copyright (C) 2026 oopsio
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

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
