# Comprehensive UUID replacement script for all seed files

# Define mappings
$petMappings = @{
    "pet-001" = "660e8400-e29b-41d4-a716-446655440001"
    "pet-002" = "660e8400-e29b-41d4-a716-446655440002"
    "pet-003" = "660e8400-e29b-41d4-a716-446655440003"
    "pet-004" = "660e8400-e29b-41d4-a716-446655440004"
    "pet-005" = "660e8400-e29b-41d4-a716-446655440005"
    "pet-006" = "660e8400-e29b-41d4-a716-446655440006"
    "pet-007" = "660e8400-e29b-41d4-a716-446655440007"
    "pet-008" = "660e8400-e29b-41d4-a716-446655440008"
    "pet-009" = "660e8400-e29b-41d4-a716-446655440009"
    "pet-010" = "660e8400-e29b-41d4-a716-446655440010"
    "pet-011" = "660e8400-e29b-41d4-a716-446655440011"
    "pet-012" = "660e8400-e29b-41d4-a716-446655440012"
    "pet-013" = "660e8400-e29b-41d4-a716-446655440013"
    "pet-014" = "660e8400-e29b-41d4-a716-446655440014"
    "pet-015" = "660e8400-e29b-41d4-a716-446655440015"
}

$vetMappings = @{
    "vet-adris-001" = "550e8400-e29b-41d4-a716-446655440004"
    "vet-adris-002" = "550e8400-e29b-41d4-a716-446655440005"
}

# Get all JSON files in seed data
$jsonFiles = Get-ChildItem -Path "db/seeds/data" -Recurse -Include "*.json" -File

foreach ($file in $jsonFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace pet IDs
    foreach ($mapping in $petMappings.GetEnumerator()) {
        $content = $content -replace """pet_id"": ""$($mapping.Key)""", """pet_id"": ""$($mapping.Value)"""
    }
    
    # Replace vet IDs
    foreach ($mapping in $vetMappings.GetEnumerator()) {
        $content = $content -replace """vet_id"": ""$($mapping.Key)""", """vet_id"": ""$($mapping.Value)"""
        $content = $content -replace """administered_by"": ""$($mapping.Key)""", """administered_by"": ""$($mapping.Value)"""
        $content = $content -replace """recorded_by"": ""$($mapping.Key)""", """recorded_by"": ""$($mapping.Value)"""
        $content = $content -replace """fed_by"": ""$($mapping.Key)""", """fed_by"": ""$($mapping.Value)"""
    }
    
    # Write back to file
    $content | Set-Content $file.FullName -NoNewline
}

Write-Host "All UUID replacements completed!"
