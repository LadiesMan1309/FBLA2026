/**
 * ProceduralGroundBackground
 * A WebGL 2D background featuring topographic neon lines and sand-ripple movement.
 * Optimized for performance using fragment shaders.
 * Converted from React to vanilla JavaScript
 */

(function() {
    'use strict';

    function initWebGLBackground() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) {
            console.warn('WebGL canvas not found');
            return;
        }

        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.warn('WebGL not supported');
            return;
        }

        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                // Zoom in on center - adjust UV to focus on middle area
                vec2 centeredUv = uv * 0.6; // Zoom in by 60%
                centeredUv.y += 0.2; // Shift up to show more center
                
                // Ground Perspective Simulation
                float depth = 1.0 / (centeredUv.y + 1.15);
                vec2 gridUv = vec2(centeredUv.x * depth, depth + u_time * 0.15);
                
                // Layered Procedural Noise for Terrain - adjusted scale for zoom
                float n = noise(gridUv * 2.5);
                float ripples = sin(gridUv.y * 15.0 + n * 6.0 + u_time * 0.5);
                
                // Neon Topographic Lines
                float topoLine = smoothstep(0.03, 0.0, abs(ripples));
                
                // Color Palette - Blue theme
                vec3 baseColor = vec3(0.04, 0.08, 0.18); // Deep Blue Space
                vec3 accentColor = vec3(0.1, 0.3, 0.8);   // Electric Blue
                vec3 neonColor = vec3(0.2, 0.5, 1.0);     // Bright Blue
                
                // Composite
                vec3 finalColor = mix(baseColor, accentColor, n * 0.6);
                finalColor += topoLine * neonColor * depth * 0.5;
                
                // Reduced fade to show more pattern in center
                float fade = smoothstep(0.3, -0.5, centeredUv.y);
                finalColor *= (1.0 - length(centeredUv) * 0.3) * (1.0 - fade * 0.5);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            if (!shader) {
                console.error('Failed to create shader');
                return null;
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const program = gl.createProgram();
        if (!program) {
            console.error('Failed to create program');
            return;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

        if (!vertexShader || !fragmentShader) {
            return;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  1, -1, -1,  1,
            -1,  1,  1, -1,  1,  1
        ]), gl.STATIC_DRAW);

        const posAttrib = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(posAttrib);
        gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, "u_time");
        const resLoc = gl.getUniformLocation(program, "u_resolution");

        function resizeCanvas() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
            }
        }

        let animationFrameId;
        let startTime = performance.now();

        function render() {
            resizeCanvas();
            
            const time = (performance.now() - startTime);
            gl.uniform1f(timeLoc, time * 0.001);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            
            animationFrameId = requestAnimationFrame(render);
        }

        // Initial resize
        resizeCanvas();
        
        // Start animation
        animationFrameId = requestAnimationFrame(render);

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
            }, 100);
        });

        // Cleanup function (if needed)
        return function cleanup() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWebGLBackground);
    } else {
        initWebGLBackground();
    }
})();

