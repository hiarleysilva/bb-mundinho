// ================= CONFIGURAÇÕES DA LOJA =================
const WHATSAPP_LOJA = "5561984978310"; 
const SENHA_ADMIN = "hakila";          

// Vetor para segurar as fotos do cadastro atual antes de enviar
let fotosCadastradas = ["", "", ""];

// Produtos Iniciais (Usam imagens padrão caso estejam vazios)
const produtosIniciais = [
    {
        id: 1,
        nome: "Body Ursinho Soft",
        preco: 49.90,
        categoria: "Bodies",
        tamanho: "M",
        condicao: "Novo",
        imagens: [] // Aceita até 3 imagens
    },
    {
        id: 2,
        nome: "Macacão Nuvenzinha",
        preco: 69.90,
        categoria: "Macacões",
        tamanho: "P",
        condicao: "Semi Novo",
        imagens: []
    }
];

if (!localStorage.getItem("bb_produtos")) {
    localStorage.setItem("bb_produtos", JSON.stringify(produtosIniciais));
}

let produtos = JSON.parse(localStorage.getItem("bb_produtos"));
let carrinho = [];

// Controle global do index do Slide atual exibido
let slideIndexAtual = 0;

// ================= RENDERIZAR O CATÁLOGO DA LOJA =================
function renderizarCatalogo(listaProdutos = produtos) {
    const grid = document.getElementById("produtos-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (listaProdutos.length === 0) {
        grid.innerHTML = "<p style='grid-column: span 4; text-align:center; padding: 40px; color: #999;'>Nenhuma roupinha disponível no momento. 🌸</p>";
        return;
    }

    listaProdutos.forEach(prod => {
        // Exibe a Foto 1 (Capa) ou o placeholder rosa
        const imgUrl = (prod.imagens && prod.imagens[0]) ? prod.imagens[0] : 'https://placehold.co/300x300/fff0f2/db7093?text=BB+Mundinho';
        
        grid.innerHTML += `
            <div class="produto-card" onclick="verDetalhesProduto(${prod.id})">
                <span class="produto-tag-condicao">${prod.condicao}</span>
                <img src="${imgUrl}" alt="${prod.nome}">
                <h3 class="produto-nome">${prod.nome}</h3>
                <p class="produto-detalhes">Tam: ${prod.tamanho} | ${prod.categoria}</p>
                <p class="produto-preco">R$ ${prod.preco.toFixed(2).replace('.', ',')}</p>
                <button class="btn-adicionar" onclick="event.stopPropagation(); adicionarAoCarrinho(${prod.id})">Adicionar</button>
            </div>
        `;
    });
}

function filtrarProdutos() {
    const cat = document.getElementById("filtro-categoria").value;
    const tam = document.getElementById("filtro-tamanho").value;

    let filtrados = produtos;
    if (cat !== "todos") filtrados = filtrados.filter(p => p.categoria === cat);
    if (tam !== "todos") filtrados = filtrados.filter(p => p.tamanho === tam);

    renderizarCatalogo(filtrados);
}

// ================= JANELA DE DETALHES + CARROSSEL (MELHORADO!) =================
function verDetalhesProduto(id) {
    const prod = produtos.find(p => p.id === id);
    if (!prod) return;

    // Garante que temos pelo menos uma imagem para exibir no carrossel
    let listaImagens = prod.imagens ? prod.imagens.filter(img => img !== "") : [];
    if (listaImagens.length === 0) {
        listaImagens.push('https://placehold.co/300x300/fff0f2/db7093?text=BB+Mundinho');
    }

    const conteudoDiv = document.getElementById("conteudo-detalhes-produto");
    slideIndexAtual = 0; // Reinicia na primeira foto

    // Monta a estrutura de blocos invisíveis das fotos
    let slidesHtml = "";
    listaImagens.forEach((img, i) => {
        slidesHtml += `
            <div class="carrossel-slide">
                <img src="${img}" alt="">
                <div class="carrossel-indicador">${i + 1} / ${listaImagens.length}</div>
            </div>
        `;
    });

    // Se tiver mais de uma imagem, adiciona os botões de seta (< e >)
    let botoesNavHtml = "";
    if (listaImagens.length > 1) {
        botoesNavHtml = `
            <button class="btn-carrossel-nav nav-esquerda" onclick="mudarSlide(-1)">❮</button>
            <button class="btn-carrossel-nav nav-direita" onclick="mudarSlide(1)">❯</button>
        `;
    }

    conteudoDiv.innerHTML = `
        <div class="detalhes-layout">
            <div class="carrossel-container">
                ${slidesHtml}
                ${botoesNavHtml}
            </div>
            <div class="detalhes-info">
                <h2>${prod.nome}</h2>
                <div class="preco">R$ ${prod.preco.toFixed(2).replace('.', ',')}</div>
                <p><strong>Tamanho:</strong> ${prod.tamanho}</p>
                <p><strong>Categoria:</strong> ${prod.categoria}</p>
                <p><strong>Condição:</strong> ${prod.condicao}</p>
                <button class="btn-finalizar" style="background-color: #ffb6c1; margin-top: 15px;" onclick="adicionarAoCarrinho(${prod.id}); fecharModalDetalhes();">
                    🛒 Colocar no Carrinho
                </button>
            </div>
        </div>
    `;
    
    document.getElementById("modal-detalhes").style.display = "block";
    mostrarSlide(slideIndexAtual);
}

function mostrarSlide(index) {
    const slides = document.getElementsByClassName("carrossel-slide");
    if (slides.length === 0) return;

    // Regra de loop (se passar da última vai para a primeira e vice-versa)
    if (index >= slides.length) slideIndexAtual = 0;
    if (index < 0) slideIndexAtual = slides.length - 1;

    // Esconde todos
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    // Exibe apenas o atual
    slides[slideIndexAtual].style.display = "block";
}

