interface IconProps {
  size?: number
  className?: string
}

export function DualTicketIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="7" y="3" width="11" height="15" rx="1.5" transform="rotate(8 12.5 10.5)" />
      <rect x="4" y="5" width="11" height="15" rx="1.5" fill="#0A0A0A" />
      <rect x="6.5" y="8" width="6" height="4" rx="0.5" strokeWidth="1.2" />
      <line x1="8" y1="10" x2="11" y2="10" strokeWidth="1" />
    </svg>
  )
}

export function TicketCountIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
      <path d="M13 5v14" />
    </svg>
  )
}

export function FlagBadge({ code, size = 22 }: { code: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-full bg-[#222]"
      style={{ width: size, height: size, border: '1px solid #444', boxSizing: 'border-box' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/${code}.svg`}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  )
}

export function HomeNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <circle
        cx="14"
        cy="16"
        r="12"
        fill={active ? '#1f4fd8' : 'none'}
        stroke={active ? '#1f4fd8' : 'currentColor'}
        strokeWidth="1.8"
      />
      <text
        x="14"
        y="21.5"
        textAnchor="middle"
        fontSize="16"
        fontStyle="italic"
        fontWeight="800"
        fill="currentColor"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        t
      </text>
      {active && (
        <path d="M24 1.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="currentColor" />
      )}
    </svg>
  )
}

export function TicketsNavIcon({ active }: { active: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={
        active
          ? 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/doc_blue_solid-3SgPq7or9eKxXgRpz2hBnrbRurEAwT.png'
          : 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/doc_gray_outline-urtqLzQiQ22d9kymIIQujPvQMbfSrC.png'
      }
      alt=""
      width={28}
      height={28}
      className="block size-7 object-contain"
      draggable={false}
    />
  )
}

export function AppleWalletBadge({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/apple-wallet.jpeg"
      alt="Add to Apple Wallet"
      className={className}
      draggable={false}
    />
  )
}
