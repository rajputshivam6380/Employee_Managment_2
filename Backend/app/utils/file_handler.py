import os
import shutil
from uuid import uuid4

# 👉 FIXED ABSOLUTE PATH (VERY IMPORTANT)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

def save_file(file):
    try:
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        ext = file.filename.split(".")[-1]
        filename = f"{uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # 👉 THIS LINE IS MOST IMPORTANT
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("✅ File saved at:", file_path)

        return filename

    except Exception as e:
        print("❌ ERROR saving file:", str(e))
        return None