/**
 * Simple Plain Background
 * A clean, professional gradient background
 */

(function() {
    'use strict';

    function initSimpleBackground() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) {
            console.warn('Canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('2D context not supported');
            return;
        }

        function resizeCanvas() {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                drawBackground();
            }
        }

        function drawBackground() {
            // Create a simple gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0a0e1a');    // Dark blue at top
            gradient.addColorStop(1, '#1a1f2e');    // Slightly lighter blue at bottom

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Initial draw
        resizeCanvas();

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
            }, 100);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimpleBackground);
    } else {
        initSimpleBackground();
    }
})();
