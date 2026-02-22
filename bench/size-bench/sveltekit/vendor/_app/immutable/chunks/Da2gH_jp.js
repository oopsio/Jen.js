import {
  V as ee,
  A as J,
  W as te,
  X as Q,
  i as re,
  Y as q,
  Z as N,
  e as g,
  h as v,
  N as b,
  _ as B,
  j as se,
  Q as ie,
  a0 as ne,
  a1 as H,
  b as p,
  a as U,
  a2 as F,
  p as I,
  m as ae,
  a3 as P,
  a4 as oe,
  a5 as j,
  a6 as fe,
  a7 as he,
  a8 as A,
  a9 as D,
  aa as L,
  ab as le,
  ac as X,
  g as Z,
  ad as de,
  d as Y,
  q as O,
  ae as ce,
  af as _e,
  ag as T,
  E as ue,
  k as pe,
  ah as ge,
  ai as ve,
  aj as ye,
  ak as x,
  t as me,
  C as G,
  al as be,
  n as Ee,
  am as C,
  o as w,
  an as Te,
  ao as we,
  ap as Re,
  aq as Se,
  F as Ne,
  ar as Ae,
  as as De,
  I as Oe,
} from "./C9ZxGUY4.js";
import { b as ke } from "./H8nz2_yU.js";
function Fe(s) {
  let e = 0,
    r = Q(0),
    i;
  return () => {
    ee() &&
      (J(r),
      te(
        () => (
          e === 0 && (i = re(() => s(() => q(r)))),
          (e += 1),
          () => {
            N(() => {
              ((e -= 1), e === 0 && (i?.(), (i = void 0), q(r)));
            });
          }
        ),
      ));
  };
}
var Ie = ue | pe;
function Ye(s, e, r, i) {
  new xe(s, e, r, i);
}
class xe {
  parent;
  is_pending = !1;
  transform_error;
  #t;
  #g = v ? g : null;
  #i;
  #h;
  #e;
  #n = null;
  #r = null;
  #s = null;
  #a = null;
  #l = 0;
  #f = 0;
  #d = !1;
  #c = new Set();
  #_ = new Set();
  #o = null;
  #m = Fe(
    () => (
      (this.#o = Q(this.#l)),
      () => {
        this.#o = null;
      }
    ),
  );
  constructor(e, r, i, o) {
    ((this.#t = e),
      (this.#i = r),
      (this.#h = (t) => {
        var n = b;
        ((n.b = this), (n.f |= B), i(t));
      }),
      (this.parent = b.b),
      (this.transform_error = o ?? this.parent?.transform_error ?? ((t) => t)),
      (this.#e = se(() => {
        if (v) {
          const t = this.#g;
          ie();
          const n = t.data === ne;
          if (t.data.startsWith(H)) {
            const a = JSON.parse(t.data.slice(H.length));
            this.#E(a);
          } else n ? this.#T() : this.#b();
        } else this.#v();
      }, Ie)),
      v && (this.#t = g));
  }
  #b() {
    try {
      this.#n = p(() => this.#h(this.#t));
    } catch (e) {
      this.error(e);
    }
  }
  #E(e) {
    const r = this.#i.failed;
    r &&
      (this.#s = p(() => {
        r(
          this.#t,
          () => e,
          () => () => {},
        );
      }));
  }
  #T() {
    const e = this.#i.pending;
    e &&
      ((this.is_pending = !0),
      (this.#r = p(() => e(this.#t))),
      N(() => {
        var r = (this.#a = document.createDocumentFragment()),
          i = U();
        (r.append(i),
          (this.#n = this.#p(() => (F.ensure(), p(() => this.#h(i))))),
          this.#f === 0 &&
            (this.#t.before(r),
            (this.#a = null),
            I(this.#r, () => {
              this.#r = null;
            }),
            this.#u()));
      }));
  }
  #v() {
    try {
      if (
        ((this.is_pending = this.has_pending_snippet()),
        (this.#f = 0),
        (this.#l = 0),
        (this.#n = p(() => {
          this.#h(this.#t);
        })),
        this.#f > 0)
      ) {
        var e = (this.#a = document.createDocumentFragment());
        ae(this.#n, e);
        const r = this.#i.pending;
        this.#r = p(() => r(this.#t));
      } else this.#u();
    } catch (r) {
      this.error(r);
    }
  }
  #u() {
    this.is_pending = !1;
    for (const e of this.#c) (P(e, oe), j(e));
    for (const e of this.#_) (P(e, fe), j(e));
    (this.#c.clear(), this.#_.clear());
  }
  defer_effect(e) {
    he(e, this.#c, this.#_);
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#i.pending;
  }
  #p(e) {
    var r = b,
      i = X,
      o = Z;
    (A(this.#e), D(this.#e), L(this.#e.ctx));
    try {
      return e();
    } catch (t) {
      return (le(t), null);
    } finally {
      (A(r), D(i), L(o));
    }
  }
  #y(e) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(e);
      return;
    }
    ((this.#f += e),
      this.#f === 0 &&
        (this.#u(),
        this.#r &&
          I(this.#r, () => {
            this.#r = null;
          }),
        this.#a && (this.#t.before(this.#a), (this.#a = null))));
  }
  update_pending_count(e) {
    (this.#y(e),
      (this.#l += e),
      !(!this.#o || this.#d) &&
        ((this.#d = !0),
        N(() => {
          ((this.#d = !1), this.#o && de(this.#o, this.#l));
        })));
  }
  get_effect_pending() {
    return (this.#m(), J(this.#o));
  }
  error(e) {
    var r = this.#i.onerror;
    let i = this.#i.failed;
    if (!r && !i) throw e;
    (this.#n && (Y(this.#n), (this.#n = null)),
      this.#r && (Y(this.#r), (this.#r = null)),
      this.#s && (Y(this.#s), (this.#s = null)),
      v && (O(this.#g), ce(), O(_e())));
    var o = !1,
      t = !1;
    const n = () => {
        if (o) {
          ve();
          return;
        }
        ((o = !0),
          t && ge(),
          this.#s !== null &&
            I(this.#s, () => {
              this.#s = null;
            }),
          this.#p(() => {
            (F.ensure(), this.#v());
          }));
      },
      c = (a) => {
        try {
          ((t = !0), r?.(a, n), (t = !1));
        } catch (f) {
          T(f, this.#e && this.#e.parent);
        }
        i &&
          (this.#s = this.#p(() => {
            F.ensure();
            try {
              return p(() => {
                var f = b;
                ((f.b = this),
                  (f.f |= B),
                  i(
                    this.#t,
                    () => a,
                    () => n,
                  ));
              });
            } catch (f) {
              return (T(f, this.#e.parent), null);
            }
          }));
      };
    N(() => {
      var a;
      try {
        a = this.transform_error(e);
      } catch (f) {
        T(f, this.#e && this.#e.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof a.then == "function"
        ? a.then(c, (f) => T(f, this.#e && this.#e.parent))
        : c(a);
    });
  }
}
const Ce = ["touchstart", "touchmove"];
function Me(s) {
  return Ce.includes(s);
}
const R = Symbol("events"),
  Ve = new Set(),
  W = new Set();
let z = null;
function $(s) {
  var e = this,
    r = e.ownerDocument,
    i = s.type,
    o = s.composedPath?.() || [],
    t = o[0] || s.target;
  z = s;
  var n = 0,
    c = z === s && s[R];
  if (c) {
    var a = o.indexOf(c);
    if (a !== -1 && (e === document || e === window)) {
      s[R] = e;
      return;
    }
    var f = o.indexOf(e);
    if (f === -1) return;
    a <= f && (n = a);
  }
  if (((t = o[n] || s.target), t !== e)) {
    ye(s, "currentTarget", {
      configurable: !0,
      get() {
        return t || r;
      },
    });
    var y = X,
      E = b;
    (D(null), A(null));
    try {
      for (var u, l = []; t !== null; ) {
        var h = t.assignedSlot || t.parentNode || t.host || null;
        try {
          var d = t[R]?.[i];
          d != null && (!t.disabled || s.target === t) && d.call(t, s);
        } catch (_) {
          u ? l.push(_) : (u = _);
        }
        if (s.cancelBubble || h === e || h === null) break;
        t = h;
      }
      if (u) {
        for (let _ of l)
          queueMicrotask(() => {
            throw _;
          });
        throw u;
      }
    } finally {
      ((s[R] = e), delete s.currentTarget, D(y), A(E));
    }
  }
}
function Pe(s, e) {
  var r = e == null ? "" : typeof e == "object" ? e + "" : e;
  r !== (s.__t ??= s.nodeValue) && ((s.__t = r), (s.nodeValue = r + ""));
}
function qe(s, e) {
  return K(s, e);
}
function je(s, e) {
  (x(), (e.intro = e.intro ?? !1));
  const r = e.target,
    i = v,
    o = g;
  try {
    for (var t = me(r); t && (t.nodeType !== G || t.data !== be); ) t = Ee(t);
    if (!t) throw C;
    (w(!0), O(t));
    const n = K(s, { ...e, anchor: t });
    return (w(!1), n);
  } catch (n) {
    if (
      n instanceof Error &&
      n.message
        .split(
          `
`,
        )
        .some((c) => c.startsWith("https://svelte.dev/e/"))
    )
      throw n;
    return (
      n !== C && console.warn("Failed to hydrate: ", n),
      e.recover === !1 && Te(),
      x(),
      we(r),
      w(!1),
      qe(s, e)
    );
  } finally {
    (w(i), O(o));
  }
}
const S = new Map();
function K(
  s,
  {
    target: e,
    anchor: r,
    props: i = {},
    events: o,
    context: t,
    intro: n = !0,
    transformError: c,
  },
) {
  x();
  var a = void 0,
    f = Re(() => {
      var y = r ?? e.appendChild(U());
      Ye(
        y,
        { pending: () => {} },
        (l) => {
          Ne({});
          var h = Z;
          if (
            (t && (h.c = t),
            o && (i.$$events = o),
            v && ke(l, null),
            (a = s(l, i) || {}),
            v &&
              ((b.nodes.end = g),
              g === null || g.nodeType !== G || g.data !== Ae))
          )
            throw (De(), C);
          Oe();
        },
        c,
      );
      var E = new Set(),
        u = (l) => {
          for (var h = 0; h < l.length; h++) {
            var d = l[h];
            if (!E.has(d)) {
              E.add(d);
              var _ = Me(d);
              for (const k of [e, document]) {
                var m = S.get(k);
                m === void 0 && ((m = new Map()), S.set(k, m));
                var V = m.get(d);
                V === void 0
                  ? (k.addEventListener(d, $, { passive: _ }), m.set(d, 1))
                  : m.set(d, V + 1);
              }
            }
          }
        };
      return (
        u(Se(Ve)),
        W.add(u),
        () => {
          for (var l of E)
            for (const _ of [e, document]) {
              var h = S.get(_),
                d = h.get(l);
              --d == 0
                ? (_.removeEventListener(l, $),
                  h.delete(l),
                  h.size === 0 && S.delete(_))
                : h.set(l, d);
            }
          (W.delete(u), y !== r && y.parentNode?.removeChild(y));
        }
      );
    });
  return (M.set(a, f), a);
}
let M = new WeakMap();
function Le(s, e) {
  const r = M.get(s);
  return r ? (M.delete(s), r(e)) : Promise.resolve();
}
export { je as h, qe as m, Pe as s, Le as u };
