/* @ds-bundle: {"format":3,"namespace":"MessengerDesignSystem_02d4f6","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Sparkle","sourcePath":"components/brand/Sparkle.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Tag","sourcePath":"components/feedback/Tag.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Postmark","sourcePath":"components/postal/Postmark.jsx"},{"name":"Stamp","sourcePath":"components/postal/Stamp.jsx"},{"name":"Ticket","sourcePath":"components/postal/Ticket.jsx"},{"name":"Avatar","sourcePath":"components/surfaces/Avatar.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Divider","sourcePath":"components/surfaces/Divider.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"3e2ddf97a22f","components/brand/Sparkle.jsx":"137ad8d3f815","components/feedback/Badge.jsx":"5a89b397bac3","components/feedback/Tag.jsx":"9855f94808b5","components/feedback/Tooltip.jsx":"d380fefa627b","components/forms/Button.jsx":"6dca099145c2","components/forms/Checkbox.jsx":"846365847d16","components/forms/Input.jsx":"e73cbb88e40d","components/forms/Select.jsx":"d6b06251861c","components/forms/Switch.jsx":"033bb724e59d","components/forms/Textarea.jsx":"4a2eb3a77e21","components/navigation/Tabs.jsx":"287d9e7edaa0","components/postal/Postmark.jsx":"1ac460b78ee0","components/postal/Stamp.jsx":"c2d77e1f602c","components/postal/Ticket.jsx":"ef644fd81bc4","components/surfaces/Avatar.jsx":"50e75c27ddd4","components/surfaces/Card.jsx":"716436442912","components/surfaces/Divider.jsx":"cd59fde15d69","ui_kits/messenger-app/App.jsx":"301d71da64bb","ui_kits/messenger-app/Composer.jsx":"4f0ea1595966","ui_kits/messenger-app/Inbox.jsx":"51c326dff8e8","ui_kits/messenger-app/LetterView.jsx":"8bb62d5ac2bb","ui_kits/messenger-app/Sidebar.jsx":"ad8a8bd7b23f","ui_kits/messenger-app/data.js":"a067c53f32e4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MessengerDesignSystem_02d4f6 = window.MessengerDesignSystem_02d4f6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function Monogram({
  size = 44
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 120 120",
    fill: "none",
    "aria-hidden": "true",
    style: {
      flex: "none",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "8",
    width: "104",
    height: "104",
    rx: "3",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeDasharray: "2 5.6",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "20",
    width: "80",
    height: "80",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1",
    opacity: "0.55"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M60 20 L100 60 L60 100 L20 60 Z",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M37 80 V42 h8 L60 66 L75 42 H83 V80 H75.5 V55 L62 77 H58 L44.5 55 V80 Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M60 28 L61.6 34 L60 36 L58.4 34 Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M60 28 L61.6 34 L60 36 L58.4 34 Z",
    fill: "currentColor",
    transform: "rotate(90 60 32)"
  }));
}

/**
 * Messenger Logo — stamp-frame monogram + Fraunces wordmark.
 * Inherits `color`, so place it inside an inked context.
 */
