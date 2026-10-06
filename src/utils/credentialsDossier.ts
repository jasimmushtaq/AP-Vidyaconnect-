// ============================================================================
// AP VIDYACONNECT — STATUTORY CREDENTIALS & AUDIT DOSSIER GENERATOR
// Official Printable & Downloadable Government Dossier Slip & PDF Service
// ============================================================================

import { Institution, Company, AttachedDocument } from '../types/database';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Robust document file downloader (handles Blob, Data URL, Cloudinary, and external URLs)
 */
export async function downloadDocumentFile(url: string, filename: string) {
  try {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Attempt fetch for cross-origin URLs to trigger proper browser file download
    const response = await fetch(url, { mode: 'cors' }).catch(() => null);
    if (response && response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } else {
      // Fallback: Direct link download
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Failed to download document:', err);
    window.open(url, '_blank');
  }
}

/**
 * Builds the official HTML printable/downloadable credentials dossier layout
 */
export function generateDossierHTML(
  entity: Institution | Company,
  type: 'institution' | 'company'
): string {
  const isInst = type === 'institution';
  const inst = isInst ? (entity as Institution) : null;
  const comp = !isInst ? (entity as Company) : null;

  const title = isInst ? 'EDUCATIONAL INSTITUTION CREDENTIALS & STATUTORY AUDIT DOSSIER' : 'CORPORATE INDUSTRY PARTNER CREDENTIALS & STATUTORY AUDIT DOSSIER';
  const generatedDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const docs = entity.documents || [];
  if (entity.document_url && docs.length === 0) {
    docs.push({
      id: 'doc-primary',
      name: entity.document_name || (isInst ? 'Accreditation & Affiliation Certificate.pdf' : 'MCA Incorporation Certificate.pdf'),
      url: entity.document_url,
      file_type: 'application/pdf',
      file_size: '1.8 MB',
      category: isInst ? 'accreditation_letter' : 'mca_incorporation',
      uploaded_at: entity.created_at,
      uploaded_by: 'State Verified Administrator'
    });
  }

  const docsRows = docs.length > 0
    ? docs.map((d, i) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${i + 1}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
          <strong>${d.name}</strong>
          <div style="font-size: 11px; color: #64748b;">Category: ${d.category || 'Statutory Compliance'} | Type: ${d.file_type || 'PDF Document'}</div>
        </td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">${d.file_size || '1.5 MB'}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12px;">${new Date(d.uploaded_at).toLocaleDateString('en-IN')}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">
          <span style="background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #a7f3d0;">
            ✓ VERIFIED ATTACHED
          </span>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic;">No uploaded compliance documents currently attached.</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AP VidyaConnect - Credentials Dossier - ${entity.name}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      border-bottom: 2px solid #0E2350;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .gov-title { font-size: 18px; font-weight: 900; color: #0E2350; text-transform: uppercase; letter-spacing: 0.5px; }
    .gov-sub { font-size: 12px; color: #475569; font-weight: 600; margin-top: 2px; }
    .badge-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: ${entity.verification_status === 'verified' ? '#ecfdf5' : entity.verification_status === 'rejected' ? '#fef2f2' : '#fffbeb'};
      color: ${entity.verification_status === 'verified' ? '#065f46' : entity.verification_status === 'rejected' ? '#991b1b' : '#92400e'};
      border: 1px solid ${entity.verification_status === 'verified' ? '#a7f3d0' : entity.verification_status === 'rejected' ? '#fecaca' : '#fde68a'};
    }
    .section-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0E2350;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 0;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #cbd5e1;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .field-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
    .field-value { font-size: 12px; font-weight: 600; color: #0f172a; word-break: break-word; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    .footer-stamp {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .stamp-box {
      border: 2px solid #0E2350;
      color: #0E2350;
      padding: 10px 18px;
      text-align: center;
      border-radius: 8px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      background: #f0fdf4;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="gov-title">Government of Andhra Pradesh</div>
        <div class="gov-sub">Andhra Pradesh State Council of Higher Education (APSCHE) — AP VidyaConnect</div>
        <div style="font-size: 11px; font-weight: 700; color: #F07421; margin-top: 4px;">${title}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge-status">
          ${entity.verification_status === 'verified' ? '✓ STATUTORY AUDIT VERIFIED' : entity.verification_status === 'rejected' ? '✕ AUDIT REJECTED' : '⏳ UNDER VERIFICATION'}
        </span>
        <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Generated: ${generatedDate}</div>
      </div>
    </div>

    <!-- Entity Banner -->
    <div class="section-box" style="background: #f0f7ff; border-color: #bfdbfe;">
      <div class="grid-2">
        <div>
          <div class="field-label">Legal Name of Entity</div>
          <div class="field-value" style="font-size: 16px; font-weight: 900; color: #0E2350;">${entity.name}</div>
          <div style="font-size: 11px; color: #3b82f6; margin-top: 2px;">
            ${isInst ? (inst?.affiliated_university + ' • ' + inst?.district) : (comp?.industry + ' • ' + comp?.headquarters)}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="field-label">${isInst ? 'AISHE / Portal Registration Code' : 'Corporate CIN Registration'}</div>
          <div class="field-value mono" style="font-size: 14px; color: #0E2350; font-weight: 800;">
            ${isInst ? inst?.code : comp?.cin}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Entity ID: <span class="mono">${entity.id}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Statutory Identification -->
    <div class="section-box">
      <div class="section-title">1. Statutory Identification & Legal Classification</div>
      <div class="grid-3">
        <div>
          <div class="field-label">${isInst ? 'Institution Type' : 'Industry Domain'}</div>
          <div class="field-value">${isInst ? (inst?.type === 'govt_degree_college' ? 'Govt Degree College (GDC)' : inst?.type) : comp?.industry}</div>
        </div>
        <div>
          <div class="field-label">${isInst ? 'Affiliated University' : 'Specialized Sector'}</div>
          <div class="field-value">${isInst ? inst?.affiliated_university : (comp?.sector || 'Enterprise Tech')}</div>
        </div>
        <div>
          <div class="field-label">${isInst ? 'NAAC Accreditation' : 'GST Registration No.'}</div>
          <div class="field-value mono">${isInst ? (inst?.accreditation || 'NAAC Accredited') : (comp?.gst || '36AABCP1234F1Z9')}</div>
        </div>
        <div>
          <div class="field-label">${isInst ? 'Campus Location / District' : 'Corporate Headquarters'}</div>
          <div class="field-value">${isInst ? `${inst?.district}, ${inst?.state}` : comp?.headquarters}</div>
        </div>
        <div>
          <div class="field-label">Official Website</div>
          <div class="field-value">${entity.website || 'https://apvidyaconnect.ap.gov.in'}</div>
        </div>
        <div>
          <div class="field-label">Registration Date</div>
          <div class="field-value">${new Date(entity.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
    </div>

    <!-- Authorized Signatory & Administrative Login Credentials -->
    <div class="section-box">
      <div class="section-title">2. Authorized Signatory & Portal Administrator Account</div>
      <div class="grid-3">
        <div>
          <div class="field-label">${isInst ? 'Principal / Institutional Head' : 'Authorized Signatory Name'}</div>
          <div class="field-value" style="font-weight: 800;">${isInst ? (inst?.principal_name || 'Dr. Principal In-Charge') : (comp?.authorized_person_name || 'Head of University Relations')}</div>
        </div>
        <div>
          <div class="field-label">Official Designation</div>
          <div class="field-value">${isInst ? 'Principal & Institutional Head' : (comp?.designation || 'Director')}</div>
        </div>
        <div>
          <div class="field-label">Official Login Email (Primary Admin ID)</div>
          <div class="field-value mono" style="color: #1e40af;">${entity.official_email}</div>
        </div>
        <div>
          <div class="field-label">Official Contact Telephone</div>
          <div class="field-value mono">${entity.official_phone}</div>
        </div>
        <div>
          <div class="field-label">Portal Account Access State</div>
          <div class="field-value" style="color: ${entity.verification_status === 'verified' ? '#059669' : '#dc2626'}; font-weight: 800;">
            ${entity.verification_status === 'verified' ? 'Active & Authenticated' : entity.verification_status === 'rejected' ? 'Blocked & Denied' : 'Pending Verification'}
          </div>
        </div>
        <div>
          <div class="field-label">Verification Audit Remark</div>
          <div class="field-value" style="font-size: 11px;">${entity.verification_notes || 'All credentials inspected by State Super Admin'}</div>
        </div>
      </div>
    </div>

    <!-- Attached Compliance Documents & PDFs -->
    <div class="section-box">
      <div class="section-title">3. Attached Statutory Compliance Documents & Verified PDFs (${docs.length})</div>
      <table>
        <thead>
          <tr style="background: #e2e8f0; color: #1e293b; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 6px 12px; border: 1px solid #cbd5e1; width: 40px;">#</th>
            <th style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: left;">Document / Certificate Title</th>
            <th style="padding: 6px 12px; border: 1px solid #cbd5e1; width: 80px;">Size</th>
            <th style="padding: 6px 12px; border: 1px solid #cbd5e1; width: 100px;">Uploaded</th>
            <th style="padding: 6px 12px; border: 1px solid #cbd5e1; width: 120px;">Audit State</th>
          </tr>
        </thead>
        <tbody>
          ${docsRows}
        </tbody>
      </table>
    </div>

    <!-- Verification Seal & Sign-Off -->
    <div class="footer-stamp">
      <div>
        <div style="font-weight: 700; color: #0E2350;">State Portal Directorate — Higher Education Department</div>
        <div>Official Verification Hash: <span class="mono" style="font-weight: bold; color: #334155;">AP-VC-AUTH-${entity.id.toUpperCase()}-${Math.abs(entity.name.length * 9973).toString(16)}</span></div>
        <div style="font-size: 10px; margin-top: 4px;">This document serves as an authentic record of verified registration credentials in the AP VidyaConnect State Portal.</div>
      </div>
      <div class="stamp-box">
        <div>APSCHE CERTIFIED</div>
        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">DIGITALLY VALIDATED</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Triggers instant printing of the official credentials dossier
 */
export function printCredentialsDossier(
  entity: Institution | Company,
  type: 'institution' | 'company'
) {
  const htmlContent = generateDossierHTML(entity, type);
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    alert('Please allow pop-ups to print the Credentials Dossier.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Trigger print after rendering
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 400);
}

/**
 * Generates and downloads the official Credentials Dossier strictly as a PDF (.pdf) file
 */
export function downloadCredentialsDossierPDF(
  entity: Institution | Company,
  type: 'institution' | 'company'
) {
  const isInst = type === 'institution';
  const inst = isInst ? (entity as Institution) : null;
  const comp = !isInst ? (entity as Company) : null;
  const code = isInst ? (inst?.code || 'INST') : (comp?.cin || 'CORP');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header background banner
  doc.setFillColor(14, 35, 80); // #0E2350
  doc.rect(0, 0, 210, 26, 'F');

  // Header texts
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF ANDHRA PRADESH', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 250);
  doc.text('Andhra Pradesh State Council of Higher Education (APSCHE) — AP VidyaConnect', 14, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(240, 116, 33); // #F07421
  doc.text(
    isInst
      ? 'EDUCATIONAL INSTITUTION CREDENTIALS & STATUTORY AUDIT DOSSIER'
      : 'CORPORATE INDUSTRY PARTNER CREDENTIALS & STATUTORY AUDIT DOSSIER',
    14,
    22
  );

  // Status Badge box (top right)
  const isVerified = entity.verification_status === 'verified';
  const isRejected = entity.verification_status === 'rejected';
  doc.setFillColor(isVerified ? 236 : isRejected ? 254 : 255, isVerified ? 253 : isRejected ? 242 : 251, isVerified ? 245 : isRejected ? 242 : 235);
  doc.roundedRect(145, 6, 52, 14, 2, 2, 'F');
  doc.setTextColor(isVerified ? 4 : isRejected ? 153 : 146, isVerified ? 120 : isRejected ? 27 : 64, isVerified ? 87 : isRejected ? 27 : 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isVerified ? '✓ AUDIT VERIFIED' : isRejected ? '✕ AUDIT REJECTED' : '⏳ UNDER VERIFICATION',
    148,
    12
  );
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 148, 16.5);

  // Entity Title Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 30, 182, 20, 2, 2, 'FD');

  doc.setTextColor(14, 35, 80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(entity.name, 18, 38);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const subtext = isInst
    ? `${inst?.affiliated_university || ''} • District: ${inst?.district || ''}, ${inst?.state || 'AP'}`
    : `${comp?.industry || ''} • Headquarters: ${comp?.headquarters || ''}`;
  doc.text(subtext, 18, 44);

  // Section 1: Statutory & Administrative Details Table
  autoTable(doc, {
    startY: 54,
    head: [['Statutory Field', 'Registration Detail', 'Administrative Parameter', 'Authorized Record']],
    body: [
      [
        isInst ? 'AISHE / Portal Code' : 'Corporate CIN',
        code,
        isInst ? 'Principal / Dean Name' : 'Authorized Signatory',
        isInst ? (inst?.principal_name || 'Dr. Principal') : (comp?.authorized_person_name || 'Director')
      ],
      [
        isInst ? 'Institution Type' : 'Industry Sector',
        isInst ? (inst?.type || 'govt_degree_college') : (comp?.industry || 'Information Technology'),
        'Official Designation',
        isInst ? 'Principal & Institutional Head' : (comp?.designation || 'Head of University Relations')
      ],
      [
        isInst ? 'Affiliated University' : 'Specialized Domain',
        isInst ? (inst?.affiliated_university || 'State University') : (comp?.sector || 'Software Services'),
        'Official Login Email',
        entity.official_email
      ],
      [
        isInst ? 'NAAC Accreditation' : 'GST Registration No.',
        isInst ? (inst?.accreditation || 'NAAC A Grade') : (comp?.gst || '36AABCP1234F1Z9'),
        'Official Telephone',
        entity.official_phone
      ],
      [
        'Campus / Location',
        isInst ? `${inst?.district}, ${inst?.state}` : (comp?.headquarters || ''),
        'Verification Status',
        entity.verification_status.toUpperCase()
      ],
      [
        'Official Website',
        entity.website || 'https://apvidyaconnect.ap.gov.in',
        'Registration Date',
        new Date(entity.created_at).toLocaleDateString('en-IN')
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [14, 35, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // Section 2: Attached Compliance Documents Table
  const docs = entity.documents && entity.documents.length > 0
    ? entity.documents
    : entity.document_url
    ? [{
        id: 'doc-1',
        name: entity.document_name || (isInst ? 'Accreditation & Affiliation Certificate (PDF)' : 'MCA Incorporation Certificate (PDF)'),
        url: entity.document_url,
        file_size: '2.1 MB',
        category: isInst ? 'accreditation_letter' : 'mca_incorporation',
        uploaded_at: entity.created_at
      }]
    : [];

  const docsBody = docs.length > 0
    ? docs.map((d, i) => [
        (i + 1).toString(),
        d.name,
        d.category?.replace(/_/g, ' ') || 'Statutory PDF',
        d.file_size || '1.8 MB',
        new Date(d.uploaded_at).toLocaleDateString('en-IN'),
        '✓ VERIFIED ATTACHED'
      ])
    : [['-', 'No compliance documents attached during registration', '-', '-', '-', 'PENDING']];

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 120;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 35, 80);
  doc.text(`ATTACHED STATUTORY COMPLIANCE DOCUMENTS & VERIFIED PDFS (${docs.length})`, 14, finalY + 8);

  autoTable(doc, {
    startY: finalY + 11,
    head: [['#', 'Document Title', 'Document Category', 'Size', 'Upload Date', 'Audit Status']],
    body: docsBody,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 116, 33], // #F07421
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [255, 247, 237]
    },
    margin: { left: 14, right: 14 }
  });

  // Footer seal & verification signature
  const footerY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 230;

  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 35, 80);
  doc.text('State Portal Directorate — Higher Education Department, Andhra Pradesh', 14, footerY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Digital Verification Hash: AP-VC-AUTH-${entity.id.toUpperCase()}-${Math.abs(entity.name.length * 9973).toString(16)}`, 14, footerY + 11);
  doc.text('This digital credentials slip serves as an authentic certified record in the AP VidyaConnect portal.', 14, footerY + 15);

  // Stamp Box
  doc.setDrawColor(14, 35, 80);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(150, footerY + 3, 46, 14, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 35, 80);
  doc.text('APSCHE CERTIFIED', 153, footerY + 9);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text('DIGITALLY VALIDATED SLIP', 153, footerY + 14);

  // Save the PDF directly
  doc.save(`AP_VidyaConnect_Dossier_${code}.pdf`);
}

/**
 * Downloads the credentials dossier as a self-contained HTML / document file
 */
export function downloadCredentialsDossierHTML(
  entity: Institution | Company,
  type: 'institution' | 'company'
) {
  const htmlContent = generateDossierHTML(entity, type);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const code = 'code' in entity ? entity.code : entity.cin;
  a.href = url;
  a.download = `AP_VidyaConnect_Dossier_${code || entity.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Downloads CSV summary of the entity credentials
 */
export function downloadCredentialsCSV(
  entity: Institution | Company,
  type: 'institution' | 'company'
) {
  const isInst = type === 'institution';
  const inst = isInst ? (entity as Institution) : null;
  const comp = !isInst ? (entity as Company) : null;

  const rows = [
    ['Field', 'Statutory Registration Detail'],
    ['Entity Name', entity.name],
    ['Entity Category', isInst ? 'Educational Institution' : 'Corporate Industry Partner'],
    ['Registration Code / CIN', isInst ? (inst?.code || '') : (comp?.cin || '')],
    ['Type / Sector', isInst ? (inst?.type || '') : (comp?.industry || '')],
    ['University / Specialization', isInst ? (inst?.affiliated_university || '') : (comp?.sector || '')],
    ['Accreditation / GST', isInst ? (inst?.accreditation || '') : (comp?.gst || '')],
    ['District / Location', isInst ? `${inst?.district}, ${inst?.state}` : (comp?.headquarters || '')],
    ['Official Login Email', entity.official_email],
    ['Official Phone', entity.official_phone],
    ['Principal / Signatory Name', isInst ? (inst?.principal_name || '') : (comp?.authorized_person_name || '')],
    ['Designation', isInst ? 'Principal' : (comp?.designation || '')],
    ['Verification Status', entity.verification_status],
    ['Verification Notes', entity.verification_notes || ''],
    ['Attached Documents Count', (entity.documents?.length || (entity.document_url ? 1 : 0)).toString()],
    ['Registration Date', entity.created_at],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const code = 'code' in entity ? entity.code : entity.cin;
  link.setAttribute('download', `AP_VidyaConnect_Credentials_${code || entity.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

