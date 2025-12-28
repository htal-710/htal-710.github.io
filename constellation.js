const canvas = document.getElementById('constellationCanvas');
const ctx = canvas.getContext('2d');

let width, height;
const stars = [];
const planets = [];
const cursor = { x: 0, y: 0 };

// --- RESIZE HANDLER ---
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- CLASSES ---
class Node {
    constructor(data, type) {
        this.data = data;
        this.type = type; // 'skill' or 'project'
        this.x = data.x * width;
        this.y = data.y * height;
        this.baseSize = data.size;
        this.currentSize = data.size;
        this.hovered = false;
        
        // Random float movement
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    update() {
        // Floating physics
        this.x += this.vx;
        this.y += this.vy;

        // Boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Interaction
        const dist = Math.hypot(cursor.x - this.x, cursor.y - this.y);
        
        if (dist < 30) {
            this.hovered = true;
            this.currentSize = this.baseSize * 1.5;
            document.body.style.cursor = 'pointer';
        } else {
            this.hovered = false;
            this.currentSize = this.baseSize;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        
        // Style based on type
        if (this.type === 'skill') {
            ctx.fillStyle = 'white';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'white';
        } else {
            ctx.fillStyle = '#00ffff'; // Project Color
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
        }
        ctx.fill();
        ctx.closePath();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Courier New';
        ctx.fillText(this.data.name, this.x + 15, this.y + 4);
    }
}

// --- INITIALIZATION ---
function init() {
    // Create Stars (Skills)
    UNIVERSE_DATA.skills.forEach(skill => {
        stars.push(new Node(skill, 'skill'));
    });

    // Create Planets (Projects)
    UNIVERSE_DATA.projects.forEach(project => {
        planets.push(new Node(project, 'project'));
    });
}

// --- ANIMATION LOOP ---
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & Draw Stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Update & Draw Planets
    planets.forEach(planet => {
        planet.update();
        planet.draw();

        // INTERACTION LOGIC: Draw lines if hovered
        if (planet.hovered) {
            planet.data.links.forEach(linkId => {
                const targetSkill = stars.find(s => s.data.id === linkId);
                if (targetSkill) {
                    ctx.beginPath();
                    ctx.moveTo(planet.x, planet.y);
                    ctx.lineTo(targetSkill.x, targetSkill.y);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        }
    });

    requestAnimationFrame(animate);
}

// --- EVENT LISTENERS ---
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});

window.addEventListener('click', (e) => {
    planets.forEach(planet => {
        const dist = Math.hypot(e.clientX - planet.x, e.clientY - planet.y);
        if (dist < 30 && planet.data.url !== '#') {
            window.location.href = planet.data.url;
        }
    });
});

init();
animate();