function Logo({
  variant = "lockup",
  size = 44,
  tagline = false,
  style
}) {
  injectLogoStyle();
  if (variant === "monogram") return /*#__PURE__*/React.createElement("span", {
    className: "msgr-logo",
    style: style
  }, /*#__PURE__*/React.createElement(Monogram, {
    size: size
  }));
  const word = /*#__PURE__*/React.createElement("span", {
    className: "msgr-logo__word",
    style: {
      fontSize: size * 0.86
    }
  }, "Messenger", tagline ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-logo__tag"
  }, "The art of the sent word") : null);
  if (variant === "wordmark") return /*#__PURE__*/React.createElement("span", {
    className: "msgr-logo",
    style: style
  }, word);
  if (variant === "stacked") {
    return /*#__PURE__*/React.createElement("span", {
      className: "msgr-logo msgr-logo--stacked",
      style: style
    }, /*#__PURE__*/React.createElement(Monogram, {
      size: size * 1.25
    }), word);
  }
  return /*#__PURE__*/React.createElement("span", {
    className: "msgr-logo",
    style: style
  }, /*#__PURE__*/React.createElement(Monogram, {
    size: size
  }), word);
}
let _logoInjected = false;
function injectLogoStyle() {
  if (_logoInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-logo-style")) {
    _logoInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-logo-style";
  el.textContent = `
.msgr-logo{ display:inline-flex; align-items:center; gap:0.5em; color:inherit; }
.msgr-logo--stacked{ flex-direction:column; gap:0.3em; text-align:center; }
.msgr-logo__word{ font-family:var(--font-display); font-optical-sizing:auto; font-weight:600;
  letter-spacing:0.005em; line-height:0.95; display:inline-flex; flex-direction:column; }
.msgr-logo__tag{ font-family:var(--font-sans); font-weight:600; font-size:0.13em;
  letter-spacing:0.42em; text-transform:uppercase; opacity:0.6; margin-top:0.4em; }
`;
  document.head.appendChild(el);
  _logoInjected = true;
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/brand/Sparkle.jsx
try { (() => {
/**
 * Messenger Sparkle — the eight-point compass star that punctuates
 * the brand. Inherits `color`; use between words, in datelines,
 * scattered on night skies.
 */
function Sparkle({
  size = 20,
  color,
  spin = false,
  style
}) {
  injectSparkleStyle();
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    "aria-hidden": "true",
    className: ["msgr-sparkle", spin ? "is-spin" : ""].join(" "),
    style: {
      color,
      ...style
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 2 L57 43 L98 50 L57 57 L50 98 L43 57 L2 50 L43 43 Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M50 22 L54 46 L78 50 L54 54 L50 78 L46 54 L22 50 L46 46 Z",
    fill: "currentColor",
    opacity: "0.55"
  }));
}
let _sparkInjected = false;
function injectSparkleStyle() {
  if (_sparkInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-sparkle-style")) {
    _sparkInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-sparkle-style";
  el.textContent = `
.msgr-sparkle{ display:inline-block; vertical-align:middle; flex:none; }
@media (prefers-reduced-motion: no-preference){
  .msgr-sparkle.is-spin{ animation:msgr-spark 6s var(--ease-in-out) infinite; transform-origin:center; }
}
@keyframes msgr-spark{ 0%,100%{ transform:rotate(0) scale(1); } 50%{ transform:rotate(45deg) scale(1.12); } }
`;
  document.head.appendChild(el);
  _sparkInjected = true;
}
Object.assign(__ds_scope, { Sparkle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Sparkle.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
/**
 * Messenger Badge — a small all-caps status mark; tones map to the
 * winter-post palette.
 */
function Badge({
  children,
  tone = "ink",
  variant = "soft",
  style
}) {
  injectBadgeStyle();
  return /*#__PURE__*/React.createElement("span", {
    className: ["msgr-badge", `msgr-badge--${variant}`, `msgr-badge--${tone}`].join(" "),
    style: style
  }, children);
}
let _badgeInjected = false;
function injectBadgeStyle() {
  if (_badgeInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-badge-style")) {
    _badgeInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-badge-style";
  el.textContent = `
.msgr-badge{ display:inline-flex; align-items:center; gap:5px; font-family:var(--font-sans);
  font-size:var(--text-3xs); font-weight:700; letter-spacing:var(--tracking-wider);
  text-transform:uppercase; padding:3px 9px; border-radius:var(--radius-pill); border:1px solid transparent; line-height:1.4; }
/* soft */
.msgr-badge--soft.msgr-badge--ink{ background:var(--peri-100); color:var(--ink-700); }
.msgr-badge--soft.msgr-badge--royal{ background:var(--peri-200); color:var(--royal-700); }
.msgr-badge--soft.msgr-badge--honey{ background:#F3E6C2; color:var(--honey-600); }
.msgr-badge--soft.msgr-badge--coral{ background:#F6DAD1; color:var(--coral-600); }
.msgr-badge--soft.msgr-badge--pine{ background:#D2E4DB; color:#2C6150; }
/* solid */
.msgr-badge--solid.msgr-badge--ink{ background:var(--ink-700); color:var(--cream-0); }
.msgr-badge--solid.msgr-badge--royal{ background:var(--royal-600); color:var(--cream-0); }
.msgr-badge--solid.msgr-badge--honey{ background:var(--honey-500); color:var(--ink-800); }
.msgr-badge--solid.msgr-badge--coral{ background:var(--coral-500); color:var(--cream-0); }
.msgr-badge--solid.msgr-badge--pine{ background:var(--pine-500); color:var(--cream-0); }
/* outline */
.msgr-badge--outline{ background:transparent; }
.msgr-badge--outline.msgr-badge--ink{ border-color:var(--border-strong); color:var(--ink-700); }
.msgr-badge--outline.msgr-badge--royal{ border-color:var(--royal-600); color:var(--royal-700); }
.msgr-badge--outline.msgr-badge--honey{ border-color:var(--honey-500); color:var(--honey-600); }
.msgr-badge--outline.msgr-badge--coral{ border-color:var(--coral-400); color:var(--coral-600); }
`;
  document.head.appendChild(el);
  _badgeInjected = true;
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tag.jsx
try { (() => {
/** Messenger Tag — a removable chip for recipients, topics, stationery. */
function Tag({
  children,
  onRemove,
  icon,
  style
}) {
  injectTagStyle();
  return /*#__PURE__*/React.createElement("span", {
    className: "msgr-tag",
    style: style
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-tag__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("span", {
    className: "msgr-tag__label"
  }, children), onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "msgr-tag__x",
    onClick: onRemove,
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 12 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l6 6M9 3l-6 6",
    stroke: "currentColor",
    "stroke-width": "1.4",
    "stroke-linecap": "round"
  }))) : null);
}
let _tagInjected = false;
function injectTagStyle() {
  if (_tagInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-tag-style")) {
    _tagInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-tag-style";
  el.textContent = `
.msgr-tag{ display:inline-flex; align-items:center; gap:6px; font-family:var(--font-sans);
  font-size:var(--text-xs); font-weight:500; color:var(--text-body);
  background:var(--bg-elevated); border:1px solid var(--border-soft);
  padding:4px 6px 4px 11px; border-radius:var(--radius-pill); }
.msgr-tag__icon{ display:inline-flex; width:14px; height:14px; color:var(--text-muted); }
.msgr-tag__x{ display:inline-flex; align-items:center; justify-content:center; width:17px; height:17px;
  border:0; border-radius:50%; background:var(--bg-sunken); color:var(--text-muted); cursor:pointer; padding:0;
  transition:background var(--dur-fast) var(--ease-quiet), color var(--dur-fast) var(--ease-quiet); }
.msgr-tag__x svg{ width:10px; height:10px; }
.msgr-tag__x:hover{ background:var(--wax-500); color:var(--paper-0); }
`;
  document.head.appendChild(el);
  _tagInjected = true;
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/** Messenger Tooltip — a small inked note on hover/focus. */
function Tooltip({
  children,
  label,
  side = "top",
  style
}) {
  injectTooltipStyle();
  return /*#__PURE__*/React.createElement("span", {
    className: ["msgr-tip", `msgr-tip--${side}`].join(" "),
    style: style
  }, children, /*#__PURE__*/React.createElement("span", {
    className: "msgr-tip__bubble",
    role: "tooltip"
  }, label));
}
let _tipInjected = false;
function injectTooltipStyle() {
  if (_tipInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-tip-style")) {
    _tipInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-tip-style";
  el.textContent = `
.msgr-tip{ position:relative; display:inline-flex; }
.msgr-tip__bubble{ position:absolute; z-index:20; pointer-events:none; white-space:nowrap;
  background:var(--ink-800); color:var(--cream-0); font-family:var(--font-sans); font-weight:500;
  font-size:var(--text-xs); padding:6px 10px; border-radius:var(--radius-sm); box-shadow:var(--shadow-md);
  opacity:0; transform:translateY(2px) scale(0.97); transition:opacity var(--dur-fast) var(--ease-quiet), transform var(--dur-fast) var(--ease-quiet); }
.msgr-tip__bubble::after{ content:""; position:absolute; width:7px; height:7px; background:var(--ink-800); transform:rotate(45deg); }
.msgr-tip:hover .msgr-tip__bubble, .msgr-tip:focus-within .msgr-tip__bubble{ opacity:1; transform:translateY(0) scale(1); }
.msgr-tip--top .msgr-tip__bubble{ bottom:100%; left:50%; margin-bottom:9px; transform-origin:bottom center; translate:-50% 0; }
.msgr-tip--top .msgr-tip__bubble::after{ bottom:-3px; left:50%; margin-left:-3.5px; }
.msgr-tip--bottom .msgr-tip__bubble{ top:100%; left:50%; margin-top:9px; translate:-50% 0; }
.msgr-tip--bottom .msgr-tip__bubble::after{ top:-3px; left:50%; margin-left:-3.5px; }
`;
  document.head.appendChild(el);
  _tipInjected = true;
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Messenger Button — the primary call to action.
 * Variants evoke stationery: solid ink, outline (engraved),
 * ghost (quiet), and seal (wax-red emphasis for "send").
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  injectButtonStyle();
  const cls = ["msgr-btn", `msgr-btn--${variant}`, `msgr-btn--${size}`, block ? "msgr-btn--block" : ""].join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: style
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-btn__icon"
  }, iconLeft) : null, /*#__PURE__*/React.createElement("span", {
    className: "msgr-btn__label"
  }, children), iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-btn__icon"
  }, iconRight) : null);
}
let _btnInjected = false;
function injectButtonStyle() {
  if (_btnInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-btn-style")) {
    _btnInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-btn-style";
  el.textContent = `
.msgr-btn{
  --_h: var(--control-h-md);
  display:inline-flex; align-items:center; justify-content:center; gap:var(--space-2);
  height:var(--_h); padding:0 var(--space-5);
  font-family:var(--font-sans); font-weight:var(--weight-semibold);
  font-size:var(--text-sm); letter-spacing:var(--tracking-wide);
  border-radius:var(--radius-pill); border:1px solid transparent;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  transition:background var(--dur-fast) var(--ease-quiet),
             color var(--dur-fast) var(--ease-quiet),
             border-color var(--dur-fast) var(--ease-quiet),
             transform var(--dur-fast) var(--ease-quiet),
             box-shadow var(--dur-fast) var(--ease-quiet);
}
.msgr-btn:focus-visible{ outline:none; box-shadow:var(--focus-shadow); }
.msgr-btn:active{ transform:translateY(0.5px) scale(0.99); }
.msgr-btn:disabled{ opacity:0.45; cursor:not-allowed; transform:none; }
.msgr-btn__icon{ display:inline-flex; width:1.05em; height:1.05em; }
.msgr-btn__icon svg{ width:100%; height:100%; }

/* sizes */
.msgr-btn--sm{ --_h:var(--control-h-sm); font-size:var(--text-2xs); padding:0 var(--space-4); }
.msgr-btn--lg{ --_h:var(--control-h-lg); font-size:var(--text-base); padding:0 var(--space-7); }
.msgr-btn--block{ display:flex; width:100%; }

/* primary — solid ink */
.msgr-btn--primary{ background:var(--accent); color:var(--text-on-accent); box-shadow:var(--shadow-sm); }
.msgr-btn--primary:hover{ background:var(--accent-hover); box-shadow:var(--shadow-md); }
.msgr-btn--primary:active{ background:var(--accent-press); }

/* seal — wax red for ceremonial actions (Send) */
.msgr-btn--seal{ background:var(--seal); color:var(--paper-0); box-shadow:var(--shadow-sm); }
.msgr-btn--seal:hover{ background:var(--wax-600); box-shadow:var(--shadow-md); }
.msgr-btn--seal:active{ background:var(--wax-700); }

/* foil — brass, for night surfaces */
.msgr-btn--foil{ background:var(--foil); color:var(--ink-900); }
.msgr-btn--foil:hover{ background:var(--gold-400); box-shadow:var(--glow-foil); }

/* outline — engraved */
.msgr-btn--outline{ background:transparent; color:var(--text-strong); border-color:var(--border-strong); }
.msgr-btn--outline:hover{ border-color:var(--accent); color:var(--accent); background:rgba(46,80,118,0.05); }

/* ghost — quiet text */
.msgr-btn--ghost{ background:transparent; color:var(--accent); padding-inline:var(--space-3); }
.msgr-btn--ghost:hover{ background:rgba(46,80,118,0.08); }
`;
  document.head.appendChild(el);
  _btnInjected = true;
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Messenger Checkbox — a small inked tick. */
function Checkbox({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  id,
  style
}) {
  injectCheckboxStyle();
  const fid = id || `msgr-cb-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("label", {
    className: ["msgr-check", disabled ? "is-disabled" : ""].join(" "),
    htmlFor: fid,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    className: "msgr-check__input",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }), /*#__PURE__*/React.createElement("span", {
    className: "msgr-check__box",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    className: "msgr-check__tick"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }))), label ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-check__label"
  }, label) : null);
}
let _cbInjected = false;
function injectCheckboxStyle() {
  if (_cbInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-check-style")) {
    _cbInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-check-style";
  el.textContent = `
.msgr-check{ display:inline-flex; align-items:center; gap:var(--space-3); cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--text-body); user-select:none; }
.msgr-check__input{ position:absolute; opacity:0; width:0; height:0; }
.msgr-check__box{ display:inline-flex; align-items:center; justify-content:center;
  width:20px; height:20px; border-radius:var(--radius-sm);
  background:var(--bg-elevated); border:1.5px solid var(--border-strong);
  transition:background var(--dur-fast) var(--ease-quiet), border-color var(--dur-fast) var(--ease-quiet); }
.msgr-check__tick{ width:14px; height:14px; color:var(--paper-0);
  stroke-dasharray:16; stroke-dashoffset:16; transition:stroke-dashoffset var(--dur-base) var(--ease-quiet); }
.msgr-check__input:checked + .msgr-check__box{ background:var(--accent); border-color:var(--accent); }
.msgr-check__input:checked + .msgr-check__box .msgr-check__tick{ stroke-dashoffset:0; }
.msgr-check__input:focus-visible + .msgr-check__box{ box-shadow:var(--focus-shadow); }
.msgr-check.is-disabled{ opacity:0.5; pointer-events:none; }
`;
  document.head.appendChild(el);
  _cbInjected = true;
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Messenger Input — a single-line field with an optional label,
 * leading icon, and helper/error text. Underline or boxed.
 */
function Input({
  label,
  value,
  defaultValue,
  placeholder,
  type = "text",
  variant = "box",
  iconLeft = null,
  helper,
  error,
  disabled = false,
  id,
  onChange,
  style,
  ...rest
}) {
  injectInputStyle();
  const fid = id || `msgr-in-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: ["msgr-field", `msgr-field--${variant}`, error ? "is-error" : "", disabled ? "is-disabled" : ""].join(" "),
    style: style
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "msgr-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "msgr-field__control"
  }, iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-field__icon"
  }, iconLeft) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: "msgr-field__input",
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-field__msg msgr-field__msg--error"
  }, error) : helper ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-field__msg"
  }, helper) : null);
}
let _inInjected = false;
function injectInputStyle() {
  if (_inInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-input-style")) {
    _inInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-input-style";
  el.textContent = `
.msgr-field{ display:flex; flex-direction:column; gap:var(--space-2); font-family:var(--font-sans); }
.msgr-field__label{ font-size:var(--text-2xs); font-weight:var(--weight-semibold);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-muted); }
.msgr-field__control{ display:flex; align-items:center; gap:var(--space-2);
  background:var(--bg-elevated); border:1px solid var(--border-soft); border-radius:var(--radius-md);
  padding:0 var(--space-4); height:var(--control-h-md);
  transition:border-color var(--dur-fast) var(--ease-quiet), box-shadow var(--dur-fast) var(--ease-quiet); }
.msgr-field__control:focus-within{ border-color:var(--accent); box-shadow:var(--focus-shadow); }
.msgr-field__icon{ display:inline-flex; width:18px; height:18px; color:var(--text-muted); flex:none; }
.msgr-field__icon svg{ width:100%; height:100%; }
.msgr-field__input{ flex:1; border:0; outline:0; background:transparent; min-width:0;
  font-family:var(--font-serif); font-size:var(--text-sm); color:var(--text-body); }
.msgr-field__input::placeholder{ color:var(--text-faint); }
.msgr-field__msg{ font-size:var(--text-xs); color:var(--text-muted); }
.msgr-field__msg--error{ color:var(--danger); }

/* underline variant — like a ruled line on paper */
.msgr-field--underline .msgr-field__control{ background:transparent; border:0;
  border-bottom:1.5px solid var(--border-soft); border-radius:0; padding-inline:0; box-shadow:none; }
.msgr-field--underline .msgr-field__control:focus-within{ border-bottom-color:var(--accent); box-shadow:0 1px 0 var(--accent); }

.msgr-field.is-error .msgr-field__control{ border-color:var(--danger); }
.msgr-field.is-disabled{ opacity:0.55; pointer-events:none; }
`;
  document.head.appendChild(el);
  _inInjected = true;
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Messenger Select — a native dropdown dressed in stationery. */
function Select({
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
  options = [],
  id,
  style,
  ...rest
}) {
  injectSelectStyle();
  const fid = id || `msgr-sel-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "msgr-sel-field",
    style: style
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "msgr-sel-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "msgr-sel-field__control"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: "msgr-sel",
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange
  }, rest), options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    className: "msgr-sel__chev",
    viewBox: "0 0 16 16",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }))));
}
let _selInjected = false;
function injectSelectStyle() {
  if (_selInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-sel-style")) {
    _selInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-sel-style";
  el.textContent = `
.msgr-sel-field{ display:flex; flex-direction:column; gap:var(--space-2); font-family:var(--font-sans); }
.msgr-sel-field__label{ font-size:var(--text-2xs); font-weight:var(--weight-semibold);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-muted); }
.msgr-sel-field__control{ position:relative; display:flex; align-items:center; }
.msgr-sel{ appearance:none; -webkit-appearance:none; width:100%;
  height:var(--control-h-md); padding:0 var(--space-7) 0 var(--space-4);
  background:var(--bg-elevated); border:1px solid var(--border-soft); border-radius:var(--radius-md);
  font-family:var(--font-serif); font-size:var(--text-sm); color:var(--text-body); cursor:pointer;
  transition:border-color var(--dur-fast) var(--ease-quiet), box-shadow var(--dur-fast) var(--ease-quiet); }
.msgr-sel:focus{ outline:none; border-color:var(--accent); box-shadow:var(--focus-shadow); }
.msgr-sel:disabled{ opacity:0.5; cursor:not-allowed; }
.msgr-sel__chev{ position:absolute; right:var(--space-4); width:16px; height:16px;
  pointer-events:none; color:var(--text-muted); }
`;
  document.head.appendChild(el);
  _selInjected = true;
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Messenger Switch — a quiet toggle. */
function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  id,
  style
}) {
  injectSwitchStyle();
  const fid = id || `msgr-sw-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("label", {
    className: ["msgr-switch", disabled ? "is-disabled" : ""].join(" "),
    htmlFor: fid,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    className: "msgr-switch__input",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }), /*#__PURE__*/React.createElement("span", {
    className: "msgr-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "msgr-switch__thumb"
  })), label ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-switch__label"
  }, label) : null);
}
let _swInjected = false;
function injectSwitchStyle() {
  if (_swInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-switch-style")) {
    _swInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-switch-style";
  el.textContent = `
.msgr-switch{ display:inline-flex; align-items:center; gap:var(--space-3); cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--text-body); user-select:none; }
.msgr-switch__input{ position:absolute; opacity:0; width:0; height:0; }
.msgr-switch__track{ position:relative; width:42px; height:24px; border-radius:var(--radius-pill);
  background:var(--bg-sunken); border:1px solid var(--border-soft);
  transition:background var(--dur-base) var(--ease-quiet), border-color var(--dur-base) var(--ease-quiet); }
.msgr-switch__thumb{ position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:var(--radius-pill);
  background:var(--paper-0); box-shadow:var(--shadow-sm);
  transition:transform var(--dur-base) var(--ease-quiet); }
.msgr-switch__input:checked + .msgr-switch__track{ background:var(--accent); border-color:transparent; }
.msgr-switch__input:checked + .msgr-switch__track .msgr-switch__thumb{ transform:translateX(18px); }
.msgr-switch__input:focus-visible + .msgr-switch__track{ box-shadow:var(--focus-shadow); }
.msgr-switch.is-disabled{ opacity:0.5; pointer-events:none; }
`;
  document.head.appendChild(el);
  _swInjected = true;
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Messenger Textarea — the writing surface. Styled like a sheet of
 * letter paper with faint ruled lines (optional).
 */
function Textarea({
  label,
  value,
  defaultValue,
  placeholder,
  rows = 5,
  ruled = false,
  helper,
  disabled = false,
  id,
  onChange,
  style,
  ...rest
}) {
  injectTextareaStyle();
  const fid = id || `msgr-ta-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "msgr-ta-field",
    style: style
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "msgr-ta-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("textarea", _extends({
    id: fid,
    className: ["msgr-ta", ruled ? "msgr-ta--ruled" : ""].join(" "),
    rows: rows,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange
  }, rest)), helper ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-ta-field__msg"
  }, helper) : null);
}
let _taInjected = false;
function injectTextareaStyle() {
  if (_taInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-ta-style")) {
    _taInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-ta-style";
  el.textContent = `
.msgr-ta-field{ display:flex; flex-direction:column; gap:var(--space-2); font-family:var(--font-sans); }
.msgr-ta-field__label{ font-size:var(--text-2xs); font-weight:var(--weight-semibold);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-muted); }
.msgr-ta-field__msg{ font-size:var(--text-xs); color:var(--text-muted); }
.msgr-ta{ width:100%; box-sizing:border-box; resize:vertical;
  background:var(--surface-letter); border:1px solid var(--border-soft); border-radius:var(--radius-md);
  padding:var(--space-4) var(--space-5);
  font-family:var(--font-serif); font-size:var(--text-base); line-height:var(--leading-relaxed);
  color:var(--text-body); box-shadow:var(--shadow-xs);
  transition:border-color var(--dur-fast) var(--ease-quiet), box-shadow var(--dur-fast) var(--ease-quiet); }
.msgr-ta::placeholder{ color:var(--text-faint); font-style:italic; }
.msgr-ta:focus{ outline:none; border-color:var(--accent); box-shadow:var(--focus-shadow); }
.msgr-ta--ruled{ background-image:repeating-linear-gradient(
    var(--surface-letter), var(--surface-letter) calc(var(--leading-relaxed) * var(--text-base) - 1px),
    var(--border-hair) calc(var(--leading-relaxed) * var(--text-base) - 1px),
    var(--border-hair) calc(var(--leading-relaxed) * var(--text-base)));
  background-attachment:local; }
`;
  document.head.appendChild(el);
  _taInjected = true;
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Messenger Tabs — a quiet underlined tab bar. Controlled via `value`
 * or uncontrolled via `defaultValue`.
 */
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  style
}) {
  injectTabsStyle();
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = value !== undefined ? value : internal;
  const select = v => {
    if (value === undefined) setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "msgr-tabs",
    role: "tablist",
    style: style
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    role: "tab",
    "aria-selected": active === it.value,
    className: ["msgr-tabs__tab", active === it.value ? "is-active" : ""].join(" "),
    onClick: () => select(it.value)
  }, it.label, it.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-tabs__count"
  }, it.count) : null)));
}
let _tabsInjected = false;
function injectTabsStyle() {
  if (_tabsInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-tabs-style")) {
    _tabsInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-tabs-style";
  el.textContent = `
.msgr-tabs{ display:inline-flex; gap:4px; border-bottom:1px solid var(--border-hair); }
.msgr-tabs__tab{ position:relative; display:inline-flex; align-items:center; gap:7px;
  border:0; background:none; cursor:pointer; padding:10px 14px;
  font-family:var(--font-sans); font-weight:600; font-size:var(--text-2xs);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-muted);
  transition:color var(--dur-fast) var(--ease-quiet); }
.msgr-tabs__tab::after{ content:""; position:absolute; left:14px; right:14px; bottom:-1px; height:2px;
  background:var(--accent); transform:scaleX(0); transform-origin:center;
  transition:transform var(--dur-base) var(--ease-quiet); }
.msgr-tabs__tab:hover{ color:var(--text-body); }
.msgr-tabs__tab.is-active{ color:var(--text-strong); }
.msgr-tabs__tab.is-active::after{ transform:scaleX(1); }
.msgr-tabs__count{ font-size:9px; padding:1px 6px; border-radius:var(--radius-pill);
  background:var(--bg-sunken); color:var(--text-muted); letter-spacing:0; }
`;
  document.head.appendChild(el);
  _tabsInjected = true;
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/postal/Postmark.jsx
try { (() => {
/**
 * Messenger Postmark — a round cancellation mark: a ringed circle with
 * stacked caps between two short rules and a dot top & bottom.
 */
function Postmark({
  children,
  tone = "peri",
  size = 76,
  rotate = 0,
  style
}) {
  injectPostmarkStyle();
  return /*#__PURE__*/React.createElement("span", {
    className: ["msgr-postmark", `msgr-postmark--${tone}`].join(" "),
    style: {
      width: size,
      height: size,
      transform: rotate ? `rotate(${rotate}deg)` : undefined,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "msgr-postmark__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "msgr-postmark__rule"
  }), /*#__PURE__*/React.createElement("span", {
    className: "msgr-postmark__text"
  }, children), /*#__PURE__*/React.createElement("span", {
    className: "msgr-postmark__rule"
  }), /*#__PURE__*/React.createElement("span", {
    className: "msgr-postmark__dot"
  }));
}
let _pmInjected = false;
function injectPostmarkStyle() {
  if (_pmInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-postmark-style")) {
    _pmInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-postmark-style";
  el.textContent = `
.msgr-postmark{ display:inline-flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  border-radius:50%; border:1.5px solid currentColor; box-shadow:0 0 0 2.5px var(--bg-base, transparent), 0 0 0 4px currentColor;
  padding:8px; text-align:center; }
.msgr-postmark__text{ font-family:var(--font-sans); font-weight:700; font-size:9px; line-height:1.15;
  letter-spacing:0.12em; text-transform:uppercase; }
.msgr-postmark__rule{ width:60%; height:1.2px; background:currentColor; opacity:0.8; }
.msgr-postmark__dot{ width:3px; height:3px; border-radius:50%; background:currentColor; }
.msgr-postmark--peri{ color:var(--royal-700); background:var(--peri-300); }
.msgr-postmark--navy{ color:var(--cream-0); background:var(--ink-800); }
.msgr-postmark--royal{ color:var(--cream-0); background:var(--royal-600); }
.msgr-postmark--cream{ color:var(--ink-700); background:var(--cream-0); }
.msgr-postmark--ink{ color:var(--ink-700); background:transparent; }
`;
  document.head.appendChild(el);
  _pmInjected = true;
}
Object.assign(__ds_scope, { Postmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/postal/Postmark.jsx", error: String((e && e.message) || e) }); }

// components/postal/Stamp.jsx
try { (() => {
/**
 * Messenger Stamp — the brand's signature postage motif. A perforated
 * sheet (cream / navy / royal frame) holding a hand-drawn illustration
 * on a tinted interior, with optional caption, denomination & postmark.
 */
function Stamp({
  src,
  alt = "",
  caption,
  kicker,
  denomination,
  tone = "peri",
  frame = "cream",
  rotate = 0,
  postmark = false,
  width = 132,
  children,
  style
}) {
  injectStampStyle();
  return /*#__PURE__*/React.createElement("figure", {
    className: ["msgr-stamp", `msgr-stamp--f-${frame}`].join(" "),
    style: {
      width,
      transform: rotate ? `rotate(${rotate}deg)` : undefined,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-stamp__perf edge-perforated"
  }, /*#__PURE__*/React.createElement("div", {
    className: ["msgr-stamp__scene", `msgr-stamp--t-${tone}`].join(" ")
  }, kicker ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-stamp__kicker"
  }, kicker) : null, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    className: "msgr-stamp__art"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "msgr-stamp__art"
  }, children), caption ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-stamp__cap"
  }, caption) : null, denomination ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-stamp__denom"
  }, denomination) : null, postmark ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-stamp__pm",
    "aria-hidden": "true"
  }) : null)));
}
let _stampInjected = false;
function injectStampStyle() {
  if (_stampInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-stamp-style")) {
    _stampInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-stamp-style";
  el.textContent = `
.msgr-stamp{ margin:0; display:inline-block; filter:drop-shadow(0 3px 8px rgba(21,18,62,.20)); }
.msgr-stamp__perf{ --perf:5px; padding:8px; background:var(--cream-0); }
.msgr-stamp--f-navy .msgr-stamp__perf{ background:var(--ink-800); }
.msgr-stamp--f-royal .msgr-stamp__perf{ background:var(--royal-600); }
.msgr-stamp__scene{ position:relative; aspect-ratio:5/6; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:4px; padding:10px 8px; overflow:hidden; }
.msgr-stamp--t-peri{ background:var(--peri-300); }
.msgr-stamp--t-cream{ background:var(--cream-1); }
.msgr-stamp--t-fog{ background:var(--fog-1); }
.msgr-stamp--t-royal{ background:var(--royal-600); }
.msgr-stamp__art{ width:72%; height:72%; object-fit:contain; display:flex; align-items:center; justify-content:center; }
.msgr-stamp__art img{ width:100%; height:100%; object-fit:contain; }
.msgr-stamp__kicker, .msgr-stamp__cap{ font-family:var(--font-sans); font-size:8px; font-weight:600;
  letter-spacing:.2em; text-transform:uppercase; color:var(--ink-700); text-align:center; }
.msgr-stamp--t-royal .msgr-stamp__kicker, .msgr-stamp--t-royal .msgr-stamp__cap{ color:var(--cream-0); }
.msgr-stamp__denom{ position:absolute; top:6px; right:7px; font-family:var(--font-display);
  font-weight:600; font-size:13px; color:var(--ink-700); line-height:1; }
.msgr-stamp__pm{ position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(circle at 72% 30%, transparent 26px, rgba(21,18,62,.34) 26px, rgba(21,18,62,.34) 28px, transparent 28px),
    radial-gradient(circle at 72% 30%, transparent 20px, rgba(21,18,62,.34) 20px, rgba(21,18,62,.34) 21px, transparent 21px);
  mix-blend-mode:multiply; }
`;
  document.head.appendChild(el);
  _stampInjected = true;
}
Object.assign(__ds_scope, { Stamp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/postal/Stamp.jsx", error: String((e && e.message) || e) }); }

// components/postal/Ticket.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Messenger Ticket — a notched admission ticket with a dashed inner
 * rule. Used for calls-to-action, dates, and small badges of fact.
 */
function Ticket({
  children,
  tone = "royal",
  icon,
  onClick,
  as = "div",
  style,
  ...rest
}) {
  injectTicketStyle();
  const Tag = onClick ? "button" : as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ["msgr-ticket", `msgr-ticket--${tone}`, onClick ? "is-button" : ""].join(" "),
    onClick: onClick,
    style: style
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "msgr-ticket__inner edge-ticket"
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-ticket__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("span", {
    className: "msgr-ticket__label"
  }, children)));
}
let _ticketInjected = false;
function injectTicketStyle() {
  if (_ticketInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-ticket-style")) {
    _ticketInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-ticket-style";
  el.textContent = `
.msgr-ticket{ display:inline-block; border:0; background:none; padding:0; cursor:default; }
.msgr-ticket.is-button{ cursor:pointer; }
.msgr-ticket__inner{ --notch:8px; position:relative; display:inline-flex; align-items:center; gap:8px;
  padding:11px 22px; font-family:var(--font-sans); font-weight:600; font-size:var(--text-2xs);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; }
/* dashed inner rule, inset so the notch doesn't clip it */
.msgr-ticket__inner::before{ content:""; position:absolute; inset:4px 9px; border:1.2px dashed currentColor;
  opacity:0.55; border-radius:2px; pointer-events:none; }
.msgr-ticket__icon{ display:inline-flex; width:15px; height:15px; }
.msgr-ticket__icon svg{ width:100%; height:100%; }
.msgr-ticket--royal .msgr-ticket__inner{ background:var(--royal-600); color:var(--cream-0); }
.msgr-ticket--peri .msgr-ticket__inner{ background:var(--peri-300); color:var(--ink-800); }
.msgr-ticket--navy .msgr-ticket__inner{ background:var(--ink-800); color:var(--cream-0); }
.msgr-ticket--cream .msgr-ticket__inner{ background:var(--cream-0); color:var(--ink-800); box-shadow:inset 0 0 0 1px var(--border-hair); }
.msgr-ticket.is-button:hover .msgr-ticket__inner{ filter:brightness(1.06); }
.msgr-ticket.is-button:active{ transform:translateY(0.5px); }
`;
  document.head.appendChild(el);
  _ticketInjected = true;
}
Object.assign(__ds_scope, { Ticket });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/postal/Ticket.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Avatar.jsx
try { (() => {
/** Messenger Avatar — a recipient portrait or monogram. */
function Avatar({
  src,
  name = "",
  size = 40,
  ring = false,
  style
}) {
  injectAvatarStyle();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    className: ["msgr-avatar", ring ? "is-ring" : ""].join(" "),
    style: {
      width: size,
      height: size,
      fontSize: size * 0.4,
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : /*#__PURE__*/React.createElement("span", {
    className: "msgr-avatar__initials"
  }, initials || "·"));
}
let _avInjected = false;
function injectAvatarStyle() {
  if (_avInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-avatar-style")) {
    _avInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-avatar-style";
  el.textContent = `
.msgr-avatar{ display:inline-flex; align-items:center; justify-content:center; border-radius:50%;
  overflow:hidden; flex:none; background:var(--ink-600); color:var(--frost-0);
  font-family:var(--font-display); font-weight:600; letter-spacing:.02em; }
.msgr-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
.msgr-avatar.is-ring{ box-shadow:0 0 0 2px var(--bg-elevated), 0 0 0 3.5px var(--foil); }
`;
  document.head.appendChild(el);
  _avInjected = true;
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Messenger Card — a lifted sheet. `letter` adds the writing-paper
 * surface + soft lift; `night` flips to a dark winter panel;
 * `outline` is a quiet bordered container.
 */
function Card({
  children,
  variant = "default",
  padded = true,
  as = "div",
  className = "",
  style,
  ...rest
}) {
  injectCardStyle();
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ["msgr-card", `msgr-card--${variant}`, padded ? "is-padded" : "", className].join(" "),
    style: style
  }, rest), children);
}
let _cardInjected = false;
function injectCardStyle() {
  if (_cardInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-card-style")) {
    _cardInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-card-style";
  el.textContent = `
.msgr-card{ border-radius:var(--radius-lg); background:var(--bg-elevated);
  box-shadow:var(--shadow-md); border:1px solid var(--border-hair); }
.msgr-card.is-padded{ padding:var(--space-6); }
.msgr-card--outline{ box-shadow:none; border:1px solid var(--border-soft); background:transparent; }
.msgr-card--letter{ background:var(--surface-letter); box-shadow:var(--shadow-letter);
  border:1px solid rgba(11,22,38,0.06); border-radius:var(--radius-md); }
.msgr-card--night{ background:var(--ink-800); color:var(--frost-0);
  border:1px solid var(--border-night); box-shadow:var(--shadow-lg); }
`;
  document.head.appendChild(el);
  _cardInjected = true;
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Divider.jsx
try { (() => {
/**
 * Messenger Divider — a rule between passages. `hair` (default),
 * `double` (letterhead), `dotted` (dateline), or `ornament` (centered star).
 */
function Divider({
  variant = "hair",
  label,
  style
}) {
  injectDividerStyle();
  if (variant === "ornament") {
    return /*#__PURE__*/React.createElement("div", {
      className: "msgr-div msgr-div--ornament",
      style: style
    }, /*#__PURE__*/React.createElement("span", {
      className: "msgr-div__line"
    }), /*#__PURE__*/React.createElement("span", {
      className: "msgr-div__star",
      "aria-hidden": "true"
    }, "\u2726"), /*#__PURE__*/React.createElement("span", {
      className: "msgr-div__line"
    }));
  }
  if (label) {
    return /*#__PURE__*/React.createElement("div", {
      className: ["msgr-div", "msgr-div--labelled", `is-${variant}`].join(" "),
      style: style
    }, /*#__PURE__*/React.createElement("span", {
      className: "msgr-div__line"
    }), /*#__PURE__*/React.createElement("span", {
      className: "msgr-div__label"
    }, label), /*#__PURE__*/React.createElement("span", {
      className: "msgr-div__line"
    }));
  }
  return /*#__PURE__*/React.createElement("hr", {
    className: ["msgr-div__hr", `is-${variant}`].join(" "),
    style: style
  });
}
let _divInjected = false;
function injectDividerStyle() {
  if (_divInjected || typeof document === "undefined") return;
  if (document.getElementById("msgr-divider-style")) {
    _divInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "msgr-divider-style";
  el.textContent = `
.msgr-div__hr{ border:0; margin:var(--space-5) 0; }
.msgr-div__hr.is-hair{ border-top:1px solid var(--border-hair); }
.msgr-div__hr.is-double{ border-top:1.5px solid var(--rule-double); border-bottom:1.5px solid var(--rule-double); height:3px; }
.msgr-div__hr.is-dotted{ border-top:1.5px dotted var(--border-soft); }
.msgr-div, .msgr-div--ornament, .msgr-div--labelled{ display:flex; align-items:center; gap:var(--space-4); margin:var(--space-5) 0; }
.msgr-div__line{ flex:1; height:1px; background:var(--border-hair); }
.msgr-div--ornament .msgr-div__line{ background:linear-gradient(90deg, transparent, var(--border-soft) 40%, var(--border-soft) 60%, transparent); }
.msgr-div__star{ color:var(--foil); font-size:14px; }
.msgr-div__label{ font-family:var(--font-sans); font-size:var(--text-3xs); font-weight:600;
  letter-spacing:var(--tracking-widest); text-transform:uppercase; color:var(--text-muted); }
.msgr-div--labelled.is-double .msgr-div__line{ height:3px; border-top:1.5px solid var(--rule-double); border-bottom:1.5px solid var(--rule-double); background:transparent; }
`;
  document.head.appendChild(el);
  _divInjected = true;
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Divider.jsx", error: String((e && e.message) || e) }); }

// ui_kits/messenger-app/App.jsx
try { (() => {
// Messenger app — orchestrator + send ceremony
const {
  Stamp,
  Sparkle,
  Postmark,
  Logo
} = window.MessengerDesignSystem_02d4f6;
function App() {
  const D = window.MSGR_DATA;
  const [folder, setFolder] = React.useState("inbox");
  const [selected, setSelected] = React.useState(D.letters[0].id);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState(null);
  const [ceremony, setCeremony] = React.useState(null); // {art}

  const letter = D.letters.find(l => l.id === selected);
  const openCompose = pf => {
    setPrefill(pf || null);
    setComposeOpen(true);
  };
  const doSend = payload => {
    setComposeOpen(false);
    setCeremony({
      art: payload.artFor
    });
    setTimeout(() => setCeremony(null), 2600);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "msgr-app"
  }, /*#__PURE__*/React.createElement(window.Sidebar, {
    folders: D.folders,
    active: folder,
    onSelect: setFolder,
    onCompose: () => openCompose(null),
    user: D.user
  }), /*#__PURE__*/React.createElement(window.Inbox, {
    letters: D.letters,
    selectedId: selected,
    onOpen: setSelected
  }), /*#__PURE__*/React.createElement(window.LetterView, {
    letter: letter,
    onReply: l => openCompose(l),
    onClose: () => setSelected(null)
  }), /*#__PURE__*/React.createElement(window.Composer, {
    open: composeOpen,
    prefill: prefill,
    onClose: () => setComposeOpen(false),
    onSend: doSend
  }), ceremony ? /*#__PURE__*/React.createElement(SendCeremony, {
    art: ceremony.art
  }) : null);
}
function SendCeremony({
  art
}) {
  const A = "../../assets/illustrations/";
  return /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony bg-night-sky"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__spark msgr-ceremony__spark--1"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 22,
    color: "var(--peri-300)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__spark msgr-ceremony__spark--2"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 14,
    color: "var(--honey-400)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__spark msgr-ceremony__spark--3"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 18,
    color: "var(--peri-200)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__stamp"
  }, /*#__PURE__*/React.createElement(Stamp, {
    src: A + art + ".svg",
    tone: "peri",
    width: 150,
    postmark: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__kicker"
  }, "DIRECTION \xB7 P\xD4LE NORD"), /*#__PURE__*/React.createElement("div", {
    className: "msgr-ceremony__title"
  }, "Scell\xE9e & envoy\xE9e")));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/messenger-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/messenger-app/Composer.jsx
try { (() => {
// Messenger app — compose overlay
const {
  Input,
  Textarea,
  Select,
  Tag,
  Ticket,
  Button,
  Stamp,
  Sparkle,
  Logo
} = window.MessengerDesignSystem_02d4f6;
function Composer({
  open,
  prefill,
  onClose,
  onSend
}) {
  const [recipients, setRecipients] = React.useState(["eleanor@winterhouse.co"]);
  const [draft, setDraft] = React.useState("");
  const [stationery, setStationery] = React.useState("Nocturne");
  const A = "../../assets/illustrations/";
  React.useEffect(() => {
    if (open) {
      setRecipients(prefill ? [prefill.from.toLowerCase().replace(/\s+/g, ".") + "@post.co"] : ["eleanor@winterhouse.co"]);
      setDraft(prefill ? "" : "");
    }
  }, [open, prefill]);
  if (!open) return null;
  const artFor = {
    Nocturne: "moon",
    Aurora: "pine",
    Frost: "mitten",
    Parchment: "envelope"
  }[stationery] || "moon";
  return /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__overlay",
    onMouseDown: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__composer",
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("header", {
    className: "msgr-app__composer-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__kicker"
  }, "Nouvelle lettre"), /*#__PURE__*/React.createElement("button", {
    className: "msgr-app__icon-btn",
    onClick: onClose,
    title: "Fermer"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__composer-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__composer-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__recipients"
  }, /*#__PURE__*/React.createElement("span", {
    className: "msgr-app__field-label"
  }, "\xC0"), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__chips"
  }, recipients.map(r => /*#__PURE__*/React.createElement(Tag, {
    key: r,
    onRemove: () => setRecipients(recipients.filter(x => x !== r))
  }, r)), /*#__PURE__*/React.createElement("input", {
    className: "msgr-app__chip-input",
    placeholder: "ajouter un destinataire\u2026",
    onKeyDown: e => {
      if (e.key === "Enter" && e.target.value) {
        setRecipients([...recipients, e.target.value]);
        e.target.value = "";
      }
    }
  }))), /*#__PURE__*/React.createElement(Input, {
    label: "Objet",
    defaultValue: prefill ? "Re : " + prefill.subject : "",
    placeholder: "Donnez un titre \xE0 votre lettre"
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Votre message",
    ruled: true,
    rows: 9,
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: "Cher ami, "
  })), /*#__PURE__*/React.createElement("aside", {
    className: "msgr-app__composer-side"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Papeterie",
    value: stationery,
    onChange: e => setStationery(e.target.value),
    options: ["Nocturne", "Aurora", "Frost", "Parchment"]
  }), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__stamp-preview"
  }, /*#__PURE__*/React.createElement(Stamp, {
    src: A + artFor + ".svg",
    tone: "peri",
    caption: stationery,
    width: 120
  })), /*#__PURE__*/React.createElement("p", {
    className: "msgr-app__hint"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 12
  }), " Chaque lettre part avec un timbre dessin\xE9 \xE0 la main."))), /*#__PURE__*/React.createElement("footer", {
    className: "msgr-app__composer-foot"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onClose
  }, "Enregistrer le brouillon"), /*#__PURE__*/React.createElement(Ticket, {
    tone: "royal",
    onClick: () => onSend({
      recipients,
      stationery,
      artFor
    })
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, "Sceller & envoyer ", /*#__PURE__*/React.createElement(ArrowGlyph, null))))));
}
function ArrowGlyph() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }));
}
window.Composer = Composer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/messenger-app/Composer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/messenger-app/Inbox.jsx
try { (() => {
// Messenger app — inbox list
const {
  Stamp,
  Badge,
  Tabs
} = window.MessengerDesignSystem_02d4f6;
function statusTone(s) {
  return s === "Sealed" ? "honey" : s === "Returned" ? "coral" : "royal";
}
function Inbox({
  letters,
  selectedId,
  onOpen
}) {
  const A = "../../assets/illustrations/";
  return /*#__PURE__*/React.createElement("section", {
    className: "msgr-app__list"
  }, /*#__PURE__*/React.createElement("header", {
    className: "msgr-app__list-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__kicker"
  }, "Bo\xEEte de r\xE9ception"), /*#__PURE__*/React.createElement("h1", {
    className: "msgr-app__h1"
  }, "Lettres re\xE7ues"))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__list-tabs"
  }, /*#__PURE__*/React.createElement(Tabs, {
    defaultValue: "all",
    items: [{
      value: "all",
      label: "Toutes",
      count: letters.length
    }, {
      value: "unread",
      label: "Non lues",
      count: 1
    }, {
      value: "sealed",
      label: "Scellées"
    }]
  })), /*#__PURE__*/React.createElement("ul", {
    className: "msgr-app__letters"
  }, letters.map(l => /*#__PURE__*/React.createElement("li", {
    key: l.id
  }, /*#__PURE__*/React.createElement("button", {
    className: "msgr-app__letter" + (selectedId === l.id ? " is-active" : "") + (l.unread ? " is-unread" : ""),
    onClick: () => onOpen(l.id)
  }, /*#__PURE__*/React.createElement(Stamp, {
    src: A + l.art + ".svg",
    tone: l.tone,
    width: 56
  }), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__letter-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__letter-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "msgr-app__letter-from"
  }, l.from), /*#__PURE__*/React.createElement("span", {
    className: "msgr-app__letter-date"
  }, l.date)), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__letter-subject"
  }, l.subject), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__letter-preview"
  }, l.preview), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__letter-meta"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: statusTone(l.status),
    variant: l.status === "Sealed" ? "soft" : "solid"
  }, l.status))))))));
}
window.Inbox = Inbox;
window.statusTone = statusTone;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/messenger-app/Inbox.jsx", error: String((e && e.message) || e) }); }

// ui_kits/messenger-app/LetterView.jsx
try { (() => {
// Messenger app — reading pane
const {
  Stamp,
  Postmark,
  Avatar,
  Divider,
  Badge,
  Button,
  Sparkle
} = window.MessengerDesignSystem_02d4f6;
function LetterView({
  letter,
  onReply,
  onClose
}) {
  const A = "../../assets/illustrations/";
  if (!letter) {
    return /*#__PURE__*/React.createElement("section", {
      className: "msgr-app__read msgr-app__read--empty"
    }, /*#__PURE__*/React.createElement(Stamp, {
      src: A + "envelope.svg",
      tone: "peri",
      width: 120,
      caption: "Choisissez une lettre"
    }), /*#__PURE__*/React.createElement("p", {
      className: "msgr-app__empty-note"
    }, "S\xE9lectionnez une lettre \xE0 gauche pour la lire ici."));
  }
  return /*#__PURE__*/React.createElement("section", {
    className: "msgr-app__read",
    key: letter.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__read-toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "msgr-app__icon-btn",
    onClick: onClose,
    title: "Fermer"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__read-actions"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: window.statusTone(letter.status),
    variant: "solid"
  }, letter.status), /*#__PURE__*/React.createElement("button", {
    className: "msgr-app__icon-btn",
    title: "Archiver"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h18v12H3zM1 3h22v5H1zM9 12h6"
  }))))), /*#__PURE__*/React.createElement("article", {
    className: "msgr-app__paper has-grain"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__paper-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__sender"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: letter.from,
    size: 44,
    ring: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__sender-name"
  }, letter.from), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__sender-meta"
  }, "\xE0 ", `Cordelia`, " \xB7 ", letter.date))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__paper-stamp"
  }, /*#__PURE__*/React.createElement(Stamp, {
    src: A + letter.art + ".svg",
    tone: letter.tone,
    width: 92,
    postmark: true
  }), /*#__PURE__*/React.createElement(Postmark, {
    tone: "ink",
    size: 58,
    rotate: -10,
    style: {
      position: "absolute",
      right: -10,
      bottom: -8
    }
  }, "R\xC9\xC7U", /*#__PURE__*/React.createElement("br", null), letter.date))), /*#__PURE__*/React.createElement(Divider, {
    variant: "double"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "msgr-app__paper-subject"
  }, letter.subject), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__paper-body"
  }, letter.body.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i
  }, p))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__sign"
  }, letter.sign), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__paper-foot"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 14
  }), /*#__PURE__*/React.createElement(Sparkle, {
    size: 20
  }), /*#__PURE__*/React.createElement(Sparkle, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__read-foot"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "seal",
    iconRight: /*#__PURE__*/React.createElement(SendGlyph, null),
    onClick: () => onReply(letter)
  }, "R\xE9pondre & sceller"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Transf\xE9rer")));
}
function SendGlyph() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
window.LetterView = LetterView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/messenger-app/LetterView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/messenger-app/Sidebar.jsx
try { (() => {
// Messenger app — left sidebar
const {
  Logo,
  Sparkle,
  Avatar,
  Ticket
} = window.MessengerDesignSystem_02d4f6;
function Sidebar({
  folders,
  active,
  onSelect,
  onCompose,
  user
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "msgr-app__side night"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__brand"
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "lockup",
    size: 30,
    style: {
      color: "var(--cream-0)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 18px"
    }
  }, /*#__PURE__*/React.createElement(Ticket, {
    tone: "royal",
    onClick: onCompose,
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(PenIcon, null), " Composer une lettre"))), /*#__PURE__*/React.createElement("nav", {
    className: "msgr-app__nav"
  }, folders.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    className: "msgr-app__folder" + (active === f.id ? " is-active" : ""),
    onClick: () => onSelect(f.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "msgr-app__folder-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "msgr-app__folder-label"
  }, f.label), f.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "msgr-app__folder-count"
  }, f.count) : null))), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__side-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__dateline"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 11
  }), " SAISON HIVER ", /*#__PURE__*/React.createElement(Sparkle, {
    size: 11
  })), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__user"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: user.name,
    size: 32
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__user-name"
  }, user.name), /*#__PURE__*/React.createElement("div", {
    className: "msgr-app__user-handle"
  }, user.handle)))));
}
function PenIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 20h9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
  }));
}
window.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/messenger-app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/messenger-app/data.js
try { (() => {
// Messenger app — sample data (plain JS, no JSX)
window.MSGR_DATA = {
  user: {
    name: "Cordelia Wren",
    handle: "cordelia@winterhouse.co"
  },
  folders: [{
    id: "inbox",
    label: "Boîte",
    count: 6
  }, {
    id: "sent",
    label: "Envoyés"
  }, {
    id: "drafts",
    label: "Brouillons",
    count: 2
  }, {
    id: "archive",
    label: "Archives"
  }],
  letters: [{
    id: "l1",
    from: "Eleanor Frost",
    initials: "EF",
    art: "chalet",
    subject: "A letter from the cabin",
    preview: "The lake froze over last night and the whole valley has gone quiet…",
    date: "14 DEC.",
    status: "Delivered",
    tone: "peri",
    unread: true,
    body: ["Dear Cordelia,", "The lake froze over last night and the whole valley has gone quiet — the kind of quiet that makes you lower your voice indoors. I lit the stove early and have been writing to you by its light.", "Come north before the roads close. Bring the good cocoa and your warmest socks; I'll handle the rest."],
    sign: "Yours, by the fire — Eleanor"
  }, {
    id: "l2",
    from: "Jonah Vale",
    initials: "JV",
    art: "pine",
    subject: "Re: the winter solstice dinner",
    preview: "Twelve at the long table, candles down the middle, and a stamp on every place card…",
    date: "12 DEC.",
    status: "Sealed",
    tone: "cream",
    body: ["Cordelia,", "Twelve at the long table, candles down the middle, and a hand-stamped letter at every place card — exactly as you imagined it. I've asked the post office to hold the parcels until the 20th.", "Tell me the menu and I'll see to the wine."],
    sign: "— J."
  }, {
    id: "l3",
    from: "The North Post",
    initials: "NP",
    art: "mailbox",
    subject: "Your December stamps have arrived",
    preview: "Three sheets of the Nocturne series and a single Aurora, as requested…",
    date: "11 DEC.",
    status: "Delivered",
    tone: "royal",
    body: ["Bonjour Cordelia,", "Your December stamps have arrived at the counter: three sheets of the Nocturne series and a single Aurora, as requested. They'll keep until you call.", "DIRECTION · PÔLE NORD."],
    sign: "The North Post"
  }, {
    id: "l4",
    from: "Margaux Hivert",
    initials: "MH",
    art: "mug",
    subject: "Cocoa weather",
    preview: "I've perfected the recipe. You owe me an afternoon and a long letter in return…",
    date: "9 DEC.",
    status: "Delivered",
    tone: "peri",
    body: ["Ma chère,", "I've perfected the recipe — too much cinnamon, exactly enough. You owe me an afternoon and a long letter in return."],
    sign: "Bisous, Margaux"
  }, {
    id: "l5",
    from: "Atelier Lumière",
    initials: "AL",
    art: "bauble",
    subject: "Your ornaments are ready to ship",
    preview: "Hand-blown, wrapped in tissue, and waiting on a stamp from you…",
    date: "6 DEC.",
    status: "Returned",
    tone: "cream",
    body: ["Dear patron,", "Your ornaments are ready — hand-blown, wrapped in tissue, and waiting on a shipping stamp from you."],
    sign: "Atelier Lumière"
  }, {
    id: "l6",
    from: "Henri Lefèvre",
    initials: "HL",
    art: "deer",
    subject: "Tracks in the snow",
    preview: "Saw the great stag again at dawn, at the edge of the cedars. Thought of your story…",
    date: "2 DEC.",
    status: "Delivered",
    tone: "peri",
    body: ["Cordelia,", "Saw the great stag again at dawn, at the edge of the cedars, exactly where you said he'd be. Thought of your story and tipped my hat to him."],
    sign: "— Henri"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/messenger-app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Sparkle = __ds_scope.Sparkle;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Postmark = __ds_scope.Postmark;

__ds_ns.Stamp = __ds_scope.Stamp;

__ds_ns.Ticket = __ds_scope.Ticket;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

})();
