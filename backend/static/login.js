const canvas = document.getElementById('animated-background');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const nodes = [];
const maxNodes = 100;
const maxNodeConnections = 3;
const nodeConnectionDistance = 150;
const nodeSpeed = 0.5;

// Node creation
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = (Math.random() - 0.5) * nodeSpeed;
        this.speedY = (Math.random() - 0.5) * nodeSpeed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
        ctx.fillStyle = '#0f0f0f';
        ctx.fill();
    }

    update() {
        if (this.x > canvas.width || this.x < 0) {
            this.speedX = -this.speedX;
        }

        if (this.y > canvas.height || this.y < 0) {
            this.speedY = -this.speedY;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.draw();
    }
}

// Initialize nodes
function init() {
    for (let i = 0; i < maxNodes; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        nodes.push(new Node(x, y));
    }
}

function connectNodes() {
    nodes.forEach((node, index) => {
        for (let j = index + 1; j < nodes.length; j++) {
            const distance = Math.sqrt(
                (node.x - nodes[j].x) ** 2 + (node.y - nodes[j].y) ** 2
            );

            if (distance < nodeConnectionDistance) {
                ctx.beginPath();
                // Set line color to a softer, professional shade
                ctx.strokeStyle = `rgba(95, 158, 160, ${1 - distance / nodeConnectionDistance})`; // Soft cyan, for example
                ctx.lineWidth = 1;
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => node.update());
    connectNodes();
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    nodes.length = 0; // Reset the nodes array
    init();
});

init();
animate();