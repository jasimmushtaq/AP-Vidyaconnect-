-- ============================================================================
-- AP VIDYACONNECT (005_entity_compliance_documents.sql)
-- Entity Compliance Documents, PDF Attachments & Audit Dossier Support
-- ============================================================================

-- 1. Add document fields to institutions table
ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- 2. Add document fields to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- 3. Create index for fast json queries on attached documents
CREATE INDEX IF NOT EXISTS idx_institutions_documents ON institutions USING gin (documents);
CREATE INDEX IF NOT EXISTS idx_companies_documents ON companies USING gin (documents);

-- 4. Comment on columns for schema documentation
COMMENT ON COLUMN institutions.documents IS 'JSON array of uploaded statutory compliance certificates, endorsement letters, and verification PDFs';
COMMENT ON COLUMN companies.documents IS 'JSON array of uploaded MCA incorporation certificates, GST registrations, and compliance PDFs';
