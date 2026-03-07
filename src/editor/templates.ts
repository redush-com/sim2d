/** Starter template for a custom simulation */
export interface Template {
  name: string;
  code: string;
}

/**
 * Returns all available starter templates for the code editor.
 * @returns array of named code templates
 */
export function getTemplates(): Template[] {
  return [EMPTY_TEMPLATE, PARTICLES_TEMPLATE, FLOCKING_TEMPLATE];
}

const EMPTY_TEMPLATE: Template = {
  name: 'Empty',
  code: `// Your custom simulation
// Return initial state from init(), update it in tick()
// Use ctx to draw (fillRect, arc, beginPath, stroke, etc.)

function init({ width, height }) {
  return { width, height };
}

function tick(state, dt, ctx) {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = '#5588ff';
  ctx.beginPath();
  ctx.arc(state.width / 2, state.height / 2, 20, 0, Math.PI * 2);
  ctx.fill();

  return state;
}
`,
};

const PARTICLES_TEMPLATE: Template = {
  name: 'Bouncing Particles',
  code: `// Bouncing particles with gravity

function init({ width, height }) {
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      vx: (Math.random() - 0.5) * 200,
      vy: 0,
      r: 3 + Math.random() * 4,
      hue: Math.random() * 360,
    });
  }
  return { particles, width, height };
}

function tick(state, dt, ctx) {
  const { particles, width, height } = state;
  const gravity = 400;

  ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
  ctx.fillRect(0, 0, width, height);

  for (const p of particles) {
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.y + p.r > height) { p.y = height - p.r; p.vy *= -0.8; }
    if (p.x < p.r) { p.x = p.r; p.vx *= -1; }
    if (p.x + p.r > width) { p.x = width - p.r; p.vx *= -1; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = \`hsl(\${p.hue}, 80%, 60%)\`;
    ctx.fill();
  }

  return state;
}
`,
};

const FLOCKING_TEMPLATE: Template = {
  name: 'Simple Flocking',
  code: `// Minimal flocking with separation and cohesion

function init({ width, height }) {
  const agents = [];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    agents.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * 100,
      vy: Math.sin(angle) * 100,
    });
  }
  return { agents, width, height };
}

function tick(state, dt, ctx) {
  const { agents, width, height } = state;

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, width, height);

  for (const a of agents) {
    let sx = 0, sy = 0, cx = 0, cy = 0, n = 0;

    for (const b of agents) {
      if (a === b) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 80) {
        n++;
        cx += b.x; cy += b.y;
        if (d < 30 && d > 0) { sx -= dx / d; sy -= dy / d; }
      }
    }

    if (n > 0) {
      cx = cx / n - a.x; cy = cy / n - a.y;
      a.vx += (cx * 0.5 + sx * 2) * dt * 60;
      a.vy += (cy * 0.5 + sy * 2) * dt * 60;
    }

    const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
    if (speed > 150) { a.vx = a.vx / speed * 150; a.vy = a.vy / speed * 150; }

    a.x = (a.x + a.vx * dt + width) % width;
    a.y = (a.y + a.vy * dt + height) % height;

    const angle = Math.atan2(a.vy, a.vx);
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, 4);
    ctx.lineTo(-4, -4);
    ctx.closePath();
    ctx.fillStyle = '#88ccff';
    ctx.fill();
    ctx.restore();
  }

  return state;
}
`,
};
