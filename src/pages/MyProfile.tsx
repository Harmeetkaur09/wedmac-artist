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
  CompleteProfilePayload,getMyProfile, DocumentData 
} from "@/api/profile";
import type { MyProfile } from "@/api/profile";

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
const [productOptions, setProductOptions] = useState<{ id: number; name: string }[]>([]);
const [paymentOptions, setPaymentOptions] = useState<{ id: number; name: string }[]>([]);
const [makeupTypesApi, setMakeupTypesApi] = useState<{ id: number; name: string }[]>([]);

  // — makeup, products, services
  const [typeOfMakeup, setTypeOfMakeup] = useState("");
const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
const [selectedMakeupIds, setSelectedMakeupIds] = useState<number[]>([]);

  // — pricing & experience
  const [priceRange, setPriceRange] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);

  // — travel & trial
  const [travelChargesBoolean, setTravelChargesBoolean] = useState<boolean>(
    false
  );
  const [trialAvailableBoolean, setTrialAvailableBoolean] = useState<boolean>(
    false
  );

  // — social
  const [instagramLink, setInstagramLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");

  // — payment methods (UI only)
 

  // — document uploads
// — document uploads
const [profile_picture_data, setProfilePhoto] = useState<DocumentData | null>(null);
const [portfolioDocs, setPortfolioDocs] = useState<DocumentData[]>([]);
const [certDocs, setCertDocs] = useState<DocumentData[]>([]);
const [travelPolicy, setTravelPolicy] = useState("local");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
  Promise.all([
    fetch("https://wedmac-services.onrender.com/api/admin/master/list/?type=makeup_types").then(r => r.json()),
    fetch("https://wedmac-services.onrender.com/api/admin/master/list/?type=products").then(r => r.json()),
    fetch("https://wedmac-services.onrender.com/api/admin/master/list/?type=payment_methods").then(r => r.json()),
  ])
  .then(([makeups, products, payments]) => {
    setMakeupTypesApi(makeups);
    setProductOptions(products);
    setPaymentOptions(payments);
  })
  .catch(err => console.error("Master‐list load error:", err));
}, []);

// fetch and prefill
  useEffect(() => {
    setLoading(true);
    getMyProfile()
      .then((data: MyProfile) => {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setPhoneNumber(data.phone);
        setEmail(data.email);
        setGender(data.gender);
        if (data.date_of_birth) setDob(data.date_of_birth);
        setReferralCode(data.referel_code);
        setChosenOffer(data.offer_chosen);
        setBio(data.bio);

        setSelectedMakeupIds((data.type_of_makeup || []).map(Number));
        setSelectedProductIds((data.products_used || []).map(Number));
        setSelectedServices(data.services || []);
        setPriceRange(data.price_range);
        setExperienceYears(data.experience_years);
        setTravelChargesBoolean(data.travel_charges);
        setTrialAvailableBoolean(data.trial_available);
        setInstagramLink(data.social_links.instagram);
        setFacebookLink(data.social_links.facebook||"");

        // documents
        data.id_documents_data.forEach(doc => {
          if (doc.tag === "profile-photo")  setProfilePhoto(doc);
          if (doc.tag === "portfolio")      setPortfolioDocs(d=>[...d,doc]);
          if (doc.tag === "certificate")    setCertDocs(d=>[...d,doc]);
        });
      })
      .catch(err => {
        console.error(err);
        setError("Could not load your profile");
      })
      .finally(() => setLoading(false));
  }, []);


