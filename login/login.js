const demoAccounts = {
    Rimy:{user:"Rimy",pass:"r@yssa2811"},
    Morwen:{user:"Morwen",pass:"r@yssa2811"},
    Tristan:{user:"Tristan",pass:"r@yssa2811"},
    x:{user:"x",pass:"x"},
    y:{user:"y",pass:"y"}
};

function showToast(text,time=4200){
    const root = document.getElementById("toasts");
    if(!root) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    root.appendChild(el);
    requestAnimationFrame(()=>el.classList.add("show"));
    setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),320)},time);
}

function setAuth(user){localStorage.setItem("hb_auth",JSON.stringify({user,ts:Date.now()}))}
function clearAuth(){localStorage.removeItem("hb_auth")}

const form = document.getElementById("loginForm");
if(form){
    form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        const u = document.getElementById("char").value.trim();
        const p = document.getElementById("pass").value;

        try{
            const response = await new Promise((resolve)=>{
                setTimeout(()=>{
                    const match = Object.values(demoAccounts).find(a=>a.user===u && a.pass===p);
                    resolve({ok:!!match, user:u});
                },600);
            });
            if(response.ok){
                setAuth(response.user);
                showToast("Login bem-sucedido");
                setTimeout(()=>location.href="../index.html",800);
            } else showToast("Usuário ou senha inválidos");
        }catch(e){showToast("Erro de rede")}
    });
}

const demoTour = document.getElementById("demo-tour");
if(demoTour){
    demoTour.addEventListener("click",(e)=>{
        e.preventDefault();
        setAuth("Viajante");
        showToast("Entrando como convidado");
        setTimeout(()=>location.href="../index.html",700);
    });
}


