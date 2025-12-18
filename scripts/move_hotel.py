import os
import glob
import shutil


def main():
    base_dir = r"c:\Users\Alejandro\Documents\Ivan\Adris\Vete"
    artifacts_dir = r"C:\Users\Alejandro\.gemini\antigravity\brain\ec679379-dd81-45eb-be7d-485d60459910"

    # ID -> Destination Path (relative to web/public/branding/adris/images/)
    mappings = {
        "svc_hotel": "services/hotel.jpg",
    }

    base_output_dir = os.path.join(
        base_dir, "web", "public", "branding", "adris", "images"
    )

    for img_id, rel_path in mappings.items():
        pattern = os.path.join(artifacts_dir, f"{img_id}_*.png")
        candidates = glob.glob(pattern)

        if not candidates:
            continue

        latest_file = max(candidates, key=os.path.getctime)
        dest_path = os.path.join(base_output_dir, rel_path)

        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        print(f"Moving {os.path.basename(latest_file)} -> {rel_path}")
        shutil.copy2(latest_file, dest_path)


if __name__ == "__main__":
    main()
