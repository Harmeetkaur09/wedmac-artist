// src/api/profile.ts

export interface DocumentData {
  id: number;
  file_name: string;
  file_type: "image" | "pdf";
  tag:
    | "profile-photo"
    | "portfolio"
    | "certificate"
    | "id-document"
    | "supporting-image";
  created_at: string;
  file_url: string;
  public_id: string;
  is_active: boolean;
  file_base64?: string | null;
}

export interface SocialLinks {
  instagram: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface MyProfile {
  id: number;
  duration_days: number;
  purchase_date: string;
  extended_days: number;
  plan_verified: boolean;
  current_plan: {
    id: number;
    name: string;
    duration_days: number;
    total_leads: number;
  } | null;
  plan_purchase_date: string | null;
  available_leads: number;
  created_by_admin: boolean;
  status: string;
  payment_status: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other";
  date_of_birth: string | null;
  referel_code: string;
  offer_chosen: string;
  bio: string;
  type_of_makeup: string[];
  price_range: string;
  products_used: string[];
  experience_years: number;
  services: string[];
  travel_charges: boolean;
  trial_available: boolean;
  social_links: SocialLinks;
  location: number;
  profile_picture_data: DocumentData | null;
  certifications_data: DocumentData[];
  id_documents_data: DocumentData[];
  supporting_images_data: DocumentData[];
  travel_policy: string;
}

export interface CompleteProfilePayload {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other";
  date_of_birth: string;
  referel_code: string;
  offer_chosen: string;
  bio: string;
  travel_policy: string;
  type_of_makeup: number[];
  price_range: string;
  products_used: number[];
  payment_methods: number[];
  experience_years: number;
  services: string[];
  travel_charges: string;
  profile_picture: number;
  certifications: number[];
  trial_available: boolean;
  social_links: {
    instagram: string;
    facebook?: string;
  };
  id_documents: number[];
  supporting_images: number[];
  files?: number[]; // 👈 new optional field
  featured_portfolio?: number[]; // 👈 new optional field
}
export interface MyProfile {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other";
  date_of_birth: string | null;
  referel_code: string;
  offer_chosen: string;
  bio: string;
  travel_policy: string;
  type_of_makeup: string[];
  price_range: string;
  products_used: string[];
  experience_years: number;
  services: string[];
  travel_charges: boolean;
  trial_available: boolean;
  social_links: SocialLinks;
  location: number;
  profile_picture_data: DocumentData | null;
  certifications_data: DocumentData[];
  id_documents_data: DocumentData[];
  supporting_images_data: DocumentData[];
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function getMyProfile(): Promise<MyProfile> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };
  const res = await fetch(
    "https://api.wedmacindia.com/api/artists/my-profile/",
    { headers }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch profile");
  }
  return res.json();
}

export async function uploadDocument(
  file: File,
  fileType: "image" | "pdf",
  tag: "profile-photo" | "portfolio" | "certificate" | "id-document"
): Promise<DocumentData> {
  const headers = await authHeaders();
  const form = new FormData();
  form.append("file", file);
  form.append("file_type", fileType);
  form.append("tag", tag);

  const res = await fetch("https://api.wedmacindia.com/api/documents/upload/", {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }
  const data = await res.json();
  return {
    id: data.document_id,
    file_name: data.file_name,
    file_type: data.file_type,
    tag: data.tag,
    created_at: data.created_at,
    file_url: data.file_url,
    public_id: data.public_id,
    is_active: data.is_active,
    file_base64: data.file_base64,
  };
}

export async function completeProfile(
  payload: CompleteProfilePayload
): Promise<void> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };

  const res = await fetch(
    "https://api.wedmacindia.com/api/artists/complete-profile/",
    { method: "POST", headers, body: JSON.stringify(payload) }
  );

  const text = await res.text().catch(() => null);
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  console.log("POST status:", res.status);
  console.log("POST response body:", body);

  if (!res.ok) {
    // throw the parsed body (object) so the UI can render structured validation messages
    throw body ?? { status: res.status, message: "Complete profile failed" };
  }

  // success: nothing to return
  return;
}
