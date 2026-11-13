import { Facebook, Instagram, Mail, MessageCircle, Send, Youtube } from 'lucide-react';
import type { TenantConfig } from '@/config/tenant';

type Props = {
  tenant: TenantConfig;
  compact?: boolean;
};

export function SocialLinks({ tenant, compact }: Props) {
  const items = [
    { key: 'telegram', href: tenant.social.telegramUrl, label: 'Telegram', Icon: Send },
    { key: 'whatsapp', href: tenant.social.whatsappUrl, label: 'WhatsApp', Icon: MessageCircle },
    { key: 'instagram', href: tenant.social.instagramUrl, label: 'Instagram', Icon: Instagram },
    { key: 'facebook', href: tenant.social.facebookUrl, label: 'Facebook', Icon: Facebook },
    { key: 'youtube', href: tenant.social.youtubeUrl, label: 'YouTube', Icon: Youtube },
    {
      key: 'tiktok',
      href: tenant.social.tiktokUrl,
      label: 'TikTok',
      Icon: () => <span className="text-[11px] font-black">TT</span>,
    },
    {
      key: 'email',
      href: tenant.supportEmail ? `mailto:${tenant.supportEmail}` : '',
      label: 'Support',
      Icon: Mail,
    },
  ].filter(item => item.href);

  if (!items.length) return null;

  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'flex flex-wrap justify-center gap-2'}>
      {items.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="nx-pill hover:border-primary hover:text-primary"
        >
          <Icon className="h-3.5 w-3.5" />
          {!compact ? label : null}
        </a>
      ))}
    </div>
  );
}

export function CommunityButton({ tenant }: { tenant: TenantConfig }) {
  const href = tenant.social.telegramUrl || tenant.social.whatsappUrl || tenant.social.websiteUrl;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-[34px] items-center justify-center gap-2 rounded-full border border-primary/40 px-4 font-mono text-sm font-medium tracking-[0.7px] text-foreground shadow-sm transition hover:border-primary/70 hover:bg-primary/5"
    >
      COMMUNITY
    </a>
  );
}
