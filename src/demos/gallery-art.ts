export const galleryArtwork = [
  {
    id: 'arc', caption: '弧面',
    markup: `<path fill="#e8f3fa" d="M0 0h760v430H0z"/>
      <circle cx="380" cy="114" r="44" fill="#ef784d"/>
      <path fill="none" stroke="#39688b" stroke-width="21" d="M257 343v-96a123 123 0 0 1 246 0v96M303 343v-96a77 77 0 0 1 154 0v96"/>
      <path fill="#628ca8" d="M365 247h30v96h-30z"/>`,
  },
  {
    id: 'form', caption: '折面',
    markup: `<path fill="#fffdf8" d="M0 0h760v430H0z"/>
      <path fill="#628ca8" d="m384 83 151 103-15 151-138-86-142 86-10-151z"/>
      <path fill="#e5a38a" d="m384 83-2 168-142 86-10-151z"/>
      <path fill="#f7c98b" d="m384 83 151 103-153 65-152-65z"/>`,
  },
  {
    id: 'orbit', caption: '切面',
    markup: `<path fill="#adcfdf" d="M0 0h760v430H0z"/>
      <circle cx="380" cy="215" r="128" fill="#39688b"/>
      <path fill="#ef784d" d="M380 87a128 128 0 0 1 0 256z"/>
      <ellipse cx="380" cy="215" rx="194" ry="54" transform="rotate(-22 380 215)" fill="none" stroke="#fffdf8" stroke-width="13"/>`,
  },
] as const;
