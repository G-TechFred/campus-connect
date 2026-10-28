import { RESOURCES, type CampusResource } from "./mentorship-data";

export const RESOURCE_STORAGE_KEY = "fred-campus-resources-v1";

export const RESOURCE_CATEGORIES = [
  "Academic",
  "Belonging",
  "Wellbeing",
  "Financial",
  "Career",
  "Engagement",
] as const;

export function getResourceKey(resource: CampusResource): string {
  return resource.id ?? resource.title;
}

function isCampusResource(value: unknown): value is CampusResource {
  if (!value || typeof value !== "object") return false;
  const resource = value as Partial<CampusResource>;
  return (
    typeof resource.title === "string" &&
    typeof resource.cat === "string" &&
    RESOURCE_CATEGORIES.includes(resource.cat as (typeof RESOURCE_CATEGORIES)[number]) &&
    typeof resource.desc === "string" &&
    typeof resource.location === "string" &&
    typeof resource.hours === "string" &&
    typeof resource.contact === "string" &&
    Array.isArray(resource.services) &&
    resource.services.every((service) => typeof service === "string") &&
    (resource.id === undefined || typeof resource.id === "string") &&
    (resource.appointmentUrl === undefined || typeof resource.appointmentUrl === "string")
  );
}

export function readCampusResources(serialized: string | null): CampusResource[] {
  if (!serialized) return RESOURCES.map((resource) => ({ ...resource, services: [...resource.services] }));
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed) || !parsed.every(isCampusResource)) {
      return RESOURCES.map((resource) => ({ ...resource, services: [...resource.services] }));
    }
    return parsed.map((resource) => ({ ...resource, services: [...resource.services] }));
  } catch {
    return RESOURCES.map((resource) => ({ ...resource, services: [...resource.services] }));
  }
}
