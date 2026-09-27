'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { homeLogger } from '../utils/logger';

interface CertificateModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  eventName?: string | null;
  regId?: string;
}

export function CertificateModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  eventName: propEventName,
}: CertificateModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalEventName, setInternalEventName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const isOpen = Boolean(propIsOpen || internalIsOpen);
  const eventName = propEventName || internalEventName || 'CYBERSECURITY EVENT';

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalIsOpen(false);
    setVerifyError('');
    setSuccessMessage('');
  };

  useEffect(() => {
    const handleOpen = (e: any) => {
      setInternalEventName(e.detail?.eventName || e.detail?.title || 'Cyber Event');
      setInternalIsOpen(true);
      setVerifyError('');
      setSuccessMessage('');
    };

    window.addEventListener('open-certificate-modal', handleOpen);
    return () => window.removeEventListener('open-certificate-modal', handleOpen);
  }, []);

  const arrayBufferToBase64 = (buffer: ArrayBuffer | Uint8Array) => {
    let binary = '';
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleDownload = async () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      alert("Please enter both your name/PRN and registered email!");
      return;
    }

    setVerifyError('');
    setSuccessMessage('');
    setIsGenerating(true);

    try {
      homeLogger.debug('[Certificate] Verifying registration approval for:', studentName);

      // 1. Verify approval status via API
      const vRes = await fetch('/api/verify-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentName: studentName.trim(), 
          studentEmail: studentEmail.trim(),
          eventTitle: eventName 
        })
      });

      const vData = await vRes.json();

      if (!vRes.ok || !vData.verified) {
        setVerifyError(vData.message || 'Access Denied: Only registered and admin-approved attendees can download event certificates.');
        setIsGenerating(false);
        return;
      }

      const verifiedName = vData.studentName || studentName.trim();
      const verifiedEmail = vData.studentEmail || studentEmail.trim();

      // 2. Generate PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Fetch base template
      const imageBytes = await fetch('/certificate-template.png').then(res => res.arrayBuffer());
      const bgImage = await pdfDoc.embedPng(imageBytes);
      const { width, height } = bgImage.scale(1);

      const page = pdfDoc.addPage([width, height]);
      page.drawImage(bgImage, {
        x: 0,
        y: 0,
        width,
        height,
      });

      // Embed custom font for Name
      const nameFontBytes = await fetch('/fonts/GreatVibes-Regular.ttf').then(r => r.arrayBuffer());
      const nameFont = await pdfDoc.embedFont(nameFontBytes);

      // Draw Student Name (Cursive, no all-caps)
      const studentNameText = verifiedName;
      const studentNameFontSize = 110; // Adjusted for better visual balance
      const studentNameWidth = nameFont.widthOfTextAtSize(studentNameText, studentNameFontSize);
      
      const nameY = height * 0.525; // Shifted UP above the underline

      page.drawText(studentNameText, {
        x: width / 2 - studentNameWidth / 2,
        y: nameY, 
        size: studentNameFontSize,
        font: nameFont,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Embed standard font for paragraph
      const eventFont = await pdfDoc.embedFont('Helvetica');
      const eventFontSize = 18; // Increased slightly
      const paraColor = rgb(0.15, 0.5, 0.4);

      // Paragraph Lines
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
      const lineHeight = 28; // Increased spacing

      drawCenteredText(line1, paraStartY);
      drawCenteredText(line2, paraStartY - lineHeight);
      drawCenteredText(line3, paraStartY - (lineHeight * 2));

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = arrayBufferToBase64(pdfBytes);

      // 3. Download to local machine
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${verifiedName.replace(/\s+/g, '_')}_${eventName.replace(/\s+/g, '_')}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 4. Send Email with PDF
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'certificate',
            regId: vData.regId,
            studentEmail: verifiedEmail,
            studentName: verifiedName,
            eventName: eventName,
            pdfBase64: pdfBase64,
          })
        });
      } catch (emailErr) {
        console.error("Failed to email certificate", emailErr);
      }

      homeLogger.debug('[Certificate] Download and Email complete');
      setSuccessMessage('Certificate downloaded and sent to your email successfully!');
      
      setTimeout(() => {
        handleClose();
        setStudentName('');
        setStudentEmail('');
        setSuccessMessage('');
      }, 4000);

    } catch (error: any) {
      homeLogger.error('[Certificate] Error generating PDF:', error);
      setVerifyError('Failed to generate certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0" onClick={() => !isGenerating && handleClose()} />
        
        <div className="relative w-full max-w-md bg-[#111] border border-emerald-500/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.2)] z-10 flex flex-col">
          {/* Form Side */}
          <div className="w-full p-6 md:p-8 flex flex-col justify-between font-outfit bg-[#111]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wider uppercase">
                    CLAIM CERTIFICATE
                  </h2>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5 opacity-90">
                    &gt; OFFICIAL ISSUANCE NODE
                  </p>
                </div>
                <button
                  onClick={() => handleClose()}
                  className="text-white/50 hover:text-white transition-colors text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <label className="block text-xs text-white/70 uppercase tracking-wider font-mono">
                  Registered Name or PRN
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (verifyError) setVerifyError('');
                  }}
                  placeholder="E.g. John Doe or PRN"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
                  maxLength={40}
                />
                
                <label className="block text-xs text-white/70 uppercase tracking-wider font-mono mt-4">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => {
                    setStudentEmail(e.target.value);
                    if (verifyError) setVerifyError('');
                  }}
                  placeholder="E.g. hacker@example.com"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
                />

                <p className="text-[10px] text-white/40 font-mono">
                  Enter your registered name/PRN and email. Verification required.
                </p>

                {verifyError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono leading-relaxed">
                    {verifyError}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-mono leading-relaxed text-center">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={handleDownload}
                disabled={isGenerating || !studentName.trim() || !studentEmail.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-[0.2em] uppercase py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>GENERATING & SENDING...</span>
                  </>
                ) : (
                  <span>CLAIM CERTIFICATE</span>
                )}
              </button>
              <p className="text-white/30 text-[10px] text-center font-mono">
                Requires admin-approved and attended event registration.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
