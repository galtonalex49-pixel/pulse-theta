interface IconProps {
  size?: number
  className?: string
}

export function TicketArtworkIcon({ size = 18, className }: IconProps) {
  return (
    <span
      className={`inline-block shrink-0 bg-current ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        maskImage: "url('/images/ticket-icon.png')",
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskImage: "url('/images/ticket-icon.png')",
        WebkitMaskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
      }}
      aria-hidden="true"
    />
  )
}

export function DualTicketIcon({ size = 18, className }: IconProps) {
  return <TicketArtworkIcon size={size} className={className} />
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
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none" className="size-6" aria-hidden="true">
      <circle
        cx="15"
        cy="15"
        r="12"
        fill={active ? '#0052e6' : 'none'}
        stroke={active ? '#0052e6' : 'currentColor'}
        strokeWidth="1.8"
      />
      <text
        x="15"
        y="20.5"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill={active ? '#ffffff' : 'currentColor'}
      >
        t
      </text>
      {active && <path d="m24 1.5 1.1 3.2 3.2 1.1-3.2 1.1L24 10l-1.1-3.1-3.2-1.1 3.2-1.1L24 1.5Z" fill="#ffffff" />}
    </svg>
  )
}

export function TicketsNavIcon({ active }: { active: boolean }) {
  return <TicketArtworkIcon size={22} className={active ? 'text-white' : 'text-[#9E9EA8]'} />
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
