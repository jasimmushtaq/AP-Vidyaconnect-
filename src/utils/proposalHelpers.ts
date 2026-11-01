// ============================================================================
// AP VIDYACONNECT — PROPOSAL WORKFLOW & ROLE MATCHING HELPERS
// Robust bilateral matching, status categorization, and cross-device sync
// ============================================================================

import { InternshipProposal, Institution, Company, Profile, ProposalStatus } from '../types/database';

/**
 * Robustly checks if a proposal belongs to a given academic institution.
 * Guards against ID string vs UUID differences, code format variations, and email discrepancies.
 */
export function isProposalForInstitution(
  proposal: InternshipProposal,
  institutionId?: string,
  institution?: Institution,
  user?: Profile
): boolean {
  if (!proposal) return false;

  // 1. Direct ID match
  if (institutionId) {
    if (proposal.institution_id === institutionId) return true;
    if (proposal.institution?.id === institutionId) return true;
  }

  // 2. User institution ID match
  if (user?.institution_id) {
    if (proposal.institution_id === user.institution_id) return true;
    if (proposal.institution?.id === user.institution_id) return true;
  }

  // 3. User created_by match
  if (user?.id && proposal.created_by === user.id) {
    return true;
  }

  // 4. Institution object attributes match
  if (institution) {
    if (institution.id && (proposal.institution_id === institution.id || proposal.institution?.id === institution.id)) {
      return true;
    }
    if (institution.code && proposal.institution?.code) {
      if (institution.code.toLowerCase().trim() === proposal.institution.code.toLowerCase().trim()) {
        return true;
      }
    }
    if (institution.official_email && proposal.institution?.official_email) {
      if (institution.official_email.toLowerCase().trim() === proposal.institution.official_email.toLowerCase().trim()) {
        return true;
      }
    }
    if (institution.name && proposal.institution?.name) {
      const n1 = institution.name.toLowerCase().trim();
      const n2 = proposal.institution.name.toLowerCase().trim();
      if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Robustly checks if a proposal belongs to a given corporate enterprise.
 * Guards against ID format variations, CIN differences, and company name matching.
 */
export function isProposalForCompany(
  proposal: InternshipProposal,
  companyId?: string,
  company?: Company,
  user?: Profile
): boolean {
  if (!proposal) return false;

  // 1. Direct ID match
  if (companyId) {
    if (proposal.company_id === companyId) return true;
    if (proposal.company?.id === companyId) return true;
  }

  // 2. User company ID match
  if (user?.company_id) {
    if (proposal.company_id === user.company_id) return true;
    if (proposal.company?.id === user.company_id) return true;
  }

  // 3. Company object attributes match
  if (company) {
    if (company.id && (proposal.company_id === company.id || proposal.company?.id === company.id)) {
      return true;
    }
    if (company.cin && proposal.company?.cin) {
      if (company.cin.toLowerCase().trim() === proposal.company.cin.toLowerCase().trim()) {
        return true;
      }
    }
    if (company.official_email && proposal.company?.official_email) {
      if (company.official_email.toLowerCase().trim() === proposal.company.official_email.toLowerCase().trim()) {
        return true;
      }
    }
    if (company.name && proposal.company?.name) {
      const n1 = company.name.toLowerCase().trim();
      const n2 = proposal.company.name.toLowerCase().trim();
      if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a proposal is awaiting College / Institution Action.
 * Occurs when the company has responded with:
 * - company_accepted
 * - company_accepted_with_changes
 * - modification_requested
 */
export function isAwaitingCollegeAction(proposal: InternshipProposal): boolean {
  if (!proposal) return false;
  return (
    proposal.status === 'company_accepted' ||
    proposal.status === 'company_accepted_with_changes' ||
    proposal.status === 'modification_requested'
  );
}

/**
 * Checks if a proposal is awaiting Company Review.
 * Occurs when the college has submitted the proposal:
 * - submitted
 * - under_company_review
 */
export function isAwaitingCompanyReview(proposal: InternshipProposal): boolean {
  if (!proposal) return false;
  return proposal.status === 'submitted' || proposal.status === 'under_company_review';
}

/**
 * Checks if a proposal has reached final institutional acceptance (Batch Chartered).
 */
export function isProposalChartered(proposal: InternshipProposal): boolean {
  if (!proposal) return false;
  return proposal.status === 'institution_accepted';
}

/**
 * Checks if a proposal was declined or rejected.
 */
export function isProposalDeclined(proposal: InternshipProposal): boolean {
  if (!proposal) return false;
  return proposal.status === 'rejected' || proposal.status === 'declined';
}
