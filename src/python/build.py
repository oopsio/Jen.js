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
