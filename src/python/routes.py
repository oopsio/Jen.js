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
