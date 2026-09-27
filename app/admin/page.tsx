'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import jsPDF from 'jspdf'; import {
  Shield,
  Lock,
  Mail,
  Calendar,
  Users,
  QrCode,
  UserPlus,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  ChevronDown,
  LogOut,
  ArrowLeft,
  KeyRound,
  Check,
  X,
  RefreshCw,
  Layers,
  Sparkles,
  CheckCheck,
  FileSpreadsheet,
  Upload,
  FileText,
  Film,
  Play,
  RotateCcw
} from 'lucide-react';

type TabType = 'registrations' | 'manage-events' | 'create-event' | 'add-member' | 'manage-members' | 'scanner' | 'showreel';

function ImageDropzone({
  value,
  onChange,
  label = 'Upload Image'
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed');

      onChange(result.url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-neutral-400 font-medium flex items-center justify-between">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-red-400 hover:underline cursor-pointer"
          >
            Clear image
          </button>
        )}
      </label>

      {value ? (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/20 bg-neutral-900/80 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium backdrop-blur-md transition-all cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2.5 py-1 bg-red-600/60 hover:bg-red-600 text-white rounded-lg text-xs font-medium backdrop-blur-md transition-all cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/20 bg-neutral-900/60 hover:border-white/35 hover:bg-neutral-900'
            }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2 py-1">
              <RefreshCw className="size-4 text-blue-400 animate-spin" />
              <span className="text-xs text-neutral-300 font-mono">Uploading image...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400">
                <Upload className="size-4" />
              </div>
              <div className="text-left">
                <p className="text-xs text-neutral-200 font-medium">
                  <span className="text-blue-400 hover:underline">Upload image</span> or drag & drop
                </p>
                <p className="text-[10px] text-neutral-500">PNG, JPG, WEBP, GIF, SVG</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        type="text"
        placeholder="Or paste direct image URL (https://...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-950/80 border border-white/10 rounded-lg px-3 py-1 text-xs text-neutral-300 placeholder:text-neutral-600 outline-none focus:border-white/20 transition-all font-mono"
      />

      {uploadError && (
        <p className="text-xs text-red-400 flex items-center gap-1 font-mono">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('registrations');
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'attended'>('all');

  // Form states
  const [eventForm, setEventForm] = useState({ title: '', img: '', url: '', thm_url: '', htb_url: '', is_past: false, gallery_link: '' });
  const [teamForm, setTeamForm] = useState({ name: '', role: '', image_url: '', linkedin: '', github: '' });
  const [scannerInput, setScannerInput] = useState('');
  const [scannerStatus, setScannerStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [pastEventModal, setPastEventModal] = useState<{ isOpen: boolean; eventId: string | null }>({ isOpen: false, eventId: null });
  const [galleryLinkInput, setGalleryLinkInput] = useState('');
  const [galleryLinkError, setGalleryLinkError] = useState('');

  // Report Modal State
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; eventId: string | null }>({ isOpen: false, eventId: null });
  const [billImage, setBillImage] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Showreel Management States
  const [showreelData, setShowreelData] = useState<{
    videoUrl: string;
    publicId: string;
    title: string;
    format: string;
    duration?: number;
    width?: number;
    height?: number;
    bytes?: number;
    updatedAt: string;
    isCustom?: boolean;
  } | null>(null);
  const [isShowreelUploading, setIsShowreelUploading] = useState(false);
  const [showreelUploadStatus, setShowreelUploadStatus] = useState('');
  const [showreelUploadError, setShowreelUploadError] = useState('');
  const [showreelUploadSuccess, setShowreelUploadSuccess] = useState('');
  const [showreelSelectedFile, setShowreelSelectedFile] = useState<File | null>(null);
  const [showreelLocalPreview, setShowreelLocalPreview] = useState<string | null>(null);
  const [showreelDirectUrl, setShowreelDirectUrl] = useState('');
  const [showreelTitle, setShowreelTitle] = useState('');
  const showreelFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReturnToMainSite = () => {
    sessionStorage.setItem('skipPreloader', 'true');
    router.push('/?skipIntro=true');
  };

  const fetchShowreelData = async () => {
    try {
      const res = await fetch('/api/admin/showreel');
      const json = await res.json();
      if (res.ok && json.data) {
        setShowreelData(json.data);
      }
    } catch (err) {
      console.error('Error fetching showreel data:', err);
    }
  };

  const handleShowreelFileChange = (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      setShowreelUploadError('Please select a valid video file (MP4, WEBM, MOV).');
      return;
    }
    setShowreelUploadError('');
    setShowreelUploadSuccess('');
    setShowreelSelectedFile(file);
    if (!showreelTitle) {
      setShowreelTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const previewUrl = URL.createObjectURL(file);
    setShowreelLocalPreview(previewUrl);
  };

  const handleUploadShowreelToCloudinary = async () => {
    if (!showreelSelectedFile && !showreelDirectUrl) {
      setShowreelUploadError('Please select a video file or enter a Cloudinary video URL.');
      return;
    }

    setIsShowreelUploading(true);
    setShowreelUploadError('');
    setShowreelUploadSuccess('');
    setShowreelUploadStatus('Uploading video to Cloudinary storage...');

    try {
      const formData = new FormData();
      if (showreelSelectedFile) {
        formData.append('file', showreelSelectedFile);
      }
      if (showreelDirectUrl) {
        formData.append('url', showreelDirectUrl);
      }
      if (showreelTitle) {
        formData.append('title', showreelTitle);
      }

      const res = await fetch('/api/admin/showreel', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Showreel upload failed');
      }

      setShowreelData(result.data);
      setShowreelUploadSuccess('Showreel successfully uploaded to Cloudinary! It is now live on the main website.');
      setShowreelSelectedFile(null);
      if (showreelLocalPreview) {
        URL.revokeObjectURL(showreelLocalPreview);
        setShowreelLocalPreview(null);
      }
      setShowreelDirectUrl('');
    } catch (err: any) {
      console.error('Showreel upload failed:', err);
      setShowreelUploadError(err.message || 'Failed to upload video to Cloudinary.');
    } finally {
      setIsShowreelUploading(false);
      setShowreelUploadStatus('');
    }
  };

  const handleResetShowreelToDefault = async () => {
    if (!confirm('Are you sure you want to reset the showreel to the default video?')) return;
    try {
      const res = await fetch('/api/admin/showreel', { method: 'DELETE' });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowreelData(result.data);
        setShowreelUploadSuccess('Showreel reset to default video.');
        setShowreelUploadError('');
      }
    } catch (err: any) {
      console.error('Reset showreel error:', err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchEvents(), fetchTeamMembers(), fetchShowreelData()]);
    setIsLoading(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (selectedEventId) {
      await fetchRegistrations(selectedEventId);
    }
    await Promise.all([fetchEvents(), fetchTeamMembers(), fetchShowreelData()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const result = await res.json();
      if (res.ok && result.data) {
        setEvents(result.data);
        if (result.data.length > 0 && !selectedEventId) {
          setSelectedEventId(result.data[0].id);
          fetchRegistrations(result.data[0].id);
        }
      } else {
        const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        if (data) {
          setEvents(data);
          if (data.length > 0 && !selectedEventId) {
            setSelectedEventId(data[0].id);
            fetchRegistrations(data[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/admin/members');
      const result = await res.json();
      if (res.ok && result.data) {
        setTeamMembers(result.data);
      } else {
        const { data } = await supabase.from('team_members').select('*').order('created_at', { ascending: false });
        if (data) setTeamMembers(data);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      const res = await fetch(`/api/admin/registrations?eventId=${eventId}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to fetch registrations');

      setRegistrations(result.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  useEffect(() => {
    let interval: any;
    if (selectedEventId && activeTab === 'registrations') {
      fetchRegistrations(selectedEventId);
      interval = setInterval(() => {
        fetchRegistrations(selectedEventId);
      }, 5000); // Auto-refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedEventId, activeTab]);

  const toggleAttendance = async (regId: string, currentStatus: boolean, isApproved: boolean) => {
    if (!isApproved) {
      alert("You must approve the registration before marking attendance.");
      return;
    }
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regId, action: 'attendance', value: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update attendance');

      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, attended: !currentStatus } : r));
      if (selectedStudent?.id === regId) {
        setSelectedStudent((prev: any) => ({ ...prev, attended: !currentStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (reg: any) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regId: reg.id, action: 'approve' })
      });
      if (!res.ok) throw new Error('Failed to approve');

      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, approved: true } : r));
      if (selectedStudent?.id === reg.id) {
        setSelectedStudent((prev: any) => ({ ...prev, approved: true }));
      }

      // Auto-trigger email API for Registration Confirmed / QR code
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'registration',
          regId: reg.id,
          studentEmail: reg.student_profiles?.email,
          studentName: reg.student_profiles?.name,
          eventName: events.find(e => e.id === reg.event_id)?.title
        })
      }).catch(console.error);

    } catch (err) {
      console.error(err);
    }
  };

  const toggleCertificates = async (eventId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, certificates_enabled: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to toggle certificates');
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, certificates_enabled: !currentStatus } : e));
    } catch (err) {
      console.error(err);
      alert('Error updating certificates setting');
    }
  };

  const handleMarkPastClick = (eventId: string, is_past: boolean) => {
    if (is_past) {
      executeTogglePastEvent(eventId, true, null);
    } else {
      setPastEventModal({ isOpen: true, eventId });
      setGalleryLinkInput('');
      setGalleryLinkError('');
    }
  };

  const handlePastEventSubmit = () => {
    if (galleryLinkInput.trim() !== '') {
      const gDriveRegex = /^https:\/\/(drive\.google\.com)\/.*$/;
      if (!gDriveRegex.test(galleryLinkInput.trim())) {
        setGalleryLinkError('Must be a valid Google Drive link (https://drive.google.com/...)');
        return;
      }
    }
    executeTogglePastEvent(pastEventModal.eventId!, false, galleryLinkInput.trim() || null);
    setPastEventModal({ isOpen: false, eventId: null });
  };

  const executeTogglePastEvent = async (eventId: string, currentStatus: boolean, galleryLink: string | null) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: eventId,
          is_past: !currentStatus,
          gallery_link: galleryLink
        })
      });
      if (!res.ok) throw new Error('Failed to update event status');

      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, is_past: !currentStatus, gallery_link: galleryLink } : e));
    } catch (err) {
      console.error(err);
      alert('Error updating event status');
    }
  };

  const handleGenerateReport = async () => {
    if (!reportModal.eventId) return;
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/admin/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: reportModal.eventId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');

      // Generate PDF
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(data.stats.title, 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Stats
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Event Statistics:', 20, yPos);
      yPos += 8;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Registrations: ${data.stats.registrations}`, 25, yPos);
      yPos += 7;
      doc.text(`Feedbacks Received: ${data.stats.feedbacks}`, 25, yPos);
      yPos += 7;
      doc.text(`Average Rating: ${data.stats.avgRating} / 5`, 25, yPos);
      yPos += 15;

      // AI Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Generated Summary:', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const splitTitle = doc.splitTextToSize(data.report, 170);
      for (let i = 0; i < splitTitle.length; i++) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(splitTitle[i], 20, yPos);
        yPos += 7;
      }

      // Bill Image
      if (billImage) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Event Bill:', 20, 20);

        try {
          doc.addImage(billImage, 'JPEG', 20, 30, 170, 0);
        } catch (e) {
          console.error("Error embedding bill image in PDF", e);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'italic');
          doc.text("(Failed to embed bill image. The file format might not be supported by jsPDF.)", 20, 30);
        }
      }

      doc.save(`Event_Report_${data.stats.title}.pdf`);
      setReportModal({ isOpen: false, eventId: null });
      setBillImage('');
      alert("Report successfully generated and downloaded!");

    } catch (err: any) {
      console.error("Report Generation Error", err);
      alert(err.message || 'Error generating report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const handleBulkDownloadCertificates = async () => {
    // Only get students who are both approved and attended
    const presentStudents = filteredRegistrations.filter(r => r.approved && r.attended);

    if (presentStudents.length === 0) {
      alert("No students found who are both approved and attended for this event.");
      return;
    }

    setIsBulkGenerating(true);

    try {
      const currentEvent = events.find(e => e.id === selectedEventId);
      const eventName = currentEvent?.title || 'CYBER EVENT';

      // Initialize the bulk PDF
      const bulkPdfDoc = await PDFDocument.create();
      bulkPdfDoc.registerFontkit(fontkit);

      // Fetch base template and font once
      const imageBytes = await fetch('/certificate-template.png').then(res => res.arrayBuffer());
      const nameFontBytes = await fetch('/fonts/GreatVibes-Regular.ttf').then(res => res.arrayBuffer());

      const nameFont = await bulkPdfDoc.embedFont(nameFontBytes);
      const eventFont = await bulkPdfDoc.embedFont('Helvetica');

      for (const reg of presentStudents) {
        const bgImage = await bulkPdfDoc.embedPng(imageBytes);
        const { width, height } = bgImage.scale(1);

        const page = bulkPdfDoc.addPage([width, height]);
        page.drawImage(bgImage, { x: 0, y: 0, width, height });

        // Draw Student Name (Cursive, no all-caps)
        const studentName = reg.student_profiles?.name || 'STUDENT NAME';
        const studentNameText = studentName;
        const studentNameFontSize = 110;
        const studentNameWidth = nameFont.widthOfTextAtSize(studentNameText, studentNameFontSize);

        const nameY = height * 0.525; // Shifted UP above the underline

        page.drawText(studentNameText, {
          x: width / 2 - studentNameWidth / 2,
          y: nameY,
          size: studentNameFontSize,
          font: nameFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        // Paragraph Lines
        const eventFontSize = 18;
        const paraColor = rgb(0.15, 0.5, 0.4);

        const line1 = "For successfully participating and demonstrating exceptional";
        const line2 = "technical commitment in the workshop/event titled";
        const line3 = `${eventName.toUpperCase()} organized by the CIPHER SIG.`;

        const drawCenteredText = (text: string, yPos: number) => {
          const textWidth = eventFont.widthOfTextAtSize(text, eventFontSize);
          page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: yPos,
            size: eventFontSize,
            font: eventFont,
            color: paraColor,
          });
        };

        const paraStartY = height * 0.42; // Nudged up slightly higher
        const lineHeight = 28;

        drawCenteredText(line1, paraStartY);
        drawCenteredText(line2, paraStartY - lineHeight);
        drawCenteredText(line3, paraStartY - (lineHeight * 2));
      }

      // Save and Download the bulk PDF
      const pdfBytes = await bulkPdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Bulk_Certificates_${eventName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error generating bulk certificates:', err);
      alert('Error generating certificates. Check console for details.');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return;

    // Only export the students who are both approved and attended (Present)
    const presentStudents = filteredRegistrations.filter(r => r.approved && r.attended);

    if (presentStudents.length === 0) {
      alert("No present students to export.");
      return;
    }

    const headers = ['Name', 'PRN', 'Roll No', 'Class', 'Status'];
    const csvContent = [
      headers.join(','),
      ...presentStudents.map(reg => {
        const status = 'Present';
        return `"${reg.student_profiles?.name || 'N/A'}","${reg.student_profiles?.prn_number || 'N/A'}","${reg.student_profiles?.roll_no || 'N/A'}","${reg.student_profiles?.class_name || 'N/A'}","${status}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_${events.find(e => e.id === selectedEventId)?.title || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventForm.url && !/^https:\/\/(drive\.google\.com)\/.*$/.test(eventForm.url)) {
      alert('Guidelines/Rules must be a valid Google Drive link.');
      return;
    }
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          description: '',
          image_url: eventForm.img,
          url: eventForm.url || null,
          thm_url: eventForm.thm_url || null,
          htb_url: eventForm.htb_url || null,
          is_past: eventForm.is_past,
          gallery_link: eventForm.gallery_link || null
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create event');

      setEventForm({ title: '', img: '', url: '', thm_url: '', htb_url: '', is_past: false, gallery_link: '' });
      await fetchEvents();
      setActiveTab('manage-events');
      alert('Event created successfully!');
    } catch (err: any) {
      console.error('Error creating event:', err);
      alert(`Failed to create event: ${err.message}`);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamForm.name,
          role: teamForm.role,
          image_url: teamForm.image_url,
          linkedin_url: teamForm.linkedin || null,
          github_url: teamForm.github || null
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add team member');

      setTeamForm({ name: '', role: '', image_url: '', linkedin: '', github: '' });
      await fetchTeamMembers();
      setActiveTab('manage-members');
      alert('Team member added successfully!');
    } catch (err: any) {
      console.error('Error adding team member:', err);
      alert(`Failed to add team member: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete event');
        await fetchEvents();
      } catch (err: any) {
        console.error(err);
        alert(`Error deleting event: ${err.message}`);
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      try {
        const res = await fetch(`/api/admin/members?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove team member');
        await fetchTeamMembers();
      } catch (err: any) {
        console.error(err);
        alert(`Error deleting team member: ${err.message}`);
      }
    }
  };

  const handleScannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = scannerInput.trim();
    if (!query) return;

    const reg = registrations.find(r => r.id === query);
    if (reg) {
      if (!reg.approved) {
        setScannerStatus({ type: 'error', message: `Registration found for ${reg.student_profiles?.name || 'Student'}, but not yet approved!` });
      } else {
        await toggleAttendance(reg.id, reg.attended, reg.approved);
        setScannerStatus({
          type: 'success',
          message: `Attendance marked for ${reg.student_profiles?.name || 'Student'} (${reg.student_profiles?.prn_number || 'No PRN'})`
        });
      }
    } else {
      setScannerStatus({ type: 'error', message: 'No registration matched this ID in the active event.' });
    }
    setScannerInput('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'ciphersig@gmail.com' && loginPassword === 'cipher@2026') {
      setIsAdmin(true);
      setLoginError(false);
      fetchData();
    } else {
      setLoginError(true);
    }
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const name = (reg.student_profiles?.name || '').toLowerCase();
      const prn = (reg.student_profiles?.prn_number || '').toLowerCase();
      const roll = (reg.student_profiles?.roll_no || '').toLowerCase();
      const className = (reg.student_profiles?.class_name || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesQuery = !q || name.includes(q) || prn.includes(q) || roll.includes(q) || className.includes(q);

      if (!matchesQuery) return false;

      if (statusFilter === 'pending') return !reg.approved;
      if (statusFilter === 'approved') return reg.approved && !reg.attended;
      if (statusFilter === 'attended') return reg.attended;

      return true;
    });
  }, [registrations, searchQuery, statusFilter]);

  // Overall Stats
  const stats = useMemo(() => {
    const totalRegs = registrations.length;
    const approvedRegs = registrations.filter(r => r.approved).length;
    const attendedRegs = registrations.filter(r => r.attended).length;
    const pendingRegs = registrations.filter(r => !r.approved).length;
    return { totalRegs, approvedRegs, attendedRegs, pendingRegs };
  }, [registrations]);

  // If not logged in, render the sleek Cipher OS Login
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-3 mb-8 cursor-pointer group"
          onClick={handleReturnToMainSite}
        >
          <div className="size-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-all shadow-[0_0_25px_rgba(255,255,255,0.08)]">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-medium tracking-tight text-white block leading-none font-outfit">CIPHER OS</span>
            <span className="text-[11px] text-neutral-500 tracking-widest uppercase block mt-1 font-mono">Authentication Gateway</span>
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0D0F]/90 backdrop-blur-xl p-8 shadow-2xl relative z-10"
        >
          <div className="mb-6 pb-4 border-b border-white/10 text-center">
            <h1 className="text-lg font-medium text-neutral-100">Operative Login</h1>
            <p className="text-xs text-neutral-500 mt-1">Enter administrative credentials to access node</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Mail className="size-3.5 text-neutral-500" />
                Operative Email
              </label>
              <input
                type="email"
                placeholder="operative@cipher.org"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (loginError) setLoginError(false);
                }}
                required
                className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Lock className="size-3.5 text-neutral-500" />
                Passcode
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  if (loginError) setLoginError(false);
                }}
                required
                className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition-all font-mono"
              />
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>Authentication failed: Invalid operative credentials</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full mt-2 bg-white text-black hover:bg-neutral-200 font-medium py-3 rounded-xl tracking-wider uppercase text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.12)] cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="size-3.5" />
              Authenticate Node
            </button>
          </form>
        </motion.div>

        {/* Footer Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <button
            onClick={handleReturnToMainSite}
            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Cyber Command</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="h-screen flex bg-black text-white font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-4 bg-[#0F0D0F] shrink-0">
        <div>
          {/* Logo & Node Info */}
          <div
            onClick={handleReturnToMainSite}
            className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/10 cursor-pointer group"
          >
            <div className="size-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all">
              <Shield className="size-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-white block font-outfit">CIPHER OS</span>
              <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">Admin Workspace</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                Events Hub
              </div>
              <nav className="space-y-1">
                <NavButton
                  active={activeTab === 'registrations'}
                  onClick={() => setActiveTab('registrations')}
                  icon={<Users className="size-4" />}
                  label="Registrations"
                  badge={registrations.length > 0 ? registrations.length.toString() : undefined}
                />
                <NavButton
                  active={activeTab === 'manage-events'}
                  onClick={() => setActiveTab('manage-events')}
                  icon={<Calendar className="size-4" />}
                  label="Manage Events"
                />
                <NavButton
                  active={activeTab === 'create-event'}
                  onClick={() => setActiveTab('create-event')}
                  icon={<PlusCircle className="size-4" />}
                  label="Create Event"
                />
                <NavButton
                  active={activeTab === 'scanner'}
                  onClick={() => setActiveTab('scanner')}
                  icon={<QrCode className="size-4" />}
                  label="QR Scanner"
                />
              </nav>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                Operative Registry
              </div>
              <nav className="space-y-1">
                <NavButton
                  active={activeTab === 'manage-members'}
                  onClick={() => setActiveTab('manage-members')}
                  icon={<Layers className="size-4" />}
                  label="Team Members"
                  badge={teamMembers.length > 0 ? teamMembers.length.toString() : undefined}
                />
                <NavButton
                  active={activeTab === 'add-member'}
                  onClick={() => setActiveTab('add-member')}
                  icon={<UserPlus className="size-4" />}
                  label="Add Member"
                />
              </nav>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                Media & Showcase
              </div>
              <nav className="space-y-1">
                <NavButton
                  active={activeTab === 'showreel'}
                  onClick={() => setActiveTab('showreel')}
                  icon={<Film className="size-4" />}
                  label="Showreel Video"
                  badge={showreelData?.isCustom ? "Custom" : "Live"}
                />
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white border border-white/15">
              OP
            </div>
            <div className="text-[10px]">
              <div className="text-neutral-200 font-medium">Operator_01</div>
              <div className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Node active
              </div>
            </div>
          </div>
          <button
            onClick={handleReturnToMainSite}
            title="Exit to Main Site"
            className="text-neutral-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-white/10 px-6 py-3.5 flex items-center justify-between bg-[#0F0D0F]/90 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2 font-mono uppercase tracking-widest text-[11px]">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-300">Command Node</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-100 capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-mono text-[11px]">Sync Data</span>
            </button>

            <button
              onClick={handleReturnToMainSite}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-mono text-[11px]"
            >
              <span>Main Site</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto admin-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-neutral-500">
              <RefreshCw className="size-6 animate-spin text-neutral-400" />
              <span className="font-mono text-xs uppercase tracking-widest">Loading node data...</span>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">

              {/* TAB 1: REGISTRATIONS */}
              {activeTab === 'registrations' && (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Registrations" value={stats.totalRegs} delay={0} />
                    <StatCard label="Pending Approval" value={stats.pendingRegs} delay={0.05} badge={stats.pendingRegs > 0 ? "Action Needed" : undefined} badgeColor="amber" />
                    <StatCard label="Approved Attendees" value={stats.approvedRegs} delay={0.1} />
                    <StatCard label="Marked Present" value={stats.attendedRegs} delay={0.15} badge={stats.totalRegs > 0 ? `${Math.round((stats.attendedRegs / (stats.approvedRegs || 1)) * 100)}% Check-in` : undefined} badgeColor="emerald" />
                  </div>

                  {/* Table Control Card */}
                  <div className="rounded-2xl border border-white/10 bg-[#0F0D0F] p-6 space-y-4 shadow-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-medium text-neutral-100 flex items-center gap-2">
                          <span>Event Attendees</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                            {filteredRegistrations.length}
                          </span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Manage attendee verification, approval workflows, and check-in statuses</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Event Selector Dropdown */}
                        <div className="relative">
                          <select
                            className="appearance-none bg-neutral-900 border border-white/15 text-neutral-200 rounded-xl px-4 py-2 pr-9 text-xs font-medium focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none cursor-pointer transition-all min-w-[200px]"
                            value={selectedEventId || ''}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                          >
                            {events.map(e => (
                              <option key={e.id} value={e.id} className="bg-neutral-900 text-neutral-200">
                                {e.title}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="size-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Bulk Download Certificates Button */}
                        <button
                          onClick={handleBulkDownloadCertificates}
                          disabled={registrations.length === 0 || isBulkGenerating}
                          className="flex items-center gap-2 px-3.5 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
                        >
                          {isBulkGenerating ? (
                            <svg className="animate-spin h-3.5 w-3.5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FileSpreadsheet className="size-3.5" />
                          )}
                          <span>{isBulkGenerating ? 'Generating...' : 'Bulk Certificates'}</span>
                        </button>

                        {/* Export CSV Button */}
                        <button
                          onClick={downloadCSV}
                          disabled={registrations.length === 0}
                          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
                        >
                          <FileSpreadsheet className="size-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative flex-1 w-full">
                        <Search className="size-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search by name, PRN, roll no, or class..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-neutral-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 transition-all"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Status Filter Pills */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto bg-neutral-900/80 p-1 rounded-xl border border-white/10">
                        {(['all', 'pending', 'approved', 'attended'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all capitalize cursor-pointer ${statusFilter === filter
                              ? 'bg-white/15 text-white shadow-sm'
                              : 'text-neutral-400 hover:text-neutral-200'
                              }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Registrations Data Table */}
                  <div className="rounded-2xl border border-white/10 bg-[#0F0D0F] overflow-hidden shadow-xl mb-12">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-sm relative">
                        <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-6 py-3.5">Student</th>
                            <th className="px-6 py-3.5">PRN & Roll</th>
                            <th className="px-6 py-3.5">Class / Branch</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Registered</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredRegistrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-medium text-neutral-100">{reg.student_profiles?.name || 'Unknown Student'}</div>
                                <div className="text-xs text-neutral-500 font-mono mt-0.5">{reg.student_profiles?.email || 'No email registered'}</div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-neutral-300">
                                <div>{reg.student_profiles?.prn_number || 'N/A'}</div>
                                <div className="text-neutral-500 text-[11px]">Roll: {reg.student_profiles?.roll_no || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 text-xs text-neutral-400">
                                <div>{reg.student_profiles?.class_name || 'N/A'}</div>
                                <div className="text-neutral-500 text-[11px]">{reg.student_profiles?.branch || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4">
                                {!reg.approved ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                                    <Clock className="size-3" />
                                    Pending Auth
                                  </span>
                                ) : reg.attended ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                    <CheckCheck className="size-3" />
                                    Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                                    <Check className="size-3" />
                                    Approved
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs text-neutral-500 font-mono">
                                {new Date(reg.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!reg.approved ? (
                                    <button
                                      onClick={() => handleApprove(reg)}
                                      className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Check className="size-3" />
                                      Approve
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => toggleAttendance(reg.id, reg.attended, reg.approved)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${reg.attended
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                        }`}
                                    >
                                      {reg.attended ? <X className="size-3" /> : <Check className="size-3" />}
                                      {reg.attended ? 'Revoke' : 'Mark Present'}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setSelectedStudent(reg)}
                                    title="View Profile Details"
                                    className="p-1.5 bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-medium transition-all cursor-pointer"
                                  >
                                    <Eye className="size-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredRegistrations.length === 0 && (
                      <div className="p-12 text-center text-neutral-500">
                        <Users className="size-8 mx-auto mb-3 opacity-30" />
                        <div className="text-sm font-medium text-neutral-400">No matching registrations</div>
                        <p className="text-xs text-neutral-600 mt-1">
                          {searchQuery ? 'Try changing your search keywords or active filter.' : 'No attendees registered for this event yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MANAGE EVENTS */}
              {activeTab === 'manage-events' && (
                <div className="space-y-6 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                      <h2 className="text-xl font-medium text-neutral-100">Event Operations</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">Toggle active statuses, certificates, and update live event metadata</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('create-event')}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <PlusCircle className="size-3.5" />
                      <span>New Event</span>
                    </button>
                  </div>

                  <div className="max-h-[calc(100vh-210px)] overflow-y-auto pr-3 admin-scrollbar pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <div key={event.id} className="rounded-2xl border border-white/10 bg-[#0F0D0F] overflow-hidden flex flex-col group shadow-xl">
                          {/* Poster Image */}
                          <div className="h-44 bg-neutral-900 relative overflow-hidden">
                            <img
                              src={event.image_url || '/cases-bg.png'}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0F] via-transparent to-black/30" />
                            <div className="absolute top-3 right-3 flex gap-2">
                              {event.is_past ? (
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase">
                                  Past Event
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Event Content */}
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-medium text-base text-neutral-100 leading-snug">{event.title}</h3>
                            <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>

                            {/* Links Overview */}
                            {(event.url || event.thm_url || event.htb_url || event.gallery_link) && (
                              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                                {event.url && <span className="text-blue-400">URL Attached</span>}
                                {event.thm_url && <span className="text-red-400">THM Active</span>}
                                {event.htb_url && <span className="text-emerald-400">HTB Active</span>}
                                {event.gallery_link && <span className="text-purple-400">Gallery Linked</span>}
                              </div>
                            )}

                            {/* Control Buttons */}
                            <div className="mt-auto pt-5 flex items-center gap-2">
                              <button
                                onClick={() => handleMarkPastClick(event.id, event.is_past)}
                                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-medium transition-all border cursor-pointer text-center ${event.is_past
                                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20'
                                  : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                                  }`}
                              >
                                {event.is_past ? 'Mark Active' : 'Mark Past'}
                              </button>
                              <button
                                onClick={() => toggleCertificates(event.id, event.certificates_enabled)}
                                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-medium transition-all border cursor-pointer text-center ${event.certificates_enabled
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25'
                                  : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                                  }`}
                              >
                                {event.certificates_enabled ? 'Certs: Live' : 'Enable Certs'}
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete Event"
                                className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-xs transition-all cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                            <div className="mt-2 flex">
                              <button
                                onClick={() => setReportModal({ isOpen: true, eventId: event.id })}
                                title="Generate AI Event Report"
                                className="w-full py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <FileText className="size-3.5" />
                                Generate AI Report
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CREATE EVENT */}
              {activeTab === 'create-event' && (
                <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#0F0D0F] p-5 shadow-2xl space-y-3.5 max-h-[82vh] overflow-y-auto">
                  <div className="pb-2.5 border-b border-white/10">
                    <h2 className="text-base font-medium text-neutral-100 flex items-center gap-2">
                      <PlusCircle className="size-4 text-white" />
                      Create New Cyber Event
                    </h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Publish an upcoming workshop, challenge, or security seminar</p>
                  </div>

                  <form onSubmit={handleCreateEvent} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CyberInput
                        label="Event Title"
                        placeholder="e.g. CYPHER CTF Spring 2026"
                        value={eventForm.title}
                        onChange={(v) => setEventForm({ ...eventForm, title: v })}
                        required
                      />
                      <CyberInput
                        label="Guidelines/Rules (GDrive Link)"
                        placeholder="https://drive.google.com/..."
                        value={eventForm.url}
                        onChange={(v) => setEventForm({ ...eventForm, url: v })}
                      />
                    </div>

                    <ImageDropzone
                      label="Event Poster / Banner Image"
                      value={eventForm.img}
                      onChange={(v) => setEventForm({ ...eventForm, img: v })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CyberInput
                        label="TryHackMe Room URL (Optional)"
                        placeholder="https://tryhackme.com/room/..."
                        value={eventForm.thm_url}
                        onChange={(v) => setEventForm({ ...eventForm, thm_url: v })}
                      />
                      <CyberInput
                        label="HackTheBox Lab URL (Optional)"
                        placeholder="https://app.hackthebox.com/..."
                        value={eventForm.htb_url}
                        onChange={(v) => setEventForm({ ...eventForm, htb_url: v })}
                      />
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eventForm.is_past}
                          onChange={(e) => setEventForm({ ...eventForm, is_past: e.target.checked })}
                          className="size-4 rounded bg-neutral-900 border-white/20 text-white focus:ring-0 cursor-pointer"
                        />
                        <span>Mark immediately as Past Event (Archival)</span>
                      </label>

                      {eventForm.is_past && (
                        <CyberInput
                          label="Google Drive / Gallery Link"
                          placeholder="https://drive.google.com/..."
                          value={eventForm.gallery_link}
                          onChange={(v) => setEventForm({ ...eventForm, gallery_link: v })}
                          required
                        />
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-medium rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      >
                        <Sparkles className="size-3.5" />
                        Publish Event
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: ADD TEAM MEMBER */}
              {activeTab === 'add-member' && (
                <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#0F0D0F] p-5 shadow-2xl space-y-3.5 max-h-[82vh] overflow-y-auto">
                  <div className="pb-2.5 border-b border-white/10">
                    <h2 className="text-base font-medium text-neutral-100 flex items-center gap-2">
                      <UserPlus className="size-4 text-white" />
                      Add Operative / Team Member
                    </h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Register a core committee member or technical lead</p>
                  </div>

                  <form onSubmit={handleAddTeamMember} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CyberInput
                        label="Full Name"
                        placeholder="e.g. Alex Chen"
                        value={teamForm.name}
                        onChange={(v) => setTeamForm({ ...teamForm, name: v })}
                        required
                      />
                      <CyberInput
                        label="Role / Title"
                        placeholder="e.g. Lead Penetration Tester"
                        value={teamForm.role}
                        onChange={(v) => setTeamForm({ ...teamForm, role: v })}
                        required
                      />
                    </div>

                    <ImageDropzone
                      label="Operative Profile Image"
                      value={teamForm.image_url}
                      onChange={(v) => setTeamForm({ ...teamForm, image_url: v })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CyberInput
                        label="LinkedIn Profile URL"
                        placeholder="https://linkedin.com/in/..."
                        value={teamForm.linkedin}
                        onChange={(v) => setTeamForm({ ...teamForm, linkedin: v })}
                      />
                      <CyberInput
                        label="GitHub Profile URL"
                        placeholder="https://github.com/..."
                        value={teamForm.github}
                        onChange={(v) => setTeamForm({ ...teamForm, github: v })}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-medium rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      >
                        <UserPlus className="size-3.5" />
                        Add Team Member
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: MANAGE TEAM MEMBERS */}
              {activeTab === 'manage-members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-medium text-neutral-100">Team Directory</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">Active team operatives and club leadership</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('add-member')}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="size-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0F0D0F] overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5">Operative</th>
                          <th className="px-6 py-3.5">Role</th>
                          <th className="px-6 py-3.5">Socials</th>
                          <th className="px-6 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {member.image_url ? (
                                  <img src={member.image_url} alt={member.name} className="size-9 rounded-full object-cover border border-white/10" />
                                ) : (
                                  <div className="size-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xs text-neutral-300">
                                    {member.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span className="font-medium text-neutral-100">{member.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-neutral-400">{member.role}</td>
                            <td className="px-6 py-4 text-xs font-mono text-neutral-400 space-x-2">
                              {member.linkedin_url && (
                                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  LinkedIn
                                </a>
                              )}
                              {member.github_url && (
                                <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:underline">
                                  GitHub
                                </a>
                              )}
                              {!member.linkedin_url && !member.github_url && <span className="text-neutral-600">None</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {teamMembers.length === 0 && (
                      <div className="p-12 text-center text-neutral-500">
                        <Users className="size-8 mx-auto mb-3 opacity-30" />
                        <div className="text-sm font-medium text-neutral-400">No team members registered yet.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: QR SCANNER */}
              {activeTab === 'scanner' && (
                <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#0F0D0F] p-8 text-center shadow-2xl space-y-6">
                  <div>
                    <div className="size-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="size-6 text-white" />
                    </div>
                    <h2 className="text-lg font-medium text-neutral-100">Hardware & Camera QR Scanner</h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Select target event from registrations, then scan attendee QR codes to mark real-time attendance.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl border border-dashed border-white/20 bg-neutral-950/80 space-y-4">
                    <form onSubmit={handleScannerSubmit} className="space-y-3">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Scan or Paste Registration UUID..."
                        value={scannerInput}
                        onChange={(e) => {
                          setScannerInput(e.target.value);
                          if (scannerStatus.type !== 'idle') setScannerStatus({ type: 'idle', message: '' });
                        }}
                        className="w-full px-4 py-3 bg-neutral-900 border border-white/15 rounded-xl text-neutral-100 placeholder:text-neutral-600 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none text-center font-mono text-sm transition-all"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-medium rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Verify & Mark Attendance
                      </button>
                    </form>

                    <AnimatePresence>
                      {scannerStatus.type !== 'idle' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 text-left font-mono ${scannerStatus.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
                            : 'bg-red-500/10 border border-red-500/25 text-red-300'
                            }`}
                        >
                          {scannerStatus.type === 'success' ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                          ) : (
                            <AlertCircle className="size-4 shrink-0 text-red-400" />
                          )}
                          <span>{scannerStatus.message}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* TAB 7: SHOWREEL MANAGEMENT */}
              {activeTab === 'showreel' && (
                <div className="space-y-8">
                  {/* Top Notification Banner if any */}
                  {showreelUploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                        <span>{showreelUploadSuccess}</span>
                      </div>
                      <button
                        onClick={() => setShowreelUploadSuccess('')}
                        className="text-emerald-400 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </motion.div>
                  )}

                  {showreelUploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0 text-red-400" />
                        <span>{showreelUploadError}</span>
                      </div>
                      <button
                        onClick={() => setShowreelUploadError('')}
                        className="text-red-400 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </motion.div>
                  )}

                  {/* Header Card */}
                  <div className="rounded-2xl border border-white/10 bg-[#0F0D0F] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                          <Film className="size-5" />
                        </span>
                        <div>
                          <h2 className="text-lg font-medium text-neutral-100 flex items-center gap-2">
                            <span>Main Website Showreel Control</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                              Cloudinary Live
                            </span>
                          </h2>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Upload and replace the video shown in the central TV screen monitor on the main website
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleResetShowreelToDefault}
                        title="Revert to original showreel video"
                        className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white rounded-xl text-xs font-medium transition-all cursor-pointer font-mono"
                      >
                        <RotateCcw className="size-3.5 text-neutral-400" />
                        <span>Reset Default</span>
                      </button>
                      <button
                        onClick={handleReturnToMainSite}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-medium transition-all cursor-pointer font-mono"
                      >
                        <span>View Main Site</span>
                        <ExternalLink className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Two Column Layout: Current Live Video Monitor vs Upload Controls */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: LIVE BROADCAST MONITOR (7 cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0F0D0F] p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                            Live TV Monitor Output (Main Site)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-400">
                          {showreelData?.isCustom ? 'Custom Broadcast' : 'Default Asset'}
                        </span>
                      </div>

                      {/* TV Screen Black Box Frame */}
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex items-center justify-center group">
                        {showreelData?.videoUrl ? (
                          <video
                            key={showreelData.videoUrl}
                            src={showreelData.videoUrl}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-neutral-500 font-mono text-xs">
                            <RefreshCw className="size-5 animate-spin" />
                            <span>Loading live video stream...</span>
                          </div>
                        )}
                      </div>

                      {/* Video Stream Metadata Information */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                          <div className="text-[10px] font-mono text-neutral-500 uppercase">Cloud Storage</div>
                          <div className="text-xs font-mono text-neutral-200 mt-1 truncate">ititit3w (Cloudinary)</div>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                          <div className="text-[10px] font-mono text-neutral-500 uppercase">Format</div>
                          <div className="text-xs font-mono text-neutral-200 mt-1 uppercase">
                            {showreelData?.format || 'MP4 (H.264)'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                          <div className="text-[10px] font-mono text-neutral-500 uppercase">Duration</div>
                          <div className="text-xs font-mono text-neutral-200 mt-1">
                            {showreelData?.duration ? `${showreelData.duration.toFixed(1)}s` : 'Full Reel'}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                          <div className="text-[10px] font-mono text-neutral-500 uppercase">Last Updated</div>
                          <div className="text-xs font-mono text-neutral-200 mt-1 truncate">
                            {showreelData?.updatedAt ? new Date(showreelData.updatedAt).toLocaleDateString() : 'Active'}
                          </div>
                        </div>
                      </div>

                      {/* Direct Cloudinary URL Display */}
                      <div className="pt-2">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Active Cloudinary URL</div>
                        <div className="flex items-center gap-2 bg-neutral-950 border border-white/10 rounded-xl px-3 py-2">
                          <input
                            type="text"
                            readOnly
                            value={showreelData?.videoUrl || ''}
                            className="bg-transparent border-none text-[11px] font-mono text-neutral-300 w-full outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (showreelData?.videoUrl) {
                                navigator.clipboard.writeText(showreelData.videoUrl);
                                alert('Cloudinary URL copied to clipboard!');
                              }
                            }}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white cursor-pointer shrink-0 transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: UPLOAD NEW VIDEO TO CLOUDINARY (5 cols) */}
                    <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0F0D0F] p-6 shadow-xl space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium flex items-center gap-2">
                            <Upload className="size-3.5 text-blue-400" />
                            <span>Upload New Showreel</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">API Upload</span>
                        </div>

                        {/* Title input */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-neutral-400 font-medium">Showreel Label / Title</label>
                          <input
                            type="text"
                            placeholder="e.g. CIPHER Annual Showreel 2026"
                            value={showreelTitle}
                            onChange={(e) => setShowreelTitle(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 transition-all font-mono"
                          />
                        </div>

                        {/* File Dropzone */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-neutral-400 font-medium flex items-center justify-between">
                            <span>Video File (MP4, WEBM, MOV)</span>
                            {showreelSelectedFile && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowreelSelectedFile(null);
                                  if (showreelLocalPreview) URL.revokeObjectURL(showreelLocalPreview);
                                  setShowreelLocalPreview(null);
                                }}
                                className="text-[11px] text-red-400 hover:underline cursor-pointer"
                              >
                                Clear file
                              </button>
                            )}
                          </label>

                          <div
                            onClick={() => showreelFileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/20 hover:border-white/40 bg-neutral-950/60 hover:bg-neutral-900/60 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                          >
                            <input
                              ref={showreelFileInputRef}
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime,video/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleShowreelFileChange(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />

                            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform text-neutral-400 group-hover:text-white">
                              <Film className="size-5" />
                            </div>

                            {showreelSelectedFile ? (
                              <div className="space-y-1">
                                <p className="text-xs text-neutral-200 font-medium truncate max-w-[260px]">
                                  {showreelSelectedFile.name}
                                </p>
                                <p className="text-[10px] text-neutral-500 font-mono">
                                  {(showreelSelectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs text-neutral-300 font-medium">
                                  <span className="text-blue-400 hover:underline">Click to upload</span> or drag & drop
                                </p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">MP4, WEBM, MOV (H.264 recommended)</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Local Preview if file selected */}
                        {showreelLocalPreview && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">Selected File Preview</span>
                            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/15">
                              <video
                                src={showreelLocalPreview}
                                controls
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Or Direct URL Input */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs text-neutral-400 font-medium">Or Direct Cloudinary Video URL</label>
                          <input
                            type="text"
                            placeholder="https://res.cloudinary.com/ititit3w/video/upload/..."
                            value={showreelDirectUrl}
                            onChange={(e) => setShowreelDirectUrl(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <button
                          type="button"
                          onClick={handleUploadShowreelToCloudinary}
                          disabled={isShowreelUploading || (!showreelSelectedFile && !showreelDirectUrl)}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-medium font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isShowreelUploading ? (
                            <>
                              <RefreshCw className="size-4 animate-spin text-white" />
                              <span>{showreelUploadStatus || 'Uploading to Cloudinary...'}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="size-4" />
                              <span>Push Live To Website</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-center text-neutral-500 font-mono">
                          Uploads directly to Cloudinary cloud storage via API credentials
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="absolute inset-0" onClick={() => setSelectedStudent(null)} />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0F0D0F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-sm text-white">
                    {(selectedStudent.student_profiles?.name || 'S').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-100 text-base">
                      {selectedStudent.student_profiles?.name || 'Student Profile'}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      ID: {selectedStudent.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Modal Grid */}
              <div className="p-6 grid grid-cols-2 gap-y-5 gap-x-4">
                <ModalField label="TARGET EVENT" value={events.find(e => e.id === selectedStudent.event_id)?.title} />
                <ModalField label="PRN NUMBER" value={selectedStudent.student_profiles?.prn_number} />
                <ModalField label="EMAIL ADDRESS" value={selectedStudent.student_profiles?.email || 'N/A'} />
                <ModalField label="ROLL NUMBER" value={selectedStudent.student_profiles?.roll_no} />
                <ModalField label="CLASS & BRANCH" value={`${selectedStudent.student_profiles?.class_name || ''} ${selectedStudent.student_profiles?.branch ? `(${selectedStudent.student_profiles?.branch})` : ''}`.trim() || 'N/A'} />
                <ModalField label="TIMESTAMP" value={new Date(selectedStudent.created_at).toLocaleString()} />
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!selectedStudent.approved ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      Pending Auth
                    </span>
                  ) : selectedStudent.attended ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Attended / Present
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      Approved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!selectedStudent.approved ? (
                    <button
                      onClick={() => handleApprove(selectedStudent)}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
                    >
                      Approve Registration
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleAttendance(selectedStudent.id, selectedStudent.attended, selectedStudent.approved)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${selectedStudent.attended
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                    >
                      {selectedStudent.attended ? 'Revoke Attendance' : 'Mark Attendance'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {pastEventModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0D0F] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-white">Mark Event as Past</h3>
                  <p className="text-sm text-neutral-400 mt-1">Upload the Google Drive link for the image gallery.</p>
                </div>
                <button
                  onClick={() => setPastEventModal({ isOpen: false, eventId: null })}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-2">
                <CyberInput
                  label="Google Drive Gallery Link"
                  value={galleryLinkInput}
                  onChange={(v) => { setGalleryLinkInput(v); setGalleryLinkError(''); }}
                  placeholder="https://drive.google.com/..."
                />
                {galleryLinkError && (
                  <p className="text-xs text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{galleryLinkError}</span>
                  </p>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handlePastEventSubmit}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
                >
                  Confirm & Mark Past
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {reportModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0D0F] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <FileText className="size-5 text-blue-400" />
                    Generate AI Report
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">Upload the bill image to include it in the report, or leave it blank.</p>
                </div>
                <button
                  onClick={() => { setReportModal({ isOpen: false, eventId: null }); setBillImage(''); }}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-4 pt-2">
                <ImageDropzone
                  label="Upload Bill Image (Optional)"
                  value={billImage}
                  onChange={(v) => setBillImage(v)}
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate PDF Report'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components with Cypher OS styling
function NavButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${active
        ? 'text-white bg-white/10 border border-white/10 font-medium shadow-sm'
        : 'text-neutral-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-white' : 'text-neutral-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({
  label,
  value,
  delay = 0,
  badge,
  badgeColor = 'emerald',
}: {
  label: string;
  value: string | number;
  delay?: number;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue';
}) {
  const badgeClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }[badgeColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 bg-[#0F0D0F] p-5 shadow-lg relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider">{label}</span>
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl font-medium text-neutral-100 mt-2 font-mono">{value}</div>
    </motion.div>
  );
}

function CyberInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-neutral-400 font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition-all font-mono"
      />
    </div>
  );
}

function ModalField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono mb-1">{label}</div>
      <div className="font-medium text-neutral-200 text-sm">{value || 'N/A'}</div>
    </div>
  );
}
