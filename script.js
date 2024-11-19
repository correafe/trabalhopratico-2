// Ação para o registro de novo usuário
document.getElementById('registerForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Cria o novo usuário
    const newUser = { name, email, password, role };

    // Adiciona o usuário ao localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));

    // Redireciona para a página de login após o registro
    window.location.href = "index.html";
});

// Ação de login
document.getElementById('login-form')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Pega os usuários registrados no localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = storedUsers.find(u => u.email === email && u.password === password);

    if (user) {
        // Verifica se o usuário é admin, sales_manager ou shipping_manager e redireciona para o dashboard
        if (user.role === 'admin' || user.role === 'sales_manager' || user.role === 'shipping_manager') {
            // Armazena o usuário no localStorage para a sessão
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            console.log("Usuário logado:", JSON.parse(localStorage.getItem('loggedInUser')));


            window.location.href = "dashboard.html";
        } else {
            displayError('Access denied. Only admins, sales managers, or shipping managers are allowed.');
        }
    } else {
        displayError('Incorrect email or password. Please try again.');
    }
});

// Função para exibir mensagens de erro
function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

if (window.location.pathname.includes("dashboard.html")) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser || !['admin', 'sales_manager', 'shipping_manager'].includes(loggedInUser.role)) {
        window.location.href = "index.html";
    } else {
        const usernameElement = document.getElementById('username');
        const userRoleElement = document.getElementById('userRole');

        // Verifique se os elementos existem
        if (usernameElement && userRoleElement) {
            usernameElement.textContent = loggedInUser.name || "Usuário";
            userRoleElement.textContent = loggedInUser.role || "Role";
            console.log("Mensagem de boas-vindas preenchida com sucesso.");
        } else {
            console.error("Elementos de boas-vindas não encontrados no HTML.");
        }
    }

    // Ação de logout
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = "index.html";
    });
}

// Variáveis para controle de produtos e paginação
const products = JSON.parse(localStorage.getItem('products')) || [];
const itemsPerPage = 10;
let currentPage = 1;
let currentSort = 'name';
let searchTerm = '';

// Renderização da lista de produtos com paginação, busca e ordenação
function renderProducts() {
    const filteredProducts = filterProducts(searchTerm);
    const sortedProducts = sortProducts(filteredProducts, currentSort);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('currentPage').textContent = currentPage;

    const start = (currentPage - 1) * itemsPerPage;
    const productsToShow = sortedProducts.slice(start, start + itemsPerPage);
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.mainImage || 'default-image.jpg'}" alt="${product.name}" style="width: 100px; height: 100px;"></td>
            <td>${product.name}</td>
            <td>${product.brand}</td>
            <td>${product.category}</td>
            <td>
                <button class="viewBtn" data-id="${product.id}">View</button>
                <button class="editBtn" data-id="${product.id}">Edit</button>
                <button class="deleteBtn" data-id="${product.id}">Delete</button>
            </td>`;
        productList.appendChild(row);
    });

    document.getElementById('paginationControls').style.display = products.length > itemsPerPage ? 'block' : 'none';
}

// Funções de busca e ordenação
function filterProducts(search) {
    return products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        product.fullDescription.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
    );
}

function sortProducts(products, criterion) {
    return products.sort((a, b) => a[criterion].localeCompare(b[criterion]));
}

// Eventos para controle de paginação e atualização da lista
document.getElementById('firstPageBtn').addEventListener('click', () => { currentPage = 1; renderProducts(); });
document.getElementById('prevPageBtn').addEventListener('click', () => { if (currentPage > 1) currentPage--; renderProducts(); });
document.getElementById('nextPageBtn').addEventListener('click', () => { 
    const totalPages = Math.ceil(filterProducts(searchTerm).length / itemsPerPage); 
    if (currentPage < totalPages) currentPage++; 
    renderProducts(); 
});
document.getElementById('lastPageBtn').addEventListener('click', () => { 
    currentPage = Math.ceil(filterProducts(searchTerm).length / itemsPerPage); 
    renderProducts(); 
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    currentPage = 1;
    renderProducts();
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
});

// Carregar produtos na inicialização
document.addEventListener('DOMContentLoaded', renderProducts);

// Evento para exclusão de produto
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const productId = event.target.getAttribute('data-id');
        const confirmation = confirm("Are you sure you want to delete this product?");
        if (confirmation) {
            const updatedProducts = products.filter(p => p.id !== parseInt(productId));
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            renderProducts(currentPage);
        }
    }
});

// Evento para adição de produto
document.getElementById('createProductForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const product = {
        id: Date.now(),
        name: document.getElementById('name').value,
        brand: document.getElementById('brand').value,
        category: document.getElementById('category').value,
        image: 'images/default.png', 
        enabled: document.getElementById('enabled').checked,
        inStock: document.getElementById('inStock').checked
    };
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    alert("Produto adicionado com sucesso!");
    window.location.href = 'dashboard.html';
});

