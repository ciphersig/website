import React, { useEffect, useState, useRef } from 'react';
import { Clock, MapPin, Users, CheckCircle, Award, Download, X, ExternalLink, RefreshCw } from 'lucide-react';
import { EndlessBadge, EndlessButton, EndlessCard, EndlessPageHeader } from '@/components/ui/endless-ui';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

const SUPABASE_URL = 'https://ycqsjqhwrndwlxkcnfpv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xPH8C_LkPv8eI2Rr5IenwQ_AsA0ErAM';

const MOCK_EVENTS = [
  {
    id: 'evt-01',
    title: 'CIPHER CTF Spring 2026 Qualifiers',
    category: 'Competition',
    date: 'Aug 28, 2026',
    time: '18:00 UTC',
    location: 'Online',
    capacity: '250 operatives',
    description: 'Annual 24-hour Capture The Flag qualifier focusing on Web Exploitation, Reverse Engineering, and Cryptography.',
    image_url: '/cases-bg.png',
    is_past: false,
    certificates_enabled: true,
  },
  {
    id: 'evt-02',
    title: 'Practical Web Security & Deep Audit',
    category: 'Workshop',
    date: 'Sep 04, 2026',
    time: '15:00 UTC',
    location: 'Lab Node B, Room 402',
    capacity: '60 operatives',
    description: 'Hands-on live audit workshop covering GraphQL security, JWT authentication flaws, and SSRF vulnerabilities.',
    image_url: '/cases-bg.png',
    is_past: true,
    certificates_enabled: true,
  },
  {
    id: 'evt-03',
    title: 'Advanced Binary Reversing with Ghidra',
    category: 'Academy Lab',
    date: 'Sep 12, 2026',
    time: '17:00 UTC',
    location: 'Cipher Virtual Stream',
    capacity: '100 operatives',
    description: 'Master binary decompilation, assembly patching, and anti-analysis bypass techniques using Ghidra.',
    image_url: '/cases-bg.png',
    is_past: false,
    certificates_enabled: false,
  },
];

