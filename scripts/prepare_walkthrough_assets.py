import os
import shutil


def main():
    project_base = (
        r"c:\Users\Alejandro\Documents\Ivan\Adris\Vete\web\public\branding\adris\images"
    )
    artifact_dir = r"C:\Users\Alejandro\.gemini\antigravity\brain\ec679379-dd81-45eb-be7d-485d60459910"

    # Map (subfolder, filename) -> new_filename
    files_to_copy = [
        ("", "about-hero.jpg", "about-hero.jpg"),
        ("", "hero-bg.jpg", "hero-bg.jpg"),
        ("", "services-hero.jpg", "services-hero.jpg"),
        ("", "store-hero.jpg", "store-hero.jpg"),
        ("team", "adriana.jpg", "team_adriana.jpg"),
        ("team", "jorge.jpg", "team_jorge.jpg"),
        ("team", "fernanda.jpg", "team_fernanda.jpg"),
        ("team", "carolina.jpg", "team_carolina.jpg"),
        ("facilities", "reception.jpg", "facilities_reception.jpg"),
        ("facilities", "surgery.jpg", "facilities_surgery.jpg"),
        ("facilities", "lab.jpg", "facilities_lab.jpg"),
        ("facilities", "grooming.jpg", "facilities_grooming.jpg"),
        ("facilities", "hospitalization.jpg", "facilities_hospitalization.jpg"),
        ("facilities", "imaging.jpg", "facilities_imaging.jpg"),
        ("facilities", "consultation.jpg", "facilities_consultation.jpg"),
        ("services", "consultation.jpg", "services_consultation.jpg"),
        ("services", "vaccination.jpg", "services_vaccination.jpg"),
        ("services", "surgery.jpg", "services_surgery.jpg"),
        ("services", "dental.jpg", "services_dental.jpg"),
        ("services", "imaging.jpg", "services_imaging.jpg"),
        ("services", "lab.jpg", "services_lab.jpg"),
        ("services", "emergency.jpg", "services_emergency.jpg"),
        ("services", "hospitalization.jpg", "services_hospitalization.jpg"),
        ("services", "grooming-bath.jpg", "services_grooming_bath.jpg"),
        ("services", "senior-care.jpg", "services_senior_care.jpg"),
        ("services", "grooming-haircut.jpg", "services_grooming_haircut.jpg"),
        ("services", "travel-docs.jpg", "services_travel_docs.jpg"),
        ("features", "emergency-24h.jpg", "feat_emergency_24h.jpg"),
        ("features", "certified-vaccines.jpg", "feat_certified_vaccines.jpg"),
        ("store", "category-food.jpg", "store_category_food.jpg"),
        ("store", "category-health.jpg", "store_category_health.jpg"),
        ("store", "category-accessories.jpg", "store_category_accessories.jpg"),
        ("store", "category-hygiene.jpg", "store_category_hygiene.jpg"),
        ("testimonials", "pet-1.jpg", "test_pet_1.jpg"),
        ("testimonials", "pet-2.jpg", "test_pet_2.jpg"),
        ("testimonials", "pet-3.jpg", "test_pet_3.jpg"),
        ("testimonials", "pet-4.jpg", "test_pet_4.jpg"),
        ("testimonials", "pet-5.jpg", "test_pet_5.jpg"),
        ("testimonials", "pet-6.jpg", "test_pet_6.jpg"),
        ("patterns", "paw-pattern.png", "pattern_paws.png"),
        ("patterns", "pet-silhouettes.png", "pattern_silhouettes.png"),
        ("", "og-image.jpg", "branding_og.jpg"),
        ("features", "delivery.jpg", "feat_delivery.jpg"),
        ("tools", "age-calculator.jpg", "tool_age_calculator.jpg"),
        ("services", "specialties.jpg", "services_specialties.jpg"),
    ]

    for sub, name, new_name in files_to_copy:
        src = os.path.join(project_base, sub, name)
        dst = os.path.join(artifact_dir, new_name)

        if os.path.exists(src):
            print(f"Copying {src} -> {dst}")
            shutil.copy2(src, dst)
        else:
            print(f"Warning: Source not found {src}")


if __name__ == "__main__":
    main()
