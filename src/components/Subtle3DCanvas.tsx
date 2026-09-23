import React, { useEffect, useRef } from 'react';

interface Subtle3DCanvasProps {
  interactive?: boolean;
}

export const Subtle3DCanvas: React.FC<Subtle3DCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Draw static background
      ctx.fillStyle = '#07080c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle nodes for microcloud field
    const particleCount = 28;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.5 + 0.8,
      });
    }

    // 3D Wireframe Icosahedron vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1, phi, 0],
      [1, phi, 0],
      [-1, -phi, 0],
      [1, -phi, 0],
      [0, -1, phi],
      [0, 1, phi],
      [0, -1, -phi],
      [0, 1, -phi],
      [phi, 0, -1],
      [phi, 0, 1],
      [-phi, 0, -1],
      [-phi, 0, 1],
    ];

    // Normalize and scale
    const radius = 80;
    const sphereVertices = rawVertices.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [(x / len) * radius, (y / len) * radius, (z / len) * radius];
    });

    // Edges connecting vertices with distance threshold
    const edges: Array<[number, number]> = [];
    const threshold = radius * 1.15;
    for (let i = 0; i < sphereVertices.length; i++) {
      for (let j = i + 1; j < sphereVertices.length; j++) {
        const dx = sphereVertices[i][0] - sphereVertices[j][0];
        const dy = sphereVertices[i][1] - sphereVertices[j][1];
        const dz = sphereVertices[i][2] - sphereVertices[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist <= threshold) {
          edges.push([i, j]);
        }
      }
    }

    let angleX = 0;
    let angleY = 0;

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      angleX += delta * 0.22;
      angleY += delta * 0.35;

      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric gradient glow in background
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        10,
        width * 0.5,
        height * 0.35,
        width * 0.7
      );
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
      grad.addColorStop(0.5, 'rgba(129, 140, 248, 0.02)');
      grad.addColorStop(1, 'rgba(7, 8, 12, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Center of 3D projection: place near top right or center top
      const centerX = width > 768 ? width * 0.7 : width * 0.5;
      const centerY = height * 0.26;
      const fov = 350;

      // Rotate and project icosahedron
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = sphereVertices.map(([x, y, z]) => {
        // Rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const scale = fov / (fov + z2 + 100);
        return {
          px: centerX + x1 * scale,
          py: centerY + y2 * scale,
          z: z2,
          scale,
        };
      });

      // Render wireframe lines
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.04, Math.min(0.28, (avgZ + radius) / (2 * radius) * 0.28));

        ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      // Render nodes
      for (const p of projected) {
        const nodeAlpha = Math.max(0.1, (p.z + radius) / (2 * radius) * 0.6);
        ctx.fillStyle = `rgba(186, 230, 253, ${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render drifting background particles
      for (const pt of particles) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.z += pt.vz;

        if (pt.x > 300) pt.x = -300;
        if (pt.x < -300) pt.x = 300;
        if (pt.y > 300) pt.y = -300;
        if (pt.y < -300) pt.y = 300;
        if (pt.z > 300) pt.z = -300;
        if (pt.z < -300) pt.z = 300;

        const pScale = fov / (fov + pt.z + 200);
        const px = centerX + pt.x * pScale;
        const py = centerY + pt.y * pScale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.fillStyle = 'rgba(167, 139, 250, 0.16)';
          ctx.beginPath();
          ctx.arc(px, py, pt.size * pScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-80"
    />
  );
};
