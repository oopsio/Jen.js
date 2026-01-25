import os
import shutil

def copy_tree(src, dst):
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)
