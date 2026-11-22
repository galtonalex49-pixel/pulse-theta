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
    <svg width="28" height="28" viewBox="0 0 30 30" fill="none" className="size-7" aria-hidden="true">
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
  const stroke = active ? '#2f66f6' : '#a4a4a4'

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
      <path d="m7.4 5.1 10.7-2.2a1.2 1.2 0 0 1 1.4.9l2.1 10.2a1.2 1.2 0 0 1-.4 1.1l-2.8 2.5-9.4 1.9a1.2 1.2 0 0 1-1.4-.9L5.5 6.6a1.2 1.2 0 0 1 1.9-1.5Z" stroke={stroke} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="m4.8 7.5-2.1.4a1.2 1.2 0 0 0-.9 1.4l2.2 10.5a1.2 1.2 0 0 0 1.4.9l10.2-2.1" stroke={stroke} strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="8.4" y="7.6" width="7.6" height="5.2" rx=".7" transform="rotate(-11.5 8.4 7.6)" stroke={stroke} strokeWidth="1.45" />
      <path d="m9.6 15.7 6.2-1.3M10.1 17.7l3.8-.8" stroke={stroke} strokeWidth="1.45" strokeLinecap="round" />
    </svg>
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
