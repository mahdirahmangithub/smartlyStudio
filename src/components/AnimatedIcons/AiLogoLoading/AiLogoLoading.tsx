import { useRef, useEffect } from "react";
import type { AnimatedIconProps } from "../types";

/* ── Layout ────────────────────────────────────────────────────────── */

const NATIVE_W = 47;
const NATIVE_H = 51;
const VIEW = NATIVE_H;
const X_PAD = (VIEW - NATIVE_W) / 2;

/* ── Dot definitions ───────────────────────────────────────────────── */

const DOTS = [
  { x: 4.59961, y: 20, fs: 1 },
  { x: 4.59961, y: 25, fs: 3 },
  { x: 4.59961, y: 30, fs: 1.5 },
  { x: 4.59961, y: 35, fs: 1 },
  { x: 9.19922, y: 17.5, fs: 1 },
  { x: 9.19922, y: 22.5, fs: 1.5 },
  { x: 9.19922, y: 27.5, fs: 3 },
  { x: 9.19922, y: 32.5, fs: 1 },
  { x: 13.8008, y: 20, fs: 1 },
  { x: 13.8008, y: 25, fs: 2.5 },
  { x: 13.8008, y: 30, fs: 3 },
  { x: 13.8008, y: 35, fs: 1 },
  { x: 18.4004, y: 12.5, fs: 1 },
  { x: 18.4004, y: 17.5, fs: 2 },
  { x: 18.4004, y: 22.5, fs: 2 },
  { x: 18.4004, y: 27.5, fs: 3.5 },
  { x: 18.4004, y: 32.5, fs: 3 },
  { x: 18.4004, y: 37.5, fs: 1 },
  { x: 23, y: 5, fs: 1 },
  { x: 23, y: 10, fs: 1.5 },
  { x: 23, y: 15, fs: 3 },
  { x: 23, y: 20, fs: 3.5 },
  { x: 23, y: 25, fs: 3.5 },
  { x: 23, y: 30, fs: 3.5 },
  { x: 23, y: 35, fs: 3 },
  { x: 23, y: 40, fs: 1.5 },
  { x: 23, y: 45, fs: 1 },
  { x: 27.5996, y: 12.5, fs: 1 },
  { x: 27.5996, y: 17.5, fs: 3 },
  { x: 27.5996, y: 22.5, fs: 3.5 },
  { x: 27.5996, y: 27.5, fs: 2 },
  { x: 27.5996, y: 32.5, fs: 2 },
  { x: 27.5996, y: 37.5, fs: 1 },
  { x: 32.1992, y: 15, fs: 1 },
  { x: 32.1992, y: 20, fs: 3 },
  { x: 32.1992, y: 25, fs: 2.5 },
  { x: 32.1992, y: 30, fs: 1 },
  { x: 36.8008, y: 17.5, fs: 1 },
  { x: 36.8008, y: 22.5, fs: 3 },
  { x: 36.8008, y: 27.5, fs: 1.5 },
  { x: 36.8008, y: 32.5, fs: 1 },
  { x: 41.4004, y: 20, fs: 1.5 },
  { x: 41.4004, y: 25, fs: 3 },
  { x: 41.4004, y: 30, fs: 1 },
];

const NUM = DOTS.length;
const CX = DOTS.map((d) => d.x + 0.4 + X_PAD);
const CY = DOTS.map((d) => d.y + 0.4);

const PHI = 0.6180339887;
const RAND = DOTS.map((_, i) => ({
  phase: (i * PHI + 0.1) % 1,
  speed: (i * 0.4142135624 + 0.3) % 1,
  scatter: (i * 0.7320508076 + 0.7) % 1,
  flyRaw: (i * 0.5497563735 + 0.2) % 1,
}));

const TOTAL_INST = NUM * 2;
const FLY_THRESH = RAND.map((r) => 0.4 + r.flyRaw * 0.45);

const BOLT_CX = 23.2 + X_PAD;
const BOLT_CY = 25.4;

/* ── Flow parameters ───────────────────────────────────────────────── */

const FL = {
  rotateSpeed: 0.13,
  chain1Freq: 0.08,
  chain1Speed: 0.6,
  chain2Freq: 0.12,
  chain2Speed: 0.85,
  chain2Angle: 0.45,
  radialFreq: 0.06,
  radialSpeed: 0.35,
  sharpness: 4,
  sizeAdd: 0.7,
  scatter: 1.0,
  sway: 0.6,
  flyDist: 16.0,
  flyDepart: 500,
  flyArrive: 700,
  flyCooldown: 800,
  opacityLow: 0.2,
  settleSpeed: 0.18,
  settleDepth: 0.85,
  microAmp: 0.03,
  minSize: 0.3,
};

/* ── Shaders ───────────────────────────────────────────────────────── */

