export const mockStats = {
  totalDocuments: 142,
  encryptedDocuments: 142,
  expiringDocuments: 5,
  storageUsed: 4250000000,
  storageLimit: 10000000000,
  securityScore: 98,
};

export const mockDocuments = [
  {
    id: 1,
    name: "Passport_Scan_Encrypted.pdf",
    category: "personal",
    fileType: "application/pdf",
    fileSize: 2450000,
    expiryDate: "2030-05-15T00:00:00Z",
    tags: ["ID", "Travel"],
    isEncrypted: true,
    isSelfDestruct: false,
    viewCount: 12,
    fraudRisk: "low",
    aiSummary: "Valid Passport. Expires 2030. Identity verified, no tampering detected.",
    uploadedAt: "2024-01-10T10:30:00Z",
    updatedAt: "2024-01-10T10:30:00Z"
  },
  {
    id: 2,
    name: "Q4_Financial_Report.xlsx",
    category: "financial",
    fileType: "spreadsheet",
    fileSize: 1200000,
    expiryDate: null,
    tags: ["Tax", "2023", "Confidential"],
    isEncrypted: true,
    isSelfDestruct: true,
    selfDestructAt: "2024-12-31T23:59:59Z",
    viewCount: 3,
    maxViews: 5,
    fraudRisk: "low",
    aiSummary: "Q4 Earnings statement showing $45k net revenue. Auto-detected PII redacted.",
    uploadedAt: "2024-02-15T14:20:00Z",
    updatedAt: "2024-02-15T14:20:00Z"
  },
  {
    id: 3,
    name: "Medical_Records_MRI.dcm",
    category: "medical",
    fileType: "dicom",
    fileSize: 45000000,
    expiryDate: null,
    tags: ["Health", "Imaging"],
    isEncrypted: true,
    isSelfDestruct: false,
    viewCount: 1,
    fraudRisk: "low",
    aiSummary: "Spinal MRI scan. Contains sensitive health data. Strict access control applied.",
    uploadedAt: "2024-03-01T09:15:00Z",
    updatedAt: "2024-03-01T09:15:00Z"
  },
  {
    id: 4,
    name: "Suspicious_Contract_v2.pdf",
    category: "legal",
    fileType: "application/pdf",
    fileSize: 320000,
    expiryDate: null,
    tags: ["Contract", "Pending"],
    isEncrypted: true,
    isSelfDestruct: false,
    viewCount: 8,
    fraudRisk: "high",
    aiSummary: "WARNING: Document signatures appear digitally altered. Clause 4.2 contains unusual liability terms.",
    uploadedAt: "2024-04-12T16:45:00Z",
    updatedAt: "2024-04-12T16:45:00Z"
  },
  {
    id: 5,
    name: "Crypto_Seed_Phrases.txt",
    category: "financial",
    fileType: "text/plain",
    fileSize: 2048,
    expiryDate: null,
    tags: ["Crypto", "Critical"],
    isEncrypted: true,
    isSelfDestruct: true,
    viewCount: 0,
    maxViews: 1,
    fraudRisk: "low",
    aiSummary: "Extremely sensitive text block detected. Highest encryption tier automatically applied.",
    uploadedAt: "2024-05-20T11:00:00Z",
    updatedAt: "2024-05-20T11:00:00Z"
  },
  {
    id: 6,
    name: "Aadhaar_Card_2024.pdf",
    category: "personal",
    fileType: "application/pdf",
    fileSize: 524288,
    expiryDate: "2030-01-01",
    tags: ["Identity", "Government"],
    isEncrypted: true,
    isSelfDestruct: false,
    viewCount: 3,
    fraudRisk: "low",
    aiSummary: "Official Aadhaar identity document issued by UIDAI. Verified authentic.",
    uploadedAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-05T08:00:00Z"
  },
  {
    id: 7,
    name: "B.Tech_Degree_Certificate.pdf",
    category: "education",
    fileType: "application/pdf",
    fileSize: 1048576,
    expiryDate: null,
    tags: ["Degree", "University", "Engineering"],
    isEncrypted: true,
    isSelfDestruct: false,
    viewCount: 2,
    fraudRisk: "low",
    aiSummary: "Bachelor of Technology degree certificate from recognized university. Verified authentic.",
    uploadedAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z"
  },
  {
    id: 8,
    name: "Driving_License_DL4932.jpg",
    category: "personal",
    fileType: "image/jpeg",
    fileSize: 786432,
    expiryDate: "2024-03-31",
    tags: ["License", "Transport"],
    isEncrypted: true,
    isSelfDestruct: false,
    viewCount: 7,
    fraudRisk: "medium",
    aiSummary: "Motor vehicle driving license. ALERT: Expiry detected — document expired!",
    uploadedAt: "2024-02-20T09:30:00Z",
    updatedAt: "2024-02-20T09:30:00Z"
  }
];

