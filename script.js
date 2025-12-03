// Dados dos sólidos platônicos
const solidosPlatonicos = {
    tetraedro: {
        nome: 'Tetraedro',
        elemento: 'FOGO',
        cor: 0xff4500, // Laranja/vermelho do fogo
        corBorda: 0x8b0000, // Vermelho escuro
        V: 4,
        A: 6,
        F: 4,
        descricao: 'Quatro faces triangulares',
        texto: 'O metano (CH₄) tem uma estrutura tetraédrica, com o átomo de carbono no centro e os quatro átomos de hidrogênio nos vértices. O átomo de carbono em seu estado híbrido sp³, como no caso do metano.'
    },
    hexaedro: {
        nome: 'Hexaedro (Cubo)',
        elemento: 'TERRA',
        cor: 0x8b4513, // Marrom da terra
        corBorda: 0x654321, // Marrom escuro
        V: 8,
        A: 12,
        F: 6,
        descricao: 'Seis faces quadradas',
        texto: 'Cristais de sal (NaCl): Os átomos de sódio e cloro formam uma estrutura cúbica onde os átomos estão localizados nos vértices e nas faces do cubo. O ferrum (Fe), em sua forma cristalina cúbica, tem uma rede cúbica centrada na face.'
    },
    octaedro: {
        nome: 'Octaedro',
        elemento: 'AR',
        cor: 0x87ceeb, // Azul claro do céu
        corBorda: 0x4682b4, // Azul aço
        V: 6,
        A: 12,
        F: 8,
        descricao: 'Oito faces triangulares',
        texto: 'Moléculas de água (H₂O) em seu arranjo de ligações de hidrogênio podem, sob certas condições, formar estruturas semelhantes ao octaedro. O óxido de alumínio (Al₂O₃) também pode formar uma estrutura octaédrica sob certas condições cristalinas.'
    },
    dodecaedro: {
        nome: 'Dodecaedro',
        elemento: 'COSMOS',
        cor: 0x4b0082, // Índigo/roxo do cosmos
        corBorda: 0x2e0042, // Roxo muito escuro
        V: 20,
        A: 30,
        F: 12,
        descricao: 'Doze faces pentagonais',
        texto: '<p>Estruturas de metais e ligas: Em alguns arranjos de metais, como em nanotubos ou clusters metálicos, certos padrões geométricos podem se assemelhar a formas dodecaédricas.</p><p>Estruturas de moléculas em química de coordenação: Alguns complexos químicos e compostos metálicos, onde um átomo central se liga a 12 ligantes em um padrão geométrico regular, podem exibir uma simetria de dodecaedro.</p>'
    },
    icosaedro: {
        nome: 'Icosaedro',
        elemento: 'ÁGUA',
        cor: 0x1e90ff, // Azul da água
        corBorda: 0x00008b, // Azul escuro
        V: 12,
        A: 30,
        F: 20,
        descricao: 'Vinte faces triangulares',
        texto: '<p>Moléculas de Clusters Metálicos: Alguns clusters de átomos metálicos (conhecidos como "nanoclusters") podem formar estruturas que exibem simetria icosaédrica. Esses clusters são compostos por átomos metálicos dispostos de maneira que as suas ligações formam uma rede com simetria icosaédrica.</p><p>Nanopartículas: Algumas nanopartículas de ouro ou prata podem ter formas que se aproximam de um icosaedro devido à forma como os átomos estão organizados na superfície. Essas partículas podem ter uma estrutura com 20 faces triangulares no caso de uma configuração simétrica.</p>'
    }
};

// Variáveis globais para controle Three.js
let scene = null;
let camera = null;
let renderer = null;
let solidoMesh = null;
let solidoEdges = null;
let solidoGroup = null;
let estaMontado = false;
let animationId = null;
let solidoAtual = null;

// Elementos do DOM - serão inicializados quando necessário
let modalOverlay, visualizacaoContainer, nomeSolido, solido3D, textoExplicativo;

