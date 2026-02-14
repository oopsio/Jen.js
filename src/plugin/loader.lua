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

-- Plugin loader
-- Loads all plugins in src/plugin/plugins/ and executes hooks

local runtime = require("runtime")

local loader = {}

-- Table to store plugin functions
loader.plugins = {}

-- Load all plugins in a folder
function loader.loadAll(folder)
    local lfs = require("lfs")
    for file in lfs.dir(folder) do
        if file:match("%.lua$") then
            local path = folder.."/"..file
            local f = io.open(path, "r")
            local code = f:read("*a")
            f:close()

            local func, err = runtime.loadPlugin(code)
            if func then
                table.insert(loader.plugins, func)
                print("[LuaPlugin] Loaded", file)
            else
                print("[LuaPlugin] Failed:", file, err)
            end
        end
    end
end

-- Call hook for all plugins
function loader.callHook(hookName, context)
    for _, pluginFunc in ipairs(loader.plugins) do
        runtime.runPlugin(pluginFunc, hookName, context)
    end
end

return loader
