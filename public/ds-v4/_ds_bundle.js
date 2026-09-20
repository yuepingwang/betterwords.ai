/* @ds-bundle: {"format":4,"namespace":"BetterwordsAiDesignSystem_ac387e","components":[{"name":"GradientField","sourcePath":"components/brand/GradientField.jsx"},{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/brand/Icon.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Sparkle","sourcePath":"components/brand/Sparkle.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Tag","sourcePath":"components/feedback/Tag.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Segmented","sourcePath":"components/forms/Segmented.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Slider","sourcePath":"components/forms/Slider.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Avatar","sourcePath":"components/surfaces/Avatar.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Divider","sourcePath":"components/surfaces/Divider.jsx"},{"name":"Sheet","sourcePath":"components/surfaces/Sheet.jsx"},{"name":"DraftPanel","sourcePath":"components/surfaces/DraftPanel.jsx"}],"sourceHashes":{"components/brand/GradientField.jsx":"2f549f805ee2","components/brand/Icon.jsx":"b3d313e81259","components/brand/Logo.jsx":"c572884206c9","components/brand/Sparkle.jsx":"c624737b7cb7","components/feedback/Badge.jsx":"687c5b0689ff","components/feedback/Tag.jsx":"4592226121dc","components/feedback/Toast.jsx":"e4fc40aba95b","components/feedback/Tooltip.jsx":"44b9d3d45e6b","components/forms/Button.jsx":"0ef4e9537be0","components/forms/Checkbox.jsx":"176113109ae8","components/forms/IconButton.jsx":"648696affdf2","components/forms/Input.jsx":"5d6afb525f82","components/forms/Radio.jsx":"ad99d964954e","components/forms/Segmented.jsx":"91729a72be58","components/forms/Select.jsx":"da480c1c8d83","components/forms/Slider.jsx":"e15c39ea13ca","components/forms/Switch.jsx":"f069c1da6329","components/forms/Textarea.jsx":"6ce39a2e3b44","components/navigation/BottomNav.jsx":"5510d57e1753","components/navigation/Tabs.jsx":"1959d94d80f9","components/surfaces/Avatar.jsx":"49ed578909c4","components/surfaces/Card.jsx":"0cc436091a86","components/surfaces/Divider.jsx":"4c99f6c5b5d6","components/surfaces/Sheet.jsx":"9c141d2f3ae8","ui_kits/betterwords-app/App.jsx":"dd50de2b85ea","ui_kits/betterwords-app/Composer.jsx":"f2ef53ee31aa","ui_kits/betterwords-app/Home.jsx":"41c9176ba2d0","ui_kits/betterwords-app/Settings.jsx":"20076adcb2d0","ui_kits/betterwords-app/Threads.jsx":"6a8ca831b518","ui_kits/betterwords-app/data.jsx":"0c3100470b7f","ui_kits/betterwords-app/icons.jsx":"36b4afb4b8d9","ui_kits/betterwords-web/Site.jsx":"bd778690d09e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BetterwordsAiDesignSystem_ac387e = window.BetterwordsAiDesignSystem_ac387e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/GradientField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords GradientField — the signature grainy Daybreak surface,
 * as a positioned background layer. Drop content inside; the gradient
 * + grain (+ optional radial glows) sit behind it. This is the brand's
 * hero canvas.
 */
