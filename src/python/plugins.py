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

import importlib.util
import os

PLUGIN_DIR = "src/plugin/plugins"

def run_plugins():
    print("Running Python-side plugins...")
    for file in os.listdir(PLUGIN_DIR):
        if file.endswith(".py"):
            path = os.path.join(PLUGIN_DIR, file)
            spec = importlib.util.spec_from_file_location("plugin", path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            if hasattr(module, "on_build"):
                module.on_build()
    print("Plugins executed.")
