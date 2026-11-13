import type { TenantConfig } from './tenant';

/**
 * Brand copy helpers.
 * - Default site name: UndaNexus
 * - Product (was Nexus AI): UndaNexus AI
 * - Tenant brandName replaces every "UndaNexus" occurrence
 */
export function getBrandCopy(tenant: TenantConfig) {
  const brandName = tenant.brandName.trim() || 'UndaNexus';
  const aiName = `${brandName} AI`;
  const aiCompact = `${brandName.replace(/\s+/g, '')}AI`;

  return {
    brandName,
    /** e.g. "UndaNexus AI" or "South FX AI" */
    aiName,
    /** e.g. "UndaNexusAI" / "SouthFXAI" — for tight UI labels */
    aiCompact,
    tagline: `${brandName} is an automated Deriv trading platform powered by ${aiName}.`,
    title: `${brandName} | Automated Deriv Trading with ${aiCompact}`,
  };
}
