import os

target_path = r"C:\Users\SDWOR\AppData\Roaming\Python\Python314\site-packages\pandasai\pydantic\__init__.py"

content = """from pydantic import *
"""

with open(target_path, "w") as f:
    f.write(content)

print("Successfully patched pandasai/pydantic/__init__.py to use pydantic v2")
