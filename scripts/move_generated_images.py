import os
import json
import shutil
import glob


def main():
    base_dir = r"c:\Users\Alejandro\Documents\Ivan\Adris\Vete"
    artifacts_dir = r"C:\Users\Alejandro\.gemini\antigravity\brain\ec679379-dd81-45eb-be7d-485d60459910"
    plan_file = os.path.join(
        base_dir, r"web\.content_data\adris\images\generation_plan.json"
    )

    with open(plan_file, "r", encoding="utf-8") as f:
        plan = json.load(f)

    for item in plan:
        img_id = item["id"]
        target_path = item["path"]

        # Current path in json is absolute or relative?
        # "path": "web\\public\\branding\\adris\\images\\hero-bg.jpg"
        # It is relative to base_dir if it starts with web... or it might be absolute if I joined it wrong in previous script.
        # My previous script: full_path = os.path.join('web', 'public', ...)
        # So it's relative.

        abs_target_path = os.path.join(base_dir, target_path)

        if os.path.exists(abs_target_path):
            print(f"Skipping {img_id}: already exists at {target_path}")
            continue

        # Look for source in artifacts
        # ID is like HERO-001. ImageName passed to tool will be hero_001 (lowercase, underscores)
        image_name_prefix = img_id.lower().replace("-", "_")

        # Pattern: prefix_*.png
        # Note: generate_image output might vary but typically it's name + timestamp
        search_pattern = os.path.join(artifacts_dir, f"{image_name_prefix}_*.png")
        candidates = glob.glob(search_pattern)

        if not candidates:
            # Try jpg just in case? Tool usually outputs png.
            # Also try without timestamp if it was exact match?
            # Also check if I used a different naming convention.
            # I will use ID as name.
            continue

        # Get latest
        latest_file = max(candidates, key=os.path.getctime)

        print(f"Moving {latest_file} to {abs_target_path}")

        # Ensure dir exists
        os.makedirs(os.path.dirname(abs_target_path), exist_ok=True)

        shutil.copy2(latest_file, abs_target_path)
        # Verify
        if os.path.exists(abs_target_path):
            print(f"Success: {img_id}")


if __name__ == "__main__":
    main()
