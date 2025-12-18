import os
import glob
import shutil
import time


def main():
    base_dir = r"c:\Users\Alejandro\Documents\Ivan\Adris\Vete"
    artifacts_dir = r"C:\Users\Alejandro\.gemini\antigravity\brain\ec679379-dd81-45eb-be7d-485d60459910"

    # ID -> Destination Path (relative to web/public/branding/adris/images/)
    mappings = {
        "test_001": "testimonials/pet-1.jpg",
        "test_002": "testimonials/pet-2.jpg",
        "test_003": "testimonials/pet-3.jpg",
        "test_004": "testimonials/pet-4.jpg",
        "test_005": "testimonials/pet-5.jpg",
        "test_006": "testimonials/pet-6.jpg",
        "brand_001": "og-image.jpg",
        "store_002": "store/category-accessories.jpg",
        "store_004": "store/category-hygiene.jpg",
        "tool_002": "tools/age-calculator.jpg",
        "decor_001": "patterns/paw-pattern.png",
        "decor_002": "patterns/pet-silhouettes.png",
        "feat_004": "features/delivery.jpg",
    }

    base_output_dir = os.path.join(
        base_dir, "web", "public", "branding", "adris", "images"
    )

    for img_id, rel_path in mappings.items():
        # Find latest artifact
        pattern = os.path.join(artifacts_dir, f"{img_id}_*.png")
        candidates = glob.glob(pattern)

        if not candidates:
            # Try jpg just in case functionality changes, though currently png
            pattern_jpg = os.path.join(artifacts_dir, f"{img_id}_*.jpg")
            candidates = glob.glob(pattern_jpg)

        if not candidates:
            # print(f"Pending: {img_id}")
            continue

        latest_file = max(candidates, key=os.path.getctime)
        dest_path = os.path.join(base_output_dir, rel_path)

        # Check if already exists/moved (simple check by existence, potentially could check timestamp to update)
        # For now, always overwrite if new artifact found

        os.makedirs(os.path.dirname(dest_path), exist_ok=True)

        print(f"Moving {os.path.basename(latest_file)} -> {rel_path}")
        shutil.copy2(latest_file, dest_path)


if __name__ == "__main__":
    main()
