import { describe, expect, it } from "vitest";
import { RESOURCES } from "./mentorship-data";
import { getResourceKey, readCampusResources } from "./resource-data";

describe("campus resource persistence", () => {
  it("uses bundled resources when storage is empty or invalid", () => {
    expect(readCampusResources(null)).toEqual(RESOURCES);
    expect(readCampusResources("{invalid")).toEqual(RESOURCES);
    expect(readCampusResources(JSON.stringify([{ title: "Incomplete" }]))).toEqual(RESOURCES);
  });

  it("restores valid resources and gives legacy entries a stable title key", () => {
    const stored = [{ ...RESOURCES[0], id: "local-one" }, RESOURCES[1]];
    const restored = readCampusResources(JSON.stringify(stored));

    expect(restored).toEqual(stored);
    expect(getResourceKey(restored[0]!)).toBe("local-one");
    expect(getResourceKey(restored[1]!)).toBe(RESOURCES[1]!.title);
    expect(restored[0]!.services).not.toBe(stored[0]!.services);
  });
});