const VERT = `#version 300 es
precision highp float;

layout(location=0) in vec2  a_quad;
layout(location=1) in vec2  a_center;
layout(location=2) in float a_radius;
layout(location=3) in float a_opacity;

uniform vec2  u_viewSize;
uniform float u_ppu;

out vec2       v_local;
flat out float v_radius;
flat out float v_opacity;

void main(){
  float extent=a_radius+.5;
  v_local=a_quad*extent;
  vec2 world=a_center+v_local;
  vec2 ndc=world/u_viewSize*2.-1.;
  ndc.y=-ndc.y;
  gl_Position=vec4(ndc,0.,1.);
  v_radius=a_radius;
  v_opacity=a_opacity;
}`;

const FRAG = `#version 300 es
precision highp float;

in vec2       v_local;
flat in float v_radius;
flat in float v_opacity;

uniform float u_ppu;
uniform vec3  u_color;

out vec4 fragColor;

void main(){
  float dist=length(v_local);
  float aa=.75/u_ppu;
  float circ=1.-smoothstep(v_radius-aa,v_radius+aa,dist);
  float alpha=circ*v_opacity;
  fragColor=vec4(u_color*alpha,alpha);
}`;

/* ── GL helpers ────────────────────────────────────────────────────── */

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function link(gl: WebGL2RenderingContext) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p);
  return p;
}

function parseRgb(css: string): [number, number, number] {
  const m = css.match(/(\d+)/g);
  if (m && m.length >= 3) return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
  return [0, 0, 0];
}

/* ── Internal state (per-instance, survives re-renders) ────────────── */

interface GlState {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  uViewSz: WebGLUniformLocation;
  uPpu: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  instBuf: WebGLBuffer;
  vao: WebGLVertexArrayObject;
  data: Float32Array;
  flyT0: number[];
  ppu: number;
}

/* ── Component ─────────────────────────────────────────────────────── */

export interface AiLogoLoadingProps extends AnimatedIconProps {
  /** Playback speed multiplier (default 1). */
  speed?: number;
}

