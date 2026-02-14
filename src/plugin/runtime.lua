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

-- Pure Lua runtime for plugin scripts
-- Minimal sandbox for running plugin code safely

local runtime = {}

-- Basic environment for plugins
runtime.env = {
    print = print,
    math = math,
    string = string,
    table = table,
}

-- Create a sandboxed function
function runtime.loadPlugin(code)
    local f, err = load(code, "plugin", "t", runtime.env)
    if not f then
        return nil, err
    end
    return f
end

-- Run a plugin
function runtime.runPlugin(func, hookName, context)
    if type(func) ~= "function" then
        return
    end
    local ok, err = pcall(func, hookName, context)
    if not ok then
        print("[LuaPlugin Error]:", err)
    end
end

return runtime
