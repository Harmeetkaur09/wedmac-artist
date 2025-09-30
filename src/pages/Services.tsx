import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Scissors, Plus, Edit, Trash2 } from "lucide-react";

type ServiceItem = {
  id: number;
  name: string;
  description?: string;
  price: string; // keep as string to preserve "500.00" format
  duration?: string;
  trialAvailable?: boolean;
  travelCharges?: string;
};

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Add / Edit form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [trialAvailable, setTrialAvailable] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const getAuthHeader = () => {
    if (typeof window === "undefined") return {};
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // FETCH services (GET)
  const fetchServices = async () => {
    setLoadingServices(true);
    setStatusMessage(null);
    try {
      const resp = await fetch(
        "https://api.wedmacindia.com/api/artist-services/services/get/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        }
      );
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Failed to fetch services: ${resp.status} ${txt}`);
      }
      const data = await resp.json();
      // support both array or paginated response
      const items = Array.isArray(data)
        ? data
        : data.results || data.data || [];
      // normalize price -> string with 2 decimals if available
      const normalized: ServiceItem[] = items.map((it: any) => ({
        id: it.id,
        name: it.name,
        description: it.description || "",
        price: it.price != null ? String(it.price) : "0.00",
        trialAvailable: !!it.trialAvailable,
        duration: it.duration,
        travelCharges: it.travelCharges,
      }));
      setServices(normalized);
    } catch (err: any) {
      console.error(err);
      setToast({
        type: "error",
        message: err?.message || "Failed to load services",
      });
      setStatusMessage(err?.message || "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // reset form helper
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setTrialAvailable(false);
    setStatusMessage(null);
  };

  // CREATE (POST) then attach to profile (complete-profile)
  const handleCreateService = async () => {
    setStatusMessage(null);
    if (!name.trim()) return setStatusMessage("Please provide service name.");
    if (price === "" || Number(price) <= 0)
      return setStatusMessage("Please provide a valid price.");

    setSubmitting(true);
    try {
      const createResp = await fetch(
        "https://api.wedmacindia.com/api/artist-services/services/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            price: Number(price).toFixed(2),
          }),
        }
      );
      if (!createResp.ok) {
        const txt = await createResp.text();
        throw new Error(`Create failed: ${createResp.status} ${txt}`);
      }
      const created = await createResp.json();
      const createdId = created?.service_id;
      if (!createdId) throw new Error("Create response missing id.");

      // append to UI
      const newService: ServiceItem = {
        id: createdId,
        name: created.name || name,
        description: created.description || description,
        price:
          created.price != null
            ? String(created.price)
            : Number(price).toFixed(2),
        trialAvailable,
      };
      setServices((s) => [newService, ...s]);

      // attach created id to profile
      const completeResp = await fetch(
        "https://api.wedmacindia.com/api/artists/complete-profile/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ services: [createdId] }),
        }
      );

      if (!completeResp.ok) {
        const txt = await completeResp.text();
        // non-fatal but surface error
        throw new Error(
          `Complete profile failed: ${completeResp.status} ${txt}`
        );
      }

      await completeResp.json();
      setToast({
        type: "success",
        message: `Created service and updated profile.`,
      });
      resetForm();
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err?.message || "Create failed" });
      setStatusMessage(err?.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  // UPDATE (PATCH)
  const handleUpdateService = async () => {
    if (!editingId) return setStatusMessage("No service selected to update.");
    if (!name.trim()) return setStatusMessage("Please provide service name.");
    if (price === "" || Number(price) <= 0)
      return setStatusMessage("Please provide a valid price.");

    setSubmitting(true);
    try {
      const resp = await fetch(
        `https://api.wedmacindia.com/api/artist-services/services/${editingId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            price: Number(price).toFixed(2),
          }),
        }
      );

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Update failed: ${resp.status} ${txt}`);
      }

      const updated = await resp.json();
      // update local list
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: updated.name || name,
                description: updated.description || description,
                price:
                  updated.price != null
                    ? String(updated.price)
                    : Number(price).toFixed(2),
              }
            : s
        )
      );
      setToast({ type: "success", message: `Service ${editingId} updated.` });
      resetForm();
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err?.message || "Update failed" });
      setStatusMessage(err?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteService = async (id: number) => {
    const ok = window.confirm("Are you sure you want to delete this service?");
    if (!ok) return;
    setDeletingId(id);
    setStatusMessage(null);
    try {
      const resp = await fetch(
        `https://api.wedmacindia.com/api/artist-services/services/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        }
      );

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Delete failed: ${resp.status} ${txt}`);
      }

      // remove from UI
      setServices((prev) => prev.filter((s) => s.id !== id));
      setToast({ type: "success", message: `Service ${id} deleted.` });
      // if we were editing this item, reset form
      if (editingId === id) resetForm();
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err?.message || "Delete failed" });
      setStatusMessage(err?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // when Edit clicked: populate form
  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setName(service.name || "");
    setDescription(service.description || "");
    // try parsing price to number if possible
    const numeric = Number(String(service.price).replace(/[^\d.-]/g, ""));
    setPrice(Number.isFinite(numeric) ? numeric : "");
    setTrialAvailable(!!service.trialAvailable);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form submit decides create vs update
  const handleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingId) await handleUpdateService();
    else await handleCreateService();
  };
  // Predefined service options
  const serviceOptions: Record<string, string> = {
    "Bridal Makeup":
      "Crafted for the queen of the day – a timeless bridal look that blends tradition with luxury, ensuring every step feels royal and every picture flawless.",
    "Engagement Makeup":
      "A dreamy makeover with soft glam and radiant highlights – designed to make you shine like the star of your new beginning.",
    "Party Makeup":
      "Trendy strokes, bold vibes, and a glam finish – the kind of makeover that makes every eye turn when you walk in.",
    "Airbrush Makeup":
      "Feather-light, poreless, and picture-perfect – an advanced airbrush touch that looks flawless both on-screen and off-screen.",
    "Haldi Makeup":
      "Fresh, vibrant, and sunshine-ready – a natural glow makeover that matches the joy and warmth of your Haldi ceremony.",
    "Mehndi Makeup":
      "Playful colors with a touch of elegance – a look that celebrates tradition while keeping it chic for your Mehndi celebrations.",
    "Sangeet Makeup":
      "Bold eyes, shimmering glam, and unstoppable confidence – perfect for a night full of music, dance, and sparkle.",
    "Reception Makeup":
      "A graceful blend of sophistication and glam – designed to make your reception night unforgettable.",
    "Nude Makeup":
      "Minimalist yet magical – a soft glam look that whispers elegance while keeping it effortlessly natural.",
    "Smoky Makeup":
      "Intense eyes, bold aura, and the drama of perfection – a look that owns the night with confidence and style.",
  };

  return (
    <Layout title="Services">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {editingId ? "Edit Service" : "Makeup Services"}
            </h2>
            <p className="text-muted-foreground">
              Manage your service offerings and pricing
            </p>
          </div>
        </div>

        {/* Add / Edit Form */}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingServices ? (
            <div>Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-muted-foreground">No services found.</div>
          ) : (
            services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        {deletingId === service.id ? (
                          "Deleting..."
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-1 items-center">
                      <span className="text-sm text-muted-foreground">
                        Price:
                      </span>
                      <span className="font-semibold text-primary">
                        {String(service.price).startsWith("₹")
                          ? service.price
                          : `₹${service.price}`}
                      </span>
                    </div>
                    {service.description ? (
                      <div className="text-sm text-muted-foreground break-words">
                        {service.description}
                      </div>
                    ) : null}
                  </div>

                  {/* <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Trial Available</span>
                    <Badge variant={service.trialAvailable ? "default" : "secondary"}>
                      {service.trialAvailable ? "Yes" : "No"}
                    </Badge>
                  </div> */}
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              {editingId ? `Edit Service #${editingId}` : "Add New Service"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name</Label>
                  <select
                    id="serviceName"
                    value={name}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setName(selected);
                      setDescription(serviceOptions[selected] || "");
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select a service</option>
                    {Object.keys(serviceOptions).map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    type="number"
                    placeholder="15000"
                  />
                </div>
              </div>

              {/* <div className="space-y-2 mt-2">
  <Label htmlFor="description">Description</Label>
  <Input
    id="description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Short description"
  />
</div> */}

              {/* <div className="flex items-center space-x-2 mt-2">
                <Switch id="trial" checked={trialAvailable} onCheckedChange={(v) => setTrialAvailable(Boolean(v))} />
                <Label htmlFor="trial">Trial Available</Label>
              </div> */}

              <div className="flex justify-end items-center gap-4 mt-4">
                <div className="text-sm text-muted-foreground mr-auto">
                  {statusMessage}
                </div>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => {
                    resetForm();
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white"
                  disabled={submitting}
                >
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Adding..."
                    : editingId
                    ? "Update Service"
                    : "Add Service"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        {/* Toast */}
        {toast && (
          <div
            className={`fixed right-6 bottom-6 p-3 rounded shadow ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </Layout>
  );
}
