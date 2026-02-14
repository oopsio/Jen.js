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

import os
import json

SITE_DIR = "site"

def generate_routes():
    print("Generating routes...")
    routes = []
    for root, dirs, files in os.walk(SITE_DIR):
        for file in files:
            if file.endswith(".html") or file.endswith(".tsx") or file.endswith(".jsx"):
                path = os.path.relpath(os.path.join(root, file), SITE_DIR)
                routes.append("/" + path.replace("\\", "/"))
    with open("routes.json", "w") as f:
        json.dump(routes, f, indent=2)
    print(f"Generated {len(routes)} routes → routes.json")
