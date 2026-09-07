// Design tokens. Mirrors `SYSTEM RULES/01_SYSTEM_GLOBAL_DESIGN_TOKENS.md`.
// Shipped as a string so preview and export share one stylesheet byte for byte.
export const TOKENS_CSS = `
:root{
  /* backgrounds — SYS-01 §2 */
  --bg-white:#FFFFFF;
  --bg-light-grey:rgba(0,0,0,.04);
  --bg-light-bronze:#F7F2EE;

  /* ink and accent */
  --ink:rgba(0,0,0,.88);
  --ink-soft:rgba(0,0,0,.62);
  --ink-faint:rgba(0,0,0,.42);
  --bronze:#7C5C3E;
  --line:rgba(0,0,0,.12);
  --on-dark:#FFFFFF;

  /* heading scale — SYS-01 §3.1 */
  --h-s:24px; --h-m:32px; --h-l:40px;
  --h-s-mobile:20px; --h-m-mobile:24px; --h-l-mobile:28px;
  --h-weight:700;

  /* geometry */
  --container:1180px;
  --gutter:24px;
  --section-y:72px;
  --radius:10px;
  --radius-sm:8px;
  --radius-pill:999px;

  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
  --header-offset:24px;
}
@media (max-width:767px){
  :root{ --section-y:48px; --gutter:20px; }
}
`;
