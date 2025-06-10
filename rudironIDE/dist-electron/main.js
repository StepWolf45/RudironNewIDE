var wi = Object.defineProperty;
var Us = (e) => {
  throw TypeError(e);
};
var Si = (e, t, r) => t in e ? wi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var dt = (e, t, r) => Si(e, typeof t != "symbol" ? t + "" : t, r), qs = (e, t, r) => t.has(e) || Us("Cannot " + r);
var Z = (e, t, r) => (qs(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Ot = (e, t, r) => t.has(e) ? Us("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Tt = (e, t, r, n) => (qs(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import eo, { ipcMain as Ne, app as Gt, BrowserWindow as to, dialog as ro } from "electron";
import { createRequire as bi } from "node:module";
import { fileURLToPath as Pi } from "node:url";
import De from "path";
import Ri from "fs";
import ae from "node:process";
import x from "node:path";
import { promisify as le, isDeepStrictEqual as Ii } from "node:util";
import K from "node:fs";
import jt from "node:crypto";
import Ni from "node:assert";
import gr from "node:os";
const ot = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Qr = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Oi = new Set("0123456789");
function vr(e) {
  const t = [];
  let r = "", n = "start", s = !1;
  for (const a of e)
    switch (a) {
      case "\\": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        s && (r += a), n = "property", s = !s;
        break;
      }
      case ".": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (Qr.has(r))
          return [];
        t.push(r), r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (n === "property") {
          if (Qr.has(r))
            return [];
          t.push(r), r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          t.push(Number.parseInt(r, 10)), r = "", n = "indexEnd";
          break;
        }
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (n === "index" && !Oi.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (Qr.has(r))
        return [];
      t.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function In(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function no(e, t) {
  if (In(e, t))
    throw new Error("Cannot use string index");
}
function Ti(e, t, r) {
  if (!ot(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = vr(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (In(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function Gs(e, t, r) {
  if (!ot(e) || typeof t != "string")
    return e;
  const n = e, s = vr(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    no(e, o), a === s.length - 1 ? e[o] = r : ot(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function ji(e, t) {
  if (!ot(e) || typeof t != "string")
    return !1;
  const r = vr(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (no(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !ot(e))
      return !1;
  }
}
function Ai(e, t) {
  if (!ot(e) || typeof t != "string")
    return !1;
  const r = vr(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!ot(e) || !(n in e) || In(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Je = gr.homedir(), Nn = gr.tmpdir(), { env: gt } = ae, ki = (e) => {
  const t = x.join(Je, "Library");
  return {
    data: x.join(t, "Application Support", e),
    config: x.join(t, "Preferences", e),
    cache: x.join(t, "Caches", e),
    log: x.join(t, "Logs", e),
    temp: x.join(Nn, e)
  };
}, Ci = (e) => {
  const t = gt.APPDATA || x.join(Je, "AppData", "Roaming"), r = gt.LOCALAPPDATA || x.join(Je, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: x.join(r, e, "Data"),
    config: x.join(t, e, "Config"),
    cache: x.join(r, e, "Cache"),
    log: x.join(r, e, "Log"),
    temp: x.join(Nn, e)
  };
}, Di = (e) => {
  const t = x.basename(Je);
  return {
    data: x.join(gt.XDG_DATA_HOME || x.join(Je, ".local", "share"), e),
    config: x.join(gt.XDG_CONFIG_HOME || x.join(Je, ".config"), e),
    cache: x.join(gt.XDG_CACHE_HOME || x.join(Je, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: x.join(gt.XDG_STATE_HOME || x.join(Je, ".local", "state"), e),
    temp: x.join(Nn, t, e)
  };
};
function Li(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ae.platform === "darwin" ? ki(e) : ae.platform === "win32" ? Ci(e) : Di(e);
}
const Ke = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, Le = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, Mi = ae.getuid ? !ae.getuid() : !1, Vi = 1e4, ge = () => {
}, ee = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ee.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Mi && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!ee.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!ee.isNodeError(e))
      throw e;
    if (!ee.isChangeErrorOk(e))
      throw e;
  }
};
class Fi {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = Vi, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (t) => {
      this.queueWaiting.add(t), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (t) => {
      this.queueWaiting.delete(t), this.queueActive.delete(t);
    }, this.schedule = () => new Promise((t) => {
      const r = () => this.remove(n), n = () => t(r);
      this.add(n);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const t of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(t), this.queueActive.add(t), t();
        }
      }
    };
  }
}
const zi = new Fi(), He = (e, t) => function(n) {
  return function s(...a) {
    return zi.schedule().then((o) => {
      const l = (d) => (o(), d), i = (d) => {
        if (o(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const c = Math.round(100 * Math.random());
          return new Promise((_) => setTimeout(_, c)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return e.apply(void 0, a).then(l, i);
    });
  };
}, Xe = (e, t) => function(n) {
  return function s(...a) {
    try {
      return e.apply(void 0, a);
    } catch (o) {
      if (Date.now() > n)
        throw o;
      if (t(o))
        return s.apply(void 0, a);
      throw o;
    }
  };
}, de = {
  attempt: {
    /* ASYNC */
    chmod: Ke(le(K.chmod), ee.onChangeError),
    chown: Ke(le(K.chown), ee.onChangeError),
    close: Ke(le(K.close), ge),
    fsync: Ke(le(K.fsync), ge),
    mkdir: Ke(le(K.mkdir), ge),
    realpath: Ke(le(K.realpath), ge),
    stat: Ke(le(K.stat), ge),
    unlink: Ke(le(K.unlink), ge),
    /* SYNC */
    chmodSync: Le(K.chmodSync, ee.onChangeError),
    chownSync: Le(K.chownSync, ee.onChangeError),
    closeSync: Le(K.closeSync, ge),
    existsSync: Le(K.existsSync, ge),
    fsyncSync: Le(K.fsync, ge),
    mkdirSync: Le(K.mkdirSync, ge),
    realpathSync: Le(K.realpathSync, ge),
    statSync: Le(K.statSync, ge),
    unlinkSync: Le(K.unlinkSync, ge)
  },
  retry: {
    /* ASYNC */
    close: He(le(K.close), ee.isRetriableError),
    fsync: He(le(K.fsync), ee.isRetriableError),
    open: He(le(K.open), ee.isRetriableError),
    readFile: He(le(K.readFile), ee.isRetriableError),
    rename: He(le(K.rename), ee.isRetriableError),
    stat: He(le(K.stat), ee.isRetriableError),
    write: He(le(K.write), ee.isRetriableError),
    writeFile: He(le(K.writeFile), ee.isRetriableError),
    /* SYNC */
    closeSync: Xe(K.closeSync, ee.isRetriableError),
    fsyncSync: Xe(K.fsyncSync, ee.isRetriableError),
    openSync: Xe(K.openSync, ee.isRetriableError),
    readFileSync: Xe(K.readFileSync, ee.isRetriableError),
    renameSync: Xe(K.renameSync, ee.isRetriableError),
    statSync: Xe(K.statSync, ee.isRetriableError),
    writeSync: Xe(K.writeSync, ee.isRetriableError),
    writeFileSync: Xe(K.writeFileSync, ee.isRetriableError)
  }
}, Ui = "utf8", Ks = 438, qi = 511, Gi = {}, Ki = gr.userInfo().uid, Hi = gr.userInfo().gid, Xi = 1e3, Bi = !!ae.getuid;
ae.getuid && ae.getuid();
const Hs = 128, Wi = (e) => e instanceof Error && "code" in e, Xs = (e) => typeof e == "string", Zr = (e) => e === void 0, xi = ae.platform === "linux", so = ae.platform === "win32", On = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
so || On.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
xi && On.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Ji {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (so && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ae.kill(ae.pid, "SIGTERM") : ae.kill(ae.pid, t));
      }
    }, this.hook = () => {
      ae.once("exit", () => this.exit());
      for (const t of On)
        try {
          ae.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Yi = new Ji(), Qi = Yi.register, fe = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = fe.truncate(t(e));
    return n in fe.store ? fe.get(e, t, r) : (fe.store[n] = r, [n, () => delete fe.store[n]]);
  },
  purge: (e) => {
    fe.store[e] && (delete fe.store[e], de.attempt.unlink(e));
  },
  purgeSync: (e) => {
    fe.store[e] && (delete fe.store[e], de.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in fe.store)
      fe.purgeSync(e);
  },
  truncate: (e) => {
    const t = x.basename(e);
    if (t.length <= Hs)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - Hs;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Qi(fe.purgeSyncAll);
function ao(e, t, r = Gi) {
  if (Xs(r))
    return ao(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? Xi) || -1);
  let s = null, a = null, o = null;
  try {
    const l = de.attempt.realpathSync(e), i = !!l;
    e = l || e, [a, s] = fe.get(e, r.tmpCreate || fe.create, r.tmpPurge !== !1);
    const d = Bi && Zr(r.chown), c = Zr(r.mode);
    if (i && (d || c)) {
      const f = de.attempt.statSync(e);
      f && (r = { ...r }, d && (r.chown = { uid: f.uid, gid: f.gid }), c && (r.mode = f.mode));
    }
    if (!i) {
      const f = x.dirname(e);
      de.attempt.mkdirSync(f, {
        mode: qi,
        recursive: !0
      });
    }
    o = de.retry.openSync(n)(a, "w", r.mode || Ks), r.tmpCreated && r.tmpCreated(a), Xs(t) ? de.retry.writeSync(n)(o, t, 0, r.encoding || Ui) : Zr(t) || de.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? de.retry.fsyncSync(n)(o) : de.attempt.fsync(o)), de.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== Ki || r.chown.gid !== Hi) && de.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== Ks && de.attempt.chmodSync(a, r.mode);
    try {
      de.retry.renameSync(n)(a, e);
    } catch (f) {
      if (!Wi(f) || f.code !== "ENAMETOOLONG")
        throw f;
      de.retry.renameSync(n)(a, fe.truncate(e));
    }
    s(), a = null;
  } finally {
    o && de.attempt.closeSync(o), a && fe.purge(a);
  }
}
function oo(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var mn = { exports: {} }, Tn = {}, Se = {}, Et = {}, Ht = {}, U = {}, Kt = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(w) {
      if (super(), !e.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((R, O) => `${R}${O}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((R, O) => (O instanceof r && (R[O.str] = (R[O.str] || 0) + 1), R), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const R = [m[0]];
    let O = 0;
    for (; O < w.length; )
      l(R, w[O]), R.push(m[++O]);
    return new n(R);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...w) {
    const R = [$(m[0])];
    let O = 0;
    for (; O < w.length; )
      R.push(a), l(R, w[O]), R.push(a, $(m[++O]));
    return i(R), new n(R);
  }
  e.str = o;
  function l(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(f(w));
  }
  e.addCodeArg = l;
  function i(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === a) {
        const R = d(m[w - 1], m[w + 1]);
        if (R !== void 0) {
          m.splice(w - 1, 3, R);
          continue;
        }
        m[w++] = "+";
      }
      w++;
    }
  }
  function d(m, w) {
    if (w === '""')
      return m;
    if (m === '""')
      return w;
    if (typeof m == "string")
      return w instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${m.slice(0, -1)}${w}"` : w[0] === '"' ? m.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(m instanceof r))
      return `"${m}${w.slice(1)}`;
  }
  function c(m, w) {
    return w.emptyStr() ? m : m.emptyStr() ? w : o`${m}${w}`;
  }
  e.strConcat = c;
  function f(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : $(Array.isArray(m) ? m.join(",") : m);
  }
  function _(m) {
    return new n($(m));
  }
  e.stringify = _;
  function $(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = $;
  function E(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = E;
  function y(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = y;
  function v(m) {
    return new n(m.toString());
  }
  e.regexpCode = v;
})(Kt);
var pn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Kt;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(i) {
    i[i.Started = 0] = "Started", i[i.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: c } = {}) {
      this._names = {}, this._prefixes = d, this._parent = c;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const c = this._names[d] || this._nameGroup(d);
      return `${d}${c.index++}`;
    }
    _nameGroup(d) {
      var c, f;
      if (!((f = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || f === void 0) && f.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, c) {
      super(c), this.prefix = d;
    }
    setValue(d, { property: c, itemIndex: f }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${f}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class l extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, c) {
      var f;
      if (c.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const _ = this.toName(d), { prefix: $ } = _, E = (f = c.key) !== null && f !== void 0 ? f : c.ref;
      let y = this._values[$];
      if (y) {
        const w = y.get(E);
        if (w)
          return w;
      } else
        y = this._values[$] = /* @__PURE__ */ new Map();
      y.set(E, _);
      const v = this._scope[$] || (this._scope[$] = []), m = v.length;
      return v[m] = c.ref, _.setValue(c, { property: $, itemIndex: m }), _;
    }
    getValue(d, c) {
      const f = this._values[d];
      if (f)
        return f.get(c);
    }
    scopeRefs(d, c = this._values) {
      return this._reduceValues(c, (f) => {
        if (f.scopePath === void 0)
          throw new Error(`CodeGen: name "${f}" has no value`);
        return (0, t._)`${d}${f.scopePath}`;
      });
    }
    scopeCode(d = this._values, c, f) {
      return this._reduceValues(d, (_) => {
        if (_.value === void 0)
          throw new Error(`CodeGen: name "${_}" has no value`);
        return _.value.code;
      }, c, f);
    }
    _reduceValues(d, c, f = {}, _) {
      let $ = t.nil;
      for (const E in d) {
        const y = d[E];
        if (!y)
          continue;
        const v = f[E] = f[E] || /* @__PURE__ */ new Map();
        y.forEach((m) => {
          if (v.has(m))
            return;
          v.set(m, n.Started);
          let w = c(m);
          if (w) {
            const R = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            $ = (0, t._)`${$}${R} ${m} = ${w};${this.opts._n}`;
          } else if (w = _ == null ? void 0 : _(m))
            $ = (0, t._)`${$}${w}${this.opts._n}`;
          else
            throw new r(m);
          v.set(m, n.Completed);
        });
      }
      return $;
    }
  }
  e.ValueScope = l;
})(pn);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Kt, r = pn;
  var n = Kt;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = pn;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(u, h) {
      return this;
    }
  }
  class o extends a {
    constructor(u, h, b) {
      super(), this.varKind = u, this.name = h, this.rhs = b;
    }
    render({ es5: u, _n: h }) {
      const b = u ? r.varKinds.var : this.varKind, L = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${L};` + h;
    }
    optimizeNames(u, h) {
      if (u[this.name.str])
        return this.rhs && (this.rhs = I(this.rhs, u, h)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(u, h, b) {
      super(), this.lhs = u, this.rhs = h, this.sideEffects = b;
    }
    render({ _n: u }) {
      return `${this.lhs} = ${this.rhs};` + u;
    }
    optimizeNames(u, h) {
      if (!(this.lhs instanceof t.Name && !u[this.lhs.str] && !this.sideEffects))
        return this.rhs = I(this.rhs, u, h), this;
    }
    get names() {
      const u = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return Y(u, this.rhs);
    }
  }
  class i extends l {
    constructor(u, h, b, L) {
      super(u, b, L), this.op = h;
    }
    render({ _n: u }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + u;
    }
  }
  class d extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `${this.label}:` + u;
    }
  }
  class c extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `break${this.label ? ` ${this.label}` : ""};` + u;
    }
  }
  class f extends a {
    constructor(u) {
      super(), this.error = u;
    }
    render({ _n: u }) {
      return `throw ${this.error};` + u;
    }
    get names() {
      return this.error.names;
    }
  }
  class _ extends a {
    constructor(u) {
      super(), this.code = u;
    }
    render({ _n: u }) {
      return `${this.code};` + u;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(u, h) {
      return this.code = I(this.code, u, h), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class $ extends a {
    constructor(u = []) {
      super(), this.nodes = u;
    }
    render(u) {
      return this.nodes.reduce((h, b) => h + b.render(u), "");
    }
    optimizeNodes() {
      const { nodes: u } = this;
      let h = u.length;
      for (; h--; ) {
        const b = u[h].optimizeNodes();
        Array.isArray(b) ? u.splice(h, 1, ...b) : b ? u[h] = b : u.splice(h, 1);
      }
      return u.length > 0 ? this : void 0;
    }
    optimizeNames(u, h) {
      const { nodes: b } = this;
      let L = b.length;
      for (; L--; ) {
        const M = b[L];
        M.optimizeNames(u, h) || (N(u, M.names), b.splice(L, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((u, h) => q(u, h.names), {});
    }
  }
  class E extends $ {
    render(u) {
      return "{" + u._n + super.render(u) + "}" + u._n;
    }
  }
  class y extends $ {
  }
  class v extends E {
  }
  v.kind = "else";
  class m extends E {
    constructor(u, h) {
      super(h), this.condition = u;
    }
    render(u) {
      let h = `if(${this.condition})` + super.render(u);
      return this.else && (h += "else " + this.else.render(u)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const u = this.condition;
      if (u === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const b = h.optimizeNodes();
        h = this.else = Array.isArray(b) ? new v(b) : b;
      }
      if (h)
        return u === !1 ? h instanceof m ? h : h.nodes : this.nodes.length ? this : new m(C(u), h instanceof m ? [h] : h.nodes);
      if (!(u === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(u, h) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(u, h), !!(super.optimizeNames(u, h) || this.else))
        return this.condition = I(this.condition, u, h), this;
    }
    get names() {
      const u = super.names;
      return Y(u, this.condition), this.else && q(u, this.else.names), u;
    }
  }
  m.kind = "if";
  class w extends E {
  }
  w.kind = "for";
  class R extends w {
    constructor(u) {
      super(), this.iteration = u;
    }
    render(u) {
      return `for(${this.iteration})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iteration = I(this.iteration, u, h), this;
    }
    get names() {
      return q(super.names, this.iteration.names);
    }
  }
  class O extends w {
    constructor(u, h, b, L) {
      super(), this.varKind = u, this.name = h, this.from = b, this.to = L;
    }
    render(u) {
      const h = u.es5 ? r.varKinds.var : this.varKind, { name: b, from: L, to: M } = this;
      return `for(${h} ${b}=${L}; ${b}<${M}; ${b}++)` + super.render(u);
    }
    get names() {
      const u = Y(super.names, this.from);
      return Y(u, this.to);
    }
  }
  class j extends w {
    constructor(u, h, b, L) {
      super(), this.loop = u, this.varKind = h, this.name = b, this.iterable = L;
    }
    render(u) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iterable = I(this.iterable, u, h), this;
    }
    get names() {
      return q(super.names, this.iterable.names);
    }
  }
  class B extends E {
    constructor(u, h, b) {
      super(), this.name = u, this.args = h, this.async = b;
    }
    render(u) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(u);
    }
  }
  B.kind = "func";
  class te extends $ {
    render(u) {
      return "return " + super.render(u);
    }
  }
  te.kind = "return";
  class $e extends E {
    render(u) {
      let h = "try" + super.render(u);
      return this.catch && (h += this.catch.render(u)), this.finally && (h += this.finally.render(u)), h;
    }
    optimizeNodes() {
      var u, h;
      return super.optimizeNodes(), (u = this.catch) === null || u === void 0 || u.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(u, h) {
      var b, L;
      return super.optimizeNames(u, h), (b = this.catch) === null || b === void 0 || b.optimizeNames(u, h), (L = this.finally) === null || L === void 0 || L.optimizeNames(u, h), this;
    }
    get names() {
      const u = super.names;
      return this.catch && q(u, this.catch.names), this.finally && q(u, this.finally.names), u;
    }
  }
  class Ee extends E {
    constructor(u) {
      super(), this.error = u;
    }
    render(u) {
      return `catch(${this.error})` + super.render(u);
    }
  }
  Ee.kind = "catch";
  class be extends E {
    render(u) {
      return "finally" + super.render(u);
    }
  }
  be.kind = "finally";
  class F {
    constructor(u, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = u, this._scope = new r.Scope({ parent: u }), this._nodes = [new y()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(u) {
      return this._scope.name(u);
    }
    // reserves unique name in the external scope
    scopeName(u) {
      return this._extScope.name(u);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(u, h) {
      const b = this._extScope.value(u, h);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(u, h) {
      return this._extScope.getValue(u, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(u) {
      return this._extScope.scopeRefs(u, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(u, h, b, L) {
      const M = this._scope.toName(h);
      return b !== void 0 && L && (this._constants[M.str] = b), this._leafNode(new o(u, M, b)), M;
    }
    // `const` declaration (`var` in es5 mode)
    const(u, h, b) {
      return this._def(r.varKinds.const, u, h, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(u, h, b) {
      return this._def(r.varKinds.let, u, h, b);
    }
    // `var` declaration with optional assignment
    var(u, h, b) {
      return this._def(r.varKinds.var, u, h, b);
    }
    // assignment code
    assign(u, h, b) {
      return this._leafNode(new l(u, h, b));
    }
    // `+=` code
    add(u, h) {
      return this._leafNode(new i(u, e.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(u) {
      return typeof u == "function" ? u() : u !== t.nil && this._leafNode(new _(u)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...u) {
      const h = ["{"];
      for (const [b, L] of u)
        h.length > 1 && h.push(","), h.push(b), (b !== L || this.opts.es5) && (h.push(":"), (0, t.addCodeArg)(h, L));
      return h.push("}"), new t._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(u, h, b) {
      if (this._blockNode(new m(u)), h && b)
        this.code(h).else().code(b).endIf();
      else if (h)
        this.code(h).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(u) {
      return this._elseNode(new m(u));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new v());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, v);
    }
    _for(u, h) {
      return this._blockNode(u), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(u, h) {
      return this._for(new R(u), h);
    }
    // `for` statement for a range of values
    forRange(u, h, b, L, M = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const W = this._scope.toName(u);
      return this._for(new O(M, W, h, b), () => L(W));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(u, h, b, L = r.varKinds.const) {
      const M = this._scope.toName(u);
      if (this.opts.es5) {
        const W = h instanceof t.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, t._)`${W}.length`, (X) => {
          this.var(M, (0, t._)`${W}[${X}]`), b(M);
        });
      }
      return this._for(new j("of", L, M, h), () => b(M));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(u, h, b, L = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(u, (0, t._)`Object.keys(${h})`, b);
      const M = this._scope.toName(u);
      return this._for(new j("in", L, M, h), () => b(M));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(u) {
      return this._leafNode(new d(u));
    }
    // `break` statement
    break(u) {
      return this._leafNode(new c(u));
    }
    // `return` statement
    return(u) {
      const h = new te();
      if (this._blockNode(h), this.code(u), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(te);
    }
    // `try` statement
    try(u, h, b) {
      if (!h && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const L = new $e();
      if (this._blockNode(L), this.code(u), h) {
        const M = this.name("e");
        this._currNode = L.catch = new Ee(M), h(M);
      }
      return b && (this._currNode = L.finally = new be(), this.code(b)), this._endBlockNode(Ee, be);
    }
    // `throw` statement
    throw(u) {
      return this._leafNode(new f(u));
    }
    // start self-balancing block
    block(u, h) {
      return this._blockStarts.push(this._nodes.length), u && this.code(u).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(u) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - h;
      if (b < 0 || u !== void 0 && b !== u)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${u} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(u, h = t.nil, b, L) {
      return this._blockNode(new B(u, h, b)), L && this.code(L).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(B);
    }
    optimize(u = 1) {
      for (; u-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(u) {
      return this._currNode.nodes.push(u), this;
    }
    _blockNode(u) {
      this._currNode.nodes.push(u), this._nodes.push(u);
    }
    _endBlockNode(u, h) {
      const b = this._currNode;
      if (b instanceof u || h && b instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${u.kind}/${h.kind}` : u.kind}"`);
    }
    _elseNode(u) {
      const h = this._currNode;
      if (!(h instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = u, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const u = this._nodes;
      return u[u.length - 1];
    }
    set _currNode(u) {
      const h = this._nodes;
      h[h.length - 1] = u;
    }
  }
  e.CodeGen = F;
  function q(g, u) {
    for (const h in u)
      g[h] = (g[h] || 0) + (u[h] || 0);
    return g;
  }
  function Y(g, u) {
    return u instanceof t._CodeOrName ? q(g, u.names) : g;
  }
  function I(g, u, h) {
    if (g instanceof t.Name)
      return b(g);
    if (!L(g))
      return g;
    return new t._Code(g._items.reduce((M, W) => (W instanceof t.Name && (W = b(W)), W instanceof t._Code ? M.push(...W._items) : M.push(W), M), []));
    function b(M) {
      const W = h[M.str];
      return W === void 0 || u[M.str] !== 1 ? M : (delete u[M.str], W);
    }
    function L(M) {
      return M instanceof t._Code && M._items.some((W) => W instanceof t.Name && u[W.str] === 1 && h[W.str] !== void 0);
    }
  }
  function N(g, u) {
    for (const h in u)
      g[h] = (g[h] || 0) - (u[h] || 0);
  }
  function C(g) {
    return typeof g == "boolean" || typeof g == "number" || g === null ? !g : (0, t._)`!${S(g)}`;
  }
  e.not = C;
  const A = p(e.operators.AND);
  function V(...g) {
    return g.reduce(A);
  }
  e.and = V;
  const k = p(e.operators.OR);
  function P(...g) {
    return g.reduce(k);
  }
  e.or = P;
  function p(g) {
    return (u, h) => u === t.nil ? h : h === t.nil ? u : (0, t._)`${S(u)} ${g} ${S(h)}`;
  }
  function S(g) {
    return g instanceof t.Name ? g : (0, t._)`(${g})`;
  }
})(U);
var T = {};
Object.defineProperty(T, "__esModule", { value: !0 });
T.checkStrictMode = T.getErrorPath = T.Type = T.useFunc = T.setEvaluated = T.evaluatedPropsToName = T.mergeEvaluated = T.eachItem = T.unescapeJsonPointer = T.escapeJsonPointer = T.escapeFragment = T.unescapeFragment = T.schemaRefOrVal = T.schemaHasRulesButRef = T.schemaHasRules = T.checkUnknownRules = T.alwaysValidSchema = T.toHash = void 0;
const J = U, Zi = Kt;
function ec(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
T.toHash = ec;
function tc(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (io(e, t), !co(t, e.self.RULES.all));
}
T.alwaysValidSchema = tc;
function io(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || fo(e, `unknown keyword: "${a}"`);
}
T.checkUnknownRules = io;
function co(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
T.schemaHasRules = co;
function rc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
T.schemaHasRulesButRef = rc;
function nc({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, J._)`${r}`;
  }
  return (0, J._)`${e}${t}${(0, J.getProperty)(n)}`;
}
T.schemaRefOrVal = nc;
function sc(e) {
  return lo(decodeURIComponent(e));
}
T.unescapeFragment = sc;
function ac(e) {
  return encodeURIComponent(jn(e));
}
T.escapeFragment = ac;
function jn(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
T.escapeJsonPointer = jn;
function lo(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
T.unescapeJsonPointer = lo;
function oc(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
T.eachItem = oc;
function Bs({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const i = o === void 0 ? a : o instanceof J.Name ? (a instanceof J.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof J.Name ? (t(s, o, a), a) : r(a, o);
    return l === J.Name && !(i instanceof J.Name) ? n(s, i) : i;
  };
}
T.mergeEvaluated = {
  props: Bs({
    mergeNames: (e, t, r) => e.if((0, J._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, J._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, J._)`${r} || {}`).code((0, J._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, J._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, J._)`${r} || {}`), An(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: uo
  }),
  items: Bs({
    mergeNames: (e, t, r) => e.if((0, J._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, J._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, J._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, J._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function uo(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, J._)`{}`);
  return t !== void 0 && An(e, r, t), r;
}
T.evaluatedPropsToName = uo;
function An(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, J._)`${t}${(0, J.getProperty)(n)}`, !0));
}
T.setEvaluated = An;
const Ws = {};
function ic(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ws[t.code] || (Ws[t.code] = new Zi._Code(t.code))
  });
}
T.useFunc = ic;
var $n;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})($n || (T.Type = $n = {}));
function cc(e, t, r) {
  if (e instanceof J.Name) {
    const n = t === $n.Num;
    return r ? n ? (0, J._)`"[" + ${e} + "]"` : (0, J._)`"['" + ${e} + "']"` : n ? (0, J._)`"/" + ${e}` : (0, J._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, J.getProperty)(e).toString() : "/" + jn(e);
}
T.getErrorPath = cc;
function fo(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
T.checkStrictMode = fo;
var _e = {};
Object.defineProperty(_e, "__esModule", { value: !0 });
const ue = U, lc = {
  // validation function arguments
  data: new ue.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new ue.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new ue.Name("instancePath"),
  parentData: new ue.Name("parentData"),
  parentDataProperty: new ue.Name("parentDataProperty"),
  rootData: new ue.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new ue.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new ue.Name("vErrors"),
  // null or array of validation errors
  errors: new ue.Name("errors"),
  // counter of validation errors
  this: new ue.Name("this"),
  // "globals"
  self: new ue.Name("self"),
  scope: new ue.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new ue.Name("json"),
  jsonPos: new ue.Name("jsonPos"),
  jsonLen: new ue.Name("jsonLen"),
  jsonPart: new ue.Name("jsonPart")
};
_e.default = lc;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = U, r = T, n = _e;
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: m }) => m ? (0, t.str)`"${v}" keyword must be ${m} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function s(v, m = e.keywordError, w, R) {
    const { it: O } = v, { gen: j, compositeRule: B, allErrors: te } = O, $e = f(v, m, w);
    R ?? (B || te) ? i(j, $e) : d(O, (0, t._)`[${$e}]`);
  }
  e.reportError = s;
  function a(v, m = e.keywordError, w) {
    const { it: R } = v, { gen: O, compositeRule: j, allErrors: B } = R, te = f(v, m, w);
    i(O, te), j || B || d(R, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(v, m) {
    v.assign(n.default.errors, m), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(m, () => v.assign((0, t._)`${n.default.vErrors}.length`, m), () => v.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: v, keyword: m, schemaValue: w, data: R, errsCount: O, it: j }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const B = v.name("err");
    v.forRange("i", O, n.default.errors, (te) => {
      v.const(B, (0, t._)`${n.default.vErrors}[${te}]`), v.if((0, t._)`${B}.instancePath === undefined`, () => v.assign((0, t._)`${B}.instancePath`, (0, t.strConcat)(n.default.instancePath, j.errorPath))), v.assign((0, t._)`${B}.schemaPath`, (0, t.str)`${j.errSchemaPath}/${m}`), j.opts.verbose && (v.assign((0, t._)`${B}.schema`, w), v.assign((0, t._)`${B}.data`, R));
    });
  }
  e.extendErrors = l;
  function i(v, m) {
    const w = v.const("err", m);
    v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), v.code((0, t._)`${n.default.errors}++`);
  }
  function d(v, m) {
    const { gen: w, validateName: R, schemaEnv: O } = v;
    O.$async ? w.throw((0, t._)`new ${v.ValidationError}(${m})`) : (w.assign((0, t._)`${R}.errors`, m), w.return(!1));
  }
  const c = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function f(v, m, w) {
    const { createErrors: R } = v.it;
    return R === !1 ? (0, t._)`{}` : _(v, m, w);
  }
  function _(v, m, w = {}) {
    const { gen: R, it: O } = v, j = [
      $(O, w),
      E(v, w)
    ];
    return y(v, m, j), R.object(...j);
  }
  function $({ errorPath: v }, { instancePath: m }) {
    const w = m ? (0, t.str)`${v}${(0, r.getErrorPath)(m, r.Type.Str)}` : v;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function E({ keyword: v, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: R }) {
    let O = R ? m : (0, t.str)`${m}/${v}`;
    return w && (O = (0, t.str)`${O}${(0, r.getErrorPath)(w, r.Type.Str)}`), [c.schemaPath, O];
  }
  function y(v, { params: m, message: w }, R) {
    const { keyword: O, data: j, schemaValue: B, it: te } = v, { opts: $e, propertyName: Ee, topSchemaRef: be, schemaPath: F } = te;
    R.push([c.keyword, O], [c.params, typeof m == "function" ? m(v) : m || (0, t._)`{}`]), $e.messages && R.push([c.message, typeof w == "function" ? w(v) : w]), $e.verbose && R.push([c.schema, B], [c.parentSchema, (0, t._)`${be}${F}`], [n.default.data, j]), Ee && R.push([c.propertyName, Ee]);
  }
})(Ht);
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.boolOrEmptySchema = Et.topBoolOrEmptySchema = void 0;
const uc = Ht, dc = U, fc = _e, hc = {
  message: "boolean schema is false"
};
function mc(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? ho(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(fc.default.data) : (t.assign((0, dc._)`${n}.errors`, null), t.return(!0));
}
Et.topBoolOrEmptySchema = mc;
function pc(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), ho(e)) : r.var(t, !0);
}
Et.boolOrEmptySchema = pc;
function ho(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, uc.reportError)(s, hc, void 0, t);
}
var se = {}, it = {};
Object.defineProperty(it, "__esModule", { value: !0 });
it.getRules = it.isJSONType = void 0;
const $c = ["string", "number", "integer", "boolean", "null", "object", "array"], yc = new Set($c);
function gc(e) {
  return typeof e == "string" && yc.has(e);
}
it.isJSONType = gc;
function vc() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
it.getRules = vc;
var Fe = {};
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.shouldUseRule = Fe.shouldUseGroup = Fe.schemaHasRulesForType = void 0;
function _c({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && mo(e, n);
}
Fe.schemaHasRulesForType = _c;
function mo(e, t) {
  return t.rules.some((r) => po(e, r));
}
Fe.shouldUseGroup = mo;
function po(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
Fe.shouldUseRule = po;
Object.defineProperty(se, "__esModule", { value: !0 });
se.reportTypeError = se.checkDataTypes = se.checkDataType = se.coerceAndCheckDataType = se.getJSONTypes = se.getSchemaTypes = se.DataType = void 0;
const Ec = it, wc = Fe, Sc = Ht, G = U, $o = T;
var vt;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(vt || (se.DataType = vt = {}));
function bc(e) {
  const t = yo(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
se.getSchemaTypes = bc;
function yo(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Ec.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
se.getJSONTypes = yo;
function Pc(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Rc(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, wc.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = kn(t, n, s.strictNumbers, vt.Wrong);
    r.if(l, () => {
      a.length ? Ic(e, t, a) : Cn(e);
    });
  }
  return o;
}
se.coerceAndCheckDataType = Pc;
const go = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Rc(e, t) {
  return t ? e.filter((r) => go.has(r) || t === "array" && r === "array") : [];
}
function Ic(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, G._)`typeof ${s}`), l = n.let("coerced", (0, G._)`undefined`);
  a.coerceTypes === "array" && n.if((0, G._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, G._)`${s}[0]`).assign(o, (0, G._)`typeof ${s}`).if(kn(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, G._)`${l} !== undefined`);
  for (const d of r)
    (go.has(d) || d === "array" && a.coerceTypes === "array") && i(d);
  n.else(), Cn(e), n.endIf(), n.if((0, G._)`${l} !== undefined`, () => {
    n.assign(s, l), Nc(e, l);
  });
  function i(d) {
    switch (d) {
      case "string":
        n.elseIf((0, G._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, G._)`"" + ${s}`).elseIf((0, G._)`${s} === null`).assign(l, (0, G._)`""`);
        return;
      case "number":
        n.elseIf((0, G._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, G._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, G._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, G._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, G._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, G._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, G._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, G._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, G._)`[${s}]`);
    }
  }
}
function Nc({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, G._)`${t} !== undefined`, () => e.assign((0, G._)`${t}[${r}]`, n));
}
function yn(e, t, r, n = vt.Correct) {
  const s = n === vt.Correct ? G.operators.EQ : G.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, G._)`${t} ${s} null`;
    case "array":
      a = (0, G._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, G._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, G._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, G._)`typeof ${t} ${s} ${e}`;
  }
  return n === vt.Correct ? a : (0, G.not)(a);
  function o(l = G.nil) {
    return (0, G.and)((0, G._)`typeof ${t} == "number"`, l, r ? (0, G._)`isFinite(${t})` : G.nil);
  }
}
se.checkDataType = yn;
function kn(e, t, r, n) {
  if (e.length === 1)
    return yn(e[0], t, r, n);
  let s;
  const a = (0, $o.toHash)(e);
  if (a.array && a.object) {
    const o = (0, G._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, G._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = G.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, G.and)(s, yn(o, t, r, n));
  return s;
}
se.checkDataTypes = kn;
const Oc = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, G._)`{type: ${e}}` : (0, G._)`{type: ${t}}`
};
function Cn(e) {
  const t = Tc(e);
  (0, Sc.reportError)(t, Oc);
}
se.reportTypeError = Cn;
function Tc(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, $o.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var _r = {};
Object.defineProperty(_r, "__esModule", { value: !0 });
_r.assignDefaults = void 0;
const ft = U, jc = T;
function Ac(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      xs(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => xs(e, a, s.default));
}
_r.assignDefaults = Ac;
function xs(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, ft._)`${a}${(0, ft.getProperty)(t)}`;
  if (s) {
    (0, jc.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let i = (0, ft._)`${l} === undefined`;
  o.useDefaults === "empty" && (i = (0, ft._)`${i} || ${l} === null || ${l} === ""`), n.if(i, (0, ft._)`${l} = ${(0, ft.stringify)(r)}`);
}
var ke = {}, H = {};
Object.defineProperty(H, "__esModule", { value: !0 });
H.validateUnion = H.validateArray = H.usePattern = H.callValidateCode = H.schemaProperties = H.allSchemaProperties = H.noPropertyInData = H.propertyInData = H.isOwnProperty = H.hasPropFunc = H.reportMissingProp = H.checkMissingProp = H.checkReportMissingProp = void 0;
const Q = U, Dn = T, Be = _e, kc = T;
function Cc(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Mn(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, Q._)`${t}` }, !0), e.error();
  });
}
H.checkReportMissingProp = Cc;
function Dc({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, Q.or)(...n.map((a) => (0, Q.and)(Mn(e, t, a, r.ownProperties), (0, Q._)`${s} = ${a}`)));
}
H.checkMissingProp = Dc;
function Lc(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
H.reportMissingProp = Lc;
function vo(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, Q._)`Object.prototype.hasOwnProperty`
  });
}
H.hasPropFunc = vo;
function Ln(e, t, r) {
  return (0, Q._)`${vo(e)}.call(${t}, ${r})`;
}
H.isOwnProperty = Ln;
function Mc(e, t, r, n) {
  const s = (0, Q._)`${t}${(0, Q.getProperty)(r)} !== undefined`;
  return n ? (0, Q._)`${s} && ${Ln(e, t, r)}` : s;
}
H.propertyInData = Mc;
function Mn(e, t, r, n) {
  const s = (0, Q._)`${t}${(0, Q.getProperty)(r)} === undefined`;
  return n ? (0, Q.or)(s, (0, Q.not)(Ln(e, t, r))) : s;
}
H.noPropertyInData = Mn;
function _o(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
H.allSchemaProperties = _o;
function Vc(e, t) {
  return _o(t).filter((r) => !(0, Dn.alwaysValidSchema)(e, t[r]));
}
H.schemaProperties = Vc;
function Fc({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, i, d) {
  const c = d ? (0, Q._)`${e}, ${t}, ${n}${s}` : t, f = [
    [Be.default.instancePath, (0, Q.strConcat)(Be.default.instancePath, a)],
    [Be.default.parentData, o.parentData],
    [Be.default.parentDataProperty, o.parentDataProperty],
    [Be.default.rootData, Be.default.rootData]
  ];
  o.opts.dynamicRef && f.push([Be.default.dynamicAnchors, Be.default.dynamicAnchors]);
  const _ = (0, Q._)`${c}, ${r.object(...f)}`;
  return i !== Q.nil ? (0, Q._)`${l}.call(${i}, ${_})` : (0, Q._)`${l}(${_})`;
}
H.callValidateCode = Fc;
const zc = (0, Q._)`new RegExp`;
function Uc({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, Q._)`${s.code === "new RegExp" ? zc : (0, kc.useFunc)(e, s)}(${r}, ${n})`
  });
}
H.usePattern = Uc;
function qc(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const i = t.const("len", (0, Q._)`${r}.length`);
    t.forRange("i", 0, i, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: Dn.Type.Num
      }, a), t.if((0, Q.not)(a), l);
    });
  }
}
H.validateArray = qc;
function Gc(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((i) => (0, Dn.alwaysValidSchema)(s, i)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((i, d) => {
    const c = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, Q._)`${o} || ${l}`), e.mergeValidEvaluated(c, l) || t.if((0, Q.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
H.validateUnion = Gc;
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.validateKeywordUsage = ke.validSchemaType = ke.funcKeywordCode = ke.macroKeywordCode = void 0;
const he = U, tt = _e, Kc = H, Hc = Ht;
function Xc(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), i = Eo(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: he.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: i,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
ke.macroKeywordCode = Xc;
function Bc(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: i } = e;
  xc(i, t);
  const d = !l && t.compile ? t.compile.call(i.self, a, o, i) : t.validate, c = Eo(n, s, d), f = n.let("valid");
  e.block$data(f, _), e.ok((r = t.valid) !== null && r !== void 0 ? r : f);
  function _() {
    if (t.errors === !1)
      y(), t.modifying && Js(e), v(() => e.error());
    else {
      const m = t.async ? $() : E();
      t.modifying && Js(e), v(() => Wc(e, m));
    }
  }
  function $() {
    const m = n.let("ruleErrs", null);
    return n.try(() => y((0, he._)`await `), (w) => n.assign(f, !1).if((0, he._)`${w} instanceof ${i.ValidationError}`, () => n.assign(m, (0, he._)`${w}.errors`), () => n.throw(w))), m;
  }
  function E() {
    const m = (0, he._)`${c}.errors`;
    return n.assign(m, null), y(he.nil), m;
  }
  function y(m = t.async ? (0, he._)`await ` : he.nil) {
    const w = i.opts.passContext ? tt.default.this : tt.default.self, R = !("compile" in t && !l || t.schema === !1);
    n.assign(f, (0, he._)`${m}${(0, Kc.callValidateCode)(e, c, w, R)}`, t.modifying);
  }
  function v(m) {
    var w;
    n.if((0, he.not)((w = t.valid) !== null && w !== void 0 ? w : f), m);
  }
}
ke.funcKeywordCode = Bc;
function Js(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, he._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Wc(e, t) {
  const { gen: r } = e;
  r.if((0, he._)`Array.isArray(${t})`, () => {
    r.assign(tt.default.vErrors, (0, he._)`${tt.default.vErrors} === null ? ${t} : ${tt.default.vErrors}.concat(${t})`).assign(tt.default.errors, (0, he._)`${tt.default.vErrors}.length`), (0, Hc.extendErrors)(e);
  }, () => e.error());
}
function xc({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Eo(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, he.stringify)(r) });
}
function Jc(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ke.validSchemaType = Jc;
function Yc({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const i = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(i);
    else
      throw new Error(i);
  }
}
ke.validateKeywordUsage = Yc;
var Ze = {};
Object.defineProperty(Ze, "__esModule", { value: !0 });
Ze.extendSubschemaMode = Ze.extendSubschemaData = Ze.getSubschema = void 0;
const Ae = U, wo = T;
function Qc(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, Ae._)`${e.schemaPath}${(0, Ae.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, Ae._)`${e.schemaPath}${(0, Ae.getProperty)(t)}${(0, Ae.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, wo.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Ze.getSubschema = Qc;
function Zc(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: c, opts: f } = t, _ = l.let("data", (0, Ae._)`${t.data}${(0, Ae.getProperty)(r)}`, !0);
    i(_), e.errorPath = (0, Ae.str)`${d}${(0, wo.getErrorPath)(r, n, f.jsPropertySyntax)}`, e.parentDataProperty = (0, Ae._)`${r}`, e.dataPathArr = [...c, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof Ae.Name ? s : l.let("data", s, !0);
    i(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function i(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Ze.extendSubschemaData = Zc;
function el(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Ze.extendSubschemaMode = el;
var ce = {}, So = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (a = Object.keys(t), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var o = a[s];
      if (!e(t[o], r[o])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, bo = { exports: {} }, Qe = bo.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  or(t, n, s, e, "", e);
};
Qe.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Qe.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Qe.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Qe.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function or(e, t, r, n, s, a, o, l, i, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, i, d);
    for (var c in n) {
      var f = n[c];
      if (Array.isArray(f)) {
        if (c in Qe.arrayKeywords)
          for (var _ = 0; _ < f.length; _++)
            or(e, t, r, f[_], s + "/" + c + "/" + _, a, s, c, n, _);
      } else if (c in Qe.propsKeywords) {
        if (f && typeof f == "object")
          for (var $ in f)
            or(e, t, r, f[$], s + "/" + c + "/" + tl($), a, s, c, n, $);
      } else (c in Qe.keywords || e.allKeys && !(c in Qe.skipKeywords)) && or(e, t, r, f, s + "/" + c, a, s, c, n);
    }
    r(n, s, a, o, l, i, d);
  }
}
function tl(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var rl = bo.exports;
Object.defineProperty(ce, "__esModule", { value: !0 });
ce.getSchemaRefs = ce.resolveUrl = ce.normalizeId = ce._getFullPath = ce.getFullPath = ce.inlineRef = void 0;
const nl = T, sl = So, al = rl, ol = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function il(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !gn(e) : t ? Po(e) <= t : !1;
}
ce.inlineRef = il;
const cl = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function gn(e) {
  for (const t in e) {
    if (cl.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(gn) || typeof r == "object" && gn(r))
      return !0;
  }
  return !1;
}
function Po(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !ol.has(r) && (typeof e[r] == "object" && (0, nl.eachItem)(e[r], (n) => t += Po(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Ro(e, t = "", r) {
  r !== !1 && (t = _t(t));
  const n = e.parse(t);
  return Io(e, n);
}
ce.getFullPath = Ro;
function Io(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
ce._getFullPath = Io;
const ll = /#\/?$/;
function _t(e) {
  return e ? e.replace(ll, "") : "";
}
ce.normalizeId = _t;
function ul(e, t, r) {
  return r = _t(r), e.resolve(t, r);
}
ce.resolveUrl = ul;
const dl = /^[a-z_][-a-z0-9._]*$/i;
function fl(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = _t(e[r] || t), a = { "": s }, o = Ro(n, s, !1), l = {}, i = /* @__PURE__ */ new Set();
  return al(e, { allKeys: !0 }, (f, _, $, E) => {
    if (E === void 0)
      return;
    const y = o + _;
    let v = a[E];
    typeof f[r] == "string" && (v = m.call(this, f[r])), w.call(this, f.$anchor), w.call(this, f.$dynamicAnchor), a[_] = v;
    function m(R) {
      const O = this.opts.uriResolver.resolve;
      if (R = _t(v ? O(v, R) : R), i.has(R))
        throw c(R);
      i.add(R);
      let j = this.refs[R];
      return typeof j == "string" && (j = this.refs[j]), typeof j == "object" ? d(f, j.schema, R) : R !== _t(y) && (R[0] === "#" ? (d(f, l[R], R), l[R] = f) : this.refs[R] = y), R;
    }
    function w(R) {
      if (typeof R == "string") {
        if (!dl.test(R))
          throw new Error(`invalid anchor "${R}"`);
        m.call(this, `#${R}`);
      }
    }
  }), l;
  function d(f, _, $) {
    if (_ !== void 0 && !sl(f, _))
      throw c($);
  }
  function c(f) {
    return new Error(`reference "${f}" resolves to more than one schema`);
  }
}
ce.getSchemaRefs = fl;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getData = Se.KeywordCxt = Se.validateFunctionCode = void 0;
const No = Et, Ys = se, Vn = Fe, hr = se, hl = _r, Vt = ke, en = Ze, D = U, z = _e, ml = ce, ze = T, At = Ht;
function pl(e) {
  if (jo(e) && (Ao(e), To(e))) {
    gl(e);
    return;
  }
  Oo(e, () => (0, No.topBoolOrEmptySchema)(e));
}
Se.validateFunctionCode = pl;
function Oo({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, D._)`${z.default.data}, ${z.default.valCxt}`, n.$async, () => {
    e.code((0, D._)`"use strict"; ${Qs(r, s)}`), yl(e, s), e.code(a);
  }) : e.func(t, (0, D._)`${z.default.data}, ${$l(s)}`, n.$async, () => e.code(Qs(r, s)).code(a));
}
function $l(e) {
  return (0, D._)`{${z.default.instancePath}="", ${z.default.parentData}, ${z.default.parentDataProperty}, ${z.default.rootData}=${z.default.data}${e.dynamicRef ? (0, D._)`, ${z.default.dynamicAnchors}={}` : D.nil}}={}`;
}
function yl(e, t) {
  e.if(z.default.valCxt, () => {
    e.var(z.default.instancePath, (0, D._)`${z.default.valCxt}.${z.default.instancePath}`), e.var(z.default.parentData, (0, D._)`${z.default.valCxt}.${z.default.parentData}`), e.var(z.default.parentDataProperty, (0, D._)`${z.default.valCxt}.${z.default.parentDataProperty}`), e.var(z.default.rootData, (0, D._)`${z.default.valCxt}.${z.default.rootData}`), t.dynamicRef && e.var(z.default.dynamicAnchors, (0, D._)`${z.default.valCxt}.${z.default.dynamicAnchors}`);
  }, () => {
    e.var(z.default.instancePath, (0, D._)`""`), e.var(z.default.parentData, (0, D._)`undefined`), e.var(z.default.parentDataProperty, (0, D._)`undefined`), e.var(z.default.rootData, z.default.data), t.dynamicRef && e.var(z.default.dynamicAnchors, (0, D._)`{}`);
  });
}
function gl(e) {
  const { schema: t, opts: r, gen: n } = e;
  Oo(e, () => {
    r.$comment && t.$comment && Co(e), Sl(e), n.let(z.default.vErrors, null), n.let(z.default.errors, 0), r.unevaluated && vl(e), ko(e), Rl(e);
  });
}
function vl(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, D._)`${r}.evaluated`), t.if((0, D._)`${e.evaluated}.dynamicProps`, () => t.assign((0, D._)`${e.evaluated}.props`, (0, D._)`undefined`)), t.if((0, D._)`${e.evaluated}.dynamicItems`, () => t.assign((0, D._)`${e.evaluated}.items`, (0, D._)`undefined`));
}
function Qs(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, D._)`/*# sourceURL=${r} */` : D.nil;
}
function _l(e, t) {
  if (jo(e) && (Ao(e), To(e))) {
    El(e, t);
    return;
  }
  (0, No.boolOrEmptySchema)(e, t);
}
function To({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function jo(e) {
  return typeof e.schema != "boolean";
}
function El(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Co(e), bl(e), Pl(e);
  const a = n.const("_errs", z.default.errors);
  ko(e, a), n.var(t, (0, D._)`${a} === ${z.default.errors}`);
}
function Ao(e) {
  (0, ze.checkUnknownRules)(e), wl(e);
}
function ko(e, t) {
  if (e.opts.jtd)
    return Zs(e, [], !1, t);
  const r = (0, Ys.getSchemaTypes)(e.schema), n = (0, Ys.coerceAndCheckDataType)(e, r);
  Zs(e, r, !n, t);
}
function wl(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, ze.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Sl(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, ze.checkStrictMode)(e, "default is ignored in the schema root");
}
function bl(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, ml.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Pl(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Co({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, D._)`${z.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, D.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, D._)`${z.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function Rl(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, D._)`${z.default.errors} === 0`, () => t.return(z.default.data), () => t.throw((0, D._)`new ${s}(${z.default.vErrors})`)) : (t.assign((0, D._)`${n}.errors`, z.default.vErrors), a.unevaluated && Il(e), t.return((0, D._)`${z.default.errors} === 0`));
}
function Il({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof D.Name && e.assign((0, D._)`${t}.props`, r), n instanceof D.Name && e.assign((0, D._)`${t}.items`, n);
}
function Zs(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: i, self: d } = e, { RULES: c } = d;
  if (a.$ref && (i.ignoreKeywordsWithRef || !(0, ze.schemaHasRulesButRef)(a, c))) {
    s.block(() => Mo(e, "$ref", c.all.$ref.definition));
    return;
  }
  i.jtd || Nl(e, t), s.block(() => {
    for (const _ of c.rules)
      f(_);
    f(c.post);
  });
  function f(_) {
    (0, Vn.shouldUseGroup)(a, _) && (_.type ? (s.if((0, hr.checkDataType)(_.type, o, i.strictNumbers)), ea(e, _), t.length === 1 && t[0] === _.type && r && (s.else(), (0, hr.reportTypeError)(e)), s.endIf()) : ea(e, _), l || s.if((0, D._)`${z.default.errors} === ${n || 0}`));
  }
}
function ea(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, hl.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Vn.shouldUseRule)(n, a) && Mo(e, a.keyword, a.definition, t.type);
  });
}
function Nl(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Ol(e, t), e.opts.allowUnionTypes || Tl(e, t), jl(e, e.dataTypes));
}
function Ol(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Do(e.dataTypes, r) || Fn(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), kl(e, t);
  }
}
function Tl(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Fn(e, "use allowUnionTypes to allow union type keyword");
}
function jl(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Vn.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Al(t, o)) && Fn(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Al(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Do(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function kl(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Do(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Fn(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, ze.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Lo {
  constructor(t, r, n) {
    if ((0, Vt.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, ze.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Vo(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Vt.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", z.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, D.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, D.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, D._)`${r} !== undefined && (${(0, D.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? At.reportExtraError : At.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, At.reportError)(this, this.def.$dataError || At.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, At.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = D.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = D.nil, r = D.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, D.or)((0, D._)`${s} === undefined`, r)), t !== D.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== D.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, D.or)(o(), l());
    function o() {
      if (n.length) {
        if (!(r instanceof D.Name))
          throw new Error("ajv implementation error");
        const i = Array.isArray(n) ? n : [n];
        return (0, D._)`${(0, hr.checkDataTypes)(i, r, a.opts.strictNumbers, hr.DataType.Wrong)}`;
      }
      return D.nil;
    }
    function l() {
      if (s.validateSchema) {
        const i = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, D._)`!${i}(${r})`;
      }
      return D.nil;
    }
  }
  subschema(t, r) {
    const n = (0, en.getSubschema)(this.it, t);
    (0, en.extendSubschemaData)(n, this.it, t), (0, en.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return _l(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = ze.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = ze.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, D.Name)), !0;
  }
}
Se.KeywordCxt = Lo;
function Mo(e, t, r, n) {
  const s = new Lo(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Vt.funcKeywordCode)(s, r) : "macro" in r ? (0, Vt.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Vt.funcKeywordCode)(s, r);
}
const Cl = /^\/(?:[^~]|~0|~1)*$/, Dl = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Vo(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return z.default.rootData;
  if (e[0] === "/") {
    if (!Cl.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = z.default.rootData;
  } else {
    const d = Dl.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const c = +d[1];
    if (s = d[2], s === "#") {
      if (c >= t)
        throw new Error(i("property/index", c));
      return n[t - c];
    }
    if (c > t)
      throw new Error(i("data", c));
    if (a = r[t - c], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, D._)`${a}${(0, D.getProperty)((0, ze.unescapeJsonPointer)(d))}`, o = (0, D._)`${o} && ${a}`);
  return o;
  function i(d, c) {
    return `Cannot access ${d} ${c} levels up, current level is ${t}`;
  }
}
Se.getData = Vo;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
class Ll extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
wt.default = Ll;
var lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 });
const tn = ce;
class Ml extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, tn.resolveUrl)(t, r, n), this.missingSchema = (0, tn.normalizeId)((0, tn.getFullPath)(t, this.missingRef));
  }
}
lt.default = Ml;
var me = {};
Object.defineProperty(me, "__esModule", { value: !0 });
me.resolveSchema = me.getCompilingSchema = me.resolveRef = me.compileSchema = me.SchemaEnv = void 0;
const Pe = U, Vl = wt, et = _e, Ie = ce, ta = T, Fl = Se;
class Er {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Ie.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
me.SchemaEnv = Er;
function zn(e) {
  const t = Fo.call(this, e);
  if (t)
    return t;
  const r = (0, Ie.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Pe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: Vl.default,
    code: (0, Pe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const i = o.scopeName("validate");
  e.validateName = i;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: et.default.data,
    parentData: et.default.parentData,
    parentDataProperty: et.default.parentDataProperty,
    dataNames: [et.default.data],
    dataPathArr: [Pe.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Pe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: i,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Pe.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Pe._)`""`,
    opts: this.opts,
    self: this
  };
  let c;
  try {
    this._compilations.add(e), (0, Fl.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const f = o.toString();
    c = `${o.scopeRefs(et.default.scope)}return ${f}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const $ = new Function(`${et.default.self}`, `${et.default.scope}`, c)(this, this.scope.get());
    if (this.scope.value(i, { ref: $ }), $.errors = null, $.schema = e.schema, $.schemaEnv = e, e.$async && ($.$async = !0), this.opts.code.source === !0 && ($.source = { validateName: i, validateCode: f, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: E, items: y } = d;
      $.evaluated = {
        props: E instanceof Pe.Name ? void 0 : E,
        items: y instanceof Pe.Name ? void 0 : y,
        dynamicProps: E instanceof Pe.Name,
        dynamicItems: y instanceof Pe.Name
      }, $.source && ($.source.evaluated = (0, Pe.stringify)($.evaluated));
    }
    return e.validate = $, e;
  } catch (f) {
    throw delete e.validate, delete e.validateName, c && this.logger.error("Error compiling schema, function code:", c), f;
  } finally {
    this._compilations.delete(e);
  }
}
me.compileSchema = zn;
function zl(e, t, r) {
  var n;
  r = (0, Ie.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Gl.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new Er({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Ul.call(this, a);
}
me.resolveRef = zl;
function Ul(e) {
  return (0, Ie.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : zn.call(this, e);
}
function Fo(e) {
  for (const t of this._compilations)
    if (ql(t, e))
      return t;
}
me.getCompilingSchema = Fo;
function ql(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Gl(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || wr.call(this, e, t);
}
function wr(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Ie._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Ie.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return rn.call(this, r, e);
  const a = (0, Ie.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = wr.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : rn.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || zn.call(this, o), a === (0, Ie.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: i } = this.opts, d = l[i];
      return d && (s = (0, Ie.resolveUrl)(this.opts.uriResolver, s, d)), new Er({ schema: l, schemaId: i, root: e, baseId: s });
    }
    return rn.call(this, r, o);
  }
}
me.resolveSchema = wr;
const Kl = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function rn(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const i = r[(0, ta.unescapeFragment)(l)];
    if (i === void 0)
      return;
    r = i;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Kl.has(l) && d && (t = (0, Ie.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, ta.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Ie.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = wr.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new Er({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Hl = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Xl = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Bl = "object", Wl = [
  "$data"
], xl = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Jl = !1, Yl = {
  $id: Hl,
  description: Xl,
  type: Bl,
  required: Wl,
  properties: xl,
  additionalProperties: Jl
};
var Un = {}, Sr = { exports: {} };
const Ql = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
var Zl = {
  HEX: Ql
};
const { HEX: eu } = Zl, tu = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
function zo(e) {
  if (qo(e, ".") < 3)
    return { host: e, isIPV4: !1 };
  const t = e.match(tu) || [], [r] = t;
  return r ? { host: nu(r, "."), isIPV4: !0 } : { host: e, isIPV4: !1 };
}
function ra(e, t = !1) {
  let r = "", n = !0;
  for (const s of e) {
    if (eu[s] === void 0) return;
    s !== "0" && n === !0 && (n = !1), n || (r += s);
  }
  return t && r.length === 0 && (r = "0"), r;
}
function ru(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, l = !1;
  function i() {
    if (s.length) {
      if (a === !1) {
        const d = ra(s);
        if (d !== void 0)
          n.push(d);
        else
          return r.error = !0, !1;
      }
      s.length = 0;
    }
    return !0;
  }
  for (let d = 0; d < e.length; d++) {
    const c = e[d];
    if (!(c === "[" || c === "]"))
      if (c === ":") {
        if (o === !0 && (l = !0), !i())
          break;
        if (t++, n.push(":"), t > 7) {
          r.error = !0;
          break;
        }
        d - 1 >= 0 && e[d - 1] === ":" && (o = !0);
        continue;
      } else if (c === "%") {
        if (!i())
          break;
        a = !0;
      } else {
        s.push(c);
        continue;
      }
  }
  return s.length && (a ? r.zone = s.join("") : l ? n.push(s.join("")) : n.push(ra(s))), r.address = n.join(""), r;
}
function Uo(e) {
  if (qo(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = ru(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, escapedHost: n, isIPV6: !0 };
  }
}
function nu(e, t) {
  let r = "", n = !0;
  const s = e.length;
  for (let a = 0; a < s; a++) {
    const o = e[a];
    o === "0" && n ? (a + 1 <= s && e[a + 1] === t || a + 1 === s) && (r += o, n = !1) : (o === t ? n = !0 : n = !1, r += o);
  }
  return r;
}
function qo(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
const na = /^\.\.?\//u, sa = /^\/\.(?:\/|$)/u, aa = /^\/\.\.(?:\/|$)/u, su = /^\/?(?:.|\n)*?(?=\/|$)/u;
function au(e) {
  const t = [];
  for (; e.length; )
    if (e.match(na))
      e = e.replace(na, "");
    else if (e.match(sa))
      e = e.replace(sa, "/");
    else if (e.match(aa))
      e = e.replace(aa, "/"), t.pop();
    else if (e === "." || e === "..")
      e = "";
    else {
      const r = e.match(su);
      if (r) {
        const n = r[0];
        e = e.slice(n.length), t.push(n);
      } else
        throw new Error("Unexpected dot segment condition");
    }
  return t.join("");
}
function ou(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function iu(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    const n = zo(r);
    if (n.isIPV4)
      r = n.host;
    else {
      const s = Uo(n.host);
      s.isIPV6 === !0 ? r = `[${s.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var cu = {
  recomposeAuthority: iu,
  normalizeComponentEncoding: ou,
  removeDotSegments: au,
  normalizeIPv4: zo,
  normalizeIPv6: Uo
};
const lu = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, uu = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Go(e) {
  return typeof e.secure == "boolean" ? e.secure : String(e.scheme).toLowerCase() === "wss";
}
function Ko(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Ho(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function du(e) {
  return e.secure = Go(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function fu(e) {
  if ((e.port === (Go(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function hu(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(uu);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = qn[s];
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function mu(e, t) {
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = qn[s];
  a && (e = a.serialize(e, t));
  const o = e, l = e.nss;
  return o.path = `${n || t.nid}:${l}`, t.skipEscape = !0, o;
}
function pu(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !lu.test(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function $u(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Xo = {
  scheme: "http",
  domainHost: !0,
  parse: Ko,
  serialize: Ho
}, yu = {
  scheme: "https",
  domainHost: Xo.domainHost,
  parse: Ko,
  serialize: Ho
}, ir = {
  scheme: "ws",
  domainHost: !0,
  parse: du,
  serialize: fu
}, gu = {
  scheme: "wss",
  domainHost: ir.domainHost,
  parse: ir.parse,
  serialize: ir.serialize
}, vu = {
  scheme: "urn",
  parse: hu,
  serialize: mu,
  skipNormalize: !0
}, _u = {
  scheme: "urn:uuid",
  parse: pu,
  serialize: $u,
  skipNormalize: !0
}, qn = {
  http: Xo,
  https: yu,
  ws: ir,
  wss: gu,
  urn: vu,
  "urn:uuid": _u
};
var Eu = qn;
const { normalizeIPv6: wu, normalizeIPv4: Su, removeDotSegments: Lt, recomposeAuthority: bu, normalizeComponentEncoding: Wt } = cu, Gn = Eu;
function Pu(e, t) {
  return typeof e == "string" ? e = Ce(Ue(e, t), t) : typeof e == "object" && (e = Ue(Ce(e, t), t)), e;
}
function Ru(e, t, r) {
  const n = Object.assign({ scheme: "null" }, r), s = Bo(Ue(e, n), Ue(t, n), n, !0);
  return Ce(s, { ...n, skipEscape: !0 });
}
function Bo(e, t, r, n) {
  const s = {};
  return n || (e = Ue(Ce(e, r), r), t = Ue(Ce(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Lt(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Lt(t.path || ""), s.query = t.query) : (t.path ? (t.path.charAt(0) === "/" ? s.path = Lt(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Lt(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Iu(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = Ce(Wt(Ue(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = Ce(Wt(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = Ce(Wt(Ue(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = Ce(Wt(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function Ce(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), s = [], a = Gn[(n.scheme || r.scheme || "").toLowerCase()];
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = bu(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path.charAt(0) !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = Lt(l)), o === void 0 && (l = l.replace(/^\/\//u, "/%2F")), s.push(l);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Nu = Array.from({ length: 127 }, (e, t) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(t)));
function Ou(e) {
  let t = 0;
  for (let r = 0, n = e.length; r < n; ++r)
    if (t = e.charCodeAt(r), t > 126 || Nu[t])
      return !0;
  return !1;
}
const Tu = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Ue(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  }, s = e.indexOf("%") !== -1;
  let a = !1;
  r.reference === "suffix" && (e = (r.scheme ? r.scheme + ":" : "") + "//" + e);
  const o = e.match(Tu);
  if (o) {
    if (n.scheme = o[1], n.userinfo = o[3], n.host = o[4], n.port = parseInt(o[5], 10), n.path = o[6] || "", n.query = o[7], n.fragment = o[8], isNaN(n.port) && (n.port = o[5]), n.host) {
      const i = Su(n.host);
      if (i.isIPV4 === !1) {
        const d = wu(i.host);
        n.host = d.host.toLowerCase(), a = d.isIPV6;
      } else
        n.host = i.host, a = !0;
    }
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const l = Gn[(r.scheme || n.scheme || "").toLowerCase()];
    if (!r.unicodeSupport && (!l || !l.unicodeSupport) && n.host && (r.domainHost || l && l.domainHost) && a === !1 && Ou(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (i) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + i;
      }
    (!l || l && !l.skipNormalize) && (s && n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), s && n.host !== void 0 && (n.host = unescape(n.host)), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), l && l.parse && l.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const Kn = {
  SCHEMES: Gn,
  normalize: Pu,
  resolve: Ru,
  resolveComponents: Bo,
  equal: Iu,
  serialize: Ce,
  parse: Ue
};
Sr.exports = Kn;
Sr.exports.default = Kn;
Sr.exports.fastUri = Kn;
var ju = Sr.exports;
Object.defineProperty(Un, "__esModule", { value: !0 });
const Wo = ju;
Wo.code = 'require("ajv/dist/runtime/uri").default';
Un.default = Wo;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Se;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = U;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = wt, s = lt, a = it, o = me, l = U, i = ce, d = se, c = T, f = Yl, _ = Un, $ = (P, p) => new RegExp(P, p);
  $.code = "new RegExp";
  const E = ["removeAdditional", "useDefaults", "coerceTypes"], y = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), v = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, w = 200;
  function R(P) {
    var p, S, g, u, h, b, L, M, W, X, oe, ut, Vr, Fr, zr, Ur, qr, Gr, Kr, Hr, Xr, Br, Wr, xr, Jr;
    const Nt = P.strict, Yr = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Fs = Yr === !0 || Yr === void 0 ? 1 : Yr || 0, zs = (g = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && g !== void 0 ? g : $, Ei = (u = P.uriResolver) !== null && u !== void 0 ? u : _.default;
    return {
      strictSchema: (b = (h = P.strictSchema) !== null && h !== void 0 ? h : Nt) !== null && b !== void 0 ? b : !0,
      strictNumbers: (M = (L = P.strictNumbers) !== null && L !== void 0 ? L : Nt) !== null && M !== void 0 ? M : !0,
      strictTypes: (X = (W = P.strictTypes) !== null && W !== void 0 ? W : Nt) !== null && X !== void 0 ? X : "log",
      strictTuples: (ut = (oe = P.strictTuples) !== null && oe !== void 0 ? oe : Nt) !== null && ut !== void 0 ? ut : "log",
      strictRequired: (Fr = (Vr = P.strictRequired) !== null && Vr !== void 0 ? Vr : Nt) !== null && Fr !== void 0 ? Fr : !1,
      code: P.code ? { ...P.code, optimize: Fs, regExp: zs } : { optimize: Fs, regExp: zs },
      loopRequired: (zr = P.loopRequired) !== null && zr !== void 0 ? zr : w,
      loopEnum: (Ur = P.loopEnum) !== null && Ur !== void 0 ? Ur : w,
      meta: (qr = P.meta) !== null && qr !== void 0 ? qr : !0,
      messages: (Gr = P.messages) !== null && Gr !== void 0 ? Gr : !0,
      inlineRefs: (Kr = P.inlineRefs) !== null && Kr !== void 0 ? Kr : !0,
      schemaId: (Hr = P.schemaId) !== null && Hr !== void 0 ? Hr : "$id",
      addUsedSchema: (Xr = P.addUsedSchema) !== null && Xr !== void 0 ? Xr : !0,
      validateSchema: (Br = P.validateSchema) !== null && Br !== void 0 ? Br : !0,
      validateFormats: (Wr = P.validateFormats) !== null && Wr !== void 0 ? Wr : !0,
      unicodeRegExp: (xr = P.unicodeRegExp) !== null && xr !== void 0 ? xr : !0,
      int32range: (Jr = P.int32range) !== null && Jr !== void 0 ? Jr : !0,
      uriResolver: Ei
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...R(p) };
      const { es5: S, lines: g } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: y, es5: S, lines: g }), this.logger = q(p.logger);
      const u = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), j.call(this, v, p, "NOT SUPPORTED"), j.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = be.call(this), p.formats && $e.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && Ee.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), te.call(this), p.validateFormats = u;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: g } = this.opts;
      let u = f;
      g === "id" && (u = { ...f }, u.id = u.$id, delete u.$id), S && p && this.addMetaSchema(u, u[g], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let g;
      if (typeof p == "string") {
        if (g = this.getSchema(p), !g)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        g = this.compile(p);
      const u = g(S);
      return "$async" in g || (this.errors = g.errors), u;
    }
    compile(p, S) {
      const g = this._addSchema(p, S);
      return g.validate || this._compileSchemaEnv(g);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: g } = this.opts;
      return u.call(this, p, S);
      async function u(X, oe) {
        await h.call(this, X.$schema);
        const ut = this._addSchema(X, oe);
        return ut.validate || b.call(this, ut);
      }
      async function h(X) {
        X && !this.getSchema(X) && await u.call(this, { $ref: X }, !0);
      }
      async function b(X) {
        try {
          return this._compileSchemaEnv(X);
        } catch (oe) {
          if (!(oe instanceof s.default))
            throw oe;
          return L.call(this, oe), await M.call(this, oe.missingSchema), b.call(this, X);
        }
      }
      function L({ missingSchema: X, missingRef: oe }) {
        if (this.refs[X])
          throw new Error(`AnySchema ${X} is loaded but ${oe} cannot be resolved`);
      }
      async function M(X) {
        const oe = await W.call(this, X);
        this.refs[X] || await h.call(this, oe.$schema), this.refs[X] || this.addSchema(oe, X, S);
      }
      async function W(X) {
        const oe = this._loading[X];
        if (oe)
          return oe;
        try {
          return await (this._loading[X] = g(X));
        } finally {
          delete this._loading[X];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, g, u = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, g, u);
        return this;
      }
      let h;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (h = p[b], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, i.normalizeId)(S || h), this._checkUnique(S), this.schemas[S] = this._addSchema(p, g, S, u, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, g = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, g), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let g;
      if (g = p.$schema, g !== void 0 && typeof g != "string")
        throw new Error("$schema must be a string");
      if (g = g || this.opts.defaultMeta || this.defaultMeta(), !g)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const u = this.validate(g, p);
      if (!u && S) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return u;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = B.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: g } = this.opts, u = new o.SchemaEnv({ schema: {}, schemaId: g });
        if (S = o.resolveSchema.call(this, u, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = B.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let g = p[this.opts.schemaId];
          return g && (g = (0, i.normalizeId)(g), delete this.schemas[g], delete this.refs[g]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let g;
      if (typeof p == "string")
        g = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = g);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, g = S.keyword, Array.isArray(g) && !g.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (I.call(this, g, S), !S)
        return (0, c.eachItem)(g, (h) => N.call(this, h)), this;
      A.call(this, S);
      const u = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, c.eachItem)(g, u.type.length === 0 ? (h) => N.call(this, h, u) : (h) => u.type.forEach((b) => N.call(this, h, u, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const g of S.rules) {
        const u = g.rules.findIndex((h) => h.keyword === p);
        u >= 0 && g.rules.splice(u, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: g = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((u) => `${g}${u.instancePath} ${u.message}`).reduce((u, h) => u + S + h);
    }
    $dataMetaSchema(p, S) {
      const g = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const u of S) {
        const h = u.split("/").slice(1);
        let b = p;
        for (const L of h)
          b = b[L];
        for (const L in g) {
          const M = g[L];
          if (typeof M != "object")
            continue;
          const { $data: W } = M.definition, X = b[L];
          W && X && (b[L] = k(X));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const g in p) {
        const u = p[g];
        (!S || S.test(g)) && (typeof u == "string" ? delete p[g] : u && !u.meta && (this._cache.delete(u.schema), delete p[g]));
      }
    }
    _addSchema(p, S, g, u = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let b;
      const { schemaId: L } = this.opts;
      if (typeof p == "object")
        b = p[L];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let M = this._cache.get(p);
      if (M !== void 0)
        return M;
      g = (0, i.normalizeId)(b || g);
      const W = i.getSchemaRefs.call(this, p, g);
      return M = new o.SchemaEnv({ schema: p, schemaId: L, meta: S, baseId: g, localRefs: W }), this._cache.set(M.schema, M), h && !g.startsWith("#") && (g && this._checkUnique(g), this.refs[g] = M), u && this.validateSchema(p, !0), M;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  O.ValidationError = n.default, O.MissingRefError = s.default, e.default = O;
  function j(P, p, S, g = "error") {
    for (const u in P) {
      const h = u;
      h in p && this.logger[g](`${S}: option ${u}. ${P[h]}`);
    }
  }
  function B(P) {
    return P = (0, i.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function te() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function $e() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function Ee(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function be() {
    const P = { ...this.opts };
    for (const p of E)
      delete P[p];
    return P;
  }
  const F = { log() {
  }, warn() {
  }, error() {
  } };
  function q(P) {
    if (P === !1)
      return F;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const Y = /^[a-z_$][a-z0-9_$:-]*$/i;
  function I(P, p) {
    const { RULES: S } = this;
    if ((0, c.eachItem)(P, (g) => {
      if (S.keywords[g])
        throw new Error(`Keyword ${g} is already defined`);
      if (!Y.test(g))
        throw new Error(`Keyword ${g} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function N(P, p, S) {
    var g;
    const u = p == null ? void 0 : p.post;
    if (S && u)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let b = u ? h.post : h.rules.find(({ type: M }) => M === S);
    if (b || (b = { type: S, rules: [] }, h.rules.push(b)), h.keywords[P] = !0, !p)
      return;
    const L = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? C.call(this, b, L, p.before) : b.rules.push(L), h.all[P] = L, (g = p.implements) === null || g === void 0 || g.forEach((M) => this.addKeyword(M));
  }
  function C(P, p, S) {
    const g = P.rules.findIndex((u) => u.keyword === S);
    g >= 0 ? P.rules.splice(g, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function A(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = k(p)), P.validateSchema = this.compile(p, !0));
  }
  const V = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function k(P) {
    return { anyOf: [P, V] };
  }
})(Tn);
var Hn = {}, br = {}, Xn = {};
Object.defineProperty(Xn, "__esModule", { value: !0 });
const Au = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Xn.default = Au;
var qe = {};
Object.defineProperty(qe, "__esModule", { value: !0 });
qe.callRef = qe.getValidate = void 0;
const ku = lt, oa = H, ye = U, ht = _e, ia = me, xt = T, Cu = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: i } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return f();
    const c = ia.resolveRef.call(i, d, s, r);
    if (c === void 0)
      throw new ku.default(n.opts.uriResolver, s, r);
    if (c instanceof ia.SchemaEnv)
      return _(c);
    return $(c);
    function f() {
      if (a === d)
        return cr(e, o, a, a.$async);
      const E = t.scopeValue("root", { ref: d });
      return cr(e, (0, ye._)`${E}.validate`, d, d.$async);
    }
    function _(E) {
      const y = xo(e, E);
      cr(e, y, E, E.$async);
    }
    function $(E) {
      const y = t.scopeValue("schema", l.code.source === !0 ? { ref: E, code: (0, ye.stringify)(E) } : { ref: E }), v = t.name("valid"), m = e.subschema({
        schema: E,
        dataTypes: [],
        schemaPath: ye.nil,
        topSchemaRef: y,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(m), e.ok(v);
    }
  }
};
function xo(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, ye._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
qe.getValidate = xo;
function cr(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: i } = a, d = i.passContext ? ht.default.this : ye.nil;
  n ? c() : f();
  function c() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const E = s.let("valid");
    s.try(() => {
      s.code((0, ye._)`await ${(0, oa.callValidateCode)(e, t, d)}`), $(t), o || s.assign(E, !0);
    }, (y) => {
      s.if((0, ye._)`!(${y} instanceof ${a.ValidationError})`, () => s.throw(y)), _(y), o || s.assign(E, !1);
    }), e.ok(E);
  }
  function f() {
    e.result((0, oa.callValidateCode)(e, t, d), () => $(t), () => _(t));
  }
  function _(E) {
    const y = (0, ye._)`${E}.errors`;
    s.assign(ht.default.vErrors, (0, ye._)`${ht.default.vErrors} === null ? ${y} : ${ht.default.vErrors}.concat(${y})`), s.assign(ht.default.errors, (0, ye._)`${ht.default.vErrors}.length`);
  }
  function $(E) {
    var y;
    if (!a.opts.unevaluated)
      return;
    const v = (y = r == null ? void 0 : r.validate) === null || y === void 0 ? void 0 : y.evaluated;
    if (a.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (a.props = xt.mergeEvaluated.props(s, v.props, a.props));
      else {
        const m = s.var("props", (0, ye._)`${E}.evaluated.props`);
        a.props = xt.mergeEvaluated.props(s, m, a.props, ye.Name);
      }
    if (a.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (a.items = xt.mergeEvaluated.items(s, v.items, a.items));
      else {
        const m = s.var("items", (0, ye._)`${E}.evaluated.items`);
        a.items = xt.mergeEvaluated.items(s, m, a.items, ye.Name);
      }
  }
}
qe.callRef = cr;
qe.default = Cu;
Object.defineProperty(br, "__esModule", { value: !0 });
const Du = Xn, Lu = qe, Mu = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Du.default,
  Lu.default
];
br.default = Mu;
var Pr = {}, Bn = {};
Object.defineProperty(Bn, "__esModule", { value: !0 });
const mr = U, We = mr.operators, pr = {
  maximum: { okStr: "<=", ok: We.LTE, fail: We.GT },
  minimum: { okStr: ">=", ok: We.GTE, fail: We.LT },
  exclusiveMaximum: { okStr: "<", ok: We.LT, fail: We.GTE },
  exclusiveMinimum: { okStr: ">", ok: We.GT, fail: We.LTE }
}, Vu = {
  message: ({ keyword: e, schemaCode: t }) => (0, mr.str)`must be ${pr[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, mr._)`{comparison: ${pr[e].okStr}, limit: ${t}}`
}, Fu = {
  keyword: Object.keys(pr),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Vu,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, mr._)`${r} ${pr[t].fail} ${n} || isNaN(${r})`);
  }
};
Bn.default = Fu;
var Wn = {};
Object.defineProperty(Wn, "__esModule", { value: !0 });
const Ft = U, zu = {
  message: ({ schemaCode: e }) => (0, Ft.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Ft._)`{multipleOf: ${e}}`
}, Uu = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: zu,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, Ft._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Ft._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Ft._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Wn.default = Uu;
var xn = {}, Jn = {};
Object.defineProperty(Jn, "__esModule", { value: !0 });
function Jo(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Jn.default = Jo;
Jo.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(xn, "__esModule", { value: !0 });
const rt = U, qu = T, Gu = Jn, Ku = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, rt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, rt._)`{limit: ${e}}`
}, Hu = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Ku,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? rt.operators.GT : rt.operators.LT, o = s.opts.unicode === !1 ? (0, rt._)`${r}.length` : (0, rt._)`${(0, qu.useFunc)(e.gen, Gu.default)}(${r})`;
    e.fail$data((0, rt._)`${o} ${a} ${n}`);
  }
};
xn.default = Hu;
var Yn = {};
Object.defineProperty(Yn, "__esModule", { value: !0 });
const Xu = H, $r = U, Bu = {
  message: ({ schemaCode: e }) => (0, $r.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, $r._)`{pattern: ${e}}`
}, Wu = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Bu,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, $r._)`(new RegExp(${s}, ${o}))` : (0, Xu.usePattern)(e, n);
    e.fail$data((0, $r._)`!${l}.test(${t})`);
  }
};
Yn.default = Wu;
var Qn = {};
Object.defineProperty(Qn, "__esModule", { value: !0 });
const zt = U, xu = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, zt.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, zt._)`{limit: ${e}}`
}, Ju = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: xu,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? zt.operators.GT : zt.operators.LT;
    e.fail$data((0, zt._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Qn.default = Ju;
var Zn = {};
Object.defineProperty(Zn, "__esModule", { value: !0 });
const kt = H, Ut = U, Yu = T, Qu = {
  message: ({ params: { missingProperty: e } }) => (0, Ut.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Ut._)`{missingProperty: ${e}}`
}, Zu = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Qu,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const i = r.length >= l.loopRequired;
    if (o.allErrors ? d() : c(), l.strictRequired) {
      const $ = e.parentSchema.properties, { definedProperties: E } = e.it;
      for (const y of r)
        if (($ == null ? void 0 : $[y]) === void 0 && !E.has(y)) {
          const v = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${y}" is not defined at "${v}" (strictRequired)`;
          (0, Yu.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (i || a)
        e.block$data(Ut.nil, f);
      else
        for (const $ of r)
          (0, kt.checkReportMissingProp)(e, $);
    }
    function c() {
      const $ = t.let("missing");
      if (i || a) {
        const E = t.let("valid", !0);
        e.block$data(E, () => _($, E)), e.ok(E);
      } else
        t.if((0, kt.checkMissingProp)(e, r, $)), (0, kt.reportMissingProp)(e, $), t.else();
    }
    function f() {
      t.forOf("prop", n, ($) => {
        e.setParams({ missingProperty: $ }), t.if((0, kt.noPropertyInData)(t, s, $, l.ownProperties), () => e.error());
      });
    }
    function _($, E) {
      e.setParams({ missingProperty: $ }), t.forOf($, n, () => {
        t.assign(E, (0, kt.propertyInData)(t, s, $, l.ownProperties)), t.if((0, Ut.not)(E), () => {
          e.error(), t.break();
        });
      }, Ut.nil);
    }
  }
};
Zn.default = Zu;
var es = {};
Object.defineProperty(es, "__esModule", { value: !0 });
const qt = U, ed = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, qt.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, qt._)`{limit: ${e}}`
}, td = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: ed,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? qt.operators.GT : qt.operators.LT;
    e.fail$data((0, qt._)`${r}.length ${s} ${n}`);
  }
};
es.default = td;
var ts = {}, Xt = {};
Object.defineProperty(Xt, "__esModule", { value: !0 });
const Yo = So;
Yo.code = 'require("ajv/dist/runtime/equal").default';
Xt.default = Yo;
Object.defineProperty(ts, "__esModule", { value: !0 });
const nn = se, ie = U, rd = T, nd = Xt, sd = {
  message: ({ params: { i: e, j: t } }) => (0, ie.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, ie._)`{i: ${e}, j: ${t}}`
}, ad = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: sd,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const i = t.let("valid"), d = a.items ? (0, nn.getSchemaTypes)(a.items) : [];
    e.block$data(i, c, (0, ie._)`${o} === false`), e.ok(i);
    function c() {
      const E = t.let("i", (0, ie._)`${r}.length`), y = t.let("j");
      e.setParams({ i: E, j: y }), t.assign(i, !0), t.if((0, ie._)`${E} > 1`, () => (f() ? _ : $)(E, y));
    }
    function f() {
      return d.length > 0 && !d.some((E) => E === "object" || E === "array");
    }
    function _(E, y) {
      const v = t.name("item"), m = (0, nn.checkDataTypes)(d, v, l.opts.strictNumbers, nn.DataType.Wrong), w = t.const("indices", (0, ie._)`{}`);
      t.for((0, ie._)`;${E}--;`, () => {
        t.let(v, (0, ie._)`${r}[${E}]`), t.if(m, (0, ie._)`continue`), d.length > 1 && t.if((0, ie._)`typeof ${v} == "string"`, (0, ie._)`${v} += "_"`), t.if((0, ie._)`typeof ${w}[${v}] == "number"`, () => {
          t.assign(y, (0, ie._)`${w}[${v}]`), e.error(), t.assign(i, !1).break();
        }).code((0, ie._)`${w}[${v}] = ${E}`);
      });
    }
    function $(E, y) {
      const v = (0, rd.useFunc)(t, nd.default), m = t.name("outer");
      t.label(m).for((0, ie._)`;${E}--;`, () => t.for((0, ie._)`${y} = ${E}; ${y}--;`, () => t.if((0, ie._)`${v}(${r}[${E}], ${r}[${y}])`, () => {
        e.error(), t.assign(i, !1).break(m);
      })));
    }
  }
};
ts.default = ad;
var rs = {};
Object.defineProperty(rs, "__esModule", { value: !0 });
const vn = U, od = T, id = Xt, cd = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, vn._)`{allowedValue: ${e}}`
}, ld = {
  keyword: "const",
  $data: !0,
  error: cd,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, vn._)`!${(0, od.useFunc)(t, id.default)}(${r}, ${s})`) : e.fail((0, vn._)`${a} !== ${r}`);
  }
};
rs.default = ld;
var ns = {};
Object.defineProperty(ns, "__esModule", { value: !0 });
const Mt = U, ud = T, dd = Xt, fd = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Mt._)`{allowedValues: ${e}}`
}, hd = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: fd,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let i;
    const d = () => i ?? (i = (0, ud.useFunc)(t, dd.default));
    let c;
    if (l || n)
      c = t.let("valid"), e.block$data(c, f);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const $ = t.const("vSchema", a);
      c = (0, Mt.or)(...s.map((E, y) => _($, y)));
    }
    e.pass(c);
    function f() {
      t.assign(c, !1), t.forOf("v", a, ($) => t.if((0, Mt._)`${d()}(${r}, ${$})`, () => t.assign(c, !0).break()));
    }
    function _($, E) {
      const y = s[E];
      return typeof y == "object" && y !== null ? (0, Mt._)`${d()}(${r}, ${$}[${E}])` : (0, Mt._)`${r} === ${y}`;
    }
  }
};
ns.default = hd;
Object.defineProperty(Pr, "__esModule", { value: !0 });
const md = Bn, pd = Wn, $d = xn, yd = Yn, gd = Qn, vd = Zn, _d = es, Ed = ts, wd = rs, Sd = ns, bd = [
  // number
  md.default,
  pd.default,
  // string
  $d.default,
  yd.default,
  // object
  gd.default,
  vd.default,
  // array
  _d.default,
  Ed.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  wd.default,
  Sd.default
];
Pr.default = bd;
var Rr = {}, St = {};
Object.defineProperty(St, "__esModule", { value: !0 });
St.validateAdditionalItems = void 0;
const nt = U, _n = T, Pd = {
  message: ({ params: { len: e } }) => (0, nt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, nt._)`{limit: ${e}}`
}, Rd = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Pd,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, _n.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Qo(e, n);
  }
};
function Qo(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, nt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, nt._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, _n.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, nt._)`${l} <= ${t.length}`);
    r.if((0, nt.not)(d), () => i(d)), e.ok(d);
  }
  function i(d) {
    r.forRange("i", t.length, l, (c) => {
      e.subschema({ keyword: a, dataProp: c, dataPropType: _n.Type.Num }, d), o.allErrors || r.if((0, nt.not)(d), () => r.break());
    });
  }
}
St.validateAdditionalItems = Qo;
St.default = Rd;
var ss = {}, bt = {};
Object.defineProperty(bt, "__esModule", { value: !0 });
bt.validateTuple = void 0;
const ca = U, lr = T, Id = H, Nd = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Zo(e, "additionalItems", t);
    r.items = !0, !(0, lr.alwaysValidSchema)(r, t) && e.ok((0, Id.validateArray)(e));
  }
};
function Zo(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  c(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = lr.mergeEvaluated.items(n, r.length, l.items));
  const i = n.name("valid"), d = n.const("len", (0, ca._)`${a}.length`);
  r.forEach((f, _) => {
    (0, lr.alwaysValidSchema)(l, f) || (n.if((0, ca._)`${d} > ${_}`, () => e.subschema({
      keyword: o,
      schemaProp: _,
      dataProp: _
    }, i)), e.ok(i));
  });
  function c(f) {
    const { opts: _, errSchemaPath: $ } = l, E = r.length, y = E === f.minItems && (E === f.maxItems || f[t] === !1);
    if (_.strictTuples && !y) {
      const v = `"${o}" is ${E}-tuple, but minItems or maxItems/${t} are not specified or different at path "${$}"`;
      (0, lr.checkStrictMode)(l, v, _.strictTuples);
    }
  }
}
bt.validateTuple = Zo;
bt.default = Nd;
Object.defineProperty(ss, "__esModule", { value: !0 });
const Od = bt, Td = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Od.validateTuple)(e, "items")
};
ss.default = Td;
var as = {};
Object.defineProperty(as, "__esModule", { value: !0 });
const la = U, jd = T, Ad = H, kd = St, Cd = {
  message: ({ params: { len: e } }) => (0, la.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, la._)`{limit: ${e}}`
}, Dd = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Cd,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, jd.alwaysValidSchema)(n, t) && (s ? (0, kd.validateAdditionalItems)(e, s) : e.ok((0, Ad.validateArray)(e)));
  }
};
as.default = Dd;
var os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
const we = U, Jt = T, Ld = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, we.str)`must contain at least ${e} valid item(s)` : (0, we.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, we._)`{minContains: ${e}}` : (0, we._)`{minContains: ${e}, maxContains: ${t}}`
}, Md = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Ld,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: i, maxContains: d } = n;
    a.opts.next ? (o = i === void 0 ? 1 : i, l = d) : o = 1;
    const c = t.const("len", (0, we._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, Jt.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, Jt.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Jt.alwaysValidSchema)(a, r)) {
      let y = (0, we._)`${c} >= ${o}`;
      l !== void 0 && (y = (0, we._)`${y} && ${c} <= ${l}`), e.pass(y);
      return;
    }
    a.items = !0;
    const f = t.name("valid");
    l === void 0 && o === 1 ? $(f, () => t.if(f, () => t.break())) : o === 0 ? (t.let(f, !0), l !== void 0 && t.if((0, we._)`${s}.length > 0`, _)) : (t.let(f, !1), _()), e.result(f, () => e.reset());
    function _() {
      const y = t.name("_valid"), v = t.let("count", 0);
      $(y, () => t.if(y, () => E(v)));
    }
    function $(y, v) {
      t.forRange("i", 0, c, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Jt.Type.Num,
          compositeRule: !0
        }, y), v();
      });
    }
    function E(y) {
      t.code((0, we._)`${y}++`), l === void 0 ? t.if((0, we._)`${y} >= ${o}`, () => t.assign(f, !0).break()) : (t.if((0, we._)`${y} > ${l}`, () => t.assign(f, !1).break()), o === 1 ? t.assign(f, !0) : t.if((0, we._)`${y} >= ${o}`, () => t.assign(f, !0)));
    }
  }
};
os.default = Md;
var Ir = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = U, r = T, n = H;
  e.error = {
    message: ({ params: { property: i, depsCount: d, deps: c } }) => {
      const f = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${f} ${c} when property ${i} is present`;
    },
    params: ({ params: { property: i, depsCount: d, deps: c, missingProperty: f } }) => (0, t._)`{property: ${i},
    missingProperty: ${f},
    depsCount: ${d},
    deps: ${c}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(i) {
      const [d, c] = a(i);
      o(i, d), l(i, c);
    }
  };
  function a({ schema: i }) {
    const d = {}, c = {};
    for (const f in i) {
      if (f === "__proto__")
        continue;
      const _ = Array.isArray(i[f]) ? d : c;
      _[f] = i[f];
    }
    return [d, c];
  }
  function o(i, d = i.schema) {
    const { gen: c, data: f, it: _ } = i;
    if (Object.keys(d).length === 0)
      return;
    const $ = c.let("missing");
    for (const E in d) {
      const y = d[E];
      if (y.length === 0)
        continue;
      const v = (0, n.propertyInData)(c, f, E, _.opts.ownProperties);
      i.setParams({
        property: E,
        depsCount: y.length,
        deps: y.join(", ")
      }), _.allErrors ? c.if(v, () => {
        for (const m of y)
          (0, n.checkReportMissingProp)(i, m);
      }) : (c.if((0, t._)`${v} && (${(0, n.checkMissingProp)(i, y, $)})`), (0, n.reportMissingProp)(i, $), c.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(i, d = i.schema) {
    const { gen: c, data: f, keyword: _, it: $ } = i, E = c.name("valid");
    for (const y in d)
      (0, r.alwaysValidSchema)($, d[y]) || (c.if(
        (0, n.propertyInData)(c, f, y, $.opts.ownProperties),
        () => {
          const v = i.subschema({ keyword: _, schemaProp: y }, E);
          i.mergeValidEvaluated(v, E);
        },
        () => c.var(E, !0)
        // TODO var
      ), i.ok(E));
  }
  e.validateSchemaDeps = l, e.default = s;
})(Ir);
var is = {};
Object.defineProperty(is, "__esModule", { value: !0 });
const ei = U, Vd = T, Fd = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, ei._)`{propertyName: ${e.propertyName}}`
}, zd = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Fd,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Vd.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, ei.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
is.default = zd;
var Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
const Yt = H, Re = U, Ud = _e, Qt = T, qd = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Re._)`{additionalProperty: ${e.additionalProperty}}`
}, Gd = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: qd,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: i } = o;
    if (o.props = !0, i.removeAdditional !== "all" && (0, Qt.alwaysValidSchema)(o, r))
      return;
    const d = (0, Yt.allSchemaProperties)(n.properties), c = (0, Yt.allSchemaProperties)(n.patternProperties);
    f(), e.ok((0, Re._)`${a} === ${Ud.default.errors}`);
    function f() {
      t.forIn("key", s, (v) => {
        !d.length && !c.length ? E(v) : t.if(_(v), () => E(v));
      });
    }
    function _(v) {
      let m;
      if (d.length > 8) {
        const w = (0, Qt.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, Yt.isOwnProperty)(t, w, v);
      } else d.length ? m = (0, Re.or)(...d.map((w) => (0, Re._)`${v} === ${w}`)) : m = Re.nil;
      return c.length && (m = (0, Re.or)(m, ...c.map((w) => (0, Re._)`${(0, Yt.usePattern)(e, w)}.test(${v})`))), (0, Re.not)(m);
    }
    function $(v) {
      t.code((0, Re._)`delete ${s}[${v}]`);
    }
    function E(v) {
      if (i.removeAdditional === "all" || i.removeAdditional && r === !1) {
        $(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, Qt.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        i.removeAdditional === "failing" ? (y(v, m, !1), t.if((0, Re.not)(m), () => {
          e.reset(), $(v);
        })) : (y(v, m), l || t.if((0, Re.not)(m), () => t.break()));
      }
    }
    function y(v, m, w) {
      const R = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: Qt.Type.Str
      };
      w === !1 && Object.assign(R, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(R, m);
    }
  }
};
Nr.default = Gd;
var cs = {};
Object.defineProperty(cs, "__esModule", { value: !0 });
const Kd = Se, ua = H, sn = T, da = Nr, Hd = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && da.default.code(new Kd.KeywordCxt(a, da.default, "additionalProperties"));
    const o = (0, ua.allSchemaProperties)(r);
    for (const f of o)
      a.definedProperties.add(f);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = sn.mergeEvaluated.props(t, (0, sn.toHash)(o), a.props));
    const l = o.filter((f) => !(0, sn.alwaysValidSchema)(a, r[f]));
    if (l.length === 0)
      return;
    const i = t.name("valid");
    for (const f of l)
      d(f) ? c(f) : (t.if((0, ua.propertyInData)(t, s, f, a.opts.ownProperties)), c(f), a.allErrors || t.else().var(i, !0), t.endIf()), e.it.definedProperties.add(f), e.ok(i);
    function d(f) {
      return a.opts.useDefaults && !a.compositeRule && r[f].default !== void 0;
    }
    function c(f) {
      e.subschema({
        keyword: "properties",
        schemaProp: f,
        dataProp: f
      }, i);
    }
  }
};
cs.default = Hd;
var ls = {};
Object.defineProperty(ls, "__esModule", { value: !0 });
const fa = H, Zt = U, ha = T, ma = T, Xd = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, fa.allSchemaProperties)(r), i = l.filter((y) => (0, ha.alwaysValidSchema)(a, r[y]));
    if (l.length === 0 || i.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, c = t.name("valid");
    a.props !== !0 && !(a.props instanceof Zt.Name) && (a.props = (0, ma.evaluatedPropsToName)(t, a.props));
    const { props: f } = a;
    _();
    function _() {
      for (const y of l)
        d && $(y), a.allErrors ? E(y) : (t.var(c, !0), E(y), t.if(c));
    }
    function $(y) {
      for (const v in d)
        new RegExp(y).test(v) && (0, ha.checkStrictMode)(a, `property ${v} matches pattern ${y} (use allowMatchingProperties)`);
    }
    function E(y) {
      t.forIn("key", n, (v) => {
        t.if((0, Zt._)`${(0, fa.usePattern)(e, y)}.test(${v})`, () => {
          const m = i.includes(y);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: y,
            dataProp: v,
            dataPropType: ma.Type.Str
          }, c), a.opts.unevaluated && f !== !0 ? t.assign((0, Zt._)`${f}[${v}]`, !0) : !m && !a.allErrors && t.if((0, Zt.not)(c), () => t.break());
        });
      });
    }
  }
};
ls.default = Xd;
var us = {};
Object.defineProperty(us, "__esModule", { value: !0 });
const Bd = T, Wd = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Bd.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
us.default = Wd;
var ds = {};
Object.defineProperty(ds, "__esModule", { value: !0 });
const xd = H, Jd = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: xd.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
ds.default = Jd;
var fs = {};
Object.defineProperty(fs, "__esModule", { value: !0 });
const ur = U, Yd = T, Qd = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, ur._)`{passingSchemas: ${e.passing}}`
}, Zd = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Qd,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), i = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((c, f) => {
        let _;
        (0, Yd.alwaysValidSchema)(s, c) ? t.var(i, !0) : _ = e.subschema({
          keyword: "oneOf",
          schemaProp: f,
          compositeRule: !0
        }, i), f > 0 && t.if((0, ur._)`${i} && ${o}`).assign(o, !1).assign(l, (0, ur._)`[${l}, ${f}]`).else(), t.if(i, () => {
          t.assign(o, !0), t.assign(l, f), _ && e.mergeEvaluated(_, ur.Name);
        });
      });
    }
  }
};
fs.default = Zd;
var hs = {};
Object.defineProperty(hs, "__esModule", { value: !0 });
const ef = T, tf = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, ef.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
hs.default = tf;
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
const yr = U, ti = T, rf = {
  message: ({ params: e }) => (0, yr.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, yr._)`{failingKeyword: ${e.ifClause}}`
}, nf = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: rf,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, ti.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = pa(n, "then"), a = pa(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (i(), e.reset(), s && a) {
      const c = t.let("ifClause");
      e.setParams({ ifClause: c }), t.if(l, d("then", c), d("else", c));
    } else s ? t.if(l, d("then")) : t.if((0, yr.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function i() {
      const c = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(c);
    }
    function d(c, f) {
      return () => {
        const _ = e.subschema({ keyword: c }, l);
        t.assign(o, l), e.mergeValidEvaluated(_, o), f ? t.assign(f, (0, yr._)`${c}`) : e.setParams({ ifClause: c });
      };
    }
  }
};
function pa(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, ti.alwaysValidSchema)(e, r);
}
ms.default = nf;
var ps = {};
Object.defineProperty(ps, "__esModule", { value: !0 });
const sf = T, af = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, sf.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
ps.default = af;
Object.defineProperty(Rr, "__esModule", { value: !0 });
const of = St, cf = ss, lf = bt, uf = as, df = os, ff = Ir, hf = is, mf = Nr, pf = cs, $f = ls, yf = us, gf = ds, vf = fs, _f = hs, Ef = ms, wf = ps;
function Sf(e = !1) {
  const t = [
    // any
    yf.default,
    gf.default,
    vf.default,
    _f.default,
    Ef.default,
    wf.default,
    // object
    hf.default,
    mf.default,
    ff.default,
    pf.default,
    $f.default
  ];
  return e ? t.push(cf.default, uf.default) : t.push(of.default, lf.default), t.push(df.default), t;
}
Rr.default = Sf;
var $s = {}, Pt = {};
Object.defineProperty(Pt, "__esModule", { value: !0 });
Pt.dynamicAnchor = void 0;
const an = U, bf = _e, $a = me, Pf = qe, Rf = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => ri(e, e.schema)
};
function ri(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, an._)`${bf.default.dynamicAnchors}${(0, an.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : If(e);
  r.if((0, an._)`!${s}`, () => r.assign(s, a));
}
Pt.dynamicAnchor = ri;
function If(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: i } = n.opts, d = new $a.SchemaEnv({ schema: r, schemaId: i, root: s, baseId: a, localRefs: o, meta: l });
  return $a.compileSchema.call(n, d), (0, Pf.getValidate)(e, d);
}
Pt.default = Rf;
var Rt = {};
Object.defineProperty(Rt, "__esModule", { value: !0 });
Rt.dynamicRef = void 0;
const ya = U, Nf = _e, ga = qe, Of = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => ni(e, e.schema)
};
function ni(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const i = r.let("valid", !1);
    o(i), e.ok(i);
  }
  function o(i) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, ya._)`${Nf.default.dynamicAnchors}${(0, ya.getProperty)(a)}`);
      r.if(d, l(d, i), l(s.validateName, i));
    } else
      l(s.validateName, i)();
  }
  function l(i, d) {
    return d ? () => r.block(() => {
      (0, ga.callRef)(e, i), r.let(d, !0);
    }) : () => (0, ga.callRef)(e, i);
  }
}
Rt.dynamicRef = ni;
Rt.default = Of;
var ys = {};
Object.defineProperty(ys, "__esModule", { value: !0 });
const Tf = Pt, jf = T, Af = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Tf.dynamicAnchor)(e, "") : (0, jf.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
ys.default = Af;
var gs = {};
Object.defineProperty(gs, "__esModule", { value: !0 });
const kf = Rt, Cf = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, kf.dynamicRef)(e, e.schema)
};
gs.default = Cf;
Object.defineProperty($s, "__esModule", { value: !0 });
const Df = Pt, Lf = Rt, Mf = ys, Vf = gs, Ff = [Df.default, Lf.default, Mf.default, Vf.default];
$s.default = Ff;
var vs = {}, _s = {};
Object.defineProperty(_s, "__esModule", { value: !0 });
const va = Ir, zf = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: va.error,
  code: (e) => (0, va.validatePropertyDeps)(e)
};
_s.default = zf;
var Es = {};
Object.defineProperty(Es, "__esModule", { value: !0 });
const Uf = Ir, qf = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, Uf.validateSchemaDeps)(e)
};
Es.default = qf;
var ws = {};
Object.defineProperty(ws, "__esModule", { value: !0 });
const Gf = T, Kf = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, Gf.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
ws.default = Kf;
Object.defineProperty(vs, "__esModule", { value: !0 });
const Hf = _s, Xf = Es, Bf = ws, Wf = [Hf.default, Xf.default, Bf.default];
vs.default = Wf;
var Ss = {}, bs = {};
Object.defineProperty(bs, "__esModule", { value: !0 });
const xe = U, _a = T, xf = _e, Jf = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, xe._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Yf = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Jf,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: l } = a;
    l instanceof xe.Name ? t.if((0, xe._)`${l} !== true`, () => t.forIn("key", n, (f) => t.if(d(l, f), () => i(f)))) : l !== !0 && t.forIn("key", n, (f) => l === void 0 ? i(f) : t.if(c(l, f), () => i(f))), a.props = !0, e.ok((0, xe._)`${s} === ${xf.default.errors}`);
    function i(f) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: f }), e.error(), o || t.break();
        return;
      }
      if (!(0, _a.alwaysValidSchema)(a, r)) {
        const _ = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: f,
          dataPropType: _a.Type.Str
        }, _), o || t.if((0, xe.not)(_), () => t.break());
      }
    }
    function d(f, _) {
      return (0, xe._)`!${f} || !${f}[${_}]`;
    }
    function c(f, _) {
      const $ = [];
      for (const E in f)
        f[E] === !0 && $.push((0, xe._)`${_} !== ${E}`);
      return (0, xe.and)(...$);
    }
  }
};
bs.default = Yf;
var Ps = {};
Object.defineProperty(Ps, "__esModule", { value: !0 });
const st = U, Ea = T, Qf = {
  message: ({ params: { len: e } }) => (0, st.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, st._)`{limit: ${e}}`
}, Zf = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Qf,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, st._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, st._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Ea.alwaysValidSchema)(s, r)) {
      const i = t.var("valid", (0, st._)`${o} <= ${a}`);
      t.if((0, st.not)(i), () => l(i, a)), e.ok(i);
    }
    s.items = !0;
    function l(i, d) {
      t.forRange("i", d, o, (c) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: c, dataPropType: Ea.Type.Num }, i), s.allErrors || t.if((0, st.not)(i), () => t.break());
      });
    }
  }
};
Ps.default = Zf;
Object.defineProperty(Ss, "__esModule", { value: !0 });
const eh = bs, th = Ps, rh = [eh.default, th.default];
Ss.default = rh;
var Or = {}, Rs = {};
Object.defineProperty(Rs, "__esModule", { value: !0 });
const re = U, nh = {
  message: ({ schemaCode: e }) => (0, re.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, re._)`{format: ${e}}`
}, sh = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: nh,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: i, errSchemaPath: d, schemaEnv: c, self: f } = l;
    if (!i.validateFormats)
      return;
    s ? _() : $();
    function _() {
      const E = r.scopeValue("formats", {
        ref: f.formats,
        code: i.code.formats
      }), y = r.const("fDef", (0, re._)`${E}[${o}]`), v = r.let("fType"), m = r.let("format");
      r.if((0, re._)`typeof ${y} == "object" && !(${y} instanceof RegExp)`, () => r.assign(v, (0, re._)`${y}.type || "string"`).assign(m, (0, re._)`${y}.validate`), () => r.assign(v, (0, re._)`"string"`).assign(m, y)), e.fail$data((0, re.or)(w(), R()));
      function w() {
        return i.strictSchema === !1 ? re.nil : (0, re._)`${o} && !${m}`;
      }
      function R() {
        const O = c.$async ? (0, re._)`(${y}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, re._)`${m}(${n})`, j = (0, re._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, re._)`${m} && ${m} !== true && ${v} === ${t} && !${j}`;
      }
    }
    function $() {
      const E = f.formats[a];
      if (!E) {
        w();
        return;
      }
      if (E === !0)
        return;
      const [y, v, m] = R(E);
      y === t && e.pass(O());
      function w() {
        if (i.strictSchema === !1) {
          f.logger.warn(j());
          return;
        }
        throw new Error(j());
        function j() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function R(j) {
        const B = j instanceof RegExp ? (0, re.regexpCode)(j) : i.code.formats ? (0, re._)`${i.code.formats}${(0, re.getProperty)(a)}` : void 0, te = r.scopeValue("formats", { key: a, ref: j, code: B });
        return typeof j == "object" && !(j instanceof RegExp) ? [j.type || "string", j.validate, (0, re._)`${te}.validate`] : ["string", j, te];
      }
      function O() {
        if (typeof E == "object" && !(E instanceof RegExp) && E.async) {
          if (!c.$async)
            throw new Error("async format in sync schema");
          return (0, re._)`await ${m}(${n})`;
        }
        return typeof v == "function" ? (0, re._)`${m}(${n})` : (0, re._)`${m}.test(${n})`;
      }
    }
  }
};
Rs.default = sh;
Object.defineProperty(Or, "__esModule", { value: !0 });
const ah = Rs, oh = [ah.default];
Or.default = oh;
var ct = {};
Object.defineProperty(ct, "__esModule", { value: !0 });
ct.contentVocabulary = ct.metadataVocabulary = void 0;
ct.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
ct.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Hn, "__esModule", { value: !0 });
const ih = br, ch = Pr, lh = Rr, uh = $s, dh = vs, fh = Ss, hh = Or, wa = ct, mh = [
  uh.default,
  ih.default,
  ch.default,
  (0, lh.default)(!0),
  hh.default,
  wa.metadataVocabulary,
  wa.contentVocabulary,
  dh.default,
  fh.default
];
Hn.default = mh;
var Tr = {}, jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.DiscrError = void 0;
var Sa;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Sa || (jr.DiscrError = Sa = {}));
Object.defineProperty(Tr, "__esModule", { value: !0 });
const yt = U, En = jr, ba = me, ph = lt, $h = T, yh = {
  message: ({ params: { discrError: e, tagName: t } }) => e === En.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, yt._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, gh = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: yh,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const l = n.propertyName;
    if (typeof l != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const i = t.let("valid", !1), d = t.const("tag", (0, yt._)`${r}${(0, yt.getProperty)(l)}`);
    t.if((0, yt._)`typeof ${d} == "string"`, () => c(), () => e.error(!1, { discrError: En.DiscrError.Tag, tag: d, tagName: l })), e.ok(i);
    function c() {
      const $ = _();
      t.if(!1);
      for (const E in $)
        t.elseIf((0, yt._)`${d} === ${E}`), t.assign(i, f($[E]));
      t.else(), e.error(!1, { discrError: En.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function f($) {
      const E = t.name("valid"), y = e.subschema({ keyword: "oneOf", schemaProp: $ }, E);
      return e.mergeEvaluated(y, yt.Name), E;
    }
    function _() {
      var $;
      const E = {}, y = m(s);
      let v = !0;
      for (let O = 0; O < o.length; O++) {
        let j = o[O];
        if (j != null && j.$ref && !(0, $h.schemaHasRulesButRef)(j, a.self.RULES)) {
          const te = j.$ref;
          if (j = ba.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, te), j instanceof ba.SchemaEnv && (j = j.schema), j === void 0)
            throw new ph.default(a.opts.uriResolver, a.baseId, te);
        }
        const B = ($ = j == null ? void 0 : j.properties) === null || $ === void 0 ? void 0 : $[l];
        if (typeof B != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        v = v && (y || m(j)), w(B, O);
      }
      if (!v)
        throw new Error(`discriminator: "${l}" must be required`);
      return E;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(l);
      }
      function w(O, j) {
        if (O.const)
          R(O.const, j);
        else if (O.enum)
          for (const B of O.enum)
            R(B, j);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function R(O, j) {
        if (typeof O != "string" || O in E)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        E[O] = j;
      }
    }
  }
};
Tr.default = gh;
var Is = {};
const vh = "https://json-schema.org/draft/2020-12/schema", _h = "https://json-schema.org/draft/2020-12/schema", Eh = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, wh = "meta", Sh = "Core and Validation specifications meta-schema", bh = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], Ph = [
  "object",
  "boolean"
], Rh = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Ih = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, Nh = {
  $schema: vh,
  $id: _h,
  $vocabulary: Eh,
  $dynamicAnchor: wh,
  title: Sh,
  allOf: bh,
  type: Ph,
  $comment: Rh,
  properties: Ih
}, Oh = "https://json-schema.org/draft/2020-12/schema", Th = "https://json-schema.org/draft/2020-12/meta/applicator", jh = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, Ah = "meta", kh = "Applicator vocabulary meta-schema", Ch = [
  "object",
  "boolean"
], Dh = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Lh = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, Mh = {
  $schema: Oh,
  $id: Th,
  $vocabulary: jh,
  $dynamicAnchor: Ah,
  title: kh,
  type: Ch,
  properties: Dh,
  $defs: Lh
}, Vh = "https://json-schema.org/draft/2020-12/schema", Fh = "https://json-schema.org/draft/2020-12/meta/unevaluated", zh = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, Uh = "meta", qh = "Unevaluated applicator vocabulary meta-schema", Gh = [
  "object",
  "boolean"
], Kh = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, Hh = {
  $schema: Vh,
  $id: Fh,
  $vocabulary: zh,
  $dynamicAnchor: Uh,
  title: qh,
  type: Gh,
  properties: Kh
}, Xh = "https://json-schema.org/draft/2020-12/schema", Bh = "https://json-schema.org/draft/2020-12/meta/content", Wh = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, xh = "meta", Jh = "Content vocabulary meta-schema", Yh = [
  "object",
  "boolean"
], Qh = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Zh = {
  $schema: Xh,
  $id: Bh,
  $vocabulary: Wh,
  $dynamicAnchor: xh,
  title: Jh,
  type: Yh,
  properties: Qh
}, em = "https://json-schema.org/draft/2020-12/schema", tm = "https://json-schema.org/draft/2020-12/meta/core", rm = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, nm = "meta", sm = "Core vocabulary meta-schema", am = [
  "object",
  "boolean"
], om = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, im = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, cm = {
  $schema: em,
  $id: tm,
  $vocabulary: rm,
  $dynamicAnchor: nm,
  title: sm,
  type: am,
  properties: om,
  $defs: im
}, lm = "https://json-schema.org/draft/2020-12/schema", um = "https://json-schema.org/draft/2020-12/meta/format-annotation", dm = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, fm = "meta", hm = "Format vocabulary meta-schema for annotation results", mm = [
  "object",
  "boolean"
], pm = {
  format: {
    type: "string"
  }
}, $m = {
  $schema: lm,
  $id: um,
  $vocabulary: dm,
  $dynamicAnchor: fm,
  title: hm,
  type: mm,
  properties: pm
}, ym = "https://json-schema.org/draft/2020-12/schema", gm = "https://json-schema.org/draft/2020-12/meta/meta-data", vm = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, _m = "meta", Em = "Meta-data vocabulary meta-schema", wm = [
  "object",
  "boolean"
], Sm = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, bm = {
  $schema: ym,
  $id: gm,
  $vocabulary: vm,
  $dynamicAnchor: _m,
  title: Em,
  type: wm,
  properties: Sm
}, Pm = "https://json-schema.org/draft/2020-12/schema", Rm = "https://json-schema.org/draft/2020-12/meta/validation", Im = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Nm = "meta", Om = "Validation vocabulary meta-schema", Tm = [
  "object",
  "boolean"
], jm = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, Am = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, km = {
  $schema: Pm,
  $id: Rm,
  $vocabulary: Im,
  $dynamicAnchor: Nm,
  title: Om,
  type: Tm,
  properties: jm,
  $defs: Am
};
Object.defineProperty(Is, "__esModule", { value: !0 });
const Cm = Nh, Dm = Mh, Lm = Hh, Mm = Zh, Vm = cm, Fm = $m, zm = bm, Um = km, qm = ["/properties"];
function Gm(e) {
  return [
    Cm,
    Dm,
    Lm,
    Mm,
    Vm,
    t(this, Fm),
    zm,
    t(this, Um)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, qm) : n;
  }
}
Is.default = Gm;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Tn, n = Hn, s = Tr, a = Is, o = "https://json-schema.org/draft/2020-12/schema";
  class l extends r.default {
    constructor($ = {}) {
      super({
        ...$,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach(($) => this.addVocabulary($)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: $, meta: E } = this.opts;
      E && (a.default.call(this, $), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = l, e.exports = t = l, e.exports.Ajv2020 = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var i = Se;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return i.KeywordCxt;
  } });
  var d = U;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var c = wt;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return c.default;
  } });
  var f = lt;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return f.default;
  } });
})(mn, mn.exports);
var Km = mn.exports, wn = { exports: {} }, si = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(F, q) {
    return { validate: F, compare: q };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(i(!0), d),
    "date-time": t(_(!0), $),
    "iso-time": t(i(), c),
    "iso-date-time": t(_(), E),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: be,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: R,
    // signed 32 bit integer
    int32: { type: "number", validate: B },
    // signed 64 bit integer
    int64: { type: "number", validate: te },
    // C-type float
    float: { type: "number", validate: $e },
    // C-type double
    double: { type: "number", validate: $e },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, $),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, E),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(F) {
    return F % 4 === 0 && (F % 100 !== 0 || F % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(F) {
    const q = n.exec(F);
    if (!q)
      return !1;
    const Y = +q[1], I = +q[2], N = +q[3];
    return I >= 1 && I <= 12 && N >= 1 && N <= (I === 2 && r(Y) ? 29 : s[I]);
  }
  function o(F, q) {
    if (F && q)
      return F > q ? 1 : F < q ? -1 : 0;
  }
  const l = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function i(F) {
    return function(Y) {
      const I = l.exec(Y);
      if (!I)
        return !1;
      const N = +I[1], C = +I[2], A = +I[3], V = I[4], k = I[5] === "-" ? -1 : 1, P = +(I[6] || 0), p = +(I[7] || 0);
      if (P > 23 || p > 59 || F && !V)
        return !1;
      if (N <= 23 && C <= 59 && A < 60)
        return !0;
      const S = C - p * k, g = N - P * k - (S < 0 ? 1 : 0);
      return (g === 23 || g === -1) && (S === 59 || S === -1) && A < 61;
    };
  }
  function d(F, q) {
    if (!(F && q))
      return;
    const Y = (/* @__PURE__ */ new Date("2020-01-01T" + F)).valueOf(), I = (/* @__PURE__ */ new Date("2020-01-01T" + q)).valueOf();
    if (Y && I)
      return Y - I;
  }
  function c(F, q) {
    if (!(F && q))
      return;
    const Y = l.exec(F), I = l.exec(q);
    if (Y && I)
      return F = Y[1] + Y[2] + Y[3], q = I[1] + I[2] + I[3], F > q ? 1 : F < q ? -1 : 0;
  }
  const f = /t|\s/i;
  function _(F) {
    const q = i(F);
    return function(I) {
      const N = I.split(f);
      return N.length === 2 && a(N[0]) && q(N[1]);
    };
  }
  function $(F, q) {
    if (!(F && q))
      return;
    const Y = new Date(F).valueOf(), I = new Date(q).valueOf();
    if (Y && I)
      return Y - I;
  }
  function E(F, q) {
    if (!(F && q))
      return;
    const [Y, I] = F.split(f), [N, C] = q.split(f), A = o(Y, N);
    if (A !== void 0)
      return A || d(I, C);
  }
  const y = /\/|:/, v = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(F) {
    return y.test(F) && v.test(F);
  }
  const w = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function R(F) {
    return w.lastIndex = 0, w.test(F);
  }
  const O = -2147483648, j = 2 ** 31 - 1;
  function B(F) {
    return Number.isInteger(F) && F <= j && F >= O;
  }
  function te(F) {
    return Number.isInteger(F);
  }
  function $e() {
    return !0;
  }
  const Ee = /[^\\]\\Z/;
  function be(F) {
    if (Ee.test(F))
      return !1;
    try {
      return new RegExp(F), !0;
    } catch {
      return !1;
    }
  }
})(si);
var ai = {}, Sn = { exports: {} }, Ns = {};
Object.defineProperty(Ns, "__esModule", { value: !0 });
const Hm = br, Xm = Pr, Bm = Rr, Wm = Or, Pa = ct, xm = [
  Hm.default,
  Xm.default,
  (0, Bm.default)(),
  Wm.default,
  Pa.metadataVocabulary,
  Pa.contentVocabulary
];
Ns.default = xm;
const Jm = "http://json-schema.org/draft-07/schema#", Ym = "http://json-schema.org/draft-07/schema#", Qm = "Core schema meta-schema", Zm = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, ep = [
  "object",
  "boolean"
], tp = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, rp = {
  $schema: Jm,
  $id: Ym,
  title: Qm,
  definitions: Zm,
  type: ep,
  properties: tp,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = Tn, n = Ns, s = Tr, a = rp, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
  class i extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((E) => this.addVocabulary(E)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const E = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(E, l, !1), this.refs["http://json-schema.org/schema"] = l;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
    }
  }
  t.Ajv = i, e.exports = t = i, e.exports.Ajv = i, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = i;
  var d = Se;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var c = U;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return c._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return c.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return c.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return c.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return c.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return c.CodeGen;
  } });
  var f = wt;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return f.default;
  } });
  var _ = lt;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return _.default;
  } });
})(Sn, Sn.exports);
var np = Sn.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = np, r = U, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: l, schemaCode: i }) => (0, r.str)`should be ${s[l].okStr} ${i}`,
    params: ({ keyword: l, schemaCode: i }) => (0, r._)`{comparison: ${s[l].okStr}, limit: ${i}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(l) {
      const { gen: i, data: d, schemaCode: c, keyword: f, it: _ } = l, { opts: $, self: E } = _;
      if (!$.validateFormats)
        return;
      const y = new t.KeywordCxt(_, E.RULES.all.format.definition, "format");
      y.$data ? v() : m();
      function v() {
        const R = i.scopeValue("formats", {
          ref: E.formats,
          code: $.code.formats
        }), O = i.const("fmt", (0, r._)`${R}[${y.schemaCode}]`);
        l.fail$data((0, r.or)((0, r._)`typeof ${O} != "object"`, (0, r._)`${O} instanceof RegExp`, (0, r._)`typeof ${O}.compare != "function"`, w(O)));
      }
      function m() {
        const R = y.schema, O = E.formats[R];
        if (!O || O === !0)
          return;
        if (typeof O != "object" || O instanceof RegExp || typeof O.compare != "function")
          throw new Error(`"${f}": format "${R}" does not define "compare" function`);
        const j = i.scopeValue("formats", {
          key: R,
          ref: O,
          code: $.code.formats ? (0, r._)`${$.code.formats}${(0, r.getProperty)(R)}` : void 0
        });
        l.fail$data(w(j));
      }
      function w(R) {
        return (0, r._)`${R}.compare(${d}, ${c}) ${s[f].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (l) => (l.addKeyword(e.formatLimitDefinition), l);
  e.default = o;
})(ai);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = si, n = ai, s = U, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, c = { keywords: !0 }) => {
    if (Array.isArray(c))
      return i(d, c, r.fullFormats, a), d;
    const [f, _] = c.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], $ = c.formats || r.formatNames;
    return i(d, $, f, _), c.keywords && (0, n.default)(d), d;
  };
  l.get = (d, c = "full") => {
    const _ = (c === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!_)
      throw new Error(`Unknown format "${d}"`);
    return _;
  };
  function i(d, c, f, _) {
    var $, E;
    ($ = (E = d.opts.code).formats) !== null && $ !== void 0 || (E.formats = (0, s._)`require("ajv-formats/dist/formats").${_}`);
    for (const y of c)
      d.addFormat(y, f[y]);
  }
  e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
})(wn, wn.exports);
var sp = wn.exports;
const ap = /* @__PURE__ */ oo(sp), op = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !ip(s, a) && n || Object.defineProperty(e, r, a);
}, ip = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, cp = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, lp = (e, t) => `/* Wrapped ${e}*/
${t}`, up = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), dp = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), fp = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = lp.bind(null, n, t.toString());
  Object.defineProperty(s, "name", dp);
  const { writable: a, enumerable: o, configurable: l } = up;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function hp(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    op(e, t, s, r);
  return cp(e, t), fp(e, t, n), e;
}
const Ra = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, l, i;
  const d = function(...c) {
    const f = this, _ = () => {
      o = void 0, l && (clearTimeout(l), l = void 0), a && (i = e.apply(f, c));
    }, $ = () => {
      l = void 0, o && (clearTimeout(o), o = void 0), a && (i = e.apply(f, c));
    }, E = s && !o;
    return clearTimeout(o), o = setTimeout(_, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout($, n)), E && (i = e.apply(f, c)), i;
  };
  return hp(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var bn = { exports: {} };
const mp = "2.0.0", oi = 256, pp = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, $p = 16, yp = oi - 6, gp = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var Ar = {
  MAX_LENGTH: oi,
  MAX_SAFE_COMPONENT_LENGTH: $p,
  MAX_SAFE_BUILD_LENGTH: yp,
  MAX_SAFE_INTEGER: pp,
  RELEASE_TYPES: gp,
  SEMVER_SPEC_VERSION: mp,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const vp = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var kr = vp;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = Ar, a = kr;
  t = e.exports = {};
  const o = t.re = [], l = t.safeRe = [], i = t.src = [], d = t.safeSrc = [], c = t.t = {};
  let f = 0;
  const _ = "[a-zA-Z0-9-]", $ = [
    ["\\s", 1],
    ["\\d", s],
    [_, n]
  ], E = (v) => {
    for (const [m, w] of $)
      v = v.split(`${m}*`).join(`${m}{0,${w}}`).split(`${m}+`).join(`${m}{1,${w}}`);
    return v;
  }, y = (v, m, w) => {
    const R = E(m), O = f++;
    a(v, O, m), c[v] = O, i[O] = m, d[O] = R, o[O] = new RegExp(m, w ? "g" : void 0), l[O] = new RegExp(R, w ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${_}*`), y("MAINVERSION", `(${i[c.NUMERICIDENTIFIER]})\\.(${i[c.NUMERICIDENTIFIER]})\\.(${i[c.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${i[c.NUMERICIDENTIFIERLOOSE]})\\.(${i[c.NUMERICIDENTIFIERLOOSE]})\\.(${i[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${i[c.NUMERICIDENTIFIER]}|${i[c.NONNUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${i[c.NUMERICIDENTIFIERLOOSE]}|${i[c.NONNUMERICIDENTIFIER]})`), y("PRERELEASE", `(?:-(${i[c.PRERELEASEIDENTIFIER]}(?:\\.${i[c.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${i[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${i[c.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${_}+`), y("BUILD", `(?:\\+(${i[c.BUILDIDENTIFIER]}(?:\\.${i[c.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${i[c.MAINVERSION]}${i[c.PRERELEASE]}?${i[c.BUILD]}?`), y("FULL", `^${i[c.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${i[c.MAINVERSIONLOOSE]}${i[c.PRERELEASELOOSE]}?${i[c.BUILD]}?`), y("LOOSE", `^${i[c.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${i[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${i[c.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${i[c.XRANGEIDENTIFIER]})(?:\\.(${i[c.XRANGEIDENTIFIER]})(?:\\.(${i[c.XRANGEIDENTIFIER]})(?:${i[c.PRERELEASE]})?${i[c.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${i[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[c.XRANGEIDENTIFIERLOOSE]})(?:${i[c.PRERELEASELOOSE]})?${i[c.BUILD]}?)?)?`), y("XRANGE", `^${i[c.GTLT]}\\s*${i[c.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${i[c.GTLT]}\\s*${i[c.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${i[c.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", i[c.COERCEPLAIN] + `(?:${i[c.PRERELEASE]})?(?:${i[c.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", i[c.COERCE], !0), y("COERCERTLFULL", i[c.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${i[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${i[c.LONETILDE]}${i[c.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${i[c.LONETILDE]}${i[c.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${i[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${i[c.LONECARET]}${i[c.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${i[c.LONECARET]}${i[c.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${i[c.GTLT]}\\s*(${i[c.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${i[c.GTLT]}\\s*(${i[c.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${i[c.GTLT]}\\s*(${i[c.LOOSEPLAIN]}|${i[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${i[c.XRANGEPLAIN]})\\s+-\\s+(${i[c.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${i[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${i[c.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(bn, bn.exports);
var Bt = bn.exports;
const _p = Object.freeze({ loose: !0 }), Ep = Object.freeze({}), wp = (e) => e ? typeof e != "object" ? _p : e : Ep;
var Os = wp;
const Ia = /^[0-9]+$/, ii = (e, t) => {
  const r = Ia.test(e), n = Ia.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, Sp = (e, t) => ii(t, e);
var ci = {
  compareIdentifiers: ii,
  rcompareIdentifiers: Sp
};
const er = kr, { MAX_LENGTH: Na, MAX_SAFE_INTEGER: tr } = Ar, { safeRe: Oa, safeSrc: Ta, t: rr } = Bt, bp = Os, { compareIdentifiers: mt } = ci;
let Pp = class je {
  constructor(t, r) {
    if (r = bp(r), t instanceof je) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Na)
      throw new TypeError(
        `version is longer than ${Na} characters`
      );
    er("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? Oa[rr.LOOSE] : Oa[rr.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > tr || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > tr || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > tr || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < tr)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (er("SemVer.compare", this.version, this.options, t), !(t instanceof je)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new je(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof je || (t = new je(t, this.options)), mt(this.major, t.major) || mt(this.minor, t.minor) || mt(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof je || (t = new je(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (er("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return mt(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof je || (t = new je(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (er("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return mt(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = new RegExp(`^${this.options.loose ? Ta[rr.PRERELEASELOOSE] : Ta[rr.PRERELEASE]}$`), a = `-${r}`.match(s);
        if (!a || a[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), mt(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var pe = Pp;
const ja = pe, Rp = (e, t, r = !1) => {
  if (e instanceof ja)
    return e;
  try {
    return new ja(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var It = Rp;
const Ip = It, Np = (e, t) => {
  const r = Ip(e, t);
  return r ? r.version : null;
};
var Op = Np;
const Tp = It, jp = (e, t) => {
  const r = Tp(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Ap = jp;
const Aa = pe, kp = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Aa(
      e instanceof Aa ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var Cp = kp;
const ka = It, Dp = (e, t) => {
  const r = ka(e, null, !0), n = ka(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, l = a ? n : r, i = !!o.prerelease.length;
  if (!!l.prerelease.length && !i) {
    if (!l.patch && !l.minor)
      return "major";
    if (l.compareMain(o) === 0)
      return l.minor && !l.patch ? "minor" : "patch";
  }
  const c = i ? "pre" : "";
  return r.major !== n.major ? c + "major" : r.minor !== n.minor ? c + "minor" : r.patch !== n.patch ? c + "patch" : "prerelease";
};
var Lp = Dp;
const Mp = pe, Vp = (e, t) => new Mp(e, t).major;
var Fp = Vp;
const zp = pe, Up = (e, t) => new zp(e, t).minor;
var qp = Up;
const Gp = pe, Kp = (e, t) => new Gp(e, t).patch;
var Hp = Kp;
const Xp = It, Bp = (e, t) => {
  const r = Xp(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var Wp = Bp;
const Ca = pe, xp = (e, t, r) => new Ca(e, r).compare(new Ca(t, r));
var Oe = xp;
const Jp = Oe, Yp = (e, t, r) => Jp(t, e, r);
var Qp = Yp;
const Zp = Oe, e$ = (e, t) => Zp(e, t, !0);
var t$ = e$;
const Da = pe, r$ = (e, t, r) => {
  const n = new Da(e, r), s = new Da(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Ts = r$;
const n$ = Ts, s$ = (e, t) => e.sort((r, n) => n$(r, n, t));
var a$ = s$;
const o$ = Ts, i$ = (e, t) => e.sort((r, n) => o$(n, r, t));
var c$ = i$;
const l$ = Oe, u$ = (e, t, r) => l$(e, t, r) > 0;
var Cr = u$;
const d$ = Oe, f$ = (e, t, r) => d$(e, t, r) < 0;
var js = f$;
const h$ = Oe, m$ = (e, t, r) => h$(e, t, r) === 0;
var li = m$;
const p$ = Oe, $$ = (e, t, r) => p$(e, t, r) !== 0;
var ui = $$;
const y$ = Oe, g$ = (e, t, r) => y$(e, t, r) >= 0;
var As = g$;
const v$ = Oe, _$ = (e, t, r) => v$(e, t, r) <= 0;
var ks = _$;
const E$ = li, w$ = ui, S$ = Cr, b$ = As, P$ = js, R$ = ks, I$ = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return E$(e, r, n);
    case "!=":
      return w$(e, r, n);
    case ">":
      return S$(e, r, n);
    case ">=":
      return b$(e, r, n);
    case "<":
      return P$(e, r, n);
    case "<=":
      return R$(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var di = I$;
const N$ = pe, O$ = It, { safeRe: nr, t: sr } = Bt, T$ = (e, t) => {
  if (e instanceof N$)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? nr[sr.COERCEFULL] : nr[sr.COERCE]);
  else {
    const i = t.includePrerelease ? nr[sr.COERCERTLFULL] : nr[sr.COERCERTL];
    let d;
    for (; (d = i.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), i.lastIndex = d.index + d[1].length + d[2].length;
    i.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", l = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return O$(`${n}.${s}.${a}${o}${l}`, t);
};
var j$ = T$;
class A$ {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var k$ = A$, on, La;
function Te() {
  if (La) return on;
  La = 1;
  const e = /\s+/g;
  class t {
    constructor(N, C) {
      if (C = s(C), N instanceof t)
        return N.loose === !!C.loose && N.includePrerelease === !!C.includePrerelease ? N : new t(N.raw, C);
      if (N instanceof a)
        return this.raw = N.value, this.set = [[N]], this.formatted = void 0, this;
      if (this.options = C, this.loose = !!C.loose, this.includePrerelease = !!C.includePrerelease, this.raw = N.trim().replace(e, " "), this.set = this.raw.split("||").map((A) => this.parseRange(A.trim())).filter((A) => A.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const A = this.set[0];
        if (this.set = this.set.filter((V) => !y(V[0])), this.set.length === 0)
          this.set = [A];
        else if (this.set.length > 1) {
          for (const V of this.set)
            if (V.length === 1 && v(V[0])) {
              this.set = [V];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let N = 0; N < this.set.length; N++) {
          N > 0 && (this.formatted += "||");
          const C = this.set[N];
          for (let A = 0; A < C.length; A++)
            A > 0 && (this.formatted += " "), this.formatted += C[A].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(N) {
      const A = ((this.options.includePrerelease && $) | (this.options.loose && E)) + ":" + N, V = n.get(A);
      if (V)
        return V;
      const k = this.options.loose, P = k ? i[d.HYPHENRANGELOOSE] : i[d.HYPHENRANGE];
      N = N.replace(P, q(this.options.includePrerelease)), o("hyphen replace", N), N = N.replace(i[d.COMPARATORTRIM], c), o("comparator trim", N), N = N.replace(i[d.TILDETRIM], f), o("tilde trim", N), N = N.replace(i[d.CARETTRIM], _), o("caret trim", N);
      let p = N.split(" ").map((h) => w(h, this.options)).join(" ").split(/\s+/).map((h) => F(h, this.options));
      k && (p = p.filter((h) => (o("loose invalid filter", h, this.options), !!h.match(i[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), g = p.map((h) => new a(h, this.options));
      for (const h of g) {
        if (y(h))
          return [h];
        S.set(h.value, h);
      }
      S.size > 1 && S.has("") && S.delete("");
      const u = [...S.values()];
      return n.set(A, u), u;
    }
    intersects(N, C) {
      if (!(N instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((A) => m(A, C) && N.set.some((V) => m(V, C) && A.every((k) => V.every((P) => k.intersects(P, C)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(N) {
      if (!N)
        return !1;
      if (typeof N == "string")
        try {
          N = new l(N, this.options);
        } catch {
          return !1;
        }
      for (let C = 0; C < this.set.length; C++)
        if (Y(this.set[C], N, this.options))
          return !0;
      return !1;
    }
  }
  on = t;
  const r = k$, n = new r(), s = Os, a = Dr(), o = kr, l = pe, {
    safeRe: i,
    t: d,
    comparatorTrimReplace: c,
    tildeTrimReplace: f,
    caretTrimReplace: _
  } = Bt, { FLAG_INCLUDE_PRERELEASE: $, FLAG_LOOSE: E } = Ar, y = (I) => I.value === "<0.0.0-0", v = (I) => I.value === "", m = (I, N) => {
    let C = !0;
    const A = I.slice();
    let V = A.pop();
    for (; C && A.length; )
      C = A.every((k) => V.intersects(k, N)), V = A.pop();
    return C;
  }, w = (I, N) => (o("comp", I, N), I = B(I, N), o("caret", I), I = O(I, N), o("tildes", I), I = $e(I, N), o("xrange", I), I = be(I, N), o("stars", I), I), R = (I) => !I || I.toLowerCase() === "x" || I === "*", O = (I, N) => I.trim().split(/\s+/).map((C) => j(C, N)).join(" "), j = (I, N) => {
    const C = N.loose ? i[d.TILDELOOSE] : i[d.TILDE];
    return I.replace(C, (A, V, k, P, p) => {
      o("tilde", I, A, V, k, P, p);
      let S;
      return R(V) ? S = "" : R(k) ? S = `>=${V}.0.0 <${+V + 1}.0.0-0` : R(P) ? S = `>=${V}.${k}.0 <${V}.${+k + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${V}.${k}.${P}-${p} <${V}.${+k + 1}.0-0`) : S = `>=${V}.${k}.${P} <${V}.${+k + 1}.0-0`, o("tilde return", S), S;
    });
  }, B = (I, N) => I.trim().split(/\s+/).map((C) => te(C, N)).join(" "), te = (I, N) => {
    o("caret", I, N);
    const C = N.loose ? i[d.CARETLOOSE] : i[d.CARET], A = N.includePrerelease ? "-0" : "";
    return I.replace(C, (V, k, P, p, S) => {
      o("caret", I, V, k, P, p, S);
      let g;
      return R(k) ? g = "" : R(P) ? g = `>=${k}.0.0${A} <${+k + 1}.0.0-0` : R(p) ? k === "0" ? g = `>=${k}.${P}.0${A} <${k}.${+P + 1}.0-0` : g = `>=${k}.${P}.0${A} <${+k + 1}.0.0-0` : S ? (o("replaceCaret pr", S), k === "0" ? P === "0" ? g = `>=${k}.${P}.${p}-${S} <${k}.${P}.${+p + 1}-0` : g = `>=${k}.${P}.${p}-${S} <${k}.${+P + 1}.0-0` : g = `>=${k}.${P}.${p}-${S} <${+k + 1}.0.0-0`) : (o("no pr"), k === "0" ? P === "0" ? g = `>=${k}.${P}.${p}${A} <${k}.${P}.${+p + 1}-0` : g = `>=${k}.${P}.${p}${A} <${k}.${+P + 1}.0-0` : g = `>=${k}.${P}.${p} <${+k + 1}.0.0-0`), o("caret return", g), g;
    });
  }, $e = (I, N) => (o("replaceXRanges", I, N), I.split(/\s+/).map((C) => Ee(C, N)).join(" ")), Ee = (I, N) => {
    I = I.trim();
    const C = N.loose ? i[d.XRANGELOOSE] : i[d.XRANGE];
    return I.replace(C, (A, V, k, P, p, S) => {
      o("xRange", I, A, V, k, P, p, S);
      const g = R(k), u = g || R(P), h = u || R(p), b = h;
      return V === "=" && b && (V = ""), S = N.includePrerelease ? "-0" : "", g ? V === ">" || V === "<" ? A = "<0.0.0-0" : A = "*" : V && b ? (u && (P = 0), p = 0, V === ">" ? (V = ">=", u ? (k = +k + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : V === "<=" && (V = "<", u ? k = +k + 1 : P = +P + 1), V === "<" && (S = "-0"), A = `${V + k}.${P}.${p}${S}`) : u ? A = `>=${k}.0.0${S} <${+k + 1}.0.0-0` : h && (A = `>=${k}.${P}.0${S} <${k}.${+P + 1}.0-0`), o("xRange return", A), A;
    });
  }, be = (I, N) => (o("replaceStars", I, N), I.trim().replace(i[d.STAR], "")), F = (I, N) => (o("replaceGTE0", I, N), I.trim().replace(i[N.includePrerelease ? d.GTE0PRE : d.GTE0], "")), q = (I) => (N, C, A, V, k, P, p, S, g, u, h, b) => (R(A) ? C = "" : R(V) ? C = `>=${A}.0.0${I ? "-0" : ""}` : R(k) ? C = `>=${A}.${V}.0${I ? "-0" : ""}` : P ? C = `>=${C}` : C = `>=${C}${I ? "-0" : ""}`, R(g) ? S = "" : R(u) ? S = `<${+g + 1}.0.0-0` : R(h) ? S = `<${g}.${+u + 1}.0-0` : b ? S = `<=${g}.${u}.${h}-${b}` : I ? S = `<${g}.${u}.${+h + 1}-0` : S = `<=${S}`, `${C} ${S}`.trim()), Y = (I, N, C) => {
    for (let A = 0; A < I.length; A++)
      if (!I[A].test(N))
        return !1;
    if (N.prerelease.length && !C.includePrerelease) {
      for (let A = 0; A < I.length; A++)
        if (o(I[A].semver), I[A].semver !== a.ANY && I[A].semver.prerelease.length > 0) {
          const V = I[A].semver;
          if (V.major === N.major && V.minor === N.minor && V.patch === N.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return on;
}
var cn, Ma;
function Dr() {
  if (Ma) return cn;
  Ma = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, f) {
      if (f = r(f), c instanceof t) {
        if (c.loose === !!f.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), o("comparator", c, f), this.options = f, this.loose = !!f.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(c) {
      const f = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], _ = c.match(f);
      if (!_)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = _[1] !== void 0 ? _[1] : "", this.operator === "=" && (this.operator = ""), _[2] ? this.semver = new l(_[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (o("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new l(c, this.options);
        } catch {
          return !1;
        }
      return a(c, this.operator, this.semver, this.options);
    }
    intersects(c, f) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new i(c.value, f).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new i(this.value, f).test(c.semver) : (f = r(f), f.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || a(this.semver, "<", c.semver, f) && this.operator.startsWith(">") && c.operator.startsWith("<") || a(this.semver, ">", c.semver, f) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  cn = t;
  const r = Os, { safeRe: n, t: s } = Bt, a = di, o = kr, l = pe, i = Te();
  return cn;
}
const C$ = Te(), D$ = (e, t, r) => {
  try {
    t = new C$(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var Lr = D$;
const L$ = Te(), M$ = (e, t) => new L$(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var V$ = M$;
const F$ = pe, z$ = Te(), U$ = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new z$(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new F$(n, r));
  }), n;
};
var q$ = U$;
const G$ = pe, K$ = Te(), H$ = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new K$(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new G$(n, r));
  }), n;
};
var X$ = H$;
const ln = pe, B$ = Te(), Va = Cr, W$ = (e, t) => {
  e = new B$(e, t);
  let r = new ln("0.0.0");
  if (e.test(r) || (r = new ln("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const l = new ln(o.semver.version);
      switch (o.operator) {
        case ">":
          l.prerelease.length === 0 ? l.patch++ : l.prerelease.push(0), l.raw = l.format();
        case "":
        case ">=":
          (!a || Va(l, a)) && (a = l);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Va(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var x$ = W$;
const J$ = Te(), Y$ = (e, t) => {
  try {
    return new J$(e, t).range || "*";
  } catch {
    return null;
  }
};
var Q$ = Y$;
const Z$ = pe, fi = Dr(), { ANY: ey } = fi, ty = Te(), ry = Lr, Fa = Cr, za = js, ny = ks, sy = As, ay = (e, t, r, n) => {
  e = new Z$(e, n), t = new ty(t, n);
  let s, a, o, l, i;
  switch (r) {
    case ">":
      s = Fa, a = ny, o = za, l = ">", i = ">=";
      break;
    case "<":
      s = za, a = sy, o = Fa, l = "<", i = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (ry(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const c = t.set[d];
    let f = null, _ = null;
    if (c.forEach(($) => {
      $.semver === ey && ($ = new fi(">=0.0.0")), f = f || $, _ = _ || $, s($.semver, f.semver, n) ? f = $ : o($.semver, _.semver, n) && (_ = $);
    }), f.operator === l || f.operator === i || (!_.operator || _.operator === l) && a(e, _.semver))
      return !1;
    if (_.operator === i && o(e, _.semver))
      return !1;
  }
  return !0;
};
var Cs = ay;
const oy = Cs, iy = (e, t, r) => oy(e, t, ">", r);
var cy = iy;
const ly = Cs, uy = (e, t, r) => ly(e, t, "<", r);
var dy = uy;
const Ua = Te(), fy = (e, t, r) => (e = new Ua(e, r), t = new Ua(t, r), e.intersects(t, r));
var hy = fy;
const my = Lr, py = Oe;
var $y = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((c, f) => py(c, f, r));
  for (const c of o)
    my(c, t, r) ? (a = c, s || (s = c)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [c, f] of n)
    c === f ? l.push(c) : !f && c === o[0] ? l.push("*") : f ? c === o[0] ? l.push(`<=${f}`) : l.push(`${c} - ${f}`) : l.push(`>=${c}`);
  const i = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return i.length < d.length ? i : t;
};
const qa = Te(), Ds = Dr(), { ANY: un } = Ds, Ct = Lr, Ls = Oe, yy = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new qa(e, r), t = new qa(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = vy(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, gy = [new Ds(">=0.0.0-0")], Ga = [new Ds(">=0.0.0")], vy = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === un) {
    if (t.length === 1 && t[0].semver === un)
      return !0;
    r.includePrerelease ? e = gy : e = Ga;
  }
  if (t.length === 1 && t[0].semver === un) {
    if (r.includePrerelease)
      return !0;
    t = Ga;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const $ of e)
    $.operator === ">" || $.operator === ">=" ? s = Ka(s, $, r) : $.operator === "<" || $.operator === "<=" ? a = Ha(a, $, r) : n.add($.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = Ls(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const $ of n) {
    if (s && !Ct($, String(s), r) || a && !Ct($, String(a), r))
      return null;
    for (const E of t)
      if (!Ct($, String(E), r))
        return !1;
    return !0;
  }
  let l, i, d, c, f = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, _ = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  f && f.prerelease.length === 1 && a.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const $ of t) {
    if (c = c || $.operator === ">" || $.operator === ">=", d = d || $.operator === "<" || $.operator === "<=", s) {
      if (_ && $.semver.prerelease && $.semver.prerelease.length && $.semver.major === _.major && $.semver.minor === _.minor && $.semver.patch === _.patch && (_ = !1), $.operator === ">" || $.operator === ">=") {
        if (l = Ka(s, $, r), l === $ && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Ct(s.semver, String($), r))
        return !1;
    }
    if (a) {
      if (f && $.semver.prerelease && $.semver.prerelease.length && $.semver.major === f.major && $.semver.minor === f.minor && $.semver.patch === f.patch && (f = !1), $.operator === "<" || $.operator === "<=") {
        if (i = Ha(a, $, r), i === $ && i !== a)
          return !1;
      } else if (a.operator === "<=" && !Ct(a.semver, String($), r))
        return !1;
    }
    if (!$.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && c && !s && o !== 0 || _ || f);
}, Ka = (e, t, r) => {
  if (!e)
    return t;
  const n = Ls(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Ha = (e, t, r) => {
  if (!e)
    return t;
  const n = Ls(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var _y = yy;
const dn = Bt, Xa = Ar, Ey = pe, Ba = ci, wy = It, Sy = Op, by = Ap, Py = Cp, Ry = Lp, Iy = Fp, Ny = qp, Oy = Hp, Ty = Wp, jy = Oe, Ay = Qp, ky = t$, Cy = Ts, Dy = a$, Ly = c$, My = Cr, Vy = js, Fy = li, zy = ui, Uy = As, qy = ks, Gy = di, Ky = j$, Hy = Dr(), Xy = Te(), By = Lr, Wy = V$, xy = q$, Jy = X$, Yy = x$, Qy = Q$, Zy = Cs, e0 = cy, t0 = dy, r0 = hy, n0 = $y, s0 = _y;
var a0 = {
  parse: wy,
  valid: Sy,
  clean: by,
  inc: Py,
  diff: Ry,
  major: Iy,
  minor: Ny,
  patch: Oy,
  prerelease: Ty,
  compare: jy,
  rcompare: Ay,
  compareLoose: ky,
  compareBuild: Cy,
  sort: Dy,
  rsort: Ly,
  gt: My,
  lt: Vy,
  eq: Fy,
  neq: zy,
  gte: Uy,
  lte: qy,
  cmp: Gy,
  coerce: Ky,
  Comparator: Hy,
  Range: Xy,
  satisfies: By,
  toComparators: Wy,
  maxSatisfying: xy,
  minSatisfying: Jy,
  minVersion: Yy,
  validRange: Qy,
  outside: Zy,
  gtr: e0,
  ltr: t0,
  intersects: r0,
  simplifyRange: n0,
  subset: s0,
  SemVer: Ey,
  re: dn.re,
  src: dn.src,
  tokens: dn.t,
  SEMVER_SPEC_VERSION: Xa.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Xa.RELEASE_TYPES,
  compareIdentifiers: Ba.compareIdentifiers,
  rcompareIdentifiers: Ba.rcompareIdentifiers
};
const pt = /* @__PURE__ */ oo(a0), o0 = Object.prototype.toString, i0 = "[object Uint8Array]", c0 = "[object ArrayBuffer]";
function hi(e, t, r) {
  return e ? e.constructor === t ? !0 : o0.call(e) === r : !1;
}
function mi(e) {
  return hi(e, Uint8Array, i0);
}
function l0(e) {
  return hi(e, ArrayBuffer, c0);
}
function u0(e) {
  return mi(e) || l0(e);
}
function d0(e) {
  if (!mi(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function f0(e) {
  if (!u0(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Wa(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    d0(s), r.set(s, n), n += s.length;
  return r;
}
const ar = {
  utf8: new globalThis.TextDecoder("utf8")
};
function xa(e, t = "utf8") {
  return f0(e), ar[t] ?? (ar[t] = new globalThis.TextDecoder(t)), ar[t].decode(e);
}
function h0(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const m0 = new globalThis.TextEncoder();
function fn(e) {
  return h0(e), m0.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const p0 = ap.default, Ja = "aes-256-cbc", $t = () => /* @__PURE__ */ Object.create(null), $0 = (e) => e != null, y0 = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, dr = "__internal__", hn = `${dr}.migrations.version`;
var Ye, Me, ve, Ve;
class g0 {
  constructor(t = {}) {
    dt(this, "path");
    dt(this, "events");
    Ot(this, Ye);
    Ot(this, Me);
    Ot(this, ve);
    Ot(this, Ve, {});
    dt(this, "_deserialize", (t) => JSON.parse(t));
    dt(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Li(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Tt(this, ve, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new Km.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      p0(o);
      const l = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      Tt(this, Ye, o.compile(l));
      for (const [i, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (Z(this, Ve)[i] = d.default);
    }
    r.defaults && Tt(this, Ve, {
      ...Z(this, Ve),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Tt(this, Me, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = x.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign($t(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Ni.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (Z(this, ve).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${dr} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      y0(a, o), Z(this, ve).accessPropertiesByDotNotation ? Gs(n, a, o) : n[a] = o;
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, l] of Object.entries(a))
        s(o, l);
    } else
      s(t, r);
    this.store = n;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(t) {
    return Z(this, ve).accessPropertiesByDotNotation ? Ai(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      $0(Z(this, Ve)[r]) && this.set(r, Z(this, Ve)[r]);
  }
  delete(t) {
    const { store: r } = this;
    Z(this, ve).accessPropertiesByDotNotation ? ji(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = $t();
    for (const t of Object.keys(Z(this, Ve)))
      this.reset(t);
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key to watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.store, t);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const t = K.readFileSync(this.path, Z(this, Me) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign($t(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), $t();
      if (Z(this, ve).clearInvalidConfig && t.name === "SyntaxError")
        return $t();
      throw t;
    }
  }
  set store(t) {
    this._ensureDirectory(), this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      yield [t, r];
  }
  _encryptData(t) {
    if (!Z(this, Me))
      return typeof t == "string" ? t : xa(t);
    try {
      const r = t.slice(0, 16), n = jt.pbkdf2Sync(Z(this, Me), r.toString(), 1e4, 32, "sha512"), s = jt.createDecipheriv(Ja, n, r), a = t.slice(17), o = typeof a == "string" ? fn(a) : a;
      return xa(Wa([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Ii(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!Z(this, Ye) || Z(this, Ye).call(this, t) || !Z(this, Ye).errors)
      return;
    const n = Z(this, Ye).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    K.mkdirSync(x.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (Z(this, Me)) {
      const n = jt.randomBytes(16), s = jt.pbkdf2Sync(Z(this, Me), n.toString(), 1e4, 32, "sha512"), a = jt.createCipheriv(Ja, s, n);
      r = Wa([n, fn(":"), a.update(fn(r)), a.final()]);
    }
    if (ae.env.SNAP)
      K.writeFileSync(this.path, r, { mode: Z(this, ve).configFileMode });
    else
      try {
        ao(this.path, r, { mode: Z(this, ve).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          K.writeFileSync(this.path, r, { mode: Z(this, ve).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), K.existsSync(this.path) || this._write($t()), ae.platform === "win32" ? K.watch(this.path, { persistent: !1 }, Ra(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : K.watchFile(this.path, { persistent: !1 }, Ra(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(hn, "0.0.0");
    const a = Object.keys(t).filter((l) => this._shouldPerformMigration(l, s, r));
    let o = { ...this.store };
    for (const l of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: l,
          finalVersion: r,
          versions: a
        });
        const i = t[l];
        i == null || i(this), this._set(hn, l), s = l, o = { ...this.store };
      } catch (i) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${i}`);
      }
    (this._isVersionInRangeFormat(s) || !pt.eq(s, r)) && this._set(hn, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === dr ? !0 : typeof t != "string" ? !1 : Z(this, ve).accessPropertiesByDotNotation ? !!t.startsWith(`${dr}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return pt.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && pt.satisfies(r, t) ? !1 : pt.satisfies(n, t) : !(pt.lte(t, r) || pt.gt(t, n));
  }
  _get(t, r) {
    return Ti(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    Gs(n, t, r), this.store = n;
  }
}
Ye = new WeakMap(), Me = new WeakMap(), ve = new WeakMap(), Ve = new WeakMap();
const { app: fr, ipcMain: Pn, shell: v0 } = eo;
let Ya = !1;
const Qa = () => {
  if (!Pn || !fr)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: fr.getPath("userData"),
    appVersion: fr.getVersion()
  };
  return Ya || (Pn.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Ya = !0), e;
};
class _0 extends g0 {
  constructor(t) {
    let r, n;
    if (ae.type === "renderer") {
      const s = eo.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else Pn && fr && ({ defaultCwd: r, appVersion: n } = Qa());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = x.isAbsolute(t.cwd) ? t.cwd : x.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Qa();
  }
  async openInEditor() {
    const t = await v0.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
class E0 {
  constructor() {
    dt(this, "items");
    this.items = [];
  }
  enqueue(t) {
    this.items.push(t);
  }
  dequeue() {
    return this.isEmpty() ? "Queue is empty" : this.items.shift();
  }
  front() {
    return this.isEmpty() ? "Queue is empty" : this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
  print() {
    console.log(this.items.join(", "));
  }
}
function Za(e, t) {
  const r = [16, 15, 11, 10, 6, 4, 1, 0, 35, 34, 32, 31, 30, 19, 18, 17], n = [5, 7, 8, 9, 12, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 33];
  let s = {};
  return t ? n.forEach((a, o) => {
    s[`_${a}`] = e.readUInt8(7 + o);
  }) : r.forEach((a, o) => {
    s[`_${a}`] = ["red", "green"][w0(e, a)];
  }), s;
}
function w0(e, t) {
  const r = [16, 15, 11, 10, 6, 4, 1, 0, 35, 34, 32, 31, 30, 19, 18, 17], n = [5, 7, 8, 9, 12, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 33];
  if (r.includes(t)) {
    const s = r.indexOf(t), a = 5 + Math.floor(s / 8), o = 7 - s % 8;
    return e.readUInt8(a) >> o & 1;
  }
  if (n.includes(t)) {
    const s = n.indexOf(t);
    return e.readUInt8(7 + s);
  }
  throw new Error(`Invalid pin number: ${t}`);
}
let S0 = (e) => {
  let t = e.toString("hex").match(/.{1,2}/g).map((r) => r.padStart(2, "0")).join(" ");
  console.log(t);
};
const Ms = bi(import.meta.url), Vs = De.dirname(Pi(import.meta.url));
process.env.APP_ROOT = De.join(Vs, "..");
const Rn = process.env.VITE_DEV_SERVER_URL, G0 = De.join(process.env.APP_ROOT, "dist-electron"), pi = De.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Rn ? De.join(process.env.APP_ROOT, "public") : pi;
const { Tray: b0 } = Ms("electron"), { SerialPort: $i } = Ms("serialport");
let yi = !1, P0 = null, ne, at = null;
const Mr = new _0();
let Ge = {};
function gi() {
  ne = new to({
    backgroundColor: "#191919",
    height: 1080,
    width: 1920,
    minHeight: 400,
    minWidth: 650,
    titleBarStyle: "hidden",
    ...process.platform !== "darwin" ? {
      titleBarOverlay: {
        color: "#181818",
        symbolColor: "#ffffff",
        height: 43
      }
    } : {},
    icon: De.join(process.env.VITE_PUBLIC, "logo.png"),
    webPreferences: {
      preload: De.join(Vs, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), ne.maximize(), ne.removeMenu(), ne.webContents.on("did-finish-load", () => {
    ne == null || ne.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Rn ? ne.loadURL(Rn) : ne.loadFile(De.join(pi, "index.html"));
}
async function vi(e, t) {
  if (!ne)
    return console.error("No window object found!"), !1;
  const r = await ro.showSaveDialog(ne, {
    filters: [{ name: "JSON Files", extensions: ["json"] }]
  });
  if (r.canceled)
    return console.log("Save As canceled"), !1;
  const n = r.filePath;
  return Ge[e] = { path: n, isNew: !1 }, Mr.set("currentFilePaths", Ge), _i(e, t, n);
}
async function _i(e, t, r) {
  var s;
  if (!ne)
    return console.error("No window object found!"), !1;
  const n = r || ((s = Ge[e]) == null ? void 0 : s.path);
  if (!n)
    return vi(e, t);
  try {
    return Ri.writeFileSync(n, JSON.stringify(t)), console.log("File saved successfully!"), ne.webContents.send("file-saved", De.basename(n)), !0;
  } catch (a) {
    return console.error("Error saving file:", a), ro.showErrorBox("Error saving file", a.message), !1;
  }
}
Ne.on("save-file", (e, { fileId: t, fileData: r }) => {
  _i(t, r);
});
Ne.on("save-file-as", (e, { fileId: t, fileData: r }) => {
  vi(t, r);
});
Ne.on("new-file", (e, t) => {
  Ge[t] = { path: null, isNew: !0 }, Mr.set("currentFilePaths", Ge);
});
Ne.on("file-opened", (e, { fileId: t, filePath: r }) => {
  Ge[t] = { path: r, isNew: !1 }, Mr.set("currentFilePaths", Ge);
});
Ne.on("close-file", (e, t) => {
  delete Ge[t], Mr.set("currentFilePaths", Ge);
});
Ne.handle("check_connected", () => yi);
Gt.on("window-all-closed", () => {
  process.platform !== "darwin" && (Gt.quit(), ne = null);
});
Gt.on("ready", () => {
  try {
    P0 = new b0(De.join(Vs, "../public/logo.png"));
  } catch (e) {
    console.error("Failed to create tray icon:", e);
  }
  Ms("electron-react-titlebar/main").initialize(), Ne.handle("show-input-dialog", async (e, t) => {
    if (ne)
      return await ne.webContents.executeJavaScript(`
            new Promise(resolve => {
                if (document.readyState === 'complete') resolve();
                else window.addEventListener('load', resolve);
            })
        `), await ne.webContents.executeJavaScript(`
            new Promise(resolve => {
                window.showInputDialogReact({
                    ...${JSON.stringify(t)},
                    onOk: (value) => resolve(value),
                    onCancel: () => resolve(undefined)
                });
            })
        `);
  });
});
Gt.on("activate", () => {
  to.getAllWindows().length === 0 && gi();
});
Gt.whenReady().then(gi);
const R0 = "1A86", I0 = "55D4", N0 = 115200;
let Dt = new E0();
Ne.handle("request-serial-devices", async (e, t) => {
  try {
    return (await $i.list()).filter((s) => s.vendorId === R0 && s.productId === I0);
  } catch (r) {
    return console.error("[FATAL] Error listing ports:", r), [];
  }
});
Ne.handle("connect-serial-device", async (e, t) => {
  console.log(`[INFO] Connecting to: ${t}`), at = new $i({
    path: t,
    baudRate: N0
    // const
  }), console.log(`[INFO] Maybe connected to: ${t}`), at.on("open", () => {
    console.log("[INFO] Port opened callback");
  }), console.log("[INFO] Flow mode active; Wailting for RX"), yi = !0;
});
Ne.handle("send-serial", async (e, t) => {
  let r = Buffer.alloc(2);
  if (r.writeUInt16BE(0), !Dt.isEmpty()) {
    const s = Dt.items[Dt.items.length - 1];
    let o = Buffer.from([s[0], s[1]]).readUInt16BE();
    console.log("Front id:", o), o > 1e3 && (o = 0), r = Buffer.alloc(2), r.writeUInt16BE(o + 1);
  }
  t[0] = r[0], t[1] = r[1];
  let n = t.toString("hex").match(/.{1,2}/g).map((s) => s.padStart(2, "0")).join(" ");
  console.log(n), Dt.enqueue(t), console.log(Dt.size());
});
function O0(e, t = 1) {
  return new Promise((r, n) => {
    let s, a = 0, o = [];
    const l = (i) => {
      a += 1, o.push(i.slice(4)), a == 1 && (ne.webContents.send("board_visualization_digital", { map: Za(i, 0) }), ne.webContents.send("board_visualization_analog", { map: Za(i, 1) })), a == t && (clearTimeout(s), at.off("data", l), S0(i), r(o));
    };
    at.on("data", l), at.write(e, (i) => {
      if (i)
        return at.off("data", l), n(i.message);
      s = setTimeout(() => {
        at.off("data", l), n("Timeout waiting for response");
      }, 1e4);
    });
  });
}
Ne.handle("send-and-wait", async (e, t, r) => {
  try {
    let n = Buffer.from([114, 117, 6, 100]);
    return { success: !0, data: await O0(Buffer.concat([n, t]), r) };
  } catch (n) {
    return { success: !1, error: n };
  }
});
export {
  G0 as MAIN_DIST,
  pi as RENDERER_DIST,
  Rn as VITE_DEV_SERVER_URL
};