export const mockAlerts = [
  {
    id: 101,
    type: "fraud",
    title: "High Fraud Risk Detected",
    message: "AI analysis indicates 'Suspicious_Contract_v2.pdf' has tampered metadata and altered digital signatures. Immediate review recommended.",
    severity: "critical",
    documentId: 4,
    isRead: false,
    createdAt: "2024-05-24T08:30:00Z"
  },
  {
    id: 102,
    type: "expiry",
    title: "Driving License — EXPIRED",
    message: "'Driving_License_DL4932.jpg' expired on March 31, 2024. Please upload a renewed copy immediately.",
    severity: "critical",
    documentId: 8,
    isRead: false,
    createdAt: "2024-05-23T14:15:00Z"
  },
  {
    id: 103,
    type: "security",
    title: "Intrusion Attempt Blocked",
    message: "3 failed login attempts from Moscow, Russia (IP: 45.22.19.102) were blocked. Account temporarily locked for 30 minutes.",
    severity: "critical",
    documentId: null,
    isRead: false,
    createdAt: "2024-05-24T03:44:12Z"
  },
  {
    id: 104,
    type: "access",
    title: "Self-Destruct Approaching",
    message: "'Q4_Financial_Report.xlsx' has been viewed 3/5 times. It will self-destruct after 2 more views.",
    severity: "warning",
    documentId: 2,
    isRead: false,
    createdAt: "2024-05-22T09:45:00Z"
  },
  {
    id: 105,
    type: "expiry",
    title: "Document Expiring in 30 Days",
    message: "'Passport_Scan_Encrypted.pdf' expires on May 15, 2030. No action needed yet — this is an advance reminder.",
    severity: "info",
    documentId: 1,
    isRead: true,
    createdAt: "2024-04-15T10:00:00Z"
  }
];

export const mockAuditLogs = [
  {
    id: 501,
    action: "Document Viewed",
    documentName: "Q4_Financial_Report.xlsx",
    ipAddress: "192.168.1.45",
    location: "San Francisco, CA, US",
    device: "MacBook Pro — Safari",
    timestamp: "2024-05-24T10:15:32Z"
  },
  {
    id: 502,
    action: "Failed Login Attempt",
    documentName: null,
    ipAddress: "45.22.19.102",
    location: "Moscow, Russia",
    device: "Unknown Device",
    timestamp: "2024-05-24T03:44:12Z"
  },
  {
    id: 503,
    action: "Document Uploaded",
    documentName: "Crypto_Seed_Phrases.txt",
    ipAddress: "192.168.1.45",
    location: "San Francisco, CA, US",
    device: "MacBook Pro — Safari",
    timestamp: "2024-05-20T11:00:05Z"
  },
  {
    id: 504,
    action: "Encryption Key Rotated",
    documentName: "System",
    ipAddress: "Internal",
    location: "AWS us-west-2",
    device: "KMS Auto-Rotation",
    timestamp: "2024-05-01T00:00:00Z"
  },
  {
    id: 505,
    action: "Document Shared (Temp Link)",
    documentName: "Resume_2025.pdf",
    ipAddress: "192.168.1.45",
    location: "Mumbai, India",
    device: "iPhone 15 — Safari",
    timestamp: "2024-05-23T15:30:00Z"
  },
  {
    id: 506,
    action: "Account Login",
    documentName: null,
    ipAddress: "192.168.1.45",
    location: "San Francisco, CA, US",
    device: "MacBook Pro — Chrome",
    timestamp: "2024-05-24T08:00:10Z"
  }
];