function mudarSlide(direcao) {
    slideIndexAtual += direcao;
    mostrarSlide(slideIndexAtual);
}

function fecharModalDetalhes() {
    document.getElementById("modal-detalhes").style.display = "none";
}

// ================= CONTROLE DO CARRINHO =================
function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        carrinho.push(produto);
        atualizarCarrinhoInterface();
        alert(`"${produto.nome}" foi para o carrinho! 🛒`);
    }
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoInterface();
}

function atualizarCarrinhoInterface() {
    const cont = document.getElementById("carrinho-contador");
    if (cont) cont.innerText = carrinho.length;

    const itensDiv = document.getElementById("itens-carrinho");
    const totalSpan = document.getElementById("valor-total");
    
    if (!itensDiv) return;

    itensDiv.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        itensDiv.innerHTML += `
            <div class="item-carrinho-linha">
                <div class="item-carrinho-info">
                    <h4>${item.nome}</h4>
                    <p>Tam: ${item.tamanho} | R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                </div>
                <button class="btn-remover-item" onclick="removerDoCarrinho(${index})">Remover</button>
            </div>
        `;
    });

    totalSpan.innerText = total.toFixed(2).replace('.', ',');
}

function abrirModalCarrinho() { document.getElementById("modal-carrinho").style.display = "block"; }
function fecharModalCarrinho() { document.getElementById("modal-carrinho").style.display = "none"; }

// ================= WHATSAPP INTEGRADO =================
function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        alert("Carrinho vazio! 😊");
        return;
    }

    let msg = "Olá, BB Mundinho! Quero fechar o pedido dessas roupas do site:\\n\\n";
    let total = 0;

    carrinho.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.nome}* (Tam: ${item.tamanho}) - R$ ${item.preco.toFixed(2).replace('.', ',')}\\n`;
        total += item.preco;
    });

    msg += `\\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\\n\\nComo faço o Pix?`;
    window.open(`https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ================= PAINEL DO ADMINISTRADOR MULTI-FOTOS =================
function abrirAdmin() {
    const tentativa = prompt("🔒 Digite a senha do administrador:");
    if (tentativa === SENHA_ADMIN) {
        document.getElementById("modal-admin").style.display = "block";
        renderizarListaExclusaoAdmin();
    } else if (tentativa !== null) {
        alert("❌ Senha incorreta!");
    }
}

function fecharAdmin() { document.getElementById("modal-admin").style.display = "none"; }

// Processa o upload de cada slot de foto individualmente
function processarFotoMultipla(input, slotNumero) {
    const statusSpan = document.getElementById(`foto-status-${slotNumero}`);
    if (input.files && input.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            fotosCadastradas[slotNumero - 1] = e.target.result; // Salva na posição correta (0, 1 ou 2)
            statusSpan.innerText = "📸 Foto Pronta!";
            statusSpan.style.color = "#4cd137";
        }
        leitor.readAsDataURL(input.files[0]);
    }
}

function cadastrarProduto(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const categoria = document.getElementById("categoria").value;
    const tamanho = document.getElementById("tamanho").value;
    const condicao = document.getElementById("condicao").value;

    if (!categoria || !tamanho) {
        alert("Por favor, preencha Categoria e Tamanho!");
        return;
    }

    // Filtra para remover slots vazios caso você só coloque 1 ou 2 fotos
    const listaImagensSalvar = fotosCadastradas.filter(img => img !== "");

    const novo = {
        id: Date.now(),
        nome,
        preco,
        categoria,
        tamanho,
        condicao,
        imagens: listaImagensSalvar // Guarda o arranjo com as fotos carregadas
    };

    produtos.push(novo);
    localStorage.setItem("bb_produtos", JSON.stringify(produtos));

    // Reseta o formulário e as memórias temporárias
    document.getElementById("form-produto").reset();
    fotosCadastradas = ["", "", ""];
    
    for (let i = 1; i <= 3; i++) {
        const st = document.getElementById(`foto-status-${i}`);
        st.innerText = "Nenhuma foto";
        st.style.color = "#888";
    }

    renderizarListaExclusaoAdmin();
    renderizarCatalogo();
    alert("Peça adicionada ao catálogo com sucesso! 🎉");
}

function excluirProduto(id) {
    if (confirm("Apagar essa peça permanentemente?")) {
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem("bb_produtos", JSON.stringify(produtos));
        renderizarListaExclusaoAdmin();
        renderizarCatalogo();
    }
}

function renderizarListaExclusaoAdmin() {
    const listaDiv = document.getElementById("admin-produtos-lista");
    if (!listaDiv) return;
    listaDiv.innerHTML = "";

    produtos.forEach(prod => {
        listaDiv.innerHTML += `
            <div class="admin-linha-item">
                <div><strong>${prod.nome}</strong> (Tam: ${prod.tamanho})</div>
                <button class="btn-excluir-peca" onclick="excluirProduto(${prod.id})">Excluir ❌</button>
            </div>
        `;
    });
}

// Fechar ao clicar fora
window.onclick = function(event) {
    const modCarrinho = document.getElementById("modal-carrinho");
    const modAdmin = document.getElementById("modal-admin");
    const modDetalhes = document.getElementById("modal-detalhes");
    if (event.target == modCarrinho) modCarrinho.style.display = "none";
    if (event.target == modAdmin) modAdmin.style.display = "none";
    if (event.target == modDetalhes) modDetalhes.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarCatalogo();
    atualizarCarrinhoInterface();
});