function GradientField({
  sweep = "daybreak",
  glow = false,
  radius,
  children,
  as = "div",
  className = "",
  style,
  ...rest
}) {
  injectGradientFieldStyle();
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ["bw-gfield", `grad-${sweep}`, glow ? "bw-gfield--glow" : "", className].join(" "),
    style: {
      borderRadius: radius,
      ...style
    }
  }, rest), children);
}
let _gfInjected = false;
function injectGradientFieldStyle() {
  if (_gfInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-gfield-style")) {
    _gfInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-gfield-style";
  el.textContent = `
.bw-gfield{ position:relative; overflow:hidden; color:var(--ink-800); }
.bw-gfield--glow::after{ content:""; position:absolute; inset:0; z-index:-1; pointer-events:none;
  background-image:var(--glow-peri), var(--glow-peach); }
`;
  document.head.appendChild(el);
  _gfInjected = true;
}
Object.assign(__ds_scope, { GradientField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/GradientField.jsx", error: String((e && e.message) || e) }); }

// components/brand/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords Icon — one glyph in one of two house sets:
 *  · "line" — the default thin-stroke UI glyph (matches Hanken).
 *  · "pop"  — a thick black-outlined, flat-fill cartoon glyph
 *            (the retro "Magical Athlete"-inspired playful set).
 * `color` tints the line stroke, or the pop fill (outline stays ink).
 */
function Icon({
  name,
  set = "line",
  size = 24,
  color,
  title,
  style,
  className = "",
  ...rest
}) {
  const g = GLYPHS[name];
  if (!g) return null;
  const ink = "#1C1746";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    role: title ? "img" : "presentation",
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    style: {
      display: "inline-block",
      verticalAlign: "middle",
      color,
      ...style
    },
    className,
    ...rest
  };
  if (set === "pop") {
    return /*#__PURE__*/React.createElement("svg", _extends({}, common, {
      fill: "none"
    }), /*#__PURE__*/React.createElement("g", {
      fill: color || "currentColor",
      stroke: ink,
      strokeWidth: "1.9",
      strokeLinejoin: "round",
      strokeLinecap: "round",
      dangerouslySetInnerHTML: {
        __html: g.pop || g.line
      }
    }));
  }
  return /*#__PURE__*/React.createElement("svg", _extends({}, common, {
    fill: "none"
  }), /*#__PURE__*/React.createElement("g", {
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    dangerouslySetInnerHTML: {
      __html: g.line
    }
  }));
}

/** Names available in both sets. */
const ICON_NAMES = ["sparkle", "star", "heart", "chat", "envelope", "send", "quill", "bell", "sun", "moon", "smile", "search", "plus", "check", "edit", "wand"];
const GLYPHS = {
  sparkle: {
    line: '<path d="M12 3c.4 4.3 2.3 6.2 6.6 6.6C14.3 10 12.4 11.9 12 16.2 11.6 11.9 9.7 10 5.4 9.6 9.7 9.2 11.6 7.3 12 3Z"/>',
    pop: '<path d="M12 2.5c.5 4.9 2.6 7 7.5 7.5C14.6 10.5 12.5 12.6 12 17.5 11.5 12.6 9.4 10.5 4.5 10 9.4 9.5 11.5 7.4 12 2.5Z"/>'
  },
  star: {
    line: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"/>',
    pop: '<path d="M12 2.8l2.9 5.9 6.5 1-4.7 4.5 1.1 6.4L12 17.5l-5.8 3.1 1.1-6.4L2.6 9.7l6.5-1L12 2.8Z"/>'
  },
  heart: {
    line: '<path d="M12 20S4 14.5 4 8.8A4 4 0 0112 6a4 4 0 018 2.8C20 14.5 12 20 12 20z"/>',
    pop: '<path d="M12 20.5C5 15.6 2.6 12 2.6 8.4 2.6 5.4 5 3 8 3c1.7 0 3.2.9 4 2.3C12.8 3.9 14.3 3 16 3c3 0 5.4 2.4 5.4 5.4 0 3.6-2.4 7.2-9.4 12.1Z"/>'
  },
  chat: {
    line: '<path d="M4 5h16v11H9l-5 4z"/>',
    pop: '<path d="M4.5 4h15A1.5 1.5 0 0121 5.5v9A1.5 1.5 0 0119.5 16H9.6L5 20v-4H4.5A1.5 1.5 0 013 14.5v-9A1.5 1.5 0 014.5 4Z"/>'
  },
  envelope: {
    line: '<path d="M3.5 6h17v12h-17z"/><path d="M4 6.5l8 6 8-6"/>',
    pop: '<path d="M3.5 5.5h17A1 1 0 0121.5 6.5v11A1 1 0 0120.5 18.5h-17A1 1 0 012.5 17.5v-11A1 1 0 013.5 5.5Z"/><path fill="none" stroke-width="1.6" d="M3.4 6.6l8.6 6.2 8.6-6.2"/>'
  },
  send: {
    line: '<path d="M4 12l16-8-6 16-3.5-6.5L4 12z"/>',
    pop: '<path d="M3.4 11.6 20.6 3.6a.6.6 0 01.8.8l-8 17.2a.6.6 0 01-1.1-.05L10 14 3.5 12.7a.6.6 0 01-.1-1.1Z"/>'
  },
  quill: {
    line: '<path d="M20 4C11 5 6.5 9.5 5 18M20 4c-1 8-6 11-11 11M6 16l-2 4"/>',
    pop: '<path d="M20.5 3.5C11 4 6 9 4.5 18.5c-.1.6.6 1 1 .5C9 15 12.5 15.5 15 14 19 11.6 20.9 8 20.5 3.5Z"/><path fill="none" stroke-width="1.4" d="M9 14.5C12 11 15 9 18 7.5"/>'
  },
  bell: {
    line: '<path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 004 0"/>',
    pop: '<path d="M5.5 17c1.2-1.2 1.5-2.6 1.5-6a5 5 0 0110 0c0 3.4.3 4.8 1.5 6a.6.6 0 01-.5 1h-12a.6.6 0 01-.5-1Z"/><path fill="none" stroke-width="1.8" d="M10 20a2 2 0 004 0"/>'
  },
  sun: {
    line: '<circle cx="12" cy="12" r="4.5"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
    pop: '<circle cx="12" cy="12" r="4.8"/><path fill="none" stroke-width="2" d="M12 2.5v2.6M12 18.9V21.5M2.5 12h2.6M18.9 12H21.5M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9"/>'
  },
  moon: {
    line: '<path d="M20 14A8 8 0 019.5 4 7 7 0 1020 14z"/>',
    pop: '<path d="M20.5 13.8A8.4 8.4 0 019.6 3.4a.6.6 0 00-.8-.7A8.5 8.5 0 1021 14.6a.6.6 0 00-.5-.8Z"/>'
  },
  smile: {
    line: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01M8.5 14a4 4 0 007 0"/>',
    pop: '<circle cx="12" cy="12" r="9"/><g fill="#1C1746" stroke="none"><circle cx="9" cy="10.5" r="1.15"/><circle cx="15" cy="10.5" r="1.15"/></g><path fill="none" stroke-width="1.9" d="M8.3 14a4.2 4.2 0 007.4 0"/>'
  },
  search: {
    line: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    pop: '<circle cx="11" cy="11" r="7"/><path fill="none" stroke-width="2.4" d="M20 20l-3.6-3.6"/>'
  },
  plus: {
    line: '<path d="M12 5v14M5 12h14"/>',
    pop: '<path fill="none" stroke-width="2.6" d="M12 4.5v15M4.5 12h15"/>'
  },
  check: {
    line: '<path d="M5 12l4 4 10-11"/>',
    pop: '<path fill="none" stroke-width="2.6" d="M4.5 12.5l4.2 4.2L19.5 6"/>'
  },
  edit: {
    line: '<path d="M4 20l1.2-4.2L16 5a2 2 0 013 3L8.2 18.8 4 20z"/>',
    pop: '<path d="M3.6 20.4l1.4-4.8L16 4.6a2.1 2.1 0 013 3L8 18.9l-4.8 1.5a.5.5 0 01-.6-.6Z"/><path fill="none" stroke-width="1.5" d="M14.5 6.5l3 3"/>'
  },
  wand: {
    line: '<path d="M15 4l5 5L9 20l-5 1 1-5L15 4z"/><path d="M13.5 6.5l4 4"/>',
    pop: '<path d="M14.6 3.8l5.6 5.6-11 11-5 1.4a.5.5 0 01-.6-.6l1.4-5 11-11Z"/><path fill="none" stroke-width="1.5" d="M13 6.4l4.6 4.6"/>'
  }
};
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/brand/Sparkle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords Sparkle — the brand's connective 4-point star. Use it
 * inline in wordmarks, beside "Recommended" labels, or twinkling on
 * gradient/night surfaces. Inherits `color`; `twinkle` animates it.
 */
function Sparkle({
  size = 20,
  color,
  twinkle = false,
  style,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    className: ["bw-sparkle", twinkle ? "anim-twinkle" : "", className].join(" "),
    style: {
      color,
      display: "inline-block",
      verticalAlign: "middle",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("path", {
    d: "M12 1c.5 5.4 2.6 7.5 8 8-5.4.5-7.5 2.6-8 8-.5-5.4-2.6-7.5-8-8 5.4-.5 7.5-2.6 8-8Z",
    fill: "currentColor"
  }));
}
Object.assign(__ds_scope, { Sparkle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Sparkle.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
/**
 * Betterwords Logo — a type-set wordmark (no separate mark exists;
 * see readme). "Better" in the soft display serif + "words" with a
 * sparkle dotting the lockup. `variant` "gradient" clips the Daybreak
 * sweep into the type. Inherits `color` otherwise.
 */
function Logo({
  variant = "default",
  size = 30,
  tagline = false,
  style,
  className = ""
}) {
  injectLogoStyle();
  const word = /*#__PURE__*/React.createElement("span", {
    className: "bw-logo__word",
    style: {
      fontSize: size
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-logo__b"
  }, "Better"), /*#__PURE__*/React.createElement("span", {
    className: "bw-logo__w"
  }, "words"), /*#__PURE__*/React.createElement(__ds_scope.Sparkle, {
    size: size * 0.42,
    className: "bw-logo__spark"
  }));
  return /*#__PURE__*/React.createElement("span", {
    className: ["bw-logo", `bw-logo--${variant}`, className].join(" "),
    style: style
  }, word, tagline ? /*#__PURE__*/React.createElement("span", {
    className: "bw-logo__tag"
  }, "Say it better") : null);
}
let _logoInjected = false;
function injectLogoStyle() {
  if (_logoInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-logo-style")) {
    _logoInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-logo-style";
  el.textContent = `
.bw-logo{ display:inline-flex; flex-direction:column; gap:0.15em; color:inherit; line-height:1; }
.bw-logo__word{ display:inline-flex; align-items:flex-start; font-family:var(--font-display);
  font-optical-sizing:auto; font-variation-settings:var(--display-soft);
  font-weight:600; letter-spacing:-0.02em; }
.bw-logo__b{ font-weight:600; }
.bw-logo__w{ font-weight:500; font-style:italic; }
.bw-logo__spark{ color:var(--spark); margin-left:0.12em; margin-top:0.04em; }
.bw-logo__tag{ font-family:var(--font-sans); font-weight:600; font-size:0.28em;
  letter-spacing:0.32em; text-transform:uppercase; opacity:0.55; padding-left:0.15em; }
.bw-logo--gradient .bw-logo__b, .bw-logo--gradient .bw-logo__w{
  background:linear-gradient(100deg, var(--blue-600), var(--lilac-500) 48%, var(--peach-500) 92%);
  -webkit-background-clip:text; background-clip:text; color:transparent; }
`;
  document.head.appendChild(el);
  _logoInjected = true;
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
/**
 * Betterwords Badge — a small status pill. Tones map to semantic
 * colors; `gradient` uses the aurora sweep for "Recommended"/delight.
 */
function Badge({
  children,
  tone = "neutral",
  size = "md",
  dot = false,
  style,
  className = ""
}) {
  injectBadgeStyle();
  return /*#__PURE__*/React.createElement("span", {
    className: ["bw-badge", `bw-badge--${tone}`, `bw-badge--${size}`, className].join(" "),
    style: style
  }, dot ? /*#__PURE__*/React.createElement("span", {
    className: "bw-badge__dot"
  }) : null, children);
}
let _bgInjected = false;
function injectBadgeStyle() {
  if (_bgInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-badge-style")) {
    _bgInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-badge-style";
  el.textContent = `
.bw-badge{ display:inline-flex; align-items:center; gap:0.4em; padding:0 0.7em; height:22px;
  border-radius:var(--radius-pill); font-family:var(--font-sans); font-weight:var(--weight-semibold);
  font-size:var(--text-3xs); letter-spacing:var(--tracking-wider); text-transform:uppercase; white-space:nowrap; }
.bw-badge--sm{ height:18px; font-size:9px; padding:0 0.55em; }
.bw-badge--lg{ height:26px; font-size:var(--text-2xs); padding:0 0.85em; }
.bw-badge__dot{ width:6px; height:6px; border-radius:var(--radius-pill); background:currentColor; }
.bw-badge--neutral{ background:var(--bg-sunken); color:var(--text-muted); }
.bw-badge--accent{ background:var(--accent-soft); color:var(--accent); }
.bw-badge--spark{ background:var(--peach-100); color:var(--peach-600); }
.bw-badge--success{ background:var(--mint-200); color:var(--mint-600); }
.bw-badge--warning{ background:var(--honey-300); color:var(--honey-600); }
.bw-badge--danger{ background:#FBDAD3; color:var(--coral-600); }
.bw-badge--gradient{ background-image:var(--grad-aurora); color:var(--paper-0);
  box-shadow:var(--shadow-xs); }
`;
  document.head.appendChild(el);
  _bgInjected = true;
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tag.jsx
try { (() => {
/**
 * Betterwords Tag — a soft interactive chip for filters, tone
 * presets and choices. `selected` fills it; `onRemove` adds an ✕.
 */
function Tag({
  children,
  selected = false,
  onClick,
  onRemove,
  icon,
  tone = "default",
  style,
  className = ""
}) {
  injectTagStyle();
  const clickable = onClick || onRemove;
  return /*#__PURE__*/React.createElement("span", {
    className: ["bw-tag", `bw-tag--${tone}`, selected ? "is-selected" : "", clickable ? "is-clickable" : "", className].join(" "),
    onClick: onClick,
    role: onClick ? "button" : undefined,
    tabIndex: onClick ? 0 : undefined,
    style: style
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "bw-tag__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("span", {
    className: "bw-tag__label"
  }, children), onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bw-tag__x",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 12 12",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l6 6M9 3l-6 6",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))) : null);
}
let _tagInjected = false;
function injectTagStyle() {
  if (_tagInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-tag-style")) {
    _tagInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-tag-style";
  el.textContent = `
.bw-tag{ display:inline-flex; align-items:center; gap:0.45em; padding:0.36em 0.85em;
  border-radius:var(--radius-pill); background:var(--bg-elevated); border:1.5px solid var(--border-soft);
  font-family:var(--font-sans); font-weight:var(--weight-medium); font-size:var(--text-2xs);
  color:var(--text-body);
  transition:background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out),
             color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring); }
.bw-tag__icon{ display:inline-flex; width:1.1em; height:1.1em; }
.bw-tag__icon svg{ width:100%; height:100%; }
.bw-tag.is-clickable{ cursor:pointer; }
.bw-tag.is-clickable:hover{ border-color:var(--accent); color:var(--accent); }
.bw-tag.is-clickable:active{ transform:scale(0.95); }
.bw-tag.is-selected{ background:var(--accent); border-color:var(--accent); color:var(--text-on-accent); }
.bw-tag--spark.is-selected{ background:var(--spark); border-color:var(--spark); color:var(--paper-0); }
.bw-tag__x{ display:inline-flex; align-items:center; justify-content:center; margin-right:-0.25em;
  width:1.15em; height:1.15em; border:0; background:transparent; color:inherit; cursor:pointer; opacity:0.7; }
.bw-tag__x:hover{ opacity:1; }
.bw-tag__x svg{ width:100%; height:100%; }
`;
  document.head.appendChild(el);
  _tagInjected = true;
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/**
 * Betterwords Toast — a small notification that pops in. Use as a
 * single element (position it yourself) or inside a fixed stack.
 * Tones tint the leading accent bar.
 */
function Toast({
  title,
  children,
  tone = "accent",
  icon,
  onClose,
  style,
  className = ""
}) {
  injectToastStyle();
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-toast", `bw-toast--${tone}`, className].join(" "),
    role: "status",
    style: style
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "bw-toast__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("div", {
    className: "bw-toast__body"
  }, title ? /*#__PURE__*/React.createElement("span", {
    className: "bw-toast__title"
  }, title) : null, children ? /*#__PURE__*/React.createElement("span", {
    className: "bw-toast__msg"
  }, children) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    className: "bw-toast__close",
    "aria-label": "Dismiss",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 14 14",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 3.5l7 7M10.5 3.5l-7 7",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))) : null);
}
let _toInjected = false;
function injectToastStyle() {
  if (_toInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-toast-style")) {
    _toInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-toast-style";
  el.textContent = `
.bw-toast{ display:flex; align-items:flex-start; gap:var(--space-3); width:min(360px,90vw);
  padding:var(--space-4); background:var(--bg-elevated); border-radius:var(--radius-lg);
  box-shadow:var(--shadow-lg); border:1px solid var(--border-hair); position:relative; overflow:hidden;
  animation:bw-pop-in var(--dur-slow) var(--ease-spring) both; }
@media (prefers-reduced-motion: reduce){ .bw-toast{ animation:none; } }
.bw-toast::before{ content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--accent); }
.bw-toast--spark::before{ background:var(--spark); }
.bw-toast--success::before{ background:var(--success); }
.bw-toast--danger::before{ background:var(--danger); }
.bw-toast__icon{ display:inline-flex; width:1.4em; height:1.4em; color:var(--accent); flex:none; margin-top:1px; }
.bw-toast--spark .bw-toast__icon{ color:var(--spark); }
.bw-toast--success .bw-toast__icon{ color:var(--success); }
.bw-toast--danger .bw-toast__icon{ color:var(--danger); }
.bw-toast__icon svg{ width:100%; height:100%; }
.bw-toast__body{ display:flex; flex-direction:column; gap:2px; flex:1; min-width:0; }
.bw-toast__title{ font-family:var(--font-sans); font-weight:var(--weight-semibold);
  font-size:var(--text-sm); color:var(--text-strong); }
.bw-toast__msg{ font-family:var(--font-sans); font-size:var(--text-xs); color:var(--text-muted);
  line-height:var(--leading-normal); }
.bw-toast__close{ display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px;
  border:0; border-radius:var(--radius-pill); background:transparent; color:var(--text-faint); cursor:pointer; flex:none; }
.bw-toast__close svg{ width:14px; height:14px; }
.bw-toast__close:hover{ background:var(--bg-sunken); color:var(--text-body); }
`;
  document.head.appendChild(el);
  _toInjected = true;
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/**
 * Betterwords Tooltip — a small hover/focus label. Wraps its child;
 * `content` shows on hover. CSS-only, springs in.
 */
function Tooltip({
  content,
  side = "top",
  children,
  style,
  className = ""
}) {
  injectTooltipStyle();
  return /*#__PURE__*/React.createElement("span", {
    className: ["bw-tooltip", `bw-tooltip--${side}`, className].join(" "),
    style: style
  }, children, /*#__PURE__*/React.createElement("span", {
    className: "bw-tooltip__bubble",
    role: "tooltip"
  }, content));
}
let _ttInjected = false;
function injectTooltipStyle() {
  if (_ttInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-tooltip-style")) {
    _ttInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-tooltip-style";
  el.textContent = `
.bw-tooltip{ position:relative; display:inline-flex; }
.bw-tooltip__bubble{ position:absolute; z-index:60; pointer-events:none; white-space:nowrap;
  padding:0.4em 0.7em; border-radius:var(--radius-sm); background:var(--ink-800); color:var(--paper-0);
  font-family:var(--font-sans); font-weight:var(--weight-medium); font-size:var(--text-2xs);
  box-shadow:var(--shadow-md); opacity:0; transform:scale(0.9);
  transition:opacity var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring); }
.bw-tooltip:hover .bw-tooltip__bubble, .bw-tooltip:focus-within .bw-tooltip__bubble{ opacity:1; transform:scale(1); }
.bw-tooltip--top .bw-tooltip__bubble{ bottom:calc(100% + 8px); left:50%; translate:-50% 0; }
.bw-tooltip--bottom .bw-tooltip__bubble{ top:calc(100% + 8px); left:50%; translate:-50% 0; }
.bw-tooltip--left .bw-tooltip__bubble{ right:calc(100% + 8px); top:50%; translate:0 -50%; }
.bw-tooltip--right .bw-tooltip__bubble{ left:calc(100% + 8px); top:50%; translate:0 -50%; }
`;
  document.head.appendChild(el);
  _ttInjected = true;
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords Button — the primary call to action.
 * Pill-shaped, springy on press. Variants: primary (ink-blue),
 * spark (warm peach for "send"/delight), gradient (Daybreak
 * sweep for hero moments), outline, ghost.
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
  const cls = ["bw-btn", `bw-btn--${variant}`, `bw-btn--${size}`, block ? "bw-btn--block" : ""].join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: style
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "bw-btn__icon"
  }, iconLeft) : null, children ? /*#__PURE__*/React.createElement("span", {
    className: "bw-btn__label"
  }, children) : null, iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "bw-btn__icon"
  }, iconRight) : null);
}
let _btnInjected = false;
function injectButtonStyle() {
  if (_btnInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-btn-style")) {
    _btnInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-btn-style";
  el.textContent = `
.bw-btn{
  --_h: var(--control-h-md);
  display:inline-flex; align-items:center; justify-content:center; gap:var(--space-2);
  height:var(--_h); padding:0 var(--space-6);
  font-family:var(--font-sans); font-weight:var(--weight-semibold);
  font-size:var(--text-sm); letter-spacing:var(--tracking-wide);
  border-radius:var(--radius-pill); border:1.5px solid transparent;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  transition:background var(--dur-fast) var(--ease-out),
             color var(--dur-fast) var(--ease-out),
             border-color var(--dur-fast) var(--ease-out),
             transform var(--dur-base) var(--ease-spring),
             box-shadow var(--dur-base) var(--ease-out);
}
.bw-btn:hover{ transform:translateY(-1.5px); }
.bw-btn:active{ transform:translateY(0.5px) scale(0.97); transition-duration:var(--dur-fast); }
.bw-btn:focus-visible{ outline:none; box-shadow:var(--focus-shadow); }
.bw-btn:disabled{ opacity:0.45; cursor:not-allowed; transform:none; box-shadow:none; }
.bw-btn__icon{ display:inline-flex; width:1.1em; height:1.1em; }
.bw-btn__icon svg{ width:100%; height:100%; }

/* sizes */
.bw-btn--sm{ --_h:var(--control-h-sm); font-size:var(--text-2xs); padding:0 var(--space-4); }
.bw-btn--lg{ --_h:var(--control-h-lg); font-size:var(--text-base); padding:0 var(--space-8); }
.bw-btn--block{ display:flex; width:100%; }

/* primary — ink-blue */
.bw-btn--primary{ background:var(--accent); color:var(--text-on-accent); box-shadow:var(--shadow-sm); }
.bw-btn--primary:hover{ background:var(--accent-hover); box-shadow:var(--glow-accent); }
.bw-btn--primary:active{ background:var(--accent-press); box-shadow:var(--inset-press); }

/* spark — warm peach, the delight / send action */
.bw-btn--spark{ background:var(--spark); color:var(--paper-0); box-shadow:var(--shadow-sm); }
.bw-btn--spark:hover{ background:var(--spark-hover); box-shadow:var(--glow-spark); }
.bw-btn--spark:active{ background:var(--spark-press); box-shadow:var(--inset-press); }

/* gradient — the Daybreak sweep, hero moments */
.bw-btn--gradient{ background-image:var(--grad-aurora); background-size:200% 100%; background-position:0 0;
  color:var(--paper-0); box-shadow:var(--shadow-md);
  transition:background-position var(--dur-slow) var(--ease-out), transform var(--dur-base) var(--ease-spring), box-shadow var(--dur-base) var(--ease-out); }
.bw-btn--gradient:hover{ background-position:100% 0; box-shadow:var(--glow-spark); }

/* outline */
.bw-btn--outline{ background:transparent; color:var(--text-strong); border-color:var(--border-strong); }
.bw-btn--outline:hover{ border-color:var(--accent); color:var(--accent); background:var(--accent-soft); }

/* ghost */
.bw-btn--ghost{ background:transparent; color:var(--accent); padding-inline:var(--space-4); }
.bw-btn--ghost:hover{ background:var(--accent-soft); }
`;
  document.head.appendChild(el);
  _btnInjected = true;
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Betterwords Checkbox — rounded box with a springy check. */
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
  const fid = id || `bw-cb-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("label", {
    className: ["bw-check", disabled ? "is-disabled" : ""].join(" "),
    htmlFor: fid,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    className: "bw-check__input",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }), /*#__PURE__*/React.createElement("span", {
    className: "bw-check__box"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label ? /*#__PURE__*/React.createElement("span", {
    className: "bw-check__label"
  }, label) : null);
}
let _cbInjected = false;
function injectCheckboxStyle() {
  if (_cbInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-check-style")) {
    _cbInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-check-style";
  el.textContent = `
.bw-check{ display:inline-flex; align-items:center; gap:var(--space-3); cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--text-body); user-select:none; }
.bw-check__input{ position:absolute; opacity:0; width:0; height:0; }
.bw-check__box{ display:inline-flex; align-items:center; justify-content:center;
  width:22px; height:22px; border-radius:var(--radius-sm); background:var(--bg-elevated);
  border:1.5px solid var(--border-strong); color:transparent;
  transition:background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring); }
.bw-check__box svg{ width:15px; height:15px; }
.bw-check__input:checked + .bw-check__box{ background:var(--accent); border-color:var(--accent); color:var(--text-on-accent); transform:scale(1.05); }
.bw-check__input:focus-visible + .bw-check__box{ box-shadow:var(--focus-shadow); }
.bw-check:active .bw-check__box{ transform:scale(0.9); }
.bw-check.is-disabled{ opacity:0.5; pointer-events:none; }
`;
  document.head.appendChild(el);
  _cbInjected = true;
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords IconButton — a round, springy control holding a
 * single glyph. Sizes match the control scale; tones tint the
 * hover wash.
 */
function IconButton({
  children,
  label,
  variant = "soft",
  size = "md",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  injectIconButtonStyle();
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    style: style,
    className: ["bw-iconbtn", `bw-iconbtn--${variant}`, `bw-iconbtn--${size}`].join(" ")
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "bw-iconbtn__glyph"
  }, children));
}
let _ibInjected = false;
function injectIconButtonStyle() {
  if (_ibInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-iconbtn-style")) {
    _ibInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-iconbtn-style";
  el.textContent = `
.bw-iconbtn{ --_s:44px; display:inline-flex; align-items:center; justify-content:center;
  width:var(--_s); height:var(--_s); border-radius:var(--radius-pill); border:1.5px solid transparent;
  cursor:pointer; color:var(--text-body); background:transparent; padding:0;
  transition:background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out),
             border-color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring); }
.bw-iconbtn:hover{ transform:translateY(-1.5px); }
.bw-iconbtn:active{ transform:scale(0.9); transition-duration:var(--dur-fast); }
.bw-iconbtn:focus-visible{ outline:none; box-shadow:var(--focus-shadow); }
.bw-iconbtn:disabled{ opacity:0.4; cursor:not-allowed; transform:none; }
.bw-iconbtn__glyph{ display:inline-flex; width:1.25em; height:1.25em; font-size:var(--text-md); }
.bw-iconbtn__glyph svg{ width:100%; height:100%; }

.bw-iconbtn--sm{ --_s:36px; }
.bw-iconbtn--lg{ --_s:56px; }

.bw-iconbtn--soft{ background:var(--accent-soft); color:var(--accent); }
.bw-iconbtn--soft:hover{ background:var(--peri-200); }
.bw-iconbtn--ghost{ background:transparent; color:var(--text-muted); }
.bw-iconbtn--ghost:hover{ background:var(--accent-soft); color:var(--accent); }
.bw-iconbtn--solid{ background:var(--accent); color:var(--text-on-accent); }
.bw-iconbtn--solid:hover{ background:var(--accent-hover); }
.bw-iconbtn--spark{ background:var(--spark); color:var(--paper-0); }
.bw-iconbtn--spark:hover{ background:var(--spark-hover); }
`;
  document.head.appendChild(el);
  _ibInjected = true;
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords Input — a soft, rounded text field. Optional label,
 * hint, leading/trailing adornment and error state.
 */
function Input({
  label,
  hint,
  error,
  id,
  leading,
  trailing,
  size = "md",
  style,
  className = "",
  ...rest
}) {
  injectInputStyle();
  const fid = id || `bw-in-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-field", className].join(" "),
    style: style
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "bw-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: ["bw-input", `bw-input--${size}`, error ? "is-error" : "", leading ? "has-leading" : "", trailing ? "has-trailing" : ""].join(" ")
  }, leading ? /*#__PURE__*/React.createElement("span", {
    className: "bw-input__adorn"
  }, leading) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: "bw-input__el",
    "aria-invalid": !!error
  }, rest)), trailing ? /*#__PURE__*/React.createElement("span", {
    className: "bw-input__adorn"
  }, trailing) : null), error ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg is-error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg"
  }, hint) : null);
}
let _inInjected = false;
function injectInputStyle() {
  if (_inInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-input-style")) {
    _inInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-input-style";
  el.textContent = `
.bw-field{ display:flex; flex-direction:column; gap:var(--space-2); font-family:var(--font-sans); }
.bw-field__label{ font-size:var(--text-2xs); font-weight:var(--weight-semibold);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-muted); }
.bw-field__msg{ font-size:var(--text-xs); color:var(--text-muted); }
.bw-field__msg.is-error{ color:var(--danger); }

.bw-input{ --_h:var(--control-h-md); display:flex; align-items:center; gap:var(--space-2);
  height:var(--_h); padding:0 var(--space-4); background:var(--bg-elevated);
  border:1.5px solid var(--border-soft); border-radius:var(--radius-md);
  transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }
.bw-input--sm{ --_h:var(--control-h-sm); border-radius:var(--radius-sm); }
.bw-input--lg{ --_h:var(--control-h-lg); border-radius:var(--radius-lg); }
.bw-input:focus-within{ border-color:var(--accent); box-shadow:var(--focus-shadow); }
.bw-input.is-error{ border-color:var(--danger); }
.bw-input.is-error:focus-within{ box-shadow:0 0 0 3px rgba(236,90,68,0.35); }
.bw-input__el{ flex:1; min-width:0; border:0; outline:none; background:transparent;
  font-family:inherit; font-size:var(--text-sm); color:var(--text-strong); }
.bw-input__el::placeholder{ color:var(--text-faint); }
.bw-input__adorn{ display:inline-flex; align-items:center; justify-content:center;
  color:var(--text-muted); width:1.15em; height:1.15em; }
.bw-input__adorn svg{ width:100%; height:100%; }
`;
  document.head.appendChild(el);
  _inInjected = true;
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
/** Betterwords Radio — a single option dot. Group by shared `name`. */
function Radio({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  name,
  value,
  id,
  style
}) {
  injectRadioStyle();
  const fid = id || `bw-ra-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("label", {
    className: ["bw-radio", disabled ? "is-disabled" : ""].join(" "),
    htmlFor: fid,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "radio",
    className: "bw-radio__input",
    name: name,
    value: value,
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }), /*#__PURE__*/React.createElement("span", {
    className: "bw-radio__dot"
  }), label ? /*#__PURE__*/React.createElement("span", {
    className: "bw-radio__label"
  }, label) : null);
}
let _raInjected = false;
function injectRadioStyle() {
  if (_raInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-radio-style")) {
    _raInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-radio-style";
  el.textContent = `
.bw-radio{ display:inline-flex; align-items:center; gap:var(--space-3); cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--text-body); user-select:none; }
.bw-radio__input{ position:absolute; opacity:0; width:0; height:0; }
.bw-radio__dot{ position:relative; width:22px; height:22px; border-radius:var(--radius-pill);
  background:var(--bg-elevated); border:1.5px solid var(--border-strong);
  transition:border-color var(--dur-fast) var(--ease-out); }
.bw-radio__dot::after{ content:""; position:absolute; inset:0; margin:auto; width:10px; height:10px;
  border-radius:var(--radius-pill); background:var(--accent); transform:scale(0);
  transition:transform var(--dur-base) var(--ease-spring); }
.bw-radio__input:checked + .bw-radio__dot{ border-color:var(--accent); }
.bw-radio__input:checked + .bw-radio__dot::after{ transform:scale(1); }
.bw-radio__input:focus-visible + .bw-radio__dot{ box-shadow:var(--focus-shadow); }
.bw-radio.is-disabled{ opacity:0.5; pointer-events:none; }
`;
  document.head.appendChild(el);
  _raInjected = true;
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Segmented.jsx
try { (() => {
/**
 * Betterwords Segmented — a pill of 2–4 exclusive options with a
 * sliding "puck" (e.g. Tone: Soft · Moderate · Strong). Controlled
 * via `value` + `onChange(value)`, or uncontrolled with `defaultValue`.
 */
function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  block = false,
  style,
  className = ""
}) {
  injectSegmentedStyle();
  const norm = options.map(o => typeof o === "string" ? {
    value: o,
    label: o
  } : o);
  const [inner, setInner] = React.useState(defaultValue ?? norm[0]?.value);
  const active = value !== undefined ? value : inner;
  const idx = Math.max(0, norm.findIndex(o => o.value === active));
  const pick = val => {
    if (value === undefined) setInner(val);
    onChange && onChange(val);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-seg", `bw-seg--${size}`, block ? "bw-seg--block" : "", className].join(" "),
    style: {
      "--_n": norm.length,
      "--_i": idx,
      ...style
    },
    role: "tablist"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-seg__puck",
    "aria-hidden": "true"
  }), norm.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "tab",
    "aria-selected": o.value === active,
    className: ["bw-seg__opt", o.value === active ? "is-active" : ""].join(" "),
    onClick: () => pick(o.value)
  }, o.label)));
}
let _segInjected = false;
function injectSegmentedStyle() {
  if (_segInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-seg-style")) {
    _segInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-seg-style";
  el.textContent = `
.bw-seg{ --_h:var(--control-h-md); position:relative; display:inline-flex; padding:4px;
  background:var(--bg-sunken); border-radius:var(--radius-pill); border:1.5px solid var(--border-hair); }
.bw-seg--sm{ --_h:var(--control-h-sm); }
.bw-seg--lg{ --_h:var(--control-h-lg); }
.bw-seg--block{ display:flex; width:100%; }
.bw-seg__puck{ position:absolute; top:4px; bottom:4px; left:4px;
  width:calc((100% - 8px) / var(--_n)); border-radius:var(--radius-pill);
  background:var(--bg-elevated); box-shadow:var(--shadow-sm);
  transform:translateX(calc(var(--_i) * 100%));
  transition:transform var(--dur-base) var(--ease-spring); }
.bw-seg__opt{ position:relative; z-index:1; flex:1 0 auto; min-width:0;
  height:calc(var(--_h) - 8px); padding:0 var(--space-5); border:0; background:transparent; cursor:pointer;
  font-family:var(--font-sans); font-weight:var(--weight-semibold); font-size:var(--text-sm);
  color:var(--text-muted); white-space:nowrap;
  transition:color var(--dur-fast) var(--ease-out); }
.bw-seg--block .bw-seg__opt{ flex:1; }
.bw-seg__opt:hover{ color:var(--text-body); }
.bw-seg__opt.is-active{ color:var(--accent); }
.bw-seg__opt:focus-visible{ outline:none; box-shadow:var(--focus-shadow); border-radius:var(--radius-pill); }
`;
  document.head.appendChild(el);
  _segInjected = true;
}
Object.assign(__ds_scope, { Segmented });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Segmented.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords Select — a soft rounded native select with a
 * custom chevron. Options come from `options` (value/label) or children.
 */
function Select({
  label,
  hint,
  error,
  id,
  options,
  size = "md",
  style,
  className = "",
  children,
  ...rest
}) {
  injectSelectStyle();
  const fid = id || `bw-sel-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-field", className].join(" "),
    style: style
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "bw-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: ["bw-select", `bw-select--${size}`, error ? "is-error" : ""].join(" ")
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: "bw-select__el",
    "aria-invalid": !!error
  }, rest), options ? options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)) : children), /*#__PURE__*/React.createElement("svg", {
    className: "bw-select__chev",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), error ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg is-error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg"
  }, hint) : null);
}
let _selInjected = false;
function injectSelectStyle() {
  if (_selInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-select-style")) {
    _selInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-select-style";
  el.textContent = `
.bw-select{ --_h:var(--control-h-md); position:relative; display:flex; align-items:center;
  height:var(--_h); background:var(--bg-elevated);
  border:1.5px solid var(--border-soft); border-radius:var(--radius-md);
  transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
.bw-select--sm{ --_h:var(--control-h-sm); border-radius:var(--radius-sm); }
.bw-select--lg{ --_h:var(--control-h-lg); border-radius:var(--radius-lg); }
.bw-select:focus-within{ border-color:var(--accent); box-shadow:var(--focus-shadow); }
.bw-select.is-error{ border-color:var(--danger); }
.bw-select__el{ appearance:none; -webkit-appearance:none; width:100%; height:100%;
  border:0; outline:none; background:transparent; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); font-weight:var(--weight-medium);
  color:var(--text-strong); padding:0 var(--space-7) 0 var(--space-4); }
.bw-select__chev{ position:absolute; right:var(--space-4); width:16px; height:16px;
  color:var(--text-muted); pointer-events:none; }
`;
  document.head.appendChild(el);
  _selInjected = true;
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Slider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Betterwords Slider — a tuning control (e.g. Length: Succinct ↔
 * Detailed). Gradient-filled track, springy thumb, optional end
 * labels and tick stops.
 */
function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  labelStart,
  labelEnd,
  ticks,
  disabled = false,
  id,
  style,
  className = "",
  ...rest
}) {
  injectSliderStyle();
  const fid = id || `bw-sl-${Math.random().toString(36).slice(2, 8)}`;
  const v = value != null ? value : defaultValue != null ? defaultValue : (min + max) / 2;
  const pct = (v - min) / (max - min) * 100;
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-slider", disabled ? "is-disabled" : "", className].join(" "),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-slider__rail"
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: "range",
    className: "bw-slider__input",
    min: min,
    max: max,
    step: step,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    style: {
      "--_pct": pct + "%"
    }
  }, rest))), labelStart || labelEnd || ticks ? /*#__PURE__*/React.createElement("div", {
    className: "bw-slider__labels"
  }, ticks ? ticks.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "bw-slider__tick"
  }, t)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, labelStart), /*#__PURE__*/React.createElement("span", null, labelEnd))) : null);
}
let _slInjected = false;
function injectSliderStyle() {
  if (_slInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-slider-style")) {
    _slInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-slider-style";
  el.textContent = `
.bw-slider{ display:flex; flex-direction:column; gap:var(--space-2); font-family:var(--font-sans); }
.bw-slider__rail{ position:relative; height:22px; display:flex; align-items:center; }
.bw-slider__input{ -webkit-appearance:none; appearance:none; width:100%; height:8px; margin:0;
  border-radius:var(--radius-pill); background:transparent; cursor:pointer; outline:none; }
.bw-slider__input::-webkit-slider-runnable-track{ height:8px; border-radius:var(--radius-pill);
  background:linear-gradient(90deg, var(--accent) 0 var(--_pct), var(--bg-sunken) var(--_pct) 100%); }
.bw-slider__input::-moz-range-track{ height:8px; border-radius:var(--radius-pill); background:var(--bg-sunken); }
.bw-slider__input::-moz-range-progress{ height:8px; border-radius:var(--radius-pill); background:var(--accent); }
.bw-slider__input::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; margin-top:-7px;
  width:22px; height:22px; border-radius:var(--radius-pill); background:var(--paper-0);
  border:2px solid var(--accent); box-shadow:var(--shadow-sm); cursor:grab;
  transition:transform var(--dur-fast) var(--ease-spring); }
.bw-slider__input::-moz-range-thumb{ width:22px; height:22px; border:2px solid var(--accent);
  border-radius:var(--radius-pill); background:var(--paper-0); box-shadow:var(--shadow-sm); cursor:grab; }
.bw-slider__input:hover::-webkit-slider-thumb{ transform:scale(1.12); }
.bw-slider__input:active::-webkit-slider-thumb{ transform:scale(0.94); cursor:grabbing; }
.bw-slider__input:focus-visible::-webkit-slider-thumb{ box-shadow:var(--focus-shadow); }
.bw-slider__labels{ display:flex; justify-content:space-between; gap:var(--space-2);
  font-size:var(--text-2xs); font-weight:var(--weight-semibold); letter-spacing:var(--tracking-wide);
  text-transform:uppercase; color:var(--text-muted); }
.bw-slider__tick{ flex:1; text-align:center; }
.bw-slider__tick:first-child{ text-align:left; }
.bw-slider__tick:last-child{ text-align:right; }
.bw-slider.is-disabled{ opacity:0.5; pointer-events:none; }
`;
  document.head.appendChild(el);
  _slInjected = true;
}
Object.assign(__ds_scope, { Slider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Slider.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Betterwords Switch — a springy toggle. Thumb bounces on flip. */
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
  const fid = id || `bw-sw-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("label", {
    className: ["bw-switch", disabled ? "is-disabled" : ""].join(" "),
    htmlFor: fid,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    className: "bw-switch__input",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }), /*#__PURE__*/React.createElement("span", {
    className: "bw-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-switch__thumb"
  })), label ? /*#__PURE__*/React.createElement("span", {
    className: "bw-switch__label"
  }, label) : null);
}
let _swInjected = false;
function injectSwitchStyle() {
  if (_swInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-switch-style")) {
    _swInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-switch-style";
  el.textContent = `
.bw-switch{ display:inline-flex; align-items:center; gap:var(--space-3); cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--text-body); user-select:none; }
.bw-switch__input{ position:absolute; opacity:0; width:0; height:0; }
.bw-switch__track{ position:relative; width:48px; height:28px; border-radius:var(--radius-pill);
  background:var(--bg-sunken); border:1.5px solid var(--border-soft);
  transition:background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out); }
.bw-switch__thumb{ position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:var(--radius-pill);
  background:var(--paper-0); box-shadow:var(--shadow-sm);
  transition:transform var(--dur-base) var(--ease-spring); }
.bw-switch__input:checked + .bw-switch__track{ background:var(--accent); border-color:transparent; }
.bw-switch__input:checked + .bw-switch__track .bw-switch__thumb{ transform:translateX(20px); }
.bw-switch__input:focus-visible + .bw-switch__track{ box-shadow:var(--focus-shadow); }
.bw-switch.is-disabled{ opacity:0.5; pointer-events:none; }
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
 * Betterwords Textarea — the writing surface. Rounded, generous
 * padding, optional label/hint/counter. `paper` variant styles it
 * as a warm draft sheet for the composer.
 */
function Textarea({
  label,
  hint,
  error,
  id,
  rows = 5,
  variant = "default",
  maxLength,
  value,
  style,
  className = "",
  ...rest
}) {
  injectTextareaStyle();
  const fid = id || `bw-ta-${Math.random().toString(36).slice(2, 8)}`;
  const count = typeof value === "string" ? value.length : null;
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-field", className].join(" "),
    style: style
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "bw-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("textarea", _extends({
    id: fid,
    rows: rows,
    maxLength: maxLength,
    value: value,
    "aria-invalid": !!error,
    className: ["bw-textarea", `bw-textarea--${variant}`, error ? "is-error" : ""].join(" ")
  }, rest)), /*#__PURE__*/React.createElement("div", {
    className: "bw-textarea__foot"
  }, error ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg is-error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg"
  }, hint) : /*#__PURE__*/React.createElement("span", null), maxLength && count != null ? /*#__PURE__*/React.createElement("span", {
    className: "bw-field__msg"
  }, count, "/", maxLength) : null));
}
let _taInjected = false;
function injectTextareaStyle() {
  if (_taInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-textarea-style")) {
    _taInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-textarea-style";
  el.textContent = `
.bw-textarea{ width:100%; box-sizing:border-box; resize:vertical; font-family:var(--font-sans);
  font-size:var(--text-base); line-height:var(--leading-relaxed); color:var(--text-strong);
  padding:var(--space-4); background:var(--bg-elevated);
  border:1.5px solid var(--border-soft); border-radius:var(--radius-md);
  transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
.bw-textarea::placeholder{ color:var(--text-faint); }
.bw-textarea:focus{ outline:none; border-color:var(--accent); box-shadow:var(--focus-shadow); }
.bw-textarea.is-error{ border-color:var(--danger); }
.bw-textarea--paper{ background:var(--surface-card); border-color:var(--border-hair);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm);
  font-family:var(--font-serif); font-size:var(--text-md); line-height:var(--leading-relaxed); }
.bw-textarea__foot{ display:flex; justify-content:space-between; align-items:center; gap:var(--space-3); }
`;
  document.head.appendChild(el);
  _taInjected = true;
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
/**
 * Betterwords BottomNav — the mobile tab bar. Icon + label items,
 * springy active state. Controlled via `value`/`onChange`.
 */
function BottomNav({
  items,
  value,
  defaultValue,
  onChange,
  style,
  className = ""
}) {
  injectBottomNavStyle();
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value);
  const active = value !== undefined ? value : inner;
  const pick = v => {
    if (value === undefined) setInner(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("nav", {
    className: ["bw-bnav", className].join(" "),
    style: style
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    type: "button",
    "aria-current": it.value === active,
    className: ["bw-bnav__item", it.value === active ? "is-active" : ""].join(" "),
    onClick: () => pick(it.value)
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-bnav__icon"
  }, it.icon), /*#__PURE__*/React.createElement("span", {
    className: "bw-bnav__label"
  }, it.label))));
}
let _bnInjected = false;
function injectBottomNavStyle() {
  if (_bnInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-bnav-style")) {
    _bnInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-bnav-style";
  el.textContent = `
.bw-bnav{ display:flex; align-items:stretch; justify-content:space-around; gap:var(--space-1);
  padding:var(--space-2) var(--space-3); background:var(--bg-elevated);
  border-top:1px solid var(--border-hair); border-radius:var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow:0 -6px 24px rgba(28,23,70,0.06); }
.bw-bnav__item{ display:flex; flex-direction:column; align-items:center; gap:3px; flex:1;
  border:0; background:transparent; cursor:pointer; padding:var(--space-2) 0;
  font-family:var(--font-sans); font-weight:var(--weight-medium); font-size:var(--text-3xs);
  color:var(--text-faint); border-radius:var(--radius-lg);
  transition:color var(--dur-fast) var(--ease-out); }
.bw-bnav__icon{ display:inline-flex; width:24px; height:24px;
  transition:transform var(--dur-base) var(--ease-spring); }
.bw-bnav__icon svg{ width:100%; height:100%; }
.bw-bnav__item:hover{ color:var(--text-muted); }
.bw-bnav__item.is-active{ color:var(--accent); }
.bw-bnav__item.is-active .bw-bnav__icon{ transform:translateY(-2px) scale(1.08); }
.bw-bnav__label{ letter-spacing:var(--tracking-wide); }
`;
  document.head.appendChild(el);
  _bnInjected = true;
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Betterwords Tabs — a row of tabs with a springy sliding indicator.
 * `pill` fills the active tab; `underline` (default) slides a bar.
 * Controlled via `value`/`onChange`, or uncontrolled with `defaultValue`.
 */
function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = "underline",
  style,
  className = ""
}) {
  injectTabsStyle();
  const norm = items.map(it => typeof it === "string" ? {
    value: it,
    label: it
  } : it);
  const [inner, setInner] = React.useState(defaultValue ?? norm[0]?.value);
  const active = value !== undefined ? value : inner;
  const idx = Math.max(0, norm.findIndex(it => it.value === active));
  const pick = v => {
    if (value === undefined) setInner(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-tabs", `bw-tabs--${variant}`, className].join(" "),
    style: {
      "--_n": norm.length,
      "--_i": idx,
      ...style
    },
    role: "tablist"
  }, norm.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    type: "button",
    role: "tab",
    "aria-selected": it.value === active,
    className: ["bw-tabs__tab", it.value === active ? "is-active" : ""].join(" "),
    onClick: () => pick(it.value)
  }, it.icon ? /*#__PURE__*/React.createElement("span", {
    className: "bw-tabs__icon"
  }, it.icon) : null, it.label, it.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "bw-tabs__count"
  }, it.count) : null)), /*#__PURE__*/React.createElement("span", {
    className: "bw-tabs__ind",
    "aria-hidden": "true"
  }));
}
let _tbInjected = false;
function injectTabsStyle() {
  if (_tbInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-tabs-style")) {
    _tbInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-tabs-style";
  el.textContent = `
.bw-tabs{ position:relative; display:inline-flex; gap:var(--space-1); font-family:var(--font-sans); }
.bw-tabs__tab{ position:relative; z-index:1; display:inline-flex; align-items:center; gap:var(--space-2);
  border:0; background:transparent; cursor:pointer; padding:var(--space-3) var(--space-4);
  font-weight:var(--weight-semibold); font-size:var(--text-sm); color:var(--text-muted);
  transition:color var(--dur-fast) var(--ease-out); flex:1 0 auto; justify-content:center; }
.bw-tabs__tab:hover{ color:var(--text-body); }
.bw-tabs__tab.is-active{ color:var(--accent); }
.bw-tabs__icon{ display:inline-flex; width:1.15em; height:1.15em; }
.bw-tabs__icon svg{ width:100%; height:100%; }
.bw-tabs__count{ font-size:var(--text-3xs); background:var(--bg-sunken); color:var(--text-muted);
  border-radius:var(--radius-pill); padding:0 0.5em; min-width:1.6em; text-align:center; }
.bw-tabs__tab.is-active .bw-tabs__count{ background:var(--accent-soft); color:var(--accent); }
.bw-tabs__ind{ position:absolute; z-index:0; width:calc(100% / var(--_n)); left:0;
  transform:translateX(calc(var(--_i) * 100%));
  transition:transform var(--dur-base) var(--ease-spring); }
/* underline */
.bw-tabs--underline{ border-bottom:1.5px solid var(--border-hair); }
.bw-tabs--underline .bw-tabs__ind{ bottom:-1.5px; height:3px; border-radius:var(--radius-pill);
  background:var(--accent); padding:0 var(--space-4); background-clip:content-box; }
/* pill */
.bw-tabs--pill{ background:var(--bg-sunken); padding:4px; border-radius:var(--radius-pill); }
.bw-tabs--pill .bw-tabs__ind{ top:4px; bottom:4px; width:calc((100% - 8px) / var(--_n)); left:4px;
  background:var(--bg-elevated); border-radius:var(--radius-pill); box-shadow:var(--shadow-sm); }
.bw-tabs--pill .bw-tabs__tab.is-active{ color:var(--text-strong); }
`;
  document.head.appendChild(el);
  _tbInjected = true;
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Avatar.jsx
try { (() => {
/**
 * Betterwords Avatar — a round identity token. Shows an image,
 * or initials on a gradient/tinted ground. Optional status dot.
 */
function Avatar({
  src,
  name = "",
  size = 40,
  tone,
  status,
  style,
  className = ""
}) {
  injectAvatarStyle();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join("").toUpperCase();
  const tones = ["peri", "lilac", "peach", "mint", "honey"];
  const pick = tone || tones[(name.charCodeAt(0) || 0) % tones.length];
  return /*#__PURE__*/React.createElement("span", {
    className: ["bw-avatar", `bw-avatar--${pick}`, className].join(" "),
    style: {
      width: size,
      height: size,
      fontSize: Math.round(size * 0.38),
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    className: "bw-avatar__img"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "bw-avatar__txt"
  }, initials || "·"), status ? /*#__PURE__*/React.createElement("span", {
    className: ["bw-avatar__status", `is-${status}`].join(" ")
  }) : null);
}
let _avInjected = false;
function injectAvatarStyle() {
  if (_avInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-avatar-style")) {
    _avInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-avatar-style";
  el.textContent = `
.bw-avatar{ position:relative; display:inline-flex; align-items:center; justify-content:center;
  border-radius:var(--radius-pill); overflow:visible; flex:none;
  font-family:var(--font-sans); font-weight:var(--weight-bold); color:var(--ink-800);
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.5); }
.bw-avatar__img{ width:100%; height:100%; object-fit:cover; border-radius:inherit; }
.bw-avatar__txt{ line-height:1; letter-spacing:0.02em; }
.bw-avatar--peri{ background:linear-gradient(150deg,var(--peri-300),var(--peri-200)); }
.bw-avatar--lilac{ background:linear-gradient(150deg,var(--lilac-400),var(--lilac-300)); }
.bw-avatar--peach{ background:linear-gradient(150deg,var(--peach-300),var(--peach-200)); }
.bw-avatar--mint{ background:linear-gradient(150deg,var(--mint-400),var(--mint-300)); }
.bw-avatar--honey{ background:linear-gradient(150deg,var(--honey-400),var(--honey-300)); }
.bw-avatar__status{ position:absolute; right:-1px; bottom:-1px; width:30%; height:30%;
  min-width:9px; min-height:9px; border-radius:var(--radius-pill);
  border:2px solid var(--bg-elevated); background:var(--text-faint); }
.bw-avatar__status.is-online{ background:var(--success); }
.bw-avatar__status.is-away{ background:var(--honey-500); }
.bw-avatar__status.is-busy{ background:var(--danger); }
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
 * Betterwords Card — a soft, lifted surface. Variants: default
 * (elevated paper), outline (quiet bordered), gradient (Daybreak
 * grain surface), night (dark panel), draft (warm writing sheet).
 */
function Card({
  children,
  variant = "default",
  gradient,
  padded = true,
  as = "div",
  className = "",
  style,
  ...rest
}) {
  injectCardStyle();
  const Tag = as;
  const gradClass = variant === "gradient" ? `grad-${gradient || "daybreak"}` : "";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ["bw-card", `bw-card--${variant}`, gradClass, padded ? "is-padded" : "", className].join(" "),
    style: style
  }, rest), children);
}
let _cardInjected = false;
function injectCardStyle() {
  if (_cardInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-card-style")) {
    _cardInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-card-style";
  el.textContent = `
.bw-card{ border-radius:var(--radius-lg); background:var(--bg-elevated);
  box-shadow:var(--shadow-md); border:1px solid var(--border-hair); }
.bw-card.is-padded{ padding:var(--space-6); }
.bw-card--outline{ box-shadow:none; border:1.5px solid var(--border-soft); background:transparent; }
.bw-card--gradient{ border:0; box-shadow:var(--shadow-lg); color:var(--ink-800);
  border-radius:var(--radius-xl); overflow:hidden; }
.bw-card--night{ background:var(--ink-800); color:var(--paper-0);
  border:1px solid var(--border-night); box-shadow:var(--shadow-lg); border-radius:var(--radius-xl); }
.bw-card--draft{ background:var(--surface-card); box-shadow:var(--shadow-sm);
  border:1px solid var(--border-hair); border-radius:var(--radius-lg); }
`;
  document.head.appendChild(el);
  _cardInjected = true;
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Divider.jsx
try { (() => {
/**
 * Betterwords Divider — a hairline rule with optional centered
 * label or a small sparkle motif.
 */
function Divider({
  label,
  sparkle = false,
  vertical = false,
  className = "",
  style
}) {
  injectDividerStyle();
  if (vertical) return /*#__PURE__*/React.createElement("span", {
    className: ["bw-divider bw-divider--v", className].join(" "),
    style: style
  });
  if (!label && !sparkle) return /*#__PURE__*/React.createElement("hr", {
    className: ["bw-divider", className].join(" "),
    style: style
  });
  return /*#__PURE__*/React.createElement("div", {
    className: ["bw-divider bw-divider--labeled", className].join(" "),
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-divider__line"
  }), sparkle ? /*#__PURE__*/React.createElement("span", {
    className: "bw-divider__spark"
  }, "\u2726") : null, label ? /*#__PURE__*/React.createElement("span", {
    className: "bw-divider__label"
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    className: "bw-divider__line"
  }));
}
let _dvInjected = false;
function injectDividerStyle() {
  if (_dvInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-divider-style")) {
    _dvInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-divider-style";
  el.textContent = `
.bw-divider{ border:0; border-top:1px solid var(--border-hair); margin:0; width:100%; }
.bw-divider--v{ border-top:0; border-left:1px solid var(--border-hair); width:auto; height:auto; align-self:stretch; }
.bw-divider--labeled{ display:flex; align-items:center; gap:var(--space-3); border:0; }
.bw-divider__line{ flex:1; height:1px; background:var(--border-hair); }
.bw-divider__label{ font-family:var(--font-sans); font-size:var(--text-2xs); font-weight:var(--weight-semibold);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-muted); white-space:nowrap; }
.bw-divider__spark{ color:var(--spark); font-size:var(--text-sm); }
`;
  document.head.appendChild(el);
  _dvInjected = true;
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Divider.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Sheet.jsx
try { (() => {
/**
 * Betterwords Sheet — an overlay panel that springs in. `position`
 * "bottom" is a mobile bottom-sheet (grab handle); "center" is a
 * dialog. Renders nothing when `open` is false.
 */
function Sheet({
  open,
  onClose,
  position = "bottom",
  title,
  children,
  footer,
  size = "md",
  style
}) {
  injectSheetStyle();
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "bw-sheet__scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: ["bw-sheet", `bw-sheet--${position}`, `bw-sheet--${size}`].join(" "),
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: style
  }, position === "bottom" ? /*#__PURE__*/React.createElement("span", {
    className: "bw-sheet__grab",
    "aria-hidden": "true"
  }) : null, title || onClose ? /*#__PURE__*/React.createElement("header", {
    className: "bw-sheet__head"
  }, title ? /*#__PURE__*/React.createElement("h3", {
    className: "bw-sheet__title"
  }, title) : /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
    className: "bw-sheet__close",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })))) : null, /*#__PURE__*/React.createElement("div", {
    className: "bw-sheet__body"
  }, children), footer ? /*#__PURE__*/React.createElement("footer", {
    className: "bw-sheet__foot"
  }, footer) : null));
}
let _shInjected = false;
function injectSheetStyle() {
  if (_shInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-sheet-style")) {
    _shInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-sheet-style";
  el.textContent = `
.bw-sheet__scrim{ position:fixed; inset:0; z-index:1000; display:flex;
  background:rgba(20,16,58,0.36); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
  animation:bw-rise var(--dur-base) var(--ease-out) both; }
.bw-sheet{ background:var(--bg-elevated); color:var(--text-body); display:flex; flex-direction:column;
  box-shadow:var(--shadow-xl); }
.bw-sheet--bottom{ margin-top:auto; width:100%; max-height:86%; border-radius:var(--radius-2xl) var(--radius-2xl) 0 0;
  padding:var(--space-3) var(--space-6) var(--space-6);
  animation:bw-sheet-up var(--dur-slow) var(--ease-spring) both; }
.bw-sheet--center{ margin:auto; width:min(92%,var(--_w,480px)); max-height:86%; border-radius:var(--radius-xl);
  padding:var(--space-6); animation:bw-pop-in var(--dur-slow) var(--ease-spring) both; }
.bw-sheet--sm{ --_w:400px; } .bw-sheet--md{ --_w:520px; } .bw-sheet--lg{ --_w:680px; }
@keyframes bw-sheet-up{ from{ transform:translateY(100%);} to{ transform:translateY(0);} }
@media (prefers-reduced-motion: reduce){ .bw-sheet--bottom,.bw-sheet--center,.bw-sheet__scrim{ animation:none; } }
.bw-sheet__grab{ width:44px; height:5px; border-radius:var(--radius-pill); background:var(--border-strong);
  align-self:center; margin-bottom:var(--space-3); opacity:0.6; }
.bw-sheet__head{ display:flex; align-items:center; justify-content:space-between; gap:var(--space-3);
  margin-bottom:var(--space-4); }
.bw-sheet__title{ margin:0; font-family:var(--font-display); font-variation-settings:var(--display-soft);
  font-weight:var(--weight-semibold); font-size:var(--text-lg); color:var(--text-strong); }
.bw-sheet__close{ display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px;
  border:0; border-radius:var(--radius-pill); background:var(--bg-sunken); color:var(--text-muted); cursor:pointer;
  transition:background var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring); }
.bw-sheet__close svg{ width:16px; height:16px; }
.bw-sheet__close:hover{ background:var(--accent-soft); color:var(--accent); }
.bw-sheet__close:active{ transform:scale(0.9); }
.bw-sheet__body{ overflow:auto; }
.bw-sheet__foot{ display:flex; gap:var(--space-3); justify-content:flex-end; margin-top:var(--space-5); }
`;
  document.head.appendChild(el);
  _shInjected = true;
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Sheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/App.jsx
try { (() => {
/* App shell — status bar, screen router, bottom nav. */
function App() {
  const {
    BottomNav
  } = window.BetterwordsAiDesignSystem_ac387e;
  const I = window.Icons;
  const [screen, setScreen] = React.useState("home");
  const go = s => setScreen(s);
  const nav = [{
    value: "home",
    label: "Home",
    icon: /*#__PURE__*/React.createElement(I.home, null)
  }, {
    value: "composer",
    label: "Edit",
    icon: /*#__PURE__*/React.createElement(I.edit, null)
  }, {
    value: "threads",
    label: "Threads",
    icon: /*#__PURE__*/React.createElement(I.chat, null)
  }, {
    value: "settings",
    label: "You",
    icon: /*#__PURE__*/React.createElement(I.user, null)
  }];
  const Screen = {
    home: window.Home,
    composer: window.Composer,
    threads: window.Threads,
    settings: window.Settings
  }[screen];
  const scrolls = screen !== "threads"; // Threads manages its own layout/scroll

  return /*#__PURE__*/React.createElement("div", {
    className: "bw-phone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-phone__notch"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bw-statusbar"
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 13a10 10 0 0120 0",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 15a6 6 0 0112 0M9.5 17.5a2.5 2.5 0 015 0",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "7",
    width: "18",
    height: "10",
    rx: "2.5",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3.5",
    y: "8.5",
    width: "13",
    height: "7",
    rx: "1.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "21",
    y: "10",
    width: "1.6",
    height: "4",
    rx: "0.8"
  })))), screen === "threads" ? /*#__PURE__*/React.createElement("div", {
    className: "bw-screen",
    style: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Screen, {
    go: go
  })) : /*#__PURE__*/React.createElement("div", {
    className: "bw-screen",
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: "100%"
    }
  }, /*#__PURE__*/React.createElement(Screen, {
    go: go
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bw-nav-wrap"
  }, /*#__PURE__*/React.createElement(BottomNav, {
    items: nav,
    value: screen,
    onChange: go
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/Composer.jsx
try { (() => {
/* Composer — the "Edit page". Tone/length tuning, draft options,
   Pros/Cons/Reaction analysis, and the send celebration. */
function Composer({
  go
}) {
  const {
    Segmented,
    Slider,
    Tag,
    Badge,
    Button,
    IconButton,
    Sheet,
    GradientField,
    Sparkle,
    Divider
  } = window.BetterwordsAiDesignSystem_ac387e;
  const I = window.Icons;
  const D = window.APP_DATA;
  const byStance = {
    Soft: D.options[0],
    Moderate: D.options[1],
    Strong: D.options[2]
  };
  const [tone, setTone] = React.useState("Moderate");
  const [len, setLen] = React.useState(45);
  const [preset, setPreset] = React.useState(null);
  const [sent, setSent] = React.useState(false);
  const opt = byStance[tone];
  const optNum = String(D.options.indexOf(opt) + 1).padStart(2, "0");
  const Analysis = ({
    label,
    items,
    tone
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 7,
      color: tone
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "bw-stack",
    style: {
      gap: 6
    }
  }, items.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "bw-row",
    style: {
      alignItems: "flex-start",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 999,
      background: tone,
      marginTop: 7,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-body)",
      lineHeight: 1.45
    }
  }, t)))));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-between bw-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Back",
    variant: "ghost",
    onClick: () => go("home")
  }, /*#__PURE__*/React.createElement(I.back, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "bw-stack",
    style: {
      alignItems: "center",
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-kick"
  }, "Edit"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "Options \xB7 ", D.options.length)), /*#__PURE__*/React.createElement(IconButton, {
    label: "More",
    variant: "ghost"
  }, /*#__PURE__*/React.createElement(I.more, {
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "var(--shadow-xs)"
    }
  }, [["To", D.brief.to], ["Re", D.brief.re]].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "bw-row",
    style: {
      padding: "11px 15px",
      borderTop: i ? "1px solid var(--border-hair)" : "0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-kick",
    style: {
      width: 34
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 500,
      color: "var(--text-strong)"
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    className: "bw-between bw-pad",
    style: {
      marginTop: 20,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-row",
    style: {
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-kick"
  }, "Option ", optNum), opt.recommended ? /*#__PURE__*/React.createElement(Badge, {
    tone: "gradient",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 9,
    style: {
      color: "#fff"
    }
  }), "Recommended") : null), /*#__PURE__*/React.createElement("span", {
    className: "bw-row bw-muted",
    style: {
      fontSize: 12.5,
      gap: 5,
      cursor: "pointer"
    }
  }, "All options ", /*#__PURE__*/React.createElement(I.chevron, {
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      background: "var(--surface-card)",
      border: "1px solid var(--border-hair)",
      borderRadius: 20,
      padding: "20px 20px 18px",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "bw-serif",
    style: {
      margin: "0 0 12px",
      fontSize: 25,
      fontWeight: 500,
      color: "var(--text-strong)"
    }
  }, opt.title), /*#__PURE__*/React.createElement("p", {
    className: "bw-serif",
    style: {
      margin: 0,
      fontSize: 18,
      lineHeight: 1.62,
      color: "var(--text-body)"
    }
  }, opt.body), /*#__PURE__*/React.createElement("div", {
    className: "bw-row",
    style: {
      gap: 6,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Regenerate",
    variant: "soft",
    size: "sm"
  }, /*#__PURE__*/React.createElement(I.refresh, {
    size: 16
  })), /*#__PURE__*/React.createElement(IconButton, {
    label: "Copy",
    variant: "soft",
    size: "sm"
  }, /*#__PURE__*/React.createElement(I.copy, {
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 12
    }
  }, opt.body.split(" ").length, " words")))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 9
    }
  }, "Tone"), /*#__PURE__*/React.createElement(Segmented, {
    block: true,
    options: ["Soft", "Moderate", "Strong"],
    value: tone,
    onChange: setTone
  }), /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      margin: "20px 0 12px"
    }
  }, "Length"), /*#__PURE__*/React.createElement(Slider, {
    value: len,
    onChange: e => setLen(+e.target.value),
    labelStart: "Succinct",
    labelEnd: "Detailed"
  })), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 9
    }
  }, "Nudge it"), /*#__PURE__*/React.createElement("div", {
    className: "bw-row",
    style: {
      flexWrap: "wrap",
      gap: 8
    }
  }, D.presets.map(p => /*#__PURE__*/React.createElement(Tag, {
    key: p,
    selected: preset === p,
    onClick: () => setPreset(preset === p ? null : p)
  }, p)))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 18,
      padding: "16px 16px 18px",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-row",
    style: {
      gap: 18,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Analysis, {
    label: "Pros",
    items: opt.pros,
    tone: "var(--mint-600)"
  }), /*#__PURE__*/React.createElement(Analysis, {
    label: "Cons",
    items: opt.cons,
    tone: "var(--honey-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "14px 0"
    }
  }, /*#__PURE__*/React.createElement(Divider, null)), /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 6,
      color: "var(--blue-600)"
    }
  }, "Possible reaction"), /*#__PURE__*/React.createElement("p", {
    className: "bw-serif",
    style: {
      margin: 0,
      fontSize: 16,
      fontStyle: "italic",
      color: "var(--text-body)",
      lineHeight: 1.5
    }
  }, opt.reaction))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: "16px 20px 22px",
      background: "linear-gradient(to top, var(--bg-base) 62%, transparent)",
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => go("home")
  }, "Save draft"), /*#__PURE__*/React.createElement(Button, {
    variant: "spark",
    block: true,
    iconRight: /*#__PURE__*/React.createElement(I.send, {
      size: 17
    }),
    onClick: () => setSent(true)
  }, "Review & send")), /*#__PURE__*/React.createElement(Sheet, {
    open: sent,
    onClose: () => setSent(false),
    position: "center",
    size: "sm"
  }, /*#__PURE__*/React.createElement(GradientField, {
    sweep: "dawn",
    radius: 18,
    style: {
      margin: "-24px -24px 18px",
      padding: "30px 24px 26px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/envelope.png",
    alt: "",
    style: {
      width: 78,
      height: 78,
      objectFit: "contain"
    },
    className: "anim-float"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "bw-serif",
    style: {
      margin: "0 0 6px",
      fontSize: 26,
      fontWeight: 500,
      textAlign: "center",
      color: "var(--text-strong)"
    }
  }, "Sent. That took courage. ", /*#__PURE__*/React.createElement(Sparkle, {
    size: 18,
    style: {
      color: "var(--spark)"
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "bw-muted",
    style: {
      margin: "0 0 20px",
      textAlign: "center",
      fontSize: 14.5,
      lineHeight: 1.5
    }
  }, "Your message to ", D.brief.to.toLowerCase(), " is on its way."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    block: true,
    onClick: () => {
      setSent(false);
      go("home");
    }
  }, "Back home")));
}
window.Composer = Composer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/Composer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/Home.jsx
try { (() => {
/* Home — greeting, the "what do you want to say?" prompt, recent drafts. */
function Home({
  go
}) {
  const {
    Logo,
    GradientField,
    Button,
    Badge,
    Avatar,
    Sparkle
  } = window.BetterwordsAiDesignSystem_ac387e;
  const I = window.Icons;
  const D = window.APP_DATA;
  const statusTone = {
    recommended: "gradient",
    draft: "neutral",
    sent: "success",
    scheduled: "accent"
  };
  const statusText = {
    recommended: "Recommended",
    draft: "Draft",
    sent: "Sent",
    scheduled: "Scheduled"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-between bw-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 22
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: D.user.name,
    size: 38,
    status: "online"
  })), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad"
  }, /*#__PURE__*/React.createElement(GradientField, {
    sweep: "daybreak",
    glow: true,
    radius: 28,
    style: {
      padding: "26px 22px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      color: "var(--ink-700)"
    }
  }, "Good evening, Sarah"), /*#__PURE__*/React.createElement("h1", {
    className: "bw-h1",
    style: {
      marginTop: 8,
      fontSize: 32
    }
  }, "What do you", /*#__PURE__*/React.createElement("br", null), "want to say?"), /*#__PURE__*/React.createElement("div", {
    onClick: () => go("composer"),
    className: "bw-tap",
    style: {
      marginTop: 18,
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(6px)",
      borderRadius: 18,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 15
    }
  }, "Paste a rough draft or an idea\u2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "var(--spark)",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(I.wand, {
    size: 18
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 10
    }
  }, "Start from a moment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, [{
    t: "A hard message",
    ill: "speech",
    g: "var(--peri-100)"
  }, {
    t: "A thank-you",
    ill: "heart",
    g: "var(--peach-100)"
  }, {
    t: "Say no, kindly",
    ill: "open-hands",
    g: "var(--lilac-200)"
  }, {
    t: "Ask for something",
    ill: "hand-heart",
    g: "var(--mint-200)"
  }].map(q => /*#__PURE__*/React.createElement("div", {
    key: q.t,
    className: "bw-tap",
    onClick: () => go("composer"),
    style: {
      background: q.g,
      borderRadius: 20,
      padding: "14px 14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minHeight: 104,
      justifyContent: "space-between",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/" + q.ill + ".png",
    alt: "",
    style: {
      width: 46,
      height: 46,
      objectFit: "contain"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 18,
      color: "var(--ink-800)",
      lineHeight: 1.1
    }
  }, q.t))))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-between",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick"
  }, "Recent"), /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 12
    }
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    className: "bw-list"
  }, D.drafts.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    className: "bw-tap",
    onClick: () => go("composer"),
    style: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 18,
      padding: "13px 15px",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-stack",
    style: {
      gap: 3,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 18,
      color: "var(--text-strong)"
    }
  }, d.title), /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 12.5
    }
  }, "To ", d.to, " \xB7 ", d.when)), /*#__PURE__*/React.createElement(Badge, {
    tone: statusTone[d.status],
    size: "sm"
  }, d.status === "recommended" ? /*#__PURE__*/React.createElement(Sparkle, {
    size: 9,
    style: {
      color: "#fff"
    }
  }) : null, statusText[d.status])))))));
}
window.Home = Home;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/Settings.jsx
try { (() => {
/* Settings — profile, default tone, and preference toggles/rows. */
function Settings() {
  const {
    Avatar,
    Switch,
    Segmented,
    Divider,
    Badge,
    Sparkle
  } = window.BetterwordsAiDesignSystem_ac387e;
  const I = window.Icons;
  const D = window.APP_DATA;
  const [defTone, setDefTone] = React.useState("Moderate");
  const Row = ({
    icon,
    label,
    sub,
    right,
    tint
  }) => /*#__PURE__*/React.createElement("div", {
    className: "bw-row",
    style: {
      padding: "13px 4px",
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      background: tint || "var(--accent-soft)",
      color: tint ? "var(--ink-800)" : "var(--accent)"
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "bw-stack",
    style: {
      flex: 1,
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: "var(--text-strong)"
    }
  }, label), sub ? /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 12.5
    }
  }, sub) : null), right);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "bw-h2"
  }, "You")), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-row",
    style: {
      gap: 15,
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 20,
      padding: "16px 18px",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: D.user.name,
    size: 58,
    status: "online"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bw-stack",
    style: {
      gap: 4,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 22,
      color: "var(--text-strong)"
    }
  }, D.user.name), /*#__PURE__*/React.createElement(Badge, {
    tone: "gradient",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 9,
    style: {
      color: "#fff"
    }
  }), "Plus member")), /*#__PURE__*/React.createElement(I.chevron, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 9
    }
  }, "Your default tone"), /*#__PURE__*/React.createElement(Segmented, {
    block: true,
    options: ["Soft", "Moderate", "Strong"],
    value: defTone,
    onChange: setDefTone
  }), /*#__PURE__*/React.createElement("p", {
    className: "bw-muted",
    style: {
      fontSize: 12.5,
      margin: "10px 2px 0",
      lineHeight: 1.5
    }
  }, "New drafts start here. You can always tune each message.")), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 4
    }
  }, "Preferences"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 18,
      padding: "2px 14px",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(I.wand, {
      size: 19
    }),
    label: "Suggest as I type",
    sub: "Live rewrites while composing",
    right: /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: true
    })
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(I.heart, {
      size: 19
    }),
    label: "Keep my voice",
    sub: "Preserve how you naturally write",
    right: /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: true
    }),
    tint: "var(--peach-100)"
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(I.bell, {
      size: 19
    }),
    label: "Send reminders",
    right: /*#__PURE__*/React.createElement(Switch, null),
    tint: "var(--peri-100)"
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(I.moon, {
      size: 19
    }),
    label: "Night theme",
    right: /*#__PURE__*/React.createElement(Switch, null),
    tint: "var(--lilac-200)"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-kick",
    style: {
      marginBottom: 4
    }
  }, "Account"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 18,
      padding: "2px 14px",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(I.lock, {
      size: 19
    }),
    label: "Privacy & data",
    tint: "var(--mint-200)",
    right: /*#__PURE__*/React.createElement(I.chevron, {
      size: 17
    })
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(I.scale, {
      size: 19
    }),
    label: "Manage plan",
    tint: "var(--honey-300)",
    right: /*#__PURE__*/React.createElement(I.chevron, {
      size: 17
    })
  }))));
}
window.Settings = Settings;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/Settings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/Threads.jsx
try { (() => {
/* Threads — message list and an open conversation with an inline
   "Betterwords" assist on the composer bar. */
function Threads() {
  const {
    Avatar,
    Badge,
    IconButton,
    Tabs,
    Sparkle
  } = window.BetterwordsAiDesignSystem_ac387e;
  const I = window.Icons;
  const D = window.APP_DATA;
  const [open, setOpen] = React.useState(null);
  const t = open ? D.threads.find(x => x.id === open) : null;
  if (t) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bw-between bw-pad",
      style: {
        paddingTop: 2,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border-hair)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bw-row"
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Back",
      variant: "ghost",
      onClick: () => setOpen(null)
    }, /*#__PURE__*/React.createElement(I.back, {
      size: 20
    })), /*#__PURE__*/React.createElement(Avatar, {
      name: t.name,
      tone: t.tone,
      size: 36,
      status: "online"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bw-stack",
      style: {
        gap: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: 15,
        color: "var(--text-strong)"
      }
    }, t.name), /*#__PURE__*/React.createElement("span", {
      className: "bw-muted",
      style: {
        fontSize: 11.5
      }
    }, "Active now"))), /*#__PURE__*/React.createElement(IconButton, {
      label: "More",
      variant: "ghost"
    }, /*#__PURE__*/React.createElement(I.more, {
      size: 20
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bw-screen bw-pad",
      style: {
        paddingTop: 16,
        paddingBottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, t.msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        alignSelf: m.me ? "flex-end" : "flex-start",
        maxWidth: "78%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        borderRadius: 20,
        fontSize: 14.5,
        lineHeight: 1.45,
        borderBottomRightRadius: m.me ? 6 : 20,
        borderBottomLeftRadius: m.me ? 20 : 6,
        background: m.me ? "var(--accent)" : "var(--bg-elevated)",
        color: m.me ? "var(--text-on-accent)" : "var(--text-body)",
        border: m.me ? "0" : "1px solid var(--border-hair)",
        boxShadow: "var(--shadow-xs)"
      }
    }, m.text))), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center",
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "accent",
      size: "sm"
    }, /*#__PURE__*/React.createElement(Sparkle, {
      size: 9
    }), "Betterwords helped you reply"))), /*#__PURE__*/React.createElement("div", {
      className: "bw-pad",
      style: {
        padding: "10px 16px 16px",
        borderTop: "1px solid var(--border-hair)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bw-row",
      style: {
        gap: 8,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-soft)",
        borderRadius: 999,
        padding: "6px 6px 6px 16px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "bw-muted",
      style: {
        flex: 1,
        fontSize: 14.5
      }
    }, "Message\u2026"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        background: "var(--accent-soft)",
        color: "var(--accent)"
      }
    }, /*#__PURE__*/React.createElement(I.wand, {
      size: 17
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        background: "var(--spark)",
        color: "#fff"
      }
    }, /*#__PURE__*/React.createElement(I.send, {
      size: 17
    })))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-between bw-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "bw-h2"
  }, "Threads"), /*#__PURE__*/React.createElement(IconButton, {
    label: "Search",
    variant: "soft"
  }, /*#__PURE__*/React.createElement(I.search, {
    size: 19
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "all",
      label: "All"
    }, {
      value: "assist",
      label: "Assisted",
      count: 2
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "bw-pad bw-list"
  }, D.threads.map(th => /*#__PURE__*/React.createElement("div", {
    key: th.id,
    className: "bw-tap bw-row",
    onClick: () => setOpen(th.id),
    style: {
      gap: 13,
      padding: "10px 6px"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: th.name,
    tone: th.tone,
    size: 52
  }), /*#__PURE__*/React.createElement("div", {
    className: "bw-stack",
    style: {
      flex: 1,
      gap: 3,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bw-between"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 15.5,
      color: "var(--text-strong)"
    }
  }, th.name), /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 12
    }
  }, th.when)), /*#__PURE__*/React.createElement("div", {
    className: "bw-between",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bw-muted",
    style: {
      fontSize: 13.5,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, th.last), th.unread ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      minWidth: 20,
      height: 20,
      padding: "0 6px",
      borderRadius: 999,
      background: "var(--spark)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, th.unread) : null))))));
}
window.Threads = Threads;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/Threads.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/data.jsx
try { (() => {
/* Betterwords app — fake data for the UI-kit recreation. */
window.APP_DATA = {
  user: {
    name: "Sarah Kim",
    handle: "you"
  },
  // The rough draft the user pasted, plus the tuned options Betterwords returns.
  brief: {
    to: "Your Landlord",
    re: "Immediate Repair Needed",
    raw: "hey its been three weeks and the heating still isnt fixed. its getting cold and honestly im pretty frustrated, can someone actually come out this time"
  },
  options: [{
    id: "o1",
    title: "The Gentle Nudge",
    stance: "Soft",
    body: "Hi — just following up on the heating repair. It's been about three weeks now and with the colder weather setting in, I'd really appreciate getting it sorted soon. Could someone come by this week? Thank you so much.",
    pros: ["Keeps the relationship warm", "Easy to say yes to"],
    cons: ["May not convey urgency"],
    reaction: "Likely a friendly, prompt reply."
  }, {
    id: "o2",
    title: "The Direct Appeal",
    stance: "Moderate",
    recommended: true,
    body: "Hi — I'm writing again about the heating, which has now been out for three weeks. With temperatures dropping, this has become urgent. Could you please arrange for someone to come out this week? I'd appreciate a firm date by tomorrow.",
    pros: ["Clear and firm without hostility", "Sets a concrete expectation"],
    cons: ["Slightly more formal in tone"],
    reaction: "Reads as reasonable but serious — most landlords will act."
  }, {
    id: "o3",
    title: "The Formal Notice",
    stance: "Strong",
    body: "Dear Landlord, This is my third request regarding the non-functioning heating, now unaddressed for three weeks. Adequate heating is a condition of tenancy. Please confirm a repair date within 48 hours, after which I will escalate as permitted under our agreement.",
    pros: ["Creates a paper trail", "Maximum urgency"],
    cons: ["Can feel adversarial", "Harder to walk back"],
    reaction: "Signals you know your rights — expect a fast, formal response."
  }],
  drafts: [{
    id: "d1",
    title: "The Direct Appeal",
    to: "Your Landlord",
    status: "recommended",
    when: "just now",
    tone: "Moderate"
  }, {
    id: "d2",
    title: "Thank-you to Priya",
    to: "Priya Nair",
    status: "draft",
    when: "2h ago",
    tone: "Warm"
  }, {
    id: "d3",
    title: "Declining the offer",
    to: "Northwind Recruiting",
    status: "sent",
    when: "yesterday",
    tone: "Kind"
  }, {
    id: "d4",
    title: "Rent negotiation",
    to: "Your Landlord",
    status: "scheduled",
    when: "Mon 9:00",
    tone: "Firm"
  }],
  threads: [{
    id: "t1",
    name: "Priya Nair",
    tone: "peach",
    last: "That means a lot, thank you 🙏",
    when: "2h",
    unread: 0,
    msgs: [{
      me: false,
      text: "Hey! Did you get a chance to look at the deck?"
    }, {
      me: true,
      text: "I did — it's genuinely great. I left a few small notes but the story really lands."
    }, {
      me: false,
      text: "That means a lot, thank you."
    }]
  }, {
    id: "t2",
    name: "Dad",
    tone: "peri",
    last: "Call me when you can ♥",
    when: "5h",
    unread: 2,
    msgs: [{
      me: false,
      text: "How did the apartment thing go?"
    }, {
      me: false,
      text: "Call me when you can ♥"
    }]
  }, {
    id: "t3",
    name: "Northwind Recruiting",
    tone: "lilac",
    last: "Thanks for letting us know.",
    when: "1d",
    unread: 0,
    msgs: [{
      me: true,
      text: "Thank you for the offer — after a lot of thought I've decided to stay where I am for now."
    }, {
      me: false,
      text: "Thanks for letting us know. The door's always open."
    }]
  }],
  presets: ["Warmer", "Shorter", "More formal", "More confident", "Apologetic", "Add a deadline"]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-app/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Betterwords UI-kit icons — thin 1.7px line glyphs (Lucide-weight).
   Shared to window so every screen script can use them. */
const S = ({
  d,
  size = 22,
  fill,
  ...p
}) => /*#__PURE__*/React.createElement("svg", _extends({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill || "none"
}, p), Array.isArray(d) ? d.map((dd, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: dd,
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round"
})) : /*#__PURE__*/React.createElement("path", {
  d: d,
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const Icons = {
  home: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M4 11l8-7 8 7M6 10v9h4v-5h4v5h4v-9"
  })),
  edit: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M4 20l1.2-4.2L16 5a2 2 0 013 3L8.2 18.8 4 20z"
  })),
  chat: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M4 5h16v11H9l-5 4z"
  })),
  user: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M12 12a4 4 0 100-8 4 4 0 000 8z", "M5 20a7 7 0 0114 0"]
  })),
  send: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M4 12l16-8-6 16-3.5-6.5L4 12z"
  })),
  sparkle: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    fill: "currentColor",
    d: "M12 2c.5 4.9 2.6 7 7.5 7.5C14.6 10 12.5 12.1 12 17c-.5-4.9-2.6-7-7.5-7.5C9.4 9 11.5 6.9 12 2z"
  })),
  plus: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M12 5v14M5 12h14"
  })),
  back: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M15 5l-7 7 7 7"
  })),
  close: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M6 6l12 12M18 6L6 18"
  })),
  search: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M11 18a7 7 0 100-14 7 7 0 000 14z", "M20 20l-3.5-3.5"]
  })),
  more: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M12 6h.01", "M12 12h.01", "M12 18h.01"]
  })),
  wand: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M15 4l5 5L9 20l-5 1 1-5L15 4z", "M13.5 6.5l4 4"]
  })),
  refresh: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M20 11a8 8 0 10-2 5", "M20 5v6h-6"]
  })),
  copy: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M9 9h10v10H9z", "M5 15V5h10"]
  })),
  check: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M5 12l4 4 10-11"
  })),
  chevron: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M9 6l6 6-6 6"
  })),
  clock: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M12 21a9 9 0 100-18 9 9 0 000 18z", "M12 7v5l3 2"]
  })),
  heart: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M12 20S4 14.5 4 8.8A4 4 0 0112 6a4 4 0 018 2.8C20 14.5 12 20 12 20z"
  })),
  bell: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z", "M10 21a2 2 0 004 0"]
  })),
  lock: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M6 11h12v9H6z", "M9 11V8a3 3 0 016 0v3"]
  })),
  moon: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: "M20 14A8 8 0 019.5 4 7 7 0 1020 14z"
  })),
  scale: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M12 4v16", "M7 8h10", "M7 8l-3 6h6l-3-6z", "M17 8l-3 6h6l-3-6z"]
  })),
  trash: p => /*#__PURE__*/React.createElement(S, _extends({}, p, {
    d: ["M5 7h14", "M9 7V5h6v2", "M7 7l1 13h8l1-13"]
  }))
};
window.Icons = Icons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/betterwords-web/Site.jsx
try { (() => {
/* Betterwords marketing site — all sections. Composes DS components. */
const {
  Logo,
  Button,
  Badge,
  Segmented,
  Slider,
  Card,
  GradientField,
  Sparkle,
  Avatar,
  Divider,
  Tag
} = window.BetterwordsAiDesignSystem_ac387e;
const ill = n => "../../assets/illustrations/" + n + ".png";

/* ---- Header ---- */
function Header() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      backdropFilter: "blur(10px)",
      background: "rgba(251,247,239,0.72)",
      borderBottom: "1px solid var(--border-hair)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 68
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 24
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 30
    }
  }, ["How it works", "Examples", "Pricing"].map(t => /*#__PURE__*/React.createElement("a", {
    key: t,
    href: "#" + t.split(" ")[0].toLowerCase(),
    style: {
      color: "var(--text-body)",
      fontSize: 15,
      fontWeight: 500
    }
  }, t)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "Start free"))));
}

/* ---- Hero ---- */
function Hero() {
  return /*#__PURE__*/React.createElement(GradientField, {
    sweep: "daybreak",
    glow: true,
    as: "section",
    style: {
      paddingTop: 84,
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap center",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gradient"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 11,
    style: {
      color: "#fff"
    }
  }), "Now with tone & length tuning"), /*#__PURE__*/React.createElement("h1", {
    className: "site-h1",
    style: {
      marginTop: 22,
      maxWidth: "16ch"
    }
  }, "Say it better."), /*#__PURE__*/React.createElement("p", {
    className: "site-lead",
    style: {
      marginTop: 20,
      maxWidth: "46ch",
      color: "var(--ink-700)"
    }
  }, "Paste what you want to say \u2014 a hard text, a thank-you, a message you've rewritten five times. Betterwords finds the words, in your voice."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 30
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "spark",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Sparkle, {
      size: 16,
      style: {
        color: "#fff"
      }
    })
  }, "Start writing free"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg"
  }, "See an example")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      color: "var(--ink-600)"
    }
  }, "No card needed \xB7 Free for your first 20 messages")));
}

/* ---- Live example (interactive tuning) ---- */
function LiveExample() {
  const variants = {
    Soft: "Hi — just a gentle follow-up on the heating repair whenever you get a chance. Thank you so much!",
    Moderate: "Hi — following up on the heating, which has been out three weeks. With it getting cold, could someone come this week? I'd appreciate a firm date.",
    Strong: "This is my third request about the heating, unaddressed for three weeks. Please confirm a repair date within 48 hours."
  };
  const [tone, setTone] = React.useState("Moderate");
  return /*#__PURE__*/React.createElement("section", {
    id: "examples",
    className: "section",
    style: {
      background: "var(--bg-elevated)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 56,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "site-kick"
  }, "Watch it work"), /*#__PURE__*/React.createElement("h2", {
    className: "site-h2",
    style: {
      marginTop: 14
    }
  }, "One message,", /*#__PURE__*/React.createElement("br", null), "every register."), /*#__PURE__*/React.createElement("p", {
    className: "site-lead",
    style: {
      marginTop: 16,
      maxWidth: "40ch"
    }
  }, "Slide the tone from soft to strong and watch the words change \u2014 never the meaning, never your voice."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      maxWidth: 340
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "site-kick",
    style: {
      marginBottom: 10
    }
  }, "Tone"), /*#__PURE__*/React.createElement(Segmented, {
    block: true,
    options: ["Soft", "Moderate", "Strong"],
    value: tone,
    onChange: setTone
  }), /*#__PURE__*/React.createElement("div", {
    className: "site-kick",
    style: {
      margin: "22px 0 12px"
    }
  }, "Length"), /*#__PURE__*/React.createElement(Slider, {
    defaultValue: 40,
    labelStart: "Succinct",
    labelEnd: "Detailed"
  }))), /*#__PURE__*/React.createElement(Card, {
    variant: "draft",
    style: {
      padding: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "site-kick"
  }, "To your landlord"), tone === "Moderate" ? /*#__PURE__*/React.createElement(Badge, {
    tone: "gradient",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 9,
    style: {
      color: "#fff"
    }
  }), "Recommended") : null), /*#__PURE__*/React.createElement("p", {
    className: "serif",
    style: {
      margin: 0,
      fontSize: 22,
      lineHeight: 1.6,
      color: "var(--text-strong)"
    }
  }, variants[tone]), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 22
    }
  }, ["Warmer", "Shorter", "Add a deadline"].map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t
  }, t))))));
}

/* ---- How it works ---- */
function How() {
  const steps = [{
    n: "01",
    ill: "speech",
    t: "Paste your draft",
    d: "A rough text, a bad first attempt, or just the gist. No blank page."
  }, {
    n: "02",
    ill: "sparkle",
    t: "Tune the tone",
    d: "Soft, moderate or strong. Succinct or detailed. See options side by side."
  }, {
    n: "03",
    ill: "envelope",
    t: "Send with confidence",
    d: "We show the likely reaction — the pros, the cons — so you can send and mean it."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "how",
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "center",
    style: {
      marginBottom: 52
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "site-kick"
  }, "How it works"), /*#__PURE__*/React.createElement("h2", {
    className: "site-h2",
    style: {
      marginTop: 12
    }
  }, "Three steps to the right words.")), /*#__PURE__*/React.createElement("div", {
    className: "grid3"
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: "reveal",
    style: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-hair)",
      borderRadius: 24,
      padding: "30px 26px",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: ill(s.ill),
    alt: "",
    style: {
      width: 64,
      height: 64,
      objectFit: "contain"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "site-kick",
    style: {
      marginTop: 18,
      color: "var(--spark)"
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    className: "serif",
    style: {
      margin: "6px 0 8px",
      fontSize: 25,
      fontWeight: 500,
      color: "var(--text-strong)"
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 15.5,
      lineHeight: 1.6,
      color: "var(--text-muted)"
    }
  }, s.d))))));
}

/* ---- Quote ---- */
function Quote() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      background: "var(--ink-800)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "night wrap center",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 30,
    style: {
      color: "var(--spark)"
    },
    twinkle: true
  }), /*#__PURE__*/React.createElement("p", {
    className: "serif",
    style: {
      fontStyle: "italic",
      fontSize: "clamp(26px,3.6vw,42px)",
      lineHeight: 1.3,
      color: "var(--paper-0)",
      maxWidth: "20ch",
      margin: "20px 0 24px"
    }
  }, "\"I finally sent the message I'd been avoiding for a month.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Mara Ellis",
    tone: "peach",
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--paper-0)",
      fontWeight: 600,
      fontSize: 15
    }
  }, "Mara Ellis"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--peri-300)",
      fontSize: 13
    }
  }, "Betterwords member")))));
}

/* ---- Pricing ---- */
function Pricing() {
  const plans = [{
    name: "Free",
    price: "$0",
    note: "For the occasional hard message",
    feats: ["20 messages a month", "Tone & length tuning", "3 options per message"],
    cta: "Start free",
    variant: "outline"
  }, {
    name: "Plus",
    price: "$8",
    note: "For everything you send",
    feats: ["Unlimited messages", "Pros / cons / reaction analysis", "Your saved voice & tones", "Threads assist"],
    cta: "Go Plus",
    variant: "spark",
    featured: true
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "pricing",
    className: "section",
    style: {
      background: "var(--bg-elevated)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "center",
    style: {
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "site-kick"
  }, "Pricing"), /*#__PURE__*/React.createElement("h2", {
    className: "site-h2",
    style: {
      marginTop: 12
    }
  }, "Simple, like it should be.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 22,
      maxWidth: 760,
      margin: "0 auto"
    }
  }, plans.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      position: "relative",
      borderRadius: 26,
      padding: "32px 30px",
      background: p.featured ? "var(--ink-800)" : "var(--bg-base)",
      color: p.featured ? "var(--paper-0)" : "var(--text-body)",
      border: p.featured ? "0" : "1px solid var(--border-soft)",
      boxShadow: p.featured ? "var(--shadow-lg)" : "none"
    },
    className: p.featured ? "night" : ""
  }, p.featured ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 26,
      right: 26
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gradient",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 9,
    style: {
      color: "#fff"
    }
  }), "Popular")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 15,
      letterSpacing: ".02em"
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      margin: "12px 0 4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "serif",
    style: {
      fontSize: 52,
      fontWeight: 600,
      color: p.featured ? "var(--paper-0)" : "var(--text-strong)"
    }
  }, p.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      opacity: .7
    }
  }, "/ month")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      opacity: .8,
      marginBottom: 20
    }
  }, p.note), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 11,
      marginBottom: 26
    }
  }, p.feats.map(f => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 14.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: p.featured ? "var(--spark)" : "var(--mint-600)"
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 13
  })), f))), /*#__PURE__*/React.createElement(Button, {
    variant: p.variant,
    block: true
  }, p.cta))))));
}

/* ---- Footer ---- */
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--bg-base)",
      borderTop: "1px solid var(--border-hair)",
      padding: "56px 0 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 22
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-muted)",
      marginTop: 14,
      lineHeight: 1.6
    }
  }, "The right words, warmer. Betterwords helps you say the things that matter.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 56,
      flexWrap: "wrap"
    }
  }, [["Product", ["How it works", "Examples", "Pricing"]], ["Company", ["About", "Careers", "Blog"]], ["Legal", ["Privacy", "Terms"]]].map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    className: "site-kick",
    style: {
      marginBottom: 14
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      color: "var(--text-body)",
      fontSize: 14
    }
  }, i))))))), /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement(Divider, null)), /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      marginTop: 20,
      fontSize: 13,
      color: "var(--text-faint)"
    }
  }, "\xA9 2026 Betterwords.ai \xB7 Say it better \u2726"));
}
function Site() {
  React.useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), {
      threshold: 0.15
    });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(How, null), /*#__PURE__*/React.createElement(LiveExample, null), /*#__PURE__*/React.createElement(Quote, null), /*#__PURE__*/React.createElement(Pricing, null), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(Site, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/betterwords-web/Site.jsx", error: String((e && e.message) || e) }); }

__ds_ns.GradientField = __ds_scope.GradientField;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Sparkle = __ds_scope.Sparkle;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Segmented = __ds_scope.Segmented;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Slider = __ds_scope.Slider;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Sheet = __ds_scope.Sheet;

})();


/* ---- DraftPanel (appended 2026-07-18; source: components/surfaces/DraftPanel.jsx) ---- */
;(function () {
var __ds_ns = (window.BetterwordsAiDesignSystem_ac387e = window.BetterwordsAiDesignSystem_ac387e || {});
var React = window.React;

const STANCE = {
  soft: { label: "Gentle", bg: "var(--mint-200)", fg: "var(--mint-600)" },
  balanced: { label: "Balanced", bg: "var(--peri-200)", fg: "var(--blue-700)" },
  strong: { label: "Direct", bg: "var(--peach-200)", fg: "var(--peach-600)" }
};
function DraftPanel({
  meta,
  title,
  stance,
  stanceLabel,
  recommended = false,
  fields = [],
  footer,
  shadeSrc,
  scroll = false,
  letterRef,
  children,
  className = "",
  style,
  ...rest
}) {
  injectDraftPanelStyle();
  const st = stance ? STANCE[stance] || STANCE.balanced : null;
  const shadeStyle = shadeSrc ? { backgroundImage: `url(${shadeSrc})` } : null;
  return /* @__PURE__ */ React.createElement(
    "section",
    {
      className: ["bw-draftpanel", shadeSrc ? "has-shade" : "", className].join(" "),
      style: { ...shadeStyle, ...style },
      ...rest
    },
    meta != null && /* @__PURE__ */ React.createElement("div", { className: "bw-draftpanel-meta" }, meta),
    (title != null || st || recommended) && /* @__PURE__ */ React.createElement("div", { className: "bw-draftpanel-titlerow" }, title != null && /* @__PURE__ */ React.createElement("h2", { className: "bw-draftpanel-title" }, title), st && /* @__PURE__ */ React.createElement("span", { className: "bw-draftpanel-stance", style: { background: st.bg, color: st.fg } }, stanceLabel || st.label), recommended && /* @__PURE__ */ React.createElement("span", { className: "bw-draftpanel-rectag" }, "\u2726 Recommended")),
    /* @__PURE__ */ React.createElement("div", { ref: letterRef, className: "bw-draftpanel-letter" }, fields.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bw-draftpanel-fields" }, fields.map((f, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement("span", { className: "bw-draftpanel-fieldlabel" }, f.label), /* @__PURE__ */ React.createElement("span", { className: "bw-draftpanel-fieldvalue" }, f.value)))), /* @__PURE__ */ React.createElement("div", { className: ["bw-draftpanel-body", scroll ? "is-scroll" : ""].join(" ") }, children)),
    footer != null && /* @__PURE__ */ React.createElement("div", { className: "bw-draftpanel-footer" }, footer)
  );
}
let _draftPanelInjected = false;
function injectDraftPanelStyle() {
  if (_draftPanelInjected || typeof document === "undefined") return;
  if (document.getElementById("bw-draftpanel-style")) {
    _draftPanelInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = "bw-draftpanel-style";
  el.textContent = `
.bw-draftpanel{ background-color:rgba(252,253,255,.44);
  border:1px solid rgba(255,255,255,.7); border-radius:var(--radius-lg);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.2), var(--shadow-md);
  backdrop-filter:blur(12px) saturate(1.25); -webkit-backdrop-filter:blur(18px) saturate(1.5);
  padding:24px 16px 16px; }
/* optional pre-baked specular shade (white-on-transparent PNG) stretched
   over the tint, under the content, for a more vivid glass read */
.bw-draftpanel.has-shade{ background-size:100% 100%; background-repeat:no-repeat; }
.bw-draftpanel-meta{ font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-medium); color:var(--text-muted); margin:0 4px 12px; }
.bw-draftpanel-titlerow{ display:flex; align-items:center; gap:8px 12px; flex-wrap:wrap; margin:0 4px; }
.bw-draftpanel-title{ font-family:var(--font-display); font-variation-settings:var(--display-soft);
  font-weight:var(--weight-semibold); font-size:var(--text-lg); line-height:var(--leading-snug);
  color:var(--text-strong); margin:0; }
.bw-draftpanel-stance{ font-family:var(--font-sans); font-weight:var(--weight-bold);
  font-size:var(--text-3xs); letter-spacing:0.08em; text-transform:uppercase;
  padding:5px 12px; border-radius:var(--radius-pill); }
.bw-draftpanel-rectag{ display:inline-flex; background-image:var(--grad-aurora); color:#fff;
  font-family:var(--font-sans); font-size:9.5px; font-weight:var(--weight-bold);
  letter-spacing:0.1em; text-transform:uppercase; padding:5px 12px;
  border-radius:4px; box-shadow:var(--shadow-sm); }
.bw-draftpanel-letter{ position:relative; background:var(--paper-0);
  border:1px solid var(--border-hair); border-radius:var(--radius-md);
  box-shadow:var(--shadow-sm); padding:28px 40px 28px; margin-top:16px; }
.bw-draftpanel-fields{ display:grid; grid-template-columns:46px 1fr; gap:8px 16px;
  align-items:baseline; border-bottom:1px solid var(--border-soft);
  padding-bottom:16px; margin-bottom:24px;
  font-family:var(--font-sans); font-size:var(--text-sm); }
.bw-draftpanel-fieldlabel{ font-weight:var(--weight-semibold); font-size:var(--text-2xs);
  letter-spacing:var(--tracking-wider); text-transform:uppercase; color:var(--text-faint); }
.bw-draftpanel-fieldvalue{ color:var(--text-strong); font-weight:var(--weight-medium); }
.bw-draftpanel-body p{ margin:0; font-family:var(--font-sans); font-size:var(--text-base);
  line-height:var(--leading-loose); color:var(--text-body); }
.bw-draftpanel-body p + p{ margin-top:1.4em; }
.bw-draftpanel-body.is-scroll{ min-height:300px; max-height:54vh; overflow-y:auto; padding-right:14px; }
.bw-draftpanel-body.is-scroll::-webkit-scrollbar{ width:8px; }
.bw-draftpanel-body.is-scroll::-webkit-scrollbar-thumb{ background:var(--sand-2); border-radius:999px; }
.bw-draftpanel-body.is-scroll::-webkit-scrollbar-track{ background:transparent; }
.bw-draftpanel-footer{ margin-top:16px; }
`;
  document.head.appendChild(el);
  _draftPanelInjected = true;
}

__ds_ns.DraftPanel = DraftPanel;

})();