export const Events: React.FC = () => {
  const [eventsList, setEventsList] = useState<any[]>(MOCK_EVENTS);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [certModal, setCertModal] = useState<{ isOpen: boolean; eventTitle: string }>({
    isOpen: false,
    eventTitle: ''
  });
  const [studentName, setStudentName] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const certRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchDynamicEvents() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*&order=created_at.desc`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((e: any) => ({
              id: e.id,
              title: e.title,
              category: e.is_past ? 'Past Event' : 'Upcoming Event',
              date: e.created_at ? new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active',
              time: '18:00 UTC',
              location: e.url ? 'Online Link' : 'Cipher Security Node',
              capacity: 'Open to all operatives',
              description: e.description,
              image_url: e.image_url || e.img || '/cases-bg.png',
              is_past: !!e.is_past,
              certificates_enabled: !!e.certificates_enabled,
              gallery_link: e.gallery_link,
              url: e.url
            }));
            setEventsList(formatted);
          }
        }
      } catch (err) {
        console.error('Error fetching events in Cipher OS:', err);
      }
    }
    fetchDynamicEvents();
  }, []);

  const handleRegister = (id: string) => {
    if (registeredIds.includes(id)) {
      setRegisteredIds(registeredIds.filter((item) => item !== id));
    } else {
      setRegisteredIds([...registeredIds, id]);
    }
  };

  const handleDownloadPDF = async () => {
    if (!studentName.trim()) {
      alert('Please enter your full name to display on the certificate!');
      return;
    }

    setVerifyError('');
    setIsGenerating(true);

    try {
      // 1. Verify participant approval status
      const vRes = await fetch('/api/verify-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: studentName.trim(), eventTitle: certModal.eventTitle })
      });

      const vData = await vRes.json();

      if (!vRes.ok || !vData.verified) {
        setVerifyError(vData.message || 'Access Denied: Only registered and admin-approved attendees can download event certificates.');
        setIsGenerating(false);
        return;
      }

      const verifiedName = vData.studentName || studentName.trim();

      if (certRef.current) {
        const canvas = await html2canvas(certRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0a0a0a'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const fileName = `${verifiedName.replace(/\s+/g, '_')}_${certModal.eventTitle.replace(/\s+/g, '_')}_Certificate.pdf`;
        pdf.save(fileName);
      } else {
        generateVectorPDF(verifiedName, certModal.eventTitle);
      }

      setCertModal({ isOpen: false, eventTitle: '' });
      setStudentName('');
      setVerifyError('');
    } catch (err) {
      console.warn('Canvas capture fallback to pure PDF vector generation:', err);
      generateVectorPDF(studentName, certModal.eventTitle);
      setCertModal({ isOpen: false, eventTitle: '' });
      setStudentName('');
      setVerifyError('');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVectorPDF = (name: string, eventTitle: string) => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    // Dark background
    pdf.setFillColor(15, 13, 15);
    pdf.rect(0, 0, width, height, 'F');

    // Outer Red border
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(1.5);
    pdf.rect(10, 10, width - 20, height - 20);

    // Inner thin border
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.rect(14, 14, width - 28, height - 28);

    // Header
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.text('CERTIFICATE OF COMPLETION', width / 2, 45, { align: 'center' });

    // Subtitle
    pdf.setTextColor(239, 68, 68);
    pdf.setFontSize(12);
    pdf.text('THIS IS PROUDLY PRESENTED TO', width / 2, 65, { align: 'center' });

    // Student Name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(name.toUpperCase(), width / 2, 90, { align: 'center' });

    // Line under name
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(0.8);
    pdf.line(width / 2 - 60, 95, width / 2 + 60, 95);

    // Event text
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('FOR SUCCESSFULLY PARTICIPATING IN', width / 2, 115, { align: 'center' });

    // Event Title
    pdf.setTextColor(239, 68, 68);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(eventTitle.toUpperCase(), width / 2, 130, { align: 'center' });

    // Footer
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`ISSUED DATE: ${new Date().toLocaleDateString()}`, 30, 175);
    pdf.text('CIPHER CYBERSECURITY CLUB', width - 30, 175, { align: 'right' });

    const fileName = `${name.replace(/\s+/g, '_')}_${eventTitle.replace(/\s+/g, '_')}_Certificate.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="space-y-8">
      <EndlessPageHeader
        title="Cipher events and CTFs"
        description="View and register for current and past club workshops, live hackathons, and security defense challenges."
      />

      <div className="space-y-5">
        {eventsList.map((event, idx) => {
          const isRegistered = registeredIds.includes(event.id);
          return (
            <EndlessCard key={event.id} delay={idx * 0.1}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Event Poster / Image Display */}
                <div className="w-full md:w-52 h-40 md:h-auto rounded-xl overflow-hidden shrink-0 border border-white/15 relative bg-neutral-900 shadow-md group">
                  <img
                    src={event.image_url || '/cases-bg.png'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/cases-bg.png';
                    }}
                  />
                  {event.is_past && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md font-medium">
                      PAST ARCHIVE
                    </span>
                  )}
                </div>

                {/* Event Info Details */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <EndlessBadge className={event.is_past ? '!text-amber-400 !bg-amber-500/10' : undefined}>
                        {event.category}
                      </EndlessBadge>
                      <span className="text-xs text-neutral-500">{event.date}</span>
                    </div>
                    <h3 className="text-xl font-medium text-neutral-100">{event.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        <span>{event.capacity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Certificate Button */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                    {event.certificates_enabled ? (
                      <button
                        onClick={() => {
                          setCertModal({ isOpen: true, eventTitle: event.title });
                          setVerifyError('');
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                      >
                        <Award className="size-4 text-purple-200" />
                        <span>Get Certificate</span>
                      </button>
                    ) : null}

                    {event.is_past ? (
                      event.gallery_link ? (
                        <a
                          href={event.gallery_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink className="size-3.5" />
                          <span>View Gallery</span>
                        </a>
                      ) : !event.certificates_enabled ? (
                        <EndlessButton variant="secondary" className="opacity-60 cursor-not-allowed text-xs" disabled>
                          Event Completed
                        </EndlessButton>
                      ) : null
                    ) : (
                      <EndlessButton
                        variant={isRegistered ? 'secondary' : 'primary'}
                        onClick={() => handleRegister(event.id)}
                        className="shrink-0 flex items-center gap-2 text-xs"
                      >
                        {isRegistered && <CheckCircle className="size-4" />}
                        {isRegistered ? 'Registered' : 'Register'}
                      </EndlessButton>
                    )}
                  </div>
                </div>
              </div>
            </EndlessCard>
          );
        })}
      </div>

      {/* Certificate Modal inside Cipher OS */}
      {certModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="absolute inset-0" onClick={() => !isGenerating && setCertModal({ isOpen: false, eventTitle: '' })} />

          <div className="relative w-full max-w-4xl bg-[#0F0D0F] border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row">
            {/* Visual Certificate Card to Capture */}
            <div className="w-full md:w-2/3 bg-black p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
              <div
                ref={certRef}
                className="w-full aspect-[1.414] bg-[#0a0a0a] relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 border-[6px] border-[#222]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.08) 0%, rgba(0,0,0,0) 75%)'
                }}
              >
                <div className="absolute top-3 left-3 size-10 border-t-2 border-l-2 border-purple-500/60 pointer-events-none" />
                <div className="absolute top-3 right-3 size-10 border-t-2 border-r-2 border-purple-500/60 pointer-events-none" />
                <div className="absolute bottom-3 left-3 size-10 border-b-2 border-l-2 border-purple-500/60 pointer-events-none" />
                <div className="absolute bottom-3 right-3 size-10 border-b-2 border-r-2 border-purple-500/60 pointer-events-none" />

                {/* Header */}
                <div className="text-center pt-2">
                  <h1 className="text-xl sm:text-3xl font-bold font-outfit text-white tracking-[0.25em] uppercase text-center">
                    CERTIFICATE
                  </h1>
                  <p className="text-[10px] sm:text-xs text-purple-400 font-mono tracking-[0.3em] uppercase mt-1">
                    OF COMPLETION
                  </p>
                </div>

                {/* Body Content */}
                <div className="text-center my-auto py-2 space-y-2">
                  <p className="text-neutral-400 text-[10px] sm:text-xs tracking-widest uppercase">
                    THIS IS PROUDLY PRESENTED TO
                  </p>

                  <div className="text-lg sm:text-2xl font-bold text-white tracking-wider border-b-2 border-purple-500/50 pb-1 px-4 mx-auto max-w-md text-center truncate">
                    {studentName || 'YOUR FULL NAME'}
                  </div>

                  <p className="text-neutral-400 text-[10px] sm:text-xs tracking-widest uppercase pt-1">
                    FOR SUCCESSFULLY COMPLETING
                  </p>

                  <h3 className="text-xs sm:text-base font-bold text-purple-300 tracking-widest text-center px-4 max-w-lg mx-auto uppercase">
                    {certModal.eventTitle}
                  </h3>
                </div>

                {/* Footer Signatures & Metadata */}
                <div className="flex items-end justify-between w-full pt-3 border-t border-white/10 text-left font-mono">
                  <div>
                    <p className="text-neutral-500 text-[9px] uppercase tracking-widest">
                      ISSUED DATE: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-neutral-500 text-[9px] uppercase tracking-widest">
                      VERIFICATION: OFFICIAL RECORD
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-purple-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
                      CIPHER CYBERSECURITY CLUB
                    </div>
                    <p className="text-neutral-500 text-[9px] uppercase tracking-widest">
                      AUTHORIZED SIGNATURE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form & Download Actions */}
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-medium text-white flex items-center gap-2">
                    <Award className="size-4 text-purple-400" />
                    Claim Certificate
                  </h3>
                  <button
                    onClick={() => {
                      setCertModal({ isOpen: false, eventTitle: '' });
                      setVerifyError('');
                    }}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="text-xs text-neutral-300 font-medium block">
                    Registered Name or PRN
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      if (verifyError) setVerifyError('');
                    }}
                    placeholder="Enter registered name or PRN"
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all font-mono"
                    maxLength={40}
                  />
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Must match an admin-approved event registration.
                  </p>

                  {verifyError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono leading-relaxed">
                      {verifyError}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating || !studentName.trim()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Verifying & Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      <span>Download Certificate PDF</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-neutral-500 text-center font-mono">
                  Requires admin-approved registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
