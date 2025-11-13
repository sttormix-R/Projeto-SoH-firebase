document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogGrid = document.querySelector('.blog-grid');

    const loggedUser = getLoggedUserName(); // Usuário logado

    // Carregar posts do localStorage
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.forEach(postData => addPostToDOM(postData));

    // Filtragem
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            document.querySelectorAll('.blog-post').forEach(post => {
                const postCategory = post.getAttribute('data-category');
                if (filter === 'all' || filter === postCategory) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });

    // Form submission
    const postForm = document.querySelector('.post-form');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('post-title').value.trim();
            const category = document.getElementById('post-category').value;
            const content = document.getElementById('post-content').value.trim();
            const image = document.getElementById('post-image').value.trim();
            const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

            if (!title || !content) {
                showNotification('Preencha todos os campos obrigatórios!', 'error');
                return;
            }

            const newPost = { 
                id: Date.now(), 
                title, category, content, image, author: loggedUser, date, likes: 0, comments: 0, views: 0 
            };

            posts.unshift(newPost); // Adiciona no início do array
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            addPostToDOM(newPost);
            postForm.reset();
            showNotification('Postagem criada com sucesso!', 'success');
        });
    }

    // Adiciona um post ao DOM
    function addPostToDOM(postData) {
        const post = document.createElement('div');
        post.className = 'blog-post';
        post.setAttribute('data-category', postData.category);
        post.setAttribute('data-id', postData.id);
        post.innerHTML = `
            <div class="post-image">
                <img src="${postData.image || 'https://via.placeholder.com/400x250?text=Sem+Imagem'}" alt="${postData.title}">
            </div>
            <div class="post-content">
                <span class="post-category">${capitalize(postData.category)}</span>
                <h2>${postData.title}</h2>
                <p class="post-meta">Por ${postData.author} • ${postData.date}</p>
                <p class="post-excerpt">${postData.content.substring(0, 150)}...</p>
                <div class="post-stats">
                    <span class="like-btn"><i class="fas fa-heart"></i> ${postData.likes}</span>
                    <span><i class="fas fa-comment"></i> ${postData.comments}</span>
                    <span><i class="fas fa-eye"></i> ${postData.views}</span>
                </div>
                <a href="#" class="read-more">Ler Mais <i class="fas fa-arrow-right"></i></a>
                ${postData.author === loggedUser ? `
                    <div class="post-actions">
                        <button class="edit-post">Editar</button>
                        <button class="delete-post">Apagar</button>
                    </div>` : ''}
            </div>
        `;
        blogGrid.prepend(post);

        attachPostEvents(post, postData.id);
    }

    // Eventos do post
    function attachPostEvents(post, postId) {
        const likeBtn = post.querySelector('.like-btn');
        likeBtn.addEventListener('click', function() {
            let index = posts.findIndex(p => p.id === postId);
            posts[index].likes += 1;
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            this.innerHTML = `<i class="fas fa-heart"></i> ${posts[index].likes}`;
        });

        const readMore = post.querySelector('.read-more');
        readMore.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(post.querySelector('h2').textContent, post.querySelector('.post-content').innerHTML);
        });

        const deleteBtn = post.querySelector('.delete-post');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Deseja realmente apagar esta postagem?')) {
                    posts = posts.filter(p => p.id !== postId);
                    localStorage.setItem('blogPosts', JSON.stringify(posts));
                    post.remove();
                    showNotification('Postagem apagada!', 'success');
                }
            });
        }

        const editBtn = post.querySelector('.edit-post');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const index = posts.findIndex(p => p.id === postId);
                const p = posts[index];
                const newTitle = prompt('Editar título:', p.title) || p.title;
                const newContent = prompt('Editar conteúdo:', p.content) || p.content;
                const newImage = prompt('Editar URL da imagem:', p.image) || p.image;

                posts[index] = { ...p, title: newTitle, content: newContent, image: newImage };
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                post.querySelector('h2').textContent = newTitle;
                post.querySelector('.post-excerpt').textContent = newContent.substring(0,150) + '...';
                post.querySelector('.post-image img').src = newImage;
                showNotification('Postagem editada!', 'success');
            });
        }
    }

    // Modal
    function openModal(title, contentHTML) {
        let modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                ${contentHTML.replace(/<p class="post-excerpt">.*?<\/p>/, '')}
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type==='success'?'#2e7d32':type==='error'?'#c62828':'#1565c0'};
            color: white; padding: 1rem 1.5rem; border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 1000;
            display: flex; align-items: center; gap: 1rem;
        `;
        document.body.appendChild(notification);
        setTimeout(()=>notification.remove(), 5000);
    }

    function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
    function getLoggedUserName() { return 'Usuário Logado'; } // Substituir pelo login real
});


// Usuário logado (simulado)
const currentUser = "Usuário Logado";

// Função para adicionar botões e modal em todos os posts
function initializePosts() {
    const posts = document.querySelectorAll('.blog-post');
    const modal = document.querySelector('.post-modal') || createModal();
    const modalBody = modal.querySelector('.modal-body');

    posts.forEach(post => {
        const author = post.querySelector('.post-meta')?.textContent || "";
        if(author.includes(currentUser)) {
            // Adiciona botões só se ainda não existir
            if(!post.querySelector('.post-actions')) {
                const actions = document.createElement('div');
                actions.className = "post-actions";
                actions.innerHTML = `
                    <button class="edit-post"><i class="fas fa-pen"></i></button>
                    <button class="delete-post"><i class="fas fa-trash"></i></button>
                `;
                post.querySelector('.post-content').appendChild(actions);

                // Função apagar
                actions.querySelector('.delete-post').addEventListener('click', () => {
                    if(confirm("Deseja realmente apagar este post?")) {
                        post.remove();
                        alert("Post apagado!");
                    }
                });

                // Função editar
                actions.querySelector('.edit-post').addEventListener('click', () => {
                    const title = post.querySelector('h2');
                    const category = post.querySelector('.post-category');
                    const excerpt = post.querySelector('.post-excerpt');
                    const newTitle = prompt("Editar título:", title.textContent);
                    const newCategory = prompt("Editar categoria:", category.textContent);
                    const newContent = prompt("Editar conteúdo:", excerpt.textContent);
                    if(newTitle) title.textContent = newTitle;
                    if(newCategory) category.textContent = newCategory;
                    if(newContent) excerpt.textContent = newContent;
                });
            }
        }

        // Função ler mais / modal
        const readMore = post.querySelector('.read-more');
        if(readMore) {
            readMore.addEventListener('click', e => {
                e.preventDefault();
                const title = post.querySelector('h2').textContent;
                const authorMeta = post.querySelector('.post-meta').textContent;
                const content = post.querySelector('.post-excerpt').textContent;
                const imgSrc = post.querySelector('.post-image img')?.src || "";

                modalBody.innerHTML = `
                    <h2>${title}</h2>
                    <p class="post-meta">${authorMeta}</p>
                    ${imgSrc ? `<img src="${imgSrc}" alt="${title}" style="width:100%;border-radius:10px;margin:1rem 0;">` : ""}
                    <p>${content}</p>
                `;
                modal.classList.add('active');
            });
        }
    });

    // Fecha modal
    modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => {
        if(e.target === modal) modal.classList.remove('active');
    });
}

// Cria modal se não existir
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Chama a inicialização
initializePosts();
