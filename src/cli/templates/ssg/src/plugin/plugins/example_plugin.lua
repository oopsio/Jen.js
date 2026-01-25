-- Example Lua plugin for SSG
return function(hook, ctx)
    if hook == "onBuild" then
        print("[SSG Plugin] Building page:", ctx.page)
    end
end