// Função para inicializar Three.js
function inicializarThreeJS() {
    // Garante que solido3D está inicializado
    if (!solido3D) {
        solido3D = document.getElementById('solido3D');
    }
    
    if (!solido3D) {
        console.error('Container solido3D não encontrado!');
        return;
    }
    
    // Limpa o container
    solido3D.innerHTML = '';
    
    // Cria cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Cria câmera
    const width = solido3D.clientWidth;
    const height = solido3D.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // Cria renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    solido3D.appendChild(renderer.domElement);
    
    // Adiciona iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Função de animação
    function animate() {
        if (solidoGroup && estaMontado) {
            solidoGroup.rotation.y += 0.01;
            solidoGroup.rotation.x += 0.005;
        }
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        animationId = requestAnimationFrame(animate);
    }
    animate();
    
    // Redimensiona ao mudar tamanho da janela
    window.addEventListener('resize', () => {
        const width = solido3D.clientWidth;
        const height = solido3D.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// Função para criar bordas/arestas com múltiplas camadas
function criarEdges(geometry, corBorda = 0x000000) {
    const edges = new THREE.EdgesGeometry(geometry);
    
    // Camada externa 1
    const lineOuter1 = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
            color: corBorda,
            transparent: true,
            opacity: 0
        })
    );
    lineOuter1.scale.set(1.015, 1.015, 1.015);
    
    // Camada externa 2
    const lineOuter2 = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
            color: corBorda,
            transparent: true,
            opacity: 0
        })
    );
    lineOuter2.scale.set(1.008, 1.008, 1.008);
    
    // Camada principal
    const lineMain = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
            color: corBorda,
            transparent: true,
            opacity: 0
        })
    );
    
    // Camada interna
    const lineInner = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
            color: corBorda,
            transparent: true,
            opacity: 0
        })
    );
    lineInner.scale.set(0.995, 0.995, 0.995);
    
    // Cria grupo com todas as camadas
    const edgeGroup = new THREE.Group();
    edgeGroup.add(lineOuter1);
    edgeGroup.add(lineOuter2);
    edgeGroup.add(lineMain);
    edgeGroup.add(lineInner);
    
    return edgeGroup;
}

