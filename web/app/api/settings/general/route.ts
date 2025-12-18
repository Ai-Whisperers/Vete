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
    // Read config.json
    const configPath = path.join(CONTENT_DATA_PATH, clinic, "config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    return NextResponse.json({
      name: config.name || "",
      tagline: config.tagline || "",
      contact: config.contact || {},
      hours: config.hours || {},
      settings: {
        currency: config.settings?.currency || "PYG",
        emergency_24h: config.settings?.emergency_24h || false,
      },
    });
  } catch (error) {
    console.error("Error reading config:", error);
    return NextResponse.json({ error: "Error al leer configuración" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { clinic, ...settings } = body;

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
    // Read existing config
    const configPath = path.join(CONTENT_DATA_PATH, clinic, "config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    // Update fields
    const updatedConfig = {
      ...config,
      name: settings.name || config.name,
      tagline: settings.tagline || config.tagline,
      contact: {
        ...config.contact,
        ...settings.contact,
      },
      hours: {
        ...config.hours,
        ...settings.hours,
      },
      settings: {
        ...config.settings,
        currency: settings.settings?.currency || config.settings?.currency,
        emergency_24h: settings.settings?.emergency_24h ?? config.settings?.emergency_24h,
      },
    };

    // Write back
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}
