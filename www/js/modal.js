const modal = document.querySelector('.modaloverlay_escondido') // seleciona a classe que controla a visibilidade do modal
function abrirModal(){
    modal.classList.remove('modaloverlay_escondido');
    modal.classList.add('modaloverlay');
    
}

function fecharModal(){
    modal.classList.add('modaloverlay_escondido');

}


