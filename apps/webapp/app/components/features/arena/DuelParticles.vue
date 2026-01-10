<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animationId: number | null = null;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
};

const createParticle = (x: number, y: number, color: string): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 8 + 2;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1.0,
    color,
    size: Math.random() * 4 + 2,
  };
};

const update = () => {
  if (!ctx || !canvasRef.value) return;

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (!p) continue;
    p.life -= 0.02; // Decay
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // Gravity

    if (p.life <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(update);
  } else {
    animationId = null;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

const explode = (x: number, y: number, color: string = '#ffffff') => {
  const count = 50; // Number of particles
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(x, y, color));
  }
  if (!animationId) {
    update();
  }
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (animationId) cancelAnimationFrame(animationId);
});

defineExpose({
  explode,
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-50"
  ></canvas>
</template>
