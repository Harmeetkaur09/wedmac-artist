import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Camera,
  Calendar,
  CreditCard,
  Car,
  Palette,
  Package,
  Upload,
  X,
  Instagram,
  Award,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  uploadDocument,
  completeProfile,
  CompleteProfilePayload,
  getMyProfile,
  DocumentData,
} from "@/api/profile";
import type { MyProfile } from "@/api/profile";
import { set } from "date-fns";
import { ProtectedRoute } from "@/components/ProtectedRoute";
function LoadingOverlay({
  show,
  message,
}: {
  show: boolean;
  message?: string;
}) {
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* content */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-6 rounded-xl">
        <div className="flex items-center justify-center">
          {/* spinner */}
          <div className="h-12 w-12 border-4 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-white text-sm">{message ?? "Loading..."}</div>
      </div>
    </div>
  );
}

// --------------------
// helper to parse thrown errors (Response or Error)
// --------------------
async function parseErrorMessage(err: unknown): Promise<string> {
  try {
    if (err instanceof Error) return err.message;

    // Type-guard: detect objects that look like a Response (have a .json() method)
    function isResponseLike(
      obj: unknown
    ): obj is { json: () => Promise<unknown> } {
      return (
        typeof obj === "object" &&
        obj !== null &&
        typeof (obj as { json?: unknown }).json === "function"
      );
    }

    if (isResponseLike(err)) {
      try {
        const data = await err.json();
        if (!data) return "An error occurred";
        if (typeof data === "object" && data !== null) {
          const d = data as Record<string, unknown>;
          if (typeof d.message === "string") return d.message;
          if (typeof d.detail === "string") return d.detail;
          if (typeof d.error === "string") return d.error;
        }
        return JSON.stringify(data);
      } catch {
        // fallthrough
      }
    }

    return typeof err === "string" ? err : JSON.stringify(err);
  } catch (e) {
    return "An unknown error occurred";
  }
}

