const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Characters
const chars = "0123456789ABCDEF".split('');

// Particles setup
const particleCount = 120;
const particles = [];

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        char: chars[Math.floor(Math.random() * chars.length)],
        size: Math.random() * 14 + 8
    });
}

// Track mouse for interactivity
const mouse = { x: null, y: null };
canvas.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Animate particles
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        // Draw character
        ctx.fillStyle = `rgba(255, 20, 20, 0.8)`; // red
        ctx.font = `${p.size}px monospace`;
        ctx.fillText(p.char, p.x, p.y);

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Occasionally change character
        if (Math.random() < 0.01) {
            p.char = chars[Math.floor(Math.random() * chars.length)];
        }

        // Interactive repulsion from mouse
        if (mouse.x && mouse.y) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) {
                const angle = Math.atan2(dy, dx);
                const force = (100 - dist) / 50; // repulsion strength
                p.vx += Math.cos(angle) * force * 0.05;
                p.vy += Math.sin(angle) * force * 0.05;
            }
        }

        // Optional subtle lines
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 80) {
                ctx.strokeStyle = `rgba(255,50,50,${0.2*(1 - dist/80)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animate);
}

animate();