// Função para criar sólido baseado no tipo
function criarSolido(tipo) {
    // Limpa container primeiro
    solido3D.innerHTML = '';
    
    // Sempre reinicializa para garantir que funcione
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (scene) {
        // Limpa cena anterior
        while(scene.children.length > 0) {
            const obj = scene.children[0];
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            scene.remove(obj);
        }
    }
    
    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    
    // Inicializa Three.js
    inicializarThreeJS();
    
    // Remove sólido anterior se existir
    if (solidoGroup && scene) {
        scene.remove(solidoGroup);
        if (solidoMesh) {
            solidoMesh.geometry.dispose();
            solidoMesh.material.dispose();
        }
        if (solidoEdges) {
            solidoEdges.children.forEach(child => {
                child.geometry.dispose();
                child.material.dispose();
            });
        }
    }
    
    const dados = solidosPlatonicos[tipo];
    let geometry;
    
    switch(tipo) {
        case 'tetraedro':
            geometry = new THREE.TetrahedronGeometry(2);
            break;
        case 'hexaedro':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'octaedro':
            geometry = new THREE.OctahedronGeometry(2);
            break;
        case 'dodecaedro':
            geometry = new THREE.DodecahedronGeometry(2);
            break;
        case 'icosaedro':
            geometry = new THREE.IcosahedronGeometry(2);
            break;
    }
    
    const material = new THREE.MeshPhongMaterial({
        color: dados.cor,
        shininess: 100,
        specular: dados.cor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    
    solidoMesh = new THREE.Mesh(geometry, material);
    solidoEdges = criarEdges(geometry, dados.corBorda);
    
    solidoGroup = new THREE.Group();
    solidoGroup.add(solidoMesh);
    solidoGroup.add(solidoEdges);
    solidoGroup.scale.set(0, 0, 0);
    scene.add(solidoGroup);
}

// Função para mostrar visualização
function mostrarVisualizacao(tipo, botaoElemento = null) {
    // Inicializa elementos do DOM se necessário
        if (!modalOverlay) {
            modalOverlay = document.getElementById('modalOverlay');
            visualizacaoContainer = document.getElementById('visualizacaoContainer');
            nomeSolido = document.getElementById('nomeSolido');
            solido3D = document.getElementById('solido3D');
            textoExplicativo = document.getElementById('textoExplicativo');
        }
    
    if (!modalOverlay || !solido3D) {
        console.error('Elementos do DOM não encontrados!');
        return;
    }
    
    const dados = solidosPlatonicos[tipo];
    if (!dados) {
        console.error('Tipo de sólido não encontrado:', tipo);
        return;
    }
    
    solidoAtual = tipo;
    
    nomeSolido.textContent = dados.nome;
    
    // Preenche o texto explicativo
    if (textoExplicativo && dados.texto) {
        textoExplicativo.innerHTML = '<h3 class="titulo-natureza">Onde Achamos na Natureza:</h3>' + dados.texto;
    }
    
    // Verifica se é mobile e centraliza o modal mais em relação ao body
    const isMobile = window.innerWidth <= 768;
    if (isMobile && botaoElemento) {
        const card = botaoElemento.closest('.solido-card');
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calcula dimensões do modal
        const modalWidth = Math.min(viewportWidth - 40, 400);
        const estimatedHeight = 500; // Altura estimada do modal
        
        // Centraliza horizontalmente
        const leftPosition = (viewportWidth - modalWidth) / 2;
        
        // Centraliza verticalmente, mas com leve deslocamento em direção ao card
        let topPosition;
        if (card) {
            const cardRect = card.getBoundingClientRect();
            const cardCenterY = cardRect.top + scrollY + (cardRect.height / 2);
            const viewportCenterY = scrollY + (viewportHeight / 2);
            
            // Interpola entre o centro da viewport e o centro do card (70% viewport, 30% card)
            const targetY = viewportCenterY * 0.7 + cardCenterY * 0.3;
            topPosition = targetY - (estimatedHeight / 2);
            
            // Garante que não saia da tela
            if (topPosition < scrollY + 10) {
                topPosition = scrollY + 10;
            }
            if (topPosition + estimatedHeight > scrollY + viewportHeight - 10) {
                topPosition = scrollY + viewportHeight - estimatedHeight - 10;
            }
        } else {
            // Se não encontrar o card, centraliza completamente
            topPosition = scrollY + (viewportHeight - estimatedHeight) / 2;
        }
        
        // Posiciona o container centralizado
        visualizacaoContainer.style.position = 'absolute';
        visualizacaoContainer.style.top = `${topPosition}px`;
        visualizacaoContainer.style.left = `${leftPosition}px`;
        visualizacaoContainer.style.right = 'auto';
        visualizacaoContainer.style.bottom = 'auto';
        visualizacaoContainer.style.transform = 'none';
        visualizacaoContainer.style.margin = '0';
        visualizacaoContainer.style.maxWidth = `${modalWidth}px`;
    } else {
        // Desktop: centraliza o modal
        visualizacaoContainer.style.position = 'relative';
        visualizacaoContainer.style.top = 'auto';
        visualizacaoContainer.style.left = 'auto';
        visualizacaoContainer.style.right = 'auto';
        visualizacaoContainer.style.bottom = 'auto';
        visualizacaoContainer.style.transform = '';
        visualizacaoContainer.style.margin = '';
        visualizacaoContainer.style.maxWidth = '';
    }
    
    // Mostra o modal primeiro
    console.log('Removendo classe hidden do modal');
    modalOverlay.classList.remove('hidden');
    modalOverlay.style.display = 'flex';
    
    // Força reflow
    void modalOverlay.offsetWidth;
    
    // Aguarda um frame para garantir que o DOM está atualizado
    setTimeout(() => {
        console.log('Criando sólido:', tipo);
        // Cria o sólido
        criarSolido(tipo);
        
        // Anima entrada do modal
        gsap.fromTo(modalOverlay, 
            { opacity: 0 },
            { 
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            }
        );
        
        if (isMobile && botaoElemento) {
            // Animação do mobile: aparece próximo ao card
            gsap.fromTo(visualizacaoContainer,
                { scale: 0.8, opacity: 0, y: 20 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.1,
                    ease: "back.out(1.7)"
                }
            );
        } else {
            // Animação do desktop: centraliza
            gsap.fromTo(visualizacaoContainer,
                { scale: 0.8, opacity: 0, y: 50 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.1,
                    ease: "back.out(1.7)"
                }
            );
        }
        
        // Monta o sólido automaticamente após um delay maior para garantir que Three.js está pronto
        setTimeout(() => {
            console.log('Montando sólido automaticamente');
            montarSolidoAutomatico();
        }, 1000);
    }, 50);
}

// Função para fechar visualização
function fecharVisualizacao() {
    if (!modalOverlay || !visualizacaoContainer) return;
    
    gsap.to(visualizacaoContainer, {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 0.3,
        ease: "back.in(1.7)"
    });
    
    gsap.to(modalOverlay, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        ease: "power2.in",
        onComplete: () => {
            modalOverlay.classList.add('hidden');
            estaMontado = false;
            
            // Limpa a cena
            if (solidoGroup) {
                scene.remove(solidoGroup);
                if (solidoMesh) {
                    solidoMesh.geometry.dispose();
                    solidoMesh.material.dispose();
                }
                if (solidoEdges) {
                    solidoEdges.children.forEach(child => {
                        child.geometry.dispose();
                        child.material.dispose();
                    });
                }
            }
        }
    });
}

// Função para montar automaticamente
function montarSolidoAutomatico() {
    if (!solidoGroup) return;
    
    estaMontado = true;
    
    // Anima o sólido aparecendo
    gsap.to(solidoGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        ease: "back.out(1.7)"
    });
    
    gsap.to(solidoMesh.material, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
    });
    
    // Anima bordas
    solidoEdges.children.forEach((edge, index) => {
        gsap.to(edge.material, {
            opacity: 1,
            duration: 1.2,
            delay: index * 0.05,
            ease: "power2.out"
        });
    });
}