export default function MyProfile() {
  // — basic info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("female");
  const [dob, setDob] = useState(""); // YYYY‑MM‑DD
  const [referralCode, setReferralCode] = useState("");
  const [chosenOffer, setChosenOffer] = useState("");
  const [bio, setBio] = useState("");
  const [idDocs, setIdDocs] = useState<DocumentData[]>([]);
  // below your other state hooks
  const [productOptions, setProductOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [paymentOptions, setPaymentOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [makeupTypesApi, setMakeupTypesApi] = useState<
    { id: number; name: string }[]
  >([]);

  // — makeup, products, services
  const [typeOfMakeup, setTypeOfMakeup] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
  const [selectedMakeupIds, setSelectedMakeupIds] = useState<number[]>([]);
  const [services, setServices] = useState<string[]>([]);

  // — pricing & experience
  const [priceRange, setPriceRange] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);

  // — travel & trial
  const [travelChargesBoolean, setTravelChargesBoolean] =
    useState<boolean>(false);
  const [trialAvailableBoolean, setTrialAvailableBoolean] =
    useState<boolean>(false);
  const [trialType, setTrialType] = useState<"free" | "paid">("free");

  // — social
  const [instagramLink, setInstagramLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [ytLink, setYTLink] = useState("");

  // — payment methods (UI only)

  // — document uploads
  // — document uploads
  const [profile_picture_data, setProfilePhoto] = useState<DocumentData | null>(
    null
  );
  const [portfolioDocs, setPortfolioDocs] = useState<DocumentData[]>([]);
  const [certDocs, setCertDocs] = useState<DocumentData[]>([]);
  const [travelPolicy, setTravelPolicy] = useState("local");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([
      fetch(
        "https://api.wedmacindia.com/api/admin/master/list/?type=makeup_types"
      ).then((r) => r.json()),
      fetch(
        "https://api.wedmacindia.com/api/admin/master/list/?type=products"
      ).then((r) => r.json()),
      fetch(
        "https://api.wedmacindia.com/api/admin/master/list/?type=payment_methods"
      ).then((r) => r.json()),
    ])
      .then(([makeups, products, payments]) => {
        setMakeupTypesApi(makeups);
        setProductOptions(products);
        setPaymentOptions(payments);
      })
      .catch((err) => console.error("Master‐list load error:", err));
  }, []);

  // safe helper: accepts unknown shapes (numbers | strings | {id: number|string})
  function extractIds(raw: unknown): number[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((el) => {
        if (typeof el === "number") return el;
        if (typeof el === "string" && /^\d+$/.test(el)) return Number(el);
        if (el && typeof el === "object" && "id" in el) {
          const id = (el as { id: number | string }).id;
          return typeof id === "number" ? id : Number(id);
        }
        return NaN;
      })
      .filter((n): n is number => Number.isFinite(n));
  }

  // fetch and prefill
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data: MyProfile = await getMyProfile();
        if (!mounted) return;
        // basic fields
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setEmail(data.email);
        setPhoneNumber(data.phone);
        setGender(data.gender);
        setDob(data.date_of_birth);
        setReferralCode(data.referel_code);
        setChosenOffer(data.offer_chosen);
        setBio(data.bio);
        setSelectedMakeupIds((data.type_of_makeup || []).map(Number));
        setSelectedProductIds((data.products_used || []).map(Number));
        setServices(data.services || []);
        setPriceRange(data.price_range);
        setExperienceYears(data.experience_years);
        setTravelChargesBoolean(Boolean(data.travel_charges));
        setTrialAvailableBoolean(Boolean(data.trial_available));
        setInstagramLink(data.social_links?.instagram || "");
        setFacebookLink(data.social_links?.facebook || "");
        setTwitterLink(data.social_links?.twitter || "");
        setYTLink(data.social_links?.youtube || "");
        setTravelPolicy(data.travel_policy || "local");
        const raw = data as unknown as Record<string, unknown>;
        const makeupRaw =
          raw["type_of_makeup"] ?? raw["type_of_makeup_data"] ?? [];
        setSelectedMakeupIds(extractIds(makeupRaw));
        const productsRaw =
          raw["products_used_data"] ?? raw["products_used"] ?? [];
        setSelectedProductIds(extractIds(productsRaw));
        const paymentsRaw =
          raw["payment_methods_data"] ?? raw["payment_methods"] ?? [];
        setSelectedPaymentIds(extractIds(paymentsRaw));

        const socialRaw = raw["social_links_data"] ?? raw["social_links"] ?? [];
        if (Array.isArray(socialRaw)) {
          (socialRaw as unknown[]).forEach((s) => {
            if (s && typeof s === "object") {
              const item = s as Record<string, unknown>;
              const platform = item["platform"];
              const url = item["url"];
              if (platform === "instagram" && typeof url === "string") {
                setInstagramLink(url);
              }
              if (platform === "facebook" && typeof url === "string") {
                setFacebookLink(url);
              }
            }
          });
        } else if (
          typeof raw["social_links"] === "object" &&
          raw["social_links"] !== null
        ) {
          const sl = raw["social_links"] as Record<string, unknown>;
          if (typeof sl["instagram"] === "string")
            setInstagramLink(sl["instagram"] as string);
          if (typeof sl["facebook"] === "string")
            setFacebookLink(sl["facebook"] as string);
        }

        if (data.profile_picture_data) {
          setProfilePhoto(data.profile_picture_data);
        }
        if (Array.isArray(data.supporting_images_data)) {
          setPortfolioDocs(data.supporting_images_data);
        }
        if (Array.isArray(data.certifications_data)) {
          setCertDocs(data.certifications_data);
        }
        if (Array.isArray(data.id_documents_data)) {
          setIdDocs(data.id_documents_data);
        }
            if (typeof window !== "undefined") {
        if (data.id !== undefined && data.id !== null) {
          sessionStorage.setItem("user_Id", String(data.id));
        }
     
      }
      } catch (err) {
        const msg = await parseErrorMessage(err);
        console.error(err);
        setError(msg || "Could not load your profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleFileUpload = async (
    files: FileList | null,
    tag: "profile-photo" | "portfolio" | "certificate" | "id-document"
  ) => {
    if (!files?.length) return;
    setLoading(true);
    try {
      const file = files[0];
      const newDoc = await uploadDocument(
        file,
        file.type.startsWith("image") ? "image" : "pdf",
        tag
      );
      if (newDoc.tag === "profile-photo") setProfilePhoto(newDoc);
      if (newDoc.tag === "portfolio") setPortfolioDocs((d) => [...d, newDoc]);
      if (newDoc.tag === "certificate") setCertDocs((d) => [...d, newDoc]);
      if (newDoc.tag === "id-document") setIdDocs((d) => [...d, newDoc]);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile_picture_data) {
      setError("Please upload your profile photo");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const payload: CompleteProfilePayload = {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        email,
        gender,
        date_of_birth: dob || "",
        referel_code: referralCode,
        offer_chosen: chosenOffer,
        bio,
        travel_policy: travelPolicy,
        type_of_makeup: selectedMakeupIds, // numbers
        products_used: selectedProductIds,
        payment_methods: selectedPaymentIds,
        price_range: priceRange,
        experience_years: experienceYears,
        services: services,
        travel_charges: travelChargesBoolean ? "yes" : "no",
        profile_picture: profile_picture_data!.id,
        certifications: certDocs.map((d) => d.id),
        trial_available: trialAvailableBoolean,
        social_links: {
          instagram: instagramLink,
          facebook: facebookLink || undefined,
        },
        id_documents: idDocs.map((d) => d.id),
        supporting_images: portfolioDocs.map((d) => d.id),
      };
      const finalPayload = payload as CompleteProfilePayload & {
        trial_type?: "free" | "paid";
      };
      if (trialAvailableBoolean) {
        finalPayload.trial_type = trialType;
      }

      await completeProfile(payload);
      console.log("completeProfile payload", payload);
      alert(
        "Your profile has been sent to the admin. You will receive a response within 1-2 working hours"
      );
    } catch (err: unknown) {
      const msg = await parseErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (v: string[]) => void
  ) =>
    setter(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  console.log("type_of_makeup->", selectedMakeupIds);
  console.log("type_of_product->", selectedProductIds);

  return (
    <ProtectedRoute>
      <Layout title="My Profile">
        <LoadingOverlay
          show={loading}
          message={loading ? "Please wait..." : undefined}
        />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  {profile_picture_data ? (
                    <AvatarImage src={profile_picture_data.file_url} />
                  ) : (
                    <AvatarFallback>
                      <Camera />
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e.target.files, "profile-photo")
                  }
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={gender}
                    onValueChange={(v: "male" | "female" | "other") =>
                      setGender(v)
                    }
                  >
                    <div className="flex space-x-4">
                      <div>
                        <RadioGroupItem value="female" id="gender-f" />
                        <Label htmlFor="gender-f"> Female</Label>
                      </div>
                      <div>
                        <RadioGroupItem value="male" id="gender-m" />
                        <Label htmlFor="gender-m"> Male</Label>
                      </div>
                      <div>
                        <RadioGroupItem value="other" id="gender-o" />
                        <Label htmlFor="gender-o"> Other</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                {/* <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div> */}
                <div className="space-y-2">
                  <Label>Referral Code</Label>
                  <Input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label>Offer Chosen</Label>
                  <Input
                    value={chosenOffer}
                    onChange={(e) => setChosenOffer(e.target.value)}
                  />
                </div> */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Input
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <CreditCard />
                Payment Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {paymentOptions.map((pm) => (
                  <Badge
                    key={pm.id}
                    onClick={() =>
                      setSelectedPaymentIds((ids) =>
                        ids.includes(pm.id)
                          ? ids.filter((x) => x !== pm.id)
                          : [...ids, pm.id]
                      )
                    }
                    className={
                      selectedPaymentIds.includes(pm.id)
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-black"
                    }
                  >
                    {pm.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Travel & Trial */}
          {/* Travel & Trial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Travel & Trial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Travel Policy</Label>
                <Select
                  value={travelPolicy}
                  onValueChange={(v) => setTravelPolicy(v)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="anywhere">Anywhere</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Trial Available?</Label>
                <RadioGroup
                  value={String(trialAvailableBoolean)}
                  onValueChange={(v) => setTrialAvailableBoolean(v === "true")}
                >
                  <div className="flex gap-4">
                    <div>
                      <RadioGroupItem value="true" id="trial-yes" />
                      <Label htmlFor="trial-yes"> Yes</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="false" id="trial-no" />
                      <Label htmlFor="trial-no"> No</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* SHOW trial-type ONLY when trialAvailableBoolean === true */}
              {trialAvailableBoolean && (
                <div>
                  <Label>Trial Type</Label>
                  <RadioGroup
                    value={trialType}
                    onValueChange={(v) => setTrialType(v as "free" | "paid")}
                  >
                    <div className="flex gap-4 items-center">
                      <div>
                        <RadioGroupItem value="free" id="trial-free" />
                        <Label htmlFor="trial-free"> Free</Label>
                      </div>
                      <div>
                        <RadioGroupItem value="paid" id="trial-paid" />
                        <Label htmlFor="trial-paid"> Partially Paid</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Makeup Types & Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette />
                  Makeup Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {makeupTypesApi.map((m) => (
                    <Badge
                      key={m.id}
                      onClick={() =>
                        setSelectedMakeupIds((ids) =>
                          ids.includes(m.id)
                            ? ids.filter((x) => x !== m.id)
                            : [...ids, m.id]
                        )
                      }
                      className={
                        selectedMakeupIds.includes(m.id)
                          ? "bg-primary/10 text-primary cursor-pointer"
                          : "bg-gray-100 text-black cursor-pointer"
                      }
                    >
                      {m.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package />
                  Product Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Products */}
                  {productOptions.map((p) => (
                    <Badge
                      key={p.id}
                      onClick={() =>
                        setSelectedProductIds((ids) =>
                          ids.includes(p.id)
                            ? ids.filter((x) => x !== p.id)
                            : [...ids, p.id]
                        )
                      }
                      className={
                        selectedProductIds.includes(p.id)
                          ? "bg-primary/10 text-primary cursor-pointer"
                          : "bg-gray-100 text-black cursor-pointer"
                      }
                    >
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Work Portfolio (Max 8)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {portfolioDocs.map((doc) => (
                  <div key={doc.id} className="relative group">
                    <img
                      src={doc.file_url}
                      alt={doc.file_name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 p-1"
                      onClick={() =>
                        setPortfolioDocs((d) =>
                          d.filter((x) => x.id !== doc.id)
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {portfolioDocs.length < 8 && (
                  <label className="h-24 w-24 border-dashed flex items-center justify-center cursor-pointer rounded-lg">
                    <Upload />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files, "portfolio")
                      }
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {certDocs.map((doc) => (
                  <div key={doc.id} className="relative group">
                    <img
                      src={doc.file_url}
                      alt={doc.file_name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 p-1"
                      onClick={() =>
                        setCertDocs((current) =>
                          current.filter((d) => d.id !== doc.id)
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {certDocs.length < 8 && (
                  <label className="h-24 w-24 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
                    <Upload />
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files, "certificate")
                      }
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                ID Documents (Aadhaar, PAN)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {idDocs.map((doc) => (
                  <div key={doc.id} className="relative group">
                    <img
                      src={doc.file_url}
                      alt={doc.file_name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 p-1"
                      onClick={() =>
                        setIdDocs((d) => d.filter((x) => x.id !== doc.id))
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {idDocs.length < 4 && (
                  <label className="h-24 w-24 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
                    <Upload />
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files, "id-document")
                      }
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-primary" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Instagram URL"
                value={instagramLink}
                onChange={(e) => setInstagramLink(e.target.value)}
              />
              <Input
                placeholder="Facebook URL"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
              />
                <Input
                placeholder="YouTube URL"
                value={ytLink}
                onChange={(e) => setYTLink(e.target.value)}
              />  <Input
                placeholder="Twitter URL"
                value={twitterLink}
                onChange={(e) => setTwitterLink(e.target.value)}
              />
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white"
            >
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
function setSelectedServices(arg0: string[]) {
  throw new Error("Function not implemented.");
}
