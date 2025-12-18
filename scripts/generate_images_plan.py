import os
import re
import json


def parse_locations(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find table rows.
    # Looking for lines like: | HERO-001 | `hero-bg.jpg` | `/branding/adris/images/hero-bg.jpg` | ...
    # Regex to capture ID and Path. Path is usually in the 3rd column.

    locations = {}

    # Iterate over lines
    for line in content.split("\n"):
        if not line.strip().startswith("|"):
            continue
        if "Image ID" in line or "---" in line:
            continue

        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 4:
            continue

        # parts[0] is empty (before first |)
        # parts[1] is ID
        # parts[2] is File Name
        # parts[3] is Storage Path

        img_id = parts[1]
        file_name = parts[2].replace("`", "")
        storage_path = parts[3].replace("`", "")

        # Clean up path - remove leading slash if present to make it relative to web/public
        if storage_path.startswith("/"):
            storage_path = storage_path[1:]

        # The storage path in the md is like `branding/adris/images/...`
        # We need to map this to `web/public/branding/adris/images/...`
        # But wait, looking at the file: `/branding/adris/images/hero-bg.jpg`
        # Real path is `web/public/branding/adris/...`?
        # Actually user created `web/public/branding/adris/team` earlier.
        # But the Markdown says `web/public/adris/images/` at the top...
        # Let's check the earlier tools.
        # I created `web/public/branding/adris/team`.
        # The markdown says:
        # ```
        # web/public/adris/images/
        # ```
        # But the table says `/branding/adris/images/...`
        # I should probably just follow what's in the table but prefix with `web/public`.

        full_path = os.path.join("web", "public", storage_path.replace("/", os.sep))
        locations[img_id] = full_path

    return locations


def parse_prompts(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    prompts = {}

    # Split by headers like ### ID
    # Regex to find ID and then the code block

    # Pattern: ### ID: Title \n ... ``` prompt ```

    sections = re.split(r"###\s+([A-Z]+-\d+)", content)

    # sections[0] is header
    # sections[1] is ID
    # sections[2] is content
    # ...

    for i in range(1, len(sections), 2):
        img_id = sections[i]
        text_content = sections[i + 1]

        # Extract prompt from code block
        match = re.search(r"```(.*?)```", text_content, re.DOTALL)
        if match:
            prompt = match.group(1).strip()
            prompts[img_id] = prompt

    return prompts


def main():
    base_dir = r"c:\Users\Alejandro\Documents\Ivan\Adris\Vete"
    prompts_file = os.path.join(
        base_dir, r"web\.content_data\adris\images\image-prompts.md"
    )
    locations_file = os.path.join(
        base_dir, r"web\.content_data\adris\images\image-locations.md"
    )
    output_file = os.path.join(
        base_dir, r"web\.content_data\adris\images\generation_plan.json"
    )

    print(f"Reading locations from: {locations_file}")
    locations = parse_locations(locations_file)
    print(f"Found {len(locations)} locations.")

    print(f"Reading prompts from: {prompts_file}")
    prompts = parse_prompts(prompts_file)
    print(f"Found {len(prompts)} prompts.")

    plan = []

    for img_id, prompt in prompts.items():
        if img_id in locations:
            plan.append({"id": img_id, "path": locations[img_id], "prompt": prompt})
        else:
            print(f"Warning: No location found for {img_id}")

    print(f"Generated plan with {len(plan)} items.")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2)

    print(f"Plan saved to {output_file}")


if __name__ == "__main__":
    main()
