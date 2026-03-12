import { fileURLToPath as t } from "node:url";
import { posix as e, win32 as i } from "node:path";
import { fileURLToPath as s } from "node:url";
import { lstatSync as h, readdir as r, readdirSync as n, readlinkSync as o, realpathSync as a, } from "fs";
import * as l from "node:fs";
import { lstat as c, readdir as u, readlink as p, realpath as d, } from "node:fs/promises";
import { EventEmitter as f } from "node:events";
import g from "node:stream";
import { StringDecoder as m } from "node:string_decoder";
var Gt = (t, e, i) => {
    let s = t instanceof RegExp ? ce(t, i) : t, h = e instanceof RegExp ? ce(e, i) : e, r = null !== s && null != h && ss(s, h, i);
    return (r && {
        start: r[0],
        end: r[1],
        pre: i.slice(0, r[0]),
        body: i.slice(r[0] + s.length, r[1]),
        post: i.slice(r[1] + h.length),
    });
}, ce = (t, e) => {
    let i = e.match(t);
    return i ? i[0] : null;
}, ss = (t, e, i) => {
    let s, h, r, n, o, a = i.indexOf(t), l = i.indexOf(e, a + 1), c = a;
    if (a >= 0 && l > 0) {
        if (t === e)
            return [a, l];
        for (s = [], r = i.length; c >= 0 && !o;) {
            if (c === a)
                (s.push(c), (a = i.indexOf(t, c + 1)));
            else if (1 === s.length) {
                let u = s.pop();
                void 0 !== u && (o = [u, l]);
            }
            else
                (void 0 !== (h = s.pop()) && h < r && ((r = h), (n = l)),
                    (l = i.indexOf(e, c + 1)));
            c = a < l && a >= 0 ? a : l;
        }
        s.length && void 0 !== n && (o = [r, n]);
    }
    return o;
}, fe = "\0SLASH" + Math.random() + "\0", ue = "\0OPEN" + Math.random() + "\0", qt = "\0CLOSE" + Math.random() + "\0", de = "\0COMMA" + Math.random() + "\0", pe = "\0PERIOD" + Math.random() + "\0", is = RegExp(fe, "g"), rs = RegExp(ue, "g"), ns = RegExp(qt, "g"), os = RegExp(de, "g"), hs = RegExp(pe, "g"), as = /\\\\/g, ls = /\\{/g, cs = /\\}/g, fs = /\\,/g, us = /\\./g, ds = 1e5;
function Ht(t) {
    return isNaN(t) ? t.charCodeAt(0) : parseInt(t, 10);
}
function ps(t) {
    return t
        .replace(as, fe)
        .replace(ls, ue)
        .replace(cs, qt)
        .replace(fs, de)
        .replace(us, pe);
}
function ms(t) {
    return t
        .replace(is, "\\")
        .replace(rs, "{")
        .replace(ns, "}")
        .replace(os, ",")
        .replace(hs, ".");
}
function me(t) {
    if (!t)
        return [""];
    let e = [], i = Gt("{", "}", t);
    if (!i)
        return t.split(",");
    let { pre: s, body: h, post: r } = i, n = s.split(",");
    n[n.length - 1] += "{" + h + "}";
    let o = me(r);
    return (r.length && ((n[n.length - 1] += o.shift()), n.push.apply(n, o)),
        e.push.apply(e, n),
        e);
}
function ge(t, e = {}) {
    if (!t)
        return [];
    let { max: i = ds } = e;
    return ("{}" === t.slice(0, 2) && (t = "\\{\\}" + t.slice(2)),
        ht(ps(t), i, !0).map(ms));
}
function gs(t) {
    return "{" + t + "}";
}
function ws(t) {
    return /^-?0\d/.test(t);
}
function ys(t, e) {
    return t <= e;
}
function bs(t, e) {
    return t >= e;
}
function ht(t, e, i) {
    let s = [], h = Gt("{", "}", t);
    if (!h)
        return [t];
    let r = h.pre, n = h.post.length ? ht(h.post, e, !1) : [""];
    if (/\$$/.test(h.pre))
        for (let o = 0; o < n.length && o < e; o++) {
            let a = r + "{" + h.body + "}" + n[o];
            s.push(a);
        }
    else {
        let l = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(h.body), c = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(h.body), u = l || c, p = h.body.indexOf(",") >= 0;
        if (!u && !p)
            return h.post.match(/,(?!,).*\}/)
                ? ht((t = h.pre + "{" + h.body + qt + h.post), e, !0)
                : [t];
        let d;
        if (u)
            d = h.body.split(/\.\./);
        else if (1 === (d = me(h.body)).length &&
            void 0 !== d[0] &&
            1 === (d = ht(d[0], e, !1).map(gs)).length)
            return n.map((t) => h.pre + d[0] + t);
        let f;
        if (u && void 0 !== d[0] && void 0 !== d[1]) {
            let g = Ht(d[0]), m = Ht(d[1]), w = Math.max(d[0].length, d[1].length), $ = 3 === d.length && void 0 !== d[2] ? Math.abs(Ht(d[2])) : 1, y = ys;
            m < g && (($ *= -1), (y = bs));
            let b = d.some(ws);
            f = [];
            for (let S = g; y(S, m); S += $) {
                let E;
                if (c)
                    "\\" === (E = String.fromCharCode(S)) && (E = "");
                else if (((E = String(S)), b)) {
                    let z = w - E.length;
                    if (z > 0) {
                        let Z = Array(z + 1).join("0");
                        E = S < 0 ? "-" + Z + E.slice(1) : Z + E;
                    }
                }
                f.push(E);
            }
        }
        else {
            f = [];
            for (let J = 0; J < d.length; J++)
                f.push.apply(f, ht(d[J], e, !1));
        }
        for (let th = 0; th < f.length; th++)
            for (let tr = 0; tr < n.length && s.length < e; tr++) {
                let tn = r + f[th] + n[tr];
                (!i || u || tn) && s.push(tn);
            }
    }
    return s;
}
var at = (t) => {
    if ("string" != typeof t)
        throw TypeError("invalid pattern");
    if (t.length > 65536)
        throw TypeError("pattern is too long");
}, Ss = {
    "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", !0],
    "[:alpha:]": ["\\p{L}\\p{Nl}", !0],
    "[:ascii:]": ["\\x00-\\x7f", !1],
    "[:blank:]": ["\\p{Zs}\\t", !0],
    "[:cntrl:]": ["\\p{Cc}", !0],
    "[:digit:]": ["\\p{Nd}", !0],
    "[:graph:]": ["\\p{Z}\\p{C}", !0, !0],
    "[:lower:]": ["\\p{Ll}", !0],
    "[:print:]": ["\\p{C}", !0],
    "[:punct:]": ["\\p{P}", !0],
    "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", !0],
    "[:upper:]": ["\\p{Lu}", !0],
    "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", !0],
    "[:xdigit:]": ["A-Fa-f0-9", !1],
}, lt = (t) => t.replace(/[[\]\\-]/g, "\\$&"), Es = (t) => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), we = (t) => t.join(""), ye = (t, e) => {
    let i = e;
    if ("[" !== t.charAt(i))
        throw Error("not in a brace expression");
    let s = [], h = [], r = i + 1, n = !1, o = !1, a = !1, l = !1, c = i, u = "";
    t: for (; r < t.length;) {
        let p = t.charAt(r);
        if (("!" === p || "^" === p) && r === i + 1) {
            ((l = !0), r++);
            continue;
        }
        if ("]" === p && n && !a) {
            c = r + 1;
            break;
        }
        if (((n = !0), "\\" === p && !a)) {
            ((a = !0), r++);
            continue;
        }
        if ("[" === p && !a) {
            for (let [d, [f, g, m]] of Object.entries(Ss))
                if (t.startsWith(d, r)) {
                    if (u)
                        return ["$.", !1, t.length - i, !0];
                    ((r += d.length), m ? h.push(f) : s.push(f), (o = o || g));
                    continue t;
                }
        }
        if (((a = !1), u)) {
            (p > u ? s.push(lt(u) + "-" + lt(p)) : p === u && s.push(lt(p)),
                (u = ""),
                r++);
            continue;
        }
        if (t.startsWith("-]", r + 1)) {
            (s.push(lt(p + "-")), (r += 2));
            continue;
        }
        if (t.startsWith("-", r + 1)) {
            ((u = p), (r += 2));
            continue;
        }
        (s.push(lt(p)), r++);
    }
    if (c < r)
        return ["", !1, 0, !1];
    if (!s.length && !h.length)
        return ["$.", !1, t.length - i, !0];
    if (0 === h.length && 1 === s.length && /^\\?.$/.test(s[0]) && !l)
        return [Es(2 === s[0].length ? s[0].slice(-1) : s[0]), !1, c - i, !1];
    let w = "[" + (l ? "^" : "") + we(s) + "]", $ = "[" + (l ? "" : "^") + we(h) + "]";
    return [
        s.length && h.length ? "(" + w + "|" + $ + ")" : s.length ? w : $,
        o,
        c - i,
        !0,
    ];
}, W = (t, { windowsPathsNoEscape: e = !1, magicalBraces: i = !0 } = {}) => i
    ? e
        ? t.replace(/\[([^\/\\])\]/g, "$1")
        : t
            .replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2")
            .replace(/\\([^\/])/g, "$1")
    : e
        ? t.replace(/\[([^\/\\{}])\]/g, "$1")
        : t
            .replace(/((?!\\).|^)\[([^\/\\{}])\]/g, "$1$2")
            .replace(/\\([^\/{}])/g, "$1"), xs = new Set(["!", "?", "+", "*", "@"]), be = (t) => xs.has(t), vs = "(?!(?:^|/)\\.\\.?(?:$|/))", Ct = "(?!\\.)", Cs = new Set(["[", "."]), Ts = new Set(["..", "."]), As = new Set("().*{}+?[]^$\\!"), ks = (t) => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), Kt = "[^/]", Se = Kt + "*?", Ee = Kt + "+?", Q = class t {
    type;
    #a;
    #b;
    #c = !1;
    #d = [];
    #e;
    #f;
    #g;
    #h = !1;
    #i;
    #j;
    #k = !1;
    constructor(t, e, i = {}) {
        ((this.type = t),
            t && (this.#b = !0),
            (this.#e = e),
            (this.#a = this.#e ? this.#e.#a : this),
            (this.#i = this.#a === this ? i : this.#a.#i),
            (this.#g = this.#a === this ? [] : this.#a.#g),
            "!" !== t || this.#a.#h || this.#g.push(this),
            (this.#f = this.#e ? this.#e.#d.length : 0));
    }
    get hasMagic() {
        if (void 0 !== this.#b)
            return this.#b;
        for (let t of this.#d)
            if ("string" != typeof t && (t.type || t.hasMagic))
                return (this.#b = !0);
        return this.#b;
    }
    toString() {
        return void 0 !== this.#j
            ? this.#j
            : this.type
                ? (this.#j =
                    this.type + "(" + this.#d.map((t) => String(t)).join("|") + ")")
                : (this.#j = this.#d.map((t) => String(t)).join(""));
    }
    #l() {
        if (this !== this.#a)
            throw Error("should only call on root");
        if (this.#h)
            return this;
        (this.toString(), (this.#h = !0));
        let e;
        for (; (e = this.#g.pop());) {
            if ("!" !== e.type)
                continue;
            let i = e, s = i.#e;
            for (; s;) {
                for (let h = i.#f + 1; !s.type && h < s.#d.length; h++)
                    for (let r of e.#d) {
                        if ("string" == typeof r)
                            throw Error("string part in extglob AST??");
                        r.copyIn(s.#d[h]);
                    }
                s = (i = s).#e;
            }
        }
        return this;
    }
    push(...e) {
        for (let i of e)
            if ("" !== i) {
                if ("string" != typeof i && !(i instanceof t && i.#e === this))
                    throw Error("invalid part: " + i);
                this.#d.push(i);
            }
    }
    toJSON() {
        let t = null === this.type
            ? this.#d.slice().map((t) => ("string" == typeof t ? t : t.toJSON()))
            : [this.type, ...this.#d.map((t) => t.toJSON())];
        return (this.isStart() && !this.type && t.unshift([]),
            this.isEnd() &&
                (this === this.#a || (this.#a.#h && this.#e?.type === "!")) &&
                t.push({}),
            t);
    }
    isStart() {
        if (this.#a === this)
            return !0;
        if (!this.#e?.isStart())
            return !1;
        if (0 === this.#f)
            return !0;
        let e = this.#e;
        for (let i = 0; i < this.#f; i++) {
            let s = e.#d[i];
            if (!(s instanceof t && "!" === s.type))
                return !1;
        }
        return !0;
    }
    isEnd() {
        if (this.#a === this || this.#e?.type === "!")
            return !0;
        if (!this.#e?.isEnd())
            return !1;
        if (!this.type)
            return this.#e?.isEnd();
        let t = this.#e ? this.#e.#d.length : 0;
        return this.#f === t - 1;
    }
    copyIn(t) {
        "string" == typeof t ? this.push(t) : this.push(t.clone(this));
    }
    clone(e) {
        let i = new t(this.type, e);
        for (let s of this.#d)
            i.copyIn(s);
        return i;
    }
    static #m(n, o, a, l) {
        let c = !1, u = !1, p = -1, d = !1;
        if (null === o.type) {
            let f = a, g = "";
            for (; f < n.length;) {
                let m = n.charAt(f++);
                if (c || "\\" === m) {
                    ((c = !c), (g += m));
                    continue;
                }
                if (u) {
                    (f === p + 1
                        ? ("^" === m || "!" === m) && (d = !0)
                        : "]" !== m || (f === p + 2 && d) || (u = !1),
                        (g += m));
                    continue;
                }
                if ("[" === m) {
                    ((u = !0), (p = f), (d = !1), (g += m));
                    continue;
                }
                if (!l.noext && be(m) && "(" === n.charAt(f)) {
                    (o.push(g), (g = ""));
                    let w = new t(m, o);
                    ((f = t.#m(n, w, f, l)), o.push(w));
                    continue;
                }
                g += m;
            }
            return (o.push(g), f);
        }
        let $ = a + 1, y = new t(null, o), b = [], S = "";
        for (; $ < n.length;) {
            let E = n.charAt($++);
            if (c || "\\" === E) {
                ((c = !c), (S += E));
                continue;
            }
            if (u) {
                ($ === p + 1
                    ? ("^" === E || "!" === E) && (d = !0)
                    : "]" !== E || ($ === p + 2 && d) || (u = !1),
                    (S += E));
                continue;
            }
            if ("[" === E) {
                ((u = !0), (p = $), (d = !1), (S += E));
                continue;
            }
            if (be(E) && "(" === n.charAt($)) {
                (y.push(S), (S = ""));
                let z = new t(E, y);
                (y.push(z), ($ = t.#m(n, z, $, l)));
                continue;
            }
            if ("|" === E) {
                (y.push(S), (S = ""), b.push(y), (y = new t(null, o)));
                continue;
            }
            if (")" === E)
                return ("" === S && 0 === o.#d.length && (o.#k = !0),
                    y.push(S),
                    (S = ""),
                    o.push(...b, y),
                    $);
            S += E;
        }
        return ((o.type = null),
            (o.#b = void 0),
            (o.#d = [n.substring(a - 1)]),
            $);
    }
    static fromGlob(e, i = {}) {
        let s = new t(null, void 0, i);
        return (t.#m(e, s, 0, i), s);
    }
    toMMPattern() {
        if (this !== this.#a)
            return this.#a.toMMPattern();
        let t = this.toString(), [e, i, s, h] = this.toRegExpSource();
        return s ||
            this.#b ||
            (this.#i.nocase &&
                !this.#i.nocaseMagicOnly &&
                t.toUpperCase() !== t.toLowerCase())
            ? Object.assign(RegExp(`^${e}$`, (this.#i.nocase ? "i" : "") + (h ? "u" : "")), { _src: e, _glob: t })
            : i;
    }
    get options() {
        return this.#i;
    }
    toRegExpSource(e) {
        let i = e ?? !!this.#i.dot;
        if ((this.#a === this && this.#l(), !this.type)) {
            let s = this.isStart() &&
                this.isEnd() &&
                !this.#d.some((t) => "string" != typeof t), h = this.#d
                .map((i) => {
                let [h, r, n, o] = "string" == typeof i
                    ? t.#n(i, this.#b, s)
                    : i.toRegExpSource(e);
                return ((this.#b = this.#b || n), (this.#c = this.#c || o), h);
            })
                .join(""), r = "";
            if (this.isStart() &&
                "string" == typeof this.#d[0] &&
                !(1 === this.#d.length && Ts.has(this.#d[0]))) {
                let n = Cs, o = (i && n.has(h.charAt(0))) ||
                    (h.startsWith("\\.") && n.has(h.charAt(2))) ||
                    (h.startsWith("\\.\\.") && n.has(h.charAt(4))), a = !i && !e && n.has(h.charAt(0));
                r = o ? vs : a ? Ct : "";
            }
            let l = "";
            return (this.isEnd() &&
                this.#a.#h &&
                this.#e?.type === "!" &&
                (l = "(?:$|\\/)"),
                [r + h + l, W(h), (this.#b = !!this.#b), this.#c]);
        }
        let c = "*" === this.type || "+" === this.type, u = "!" === this.type ? "(?:(?!(?:" : "(?:", p = this.#o(i);
        if (this.isStart() && this.isEnd() && !p && "!" !== this.type) {
            let d = this.toString();
            return ((this.#d = [d]),
                (this.type = null),
                (this.#b = void 0),
                [d, W(this.toString()), !1, !1]);
        }
        let f = !c || e || i || !Ct ? "" : this.#o(!0);
        (f === p && (f = ""), f && (p = `(?:${p})(?:${f})*?`));
        let g = "";
        if ("!" === this.type && this.#k)
            g = (this.isStart() && !i ? Ct : "") + Ee;
        else {
            let m = "!" === this.type
                ? "))" + (!this.isStart() || i || e ? "" : Ct) + Se + ")"
                : "@" === this.type
                    ? ")"
                    : "?" === this.type
                        ? ")?"
                        : "+" === this.type && f
                            ? ")"
                            : "*" === this.type && f
                                ? ")?"
                                : `)${this.type}`;
            g = u + p + m;
        }
        return [g, W(p), (this.#b = !!this.#b), this.#c];
    }
    #o(Z) {
        return this.#d
            .map((t) => {
            if ("string" == typeof t)
                throw Error("string type in extglob ast??");
            let [e, i, s, h] = t.toRegExpSource(Z);
            return ((this.#c = this.#c || h), e);
        })
            .filter((t) => !(this.isStart() && this.isEnd()) || !!t)
            .join("|");
    }
    static #n(J, th, tr = !1) {
        let tn = !1, to = "", ta = !1, tl = !1;
        for (let tc = 0; tc < J.length; tc++) {
            let tu = J.charAt(tc);
            if (tn) {
                ((tn = !1), (to += (As.has(tu) ? "\\" : "") + tu));
                continue;
            }
            if ("*" === tu) {
                if (tl)
                    continue;
                ((tl = !0), (to += tr && /^[*]+$/.test(J) ? Ee : Se), (th = !0));
                continue;
            }
            if (((tl = !1), "\\" === tu)) {
                tc === J.length - 1 ? (to += "\\\\") : (tn = !0);
                continue;
            }
            if ("[" === tu) {
                let [tp, td, tf, tg] = ye(J, tc);
                if (tf) {
                    ((to += tp), (ta = ta || td), (tc += tf - 1), (th = th || tg));
                    continue;
                }
            }
            if ("?" === tu) {
                ((to += Kt), (th = !0));
                continue;
            }
            to += ks(tu);
        }
        return [to, W(J), !!th, ta];
    }
}, tt = (t, { windowsPathsNoEscape: e = !1, magicalBraces: i = !1 } = {}) => i
    ? e
        ? t.replace(/[?*()[\]{}]/g, "[$&]")
        : t.replace(/[?*()[\]\\{}]/g, "\\$&")
    : e
        ? t.replace(/[?*()[\]]/g, "[$&]")
        : t.replace(/[?*()[\]\\]/g, "\\$&"), O = (t, e, i = {}) => (at(e),
    (!!i.nocomment || "#" !== e.charAt(0)) && new D(e, i).match(t)), Rs = /^\*+([^+@!?\*\[\(]*)$/, Os = (t) => (e) => !e.startsWith(".") && e.endsWith(t), Fs = (t) => (e) => e.endsWith(t), Ds = (t) => ((t = t.toLowerCase()),
    (e) => !e.startsWith(".") && e.toLowerCase().endsWith(t)), Ms = (t) => ((t = t.toLowerCase()), (e) => e.toLowerCase().endsWith(t)), Ns = /^\*+\.\*+$/, _s = (t) => !t.startsWith(".") && t.includes("."), Ls = (t) => "." !== t && ".." !== t && t.includes("."), Ws = /^\.\*+$/, Ps = (t) => "." !== t && ".." !== t && t.startsWith("."), js = /^\*+$/, Is = (t) => 0 !== t.length && !t.startsWith("."), zs = (t) => 0 !== t.length && "." !== t && ".." !== t, Bs = /^\?+([^+@!?\*\[\(]*)?$/, Us = ([t, e = ""]) => {
    let i = Ce([t]);
    return e
        ? ((e = e.toLowerCase()), (t) => i(t) && t.toLowerCase().endsWith(e))
        : i;
}, $s = ([t, e = ""]) => {
    let i = Te([t]);
    return e
        ? ((e = e.toLowerCase()), (t) => i(t) && t.toLowerCase().endsWith(e))
        : i;
}, Gs = ([t, e = ""]) => {
    let i = Te([t]);
    return e ? (t) => i(t) && t.endsWith(e) : i;
}, Hs = ([t, e = ""]) => {
    let i = Ce([t]);
    return e ? (t) => i(t) && t.endsWith(e) : i;
}, Ce = ([t]) => {
    let e = t.length;
    return (t) => t.length === e && !t.startsWith(".");
}, Te = ([t]) => {
    let e = t.length;
    return (t) => t.length === e && "." !== t && ".." !== t;
}, Ae = "object" == typeof process && process
    ? ("object" == typeof process.env &&
        process.env &&
        process.env.__MINIMATCH_TESTING_PLATFORM__) ||
        process.platform
    : "posix", xe = { win32: { sep: "\\" }, posix: { sep: "/" } }, qs = "win32" === Ae ? xe.win32.sep : xe.posix.sep;
O.sep = qs;
var A = Symbol("globstar **");
O.GLOBSTAR = A;
var Ks = "[^/]", Vs = Ks + "*?", Ys = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?", Xs = "(?:(?!(?:\\/|^)\\.).)*?", Js = (t, e = {}) => (i) => O(i, t, e);
O.filter = Js;
var N = (t, e = {}) => Object.assign({}, t, e), Zs = (t) => {
    if (!t || "object" != typeof t || !Object.keys(t).length)
        return O;
    let e = O;
    return Object.assign((i, s, h = {}) => e(i, s, N(t, h)), {
        Minimatch: class extends e.Minimatch {
            constructor(e, i = {}) {
                super(e, N(t, i));
            }
            static defaults(i) {
                return e.defaults(N(t, i)).Minimatch;
            }
        },
        AST: class extends e.AST {
            constructor(e, i, s = {}) {
                super(e, i, N(t, s));
            }
            static fromGlob(i, s = {}) {
                return e.AST.fromGlob(i, N(t, s));
            }
        },
        unescape: (i, s = {}) => e.unescape(i, N(t, s)),
        escape: (i, s = {}) => e.escape(i, N(t, s)),
        filter: (i, s = {}) => e.filter(i, N(t, s)),
        defaults: (i) => e.defaults(N(t, i)),
        makeRe: (i, s = {}) => e.makeRe(i, N(t, s)),
        braceExpand: (i, s = {}) => e.braceExpand(i, N(t, s)),
        match: (i, s, h = {}) => e.match(i, s, N(t, h)),
        sep: e.sep,
        GLOBSTAR: A,
    });
};
O.defaults = Zs;
var ke = (t, e = {}) => (at(t),
    e.nobrace || !/\{(?:(?!\{).)*\}/.test(t)
        ? [t]
        : ge(t, { max: e.braceExpandMax }));
O.braceExpand = ke;
var Qs = (t, e = {}) => new D(t, e).makeRe();
O.makeRe = Qs;
var ti = (t, e, i = {}) => {
    let s = new D(e, i);
    return ((t = t.filter((t) => s.match(t))),
        s.options.nonull && !t.length && t.push(e),
        t);
};
O.match = ti;
var ve = /[?*]|[+@!]\(.*?\)|\[|\]/, ei = (t) => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), D = class {
    options;
    set;
    pattern;
    windowsPathsNoEscape;
    nonegate;
    negate;
    comment;
    empty;
    preserveMultipleSlashes;
    partial;
    globSet;
    globParts;
    nocase;
    isWindows;
    platform;
    windowsNoMagicRoot;
    regexp;
    constructor(t, e = {}) {
        (at(t),
            (e = e || {}),
            (this.options = e),
            (this.pattern = t),
            (this.platform = e.platform || Ae),
            (this.isWindows = "win32" === this.platform));
        let i = "allowWindowsEscape";
        ((this.windowsPathsNoEscape = !!e.windowsPathsNoEscape || !1 === e[i]),
            this.windowsPathsNoEscape &&
                (this.pattern = this.pattern.replace(/\\/g, "/")),
            (this.preserveMultipleSlashes = !!e.preserveMultipleSlashes),
            (this.regexp = null),
            (this.negate = !1),
            (this.nonegate = !!e.nonegate),
            (this.comment = !1),
            (this.empty = !1),
            (this.partial = !!e.partial),
            (this.nocase = !!this.options.nocase),
            (this.windowsNoMagicRoot =
                void 0 !== e.windowsNoMagicRoot
                    ? e.windowsNoMagicRoot
                    : !!(this.isWindows && this.nocase)),
            (this.globSet = []),
            (this.globParts = []),
            (this.set = []),
            this.make());
    }
    hasMagic() {
        if (this.options.magicalBraces && this.set.length > 1)
            return !0;
        for (let t of this.set)
            for (let e of t)
                if ("string" != typeof e)
                    return !0;
        return !1;
    }
    debug(...t) { }
    make() {
        let t = this.pattern, e = this.options;
        if (!e.nocomment && "#" === t.charAt(0)) {
            this.comment = !0;
            return;
        }
        if (!t) {
            this.empty = !0;
            return;
        }
        (this.parseNegate(),
            (this.globSet = [...new Set(this.braceExpand())]),
            e.debug && (this.debug = (...t) => console.error(...t)),
            this.debug(this.pattern, this.globSet));
        let i = this.globSet.map((t) => this.slashSplit(t));
        ((this.globParts = this.preprocess(i)),
            this.debug(this.pattern, this.globParts));
        let s = this.globParts.map((t, e, i) => {
            if (this.isWindows && this.windowsNoMagicRoot) {
                let s = "" === t[0] &&
                    "" === t[1] &&
                    ("?" === t[2] || !ve.test(t[2])) &&
                    !ve.test(t[3]), h = /^[a-z]:/i.test(t[0]);
                if (s)
                    return [...t.slice(0, 4), ...t.slice(4).map((t) => this.parse(t))];
                if (h)
                    return [t[0], ...t.slice(1).map((t) => this.parse(t))];
            }
            return t.map((t) => this.parse(t));
        });
        if ((this.debug(this.pattern, s),
            (this.set = s.filter((t) => -1 === t.indexOf(!1))),
            this.isWindows))
            for (let h = 0; h < this.set.length; h++) {
                let r = this.set[h];
                "" === r[0] &&
                    "" === r[1] &&
                    "?" === this.globParts[h][2] &&
                    "string" == typeof r[3] &&
                    /^[a-z]:$/i.test(r[3]) &&
                    (r[2] = "?");
            }
        this.debug(this.pattern, this.set);
    }
    preprocess(t) {
        if (this.options.noglobstar)
            for (let e = 0; e < t.length; e++)
                for (let i = 0; i < t[e].length; i++)
                    "**" === t[e][i] && (t[e][i] = "*");
        let { optimizationLevel: s = 1 } = this.options;
        return (s >= 2
            ? ((t = this.firstPhasePreProcess(t)),
                (t = this.secondPhasePreProcess(t)))
            : (t =
                s >= 1
                    ? this.levelOneOptimize(t)
                    : this.adjascentGlobstarOptimize(t)),
            t);
    }
    adjascentGlobstarOptimize(t) {
        return t.map((t) => {
            let e = -1;
            for (; -1 !== (e = t.indexOf("**", e + 1));) {
                let i = e;
                for (; "**" === t[i + 1];)
                    i++;
                i !== e && t.splice(e, i - e);
            }
            return t;
        });
    }
    levelOneOptimize(t) {
        return t.map((t) => 0 ===
            (t = t.reduce((t, e) => {
                let i = t[t.length - 1];
                return "**" === e && "**" === i
                    ? t
                    : ".." === e && i && ".." !== i && "." !== i && "**" !== i
                        ? (t.pop(), t)
                        : (t.push(e), t);
            }, [])).length
            ? [""]
            : t);
    }
    levelTwoFileOptimize(t) {
        Array.isArray(t) || (t = this.slashSplit(t));
        let e = !1;
        do {
            if (((e = !1), !this.preserveMultipleSlashes)) {
                for (let i = 1; i < t.length - 1; i++) {
                    let s = t[i];
                    (1 === i && "" === s && "" === t[0]) ||
                        (("." === s || "" === s) && ((e = !0), t.splice(i, 1), i--));
                }
                "." === t[0] &&
                    2 === t.length &&
                    ("." === t[1] || "" === t[1]) &&
                    ((e = !0), t.pop());
            }
            let h = 0;
            for (; -1 !== (h = t.indexOf("..", h + 1));) {
                let r = t[h - 1];
                r &&
                    "." !== r &&
                    ".." !== r &&
                    "**" !== r &&
                    ((e = !0), t.splice(h - 1, 2), (h -= 2));
            }
        } while (e);
        return 0 === t.length ? [""] : t;
    }
    firstPhasePreProcess(t) {
        let e = !1;
        do
            for (let i of ((e = !1), t)) {
                let s = -1;
                for (; -1 !== (s = i.indexOf("**", s + 1));) {
                    let h = s;
                    for (; "**" === i[h + 1];)
                        h++;
                    h > s && i.splice(s + 1, h - s);
                    let r = i[s + 1], n = i[s + 2], o = i[s + 3];
                    if (".." !== r ||
                        !n ||
                        "." === n ||
                        ".." === n ||
                        !o ||
                        "." === o ||
                        ".." === o)
                        continue;
                    ((e = !0), i.splice(s, 1));
                    let a = i.slice(0);
                    ((a[s] = "**"), t.push(a), s--);
                }
                if (!this.preserveMultipleSlashes) {
                    for (let l = 1; l < i.length - 1; l++) {
                        let c = i[l];
                        (1 === l && "" === c && "" === i[0]) ||
                            (("." === c || "" === c) && ((e = !0), i.splice(l, 1), l--));
                    }
                    "." === i[0] &&
                        2 === i.length &&
                        ("." === i[1] || "" === i[1]) &&
                        ((e = !0), i.pop());
                }
                let u = 0;
                for (; -1 !== (u = i.indexOf("..", u + 1));) {
                    let p = i[u - 1];
                    if (p && "." !== p && ".." !== p && "**" !== p) {
                        e = !0;
                        let d = 1 === u && "**" === i[u + 1] ? ["."] : [];
                        (i.splice(u - 1, 2, ...d),
                            0 === i.length && i.push(""),
                            (u -= 2));
                    }
                }
            }
        while (e);
        return t;
    }
    secondPhasePreProcess(t) {
        for (let e = 0; e < t.length - 1; e++)
            for (let i = e + 1; i < t.length; i++) {
                let s = this.partsMatch(t[e], t[i], !this.preserveMultipleSlashes);
                if (s) {
                    ((t[e] = []), (t[i] = s));
                    break;
                }
            }
        return t.filter((t) => t.length);
    }
    partsMatch(t, e, i = !1) {
        let s = 0, h = 0, r = [], n = "";
        for (; s < t.length && h < e.length;)
            if (t[s] === e[h])
                (r.push("b" === n ? e[h] : t[s]), s++, h++);
            else if (i && "**" === t[s] && e[h] === t[s + 1])
                (r.push(t[s]), s++);
            else if (i && "**" === e[h] && t[s] === e[h + 1])
                (r.push(e[h]), h++);
            else if ("*" === t[s] &&
                e[h] &&
                (this.options.dot || !e[h].startsWith(".")) &&
                "**" !== e[h]) {
                if ("b" === n)
                    return !1;
                ((n = "a"), r.push(t[s]), s++, h++);
            }
            else {
                if ("*" !== e[h] ||
                    !t[s] ||
                    (!this.options.dot && t[s].startsWith(".")) ||
                    "**" === t[s] ||
                    "a" === n)
                    return !1;
                ((n = "b"), r.push(e[h]), s++, h++);
            }
        return t.length === e.length && r;
    }
    parseNegate() {
        if (this.nonegate)
            return;
        let t = this.pattern, e = !1, i = 0;
        for (let s = 0; s < t.length && "!" === t.charAt(s); s++)
            ((e = !e), i++);
        (i && (this.pattern = t.slice(i)), (this.negate = e));
    }
    matchOne(t, e, i = !1) {
        let s = this.options;
        if (this.isWindows) {
            let h = "string" == typeof t[0] && /^[a-z]:$/i.test(t[0]), r = !h &&
                "" === t[0] &&
                "" === t[1] &&
                "?" === t[2] &&
                /^[a-z]:$/i.test(t[3]), n = "string" == typeof e[0] && /^[a-z]:$/i.test(e[0]), o = !n &&
                "" === e[0] &&
                "" === e[1] &&
                "?" === e[2] &&
                "string" == typeof e[3] &&
                /^[a-z]:$/i.test(e[3]), a = r ? 3 : h ? 0 : void 0, l = o ? 3 : n ? 0 : void 0;
            if ("number" == typeof a && "number" == typeof l) {
                let [c, u] = [t[a], e[l]];
                c.toLowerCase() === u.toLowerCase() &&
                    ((e[l] = c), l > a ? (e = e.slice(l)) : a > l && (t = t.slice(a)));
            }
        }
        let { optimizationLevel: p = 1 } = this.options;
        (p >= 2 && (t = this.levelTwoFileOptimize(t)),
            this.debug("matchOne", this, { file: t, pattern: e }),
            this.debug("matchOne", t.length, e.length));
        for (var d = 0, f = 0, g = t.length, m = e.length; d < g && f < m; d++, f++) {
            this.debug("matchOne loop");
            var w = e[f], $ = t[d];
            if ((this.debug(e, w, $), !1 === w))
                return !1;
            if (w === A) {
                this.debug("GLOBSTAR", [e, w, $]);
                var y = d, b = f + 1;
                if (b === m) {
                    for (this.debug("** at the end"); d < g; d++)
                        if ("." === t[d] ||
                            ".." === t[d] ||
                            (!s.dot && "." === t[d].charAt(0)))
                            return !1;
                    return !0;
                }
                for (; y < g;) {
                    var S = t[y];
                    if ((this.debug(`
globstar while`, t, y, e, b, S),
                        this.matchOne(t.slice(y), e.slice(b), i)))
                        return (this.debug("globstar found match!", y, g, S), !0);
                    if ("." === S || ".." === S || (!s.dot && "." === S.charAt(0))) {
                        this.debug("dot detected!", t, y, e, b);
                        break;
                    }
                    (this.debug("globstar swallow a segment, and continue"), y++);
                }
                return !!(i &&
                    (this.debug(`
>>> no match, partial?`, t, y, e, b),
                        y === g));
            }
            let E;
            if (("string" == typeof w
                ? ((E = $ === w), this.debug("string match", w, $, E))
                : ((E = w.test($)), this.debug("pattern match", w, $, E)),
                !E))
                return !1;
        }
        if (d === g && f === m)
            return !0;
        if (d === g)
            return i;
        if (f === m)
            return d === g - 1 && "" === t[d];
        throw Error("wtf?");
    }
    braceExpand() {
        return ke(this.pattern, this.options);
    }
    parse(t) {
        at(t);
        let e = this.options;
        if ("**" === t)
            return A;
        if ("" === t)
            return "";
        let i, s = null;
        (i = t.match(js))
            ? (s = e.dot ? zs : Is)
            : (i = t.match(Rs))
                ? (s = (e.nocase ? (e.dot ? Ms : Ds) : e.dot ? Fs : Os)(i[1]))
                : (i = t.match(Bs))
                    ? (s = (e.nocase ? (e.dot ? $s : Us) : e.dot ? Gs : Hs)(i))
                    : (i = t.match(Ns))
                        ? (s = e.dot ? Ls : _s)
                        : (i = t.match(Ws)) && (s = Ps);
        let h = Q.fromGlob(t, this.options).toMMPattern();
        return (s &&
            "object" == typeof h &&
            Reflect.defineProperty(h, "test", { value: s }),
            h);
    }
    makeRe() {
        if (this.regexp || !1 === this.regexp)
            return this.regexp;
        let t = this.set;
        if (!t.length)
            return ((this.regexp = !1), this.regexp);
        let e = this.options, i = e.noglobstar ? Vs : e.dot ? Ys : Xs, s = new Set(e.nocase ? ["i"] : []), h = t
            .map((t) => {
            let e = t.map((t) => {
                if (t instanceof RegExp)
                    for (let e of t.flags.split(""))
                        s.add(e);
                return "string" == typeof t ? ei(t) : t === A ? A : t._src;
            });
            e.forEach((t, s) => {
                let h = e[s + 1], r = e[s - 1];
                t !== A ||
                    r === A ||
                    (void 0 === r
                        ? void 0 !== h && h !== A
                            ? (e[s + 1] = "(?:\\/|" + i + "\\/)?" + h)
                            : (e[s] = i)
                        : void 0 === h
                            ? (e[s - 1] = r + "(?:\\/|\\/" + i + ")?")
                            : h !== A &&
                                ((e[s - 1] = r + "(?:\\/|\\/" + i + "\\/)" + h),
                                    (e[s + 1] = A)));
            });
            let h = e.filter((t) => t !== A);
            if (this.partial && h.length >= 1) {
                let r = [];
                for (let n = 1; n <= h.length; n++)
                    r.push(h.slice(0, n).join("/"));
                return "(?:" + r.join("|") + ")";
            }
            return h.join("/");
        })
            .join("|"), [r, n] = t.length > 1 ? ["(?:", ")"] : ["", ""];
        ((h = "^" + r + h + n + "$"),
            this.partial && (h = "^(?:\\/|" + r + h.slice(1, -1) + n + ")$"),
            this.negate && (h = "^(?!" + h + ").+$"));
        try {
            this.regexp = RegExp(h, [...s].join(""));
        }
        catch {
            this.regexp = !1;
        }
        return this.regexp;
    }
    slashSplit(t) {
        return this.preserveMultipleSlashes
            ? t.split("/")
            : this.isWindows && /^\/\/[^\/]+/.test(t)
                ? ["", ...t.split(/\/+/)]
                : t.split(/\/+/);
    }
    match(t, e = this.partial) {
        if ((this.debug("match", t, this.pattern), this.comment))
            return !1;
        if (this.empty)
            return "" === t;
        if ("/" === t && e)
            return !0;
        let i = this.options;
        this.isWindows && (t = t.split("\\").join("/"));
        let s = this.slashSplit(t);
        this.debug(this.pattern, "split", s);
        let h = this.set;
        this.debug(this.pattern, "set", h);
        let r = s[s.length - 1];
        if (!r)
            for (let n = s.length - 2; !r && n >= 0; n--)
                r = s[n];
        for (let o = 0; o < h.length; o++) {
            let a = h[o], l = s;
            if ((i.matchBase && 1 === a.length && (l = [r]), this.matchOne(l, a, e)))
                return !!i.flipNegate || !this.negate;
        }
        return !i.flipNegate && this.negate;
    }
    static defaults(t) {
        return O.defaults(t).Minimatch;
    }
};
((O.AST = Q), (O.Minimatch = D), (O.escape = tt), (O.unescape = W));
var si = "object" == typeof performance &&
    performance &&
    "function" == typeof performance.now
    ? performance
    : Date, Oe = new Set(), Vt = "object" == typeof process && process ? process : {}, Fe = (t, e, i, s) => {
    "function" == typeof Vt.emitWarning
        ? Vt.emitWarning(t, e, i, s)
        : console.error(`[${i}] ${e}: ${t}`);
}, At = globalThis.AbortController, Re = globalThis.AbortSignal;
if (typeof At > "u") {
    At = class {
        constructor() {
            $();
        }
        signal = new (Re = class {
            onabort;
            _onabort = [];
            reason;
            aborted = !1;
            addEventListener(t, e) {
                this._onabort.push(e);
            }
        })();
        abort(t) {
            if (!this.signal.aborted) {
                for (let e of ((this.signal.reason = t),
                    (this.signal.aborted = !0),
                    this.signal._onabort))
                    e(t);
                this.signal.onabort?.(t);
            }
        }
    };
    let w = Vt.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1", $ = () => {
        w &&
            ((w = !1),
                Fe("AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", $));
    };
}
var ii = (t) => !Oe.has(t), q = (t) => t && t === Math.floor(t) && t > 0 && isFinite(t), De = (t) => q(t)
    ? t <= 256
        ? Uint8Array
        : t <= 65536
            ? Uint16Array
            : t <= 4294967296
                ? Uint32Array
                : t <= Number.MAX_SAFE_INTEGER
                    ? Tt
                    : null
    : null, Tt = class extends Array {
    constructor(t) {
        (super(t), this.fill(0));
    }
}, ri = class t {
    heap;
    length;
    static #a = !1;
    static create(e) {
        let i = De(e);
        if (!i)
            return [];
        t.#a = !0;
        let s = new t(e, i);
        return ((t.#a = !1), s);
    }
    constructor(e, i) {
        if (!t.#a)
            throw TypeError("instantiate Stack using Stack.create(n)");
        ((this.heap = new i(e)), (this.length = 0));
    }
    push(t) {
        this.heap[this.length++] = t;
    }
    pop() {
        return this.heap[--this.length];
    }
}, ft = class t {
    #a;
    #b;
    #c;
    #d;
    #e;
    #f;
    #g;
    #h;
    get perf() {
        return this.#h;
    }
    ttl;
    ttlResolution;
    ttlAutopurge;
    updateAgeOnGet;
    updateAgeOnHas;
    allowStale;
    noDisposeOnSet;
    noUpdateTTL;
    maxEntrySize;
    sizeCalculation;
    noDeleteOnFetchRejection;
    noDeleteOnStaleGet;
    allowStaleOnFetchAbort;
    allowStaleOnFetchRejection;
    ignoreFetchAbort;
    #i;
    #j;
    #k;
    #l;
    #m;
    #o;
    #n;
    #p;
    #q;
    #r;
    #s;
    #t;
    #u;
    #v;
    #w;
    #x;
    #y;
    #z;
    #A;
    static unsafeExposeInternals(t) {
        return {
            starts: t.#u,
            ttls: t.#v,
            autopurgeTimers: t.#w,
            sizes: t.#t,
            keyMap: t.#k,
            keyList: t.#l,
            valList: t.#m,
            next: t.#o,
            prev: t.#n,
            get head() {
                return t.#p;
            },
            get tail() {
                return t.#q;
            },
            free: t.#r,
            isBackgroundFetch: (e) => t.#B(e),
            backgroundFetch: (e, i, s, h) => t.#C(e, i, s, h),
            moveToTail: (e) => t.#D(e),
            indexes: (e) => t.#E(e),
            rindexes: (e) => t.#F(e),
            isStale: (e) => t.#G(e),
        };
    }
    get max() {
        return this.#a;
    }
    get maxSize() {
        return this.#b;
    }
    get calculatedSize() {
        return this.#j;
    }
    get size() {
        return this.#i;
    }
    get fetchMethod() {
        return this.#f;
    }
    get memoMethod() {
        return this.#g;
    }
    get dispose() {
        return this.#c;
    }
    get onInsert() {
        return this.#d;
    }
    get disposeAfter() {
        return this.#e;
    }
    constructor(e) {
        let { max: i = 0, ttl: s, ttlResolution: h = 1, ttlAutopurge: r, updateAgeOnGet: n, updateAgeOnHas: o, allowStale: a, dispose: l, onInsert: c, disposeAfter: u, noDisposeOnSet: p, noUpdateTTL: d, maxSize: f = 0, maxEntrySize: g = 0, sizeCalculation: m, fetchMethod: w, memoMethod: $, noDeleteOnFetchRejection: y, noDeleteOnStaleGet: b, allowStaleOnFetchRejection: S, allowStaleOnFetchAbort: E, ignoreFetchAbort: z, perf: Z, } = e;
        if (void 0 !== Z && "function" != typeof Z?.now)
            throw TypeError("perf option must have a now() method if specified");
        if (((this.#h = Z ?? si), 0 !== i && !q(i)))
            throw TypeError("max option must be a nonnegative integer");
        let J = i ? De(i) : Array;
        if (!J)
            throw Error("invalid max value: " + i);
        if (((this.#a = i),
            (this.#b = f),
            (this.maxEntrySize = g || this.#b),
            (this.sizeCalculation = m),
            this.sizeCalculation)) {
            if (!this.#b && !this.maxEntrySize)
                throw TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
            if ("function" != typeof this.sizeCalculation)
                throw TypeError("sizeCalculation set to non-function");
        }
        if (void 0 !== $ && "function" != typeof $)
            throw TypeError("memoMethod must be a function if defined");
        if (((this.#g = $), void 0 !== w && "function" != typeof w))
            throw TypeError("fetchMethod must be a function if specified");
        if (((this.#f = w),
            (this.#y = !!w),
            (this.#k = new Map()),
            (this.#l = Array(i).fill(void 0)),
            (this.#m = Array(i).fill(void 0)),
            (this.#o = new J(i)),
            (this.#n = new J(i)),
            (this.#p = 0),
            (this.#q = 0),
            (this.#r = ri.create(i)),
            (this.#i = 0),
            (this.#j = 0),
            "function" == typeof l && (this.#c = l),
            "function" == typeof c && (this.#d = c),
            "function" == typeof u
                ? ((this.#e = u), (this.#s = []))
                : ((this.#e = void 0), (this.#s = void 0)),
            (this.#x = !!this.#c),
            (this.#A = !!this.#d),
            (this.#z = !!this.#e),
            (this.noDisposeOnSet = !!p),
            (this.noUpdateTTL = !!d),
            (this.noDeleteOnFetchRejection = !!y),
            (this.allowStaleOnFetchRejection = !!S),
            (this.allowStaleOnFetchAbort = !!E),
            (this.ignoreFetchAbort = !!z),
            0 !== this.maxEntrySize)) {
            if (0 !== this.#b && !q(this.#b))
                throw TypeError("maxSize must be a positive integer if specified");
            if (!q(this.maxEntrySize))
                throw TypeError("maxEntrySize must be a positive integer if specified");
            this.#H();
        }
        if (((this.allowStale = !!a),
            (this.noDeleteOnStaleGet = !!b),
            (this.updateAgeOnGet = !!n),
            (this.updateAgeOnHas = !!o),
            (this.ttlResolution = q(h) || 0 === h ? h : 1),
            (this.ttlAutopurge = !!r),
            (this.ttl = s || 0),
            this.ttl)) {
            if (!q(this.ttl))
                throw TypeError("ttl must be a positive integer if specified");
            this.#I();
        }
        if (0 === this.#a && 0 === this.ttl && 0 === this.#b)
            throw TypeError("At least one of max, maxSize, or ttl is required");
        if (!this.ttlAutopurge && !this.#a && !this.#b) {
            let th = "LRU_CACHE_UNBOUNDED";
            ii(th) &&
                (Oe.add(th),
                    Fe("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.", "UnboundedCacheWarning", th, t));
        }
    }
    getRemainingTTL(t) {
        return this.#k.has(t) ? 1 / 0 : 0;
    }
    #I() {
        let e = new Tt(this.#a), i = new Tt(this.#a);
        ((this.#v = e), (this.#u = i));
        let s = this.ttlAutopurge ? Array(this.#a) : void 0;
        ((this.#w = s),
            (this.#J = (t, h, r = this.#h.now()) => {
                if (((i[t] = 0 !== h ? r : 0),
                    (e[t] = h),
                    s?.[t] && (clearTimeout(s[t]), (s[t] = void 0)),
                    0 !== h && s)) {
                    let n = setTimeout(() => {
                        this.#G(t) && this.#K(this.#l[t], "expire");
                    }, h + 1);
                    (n.unref && n.unref(), (s[t] = n));
                }
            }),
            (this.#L = (t) => {
                i[t] = 0 !== e[t] ? this.#h.now() : 0;
            }),
            (this.#M = (t, s) => {
                if (e[s]) {
                    let n = e[s], o = i[s];
                    if (!n || !o)
                        return;
                    ((t.ttl = n), (t.start = o), (t.now = h || r()));
                    let a = t.now - o;
                    t.remainingTTL = n - a;
                }
            }));
        let h = 0, r = () => {
            let t = this.#h.now();
            if (this.ttlResolution > 0) {
                h = t;
                let e = setTimeout(() => (h = 0), this.ttlResolution);
                e.unref && e.unref();
            }
            return t;
        };
        ((this.getRemainingTTL = (t) => {
            let s = this.#k.get(t);
            if (void 0 === s)
                return 0;
            let n = e[s], o = i[s];
            if (!n || !o)
                return 1 / 0;
            let a = (h || r()) - o;
            return n - a;
        }),
            (this.#G = (t) => {
                let s = i[t], n = e[t];
                return !!n && !!s && (h || r()) - s > n;
            }));
    }
    #L = () => { };
    #M = () => { };
    #J = () => { };
    #G = () => !1;
    #H() {
        let n = new Tt(this.#a);
        ((this.#j = 0),
            (this.#t = n),
            (this.#N = (t) => {
                ((this.#j -= n[t]), (n[t] = 0));
            }),
            (this.#O = (t, e, i, s) => {
                if (this.#B(e))
                    return 0;
                if (!q(i)) {
                    if (s) {
                        if ("function" != typeof s)
                            throw TypeError("sizeCalculation must be a function");
                        if (!q((i = s(e, t))))
                            throw TypeError("sizeCalculation return invalid (expect positive integer)");
                    }
                    else
                        throw TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");
                }
                return i;
            }),
            (this.#P = (t, e, i) => {
                if (((n[t] = e), this.#b)) {
                    let s = this.#b - n[t];
                    for (; this.#j > s;)
                        this.#Q(!0);
                }
                ((this.#j += n[t]),
                    i && ((i.entrySize = e), (i.totalCalculatedSize = this.#j)));
            }));
    }
    #N = (t) => { };
    #P = (t, e, i) => { };
    #O = (t, e, i, s) => {
        if (i || s)
            throw TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
        return 0;
    };
    *#E({ allowStale: o = this.allowStale } = {}) {
        if (this.#i)
            for (let a = this.#q; !(!this.#R(a) || ((o || !this.#G(a)) && (yield a), a === this.#p));)
                a = this.#n[a];
    }
    *#F({ allowStale: l = this.allowStale } = {}) {
        if (this.#i)
            for (let c = this.#p; !(!this.#R(c) || ((l || !this.#G(c)) && (yield c), c === this.#q));)
                c = this.#o[c];
    }
    #R(u) {
        return void 0 !== u && this.#k.get(this.#l[u]) === u;
    }
    *entries() {
        for (let t of this.#E())
            void 0 === this.#m[t] ||
                void 0 === this.#l[t] ||
                this.#B(this.#m[t]) ||
                (yield [this.#l[t], this.#m[t]]);
    }
    *rentries() {
        for (let t of this.#F())
            void 0 === this.#m[t] ||
                void 0 === this.#l[t] ||
                this.#B(this.#m[t]) ||
                (yield [this.#l[t], this.#m[t]]);
    }
    *keys() {
        for (let t of this.#E()) {
            let e = this.#l[t];
            void 0 === e || this.#B(this.#m[t]) || (yield e);
        }
    }
    *rkeys() {
        for (let t of this.#F()) {
            let e = this.#l[t];
            void 0 === e || this.#B(this.#m[t]) || (yield e);
        }
    }
    *values() {
        for (let t of this.#E())
            void 0 === this.#m[t] || this.#B(this.#m[t]) || (yield this.#m[t]);
    }
    *rvalues() {
        for (let t of this.#F())
            void 0 === this.#m[t] || this.#B(this.#m[t]) || (yield this.#m[t]);
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    [Symbol.toStringTag] = "LRUCache";
    find(t, e = {}) {
        for (let i of this.#E()) {
            let s = this.#m[i], h = this.#B(s) ? s.__staleWhileFetching : s;
            if (void 0 !== h && t(h, this.#l[i], this))
                return this.get(this.#l[i], e);
        }
    }
    forEach(t, e = this) {
        for (let i of this.#E()) {
            let s = this.#m[i], h = this.#B(s) ? s.__staleWhileFetching : s;
            void 0 !== h && t.call(e, h, this.#l[i], this);
        }
    }
    rforEach(t, e = this) {
        for (let i of this.#F()) {
            let s = this.#m[i], h = this.#B(s) ? s.__staleWhileFetching : s;
            void 0 !== h && t.call(e, h, this.#l[i], this);
        }
    }
    purgeStale() {
        let t = !1;
        for (let e of this.#F({ allowStale: !0 }))
            this.#G(e) && (this.#K(this.#l[e], "expire"), (t = !0));
        return t;
    }
    info(t) {
        let e = this.#k.get(t);
        if (void 0 === e)
            return;
        let i = this.#m[e], s = this.#B(i) ? i.__staleWhileFetching : i;
        if (void 0 === s)
            return;
        let h = { value: s };
        if (this.#v && this.#u) {
            let r = this.#v[e], n = this.#u[e];
            if (r && n) {
                let o = r - (this.#h.now() - n);
                ((h.ttl = o), (h.start = Date.now()));
            }
        }
        return (this.#t && (h.size = this.#t[e]), h);
    }
    dump() {
        let t = [];
        for (let e of this.#E({ allowStale: !0 })) {
            let i = this.#l[e], s = this.#m[e], h = this.#B(s) ? s.__staleWhileFetching : s;
            if (void 0 === h || void 0 === i)
                continue;
            let r = { value: h };
            if (this.#v && this.#u) {
                r.ttl = this.#v[e];
                let n = this.#h.now() - this.#u[e];
                r.start = Math.floor(Date.now() - n);
            }
            (this.#t && (r.size = this.#t[e]), t.unshift([i, r]));
        }
        return t;
    }
    load(t) {
        for (let [e, i] of (this.clear(), t)) {
            if (i.start) {
                let s = Date.now() - i.start;
                i.start = this.#h.now() - s;
            }
            this.set(e, i.value, i);
        }
    }
    set(t, e, i = {}) {
        if (void 0 === e)
            return (this.delete(t), this);
        let { ttl: s = this.ttl, start: h, noDisposeOnSet: r = this.noDisposeOnSet, sizeCalculation: n = this.sizeCalculation, status: o, } = i, { noUpdateTTL: a = this.noUpdateTTL } = i, l = this.#O(t, e, i.size || 0, n);
        if (this.maxEntrySize && l > this.maxEntrySize)
            return (o && ((o.set = "miss"), (o.maxEntrySizeExceeded = !0)),
                this.#K(t, "set"),
                this);
        let c = 0 === this.#i ? void 0 : this.#k.get(t);
        if (void 0 === c)
            ((c =
                0 === this.#i
                    ? this.#q
                    : 0 !== this.#r.length
                        ? this.#r.pop()
                        : this.#i === this.#a
                            ? this.#Q(!1)
                            : this.#i),
                (this.#l[c] = t),
                (this.#m[c] = e),
                this.#k.set(t, c),
                (this.#o[this.#q] = c),
                (this.#n[c] = this.#q),
                (this.#q = c),
                this.#i++,
                this.#P(c, l, o),
                o && (o.set = "add"),
                (a = !1),
                this.#A && this.#d?.(e, t, "add"));
        else {
            this.#D(c);
            let u = this.#m[c];
            if (e !== u) {
                if (this.#y && this.#B(u)) {
                    u.__abortController.abort(Error("replaced"));
                    let { __staleWhileFetching: p } = u;
                    void 0 !== p &&
                        !r &&
                        (this.#x && this.#c?.(p, t, "set"),
                            this.#z && this.#s?.push([p, t, "set"]));
                }
                else
                    r ||
                        (this.#x && this.#c?.(u, t, "set"),
                            this.#z && this.#s?.push([u, t, "set"]));
                if ((this.#N(c), this.#P(c, l, o), (this.#m[c] = e), o)) {
                    o.set = "replace";
                    let d = u && this.#B(u) ? u.__staleWhileFetching : u;
                    void 0 !== d && (o.oldValue = d);
                }
            }
            else
                o && (o.set = "update");
            this.#A && this.onInsert?.(e, t, e === u ? "update" : "replace");
        }
        if ((0 === s || this.#v || this.#I(),
            this.#v && (a || this.#J(c, s, h), o && this.#M(o, c)),
            !r && this.#z && this.#s)) {
            let f = this.#s, g;
            for (; (g = f?.shift());)
                this.#e?.(...g);
        }
        return this;
    }
    pop() {
        try {
            for (; this.#i;) {
                let t = this.#m[this.#p];
                if ((this.#Q(!0), this.#B(t))) {
                    if (t.__staleWhileFetching)
                        return t.__staleWhileFetching;
                }
                else if (void 0 !== t)
                    return t;
            }
        }
        finally {
            if (this.#z && this.#s) {
                let e = this.#s, i;
                for (; (i = e?.shift());)
                    this.#e?.(...i);
            }
        }
    }
    #Q(p) {
        let d = this.#p, f = this.#l[d], g = this.#m[d];
        return (this.#y && this.#B(g)
            ? g.__abortController.abort(Error("evicted"))
            : (this.#x || this.#z) &&
                (this.#x && this.#c?.(g, f, "evict"),
                    this.#z && this.#s?.push([g, f, "evict"])),
            this.#N(d),
            this.#w?.[d] && (clearTimeout(this.#w[d]), (this.#w[d] = void 0)),
            p && ((this.#l[d] = void 0), (this.#m[d] = void 0), this.#r.push(d)),
            1 === this.#i
                ? ((this.#p = this.#q = 0), (this.#r.length = 0))
                : (this.#p = this.#o[d]),
            this.#k.delete(f),
            this.#i--,
            d);
    }
    has(t, e = {}) {
        let { updateAgeOnHas: i = this.updateAgeOnHas, status: s } = e, h = this.#k.get(t);
        if (void 0 !== h) {
            let r = this.#m[h];
            if (this.#B(r) && void 0 === r.__staleWhileFetching)
                return !1;
            if (!this.#G(h))
                return (i && this.#L(h), s && ((s.has = "hit"), this.#M(s, h)), !0);
            s && ((s.has = "stale"), this.#M(s, h));
        }
        else
            s && (s.has = "miss");
        return !1;
    }
    peek(t, e = {}) {
        let { allowStale: i = this.allowStale } = e, s = this.#k.get(t);
        if (void 0 === s || (!i && this.#G(s)))
            return;
        let h = this.#m[s];
        return this.#B(h) ? h.__staleWhileFetching : h;
    }
    #C(m, w, $, y) {
        let b = void 0 === w ? void 0 : this.#m[w];
        if (this.#B(b))
            return b;
        let S = new At(), { signal: E } = $;
        E?.addEventListener("abort", () => S.abort(E.reason), {
            signal: S.signal,
        });
        let z = { signal: S.signal, options: $, context: y }, Z = (t, e = !1) => {
            let { aborted: i } = S.signal, s = $.ignoreFetchAbort && void 0 !== t, h = $.ignoreFetchAbort ||
                !!($.allowStaleOnFetchAbort && void 0 !== t);
            if (($.status &&
                (i && !e
                    ? (($.status.fetchAborted = !0),
                        ($.status.fetchError = S.signal.reason),
                        s && ($.status.fetchAbortIgnored = !0))
                    : ($.status.fetchResolved = !0)),
                i && !s && !e))
                return th(S.signal.reason, h);
            let r = tn, n = this.#m[w];
            return ((n === tn || (s && e && void 0 === n)) &&
                (void 0 === t
                    ? void 0 !== r.__staleWhileFetching
                        ? (this.#m[w] = r.__staleWhileFetching)
                        : this.#K(m, "fetch")
                    : ($.status && ($.status.fetchUpdated = !0),
                        this.set(m, t, z.options))),
                t);
        }, J = (t) => ($.status &&
            (($.status.fetchRejected = !0), ($.status.fetchError = t)),
            th(t, !1)), th = (t, e) => {
            let { aborted: i } = S.signal, s = i && $.allowStaleOnFetchAbort, h = s || $.allowStaleOnFetchRejection, r = h || $.noDeleteOnFetchRejection, n = tn;
            if ((this.#m[w] === tn &&
                (r && (e || void 0 !== n.__staleWhileFetching)
                    ? s || (this.#m[w] = n.__staleWhileFetching)
                    : this.#K(m, "fetch")),
                h))
                return ($.status &&
                    void 0 !== n.__staleWhileFetching &&
                    ($.status.returnedStale = !0),
                    n.__staleWhileFetching);
            if (n.__returned === n)
                throw t;
        }, tr = (t, e) => {
            let i = this.#f?.(m, b, z);
            (i &&
                i instanceof Promise &&
                i.then((e) => t(void 0 === e ? void 0 : e), e),
                S.signal.addEventListener("abort", () => {
                    (!$.ignoreFetchAbort || $.allowStaleOnFetchAbort) &&
                        (t(void 0), $.allowStaleOnFetchAbort && (t = (t) => Z(t, !0)));
                }));
        };
        $.status && ($.status.fetchDispatched = !0);
        let tn = new Promise(tr).then(Z, J), to = Object.assign(tn, {
            __abortController: S,
            __staleWhileFetching: b,
            __returned: void 0,
        });
        return (void 0 === w
            ? (this.set(m, to, { ...z.options, status: void 0 }),
                (w = this.#k.get(m)))
            : (this.#m[w] = to),
            to);
    }
    #B(ta) {
        if (!this.#y)
            return !1;
        let tl = ta;
        return (!!tl &&
            tl instanceof Promise &&
            tl.hasOwnProperty("__staleWhileFetching") &&
            tl.__abortController instanceof At);
    }
    async fetch(t, e = {}) {
        let { allowStale: i = this.allowStale, updateAgeOnGet: s = this.updateAgeOnGet, noDeleteOnStaleGet: h = this.noDeleteOnStaleGet, ttl: r = this.ttl, noDisposeOnSet: n = this.noDisposeOnSet, size: o = 0, sizeCalculation: a = this.sizeCalculation, noUpdateTTL: l = this.noUpdateTTL, noDeleteOnFetchRejection: c = this.noDeleteOnFetchRejection, allowStaleOnFetchRejection: u = this.allowStaleOnFetchRejection, ignoreFetchAbort: p = this.ignoreFetchAbort, allowStaleOnFetchAbort: d = this.allowStaleOnFetchAbort, context: f, forceRefresh: g = !1, status: m, signal: w, } = e;
        if (!this.#y)
            return (m && (m.fetch = "get"),
                this.get(t, {
                    allowStale: i,
                    updateAgeOnGet: s,
                    noDeleteOnStaleGet: h,
                    status: m,
                }));
        let $ = {
            allowStale: i,
            updateAgeOnGet: s,
            noDeleteOnStaleGet: h,
            ttl: r,
            noDisposeOnSet: n,
            size: o,
            sizeCalculation: a,
            noUpdateTTL: l,
            noDeleteOnFetchRejection: c,
            allowStaleOnFetchRejection: u,
            allowStaleOnFetchAbort: d,
            ignoreFetchAbort: p,
            status: m,
            signal: w,
        }, y = this.#k.get(t);
        if (void 0 === y) {
            m && (m.fetch = "miss");
            let b = this.#C(t, y, $, f);
            return (b.__returned = b);
        }
        {
            let S = this.#m[y];
            if (this.#B(S)) {
                let E = i && void 0 !== S.__staleWhileFetching;
                return (m && ((m.fetch = "inflight"), E && (m.returnedStale = !0)),
                    E ? S.__staleWhileFetching : (S.__returned = S));
            }
            let z = this.#G(y);
            if (!g && !z)
                return (m && (m.fetch = "hit"),
                    this.#D(y),
                    s && this.#L(y),
                    m && this.#M(m, y),
                    S);
            let Z = this.#C(t, y, $, f), J = void 0 !== Z.__staleWhileFetching && i;
            return (m &&
                ((m.fetch = z ? "stale" : "refresh"),
                    J && z && (m.returnedStale = !0)),
                J ? Z.__staleWhileFetching : (Z.__returned = Z));
        }
    }
    async forceFetch(t, e = {}) {
        let i = await this.fetch(t, e);
        if (void 0 === i)
            throw Error("fetch() returned undefined");
        return i;
    }
    memo(t, e = {}) {
        let i = this.#g;
        if (!i)
            throw Error("no memoMethod provided to constructor");
        let { context: s, forceRefresh: h, ...r } = e, n = this.get(t, r);
        if (!h && void 0 !== n)
            return n;
        let o = i(t, n, { options: r, context: s });
        return (this.set(t, o, r), o);
    }
    get(t, e = {}) {
        let { allowStale: i = this.allowStale, updateAgeOnGet: s = this.updateAgeOnGet, noDeleteOnStaleGet: h = this.noDeleteOnStaleGet, status: r, } = e, n = this.#k.get(t);
        if (void 0 !== n) {
            let o = this.#m[n], a = this.#B(o);
            return (r && this.#M(r, n),
                this.#G(n)
                    ? (r && (r.get = "stale"),
                        a
                            ? (r &&
                                i &&
                                void 0 !== o.__staleWhileFetching &&
                                (r.returnedStale = !0),
                                i ? o.__staleWhileFetching : void 0)
                            : (h || this.#K(t, "expire"),
                                r && i && (r.returnedStale = !0),
                                i ? o : void 0))
                    : (r && (r.get = "hit"),
                        a ? o.__staleWhileFetching : (this.#D(n), s && this.#L(n), o)));
        }
        r && (r.get = "miss");
    }
    #S(tc, tu) {
        ((this.#n[tu] = tc), (this.#o[tc] = tu));
    }
    #D(tp) {
        tp !== this.#q &&
            (tp === this.#p
                ? (this.#p = this.#o[tp])
                : this.#S(this.#n[tp], this.#o[tp]),
                this.#S(this.#q, tp),
                (this.#q = tp));
    }
    delete(t) {
        return this.#K(t, "delete");
    }
    #K(td, tf) {
        let tg = !1;
        if (0 !== this.#i) {
            let tm = this.#k.get(td);
            if (void 0 !== tm) {
                if ((this.#w?.[tm] &&
                    (clearTimeout(this.#w?.[tm]), (this.#w[tm] = void 0)),
                    (tg = !0),
                    1 === this.#i))
                    this.#T(tf);
                else {
                    this.#N(tm);
                    let tw = this.#m[tm];
                    if ((this.#B(tw)
                        ? tw.__abortController.abort(Error("deleted"))
                        : (this.#x || this.#z) &&
                            (this.#x && this.#c?.(tw, td, tf),
                                this.#z && this.#s?.push([tw, td, tf])),
                        this.#k.delete(td),
                        (this.#l[tm] = void 0),
                        (this.#m[tm] = void 0),
                        tm === this.#q))
                        this.#q = this.#n[tm];
                    else if (tm === this.#p)
                        this.#p = this.#o[tm];
                    else {
                        let t$ = this.#n[tm];
                        this.#o[t$] = this.#o[tm];
                        let ty = this.#o[tm];
                        this.#n[ty] = this.#n[tm];
                    }
                    (this.#i--, this.#r.push(tm));
                }
            }
        }
        if (this.#z && this.#s?.length) {
            let tb = this.#s, tv;
            for (; (tv = tb?.shift());)
                this.#e?.(...tv);
        }
        return tg;
    }
    clear() {
        return this.#T("delete");
    }
    #T(t_) {
        for (let tS of this.#F({ allowStale: !0 })) {
            let tk = this.#m[tS];
            if (this.#B(tk))
                tk.__abortController.abort(Error("deleted"));
            else {
                let tx = this.#l[tS];
                (this.#x && this.#c?.(tk, tx, t_),
                    this.#z && this.#s?.push([tk, tx, t_]));
            }
        }
        if ((this.#k.clear(),
            this.#m.fill(void 0),
            this.#l.fill(void 0),
            this.#v && this.#u)) {
            for (let tC of (this.#v.fill(0), this.#u.fill(0), this.#w ?? []))
                void 0 !== tC && clearTimeout(tC);
            this.#w?.fill(void 0);
        }
        if ((this.#t && this.#t.fill(0),
            (this.#p = 0),
            (this.#q = 0),
            (this.#r.length = 0),
            (this.#j = 0),
            (this.#i = 0),
            this.#z && this.#s)) {
            let tF = this.#s, tO;
            for (; (tO = tF?.shift());)
                this.#e?.(...tO);
        }
    }
}, Ne = "object" == typeof process && process
    ? process
    : { stdout: null, stderr: null }, oi = (t) => !!t &&
    "object" == typeof t &&
    (t instanceof V || t instanceof g || hi(t) || ai(t)), hi = (t) => !!t &&
    "object" == typeof t &&
    t instanceof f &&
    "function" == typeof t.pipe &&
    t.pipe !== g.Writable.prototype.pipe, ai = (t) => !!t &&
    "object" == typeof t &&
    t instanceof f &&
    "function" == typeof t.write &&
    "function" == typeof t.end, G = Symbol("EOF"), H = Symbol("maybeEmitEnd"), K = Symbol("emittedEnd"), kt = Symbol("emittingEnd"), ut = Symbol("emittedError"), Rt = Symbol("closed"), _e = Symbol("read"), Ot = Symbol("flush"), Le = Symbol("flushChunk"), P = Symbol("encoding"), et = Symbol("decoder"), v = Symbol("flowing"), dt = Symbol("paused"), st = Symbol("resume"), C = Symbol("buffer"), F = Symbol("pipes"), T = Symbol("bufferLength"), Yt = Symbol("bufferPush"), Ft = Symbol("bufferShift"), k = Symbol("objectMode"), x = Symbol("destroyed"), Xt = Symbol("error"), Jt = Symbol("emitData"), We = Symbol("emitEnd"), Zt = Symbol("emitEnd2"), B = Symbol("async"), Qt = Symbol("abort"), Dt = Symbol("aborted"), pt = Symbol("signal"), Y = Symbol("dataListeners"), M = Symbol("discarded"), mt = (t) => Promise.resolve().then(t), li = (t) => t(), ci = (t) => "end" === t || "finish" === t || "prefinish" === t, fi = (t) => t instanceof ArrayBuffer ||
    (!!t &&
        "object" == typeof t &&
        t.constructor &&
        "ArrayBuffer" === t.constructor.name &&
        t.byteLength >= 0), ui = (t) => !Buffer.isBuffer(t) && ArrayBuffer.isView(t), Mt = class {
    src;
    dest;
    opts;
    ondrain;
    constructor(t, e, i) {
        ((this.src = t),
            (this.dest = e),
            (this.opts = i),
            (this.ondrain = () => t[st]()),
            this.dest.on("drain", this.ondrain));
    }
    unpipe() {
        this.dest.removeListener("drain", this.ondrain);
    }
    proxyErrors(t) { }
    end() {
        (this.unpipe(), this.opts.end && this.dest.end());
    }
}, te = class extends Mt {
    unpipe() {
        (this.src.removeListener("error", this.proxyErrors), super.unpipe());
    }
    constructor(t, e, i) {
        (super(t, e, i),
            (this.proxyErrors = (t) => this.dest.emit("error", t)),
            t.on("error", this.proxyErrors));
    }
}, di = (t) => !!t.objectMode, pi = (t) => !t.objectMode && !!t.encoding && "buffer" !== t.encoding, V = class extends f {
    [v] = !1;
    [dt] = !1;
    [F] = [];
    [C] = [];
    [k];
    [P];
    [B];
    [et];
    [G] = !1;
    [K] = !1;
    [kt] = !1;
    [Rt] = !1;
    [ut] = null;
    [T] = 0;
    [x] = !1;
    [pt];
    [Dt] = !1;
    [Y] = 0;
    [M] = !1;
    writable = !0;
    readable = !0;
    constructor(...t) {
        let e = t[0] || {};
        if ((super(), e.objectMode && "string" == typeof e.encoding))
            throw TypeError("Encoding and objectMode may not be used together");
        (di(e)
            ? ((this[k] = !0), (this[P] = null))
            : pi(e)
                ? ((this[P] = e.encoding), (this[k] = !1))
                : ((this[k] = !1), (this[P] = null)),
            (this[B] = !!e.async),
            (this[et] = this[P] ? new m(this[P]) : null),
            e &&
                !0 === e.debugExposeBuffer &&
                Object.defineProperty(this, "buffer", { get: () => this[C] }),
            e &&
                !0 === e.debugExposePipes &&
                Object.defineProperty(this, "pipes", { get: () => this[F] }));
        let { signal: i } = e;
        i &&
            ((this[pt] = i),
                i.aborted ? this[Qt]() : i.addEventListener("abort", () => this[Qt]()));
    }
    get bufferLength() {
        return this[T];
    }
    get encoding() {
        return this[P];
    }
    set encoding(t) {
        throw Error("Encoding must be set at instantiation time");
    }
    setEncoding(t) {
        throw Error("Encoding must be set at instantiation time");
    }
    get objectMode() {
        return this[k];
    }
    set objectMode(t) {
        throw Error("objectMode must be set at instantiation time");
    }
    get async() {
        return this[B];
    }
    set async(t) {
        this[B] = this[B] || !!t;
    }
    [Qt]() {
        ((this[Dt] = !0),
            this.emit("abort", this[pt]?.reason),
            this.destroy(this[pt]?.reason));
    }
    get aborted() {
        return this[Dt];
    }
    set aborted(t) { }
    write(t, e, i) {
        if (this[Dt])
            return !1;
        if (this[G])
            throw Error("write after end");
        if (this[x])
            return (this.emit("error", Object.assign(Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" })),
                !0);
        ("function" == typeof e && ((i = e), (e = "utf8")), e || (e = "utf8"));
        let s = this[B] ? mt : li;
        if (!this[k] && !Buffer.isBuffer(t)) {
            if (ui(t))
                t = Buffer.from(t.buffer, t.byteOffset, t.byteLength);
            else if (fi(t))
                t = Buffer.from(t);
            else if ("string" != typeof t)
                throw Error("Non-contiguous data written to non-objectMode stream");
        }
        return this[k]
            ? (this[v] && 0 !== this[T] && this[Ot](!0),
                this[v] ? this.emit("data", t) : this[Yt](t),
                0 !== this[T] && this.emit("readable"),
                i && s(i),
                this[v])
            : t.length
                ? ("string" == typeof t &&
                    (e !== this[P] || this[et]?.lastNeed) &&
                    (t = Buffer.from(t, e)),
                    Buffer.isBuffer(t) && this[P] && (t = this[et].write(t)),
                    this[v] && 0 !== this[T] && this[Ot](!0),
                    this[v] ? this.emit("data", t) : this[Yt](t),
                    0 !== this[T] && this.emit("readable"),
                    i && s(i),
                    this[v])
                : (0 !== this[T] && this.emit("readable"), i && s(i), this[v]);
    }
    read(t) {
        if (this[x])
            return null;
        if (((this[M] = !1), 0 === this[T] || 0 === t || (t && t > this[T])))
            return (this[H](), null);
        (this[k] && (t = null),
            this[C].length > 1 &&
                !this[k] &&
                (this[C] = [
                    this[P] ? this[C].join("") : Buffer.concat(this[C], this[T]),
                ]));
        let e = this[_e](t || null, this[C][0]);
        return (this[H](), e);
    }
    [_e](t, e) {
        if (this[k])
            this[Ft]();
        else {
            let i = e;
            t === i.length || null === t
                ? this[Ft]()
                : "string" == typeof i
                    ? ((this[C][0] = i.slice(t)), (e = i.slice(0, t)), (this[T] -= t))
                    : ((this[C][0] = i.subarray(t)),
                        (e = i.subarray(0, t)),
                        (this[T] -= t));
        }
        return (this.emit("data", e),
            this[C].length || this[G] || this.emit("drain"),
            e);
    }
    end(t, e, i) {
        return ("function" == typeof t && ((i = t), (t = void 0)),
            "function" == typeof e && ((i = e), (e = "utf8")),
            void 0 !== t && this.write(t, e),
            i && this.once("end", i),
            (this[G] = !0),
            (this.writable = !1),
            (this[v] || !this[dt]) && this[H](),
            this);
    }
    [st]() {
        this[x] ||
            (this[Y] || this[F].length || (this[M] = !0),
                (this[dt] = !1),
                (this[v] = !0),
                this.emit("resume"),
                this[C].length ? this[Ot]() : this[G] ? this[H]() : this.emit("drain"));
    }
    resume() {
        return this[st]();
    }
    pause() {
        ((this[v] = !1), (this[dt] = !0), (this[M] = !1));
    }
    get destroyed() {
        return this[x];
    }
    get flowing() {
        return this[v];
    }
    get paused() {
        return this[dt];
    }
    [Yt](t) {
        (this[k] ? (this[T] += 1) : (this[T] += t.length), this[C].push(t));
    }
    [Ft]() {
        return (this[k] ? (this[T] -= 1) : (this[T] -= this[C][0].length),
            this[C].shift());
    }
    [Ot](t = !1) {
        do
            ;
        while (this[Le](this[Ft]()) && this[C].length);
        t || this[C].length || this[G] || this.emit("drain");
    }
    [Le](t) {
        return (this.emit("data", t), this[v]);
    }
    pipe(t, e) {
        if (this[x])
            return t;
        this[M] = !1;
        let i = this[K];
        return ((e = e || {}),
            t === Ne.stdout || t === Ne.stderr
                ? (e.end = !1)
                : (e.end = !1 !== e.end),
            (e.proxyErrors = !!e.proxyErrors),
            i
                ? e.end && t.end()
                : (this[F].push(e.proxyErrors ? new te(this, t, e) : new Mt(this, t, e)),
                    this[B] ? mt(() => this[st]()) : this[st]()),
            t);
    }
    unpipe(t) {
        let e = this[F].find((e) => e.dest === t);
        e &&
            (1 === this[F].length
                ? (this[v] && 0 === this[Y] && (this[v] = !1), (this[F] = []))
                : this[F].splice(this[F].indexOf(e), 1),
                e.unpipe());
    }
    addListener(t, e) {
        return this.on(t, e);
    }
    on(t, e) {
        let i = super.on(t, e);
        if ("data" === t)
            ((this[M] = !1), this[Y]++, this[F].length || this[v] || this[st]());
        else if ("readable" === t && 0 !== this[T])
            super.emit("readable");
        else if (ci(t) && this[K])
            (super.emit(t), this.removeAllListeners(t));
        else if ("error" === t && this[ut]) {
            let s = e;
            this[B] ? mt(() => s.call(this, this[ut])) : s.call(this, this[ut]);
        }
        return i;
    }
    removeListener(t, e) {
        return this.off(t, e);
    }
    off(t, e) {
        let i = super.off(t, e);
        return ("data" !== t ||
            ((this[Y] = this.listeners("data").length),
                0 !== this[Y] || this[M] || this[F].length || (this[v] = !1)),
            i);
    }
    removeAllListeners(t) {
        let e = super.removeAllListeners(t);
        return (("data" !== t && void 0 !== t) ||
            ((this[Y] = 0), this[M] || this[F].length || (this[v] = !1)),
            e);
    }
    get emittedEnd() {
        return this[K];
    }
    [H]() {
        this[kt] ||
            this[K] ||
            this[x] ||
            0 !== this[C].length ||
            !this[G] ||
            ((this[kt] = !0),
                this.emit("end"),
                this.emit("prefinish"),
                this.emit("finish"),
                this[Rt] && this.emit("close"),
                (this[kt] = !1));
    }
    emit(t, ...e) {
        let i = e[0];
        if ("error" !== t && "close" !== t && t !== x && this[x])
            return !1;
        if ("data" === t)
            return ((!!this[k] || !!i) &&
                (this[B] ? (mt(() => this[Jt](i)), !0) : this[Jt](i)));
        if ("end" === t)
            return this[We]();
        if ("close" === t) {
            if (((this[Rt] = !0), !this[K] && !this[x]))
                return !1;
            let s = super.emit("close");
            return (this.removeAllListeners("close"), s);
        }
        if ("error" === t) {
            ((this[ut] = i), super.emit(Xt, i));
            let h = (!this[pt] || !!this.listeners("error").length) &&
                super.emit("error", i);
            return (this[H](), h);
        }
        if ("resume" === t) {
            let r = super.emit("resume");
            return (this[H](), r);
        }
        if ("finish" === t || "prefinish" === t) {
            let n = super.emit(t);
            return (this.removeAllListeners(t), n);
        }
        let o = super.emit(t, ...e);
        return (this[H](), o);
    }
    [Jt](t) {
        for (let e of this[F])
            !1 === e.dest.write(t) && this.pause();
        let i = !this[M] && super.emit("data", t);
        return (this[H](), i);
    }
    [We]() {
        return (!this[K] &&
            ((this[K] = !0),
                (this.readable = !1),
                this[B] ? (mt(() => this[Zt]()), !0) : this[Zt]()));
    }
    [Zt]() {
        if (this[et]) {
            let t = this[et].end();
            if (t) {
                for (let e of this[F])
                    e.dest.write(t);
                this[M] || super.emit("data", t);
            }
        }
        for (let i of this[F])
            i.end();
        let s = super.emit("end");
        return (this.removeAllListeners("end"), s);
    }
    async collect() {
        let t = Object.assign([], { dataLength: 0 });
        this[k] || (t.dataLength = 0);
        let e = this.promise();
        return (this.on("data", (e) => {
            (t.push(e), this[k] || (t.dataLength += e.length));
        }),
            await e,
            t);
    }
    async concat() {
        if (this[k])
            throw Error("cannot concat in objectMode");
        let t = await this.collect();
        return this[P] ? t.join("") : Buffer.concat(t, t.dataLength);
    }
    async promise() {
        return new Promise((t, e) => {
            (this.on(x, () => e(Error("stream destroyed"))),
                this.on("error", (t) => e(t)),
                this.on("end", () => t()));
        });
    }
    [Symbol.asyncIterator]() {
        this[M] = !1;
        let t = !1, e = async () => (this.pause(), (t = !0), { value: void 0, done: !0 });
        return {
            next: () => {
                if (t)
                    return e();
                let i = this.read();
                if (null !== i)
                    return Promise.resolve({ done: !1, value: i });
                if (this[G])
                    return e();
                let s, h, r = (t) => {
                    (this.off("data", n),
                        this.off("end", o),
                        this.off(x, a),
                        e(),
                        h(t));
                }, n = (t) => {
                    (this.off("error", r),
                        this.off("end", o),
                        this.off(x, a),
                        this.pause(),
                        s({ value: t, done: !!this[G] }));
                }, o = () => {
                    (this.off("error", r),
                        this.off("data", n),
                        this.off(x, a),
                        e(),
                        s({ done: !0, value: void 0 }));
                }, a = () => r(Error("stream destroyed"));
                return new Promise((t, e) => {
                    ((h = e),
                        (s = t),
                        this.once(x, a),
                        this.once("error", r),
                        this.once("end", o),
                        this.once("data", n));
                });
            },
            throw: e,
            return: e,
            [Symbol.asyncIterator]() {
                return this;
            },
            async [Symbol.asyncDispose]() { },
        };
    }
    [Symbol.iterator]() {
        this[M] = !1;
        let t = !1, e = () => (this.pause(),
            this.off(Xt, e),
            this.off(x, e),
            this.off("end", e),
            (t = !0),
            { done: !0, value: void 0 }), i = () => {
            if (t)
                return e();
            let i = this.read();
            return null === i ? e() : { done: !1, value: i };
        };
        return (this.once("end", e),
            this.once(Xt, e),
            this.once(x, e),
            {
                next: i,
                throw: e,
                return: e,
                [Symbol.iterator]() {
                    return this;
                },
                [Symbol.dispose]() { },
            });
    }
    destroy(t) {
        return this[x]
            ? (t ? this.emit("error", t) : this.emit(x), this)
            : ((this[x] = !0),
                (this[M] = !0),
                (this[C].length = 0),
                (this[T] = 0),
                "function" != typeof this.close || this[Rt] || this.close(),
                t ? this.emit("error", t) : this.emit(x),
                this);
    }
    static get isStream() {
        return oi;
    }
}, vi = a.native, wt = {
    lstatSync: h,
    readdir: r,
    readdirSync: n,
    readlinkSync: o,
    realpathSync: vi,
    promises: { lstat: c, readdir: u, readlink: p, realpath: d },
}, Ue = (t) => t && t !== wt && t !== l
    ? { ...wt, ...t, promises: { ...wt.promises, ...(t.promises || {}) } }
    : wt, $e = /^\\\\\?\\([a-z]:)\\?$/i, Ri = (t) => t.replace(/\//g, "\\").replace($e, "$1\\"), Oi = /[\\\/]/, L = 0, Ge = 1, He = 2, U = 4, qe = 6, Ke = 8, X = 10, Ve = 12, _ = 15, gt = ~_, se = 16, je = 32, yt = 64, j = 128, Nt = 256, Lt = 512, Ie = yt | j | Lt, Fi = 1023, ie = (t) => t.isFile()
    ? Ke
    : t.isDirectory()
        ? U
        : t.isSymbolicLink()
            ? X
            : t.isCharacterDevice()
                ? He
                : t.isBlockDevice()
                    ? qe
                    : t.isSocket()
                        ? Ve
                        : t.isFIFO()
                            ? Ge
                            : L, ze = new ft({ max: 4096 }), bt = (t) => {
    let e = ze.get(t);
    if (e)
        return e;
    let i = t.normalize("NFKD");
    return (ze.set(t, i), i);
}, Be = new ft({ max: 4096 }), _t = (t) => {
    let e = Be.get(t);
    if (e)
        return e;
    let i = bt(t.toLowerCase());
    return (Be.set(t, i), i);
}, Wt = class extends ft {
    constructor() {
        super({ max: 256 });
    }
}, ne = class extends ft {
    constructor(t = 16384) {
        super({ maxSize: t, sizeCalculation: (t) => t.length + 1 });
    }
}, Ye = Symbol("PathScurry setAsCwd"), R = class {
    name;
    root;
    roots;
    parent;
    nocase;
    isCWD = !1;
    #a;
    #b;
    get dev() {
        return this.#b;
    }
    #c;
    get mode() {
        return this.#c;
    }
    #d;
    get nlink() {
        return this.#d;
    }
    #e;
    get uid() {
        return this.#e;
    }
    #f;
    get gid() {
        return this.#f;
    }
    #g;
    get rdev() {
        return this.#g;
    }
    #h;
    get blksize() {
        return this.#h;
    }
    #i;
    get ino() {
        return this.#i;
    }
    #j;
    get size() {
        return this.#j;
    }
    #k;
    get blocks() {
        return this.#k;
    }
    #l;
    get atimeMs() {
        return this.#l;
    }
    #m;
    get mtimeMs() {
        return this.#m;
    }
    #o;
    get ctimeMs() {
        return this.#o;
    }
    #n;
    get birthtimeMs() {
        return this.#n;
    }
    #p;
    get atime() {
        return this.#p;
    }
    #q;
    get mtime() {
        return this.#q;
    }
    #r;
    get ctime() {
        return this.#r;
    }
    #s;
    get birthtime() {
        return this.#s;
    }
    #t;
    #u;
    #v;
    #w;
    #x;
    #y;
    #z;
    #A;
    #I;
    #L;
    get parentPath() {
        return (this.parent || this).fullpath();
    }
    get path() {
        return this.parentPath;
    }
    constructor(t, e = L, i, s, h, r, n) {
        ((this.name = t),
            (this.#t = h ? _t(t) : bt(t)),
            (this.#z = e & Fi),
            (this.nocase = h),
            (this.roots = s),
            (this.root = i || this),
            (this.#A = r),
            (this.#v = n.fullpath),
            (this.#x = n.relative),
            (this.#y = n.relativePosix),
            (this.parent = n.parent),
            this.parent ? (this.#a = this.parent.#a) : (this.#a = Ue(n.fs)));
    }
    depth() {
        return void 0 !== this.#u
            ? this.#u
            : this.parent
                ? (this.#u = this.parent.depth() + 1)
                : (this.#u = 0);
    }
    childrenCache() {
        return this.#A;
    }
    resolve(t) {
        if (!t)
            return this;
        let e = this.getRootString(t), i = t.substring(e.length).split(this.splitSep);
        return e ? this.getRoot(e).#M(i) : this.#M(i);
    }
    #M(t) {
        let e = this;
        for (let i of t)
            e = e.child(i);
        return e;
    }
    children() {
        let t = this.#A.get(this);
        if (t)
            return t;
        let e = Object.assign([], { provisional: 0 });
        return (this.#A.set(this, e), (this.#z &= ~se), e);
    }
    child(t, e) {
        if ("" === t || "." === t)
            return this;
        if (".." === t)
            return this.parent || this;
        let i = this.children(), s = this.nocase ? _t(t) : bt(t);
        for (let h of i)
            if (h.#t === s)
                return h;
        let r = this.parent ? this.sep : "", n = this.#v ? this.#v + r + t : void 0, o = this.newChild(t, L, { ...e, parent: this, fullpath: n });
        return (this.canReaddir() || (o.#z |= j), i.push(o), o);
    }
    relative() {
        if (this.isCWD)
            return "";
        if (void 0 !== this.#x)
            return this.#x;
        let t = this.name, e = this.parent;
        if (!e)
            return (this.#x = this.name);
        let i = e.relative();
        return i + (i && e.parent ? this.sep : "") + t;
    }
    relativePosix() {
        if ("/" === this.sep)
            return this.relative();
        if (this.isCWD)
            return "";
        if (void 0 !== this.#y)
            return this.#y;
        let t = this.name, e = this.parent;
        if (!e)
            return (this.#y = this.fullpathPosix());
        let i = e.relativePosix();
        return i + (i && e.parent ? "/" : "") + t;
    }
    fullpath() {
        if (void 0 !== this.#v)
            return this.#v;
        let t = this.name, e = this.parent;
        if (!e)
            return (this.#v = this.name);
        let i = e.fullpath() + (e.parent ? this.sep : "") + t;
        return (this.#v = i);
    }
    fullpathPosix() {
        if (void 0 !== this.#w)
            return this.#w;
        if ("/" === this.sep)
            return (this.#w = this.fullpath());
        if (!this.parent) {
            let t = this.fullpath().replace(/\\/g, "/");
            return /^[a-z]:\//i.test(t) ? (this.#w = `//?/${t}`) : (this.#w = t);
        }
        let e = this.parent, i = e.fullpathPosix(), s = i + (i && e.parent ? "/" : "") + this.name;
        return (this.#w = s);
    }
    isUnknown() {
        return (this.#z & _) === L;
    }
    isType(t) {
        return this[`is${t}`]();
    }
    getType() {
        return this.isUnknown()
            ? "Unknown"
            : this.isDirectory()
                ? "Directory"
                : this.isFile()
                    ? "File"
                    : this.isSymbolicLink()
                        ? "SymbolicLink"
                        : this.isFIFO()
                            ? "FIFO"
                            : this.isCharacterDevice()
                                ? "CharacterDevice"
                                : this.isBlockDevice()
                                    ? "BlockDevice"
                                    : this.isSocket()
                                        ? "Socket"
                                        : "Unknown";
    }
    isFile() {
        return (this.#z & _) === Ke;
    }
    isDirectory() {
        return (this.#z & _) === U;
    }
    isCharacterDevice() {
        return (this.#z & _) === He;
    }
    isBlockDevice() {
        return (this.#z & _) === qe;
    }
    isFIFO() {
        return (this.#z & _) === Ge;
    }
    isSocket() {
        return (this.#z & _) === Ve;
    }
    isSymbolicLink() {
        return (this.#z & X) === X;
    }
    lstatCached() {
        return this.#z & je ? this : void 0;
    }
    readlinkCached() {
        return this.#I;
    }
    realpathCached() {
        return this.#L;
    }
    readdirCached() {
        let t = this.children();
        return t.slice(0, t.provisional);
    }
    canReadlink() {
        if (this.#I)
            return !0;
        if (!this.parent)
            return !1;
        let t = this.#z & _;
        return !((t !== L && t !== X) || this.#z & Nt || this.#z & j);
    }
    calledReaddir() {
        return !!(this.#z & se);
    }
    isENOENT() {
        return !!(this.#z & j);
    }
    isNamed(t) {
        return this.nocase ? this.#t === _t(t) : this.#t === bt(t);
    }
    async readlink() {
        let t = this.#I;
        if (t)
            return t;
        if (this.canReadlink() && this.parent)
            try {
                let e = await this.#a.promises.readlink(this.fullpath()), i = (await this.parent.realpath())?.resolve(e);
                if (i)
                    return (this.#I = i);
            }
            catch (s) {
                this.#F(s.code);
                return;
            }
    }
    readlinkSync() {
        let t = this.#I;
        if (t)
            return t;
        if (this.canReadlink() && this.parent)
            try {
                let e = this.#a.readlinkSync(this.fullpath()), i = this.parent.realpathSync()?.resolve(e);
                if (i)
                    return (this.#I = i);
            }
            catch (s) {
                this.#F(s.code);
                return;
            }
    }
    #J(s) {
        this.#z |= se;
        for (let h = s.provisional; h < s.length; h++) {
            let r = s[h];
            r && r.#G();
        }
    }
    #G() {
        this.#z & j || ((this.#z = (this.#z | j) & gt), this.#H());
    }
    #H() {
        let n = this.children();
        for (let o of ((n.provisional = 0), n))
            o.#G();
    }
    #N() {
        ((this.#z |= Lt), this.#P());
    }
    #P() {
        if (this.#z & yt)
            return;
        let a = this.#z;
        ((a & _) === U && (a &= gt), (this.#z = a | yt), this.#H());
    }
    #O(l = "") {
        "ENOTDIR" === l || "EPERM" === l
            ? this.#P()
            : "ENOENT" === l
                ? this.#G()
                : (this.children().provisional = 0);
    }
    #E(c = "") {
        "ENOTDIR" === c ? this.parent.#P() : "ENOENT" === c && this.#G();
    }
    #F(u = "") {
        let p = this.#z;
        ((p |= Nt),
            "ENOENT" === u && (p |= j),
            ("EINVAL" === u || "UNKNOWN" === u) && (p &= gt),
            (this.#z = p),
            "ENOTDIR" === u && this.parent && this.parent.#P());
    }
    #R(d, f) {
        return this.#C(d, f) || this.#Q(d, f);
    }
    #Q(g, m) {
        let w = ie(g), $ = this.newChild(g.name, w, { parent: this }), y = $.#z & _;
        return (y !== U && y !== X && y !== L && ($.#z |= yt),
            m.unshift($),
            m.provisional++,
            $);
    }
    #C(b, S) {
        for (let E = S.provisional; E < S.length; E++) {
            let z = S[E];
            if ((this.nocase ? _t(b.name) : bt(b.name)) === z.#t)
                return this.#B(b, z, E, S);
        }
    }
    #B(Z, J, th, tr) {
        let tn = J.name;
        return ((J.#z = (J.#z & gt) | ie(Z)),
            tn !== Z.name && (J.name = Z.name),
            th !== tr.provisional &&
                (th === tr.length - 1 ? tr.pop() : tr.splice(th, 1), tr.unshift(J)),
            tr.provisional++,
            J);
    }
    async lstat() {
        if ((this.#z & j) == 0)
            try {
                return (this.#S(await this.#a.promises.lstat(this.fullpath())), this);
            }
            catch (t) {
                this.#E(t.code);
            }
    }
    lstatSync() {
        if ((this.#z & j) == 0)
            try {
                return (this.#S(this.#a.lstatSync(this.fullpath())), this);
            }
            catch (t) {
                this.#E(t.code);
            }
    }
    #S(to) {
        let { atime: ta, atimeMs: tl, birthtime: tc, birthtimeMs: tu, blksize: tp, blocks: td, ctime: tf, ctimeMs: tg, dev: tm, gid: tw, ino: t$, mode: ty, mtime: tb, mtimeMs: tv, nlink: t_, rdev: tS, size: tk, uid: tx, } = to;
        ((this.#p = ta),
            (this.#l = tl),
            (this.#s = tc),
            (this.#n = tu),
            (this.#h = tp),
            (this.#k = td),
            (this.#r = tf),
            (this.#o = tg),
            (this.#b = tm),
            (this.#f = tw),
            (this.#i = t$),
            (this.#c = ty),
            (this.#q = tb),
            (this.#m = tv),
            (this.#d = t_),
            (this.#g = tS),
            (this.#j = tk),
            (this.#e = tx));
        let tC = ie(to);
        ((this.#z = (this.#z & gt) | tC | je),
            tC !== L && tC !== U && tC !== X && (this.#z |= yt));
    }
    #D = [];
    #K = !1;
    #T(tF) {
        this.#K = !1;
        let tO = this.#D.slice();
        ((this.#D.length = 0), tO.forEach((t) => t(null, tF)));
    }
    readdirCB(t, e = !1) {
        if (!this.canReaddir()) {
            e ? t(null, []) : queueMicrotask(() => t(null, []));
            return;
        }
        let i = this.children();
        if (this.calledReaddir()) {
            let s = i.slice(0, i.provisional);
            e ? t(null, s) : queueMicrotask(() => t(null, s));
            return;
        }
        if ((this.#D.push(t), this.#K))
            return;
        this.#K = !0;
        let h = this.fullpath();
        this.#a.readdir(h, { withFileTypes: !0 }, (t, e) => {
            if (t)
                (this.#O(t.code), (i.provisional = 0));
            else {
                for (let s of e)
                    this.#R(s, i);
                this.#J(i);
            }
            this.#T(i.slice(0, i.provisional));
        });
    }
    #U;
    async readdir() {
        if (!this.canReaddir())
            return [];
        let t = this.children();
        if (this.calledReaddir())
            return t.slice(0, t.provisional);
        let e = this.fullpath();
        if (this.#U)
            await this.#U;
        else {
            let i = () => { };
            this.#U = new Promise((t) => (i = t));
            try {
                for (let s of await this.#a.promises.readdir(e, {
                    withFileTypes: !0,
                }))
                    this.#R(s, t);
                this.#J(t);
            }
            catch (h) {
                (this.#O(h.code), (t.provisional = 0));
            }
            ((this.#U = void 0), i());
        }
        return t.slice(0, t.provisional);
    }
    readdirSync() {
        if (!this.canReaddir())
            return [];
        let t = this.children();
        if (this.calledReaddir())
            return t.slice(0, t.provisional);
        let e = this.fullpath();
        try {
            for (let i of this.#a.readdirSync(e, { withFileTypes: !0 }))
                this.#R(i, t);
            this.#J(t);
        }
        catch (s) {
            (this.#O(s.code), (t.provisional = 0));
        }
        return t.slice(0, t.provisional);
    }
    canReaddir() {
        if (this.#z & Ie)
            return !1;
        let t = _ & this.#z;
        return t === L || t === U || t === X;
    }
    shouldWalk(t, e) {
        return ((this.#z & U) === U &&
            !(this.#z & Ie) &&
            !t.has(this) &&
            (!e || e(this)));
    }
    async realpath() {
        if (this.#L)
            return this.#L;
        if (!((Lt | Nt | j) & this.#z))
            try {
                let t = await this.#a.promises.realpath(this.fullpath());
                return (this.#L = this.resolve(t));
            }
            catch {
                this.#N();
            }
    }
    realpathSync() {
        if (this.#L)
            return this.#L;
        if (!((Lt | Nt | j) & this.#z))
            try {
                let t = this.#a.realpathSync(this.fullpath());
                return (this.#L = this.resolve(t));
            }
            catch {
                this.#N();
            }
    }
    [Ye](t) {
        if (t === this)
            return;
        ((t.isCWD = !1), (this.isCWD = !0));
        let e = new Set([]), i = [], s = this;
        for (; s && s.parent;)
            (e.add(s),
                (s.#x = i.join(this.sep)),
                (s.#y = i.join("/")),
                (s = s.parent),
                i.push(".."));
        for (s = t; s && s.parent && !e.has(s);)
            ((s.#x = void 0), (s.#y = void 0), (s = s.parent));
    }
}, Pt = class t extends R {
    sep = "\\";
    splitSep = Oi;
    constructor(t, e = L, i, s, h, r, n) {
        super(t, e, i, s, h, r, n);
    }
    newChild(e, i = L, s = {}) {
        return new t(e, i, this.root, this.roots, this.nocase, this.childrenCache(), s);
    }
    getRootString(t) {
        return i.parse(t).root;
    }
    getRoot(t) {
        if ((t = Ri(t.toUpperCase())) === this.root.name)
            return this.root;
        for (let [e, i] of Object.entries(this.roots))
            if (this.sameRoot(t, e))
                return (this.roots[t] = i);
        return (this.roots[t] = new it(t, this).root);
    }
    sameRoot(t, e = this.root.name) {
        return ((t = t.toUpperCase().replace(/\//g, "\\").replace($e, "$1\\")) === e);
    }
}, jt = class t extends R {
    splitSep = "/";
    sep = "/";
    constructor(t, e = L, i, s, h, r, n) {
        super(t, e, i, s, h, r, n);
    }
    getRootString(t) {
        return t.startsWith("/") ? "/" : "";
    }
    getRoot(t) {
        return this.root;
    }
    newChild(e, i = L, s = {}) {
        return new t(e, i, this.root, this.roots, this.nocase, this.childrenCache(), s);
    }
}, It = class {
    root;
    rootPath;
    roots;
    cwd;
    #a;
    #b;
    #c;
    nocase;
    #d;
    constructor(t = process.cwd(), e, i, { nocase: h, childrenCacheSize: r = 16384, fs: n = wt } = {}) {
        ((this.#d = Ue(n)),
            (t instanceof URL || t.startsWith("file://")) && (t = s(t)));
        let o = e.resolve(t);
        ((this.roots = Object.create(null)),
            (this.rootPath = this.parseRootPath(o)),
            (this.#a = new Wt()),
            (this.#b = new Wt()),
            (this.#c = new ne(r)));
        let a = o.substring(this.rootPath.length).split(i);
        if ((1 !== a.length || a[0] || a.pop(), void 0 === h))
            throw TypeError("must provide nocase setting to PathScurryBase ctor");
        ((this.nocase = h),
            (this.root = this.newRoot(this.#d)),
            (this.roots[this.rootPath] = this.root));
        let l = this.root, c = a.length - 1, u = e.sep, p = this.rootPath, d = !1;
        for (let f of a) {
            let g = c--;
            ((l = l.child(f, {
                relative: Array(g).fill("..").join(u),
                relativePosix: Array(g).fill("..").join("/"),
                fullpath: (p += (d ? "" : u) + f),
            })),
                (d = !0));
        }
        this.cwd = l;
    }
    depth(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)), t.depth());
    }
    childrenCache() {
        return this.#c;
    }
    resolve(...t) {
        let e = "";
        for (let i = t.length - 1; i >= 0; i--) {
            let s = t[i];
            if (!(!s || "." === s) &&
                ((e = e ? `${s}/${e}` : s), this.isAbsolute(s)))
                break;
        }
        let h = this.#a.get(e);
        if (void 0 !== h)
            return h;
        let r = this.cwd.resolve(e).fullpath();
        return (this.#a.set(e, r), r);
    }
    resolvePosix(...t) {
        let e = "";
        for (let i = t.length - 1; i >= 0; i--) {
            let s = t[i];
            if (!(!s || "." === s) &&
                ((e = e ? `${s}/${e}` : s), this.isAbsolute(s)))
                break;
        }
        let h = this.#b.get(e);
        if (void 0 !== h)
            return h;
        let r = this.cwd.resolve(e).fullpathPosix();
        return (this.#b.set(e, r), r);
    }
    relative(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)), t.relative());
    }
    relativePosix(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)),
            t.relativePosix());
    }
    basename(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)), t.name);
    }
    dirname(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)),
            (t.parent || t).fullpath());
    }
    async readdir(t = this.cwd, e = { withFileTypes: !0 }) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i } = e;
        if (!t.canReaddir())
            return [];
        {
            let s = await t.readdir();
            return i ? s : s.map((t) => t.name);
        }
    }
    readdirSync(t = this.cwd, e = { withFileTypes: !0 }) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i = !0 } = e;
        return t.canReaddir()
            ? i
                ? t.readdirSync()
                : t.readdirSync().map((t) => t.name)
            : [];
    }
    async lstat(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)), t.lstat());
    }
    lstatSync(t = this.cwd) {
        return ("string" == typeof t && (t = this.cwd.resolve(t)), t.lstatSync());
    }
    async readlink(t = this.cwd, { withFileTypes: e } = { withFileTypes: !1 }) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t.withFileTypes), (t = this.cwd));
        let i = await t.readlink();
        return e ? i : i?.fullpath();
    }
    readlinkSync(t = this.cwd, { withFileTypes: e } = { withFileTypes: !1 }) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t.withFileTypes), (t = this.cwd));
        let i = t.readlinkSync();
        return e ? i : i?.fullpath();
    }
    async realpath(t = this.cwd, { withFileTypes: e } = { withFileTypes: !1 }) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t.withFileTypes), (t = this.cwd));
        let i = await t.realpath();
        return e ? i : i?.fullpath();
    }
    realpathSync(t = this.cwd, { withFileTypes: e } = { withFileTypes: !1 }) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t.withFileTypes), (t = this.cwd));
        let i = t.realpathSync();
        return e ? i : i?.fullpath();
    }
    async walk(t = this.cwd, e = {}) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i = !0, follow: s = !1, filter: h, walkFilter: r, } = e, n = [];
        (!h || h(t)) && n.push(i ? t : t.fullpath());
        let o = new Set(), a = (t, e) => {
            (o.add(t),
                t.readdirCB((t, l) => {
                    if (t)
                        return e(t);
                    let c = l.length;
                    if (!c)
                        return e();
                    let u = () => {
                        0 == --c && e();
                    };
                    for (let p of l)
                        ((!h || h(p)) && n.push(i ? p : p.fullpath()),
                            s && p.isSymbolicLink()
                                ? p
                                    .realpath()
                                    .then((t) => (t?.isUnknown() ? t.lstat() : t))
                                    .then((t) => (t?.shouldWalk(o, r) ? a(t, u) : u()))
                                : p.shouldWalk(o, r)
                                    ? a(p, u)
                                    : u());
                }, !0));
        }, l = t;
        return new Promise((t, e) => {
            a(l, (i) => {
                if (i)
                    return e(i);
                t(n);
            });
        });
    }
    walkSync(t = this.cwd, e = {}) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i = !0, follow: s = !1, filter: h, walkFilter: r, } = e, n = [];
        (!h || h(t)) && n.push(i ? t : t.fullpath());
        let o = new Set([t]);
        for (let a of o) {
            let l = a.readdirSync();
            for (let c of l) {
                (!h || h(c)) && n.push(i ? c : c.fullpath());
                let u = c;
                if (c.isSymbolicLink()) {
                    if (!(s && (u = c.realpathSync())))
                        continue;
                    u.isUnknown() && u.lstatSync();
                }
                u.shouldWalk(o, r) && o.add(u);
            }
        }
        return n;
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
    iterate(t = this.cwd, e = {}) {
        return ("string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd)),
            this.stream(t, e)[Symbol.asyncIterator]());
    }
    [Symbol.iterator]() {
        return this.iterateSync();
    }
    *iterateSync(t = this.cwd, e = {}) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i = !0, follow: s = !1, filter: h, walkFilter: r, } = e;
        (!h || h(t)) && (yield i ? t : t.fullpath());
        let n = new Set([t]);
        for (let o of n) {
            let a = o.readdirSync();
            for (let l of a) {
                (!h || h(l)) && (yield i ? l : l.fullpath());
                let c = l;
                if (l.isSymbolicLink()) {
                    if (!(s && (c = l.realpathSync())))
                        continue;
                    c.isUnknown() && c.lstatSync();
                }
                c.shouldWalk(n, r) && n.add(c);
            }
        }
    }
    stream(t = this.cwd, e = {}) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i = !0, follow: s = !1, filter: h, walkFilter: r, } = e, n = new V({ objectMode: !0 });
        (!h || h(t)) && n.write(i ? t : t.fullpath());
        let o = new Set(), a = [t], l = 0, c = () => {
            let t = !1;
            for (; !t;) {
                let e = a.shift();
                if (!e) {
                    0 === l && n.end();
                    return;
                }
                (l++, o.add(e));
                let u = (e, d, f = !1) => {
                    if (e)
                        return n.emit("error", e);
                    if (s && !f) {
                        let g = [];
                        for (let m of d)
                            m.isSymbolicLink() &&
                                g.push(m
                                    .realpath()
                                    .then((t) => (t?.isUnknown() ? t.lstat() : t)));
                        if (g.length) {
                            Promise.all(g).then(() => u(null, d, !0));
                            return;
                        }
                    }
                    for (let w of d)
                        w &&
                            (!h || h(w)) &&
                            (n.write(i ? w : w.fullpath()) || (t = !0));
                    for (let $ of (l--, d)) {
                        let y = $.realpathCached() || $;
                        y.shouldWalk(o, r) && a.push(y);
                    }
                    t && !n.flowing ? n.once("drain", c) : p || c();
                }, p = !0;
                (e.readdirCB(u, !0), (p = !1));
            }
        };
        return (c(), n);
    }
    streamSync(t = this.cwd, e = {}) {
        "string" == typeof t
            ? (t = this.cwd.resolve(t))
            : t instanceof R || ((e = t), (t = this.cwd));
        let { withFileTypes: i = !0, follow: s = !1, filter: h, walkFilter: r, } = e, n = new V({ objectMode: !0 }), o = new Set();
        (!h || h(t)) && n.write(i ? t : t.fullpath());
        let a = [t], l = 0, c = () => {
            let t = !1;
            for (; !t;) {
                let e = a.shift();
                if (!e) {
                    0 === l && n.end();
                    return;
                }
                (l++, o.add(e));
                let u = e.readdirSync();
                for (let p of u)
                    (!h || h(p)) && (n.write(i ? p : p.fullpath()) || (t = !0));
                for (let d of (l--, u)) {
                    let f = d;
                    if (d.isSymbolicLink()) {
                        if (!(s && (f = d.realpathSync())))
                            continue;
                        f.isUnknown() && f.lstatSync();
                    }
                    f.shouldWalk(o, r) && a.push(f);
                }
            }
            t && !n.flowing && n.once("drain", c);
        };
        return (c(), n);
    }
    chdir(t = this.cwd) {
        let e = this.cwd;
        ((this.cwd = "string" == typeof t ? this.cwd.resolve(t) : t),
            this.cwd[Ye](e));
    }
}, it = class extends It {
    sep = "\\";
    constructor(t = process.cwd(), e = {}) {
        let { nocase: s = !0 } = e;
        (super(t, i, "\\", { ...e, nocase: s }), (this.nocase = s));
        for (let h = this.cwd; h; h = h.parent)
            h.nocase = this.nocase;
    }
    parseRootPath(t) {
        return i.parse(t).root.toUpperCase();
    }
    newRoot(t) {
        return new Pt(this.rootPath, U, void 0, this.roots, this.nocase, this.childrenCache(), { fs: t });
    }
    isAbsolute(t) {
        return (t.startsWith("/") || t.startsWith("\\") || /^[a-z]:(\/|\\)/i.test(t));
    }
}, rt = class extends It {
    sep = "/";
    constructor(t = process.cwd(), i = {}) {
        let { nocase: s = !1 } = i;
        (super(t, e, "/", { ...i, nocase: s }), (this.nocase = s));
    }
    parseRootPath(t) {
        return "/";
    }
    newRoot(t) {
        return new jt(this.rootPath, U, void 0, this.roots, this.nocase, this.childrenCache(), { fs: t });
    }
    isAbsolute(t) {
        return t.startsWith("/");
    }
}, St = class extends rt {
    constructor(t = process.cwd(), e = {}) {
        let { nocase: i = !0 } = e;
        super(t, { ...e, nocase: i });
    }
}, Cr = "win32" === process.platform ? Pt : jt, Xe = "win32" === process.platform ? it : "darwin" === process.platform ? St : rt, Di = (t) => t.length >= 1, Mi = (t) => t.length >= 1, Ni = Symbol.for("nodejs.util.inspect.custom"), nt = class t {
    #a;
    #b;
    #c;
    length;
    #d;
    #e;
    #f;
    #g;
    #h;
    #i;
    #j = !0;
    constructor(t, e, i, s) {
        if (!Di(t))
            throw TypeError("empty pattern list");
        if (!Mi(e))
            throw TypeError("empty glob list");
        if (e.length !== t.length)
            throw TypeError("mismatched pattern list and glob list lengths");
        if (((this.length = t.length), i < 0 || i >= this.length))
            throw TypeError("index out of range");
        if (((this.#a = t),
            (this.#b = e),
            (this.#c = i),
            (this.#d = s),
            0 === this.#c)) {
            if (this.isUNC()) {
                let [h, r, n, o, ...a] = this.#a, [l, c, u, p, ...d] = this.#b;
                "" === a[0] && (a.shift(), d.shift());
                let f = [h, r, n, o, ""].join("/"), g = [l, c, u, p, ""].join("/");
                ((this.#a = [f, ...a]),
                    (this.#b = [g, ...d]),
                    (this.length = this.#a.length));
            }
            else if (this.isDrive() || this.isAbsolute()) {
                let [m, ...w] = this.#a, [$, ...y] = this.#b;
                "" === w[0] && (w.shift(), y.shift());
                let b = m + "/", S = $ + "/";
                ((this.#a = [b, ...w]),
                    (this.#b = [S, ...y]),
                    (this.length = this.#a.length));
            }
        }
    }
    [Ni]() {
        return "Pattern <" + this.#b.slice(this.#c).join("/") + ">";
    }
    pattern() {
        return this.#a[this.#c];
    }
    isString() {
        return "string" == typeof this.#a[this.#c];
    }
    isGlobstar() {
        return this.#a[this.#c] === A;
    }
    isRegExp() {
        return this.#a[this.#c] instanceof RegExp;
    }
    globString() {
        return (this.#f =
            this.#f ||
                (0 === this.#c
                    ? this.isAbsolute()
                        ? this.#b[0] + this.#b.slice(1).join("/")
                        : this.#b.join("/")
                    : this.#b.slice(this.#c).join("/")));
    }
    hasMore() {
        return this.length > this.#c + 1;
    }
    rest() {
        return void 0 !== this.#e
            ? this.#e
            : this.hasMore()
                ? ((this.#e = new t(this.#a, this.#b, this.#c + 1, this.#d)),
                    (this.#e.#i = this.#i),
                    (this.#e.#h = this.#h),
                    (this.#e.#g = this.#g),
                    this.#e)
                : (this.#e = null);
    }
    isUNC() {
        let t = this.#a;
        return void 0 !== this.#h
            ? this.#h
            : (this.#h =
                "win32" === this.#d &&
                    0 === this.#c &&
                    "" === t[0] &&
                    "" === t[1] &&
                    "string" == typeof t[2] &&
                    !!t[2] &&
                    "string" == typeof t[3] &&
                    !!t[3]);
    }
    isDrive() {
        let t = this.#a;
        return void 0 !== this.#g
            ? this.#g
            : (this.#g =
                "win32" === this.#d &&
                    0 === this.#c &&
                    this.length > 1 &&
                    "string" == typeof t[0] &&
                    /^[a-z]:$/i.test(t[0]));
    }
    isAbsolute() {
        let t = this.#a;
        return void 0 !== this.#i
            ? this.#i
            : (this.#i =
                ("" === t[0] && t.length > 1) || this.isDrive() || this.isUNC());
    }
    root() {
        let t = this.#a[0];
        return "string" == typeof t && this.isAbsolute() && 0 === this.#c
            ? t
            : "";
    }
    checkFollowGlobstar() {
        return !(0 === this.#c || !this.isGlobstar() || !this.#j);
    }
    markFollowGlobstar() {
        return (!!(0 !== this.#c && this.isGlobstar()) &&
            !!this.#j &&
            ((this.#j = !1), !0));
    }
}, _i = "object" == typeof process && process && "string" == typeof process.platform
    ? process.platform
    : "linux", ot = class {
    relative;
    relativeChildren;
    absolute;
    absoluteChildren;
    platform;
    mmopts;
    constructor(t, { nobrace: e, nocase: i, noext: s, noglobstar: h, platform: r = _i }) {
        for (let n of ((this.relative = []),
            (this.absolute = []),
            (this.relativeChildren = []),
            (this.absoluteChildren = []),
            (this.platform = r),
            (this.mmopts = {
                dot: !0,
                nobrace: e,
                nocase: i,
                noext: s,
                noglobstar: h,
                optimizationLevel: 2,
                platform: r,
                nocomment: !0,
                nonegate: !0,
            }),
            t))
            this.add(n);
    }
    add(t) {
        let e = new D(t, this.mmopts);
        for (let i = 0; i < e.set.length; i++) {
            let s = e.set[i], h = e.globParts[i];
            if (!s || !h)
                throw Error("invalid pattern object");
            for (; "." === s[0] && "." === h[0];)
                (s.shift(), h.shift());
            let r = new nt(s, h, 0, this.platform), n = new D(r.globString(), this.mmopts), o = "**" === h[h.length - 1], a = r.isAbsolute();
            (a ? this.absolute.push(n) : this.relative.push(n),
                o &&
                    (a
                        ? this.absoluteChildren.push(n)
                        : this.relativeChildren.push(n)));
        }
    }
    ignored(t) {
        let e = t.fullpath(), i = `${e}/`, s = t.relative() || ".", h = `${s}/`;
        for (let r of this.relative)
            if (r.match(s) || r.match(h))
                return !0;
        for (let n of this.absolute)
            if (n.match(e) || n.match(i))
                return !0;
        return !1;
    }
    childrenIgnored(t) {
        let e = t.fullpath() + "/", i = (t.relative() || ".") + "/";
        for (let s of this.relativeChildren)
            if (s.match(i))
                return !0;
        for (let h of this.absoluteChildren)
            if (h.match(e))
                return !0;
        return !1;
    }
}, oe = class t {
    store;
    constructor(t = new Map()) {
        this.store = t;
    }
    copy() {
        return new t(new Map(this.store));
    }
    hasWalked(t, e) {
        return this.store.get(t.fullpath())?.has(e.globString());
    }
    storeWalked(t, e) {
        let i = t.fullpath(), s = this.store.get(i);
        s ? s.add(e.globString()) : this.store.set(i, new Set([e.globString()]));
    }
}, he = class {
    store = new Map();
    add(t, e, i) {
        let s = (e ? 2 : 0) | (i ? 1 : 0), h = this.store.get(t);
        this.store.set(t, void 0 === h ? s : s & h);
    }
    entries() {
        return [...this.store.entries()].map(([t, e]) => [
            t,
            !!(2 & e),
            !!(1 & e),
        ]);
    }
}, ae = class {
    store = new Map();
    add(t, e) {
        if (!t.canReaddir())
            return;
        let i = this.store.get(t);
        i
            ? i.find((t) => t.globString() === e.globString()) || i.push(e)
            : this.store.set(t, [e]);
    }
    get(t) {
        let e = this.store.get(t);
        if (!e)
            throw Error("attempting to walk unknown path");
        return e;
    }
    entries() {
        return this.keys().map((t) => [t, this.store.get(t)]);
    }
    keys() {
        return [...this.store.keys()].filter((t) => t.canReaddir());
    }
}, Et = class t {
    hasWalkedCache;
    matches = new he();
    subwalks = new ae();
    patterns;
    follow;
    dot;
    opts;
    constructor(t, e) {
        ((this.opts = t),
            (this.follow = !!t.follow),
            (this.dot = !!t.dot),
            (this.hasWalkedCache = e ? e.copy() : new oe()));
    }
    processPatterns(t, e) {
        this.patterns = e;
        let i = e.map((e) => [t, e]);
        for (let [s, h] of i) {
            this.hasWalkedCache.storeWalked(s, h);
            let r = h.root(), n = h.isAbsolute() && !1 !== this.opts.absolute;
            if (r) {
                s = s.resolve("/" === r && void 0 !== this.opts.root ? this.opts.root : r);
                let o = h.rest();
                if (o)
                    h = o;
                else {
                    this.matches.add(s, !0, !1);
                    continue;
                }
            }
            if (s.isENOENT())
                continue;
            let a, l, c = !1;
            for (; "string" == typeof (a = h.pattern()) && (l = h.rest());)
                ((s = s.resolve(a)), (h = l), (c = !0));
            if (((a = h.pattern()), (l = h.rest()), c)) {
                if (this.hasWalkedCache.hasWalked(s, h))
                    continue;
                this.hasWalkedCache.storeWalked(s, h);
            }
            if ("string" == typeof a) {
                let u = ".." === a || "" === a || "." === a;
                this.matches.add(s.resolve(a), n, u);
                continue;
            }
            if (a === A) {
                (!s.isSymbolicLink() || this.follow || h.checkFollowGlobstar()) &&
                    this.subwalks.add(s, h);
                let p = l?.pattern(), d = l?.rest();
                if (l && (("" !== p && "." !== p) || d)) {
                    if (".." === p) {
                        let f = s.parent || s;
                        d
                            ? this.hasWalkedCache.hasWalked(f, d) || this.subwalks.add(f, d)
                            : this.matches.add(f, n, !0);
                    }
                }
                else
                    this.matches.add(s, n, "" === p || "." === p);
            }
            else
                a instanceof RegExp && this.subwalks.add(s, h);
        }
        return this;
    }
    subwalkTargets() {
        return this.subwalks.keys();
    }
    child() {
        return new t(this.opts, this.hasWalkedCache);
    }
    filterEntries(t, e) {
        let i = this.subwalks.get(t), s = this.child();
        for (let h of e)
            for (let r of i) {
                let n = r.isAbsolute(), o = r.pattern(), a = r.rest();
                o === A
                    ? s.testGlobstar(h, r, a, n)
                    : o instanceof RegExp
                        ? s.testRegExp(h, o, a, n)
                        : s.testString(h, o, a, n);
            }
        return s;
    }
    testGlobstar(t, e, i, s) {
        if (((this.dot || !t.name.startsWith(".")) &&
            (e.hasMore() || this.matches.add(t, s, !1),
                t.canReaddir() &&
                    (this.follow || !t.isSymbolicLink()
                        ? this.subwalks.add(t, e)
                        : t.isSymbolicLink() &&
                            (i && e.checkFollowGlobstar()
                                ? this.subwalks.add(t, i)
                                : e.markFollowGlobstar() && this.subwalks.add(t, e)))),
            i)) {
            let h = i.pattern();
            if ("string" == typeof h && ".." !== h && "" !== h && "." !== h)
                this.testString(t, h, i.rest(), s);
            else if (".." === h) {
                let r = t.parent || t;
                this.subwalks.add(r, i);
            }
            else
                h instanceof RegExp && this.testRegExp(t, h, i.rest(), s);
        }
    }
    testRegExp(t, e, i, s) {
        e.test(t.name) &&
            (i ? this.subwalks.add(t, i) : this.matches.add(t, s, !1));
    }
    testString(t, e, i, s) {
        t.isNamed(e) &&
            (i ? this.subwalks.add(t, i) : this.matches.add(t, s, !1));
    }
}, Li = (t, e) => "string" == typeof t ? new ot([t], e) : Array.isArray(t) ? new ot(t, e) : t, zt = class {
    path;
    patterns;
    opts;
    seen = new Set();
    paused = !1;
    aborted = !1;
    #a = [];
    #b;
    #c;
    signal;
    maxDepth;
    includeChildMatches;
    constructor(t, e, i) {
        if (((this.patterns = t),
            (this.path = e),
            (this.opts = i),
            (this.#c = i.posix || "win32" !== i.platform ? "/" : "\\"),
            (this.includeChildMatches = !1 !== i.includeChildMatches),
            (i.ignore || !this.includeChildMatches) &&
                ((this.#b = Li(i.ignore ?? [], i)),
                    !this.includeChildMatches && "function" != typeof this.#b.add)))
            throw Error("cannot ignore child matches, ignore lacks add() method.");
        ((this.maxDepth = i.maxDepth || 1 / 0),
            i.signal &&
                ((this.signal = i.signal),
                    this.signal.addEventListener("abort", () => {
                        this.#a.length = 0;
                    })));
    }
    #d(t) {
        return this.seen.has(t) || !!this.#b?.ignored?.(t);
    }
    #e(e) {
        return !!this.#b?.childrenIgnored?.(e);
    }
    pause() {
        this.paused = !0;
    }
    resume() {
        if (this.signal?.aborted)
            return;
        this.paused = !1;
        let t;
        for (; !this.paused && (t = this.#a.shift());)
            t();
    }
    onResume(t) {
        this.signal?.aborted || (this.paused ? this.#a.push(t) : t());
    }
    async matchCheck(t, e) {
        if (e && this.opts.nodir)
            return;
        let i;
        if (this.opts.realpath) {
            if (!(i = t.realpathCached() || (await t.realpath())))
                return;
            t = i;
        }
        let s = t.isUnknown() || this.opts.stat ? await t.lstat() : t;
        if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
            let h = await s.realpath();
            h && (h.isUnknown() || this.opts.stat) && (await h.lstat());
        }
        return this.matchCheckTest(s, e);
    }
    matchCheckTest(t, e) {
        return t &&
            (this.maxDepth === 1 / 0 || t.depth() <= this.maxDepth) &&
            (!e || t.canReaddir()) &&
            (!this.opts.nodir || !t.isDirectory()) &&
            (!this.opts.nodir ||
                !this.opts.follow ||
                !t.isSymbolicLink() ||
                !t.realpathCached()?.isDirectory()) &&
            !this.#d(t)
            ? t
            : void 0;
    }
    matchCheckSync(t, e) {
        if (e && this.opts.nodir)
            return;
        let i;
        if (this.opts.realpath) {
            if (!(i = t.realpathCached() || t.realpathSync()))
                return;
            t = i;
        }
        let s = t.isUnknown() || this.opts.stat ? t.lstatSync() : t;
        if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
            let h = s.realpathSync();
            h && (h?.isUnknown() || this.opts.stat) && h.lstatSync();
        }
        return this.matchCheckTest(s, e);
    }
    matchFinish(t, e) {
        if (this.#d(t))
            return;
        if (!this.includeChildMatches && this.#b?.add) {
            let i = `${t.relativePosix()}/**`;
            this.#b.add(i);
        }
        let s = void 0 === this.opts.absolute ? e : this.opts.absolute;
        this.seen.add(t);
        let h = this.opts.mark && t.isDirectory() ? this.#c : "";
        if (this.opts.withFileTypes)
            this.matchEmit(t);
        else if (s) {
            let r = this.opts.posix ? t.fullpathPosix() : t.fullpath();
            this.matchEmit(r + h);
        }
        else {
            let n = this.opts.posix ? t.relativePosix() : t.relative(), o = this.opts.dotRelative && !n.startsWith(".." + this.#c)
                ? "." + this.#c
                : "";
            this.matchEmit(n ? o + n + h : "." + h);
        }
    }
    async match(t, e, i) {
        let s = await this.matchCheck(t, i);
        s && this.matchFinish(s, e);
    }
    matchSync(t, e, i) {
        let s = this.matchCheckSync(t, i);
        s && this.matchFinish(s, e);
    }
    walkCB(t, e, i) {
        (this.signal?.aborted && i(), this.walkCB2(t, e, new Et(this.opts), i));
    }
    walkCB2(t, e, i, s) {
        if (this.#e(t))
            return s();
        if ((this.signal?.aborted && s(), this.paused)) {
            this.onResume(() => this.walkCB2(t, e, i, s));
            return;
        }
        i.processPatterns(t, e);
        let h = 1, r = () => {
            0 == --h && s();
        };
        for (let [n, o, a] of i.matches.entries())
            this.#d(n) || (h++, this.match(n, o, a).then(() => r()));
        for (let l of i.subwalkTargets()) {
            if (this.maxDepth !== 1 / 0 && l.depth() >= this.maxDepth)
                continue;
            h++;
            let c = l.readdirCached();
            l.calledReaddir()
                ? this.walkCB3(l, c, i, r)
                : l.readdirCB((t, e) => this.walkCB3(l, e, i, r), !0);
        }
        r();
    }
    walkCB3(t, e, i, s) {
        i = i.filterEntries(t, e);
        let h = 1, r = () => {
            0 == --h && s();
        };
        for (let [n, o, a] of i.matches.entries())
            this.#d(n) || (h++, this.match(n, o, a).then(() => r()));
        for (let [l, c] of i.subwalks.entries())
            (h++, this.walkCB2(l, c, i.child(), r));
        r();
    }
    walkCBSync(t, e, i) {
        (this.signal?.aborted && i(),
            this.walkCB2Sync(t, e, new Et(this.opts), i));
    }
    walkCB2Sync(t, e, i, s) {
        if (this.#e(t))
            return s();
        if ((this.signal?.aborted && s(), this.paused)) {
            this.onResume(() => this.walkCB2Sync(t, e, i, s));
            return;
        }
        i.processPatterns(t, e);
        let h = 1, r = () => {
            0 == --h && s();
        };
        for (let [n, o, a] of i.matches.entries())
            this.#d(n) || this.matchSync(n, o, a);
        for (let l of i.subwalkTargets()) {
            if (this.maxDepth !== 1 / 0 && l.depth() >= this.maxDepth)
                continue;
            h++;
            let c = l.readdirSync();
            this.walkCB3Sync(l, c, i, r);
        }
        r();
    }
    walkCB3Sync(t, e, i, s) {
        i = i.filterEntries(t, e);
        let h = 1, r = () => {
            0 == --h && s();
        };
        for (let [n, o, a] of i.matches.entries())
            this.#d(n) || this.matchSync(n, o, a);
        for (let [l, c] of i.subwalks.entries())
            (h++, this.walkCB2Sync(l, c, i.child(), r));
        r();
    }
}, xt = class extends zt {
    matches = new Set();
    constructor(t, e, i) {
        super(t, e, i);
    }
    matchEmit(t) {
        this.matches.add(t);
    }
    async walk() {
        if (this.signal?.aborted)
            throw this.signal.reason;
        return (this.path.isUnknown() && (await this.path.lstat()),
            await new Promise((t, e) => {
                this.walkCB(this.path, this.patterns, () => {
                    this.signal?.aborted ? e(this.signal.reason) : t(this.matches);
                });
            }),
            this.matches);
    }
    walkSync() {
        if (this.signal?.aborted)
            throw this.signal.reason;
        return (this.path.isUnknown() && this.path.lstatSync(),
            this.walkCBSync(this.path, this.patterns, () => {
                if (this.signal?.aborted)
                    throw this.signal.reason;
            }),
            this.matches);
    }
}, vt = class extends zt {
    results;
    constructor(t, e, i) {
        (super(t, e, i),
            (this.results = new V({ signal: this.signal, objectMode: !0 })),
            this.results.on("drain", () => this.resume()),
            this.results.on("resume", () => this.resume()));
    }
    matchEmit(t) {
        (this.results.write(t), this.results.flowing || this.pause());
    }
    stream() {
        let t = this.path;
        return (t.isUnknown()
            ? t.lstat().then(() => {
                this.walkCB(t, this.patterns, () => this.results.end());
            })
            : this.walkCB(t, this.patterns, () => this.results.end()),
            this.results);
    }
    streamSync() {
        return (this.path.isUnknown() && this.path.lstatSync(),
            this.walkCBSync(this.path, this.patterns, () => this.results.end()),
            this.results);
    }
}, Pi = "object" == typeof process && process && "string" == typeof process.platform
    ? process.platform
    : "linux", I = class {
    absolute;
    cwd;
    root;
    dot;
    dotRelative;
    follow;
    ignore;
    magicalBraces;
    mark;
    matchBase;
    maxDepth;
    nobrace;
    nocase;
    nodir;
    noext;
    noglobstar;
    pattern;
    platform;
    realpath;
    scurry;
    stat;
    signal;
    windowsPathsNoEscape;
    withFileTypes;
    includeChildMatches;
    opts;
    patterns;
    constructor(e, i) {
        if (!i)
            throw TypeError("glob options required");
        if (((this.withFileTypes = !!i.withFileTypes),
            (this.signal = i.signal),
            (this.follow = !!i.follow),
            (this.dot = !!i.dot),
            (this.dotRelative = !!i.dotRelative),
            (this.nodir = !!i.nodir),
            (this.mark = !!i.mark),
            i.cwd
                ? (i.cwd instanceof URL || i.cwd.startsWith("file://")) &&
                    (i.cwd = t(i.cwd))
                : (this.cwd = ""),
            (this.cwd = i.cwd || ""),
            (this.root = i.root),
            (this.magicalBraces = !!i.magicalBraces),
            (this.nobrace = !!i.nobrace),
            (this.noext = !!i.noext),
            (this.realpath = !!i.realpath),
            (this.absolute = i.absolute),
            (this.includeChildMatches = !1 !== i.includeChildMatches),
            (this.noglobstar = !!i.noglobstar),
            (this.matchBase = !!i.matchBase),
            (this.maxDepth = "number" == typeof i.maxDepth ? i.maxDepth : 1 / 0),
            (this.stat = !!i.stat),
            (this.ignore = i.ignore),
            this.withFileTypes && void 0 !== this.absolute))
            throw Error("cannot set absolute and withFileTypes:true");
        if (("string" == typeof e && (e = [e]),
            (this.windowsPathsNoEscape =
                !!i.windowsPathsNoEscape || !1 === i.allowWindowsEscape),
            this.windowsPathsNoEscape && (e = e.map((t) => t.replace(/\\/g, "/"))),
            this.matchBase)) {
            if (i.noglobstar)
                throw TypeError("base matching requires globstar");
            e = e.map((t) => (t.includes("/") ? t : `./**/${t}`));
        }
        if (((this.pattern = e),
            (this.platform = i.platform || Pi),
            (this.opts = { ...i, platform: this.platform }),
            i.scurry)) {
            if (((this.scurry = i.scurry),
                void 0 !== i.nocase && i.nocase !== i.scurry.nocase))
                throw Error("nocase option contradicts provided scurry option");
        }
        else {
            let s = "win32" === i.platform
                ? it
                : "darwin" === i.platform
                    ? St
                    : i.platform
                        ? rt
                        : Xe;
            this.scurry = new s(this.cwd, { nocase: i.nocase, fs: i.fs });
        }
        this.nocase = this.scurry.nocase;
        let h = "darwin" === this.platform || "win32" === this.platform, r = {
            braceExpandMax: 1e4,
            ...i,
            dot: this.dot,
            matchBase: this.matchBase,
            nobrace: this.nobrace,
            nocase: this.nocase,
            nocaseMagicOnly: h,
            nocomment: !0,
            noext: this.noext,
            nonegate: !0,
            optimizationLevel: 2,
            platform: this.platform,
            windowsPathsNoEscape: this.windowsPathsNoEscape,
            debug: !!this.opts.debug,
        }, [n, o] = this.pattern
            .map((t) => new D(t, r))
            .reduce((t, e) => (t[0].push(...e.set), t[1].push(...e.globParts), t), [[], []]);
        this.patterns = n.map((t, e) => {
            let i = o[e];
            if (!i)
                throw Error("invalid pattern object");
            return new nt(t, i, 0, this.platform);
        });
    }
    async walk() {
        return [
            ...(await new xt(this.patterns, this.scurry.cwd, {
                ...this.opts,
                maxDepth: this.maxDepth !== 1 / 0
                    ? this.maxDepth + this.scurry.cwd.depth()
                    : 1 / 0,
                platform: this.platform,
                nocase: this.nocase,
                includeChildMatches: this.includeChildMatches,
            }).walk()),
        ];
    }
    walkSync() {
        return [
            ...new xt(this.patterns, this.scurry.cwd, {
                ...this.opts,
                maxDepth: this.maxDepth !== 1 / 0
                    ? this.maxDepth + this.scurry.cwd.depth()
                    : 1 / 0,
                platform: this.platform,
                nocase: this.nocase,
                includeChildMatches: this.includeChildMatches,
            }).walkSync(),
        ];
    }
    stream() {
        return new vt(this.patterns, this.scurry.cwd, {
            ...this.opts,
            maxDepth: this.maxDepth !== 1 / 0
                ? this.maxDepth + this.scurry.cwd.depth()
                : 1 / 0,
            platform: this.platform,
            nocase: this.nocase,
            includeChildMatches: this.includeChildMatches,
        }).stream();
    }
    streamSync() {
        return new vt(this.patterns, this.scurry.cwd, {
            ...this.opts,
            maxDepth: this.maxDepth !== 1 / 0
                ? this.maxDepth + this.scurry.cwd.depth()
                : 1 / 0,
            platform: this.platform,
            nocase: this.nocase,
            includeChildMatches: this.includeChildMatches,
        }).streamSync();
    }
    iterateSync() {
        return this.streamSync()[Symbol.iterator]();
    }
    [Symbol.iterator]() {
        return this.iterateSync();
    }
    iterate() {
        return this.stream()[Symbol.asyncIterator]();
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}, le = (t, e = {}) => {
    for (let i of (Array.isArray(t) || (t = [t]), t))
        if (new D(i, e).hasMagic())
            return !0;
    return !1;
};
function Bt(t, e = {}) {
    return new I(t, e).streamSync();
}
function Qe(t, e = {}) {
    return new I(t, e).stream();
}
function ts(t, e = {}) {
    return new I(t, e).walkSync();
}
async function Je(t, e = {}) {
    return new I(t, e).walk();
}
function Ut(t, e = {}) {
    return new I(t, e).iterateSync();
}
function es(t, e = {}) {
    return new I(t, e).iterate();
}
var ji = Bt, Ii = Object.assign(Qe, { sync: Bt }), zi = Ut, Bi = Object.assign(es, { sync: Ut }), Ui = Object.assign(ts, { stream: Bt, iterate: Ut }), Ze = Object.assign(Je, {
    glob: Je,
    globSync: ts,
    sync: Ui,
    globStream: Qe,
    stream: Ii,
    globStreamSync: Bt,
    streamSync: ji,
    globIterate: es,
    iterate: Bi,
    globIterateSync: Ut,
    iterateSync: zi,
    Glob: I,
    hasMagic: le,
    escape: tt,
    unescape: W,
});
Ze.glob = Ze;
export { I as Glob, ot as Ignore, tt as escape, Ze as glob, es as globIterate, Ut as globIterateSync, Qe as globStream, Bt as globStreamSync, ts as globSync, le as hasMagic, Bi as iterate, zi as iterateSync, Ii as stream, ji as streamSync, Ui as sync, W as unescape, };
