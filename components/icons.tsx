interface IconProps {
  size?: number
  className?: string
}

export function DualTicketIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M4 6h16a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V8a2 2 0 0 1 2-2z" />
      <path d="M10 6v12" />
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
  const stroke = active ? '#2d62ea' : 'currentColor'
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect
        x="6"
        y="6"
        width="15"
        height="19"
        rx="2"
        transform="rotate(-8 6 6)"
        fill={active ? '#1f4fd8' : 'none'}
        stroke={stroke}
        strokeWidth="1.8"
      />
      <rect
        x="10"
        y="5"
        width="15"
        height="19"
        rx="2"
        transform="rotate(6 10 5)"
        fill={active ? '#ffffff' : 'none'}
        stroke={active ? '#ffffff' : 'currentColor'}
        strokeWidth="1.8"
      />
      <path
        d="M13.5 12h7M13.5 16h5"
        stroke={active ? '#1f4fd8' : 'currentColor'}
        strokeWidth="1.6"
        strokeLinecap="round"
        transform="rotate(6 16 14)"
      />
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
