export function orbitArtwork(revealed = false) {
  return `<svg viewBox="0 0 360 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <g fill="none" stroke="${revealed ? 'currentColor' : 'var(--pointer-accent)'}" stroke-width="${revealed ? '1.2' : '1.3'}"${revealed ? ' opacity=".85"' : ''}>
    <circle cx="225" cy="111" r="73" />
    <circle cx="225" cy="111" r="53" />
    <circle cx="225" cy="111" r="33" />
    <ellipse cx="225" cy="111" rx="93" ry="40" transform="rotate(-25 225 111)" />
    <path d="M131 111h188M225 20v182" opacity="${revealed ? '.55' : '.43'}" />
  </g>
  <circle cx="225" cy="111" r="7" fill="currentColor" />
  <circle cx="188" cy="65" r="5.5" fill="currentColor" opacity=".72" />
  <circle cx="301" cy="83" r="5.5" fill="currentColor" />
  <circle cx="273" cy="153" r="4.5" fill="currentColor" opacity=".6" />
</svg>`;
}
