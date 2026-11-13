import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TenantConfig } from '@/config/tenant';
import { getBrandCopy } from '@/config/branding';
import { CommunityButton, SocialLinks } from '@/components/SocialLinks';
import { useAuth } from '@/hooks/useAuth';

export function Header({ tenant }: { tenant: TenantConfig }) {
  const { loginid, balance, currency, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const copy = getBrandCopy(tenant);
  const initials = copy.brandName
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const brandParts = copy.brandName.split(/\s+/);
  const brandHead = brandParts[0] || copy.brandName;
  const brandTail = brandParts.slice(1).join(' ');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.04] bg-background/80 backdrop-blur-md">
      <div className="flex h-[70px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black text-background"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
              >
                {initials || 'UN'}
              </div>
            )}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide">
                {brandHead}
                {brandTail ? (
                  <>
                    {' '}
                    <span className="text-primary">{brandTail}</span>
                  </>
                ) : (
                  <>
                    {' '}
                    <span className="text-primary">AI</span>
                  </>
                )}
              </div>
              {loginid ? (
                <div className="font-mono text-[10px] text-muted-foreground">
                  {loginid}
                  {balance != null ? ` · ${balance.toFixed(2)} ${currency}` : ''}
                </div>
              ) : null}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <CommunityButton tenant={tenant} />
          {token ? (
            <button type="button" className="nx-pill" onClick={logout} aria-label="Log out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-primary/40 text-foreground"
            aria-label="Open menu"
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/[0.04] px-4 py-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs text-muted-foreground">
            Social and support links appear here once you add them in Denara Sites.
          </p>
          <SocialLinks tenant={tenant} />
          {!tenant.social.telegramUrl &&
          !tenant.social.whatsappUrl &&
          !tenant.supportEmail &&
          !tenant.social.instagramUrl &&
          !tenant.social.youtubeUrl &&
          !tenant.social.tiktokUrl &&
          !tenant.social.facebookUrl ? (
            <p className="mt-2 text-xs text-muted-foreground/60">
              No contacts configured for this tenant yet.
            </p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
