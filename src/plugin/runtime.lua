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
