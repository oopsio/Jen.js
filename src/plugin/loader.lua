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
