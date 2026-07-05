import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const particleCount = 30;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createParticles() {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function drawRadarSweep() {
      const now = Date.now();
      const angle = (now % 4000) / 4000 * Math.PI * 2;
      const centerX = canvas!.width * 0.15;
      const centerY = canvas!.height * 0.15;
      const radius = Math.min(canvas!.width, canvas!.height) * 0.2;

      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(centerX, centerY);
      ctx!.arc(centerX, centerY, radius, angle - 0.3, angle);
      ctx!.closePath();
      ctx!.fillStyle = 'rgba(201, 162, 39, 0.03)';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.strokeStyle = 'rgba(201, 162, 39, 0.15)';
      ctx!.lineWidth = 1;
      ctx!.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx!.stroke();

      for (let r = radius * 0.25; r < radius; r += radius * 0.25) {
        ctx!.beginPath();
        ctx!.strokeStyle = 'rgba(201, 162, 39, 0.06)';
        ctx!.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      ctx!.beginPath();
      ctx!.moveTo(centerX, centerY);
      const lineX = centerX + Math.cos(angle) * radius;
      const lineY = centerY + Math.sin(angle) * radius;
      ctx!.lineTo(lineX, lineY);
      ctx!.strokeStyle = 'rgba(201, 162, 39, 0.2)';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      drawRadarSweep();

      ctx!.fillStyle = 'rgba(201, 162, 39, 0.4)';
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        ctx!.globalAlpha = p.opacity;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" data-testid="animated-background">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0F2A4A] to-[#162D50] dark:from-[#060E1C] dark:via-[#0B1F3A] dark:to-[#0F2A4A]" />
      <div className="absolute inset-0 bg-tactical-grid opacity-30" />
      <div className="absolute inset-0 bg-grid-overlay opacity-20" />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.03) 0%, transparent 40%, rgba(85, 107, 47, 0.03) 70%, transparent 100%)',
      }} />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent opacity-30" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/20 to-transparent" />
      <div className="absolute top-1/4 left-0 w-px h-1/3 bg-gradient-to-b from-transparent via-[#C9A227]/10 to-transparent" />
      <div className="absolute top-1/3 right-0 w-px h-1/2 bg-gradient-to-b from-transparent via-[#C9A227]/10 to-transparent" />
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-[#0B1F3A]/30" />
    </div>
  );
}

export default AnimatedBackground;
