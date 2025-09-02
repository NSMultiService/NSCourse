
    const liste = document.getElementById("liste");
    const itemInput = document.getElementById("itemInput");
    const addBtn = document.getElementById("addBtn");
    const clearBtn = document.getElementById("clearBtn");
   

    // Ajouter un article
    function ajouterArticle() {
      const texte = itemInput.value.trim();
      if (texte === "") return;

      const li = document.createElement("li");
      li.draggable = true; // rendre l'élément déplaçable

      const span = document.createElement("span");
      span.textContent = texte;

      const actions = document.createElement("div");
      actions.className = "actions";

      // Bouton marquer acheté / non
      const btnMarquer = document.createElement("button");
      btnMarquer.textContent = "Acheté";
      btnMarquer.className = "mark-btn";
      btnMarquer.onclick = () => {
        li.classList.toggle("achete");
        if (li.classList.contains("achete")) {
          btnMarquer.textContent = "Non acheté"; // revenir non acheté
        } else {
          btnMarquer.textContent = "Acheté"; // marquer acheté
        }
      };



// Vérifie si l'article existe déjà
if ([...liste.children].some(li => li.textContent.includes(texte))) {
    // Récupère ou crée la boîte d’erreur
    let erreurBox = document.getElementById("erreurBox");
    if (!erreurBox) {
      erreurBox = document.createElement("div");
      erreurBox.id = "erreurBox";
      document.body.appendChild(erreurBox);
    }
  
    // Affiche le message
    erreurBox.textContent = "Cet article existe déjà !";
    erreurBox.style.display = "block";
  
    // Le fait disparaître au bout de 5s
    setTimeout(() => {
      erreurBox.style.display = "none";
      erreurBox.textContent = "";
    }, 5000);
  
    return;
  }
  

      // Bouton supprimer
      const btnSupprimer = document.createElement("button");
      btnSupprimer.textContent = "Supp";
      btnSupprimer.className = "delete-btn";
      btnSupprimer.onclick = () => li.remove();
      
      sauvegarderArticles();

      actions.appendChild(btnMarquer);
      actions.appendChild(btnSupprimer);

      li.appendChild(span);
      li.appendChild(actions);

      liste.appendChild(li);
      itemInput.value = "";
      itemInput.focus();

      activerDragAndDrop();

    }


// Sauvegarde dans localStorage
function sauvegarderArticles() {
    const articles = [...liste.children].map(li => li.textContent.replace("Supp", "").trim());
    localStorage.setItem("articles", JSON.stringify(articles));
  }

    // Vider toute la liste
    function viderListe() {
      liste.innerHTML = "";
    }

    // Ajout avec Entrée
    itemInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        ajouterArticle();
      }
    });

    addBtn.addEventListener("click", ajouterArticle);
    clearBtn.addEventListener("click", viderListe);

    // Fonction pour activer drag & drop
    function activerDragAndDrop() {
      const items = liste.querySelectorAll("li");

      items.forEach(item => {
        item.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", item.outerHTML);
          item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
          item.classList.remove("dragging");
        });
      });

      liste.addEventListener("dragover", (e) => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(liste, e.clientY);
        if (afterElement == null) {
          liste.appendChild(dragging);
        } else {
          liste.insertBefore(dragging, afterElement);
        }
      });
    }

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  



    // Chargement au démarrage
function chargerArticles() {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    articles.forEach(ajouterArticle);
  }
  
  chargerArticles(); // Exécuté au démarrage