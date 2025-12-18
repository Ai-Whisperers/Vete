import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as fs from "fs/promises";
import * as path from "path";

const CONTENT_DATA_PATH = path.join(process.cwd(), ".content_data");

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get("clinic");

  if (!clinic) {
    return NextResponse.json({ error: "Clinic parameter required" }, { status: 400 });
  }

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // Read config.json for branding
    const configPath = path.join(CONTENT_DATA_PATH, clinic, "config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    // Read theme.json for colors
    const themePath = path.join(CONTENT_DATA_PATH, clinic, "theme.json");
    const themeData = await fs.readFile(themePath, "utf-8");
    const theme = JSON.parse(themeData);

    return NextResponse.json({
      logo_url: config.branding?.logo_url || "",
      favicon_url: config.branding?.favicon_url || "",
      hero_image_url: config.branding?.hero_image_url || "",
      colors: theme.colors || {},
    });
  } catch (error) {
    console.error("Error reading branding:", error);
    return NextResponse.json({ error: "Error al leer marca" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { clinic, logo_url, favicon_url, hero_image_url, colors } = body;

  if (!clinic) {
    return NextResponse.json({ error: "Clinic parameter required" }, { status: 400 });
  }

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // Update config.json branding
    const configPath = path.join(CONTENT_DATA_PATH, clinic, "config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    const updatedConfig = {
      ...config,
      branding: {
        ...config.branding,
        logo_url: logo_url ?? config.branding?.logo_url,
        favicon_url: favicon_url ?? config.branding?.favicon_url,
        hero_image_url: hero_image_url ?? config.branding?.hero_image_url,
      },
    };

    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");

    // Update theme.json colors
    if (colors) {
      const themePath = path.join(CONTENT_DATA_PATH, clinic, "theme.json");
      const themeData = await fs.readFile(themePath, "utf-8");
      const theme = JSON.parse(themeData);

      const updatedTheme = {
        ...theme,
        colors: {
          ...theme.colors,
          ...colors,
        },
      };

      await fs.writeFile(themePath, JSON.stringify(updatedTheme, null, 2), "utf-8");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating branding:", error);
    return NextResponse.json({ error: "Error al guardar marca" }, { status: 500 });
  }
}
