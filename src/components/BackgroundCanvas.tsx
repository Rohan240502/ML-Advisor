import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface Particle {
  fromNode: Node;
  toNode: Node;
  progress: number;
  speed: number;
}

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize Nodes
    const nodeCount = Math.min(Math.floor((width * height) / 22000), 55);
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isReducedMotion ? 0.05 : 0.4),
        vy: (Math.random() - 0.5) * (isReducedMotion ? 0.05 : 0.4),
        radius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.3,
      });
    }

    // Data traveling particles
    const particles: Particle[] = [];
    const createParticle = () => {
      if (nodes.length < 2) return;
      const n1 = nodes[Math.floor(Math.random() * nodes.length)];
      // find a close neighbor
      const neighbors = nodes.filter(
        n => n !== n1 && Math.hypot(n.x - n1.x, n.y - n1.y) < 140
      );
      if (neighbors.length > 0) {
        const n2 = neighbors[Math.floor(Math.random() * neighbors.length)];
        particles.push({
          fromNode: n1,
          toNode: n2,
          progress: 0,
          speed: Math.random() * 0.015 + 0.008,
        });
      }
    };

    const particleInterval = setInterval(() => {
      if (!isReducedMotion && particles.length < 12) createParticle();
    }, 1500);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Mouse Cursor Radial Glow
      if (mousePos.current.x > 0) {
        const radGrad = ctx.createRadialGradient(
          mousePos.current.x,
          mousePos.current.y,
          0,
          mousePos.current.x,
          mousePos.current.y,
          320
        );
        radGrad.addColorStop(0, 'rgba(124, 108, 255, 0.14)');
        radGrad.addColorStop(0.5, 'rgba(91, 140, 255, 0.06)');
        radGrad.addColorStop(1, 'rgba(8, 11, 18, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(mousePos.current.x, mousePos.current.y, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Update and Draw Connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.22;
            ctx.strokeStyle = `rgba(124, 108, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw Nodes
      for (const node of nodes) {
        ctx.fillStyle = `rgba(124, 108, 255, ${node.alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const px = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const py = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        ctx.fillStyle = '#35D7FF';
        ctx.shadowColor = '#35D7FF';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(particleInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