// Função para inicializar o loading screen
function inicializarLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingCanvas = document.getElementById('loadingCanvas');
    const loadingButton = document.getElementById('loadingButton');
    const container = document.querySelector('.container');
    const body = document.body;
    
    if (!loadingScreen || !loadingCanvas) {
        console.error('Elementos do loading não encontrados');
        // Se não encontrar, mostra o container diretamente
        if (container) {
            container.classList.remove('hidden');
            body.classList.add('loaded');
        }
        return;
    }
    
    console.log('Inicializando loading screen...');
    
    // Sequência dos sólidos
    const solidos = ['tetraedro', 'hexaedro', 'octaedro', 'dodecaedro', 'icosaedro'];
    let currentIndex = 0;
    
    // Inicializa Three.js para o loading
    let loadingScene = new THREE.Scene();
    loadingScene.background = null;
    
    // Força dimensões do canvas
    const width = loadingCanvas.clientWidth || 600;
    const height = loadingCanvas.clientHeight || 500;
    
    console.log('Canvas dimensions:', width, height);
    
    let loadingCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    loadingCamera.position.z = 5;
    
    let loadingRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        transparent: true
    });
    loadingRenderer.setSize(width, height);
    loadingRenderer.setClearColor(0x000000, 0);
    loadingCanvas.appendChild(loadingRenderer.domElement);
    
    console.log('Three.js inicializado no loading');
    
    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    loadingScene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    loadingScene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, -5, -5);
    loadingScene.add(directionalLight2);
    
    let currentSolido = null;
    let animationFrameId = null;
    
    // Função para animar escrita da equação
    function escreverEquacao(tipo) {
        const loadingEquacao = document.getElementById('loadingEquacao');
        if (!loadingEquacao) return;
        
        // Equações para cada sólido
        const equacoes = {
            tetraedro: 'V - A + F = 4 - 6 + 4 = 2 ✓',
            hexaedro: 'V - A + F = 8 - 12 + 6 = 2 ✓',
            octaedro: 'V - A + F = 6 - 12 + 8 = 2 ✓',
            dodecaedro: 'V - A + F = 20 - 30 + 12 = 2 ✓',
            icosaedro: 'V - A + F = 12 - 30 + 20 = 2 ✓'
        };
        
        const equacao = equacoes[tipo] || '';
        loadingEquacao.innerHTML = '';
        loadingEquacao.style.opacity = '1';
        
        // Anima cada caractere aparecendo com velocidade ajustada
        equacao.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
            // Velocidade de escrita: 0.06s por caractere para sincronizar melhor
            span.style.animationDelay = `${index * 0.06}s`;
            loadingEquacao.appendChild(span);
        });
    }
    
    // Função para criar um sólido
    function criarSolidoLoading(tipo) {
        // Remove sólido anterior
        if (currentSolido) {
            loadingScene.remove(currentSolido);
            if (currentSolido.children) {
                currentSolido.children.forEach(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        }
        
        const dados = solidosPlatonicos[tipo];
        if (!dados) {
            console.error('Dados do sólido não encontrados:', tipo);
            return;
        }
        
        // Limpa equação anterior
        const loadingEquacao = document.getElementById('loadingEquacao');
        if (loadingEquacao) {
            loadingEquacao.innerHTML = '';
        }
        
        let geometry;
        
        switch(tipo) {
            case 'tetraedro':
                geometry = new THREE.TetrahedronGeometry(2);
                break;
            case 'hexaedro':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 'octaedro':
                geometry = new THREE.OctahedronGeometry(2);
                break;
            case 'dodecaedro':
                geometry = new THREE.DodecahedronGeometry(2);
                break;
            case 'icosaedro':
                geometry = new THREE.IcosahedronGeometry(2);
                break;
            default:
                return;
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: dados.cor,
            shininess: 100,
            specular: dados.cor,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: dados.corBorda,
            transparent: true,
            opacity: 0
        });
        const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);
        
        const mesh = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();
        group.add(mesh);
        group.add(edgesMesh);
        group.scale.set(0, 0, 0);
        
        loadingScene.add(group);
        currentSolido = group;
        
        // Anima entrada do sólido com easing suave
        gsap.to(group.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        });
        
        gsap.to(material, {
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        });
        
        gsap.to(edgesMaterial, {
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        });
        
        // Inicia escrita da equação sincronizada com a aparição do sólido
        // Começa quando o sólido está em ~40% da animação
        setTimeout(() => {
            escreverEquacao(tipo);
        }, 400);
    }
    
    // Função de animação
    function animate() {
        if (currentSolido) {
            currentSolido.rotation.y += 0.01;
            currentSolido.rotation.x += 0.005;
        }
        loadingRenderer.render(loadingScene, loadingCamera);
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
    
    // Função para mostrar próximo sólido
    function mostrarProximoSolido() {
        if (currentIndex >= solidos.length) {
            // Último sólido - mantém tamanho normal e mostra botão
            if (loadingButton) {
                loadingButton.classList.remove('hidden');
            }
            return;
        }
        
        const tipo = solidos[currentIndex];
        criarSolidoLoading(tipo);
        
        // Aguarda e mostra próximo - tempo suficiente para ver toda a equação incluindo o ✓
        // Cada equação tem aproximadamente 25-30 caracteres, com 0.06s por caractere = ~1.8s
        // Mais 0.5s para garantir que o ✓ seja visto = ~2.3s total
        const tempoEspera = 2300;
        
        setTimeout(() => {
            if (currentIndex < solidos.length - 1) {
                // Anima saída do sólido atual e limpa equação com transição suave
                const loadingEquacao = document.getElementById('loadingEquacao');
                if (loadingEquacao) {
                    gsap.to(loadingEquacao, {
                        opacity: 0,
                        duration: 0.4,
                        ease: "power2.in",
                        onComplete: () => {
                            loadingEquacao.innerHTML = '';
                            loadingEquacao.style.opacity = '1';
                        }
                    });
                }
                
                if (currentSolido) {
                    // Anima saída suave do sólido
                    gsap.to(currentSolido.scale, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.6,
                        ease: "power2.in",
                        onComplete: () => {
                            currentIndex++;
                            // Pequeno delay para garantir transição suave
                            setTimeout(() => {
                                mostrarProximoSolido();
                            }, 50);
                        }
                    });
                    
                    if (currentSolido.children[0] && currentSolido.children[0].material) {
                        gsap.to(currentSolido.children[0].material, {
                            opacity: 0,
                            duration: 0.6,
                            ease: "power2.in"
                        });
                    }
                    
                    if (currentSolido.children[1] && currentSolido.children[1].material) {
                        gsap.to(currentSolido.children[1].material, {
                            opacity: 0,
                            duration: 0.6,
                            ease: "power2.in"
                        });
                    }
                }
            } else {
                // Último sólido - mostra botão rapidamente
                currentIndex++;
                setTimeout(() => {
                    mostrarProximoSolido();
                }, 800);
            }
        }, tempoEspera);
    }
    
    // Inicia a sequência após o fade do background
    setTimeout(() => {
        mostrarProximoSolido();
    }, 1000);
    
    // Event listener do botão
    if (loadingButton) {
        loadingButton.addEventListener('click', () => {
            // Fade out do loading com transição suave
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 0.6,
                ease: "power3.in",
                onComplete: () => {
                    // Prepara o container antes de mostrar
                    if (container) {
                        container.classList.remove('hidden');
                        container.style.opacity = '0';
                        container.style.visibility = 'visible';
                    }
                    
                    // Adiciona classe loaded e remove loading
                    body.classList.add('loaded');
                    loadingScreen.classList.add('hidden');
                    
                    // Aguarda um frame para garantir que o DOM está atualizado
                    requestAnimationFrame(() => {
                        // Fade in do container com transição suave
                        if (container) {
                            gsap.fromTo(container, 
                                { opacity: 0, y: 30 },
                                { 
                                    opacity: 1, 
                                    y: 0,
                                    duration: 0.8,
                                    ease: "power3.out",
                                    delay: 0.1
                                }
                            );
                            
                            // Anima cards com stagger suave
                            setTimeout(() => {
                                gsap.from('.solido-card', {
                                    opacity: 0,
                                    x: -30,
                                    duration: 0.8,
                                    delay: 0.3,
                                    stagger: 0.15,
                                    ease: "power3.out"
                                });
                            }, 300);
                        }
                    });
                    
                    // Limpa recursos do loading
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                    }
                    if (currentSolido) {
                        loadingScene.remove(currentSolido);
                    }
                    if (loadingRenderer) {
                        loadingRenderer.dispose();
                    }
                }
            });
        });
    }
    
    // Redimensiona ao mudar tamanho da janela
    window.addEventListener('resize', () => {
        const newWidth = loadingCanvas.clientWidth || 600;
        const newHeight = loadingCanvas.clientHeight || 500;
        loadingCamera.aspect = newWidth / newHeight;
        loadingCamera.updateProjectionMatrix();
        loadingRenderer.setSize(newWidth, newHeight);
    });
}

