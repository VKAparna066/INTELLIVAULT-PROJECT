import { useState, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Shield, Upload, Search, Bell, Activity, Settings, LogOut,
  FileText, ShieldAlert, Key, FileCheck, Brain, Plus, Lock,
  Trash2, RotateCcw, Edit3, Eye, Download, AlertTriangle,
  FolderLock, Zap, Clock, BarChart3, Cpu, Wifi, Smartphone,
  CheckSquare, Square, X, Info, RefreshCw,
  Flame, TrendingUp, Globe, KeyRound, Sun, Moon
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

import { mockDocuments, mockStats, mockAlerts, mockAuditLogs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Doc = (typeof mockDocuments)[number] & {
  riskScore?: number;
  isOneTimeView?: boolean;
  isDeleted?: boolean;
  _blobUrl?: string;
  _fileName?: string;
};

type DeviceEntry = {
  id: number;
  device: string;
  trust: number;
  status: "Trusted" | "Verified" | "Blocked";
  location: string;
  lastSeen: string;
};

type TabId = "documents" | "alerts" | "audit" | "trash" | "vault" | "timeline" | "analytics" | "settings";

const CATEGORIES = ["All", "Personal", "Education", "Financial", "Medical", "Legal"];

const SECURITY_ANALYTICS = [
  { month: "Jan", threats: 2, accesses: 45 },
  { month: "Feb", threats: 1, accesses: 52 },
  { month: "Mar", threats: 4, accesses: 61 },
  { month: "Apr", threats: 0, accesses: 38 },
  { month: "May", threats: 3, accesses: 70 },
  { month: "Jun", threats: 1, accesses: 55 },
];

const TIMELINE_EVENTS = [
  { year: "2021", label: "Education Docs", docs: [{ name: "10th Marksheet" }, { name: "12th Certificate" }] },
  { year: "2022", label: "Identity Docs", docs: [{ id: 6, name: "Aadhaar Card" }, { name: "PAN Card" }, { id: 1, name: "Passport" }] },
  { year: "2023", label: "Career Docs", docs: [{ id: 7, name: "B.Tech Degree" }, { name: "Resume 2025" }, { name: "Internship Letter" }] },
  { year: "2024", label: "Financial Docs", docs: [{ id: 2, name: "Q4 Financial Report" }, { id: 5, name: "Crypto Seed Phrases" }, { name: "Salary Slip" }] },
  { year: "2025", label: "Current Docs", docs: [{ name: "Medical Insurance" }, { name: "Property Agreement" }] },
];

function getRiskColor(risk: string) {
  switch (risk) {
    case "low": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-400";
  }
}

function getRiskScoreColor(score: number) {
  if (score >= 80) return "text-red-400";
  if (score >= 50) return "text-yellow-400";
  return "text-green-400";
}

function getRiskScoreBar(score: number) {
  if (score >= 80) return "bg-red-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-green-500";
}

function getExpiryStatus(expiryDate?: string | null) {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff < 0) return "expired";
  if (diff < 30 * 24 * 60 * 60 * 1000) return "expiring";
  return "active";
}

// ────────────────────────────────────────────
// Edit Document Modal
// ────────────────────────────────────────────
function EditDocModal({ doc, onSave, onClose }: { doc: Doc; onSave: (d: Partial<Doc>) => void; onClose: () => void }) {
  const [name, setName] = useState(doc.name);
  const [category, setCategory] = useState(doc.category);
  const [expiryDate, setExpiryDate] = useState(doc.expiryDate || "");
  const [isSelfDestruct, setIsSelfDestruct] = useState(doc.isSelfDestruct || false);
  const [isOneTimeView, setIsOneTimeView] = useState(doc.isOneTimeView || false);
  return (
    <DialogContent className="sm:max-w-[480px] bg-card border-white/10 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Edit3 className="w-5 h-5 text-primary" /> Edit Document
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-sm">Update document properties and security settings.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Document Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} className="bg-background border-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["personal","education","financial","medical","legal","other"].map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="bg-background border-white/10" />
          </div>
        </div>
        <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Self-Destruct</p><p className="text-xs text-muted-foreground">Auto-delete after view limit</p></div>
            <Switch checked={isSelfDestruct} onCheckedChange={setIsSelfDestruct} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">One-Time View</p><p className="text-xs text-muted-foreground">Lock after a single access</p></div>
            <Switch checked={isOneTimeView} onCheckedChange={setIsOneTimeView} />
          </div>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="bg-primary text-primary-foreground font-bold" onClick={() => onSave({ name, category, expiryDate, isSelfDestruct, isOneTimeView })}>
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ────────────────────────────────────────────
// Upload Modal — stores real File for download
// ────────────────────────────────────────────
function UploadModal({ onUpload, onClose }: { onUpload: (doc: Partial<Doc>, file?: File) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("personal");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSelfDestruct, setIsSelfDestruct] = useState(false);
  const [isOneTimeView, setIsOneTimeView] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [tags, setTags] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setPickedFile(f); if (!name) setName(f.name.replace(/\.[^.]+$/, "")); };

  const handleSubmit = () => {
    const docName = name || pickedFile?.name || "";
    if (!docName) return;
    const newDoc: Partial<Doc> = {
      id: Date.now(),
      name: docName,
      category,
      fileType: pickedFile ? pickedFile.name.split(".").pop() || "pdf" : "pdf",
      fileSize: pickedFile?.size ?? Math.floor(Math.random() * 1024 * 1024),
      expiryDate: expiryDate || null,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      isEncrypted: true,
      isSelfDestruct,
      isOneTimeView,
      viewCount: 0,
      maxViews: maxViews ? parseInt(maxViews) : undefined,
      fraudRisk: "low",
      riskScore: 25,
      aiSummary: `AI-analyzed: ${docName}. Auto-classified and encrypted.`,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _fileName: pickedFile?.name,
    };
    onUpload(newDoc, pickedFile || undefined);
  };

  return (
    <DialogContent className="sm:max-w-[520px] bg-card border-white/10 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-5 h-5 text-primary" /> Secure Upload
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Files are AES-256 encrypted before storage.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        {/* Drop zone */}
        <div
          className={cn("border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
            dragging ? "border-primary bg-primary/10" : "border-white/20 hover:border-primary/50 hover:bg-primary/5"
          )}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          {pickedFile
            ? <p className="font-medium text-primary">{pickedFile.name} <span className="text-xs text-muted-foreground">({(pickedFile.size / 1024).toFixed(0)} KB)</span></p>
            : <><p className="text-sm font-medium">Drag & drop or click to browse</p><p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX, TXT supported</p></>
          }
        </div>
        <Input placeholder="Document name" value={name} onChange={e => setName(e.target.value)} className="bg-background border-white/10" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["personal","education","financial","medical","legal","other"].map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expiry Date</Label>
            <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="bg-background border-white/10" />
          </div>
        </div>
        <Input placeholder="Tags (comma separated: id, govt, important)" value={tags} onChange={e => setTags(e.target.value)} className="bg-background border-white/10" />
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" />Self-Destruct</p><p className="text-xs text-muted-foreground">Auto-delete after view limit</p></div>
            <Switch checked={isSelfDestruct} onCheckedChange={setIsSelfDestruct} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-purple-400" />One-Time View</p><p className="text-xs text-muted-foreground">Lock document after 1 access</p></div>
            <Switch checked={isOneTimeView} onCheckedChange={setIsOneTimeView} />
          </div>
          {isSelfDestruct && !isOneTimeView && (
            <Input type="number" placeholder="Max views (e.g. 5)" value={maxViews} onChange={e => setMaxViews(e.target.value)} className="bg-background border-white/10" min="1" />
          )}
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="bg-primary text-primary-foreground font-bold gap-2" onClick={handleSubmit} disabled={!name && !pickedFile}>
          <Lock className="w-4 h-4" /> Upload & Encrypt
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ────────────────────────────────────────────
// PIN Modal
// ────────────────────────────────────────────
function PinModal({ onVerify, onClose, attemptsLeft }: { onVerify: (pin: string) => void; onClose: () => void; attemptsLeft?: number }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = () => {
    if (pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    setError("");
    onVerify(pin);
  };
  return (
    <DialogContent className="sm:max-w-[380px] bg-card border-white/10 text-white text-center">
      <DialogHeader>
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
          <FolderLock className="w-8 h-8 text-primary" />
        </div>
        <DialogTitle className="text-xl">Enter Vault PIN</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Enter your PIN to access the Secure Personal Folder.</DialogDescription>
      </DialogHeader>
      <div className="mt-4 space-y-3">
        <Input
          type="password" inputMode="numeric" maxLength={8} value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="••••"
          className="bg-background border-white/20 text-center text-2xl tracking-[1rem] font-bold"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {attemptsLeft !== undefined && attemptsLeft < 3 && (
          <p className="text-yellow-400 text-xs">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before vault locks</p>
        )}
        <p className="text-xs text-muted-foreground">Demo: <code className="bg-white/10 px-1 rounded">1234</code> (real) · <code className="bg-white/10 px-1 rounded">0000</code> (decoy)</p>
      </div>
      <DialogFooter className="mt-4 flex flex-col gap-2">
        <Button className="w-full bg-primary text-primary-foreground font-bold" onClick={handleSubmit}>Unlock Vault</Button>
        <Button variant="ghost" className="w-full" onClick={onClose}>Cancel</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ────────────────────────────────────────────
// Change PIN Modal
// ────────────────────────────────────────────
function ChangePinModal({ onSave, onClose }: { onSave: (main: string, decoy: string) => void; onClose: () => void }) {
  const [mainPin, setMainPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [decoyPin, setDecoyPin] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (mainPin.length < 4) { setError("Main PIN must be at least 4 digits"); return; }
    if (mainPin !== confirmPin) { setError("PINs do not match"); return; }
    if (decoyPin && decoyPin === mainPin) { setError("Decoy PIN must be different from main PIN"); return; }
    if (decoyPin && decoyPin.length < 4) { setError("Decoy PIN must be at least 4 digits"); return; }
    setError("");
    onSave(mainPin, decoyPin);
  };

  return (
    <DialogContent className="sm:max-w-[400px] bg-card border-white/10 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <KeyRound className="w-5 h-5 text-primary" /> Change Vault PIN
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Set a new PIN and optionally a decoy PIN for duress situations.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">New Main PIN</Label>
          <Input type="password" inputMode="numeric" maxLength={8} placeholder="Enter new PIN (min 4 digits)"
            value={mainPin} onChange={e => setMainPin(e.target.value.replace(/\D/g, ""))}
            className="bg-background border-white/10 tracking-widest font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm New PIN</Label>
          <Input type="password" inputMode="numeric" maxLength={8} placeholder="Re-enter new PIN"
            value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="bg-background border-white/10 tracking-widest font-bold" />
        </div>
        <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl space-y-2">
          <p className="text-xs font-semibold text-orange-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />Decoy PIN (Optional)</p>
          <p className="text-xs text-muted-foreground">If someone forces you to open the vault, enter this PIN to show fake documents instead.</p>
          <Input type="password" inputMode="numeric" maxLength={8} placeholder="Decoy PIN (optional)"
            value={decoyPin} onChange={e => setDecoyPin(e.target.value.replace(/\D/g, ""))}
            className="bg-background border-white/10 tracking-widest font-bold" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="bg-primary text-primary-foreground font-bold" onClick={handleSave}>Save New PIN</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ────────────────────────────────────────────
// Add Device Modal
// ────────────────────────────────────────────
function AddDeviceModal({ onAdd, onClose }: { onAdd: (d: Omit<DeviceEntry, "id">) => void; onClose: () => void }) {
  const [device, setDevice] = useState("");
  const [location, setLocation] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [trust, setTrust] = useState("80");
  const [status, setStatus] = useState<"Trusted" | "Verified" | "Blocked">("Trusted");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!device.trim()) { setError("Device name is required"); return; }
    if (!location.trim()) { setError("Location is required"); return; }
    if (!lastSeen.trim()) { setError("Last seen is required"); return; }
    const t = parseInt(trust);
    if (isNaN(t) || t < 0 || t > 100) { setError("Trust score must be 0–100"); return; }
    setError("");
    onAdd({ device: device.trim(), location: location.trim(), lastSeen: lastSeen.trim(), trust: t, status });
  };

  return (
    <DialogContent className="sm:max-w-[440px] bg-card border-white/10 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Smartphone className="w-5 h-5 text-primary" /> Add Trusted Device
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Register a device you use to access your vault.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Device Name</Label>
          <Input placeholder='e.g. "MacBook Pro (Chrome)"' value={device} onChange={e => setDevice(e.target.value)} className="bg-background border-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Location</Label>
            <Input placeholder='e.g. "Mumbai, India"' value={location} onChange={e => setLocation(e.target.value)} className="bg-background border-white/10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Seen</Label>
            <Input placeholder='e.g. "2 min ago"' value={lastSeen} onChange={e => setLastSeen(e.target.value)} className="bg-background border-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Trust Score (0–100)</Label>
            <Input type="number" min="0" max="100" value={trust} onChange={e => setTrust(e.target.value)} className="bg-background border-white/10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as any)}>
              <SelectTrigger className="bg-background border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Trusted">Trusted</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="bg-primary text-primary-foreground font-bold gap-2" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Device
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("documents");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [panicMode, setPanicMode] = useState(false);
  const [panicOptions, setPanicOptions] = useState({
    sessionsKilled: false,
    downloadsBlocked: false,
    vaultSealed: false,
    emergencyPurge: false,
  });

  // Vault PIN state
  const [vaultState, setVaultState] = useState<"locked" | "unlocked" | "decoy">("locked");
  const [pinOpen, setPinOpen] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [vaultPin, setVaultPin] = useState("1234");
  const [vaultDecoyPin, setVaultDecoyPin] = useState("0000");

  // Device trust - real manual entries
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  // Blob URL map for downloaded files
  const blobUrls = useRef<Map<number, { url: string; name: string }>>(new Map());

  const { toast } = useToast();

  const [docs, setDocs] = useState<Doc[]>(
    mockDocuments.map(d => ({ ...d, riskScore: Math.floor(Math.random() * 60) + 20, isOneTimeView: d.id === 2, isDeleted: false }))
  );

  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("intellivault-theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeMode(initialTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(themeMode);
    window.localStorage.setItem("intellivault-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    // Pre-create download blobs for demo documents so all rows can be downloaded.
    docs.forEach((doc) => {
      if (!blobUrls.current.has(doc.id)) {
        const blob = new Blob([`Demo content for ${doc.name}`], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        blobUrls.current.set(doc.id, { url, name: doc.name });
      }
    });

    return () => {
      blobUrls.current.forEach((entry) => URL.revokeObjectURL(entry.url));
      blobUrls.current.clear();
    };
  }, [docs]);
  const [storageUsed, setStorageUsed] = useState<number>(mockStats.storageUsed);
  const storageLimit = mockStats.storageLimit;

  const alerts = mockAlerts;
  const auditLogs = mockAuditLogs;

  const activeDocs = docs.filter(d => !d.isDeleted);
  const trashedDocs = docs.filter(d => d.isDeleted);

  const filteredDocs = activeDocs.filter(d => {
    const catMatch = selectedCategory === "All" || d.category.toLowerCase() === selectedCategory.toLowerCase();
    const searchMatch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || (d.aiSummary || "").toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  // ── Handlers ──
  const handleLogout = useCallback(() => {
    toast({ title: "Logged out", description: "You have been securely logged out." });
    setTimeout(() => {
      window.location.href = "/signin";
    }, 500);
  }, [toast]);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === "dark" ? "light" : "dark");
    toast({ title: "Mood toggled", description: `Switched to ${themeMode === "dark" ? "light" : "dark"} mode.`, variant: "default" });
  }, [toast, themeMode]);

  const handleUpload = useCallback((newDoc: Partial<Doc>, file?: File) => {
    const id = newDoc.id as number;
    if (file) {
      const url = URL.createObjectURL(file);
      blobUrls.current.set(id, { url, name: file.name });
      const addedSize = file.size || 0;
      setStorageUsed(prev => Math.min(storageLimit, prev + addedSize));
      newDoc.fileSize = addedSize;
    } else if (newDoc.fileSize) {
      setStorageUsed(prev => Math.min(storageLimit, prev + newDoc.fileSize));
    }
    setDocs(prev => [newDoc as Doc, ...prev]);
    setUploadOpen(false);
    toast({ title: "Document Uploaded & Encrypted", description: "AI has analyzed and classified your document." });
  }, [toast, storageLimit]);

  const handleDownload = useCallback((doc: Doc) => {
    const entry = blobUrls.current.get(doc.id);
    if (entry) {
      const a = document.createElement("a");
      a.href = entry.url;
      a.download = entry.name;
      a.click();
      toast({ title: "File downloaded", description: `${doc.name} has started downloading.`, variant: "success" });
      return;
    }

    if (doc._fileName) {
      // Fallback: create a synthetic download when file exists logically but blob URL was not preserved.
      const fallbackBlob = new Blob([`Download content for ${doc._fileName}`], { type: "application/octet-stream" });
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      const a = document.createElement("a");
      a.href = fallbackUrl;
      a.download = doc._fileName;
      a.click();
      URL.revokeObjectURL(fallbackUrl);
      toast({ title: "File downloaded", description: "Downloaded synthetic placeholder content.", variant: "success" });
      return;
    }

    toast({ title: "File not available for download", description: "Only documents uploaded this session can be downloaded. Pre-loaded demo docs don't have real files attached.", variant: "destructive" });
  }, [toast]);

  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip();

    await Promise.all(activeDocs.map(async (doc) => {
      const entry = blobUrls.current.get(doc.id);
      if (entry) {
        const response = await fetch(entry.url);
        const blob = await response.blob();
        zip.file(`${doc.name}`, blob);
      } else {
        const fallbackBlob = new Blob([`Synthetic content for ${doc.name}`], { type: "text/plain" });
        zip.file(`${doc.name}.txt`, fallbackBlob);
      }
    }));

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `intellivault-${new Date().toISOString().slice(0,10)}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);

    toast({ title: "ZIP downloaded", description: "All available vault documents are packaged into a ZIP file.", variant: "success" });
  }, [activeDocs, toast]);

  const handleTrash = useCallback((id: number) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, isDeleted: true } : d));
    setSelectedIds(prev => prev.filter(x => x !== id));
    toast({ title: "Moved to Trash", description: "Restore anytime within 30 days." });
  }, [toast]);

  const handleBulkTrash = useCallback(() => {
    setDocs(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, isDeleted: true } : d));
    toast({ title: `${selectedIds.length} documents moved to Trash` });
    setSelectedIds([]);
  }, [selectedIds, toast]);

  const handleRestore = useCallback((id: number) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, isDeleted: false } : d));
    toast({ title: "Document Restored" });
  }, [toast]);

  const handlePermanentDelete = useCallback((id: number) => {
    setDocs(prev => {
      const docToDelete = prev.find(d => d.id === id);
      if (docToDelete?.fileSize) {
        setStorageUsed(prevUsed => Math.max(0, prevUsed - docToDelete.fileSize));
      }
      return prev.filter(d => d.id !== id);
    });

    blobUrls.current.delete(id);
    setSelectedIds(prev => prev.filter(x => x !== id));
    toast({ title: "Permanently Deleted", variant: "destructive" });
  }, [toast]);

  const handleTimelineDownload = useCallback((entryName: string, doc?: Doc) => {
    if (doc) {
      handleDownload(doc);
      return;
    }

    const fallbackName = entryName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
    const fallbackBlob = new Blob([`Timeline document: ${entryName}`], { type: "application/octet-stream" });
    const fallbackUrl = URL.createObjectURL(fallbackBlob);
    const a = document.createElement("a");
    a.href = fallbackUrl;
    a.download = `${fallbackName || "timeline-file"}.txt`;
    a.click();
    URL.revokeObjectURL(fallbackUrl);

    toast({ title: "Timeline file downloaded", description: `${entryName} downloaded as fallback content.`, variant: "default" });
  }, [handleDownload, toast]);

  const handleEdit = useCallback((updated: Partial<Doc>) => {
    setDocs(prev => prev.map(d => d.id === editDoc?.id ? { ...d, ...updated } : d));
    setEditDoc(null);
    toast({ title: "Document Updated" });
  }, [editDoc, toast]);

  const handlePinVerify = useCallback((pin: string) => {
    if (pin === vaultDecoyPin) {
      setVaultState("decoy"); setPinOpen(false); setPinAttempts(0);
      toast({ title: "Decoy Vault Opened", description: "Showing decoy documents for safety." });
    } else if (pin === vaultPin) {
      setVaultState("unlocked"); setPinOpen(false); setPinAttempts(0);
      toast({ title: "Vault Unlocked", description: "Welcome to your Secure Personal Folder." });
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      if (attempts >= 3) {
        setPinOpen(false);
        toast({ title: "Vault Locked — 3 failed attempts", description: "Try again in 5 minutes.", variant: "destructive" });
      } else {
        toast({ title: "Incorrect PIN", description: `${3 - attempts} attempt${3 - attempts !== 1 ? "s" : ""} remaining.`, variant: "destructive" });
      }
    }
  }, [pinAttempts, vaultPin, vaultDecoyPin, toast]);

  const handleChangePin = useCallback((main: string, decoy: string) => {
    setVaultPin(main);
    if (decoy) setVaultDecoyPin(decoy);
    setChangePinOpen(false);
    setPinAttempts(0);
    toast({ title: "PIN Changed Successfully", description: decoy ? "Main PIN and decoy PIN updated." : "Main PIN updated." });
  }, [toast]);

  const handlePanic = useCallback(() => {
    setPanicMode(true);
    setVaultState("locked");
    setSelectedIds([]);
    setPanicOptions({ sessionsKilled: true, downloadsBlocked: true, vaultSealed: true, emergencyPurge: false });
    toast({ title: "PANIC MODE ACTIVATED", description: "All vaults locked, sessions terminated, downloads blocked.", variant: "destructive" });
  }, [toast]);

  const togglePanicOption = useCallback((option: keyof typeof panicOptions) => {
    setPanicOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  }, []);

  const clearPanic = useCallback(() => {
    setPanicMode(false);
    setPanicOptions({ sessionsKilled: false, downloadsBlocked: false, vaultSealed: false, emergencyPurge: false });
    setVaultState("locked");
    toast({ title: "Panic mode cleared", description: "System is back to normal monitoring mode.", variant: "default" });
  }, [toast]);

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedIds.includes(d.id));
  const toggleAll = () => setSelectedIds(allSelected ? [] : filteredDocs.map(d => d.id));

  const NAV_ITEMS: { id: TabId; icon: typeof FileText; label: string; badge?: number }[] = [
    { id: "documents", icon: FileText, label: "My Vault", badge: activeDocs.length },
    { id: "alerts", icon: Bell, label: "Smart Alerts", badge: alerts.filter(a => !a.isRead).length },
    { id: "audit", icon: Activity, label: "Audit Trail" },
    { id: "trash", icon: Trash2, label: "Trash", badge: trashedDocs.length || undefined },
    { id: "vault", icon: FolderLock, label: "Secure Folder" },
    { id: "timeline", icon: Clock, label: "Timeline" },
    { id: "analytics", icon: BarChart3, label: "Security Analytics" },
    { id: "settings", icon: Settings, label: "Device Trust" },
  ];

  if (panicMode) {
    return (
      <div className="min-h-screen bg-red-950 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center space-y-4 max-w-md w-full p-4">
          <div className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center mx-auto animate-pulse">
            <Zap className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-red-400">PANIC MODE ACTIVE</h1>
          <p className="text-red-300 text-lg">Emergency protocol engaged. Choose protective lockdown options below.</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {(
              [
                ["vaultSealed", "Vault Sealed"],
                ["sessionsKilled", "Kill Sessions"],
                ["downloadsBlocked", "Block Downloads"],
                ["emergencyPurge", "Emergency Purge"],
              ] as const
            ).map(([key, label]) => (
              <button key={key} onClick={() => togglePanicOption(key)} className={cn(
                "rounded-lg border p-2 font-semibold",
                panicOptions[key] ? "bg-red-600/20 border-red-400 text-red-200" : "bg-white/10 border-white/20 text-white"
              )}>
                {label}: {panicOptions[key] ? "ON" : "OFF"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" className="bg-white/10 border-white/20" onClick={clearPanic}>Clear Panic</Button>
            <Button variant="destructive" onClick={() => { setDocs([]); setSelectedIds([]); toast({ title: "Safe-Mode wiped", description: "Local document cache cleared.", variant: "destructive" }); }}>Wipe Private Cache</Button>
          </div>

          <div className="mt-4 text-xs text-red-300">
            Hotkey: press <kbd className="rounded bg-red-800 px-1">Esc</kbd> or click Clear to resume secure vault state.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-5">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-bold text-lg text-white">IntelliVault<span className="text-primary">.AI</span></span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm",
              activeTab === item.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}>
              <div className="flex items-center gap-2.5"><item.icon className="w-4 h-4" />{item.label}</div>
              {item.badge ? (
                <span className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded-full",
                  item.id === "trash"
                    ? "bg-orange-500/20 text-orange-400"
                    : item.id === "alerts"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-primary/20 text-primary"
                )}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-3 space-y-2">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Storage</span>
              <span className="text-white font-medium">{(storageUsed / (1024 ** 3)).toFixed(2)} / {(storageLimit / (1024 ** 3)).toFixed(0)} GB</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (storageUsed / storageLimit) * 100)}%` }} />
            </div>
          </div>
          <button onClick={handlePanic} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors rounded-xl text-sm font-bold border border-red-500/20">
            <Zap className="w-4 h-4" /> PANIC BUTTON
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-muted-foreground hover:text-white transition-colors rounded-xl text-sm hover:bg-white/5">
            <LogOut className="w-4 h-4" /> Lock & Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">
                {activeTab === "documents" ? "My Vault" : activeTab === "vault" ? "Secure Folder" : activeTab === "settings" ? "Device Trust" : activeTab.replace("-", " ")}
              </h1>
              <p className="text-sm text-muted-foreground">Session encrypted · AI monitoring active</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-1 rounded-full">
                {themeMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Mood: {themeMode === "dark" ? "Light" : "Dark"}
              </Button>

              {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkTrash} className="gap-1.5 text-xs">
                  <Trash2 className="w-3.5 h-3.5" /> Trash {selectedIds.length}
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadZip}>
                <Download className="w-4 h-4" /> Download vault ZIP
              </Button>
              {activeTab === "documents" && (
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground font-bold gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                      <Plus className="w-4 h-4" /> Secure Upload
                    </Button>
                  </DialogTrigger>
                  <UploadModal onUpload={handleUpload} onClose={() => setUploadOpen(false)} />
                </Dialog>
              )}
              {activeTab === "settings" && (
                <Dialog open={addDeviceOpen} onOpenChange={setAddDeviceOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground font-bold gap-2">
                      <Plus className="w-4 h-4" /> Add Device
                    </Button>
                  </DialogTrigger>
                  <AddDeviceModal
                    onAdd={d => { setDevices(prev => [...prev, { ...d, id: Date.now() }]); setAddDeviceOpen(false); toast({ title: "Device Added", description: `${d.device} registered.` }); }}
                    onClose={() => setAddDeviceOpen(false)}
                  />
                </Dialog>
              )}
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total Vaulted", value: activeDocs.length, icon: FileCheck, color: "text-primary", bg: "bg-primary/10" },
              { label: "Encrypted", value: activeDocs.filter(d => d.isEncrypted).length, icon: Lock, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Expiring Soon", value: activeDocs.filter(d => getExpiryStatus(d.expiryDate) === "expiring").length, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "High Risk", value: activeDocs.filter(d => d.fraudRisk === "high").length, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
              { label: "In Trash", value: trashedDocs.length, icon: Trash2, color: "text-orange-400", bg: "bg-orange-500/10" },
            ].map((s) => (
              <div key={s.label} className="bg-card/60 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                  <s.icon className={cn("w-4 h-4", s.color)} />
                </div>
                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-white">{s.value}</p></div>
              </div>
            ))}
          </div>

          {/* ── Documents Tab ── */}
          {activeTab === "documents" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name, tag, or AI summary…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-card border-white/10" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                      selectedCategory === cat ? "bg-primary text-black border-primary" : "border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                    )}>{cat}</button>
                  ))}
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                  <span className="text-primary font-medium">{selectedIds.length} selected</span>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="h-7 text-xs">Clear</Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkTrash} className="h-7 text-xs gap-1"><Trash2 className="w-3 h-3" />Move to Trash</Button>
                </div>
              )}

              <div className="bg-card/60 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground bg-white/[0.03]">
                        <th className="px-4 py-3 w-10">
                          <button onClick={toggleAll}>{allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}</button>
                        </th>
                        <th className="px-4 py-3">Name & AI Summary</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">AI Risk Score</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Protection</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredDocs.map((doc) => {
                        const expStatus = getExpiryStatus(doc.expiryDate);
                        const riskScore = doc.riskScore || 30;
                        const isSelected = selectedIds.includes(doc.id);
                        const hasFile = blobUrls.current.has(doc.id);
                        return (
                          <tr key={doc.id} className={cn("transition-colors group", isSelected ? "bg-primary/5" : "hover:bg-white/[0.02]")}>
                            <td className="px-4 py-3">
                              <button onClick={() => toggleSelect(doc.id)}>
                                {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                              </button>
                            </td>
                            <td className="px-4 py-3 max-w-[240px]">
                              <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-white text-sm truncate group-hover:text-primary transition-colors">{doc.name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Brain className="w-3 h-3 text-purple-400 shrink-0" />
                                    <span className="line-clamp-1">{doc.aiSummary}</span>
                                  </div>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {(doc.tags || []).slice(0, 3).map(tag => (
                                      <span key={tag} className="text-[10px] bg-white/10 text-muted-foreground px-1.5 py-0.5 rounded">#{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="capitalize text-xs text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md">{doc.category}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1 min-w-[80px]">
                                <div className="flex justify-between text-xs">
                                  <Badge className={cn("text-[10px] border py-0", getRiskColor(doc.fraudRisk))}>{doc.fraudRisk}</Badge>
                                  <span className={cn("font-bold text-xs", getRiskScoreColor(riskScore))}>{riskScore}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                  <div className={cn("h-1.5 rounded-full", getRiskScoreBar(riskScore))} style={{ width: `${riskScore}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {expStatus === "expired" && <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Expired</Badge>}
                              {expStatus === "expiring" && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">Expiring</Badge>}
                              {expStatus === "active" && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">Active</Badge>}
                              {!expStatus && <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                {doc.isEncrypted && <div title="Encrypted" className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center"><Lock className="w-3 h-3 text-green-400" /></div>}
                                {doc.isSelfDestruct && <div title="Self-Destruct" className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center"><Flame className="w-3 h-3 text-orange-400" /></div>}
                                {doc.isOneTimeView && <div title="One-Time View" className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center"><Eye className="w-3 h-3 text-purple-400" /></div>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground hover:text-white" onClick={() => setEditDoc(doc)}>
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost"
                                  className={cn("h-7 px-2 gap-1 text-xs", hasFile ? "text-primary hover:text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-white")}
                                  onClick={() => handleDownload(doc)}
                                  title={hasFile ? "Download file" : "No file attached (demo doc)"}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleTrash(doc.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredDocs.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No documents found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Alerts Tab ── */}
          {activeTab === "alerts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={cn("bg-card/60 p-4 rounded-2xl flex items-start gap-4 border-l-4 border border-white/10",
                  alert.severity === "critical" ? "border-l-red-500" : alert.severity === "warning" ? "border-l-yellow-500" : "border-l-primary"
                )}>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    alert.severity === "critical" ? "bg-red-500/10" : alert.severity === "warning" ? "bg-yellow-500/10" : "bg-primary/10"
                  )}>
                    {alert.type === "fraud" && <ShieldAlert className="w-4 h-4 text-red-400" />}
                    {alert.type === "expiry" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    {alert.type === "security" && <Key className="w-4 h-4 text-red-400" />}
                    {alert.type === "access" && <Bell className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-white text-sm">{alert.title}</h4>
                      <Badge className={cn("text-[10px]", alert.severity === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : alert.severity === "warning" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-primary/10 text-primary border-primary/20")}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Audit Tab ── */}
          {activeTab === "audit" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card/60 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Immutable Access Log</h3>
                  <span className="text-xs text-muted-foreground">Blockchain-anchored</span>
                </div>
                {auditLogs.map((log, i) => (
                  <div key={log.id} className={cn("px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3", i !== auditLogs.length - 1 ? "border-b border-white/[0.06]" : "")}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", log.action.includes("Failed") || log.action.includes("Blocked") ? "bg-red-400" : "bg-green-400")} />
                      <span className="text-sm font-medium text-white">{log.action}</span>
                      {log.documentName && <span className="text-sm text-muted-foreground">{log.documentName}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={cn(log.action.includes("Failed") ? "text-red-400" : "")}>{log.ipAddress}</span>
                      <span>{log.location}</span>
                      <span>{log.device}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Trash Tab ── */}
          {activeTab === "trash" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl text-sm text-orange-300">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Items in trash are auto-deleted after 30 days
              </div>
              {trashedDocs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Trash2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Trash is empty</p>
                </div>
              ) : (
                <div className="bg-card/60 border border-white/10 rounded-2xl overflow-hidden">
                  {trashedDocs.map((doc, i) => (
                    <div key={doc.id} className={cn("px-5 py-4 flex items-center justify-between gap-4", i !== trashedDocs.length - 1 ? "border-b border-white/[0.06]" : "")}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><FileText className="w-4 h-4 text-muted-foreground" /></div>
                        <div>
                          <p className="text-sm font-medium text-white line-through opacity-60">{doc.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-green-400 hover:bg-green-500/10" onClick={() => handleRestore(doc.id)}>
                          <RotateCcw className="w-3 h-3" /> Restore
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-red-400 hover:bg-red-500/10" onClick={() => handlePermanentDelete(doc.id)}>
                          <X className="w-3 h-3" /> Delete Forever
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Secure Vault Tab ── */}
          {activeTab === "vault" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {vaultState === "locked" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-5">
                  <div className="w-24 h-24 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                    <FolderLock className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-1">Secure Personal Folder</h2>
                    <p className="text-sm text-muted-foreground max-w-sm">PIN-protected vault with decoy mode. Even if forced, use the decoy PIN to show fake data.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground max-w-sm">
                    {[["PIN Protected","4-8 digit PIN required"],["Decoy Mode","Fake PIN opens fake vault"],["Auto-Lock","Locks after 3 wrong attempts"]].map(([t,d]) => (
                      <div key={t} className="bg-card/60 border border-white/10 rounded-xl p-3">
                        <p className="text-white font-medium mb-1 text-xs">{t}</p><p className="text-[10px]">{d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    {pinAttempts >= 3 ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                        Vault locked after 3 failed attempts. Try again in 5 minutes.
                      </div>
                    ) : (
                      <Dialog open={pinOpen} onOpenChange={setPinOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-primary text-black font-bold gap-2 px-8">
                            <FolderLock className="w-4 h-4" /> Enter PIN to Unlock
                          </Button>
                        </DialogTrigger>
                        <PinModal onVerify={handlePinVerify} onClose={() => setPinOpen(false)} attemptsLeft={3 - pinAttempts} />
                      </Dialog>
                    )}
                    {/* Forgot PIN → Change PIN */}
                    <Dialog open={changePinOpen} onOpenChange={setChangePinOpen}>
                      <DialogTrigger asChild>
                        <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 underline-offset-2 hover:underline">
                          <KeyRound className="w-3.5 h-3.5" /> Forgot PIN? Change PIN
                        </button>
                      </DialogTrigger>
                      <ChangePinModal onSave={handleChangePin} onClose={() => setChangePinOpen(false)} />
                    </Dialog>
                  </div>
                  {pinAttempts > 0 && pinAttempts < 3 && (
                    <p className="text-red-400 text-sm">{3 - pinAttempts} attempt{3 - pinAttempts !== 1 ? "s" : ""} remaining</p>
                  )}
                </div>
              )}

              {vaultState === "decoy" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                      <Info className="w-4 h-4" /> Decoy Vault Active — showing fake documents
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setVaultState("locked")}>Lock</Button>
                  </div>
                  {[{ name: "Old Resume 2020.pdf", cat: "personal" }, { name: "Random Notes.txt", cat: "other" }].map((d) => (
                    <div key={d.name} className="bg-card/60 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div><p className="text-sm text-white">{d.name}</p><p className="text-xs text-muted-foreground capitalize">{d.cat}</p></div>
                    </div>
                  ))}
                </div>
              )}

              {vaultState === "unlocked" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <Shield className="w-4 h-4" /> Real Vault Unlocked — your private documents
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={changePinOpen} onOpenChange={setChangePinOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-xs text-muted-foreground gap-1">
                            <KeyRound className="w-3 h-3" /> Change PIN
                          </Button>
                        </DialogTrigger>
                        <ChangePinModal onSave={handleChangePin} onClose={() => setChangePinOpen(false)} />
                      </Dialog>
                      <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setVaultState("locked")}>
                        <Lock className="w-3 h-3 mr-1" /> Lock
                      </Button>
                    </div>
                  </div>
                  {[
                    { name: "Aadhaar_Original.pdf", cat: "personal", risk: "high" },
                    { name: "Bank Passbook Scan.jpg", cat: "financial", risk: "medium" },
                    { name: "Crypto_Keys.txt", cat: "financial", risk: "high" }
                  ].map((d) => (
                    <div key={d.name} className="bg-card/60 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                        <div><p className="text-sm font-medium text-white">{d.name}</p><p className="text-xs text-muted-foreground capitalize">{d.cat}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(d.risk)}>{d.risk} risk</Badge>
                        <Lock className="w-3.5 h-3.5 text-green-400" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-white/20 text-muted-foreground hover:text-white hover:border-white/40">
                    <Plus className="w-4 h-4 mr-2" /> Add to Secure Folder
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Timeline Tab ── */}
          {activeTab === "timeline" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
                {TIMELINE_EVENTS.map((event, i) => (
                  <motion.div key={event.year} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="relative mb-8 last:mb-0">
                    <div className="absolute -left-5 top-1.5 w-4 h-4 rounded-full border-2 border-background" style={{ background: "hsl(var(--primary))" }}>
                      <div className="w-2 h-2 rounded-full bg-background m-[3px]" />
                    </div>
                    <div className="bg-card/60 border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-white">{event.year}</span>
                        <Badge className="bg-primary/10 text-primary border-primary/20">{event.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.docs.map((d) => {
                          const docInfo = "id" in d ? docs.find(x => x.id === d.id) : docs.find(x => x.name.toLowerCase().includes(d.name.toLowerCase()));
                          const label = d.name;
                          return (
                            <div key={label} className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              <span>{label}</span>
                              <Button size="xs" variant="ghost" className="py-0 px-1.5" onClick={() => handleTimelineDownload(label, docInfo)}>
                                <Download className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-card/60 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-1 text-sm">Threat Attempts vs Accesses</h3>
                <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={SECURITY_ANALYTICS}>
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    <Bar dataKey="accesses" fill="hsl(var(--primary))" radius={[4,4,0,0]} opacity={0.7} />
                    <Bar dataKey="threats" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card/60 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-1 text-sm">Document Category Breakdown</h3>
                <p className="text-xs text-muted-foreground mb-4">By category</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={[{name:"Personal",value:3},{name:"Financial",value:2},{name:"Education",value:2},{name:"Medical",value:1}]} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {["hsl(var(--primary))","#a855f7","#22d3ee","#22c55e"].map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md:col-span-2 bg-card/60 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> AI Threat Prediction
                </h3>
                {[
                  { risk: "High", msg: "You frequently access sensitive documents on public WiFi. Risk of interception.", color: "border-red-500/20 bg-red-500/5 text-red-300" },
                  { risk: "Medium", msg: "3 documents expire within 30 days. Update to prevent access issues.", color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-300" },
                  { risk: "Low", msg: "Unusual login attempt blocked from Russia. Consider enabling Geo-Fencing.", color: "border-primary/20 bg-primary/5 text-primary" },
                ].map(item => (
                  <div key={item.risk} className={cn("p-3 rounded-xl border mb-2 last:mb-0 flex items-start gap-3 text-sm", item.color)}>
                    <Brain className="w-4 h-4 shrink-0 mt-0.5" />
                    <div><span className="font-semibold">{item.risk} Risk: </span>{item.msg}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Device Trust Tab ── */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="bg-card/60 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" />Device Trust Registry</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Manually register devices you trust to access your vault</p>
                  </div>
                </div>

                {devices.length === 0 ? (
                  <div className="px-5 py-12 text-center text-muted-foreground space-y-3">
                    <Smartphone className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm">No devices registered yet</p>
                    <p className="text-xs">Click "Add Device" to register your first trusted device</p>
                  </div>
                ) : (
                  devices.map((d, i) => (
                    <div key={d.id} className={cn("px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3", i !== devices.length - 1 ? "border-b border-white/[0.06]" : "")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                          d.trust > 70 ? "bg-green-500/10" : d.trust > 40 ? "bg-yellow-500/10" : "bg-red-500/10"
                        )}>
                          <Smartphone className={cn("w-4 h-4", d.trust > 70 ? "text-green-400" : d.trust > 40 ? "text-yellow-400" : "text-red-400")} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{d.device}</p>
                          <p className="text-xs text-muted-foreground">{d.location} · {d.lastSeen}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Trust</span>
                            <span className={cn("font-bold", d.trust > 70 ? "text-green-400" : d.trust > 40 ? "text-yellow-400" : "text-red-400")}>{d.trust}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className={cn("h-1.5 rounded-full transition-all", d.trust > 70 ? "bg-green-500" : d.trust > 40 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${d.trust}%` }} />
                          </div>
                        </div>
                        <Badge className={cn("text-[10px] shrink-0",
                          d.status === "Trusted" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          d.status === "Blocked" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        )}>{d.status}</Badge>
                        <button onClick={() => setDevices(prev => prev.filter(x => x.id !== d.id))} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Globe, label: "Geo-Fencing", desc: "Only allow access from India", active: true, color: "text-primary" },
                  { icon: Wifi, label: "Public WiFi Alert", desc: "Warn when on insecure networks", active: true, color: "text-yellow-400" },
                  { icon: RefreshCw, label: "Continuous Auth", desc: "Verify identity during session", active: false, color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="bg-card/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <s.icon className={cn("w-5 h-5", s.color)} />
                      <div><p className="text-sm font-medium text-white">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                    </div>
                    <Switch defaultChecked={s.active} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={!!editDoc} onOpenChange={open => !open && setEditDoc(null)}>
        {editDoc && <EditDocModal doc={editDoc} onSave={handleEdit} onClose={() => setEditDoc(null)} />}
      </Dialog>
    </div>
  );
}