const handleFileUpload = async (
  files: FileList | null,
  tag: 'profile-photo' | 'portfolio' | 'certificate' | 'id-document'
) => {
    if (!files?.length) return;
    setLoading(true);
    try {
      const file = files[0];
      const newDoc = await uploadDocument(
        file,
        file.type.startsWith('image') ? 'image' : 'pdf',
        tag
      );
      if (newDoc.tag === 'profile-photo')  setProfilePhoto(newDoc);
      if (newDoc.tag === 'portfolio')      setPortfolioDocs(d=>[...d,newDoc]);
      if (newDoc.tag === 'certificate')    setCertDocs(d=>[...d,newDoc]);
      if (newDoc.tag === 'id-document') setIdDocs(d => [...d, newDoc]);

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
    if (!setProfilePhoto) {
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
        date_of_birth: dob,
        referel_code: referralCode,
        offer_chosen: chosenOffer,
        bio,
        type_of_makeup: selectedMakeupIds, // [1,2,…]
        products_used: selectedProductIds,
        payment_methods: selectedPaymentIds,
        price_range: priceRange,
        experience_years: experienceYears,
        travel_charges: travelChargesBoolean ? "yes" : "no",
        // travel_policy:    travelPolicy,         // "local" or "anywhere"
        trial_available: trialAvailableBoolean,
        social_links: { instagram: instagramLink, facebook: facebookLink },
        profile_picture: profile_picture_data?.id,
        id_documents: [
          profile_picture_data?.id,
          ...portfolioDocs.map(d => d.id),
          ...certDocs.map(d => d.id),
          ...idDocs.map(d => d.id),
        ],
        services: [],
        certifications: []
      };
      await completeProfile(payload);
      alert("Profile completed!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // — static options
  const makeupTypes = [
    "Natural Makeup",
    "Party Makeup",
    "Bridal Makeup",
    "Haldi Makeup",
    "Mehendi Makeup",
    "Reception Makeup",
    "Engagement Makeup",
    "Traditional Makeup",
    "HD Makeup",
    "Airbrush Makeup",
    "Editorial Makeup",
    "Fashion Makeup",
  ];
  const productBrands = [
    "MAC",
    "Huda Beauty",
    "Nykaa",
    "Lakme",
    "Maybelline",
    "L'Oreal",
    "Urban Decay",
    "Too Faced",
    "Charlotte Tilbury",
    "Fenty Beauty",
    "Rare Beauty",
    "Morphe",
    "Anastasia Beverly Hills",
    "Other",
  ];
  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Net Banking",
    "PayPal",
    "Paytm",
    "PhonePe",
    "Google Pay",
    "Bank Transfer",
  ];

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (v: string[]) => void
  ) =>
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  return (
    <Layout title="My Profile">
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
                {profile_picture_data
                  ? <AvatarImage src={profile_picture_data.file_url} />
                  : <AvatarFallback><Camera/></AvatarFallback>
                }
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files, "profile-photo")}
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
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(v: "male" | "female" | "other") => setGender(v)}
                >
                  <div className="flex space-x-4">
                    <div>
                      <RadioGroupItem value="female" id="gender-f" />
                      <Label htmlFor="gender-f">Female</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="male" id="gender-m" />
                      <Label htmlFor="gender-m">Male</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="other" id="gender-o" />
                      <Label htmlFor="gender-o">Other</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Referral Code</Label>
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Offer Chosen</Label>
                <Input
                  value={chosenOffer}
                  onChange={(e) => setChosenOffer(e.target.value)}
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
  <CardHeader><CardTitle><CreditCard /></CardTitle></CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {paymentOptions.map((pm) => (
  <Badge
    key={pm.id}
    onClick={() =>
      setSelectedPaymentIds(ids =>
        ids.includes(pm.id)
          ? ids.filter(x => x !== pm.id)
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
                    <Label htmlFor="trial-yes">Yes</Label>
                  </div>
                  <div>
                    <RadioGroupItem value="false" id="trial-no" />
                    <Label htmlFor="trial-no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Makeup Types & Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card>
  <CardHeader><CardTitle><Palette /></CardTitle></CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
   {makeupTypesApi.map((m) => (
  <Badge
    key={m.id}
    onClick={() => setSelectedMakeupIds(ids =>
      ids.includes(m.id) ? ids.filter(x => x !== m.id) : [...ids, m.id]
    )}
    className={selectedMakeupIds.includes(m.id)
      ? "bg-primary/10 text-primary cursor-pointer" 
      : "bg-gray-100 text-black cursor-pointer"}
  >
    {m.name}
  </Badge>
))}

    </div>
  </CardContent>
</Card>

        <Card>
  <CardHeader><CardTitle><Package /></CardTitle></CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
     {/* Products */}
{productOptions.map((p) => (
  <Badge
    key={p.id}
    onClick={() =>
      setSelectedProductIds(ids =>
        ids.includes(p.id)
          ? ids.filter(x => x !== p.id)
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
              {portfolioDocs.map(doc => (
                <div key={doc.id} className="relative group">
                  <img src={doc.file_url} alt={doc.file_name}
                       className="h-24 w-24 object-cover rounded-lg"/>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 p-1"
                    onClick={()=>setPortfolioDocs(d=>d.filter(x=>x.id!==doc.id))}
                  ><X className="w-3 h-3"/></Button>
                </div>
              ))}
              {portfolioDocs.length < 8 && (
                <label className="h-24 w-24 border-dashed flex items-center justify-center cursor-pointer rounded-lg">
                  <Upload/>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e=>handleFileUpload(e.target.files,'portfolio')}
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
      {certDocs.map(doc => (
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
              setCertDocs(current => current.filter(d => d.id !== doc.id))
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
            onChange={e =>
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
      {idDocs.map(doc => (
        <div key={doc.id} className="relative group">
          <img src={doc.file_url} alt={doc.file_name} className="h-24 w-24 object-cover rounded-lg" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 p-1"
            onClick={() => setIdDocs(d => d.filter(x => x.id !== doc.id))}
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
            onChange={e => handleFileUpload(e.target.files, "id-document")}
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
  );
}
function setSelectedServices(arg0: string[]) {
  throw new Error("Function not implemented.");
}

