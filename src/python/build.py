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
import shutil

def build_site(minify=False):
    print("Building site...")
    # Example: copy assets
    src_dir = "site"
    dist_dir = "dist"
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    shutil.copytree(src_dir, dist_dir)
    print(f"Copied {src_dir} → {dist_dir}")

    if minify:
        print("Minifying assets...")
        # Placeholder: you can integrate image/font minifiers here
    print("Build complete.")