// Event listeners - aguarda DOM estar pronto
function inicializarEventListeners() {
    // Event listeners para botões "Ver o Resultado"
    const btnVerResultado = document.querySelectorAll('.btn-ver-resultado');
    console.log('Botões encontrados:', btnVerResultado.length);
    
    btnVerResultado.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tipo = btn.getAttribute('data-tipo');
            console.log('Clicou no botão:', tipo);
            if (tipo) {
                mostrarVisualizacao(tipo, btn);
            } else {
                console.error('Tipo não encontrado no botão');
            }
        });
    });

    // Event listener para fechar
    const fecharBtn = document.getElementById('fecharVisualizacao');
    if (fecharBtn) {
        fecharBtn.addEventListener('click', fecharVisualizacao);
    } else {
        console.error('Botão fechar não encontrado');
    }

    // Fecha modal ao clicar no overlay
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                fecharVisualizacao();
            }
        });
    } else {
        console.error('Modal overlay não encontrado');
    }
}

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        inicializarLoading();
        inicializarEventListeners();
        inicializarCursor();
    });
} else {
    // DOM já está pronto
    inicializarLoading();
    inicializarEventListeners();
    inicializarCursor();
}

// As animações iniciais agora são controladas pela função inicializarLoading()

// Função para inicializar cursor personalizado com dodecaedro
function inicializarCursor() {
    const customCursor = document.getElementById('customCursor');
    const cursorCanvas = document.getElementById('cursorCanvas');
    
    if (!customCursor || !cursorCanvas) return;
    
    // Cria cena Three.js para o cursor
    const cursorScene = new THREE.Scene();
    cursorScene.background = null;
    
    const size = 50;
    const cursorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    cursorCamera.position.z = 3;
    
    const cursorRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        canvas: cursorCanvas,
        transparent: true
    });
    cursorRenderer.setSize(size, size);
    cursorRenderer.setClearColor(0x000000, 0);
    
    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    cursorScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(2, 2, 2);
    cursorScene.add(directionalLight);
    
    // Cria dodecaedro
    const geometry = new THREE.DodecahedronGeometry(0.8);
    const material = new THREE.MeshPhongMaterial({
        color: 0x4b0082, // Cor do cosmos (dodecaedro)
        shininess: 100,
        specular: 0x4b0082,
        transparent: true,
        opacity: 0.9
    });
    
    const edges = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0x2e0042,
        linewidth: 2
    });
    const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);
    
    const mesh = new THREE.Mesh(geometry, material);
    const dodecaedroGroup = new THREE.Group();
    dodecaedroGroup.add(mesh);
    dodecaedroGroup.add(edgesMesh);
    
    cursorScene.add(dodecaedroGroup);
    
    // Anima rotação
    function animateCursor() {
        dodecaedroGroup.rotation.y += 0.02;
        dodecaedroGroup.rotation.x += 0.01;
        cursorRenderer.render(cursorScene, cursorCamera);
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Move cursor com o mouse
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Suaviza movimento do cursor
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();
    
    // Mostra cursor apenas quando a página estiver carregada (após clicar em "Entrar")
    const body = document.body;
    const checkLoaded = setInterval(() => {
        if (body.classList.contains('loaded')) {
            customCursor.style.display = 'block';
            body.style.cursor = 'none'; // Esconde cursor padrão
            clearInterval(checkLoaded);
        }
    }, 100);
}
