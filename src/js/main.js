import * as THREE from 'three';

class Background {
    constructor() {
        this.container = document.getElementById('background-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.mouseX = 0;
        this.mouseY = 0;
        this.particles = null;

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 2;

        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        const posArray = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 5;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: 0x00ff9d,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.particles) {
            this.particles.rotation.x += 0.0002;
            this.particles.rotation.y += 0.0002;
            
            this.particles.rotation.x += this.mouseY * 0.0001;
            this.particles.rotation.y += this.mouseX * 0.0001;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

class WizardManager {
    constructor() {
        this.currentStep = 1;
        this.projectName = '';
        this.tokenSymbol = '';
        this.generatedText = '';
        this.init();
    }

    init() {
        // Start project button
        document.getElementById('startProject')?.addEventListener('click', () => {
            document.getElementById('projectWizard').classList.add('active');
        });

        document.getElementById('startProject')?.addEventListener('click', () => {
            // Fade out hero
            document.querySelector('.hero').classList.add('fade-out');
            
            // Show wizard after a slight delay
            setTimeout(() => {
                document.getElementById('projectWizard').classList.add('active');
            }, 300); // Match this with the transition time
        });

        // Input listeners
        const projectNameInput = document.getElementById('projectName');
        const tokenSymbolInput = document.getElementById('tokenSymbol');
        const promptInput = document.getElementById('promptInput');
        const nextButton = document.getElementById('nextButton');

        // Check inputs on change for step 1
        const checkBasicInputs = () => {
            const nameValid = projectNameInput.value.trim().length > 0;
            const symbolValid = tokenSymbolInput.value.trim().length > 0;
            nextButton.disabled = !(nameValid && symbolValid);
        };

        // Check input for step 2
        const checkPromptInput = () => {
            nextButton.disabled = promptInput.value.trim().length === 0;
        };

        projectNameInput.addEventListener('input', checkBasicInputs);
        tokenSymbolInput.addEventListener('input', checkBasicInputs);
        promptInput?.addEventListener('input', checkPromptInput);

        // Next button handler
        nextButton.addEventListener('click', () => this.nextStep());
    }

    async nextStep() {
        switch(this.currentStep) {
            case 1:
                this.projectName = document.getElementById('projectName').value.trim();
                this.tokenSymbol = document.getElementById('tokenSymbol').value.trim();
                
                // Update display in step 2
                document.getElementById('projectNameDisplay').textContent = this.projectName;
                document.getElementById('symbolDisplay').textContent = this.tokenSymbol;
                
                // Enable next button only when prompt is filled
                document.getElementById('nextButton').disabled = true;
                
                this.updateSteps(2);
                break;

            case 2:
                const promptInput = document.getElementById('promptInput');
                const prompt = promptInput.value.trim();
                
                if (prompt) {
                    await this.generateText(prompt);
                    // Update review step
                    document.getElementById('reviewName').textContent = this.projectName;
                    document.getElementById('reviewSymbol').textContent = this.tokenSymbol;
                    document.getElementById('reviewText').textContent = this.generatedText;
                    
                    document.getElementById('nextButton').textContent = 'Finish';
                    this.updateSteps(3);
                }
                break;

            case 3:
                // Handle finish action
                console.log('Wizard completed!');
                // You can add completion logic here
                break;
        }
    }

    updateSteps(newStep) {
        // Update steps UI
        document.querySelector(`.step[data-step="${this.currentStep}"]`).classList.remove('active');
        document.querySelector(`.step[data-step="${newStep}"]`).classList.add('active');
        
        // Update content
        document.querySelector(`.wizard-step[data-step="${this.currentStep}"]`).classList.remove('active');
        document.querySelector(`.wizard-step[data-step="${newStep}"]`).classList.add('active');
        
        this.currentStep = newStep;
    }

    async generateText(prompt) {
        const loadingIndicator = document.querySelector('.loading-indicator');
        const generatedContent = document.querySelector('.generated-content');
        
        loadingIndicator.classList.remove('hidden');
        generatedContent.innerHTML = '';

        try {
            // Here you'll make the API call to ChatGPT
            const response = await this.callChatGPT(prompt);
            this.generatedText = response;
            
            loadingIndicator.classList.add('hidden');
            generatedContent.innerHTML = response;
            
            // Enable next button after generation
            document.getElementById('nextButton').disabled = false;
        } catch (error) {
            loadingIndicator.classList.add('hidden');
            generatedContent.innerHTML = 'Error generating content. Please try again.';
            document.getElementById('nextButton').disabled = true;
        }
    }

    async callChatGPT(prompt) {
        try {
            console.log('Sending request:', { prompt, projectName: this.projectName, tokenSymbol: this.tokenSymbol });
    
            const response = await fetch('https://stylus-backend.onrender.com/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    projectName: this.projectName,
                    tokenSymbol: this.tokenSymbol
                })
            });
    
            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Error:', errorData);
                throw new Error(`API error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('API Response:', data);
    
            if (data.text) {
                return data.text;
            } else {
                throw new Error('No response from API');
            }
        } catch (error) {
            console.error('Detailed error:', error);
            throw error;
        }
    }
}

// Initialize background and wizard
const background = new Background();
const wizard = new WizardManager();

// Add click handler for logo refresh
document.querySelector('.logo').addEventListener('click', () => {
    window.location.reload();
});






