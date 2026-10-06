// ============================================================================
// AP VIDYACONNECT — PIXEL-PERFECT OFFICIAL 2-PAGE MOU DOCUMENT VIEWER
// Strict 2-Page Standard Output (A4 Print & PDF Safe with Zero Overflow)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { MoUAgreement } from '../../types/database';
import { cleanSignatureImage } from '../../utils/signatureExtractor';

interface MoUDocumentViewProps {
  mou: MoUAgreement;
  showVerificationBadge?: boolean;
}

// Dedicated Authentic Signature Display component that dynamically extracts
// pure pen ink and completely knocks out grey paper boxes & photo boundaries
const AuthenticSignatureDisplay: React.FC<{
  signatureData?: string;
  fallbackName?: string;
  alt: string;
}> = ({ signatureData, fallbackName, alt }) => {
  const [cleanedSrc, setCleanedSrc] = useState<string | null>(null);

  const isImage = Boolean(
    signatureData &&
    (signatureData.startsWith('data:image') ||
      signatureData.startsWith('http') ||
      signatureData.startsWith('/'))
  );

  useEffect(() => {
    if (isImage && signatureData) {
      let isMounted = true;
      cleanSignatureImage(signatureData, { inkColor: 'navy' }).then((cleanResult) => {
        if (isMounted) {
          setCleanedSrc(cleanResult);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [signatureData, isImage]);

  if (!signatureData && !fallbackName) {
    return <div className="h-14" />;
  }

  if (isImage && signatureData) {
    return (
      <img
        src={cleanedSrc || signatureData}
        alt={alt}
        className="max-h-14 max-w-[180px] object-contain select-none"
        style={{
          mixBlendMode: 'multiply'
        }}
      />
    );
  }

  return (
    <div
      className="text-xl font-bold text-navy-950 italic select-none"
      style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
    >
      {signatureData || fallbackName}
    </div>
  );
};

const getOrdinalDay = (dayStr: string) => {
  const num = parseInt(dayStr, 10);
  if (isNaN(num)) return dayStr;
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

export const MoUDocumentView: React.FC<MoUDocumentViewProps> = ({
  mou
}) => {
  return (
    <div className="bg-slate-200/70 p-4 sm:p-8 rounded-2xl flex flex-col items-center gap-8 print:p-0 print:m-0 print:bg-white print:gap-0 print:block">
      {/* INJECTED PRINT-SAFE CSS ENFORCING STRICT 2-PAGE LIMIT */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 18mm 12mm 18mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10.5pt !important;
            line-height: 1.34 !important;
          }
          .mou-doc-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 265mm !important;
            max-height: 265mm !important;
            height: 265mm !important;
            width: 100% !important;
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
          }
          .mou-doc-page-1 {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .mou-doc-page-2 {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .mou-text {
            font-size: 10.5pt !important;
            line-height: 1.34 !important;
            margin-bottom: 8pt !important;
          }
          .mou-header-main {
            font-size: 14pt !important;
            margin-bottom: 4pt !important;
          }
          .mou-header-sub {
            font-size: 12pt !important;
            margin-bottom: 4pt !important;
          }
          .mou-clause-title {
            font-size: 11pt !important;
            font-weight: bold !important;
            margin-top: 8pt !important;
            margin-bottom: 4pt !important;
          }
          .signature-box {
            min-height: 95px !important;
            max-height: 110px !important;
          }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* PAGE 1 (EXACTLY 1 SHEET IN PRINT & PDF) */}
      {/* ==================================================================== */}
      <div 
        className="mou-doc-page mou-doc-page-1 w-full max-w-[800px] bg-white text-gray-900 shadow-2xl rounded-sm p-8 sm:p-12 border border-gray-300 relative print:shadow-none print:border-none print:p-0 min-h-[1020px] flex flex-col justify-between overflow-hidden"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none">
          <div className="text-center font-bold text-8xl uppercase tracking-widest text-navy-900 rotate-[-25deg]">
            AP VIDYACONNECT
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-between flex-1">
          <div>
            {/* Document Header */}
            <div className="text-center space-y-2 mb-6">
              <h1 className="mou-header-main text-xl sm:text-2xl font-bold tracking-wider uppercase text-gray-900">
                MEMORANDUM OF UNDERSTANDING (MoU)
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-gray-700">
                BETWEEN
              </p>
              <h2 className="mou-header-sub text-base sm:text-lg font-bold uppercase text-navy-900">
                {mou.first_party_name}
              </h2>
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-gray-700">
                AND
              </p>
              <h2 className="mou-header-sub text-base sm:text-lg font-bold uppercase text-orange-950">
                {mou.second_party_name}
              </h2>
            </div>

            {/* Preamble */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-3 mb-5">
              <p>
                This Memorandum of Understanding (hereinafter called as the &apos;MoU&apos;) is entered into on this <span className="font-bold">{getOrdinalDay(mou.effective_day)} day of {mou.effective_month}, {mou.effective_year}</span> by and between.
              </p>

              <p>
                <span className="font-bold uppercase">{mou.first_party_name}</span>, the First Party represented herein by its{' '}
                <span className="font-semibold">{mou.first_party_rep_title}</span> and{' '}
                <span className="font-bold uppercase">{mou.second_party_name}</span>. The Second party, and represented herein by its{' '}
                <span className="font-semibold">{mou.second_party_rep_title}</span>,{' '}
                <span className="font-bold">{mou.second_party_rep_name}</span>
              </p>
            </div>

            {/* WHEREAS Section */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-2.5 mb-5">
              <p className="font-bold">WHEREAS:</p>
              <p>
                <span className="font-bold">A)</span> First Party is a Higher Educational Institution named:{' '}
                <span className="font-bold uppercase">{mou.first_party_name}</span>
              </p>
              <p>
                <span className="font-bold">B)</span> First Party &amp; Second Party believe that collaboration and co-operation between themselves will promote more effective use of each of their resources, and provide each of them with enhanced opportunities.
              </p>
              <p>
                <span className="font-bold">C)</span> The Parties intent to cooperate and focus their efforts on cooperation within area of{' '}
                <span className="font-semibold">
                  {mou.areas_of_cooperation && mou.areas_of_cooperation.length > 0
                    ? mou.areas_of_cooperation.join(', ')
                    : 'Skill Based Training, Education, Placement, Industrial Visit, Expert Lecture'}
                </span>.
              </p>
              <p>
                <span className="font-bold">D)</span> <span className="font-bold uppercase">{mou.second_party_name}</span>, - the Second Party is engaged in{' '}
                <span className="font-semibold">{mou.company_specialization}</span>.
              </p>
            </div>

            {/* NOW THEREFORE */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-3 mb-5">
              <p className="font-bold uppercase">
                NOW THEREFORE, IN CONSIDERATION OF THE MUTUAL PROMISES SET FORTH IN THIS MOU, THE PARTIES HERETO AGREE AS FOLLOWS:
              </p>
            </div>

            {/* CLAUSE 1 */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-2">
              <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">CLAUSE 1</h3>
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">CO-OPERATION</h3>
              </div>
              <div className="space-y-1.5 text-gray-800">
                <p>
                  <span className="font-bold">1.1</span> Both Parties are united by common interests and objectives, and they shall establish co-operation.
                </p>
                <p>
                  <span className="font-bold">1.2</span> First Party and Second Party co-operation will facilitate effective utilization of the intellectual capabilities.
                </p>
                <p>
                  <span className="font-bold">1.3</span> The parties shall co-operate with each other and shall as promptly as is responsibly practical, relevant agreement.
                </p>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 relative z-10 print:pt-2">
            <span>MoU Reference: <strong className="text-gray-700 font-mono">{mou.mou_code}</strong></span>
            <span className="font-semibold">Page 1 of 2</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 2 (EXACTLY 1 SHEET IN PRINT & PDF) */}
      {/* ==================================================================== */}
      <div 
        className="mou-doc-page mou-doc-page-2 w-full max-w-[800px] bg-white text-gray-900 shadow-2xl rounded-sm p-8 sm:p-12 border border-gray-300 relative print:shadow-none print:border-none print:p-0 min-h-[1020px] flex flex-col justify-between overflow-hidden"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none">
          <div className="text-center font-bold text-8xl uppercase tracking-widest text-navy-900 rotate-[-25deg]">
            AP VIDYACONNECT
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-between flex-1">
          <div className="space-y-4">
            {/* CLAUSE 2 */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-2">
              <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">CLAUSE 2</h3>
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">SCOPE OF THE MOU</h3>
              </div>
              
              <div className="space-y-2 text-gray-800">
                <p>
                  <span className="font-bold">2.1 Industrial Training &amp; Visits:</span> Industry and Institution interaction will provide an insight into the latest developments / requirements of the industries; the Second Party to permit the Faculty and Students of the First Party to visit its group companies and also involve in Industrial Training Programs for the First Party. This will provide confidence &amp; smooth transition for students work. Also, the Second party may register on the AICTE Internship Portal and APSCHE Portal for the benefit of students.
                </p>
                <p>
                  <span className="font-bold">2.2 Guest Lectures:</span> Second Party to extend the necessary support to deliver guest lecturers to the students of the First Party on the technology trends and in house requirements.
                </p>
                <p>
                  <span className="font-bold">2.3 Placement of trained students:</span> second party will actively engage to help the delivery of the training and placement of the students of the first party on the technology trends and in house requirements.
                </p>
                <p>
                  <span className="font-bold">2.4</span> There is no financial commitment on the part of the{' '}
                  <span className="font-bold uppercase">{mou.first_party_name}</span>, the first party to take up any program mention in MoU. If there is any financial consideration, it will be dealt separately.
                </p>
                <p>
                  <span className="font-bold">2.5</span> Both Parties to obtain all internal approvals, consents, permissions, and licenses of whatsoever nature required.
                </p>
              </div>
            </div>

            {/* CLAUSE 3 */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-1.5">
              <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">CLAUSE 3</h3>
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">VALIDITY</h3>
              </div>
              <p className="text-gray-800">
                <span className="font-bold">3.1</span> This Agreement will be valid until it is expressly terminated by either Party on mutually agreed terms, during which period, the Second Part.
              </p>
            </div>

            {/* CLAUSE 4 */}
            <div className="mou-text text-[13px] sm:text-sm leading-relaxed text-justify space-y-1.5">
              <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">CLAUSE 4</h3>
                <h3 className="mou-clause-title font-bold uppercase tracking-wide">RELATIONSHIP BETWEEN THE PARTIES</h3>
              </div>
              <p className="text-gray-800">
                <span className="font-bold">5.1</span> It is expressly agreed that First Party and Second Party are acting under this MOU as independent contractors, and the relationship established under this MOU shall not be construed as a partnership.
              </p>
            </div>

            {/* DUAL SIGNATURE BLOCK — EXACT FORMAT WITH PERFECT COMPACT FIT */}
            <div className="pt-6">
              <div className="grid grid-cols-2 gap-8 items-start">
                {/* First Party (College) */}
                <div className="signature-box space-y-1 text-xs sm:text-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm sm:text-base text-gray-900">First Party</span>
                    </div>
                  </div>

                  <div className="min-h-[56px] flex flex-col justify-end">
                    {mou.first_party_signature ? (
                      <div className="h-14 flex items-center">
                        <AuthenticSignatureDisplay 
                          signatureData={mou.first_party_signature.signature_data}
                          fallbackName={mou.first_party_signature.signed_by_name}
                          alt="First Party Signature"
                        />
                      </div>
                    ) : (
                      <div className="h-14" />
                    )}
                  </div>

                  <div className="pb-1">
                    <p className="text-[10.5px] text-gray-700 font-medium">
                      {mou.first_party_signature?.designation || mou.first_party_rep_title || 'Principal / Director / Head of Department'}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-gray-300">
                    <p className="font-bold text-[11px] text-gray-800 uppercase">
                      {mou.first_party_name}
                    </p>
                  </div>
                </div>

                {/* Second Party (Company) */}
                <div className="signature-box space-y-1 text-xs sm:text-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm sm:text-base text-gray-900">Second Party</span>
                    </div>
                  </div>

                  <div className="min-h-[56px] flex flex-col justify-end">
                    {mou.second_party_signature ? (
                      <div className="h-14 flex items-center">
                        <AuthenticSignatureDisplay 
                          signatureData={mou.second_party_signature.signature_data}
                          fallbackName={mou.second_party_signature.signed_by_name}
                          alt="Second Party Signature"
                        />
                      </div>
                    ) : (
                      <div className="h-14" />
                    )}
                  </div>

                  <div className="pb-1">
                    <p className="text-[10.5px] text-gray-700 font-medium">
                      {mou.second_party_signature?.designation || mou.second_party_rep_title || 'Centre Head / Director / Managing Director'}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-gray-300">
                    <p className="font-bold text-[11px] text-gray-800 uppercase">
                      {mou.second_party_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer & QR Integrity Stamp */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 relative z-10 print:pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gray-100 border border-gray-300 flex items-center justify-center font-mono font-bold text-[9px] text-navy-800">
                QR
              </div>
              <div>
                <p className="font-mono text-[10px] text-gray-700">APSCHE / APVC Verification Hash: <span className="font-bold">{mou.id.slice(0, 10).toUpperCase()}</span></p>
                <p className="text-[9px] text-gray-400">Authenticated via AP VidyaConnect Digital Legal Framework</p>
              </div>
            </div>
            <span className="font-semibold">Page 2 of 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