export function AiLogoLoading({
  active = true,
  size = 32,
  color,
  speed = 1,
  className,
}: AiLogoLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef<GlState | null>(null);
  const rafRef = useRef(0);
  const colorRef = useRef<[number, number, number]>([0, 0, 0]);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  /* ── Setup WebGL context & buffers ─────────────────────────────── */

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const gl = cv.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return;

    const program = link(gl);
    const uViewSz = gl.getUniformLocation(program, "u_viewSize")!;
    const uPpu = gl.getUniformLocation(program, "u_ppu")!;
    const uColor = gl.getUniformLocation(program, "u_color")!;

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const idx = new Uint16Array([0, 1, 2, 2, 1, 3]);

    const qBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const iBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    const data = new Float32Array(TOTAL_INST * 4);
    const instBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    const stride = 16;
    for (let loc = 1; loc <= 3; loc++) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 8);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
    gl.bindVertexArray(null);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    stRef.current = {
      gl,
      program,
      uViewSz,
      uPpu,
      uColor,
      instBuf,
      vao,
      data,
      flyT0: DOTS.map(() => -99999),
      ppu: 1,
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(instBuf);
      gl.deleteBuffer(qBuf);
      gl.deleteBuffer(iBuf);
      gl.deleteProgram(program);
      stRef.current = null;
    };
  }, []);

  /* ── Resolve color ─────────────────────────────────────────────── */

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    if (color) cv.style.color = color;
    else cv.style.color = "";
    const resolved = getComputedStyle(cv).color;
    colorRef.current = parseRgb(resolved);
  }, [color]);

  /* ── Resize handler ────────────────────────────────────────────── */

  useEffect(() => {
    const cv = canvasRef.current;
    const st = stRef.current;
    if (!cv || !st) return;

    const dpr = window.devicePixelRatio || 1;
    const pw = Math.round(size * dpr);
    const ph = pw;
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
      st.gl.viewport(0, 0, pw, ph);
      st.ppu = pw / VIEW;
    }
  }, [size]);

  /* ── Render helpers ────────────────────────────────────────────── */

  const drawFrame = (st: GlState, now: number, spd: number) => {
    const { gl, data, flyT0 } = st;
    const TAU = Math.PI * 2;
    const t = now * 0.001 * spd;

    const rawSwell = 0.5 + 0.5 * Math.sin(t * FL.settleSpeed * TAU);
    const swell = rawSwell * rawSwell;
    const d = 1 - swell * FL.settleDepth;

    const dir1A = t * FL.rotateSpeed * TAU;
    const d1x = Math.cos(dir1A),
      d1y = Math.sin(dir1A);
    const phase1 = t * FL.chain1Speed * TAU;

    const dir2A = dir1A + FL.chain2Angle * TAU;
    const d2x = Math.cos(dir2A),
      d2y = Math.sin(dir2A);
    const phase2 = t * FL.chain2Speed * TAU;

    const radP = t * FL.radialSpeed * TAU;

    for (let i = 0; i < NUM; i++) {
      const dot = DOTS[i];
      const dx = CX[i] - BOLT_CX;
      const dy = CY[i] - BOLT_CY;

      const p1 = dx * d1x + dy * d1y;
      const c1 = (0.5 + 0.5 * Math.sin(p1 * FL.chain1Freq * TAU - phase1)) ** FL.sharpness;

      const p2 = dx * d2x + dy * d2y;
      const c2 = (0.5 + 0.5 * Math.sin(p2 * FL.chain2Freq * TAU - phase2)) ** FL.sharpness;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const c3 = (0.5 + 0.5 * Math.sin(dist * FL.radialFreq * TAU - radP)) ** FL.sharpness;

      const wave = 1 - (1 - c1) * (1 - c2) * (1 - c3);
      const flyDriver = Math.max(c1, c2, c3) * d;

      const r = RAND[i];
      const micro = Math.sin(t * (0.8 + r.speed * 0.5) + r.phase * TAU) * FL.microAmp;

      const ew = wave * d;
      const sizeMul = r.scatter * 1.6 - 1.0;
      const sz = Math.max(FL.minSize, dot.fs + ew * FL.sizeAdd * sizeMul * FL.scatter + micro * dot.fs);

      const baseOp = FL.opacityLow + ew * (1 - FL.opacityLow);
      const opacity = baseOp + (1 - baseOp) * swell * FL.settleDepth;

      const nx = dist > 0.1 ? dx / dist : 0;
      const ny = dist > 0.1 ? dy / dist : 0;
      const sx = (c1 * d1x + c2 * d2x + c3 * nx) * d * FL.sway;
      const sy = (c1 * d1y + c2 * d2y + c3 * ny) * d * FL.sway;

      const off = i * 4;
      const gOff = (NUM + i) * 4;
      const cycle = FL.flyDepart + FL.flyArrive + FL.flyCooldown;

      let elapsed = now - flyT0[i];
      if (elapsed >= cycle && flyDriver > FLY_THRESH[i]) {
        flyT0[i] = now;
        elapsed = 0;
      }

      if (elapsed < FL.flyDepart) {
        const p = elapsed / FL.flyDepart;
        const ease = 1 - (1 - p) * (1 - p);
        const fade = Math.max(0, (p - 0.3) / 0.7);
        data[off] = CX[i] + sx;
        data[off + 1] = CY[i] + sy - ease * FL.flyDist;
        data[off + 2] = sz * 0.5 * (1 - fade * 0.3);
        data[off + 3] = opacity * (1 - fade);
        data[gOff + 3] = 0;
      } else if (elapsed < FL.flyDepart + FL.flyArrive) {
        const p = (elapsed - FL.flyDepart) / FL.flyArrive;
        const ease = 1 - (1 - p) * (1 - p);
        const startY = VIEW + 5;
        data[off + 3] = 0;
        data[gOff] = CX[i] + sx * ease;
        data[gOff + 1] = startY + (CY[i] - startY) * ease;
        data[gOff + 2] = sz * 0.5 * (0.2 + 0.8 * ease);
        data[gOff + 3] = ease;
      } else {
        data[off] = CX[i] + sx;
        data[off + 1] = CY[i] + sy;
        data[off + 2] = sz * 0.5;
        data[off + 3] = opacity;
        data[gOff + 3] = 0;
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(st.program);
    gl.uniform2f(st.uViewSz, VIEW, VIEW);
    gl.uniform1f(st.uPpu, st.ppu);
    gl.uniform3fv(st.uColor, colorRef.current);

    gl.bindBuffer(gl.ARRAY_BUFFER, st.instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);

    gl.bindVertexArray(st.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, TOTAL_INST);
    gl.bindVertexArray(null);
  };

  const drawStatic = (st: GlState) => {
    const { gl, data } = st;

    for (let i = 0; i < NUM; i++) {
      const off = i * 4;
      const gOff = (NUM + i) * 4;
      data[off] = CX[i];
      data[off + 1] = CY[i];
      data[off + 2] = DOTS[i].fs * 0.5;
      data[off + 3] = 1;
      data[gOff + 3] = 0;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(st.program);
    gl.uniform2f(st.uViewSz, VIEW, VIEW);
    gl.uniform1f(st.uPpu, st.ppu);
    gl.uniform3fv(st.uColor, colorRef.current);

    gl.bindBuffer(gl.ARRAY_BUFFER, st.instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);

    gl.bindVertexArray(st.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, TOTAL_INST);
    gl.bindVertexArray(null);
  };

  /* ── Animation loop ────────────────────────────────────────────── */

  useEffect(() => {
    const st = stRef.current;
    if (!st) return;

    if (!active) {
      drawStatic(st);
      return;
    }

    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      drawFrame(st, now, speedRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: size, height: size }}
    />
  );
}
