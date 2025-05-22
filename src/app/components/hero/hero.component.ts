import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private techObjects: THREE.Mesh[] = [];
  private symbolsGroup!: THREE.Group;
  private animationFrameId: number | null = null;

  // Tech symbols with their colors
  private readonly TECH_SYMBOLS = [
    { text: '</>', color: '#61DAFB' },  // React blue
    { text: '{ }', color: '#DD0031' },  // Angular red
    { text: '=>', color: '#3178C6' },   // TypeScript blue
    { text: '**', color: '#F7DF1E' },   // JavaScript yellow
    { text: '//', color: '#41B883' },   // Vue green
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createSymbols();
    this.createTechObjects();
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    this.scene.clear();
    this.renderer.dispose();
  }

  private initThreeJS(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const canvas = this.renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    this.elementRef.nativeElement.insertBefore(canvas, this.elementRef.nativeElement.firstChild);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4444ff, 1);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    this.symbolsGroup = new THREE.Group();
    this.scene.add(this.symbolsGroup);
  }

  private createSymbolTexture(symbol: string, color: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;  // Increased size for better quality
    canvas.height = 256;
    
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced glow effect
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 3
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color.replace('1)', '0.3)'));
    gradient.addColorStop(1, 'transparent');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = 'bold 96px monospace';  // Increased font size
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(symbol, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private createSymbols(): void {
    const symbolCount = 15; // Reduced from 40 to 15 symbols
    
    for (let i = 0; i < symbolCount; i++) {
      const { text, color } = this.TECH_SYMBOLS[i % this.TECH_SYMBOLS.length];
      
      const spriteMaterial = new THREE.SpriteMaterial({
        map: this.createSymbolTexture(text, color),
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      
      // More controlled distribution in a sphere
      const radius = Math.random() * 12 + 8; // Slightly tighter radius range
      const theta = (i / symbolCount) * Math.PI * 2; // Even distribution around circle
      const phi = Math.acos((2 * i / symbolCount) - 1); // Better vertical distribution
      
      sprite.position.x = radius * Math.sin(phi) * Math.cos(theta);
      sprite.position.y = radius * Math.sin(phi) * Math.sin(theta);
      sprite.position.z = radius * Math.cos(phi);
      
      // Slightly larger size range for better visibility with fewer symbols
      const scale = Math.random() * 1.8 + 1.2;
      sprite.scale.set(scale, scale, 1);
      
      this.symbolsGroup.add(sprite);
    }
  }

  private createTechObjects(): void {
    const shapes = [
      new THREE.IcosahedronGeometry(1.2, 0),  // Angular-like logo
      new THREE.TorusGeometry(1, 0.4, 16, 100), // Ring for infinity
      new THREE.TetrahedronGeometry(1.2),     // Pyramid
    ];

    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0x4444ff,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
        wireframe: true
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xff4444,
        transparent: true,
        opacity: 0.7,
        shininess: 100
      })
    ];

    // Create fewer objects
    for (let i = 0; i < 4; i++) {
      const geometry = shapes[i % shapes.length];
      const material = materials[i % materials.length];
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 15;
      mesh.position.y = (Math.random() - 0.5) * 15;
      mesh.position.z = (Math.random() - 0.5) * 15;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      this.techObjects.push(mesh);
      this.scene.add(mesh);
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Faster group rotation
    this.symbolsGroup.rotation.y += 0.002;
    
    // Animate individual symbols with smoother motion
    this.symbolsGroup.children.forEach((sprite, index) => {
      const time = Date.now() * 0.0015; // Slower wave motion
      const offset = index * 0.2;
      
      // Gentler wave motion
      sprite.position.y += Math.sin(time + offset) * 0.015;
      
      // Slower rotation
      sprite.rotation.z = Math.sin(time + offset) * 0.05;
    });

    // Animate tech objects with faster rotation
    this.techObjects.forEach((obj, index) => {
      const time = Date.now() * 0.001;
      const radius = 4 + index * 0.8; // Tighter orbits
      
      if (index % 2 === 0) {
        // Circular motion
        obj.position.x = Math.cos(time * 0.4) * radius;
        obj.position.y = Math.sin(time * 0.3) * radius;
        obj.position.z = Math.cos(time * 0.5) * radius;
      } else {
        // Figure-8 pattern
        obj.position.x = Math.sin(time * 0.4) * radius;
        obj.position.y = Math.sin(time * 0.6) * (radius * 0.5);
        obj.position.z = Math.cos(time * 0.4) * radius;
      }

      // Faster rotation
      obj.rotation.x += 0.02;
      obj.rotation.y += 0.02;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
