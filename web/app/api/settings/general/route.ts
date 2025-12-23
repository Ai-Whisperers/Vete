import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiError, apiSuccess, validationError } from "@/lib/api/errors";
import { generalSettingsSchema } from "@/lib/schemas/settings";
import * as fs from "fs/promises";
import * as path from "path";

const CONTENT_DATA_PATH = path.join(process.cwd(), ".content_data");

export const GET = withAuth(async ({ request, profile }) => {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get("clinic");

  if (!clinic) {
    return apiError("MISSING_FIELDS", 400, { details: { message: "Clinic parameter required" } });
  }

  // Admin check (already verified by withAuth roles if passed, but here we check tenant)
  if (profile.role !== "admin" || profile.tenant_id !== clinic) {
    return apiError("FORBIDDEN", 403);
  }

  try {
    // Read config.json
    const configPath = path.join(CONTENT_DATA_PATH, clinic, "config.json");
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);

    return apiSuccess({
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
    return apiError("SERVER_ERROR", 500, { details: { message: "Error al leer configuración" } });
  }
}, { roles: ["admin"] });

export const PUT = withAuth(async ({ request, profile }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_FORMAT", 400);
  }

  // Validate with Zod
  const validation = generalSettingsSchema.safeParse(body);
  if (!validation.success) {
    return validationError(validation.error.flatten().fieldErrors);
  }

  const { clinic, ...settings } = validation.data;

  // Admin check
  if (profile.role !== "admin" || profile.tenant_id !== clinic) {
    return apiError("FORBIDDEN", 403);
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

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("Error updating config:", error);
    return apiError("SERVER_ERROR", 500, { details: { message: "Error al guardar configuración" } });
  }
}, { roles: ["admin"] });