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
