import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarDays, ChevronRight, Clock, ListChecks, Mail, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemoPreview } from "@/lib/demo-preview";
import { getResourceKey, readCampusResources, RESOURCE_CATEGORIES, RESOURCE_STORAGE_KEY } from "@/lib/resource-data";
import { ADMIN_STATE_KEY, readAdminState } from "@/lib/admin-data";
import type { CampusResource } from "@/lib/mentorship-data";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Hub · Fred Peer Mentorship Network" },
      { name: "description", content: "Academic, wellbeing, financial and belonging resources for first-year students." },
      { property: "og:title", content: "First-Year Resource Hub" },
      { property: "og:description", content: "Every campus support office for first-year students in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Resources,
});

const EMPTY_RESOURCE: CampusResource = {
  title: "",
  cat: "Academic",
  desc: "",
  location: "",
  hours: "",
  contact: "",
  services: [],
  appointmentUrl: "",
};

function Resources() {
  const { role } = useDemoPreview();
  const isAdministrator = role === "administrator";
  const [resources, setResources] = useState<CampusResource[]>(() =>
    readCampusResources(null),
  );
  const [storageReady, setStorageReady] = useState(false);
  const [cat, setCat] = useState("All");
  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<CampusResource>(EMPTY_RESOURCE);
  const [servicesInput, setServicesInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CampusResource | null>(null);

  useEffect(() => {
    try {
      const savedAdminState = readAdminState(window.localStorage.getItem(ADMIN_STATE_KEY));
      const legacyResources = window.localStorage.getItem(RESOURCE_STORAGE_KEY);
      const savedResources = legacyResources
        ? readCampusResources(legacyResources)
        : savedAdminState.resources;
      setResources(savedResources);
      if (legacyResources) {
        window.localStorage.setItem(
          ADMIN_STATE_KEY,
          JSON.stringify({ ...savedAdminState, resources: savedResources }),
        );
        window.localStorage.removeItem(RESOURCE_STORAGE_KEY);
      }
    } catch {
      toast.error("Saved resource changes could not be loaded from browser storage.");
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      const savedAdminState = readAdminState(window.localStorage.getItem(ADMIN_STATE_KEY));
      window.localStorage.setItem(
        ADMIN_STATE_KEY,
        JSON.stringify({ ...savedAdminState, resources }),
      );
    } catch {
      toast.error("Resource changes are available this session but could not be saved in browser storage.");
    }
  }, [resources, storageReady]);

  const selectedResource = resources.find((resource) => getResourceKey(resource) === detailsKey) ?? null;
  const categories = useMemo(() => ["All", ...RESOURCE_CATEGORIES], []);
  const filteredResources = resources.filter((resource) => cat === "All" || resource.cat === cat);
  const editingResource = editingKey
    ? resources.find((resource) => getResourceKey(resource) === editingKey)
    : undefined;

  function openCreateForm() {
    setEditingKey(null);
    setDraft({ ...EMPTY_RESOURCE, services: [] });
    setServicesInput("");
    setEditorOpen(true);
  }

  function openEditForm(resource: CampusResource) {
    setEditingKey(getResourceKey(resource));
    setDraft({ ...resource, services: [...resource.services] });
    setServicesInput(resource.services.join("\n"));
    setEditorOpen(true);
  }

  function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextResource: CampusResource = {
      id: draft.id ?? `local-resource-${Date.now()}`,
      title: String(form.get("title") ?? "").trim(),
      cat: String(form.get("category") ?? ""),
      desc: String(form.get("description") ?? "").trim(),
      location: String(form.get("location") ?? "").trim(),
      hours: String(form.get("hours") ?? "").trim(),
      contact: String(form.get("contact") ?? "").trim(),
      appointmentUrl: String(form.get("appointmentUrl") ?? "").trim(),
      services: servicesInput.split(/\r?\n/).map((service) => service.trim()).filter(Boolean),
    };

    if (!nextResource.title || !nextResource.desc || !nextResource.location || !nextResource.hours || !nextResource.contact) {
      toast.error("Complete the required resource details before saving.");
      return;
    }
    const duplicate = resources.some(
      (resource) =>
        resource.title.toLocaleLowerCase() === nextResource.title.toLocaleLowerCase() &&
        getResourceKey(resource) !== editingKey,
    );
    if (duplicate) {
      toast.error("A resource with that title already exists.");
      return;
    }

    if (editingKey) {
      setResources((current) => current.map((resource) =>
        getResourceKey(resource) === editingKey ? nextResource : resource,
      ));
      if (detailsKey === editingKey) setDetailsKey(getResourceKey(nextResource));
      toast.success("Resource updated.");
    } else {
      setResources((current) => [...current, nextResource]);
      toast.success("Resource added.");
    }
    setEditorOpen(false);
  }

  function deleteResource() {
    if (!deleteTarget) return;
    const key = getResourceKey(deleteTarget);
    setResources((current) => current.filter((resource) => getResourceKey(resource) !== key));
    if (detailsKey === key) setDetailsKey(null);
    setDeleteTarget(null);
    setEditorOpen(false);
    toast.success("Resource deleted.");
  }

  const email = selectedResource?.contact.match(/[^\s,;]+@[^\s,;]+/)?.[0];
  const phone = selectedResource?.contact.match(/\+?[\d][\d\s().-]{6,}/)?.[0]?.trim();
  const appointmentHref = selectedResource
    ? selectedResource.appointmentUrl || (email
      ? `mailto:${email}?subject=${encodeURIComponent(`Appointment request: ${selectedResource.title}`)}`
      : undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Campus Support</p>
          <h1 className="font-display text-3xl text-primary">Resource Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">Select any office to see its location, opening hours, contact details and services.</p>
        </div>
        {isAdministrator && <Button onClick={openCreateForm}><Plus className="mr-2 h-4 w-4" />Add New Resource</Button>}
      </header>

      <div className="flex flex-wrap gap-2" aria-label="Filter resources by category">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            aria-pressed={cat === category}
            onClick={() => setCat(category)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${cat === category ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"}{cat !== "All" ? ` in ${cat}` : ""}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredResources.map((resource) => {
          const resourceKey = getResourceKey(resource);
          return (
            <article key={resourceKey} className="animate-rise flex flex-col rounded-xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lift">
              <Badge variant="secondary" className="w-fit bg-teal-soft text-teal">{resource.cat}</Badge>
              <h2 className="mt-3 font-semibold">{resource.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{resource.desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="link" className="h-auto p-0 text-accent" onClick={() => setDetailsKey(resourceKey)}>
                  View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                {isAdministrator && (
                  <>
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEditForm(resource)} aria-label={`Edit ${resource.title}`}>
                      <Pencil className="h-4 w-4" /><span className="sr-only">Edit</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteTarget(resource)} aria-label={`Delete ${resource.title}`}>
                      <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete</span>
                    </Button>
                  </>
                )}
              </div>
            </article>
          );
        })}
        {!filteredResources.length && (
          <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No resources in this category yet.
          </div>
        )}
      </div>

      <Dialog open={!!selectedResource} onOpenChange={(isOpen) => { if (!isOpen) setDetailsKey(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {selectedResource && (
            <>
              <DialogHeader>
                <Badge variant="secondary" className="w-fit bg-teal-soft text-teal">{selectedResource.cat}</Badge>
                <DialogTitle className="font-display text-xl">{selectedResource.title}</DialogTitle>
                <DialogDescription>{selectedResource.desc}</DialogDescription>
              </DialogHeader>
              <dl className="space-y-4 border-t pt-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div><dt className="font-medium">Physical location</dt><dd className="text-muted-foreground">{selectedResource.location}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div><dt className="font-medium">Office hours</dt><dd className="text-muted-foreground">{selectedResource.hours}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <dt className="font-medium">Contact details</dt>
                    <dd className="text-muted-foreground">
                      {email ? <a className="underline underline-offset-2" href={`mailto:${email}`}>{email}</a> : selectedResource.contact}
                      {phone && <> · <a className="underline underline-offset-2" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a></>}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <dt className="font-medium">Services</dt>
                    <dd>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                        {selectedResource.services.map((service) => <li key={service}>{service}</li>)}
                      </ul>
                    </dd>
                  </div>
                </div>
              </dl>
              {appointmentHref && (
                <Button asChild className="w-full">
                  <a href={appointmentHref} target={selectedResource.appointmentUrl ? "_blank" : undefined} rel={selectedResource.appointmentUrl ? "noreferrer" : undefined}>
                    <CalendarDays className="mr-2 h-4 w-4" />Request an Appointment
                  </a>
                </Button>
              )}
              {isAdministrator && <Button variant="outline" onClick={() => openEditForm(selectedResource)}>Edit Resource</Button>}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={saveResource} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Edit Campus Resource" : "Add New Resource"}</DialogTitle>
              <DialogDescription>Manage the service information shown to students and peer advisors.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="resource-title">Resource name</Label><Input id="resource-title" name="title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required /></div>
              <div className="space-y-2">
                <Label htmlFor="resource-category">Category</Label>
                <Select value={draft.cat} onValueChange={(value) => setDraft((current) => ({ ...current, cat: value }))}>
                  <SelectTrigger id="resource-category"><SelectValue /></SelectTrigger>
                  <SelectContent>{RESOURCE_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
                <input type="hidden" name="category" value={draft.cat} />
              </div>
              <div className="space-y-2"><Label htmlFor="resource-hours">Office hours</Label><Input id="resource-hours" name="hours" value={draft.hours} onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))} placeholder="Mon–Fri 9:00–17:00" required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="resource-description">Description</Label><Textarea id="resource-description" name="description" rows={2} value={draft.desc} onChange={(event) => setDraft((current) => ({ ...current, desc: event.target.value }))} required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="resource-location">Physical location</Label><Input id="resource-location" name="location" value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} required /></div>
              <div className="space-y-2"><Label htmlFor="resource-contact">Contact (email / phone)</Label><Input id="resource-contact" name="contact" value={draft.contact} onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))} required /></div>
              <div className="space-y-2"><Label htmlFor="resource-appointment">Appointment link (optional)</Label><Input id="resource-appointment" name="appointmentUrl" type="url" value={draft.appointmentUrl ?? ""} onChange={(event) => setDraft((current) => ({ ...current, appointmentUrl: event.target.value }))} placeholder="https://…" /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="resource-services">Services (one per line)</Label>
                <Textarea id="resource-services" value={servicesInput} onChange={(event) => setServicesInput(event.target.value)} rows={4} placeholder={"Walk-in advising\nWorkshops and peer support"} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              {editingResource && <Button type="button" variant="destructive" className="sm:mr-auto" onClick={() => setDeleteTarget(editingResource)}><Trash2 className="mr-2 h-4 w-4" />Delete Resource</Button>}
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button type="submit">{editingKey ? "Save Changes" : "Add Resource"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete campus resource?</DialogTitle>
            <DialogDescription>{deleteTarget ? `${deleteTarget.title} will be removed from this browser's Resource Hub.` : "This resource will be removed."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={deleteResource}>Delete Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
