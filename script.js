const auth = JSON.parse(localStorage.getItem("hb_auth"));
if(!auth) location.href="login/login.html";

const welcomeMessage = document.getElementById('welcome-message');
const messages = [`Bem-vindo(a), ${auth.user}!`, "Explore masmorras épicas.", "Lute, conquiste, vença!", "Crie histórias inesquecíveis!"];
let messageIndex = 0;

function typeMessage(){
    if(messageIndex < messages.length){
        let message = messages[messageIndex];
        let i=0;
        welcomeMessage.textContent='';
        const typing = setInterval(()=>{
            if(i<message.length){
                welcomeMessage.textContent+=message.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                setTimeout(()=>{
                    messageIndex++;
                    if(messageIndex===messages.length) messageIndex=0;
                    typeMessage();
                },1800);
            }
        },80);
    }
}
typeMessage();

// Popups interativos
function showPopup(text,time=3500){
    const root = document.getElementById("popups");
    if(!root) return;
    const el = document.createElement("div");
    el.className="popup";
    el.textContent=text;
    root.appendChild(el);
    requestAnimationFrame(()=>el.classList.add("show"));
    setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),320)},time);
}

// Exemplo de popups aleatórios
const popMessages=[
    "Uma nova missão está disponível!",
    "Evento especial começará em 10 minutos!",
    "Não esqueça de visitar a taverna.",
    "Mercado aberto com itens raros!",
    "Convide seus amigos para jogar!",
    "Novo artigo no blog: Dicas para Mestres!",
    "Personagem da semana: Aelar, o Arqueiro Élfico",
    "Torneio do Campeão neste sábado!",
    "Galeria atualizada com novas artes!",
    "Sessão de criação de personagens na próxima semana!"
];
setInterval(()=>{
    const msg = popMessages[Math.floor(Math.random()*popMessages.length)];
    showPopup(msg,4000);
},7000);

// Botão de juntar-se à aventura
document.getElementById('join-btn').addEventListener('click', function() {
    showPopup("Redirecionando para a página de cadastro...", 2000);
    setTimeout(() => {
        // Aqui você pode redirecionar para a página de cadastro
        // window.location.href = "cadastro.html";
        showPopup("Funcionalidade de cadastro em desenvolvimento!", 3000);
    }, 2000);
});

// Botões de participar de eventos
document.querySelectorAll('.event-join').forEach(button => {
    button.addEventListener('click', function() {
        const eventName = this.closest('.event-card').querySelector('h3').textContent;
        showPopup(`Inscrição para "${eventName}" realizada com sucesso!`, 3000);
    });
});

// Smooth scrolling para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Destacar navegação ativa baseada na rolagem
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if(scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});