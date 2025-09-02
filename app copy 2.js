const liste = document.getElementById("liste");
const itemInput = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");

// --- Fonction pour sauvegarder les articles ---
function sauvegarderArticles() {
  const articles = [...liste.children].map(li => ({
    texte: li.querySelector("span").textContent.trim(),
    achete: li.classList.contains("achete")
  }));
  localStorage.setItem("articles", JSON.stringify(articles));
}

// --- Ajouter un article ---
function ajouterArticle(articleObj) {
  const texte = articleObj?.texte || itemInput.value.trim();
  if (texte === "") return;

  // Vérifie si l'article existe déjà
  if ([...liste.children].some(li => li.querySelector("span").textContent === texte)) {
    let erreurBox = document.getElementById("erreurBox");
    if (!erreurBox) {
      erreurBox = document.createElement("div");
      erreurBox.id = "erreurBox";
      document.body.appendChild(erreurBox);
    }

    erreurBox.textContent = "Cet article existe déjà !";
    erreurBox.style.display = "block";

    setTimeout(() => {
      erreurBox.style.display = "none";
      erreurBox.textContent = "";
    }, 5000);

    return;
  }

  const li = document.createElement("li");
  li.draggable = true;

  if (articleObj?.achete) li.classList.add("achete");

  const span = document.createElement("span");
  span.textContent = texte;

  const actions = document.createElement("div");
  actions.className = "actions";

  // Bouton marquer acheté / non
  const btnMarquer = document.createElement("button");
  btnMarquer.textContent = li.classList.contains("achete") ? "Non acheté" : "Acheté";
  btnMarquer.className = "mark-btn";
  btnMarquer.onclick = () => {
    li.classList.toggle("achete");
    btnMarquer.textContent = li.classList.contains("achete") ? "Non acheté" : "Acheté";
    sauvegarderArticles();
  };

  // Bouton supprimer
  const btnSupprimer = document.createElement("button");
  btnSupprimer.textContent = "Supp";
  btnSupprimer.className = "delete-btn";
  btnSupprimer.onclick = () => {
    li.remove();
    sauvegarderArticles();
  };

  actions.appendChild(btnMarquer);
  actions.appendChild(btnSupprimer);

  li.appendChild(span);
  li.appendChild(actions);

  liste.appendChild(li);
  itemInput.value = "";
  itemInput.focus();

  activerDragAndDrop();
  sauvegarderArticles();
}

// --- Vider toute la liste ---
function viderListe() {
  liste.innerHTML = "";
  localStorage.removeItem("articles");
}

// --- Ajout avec Entrée ---
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") ajouterArticle();
});

addBtn.addEventListener("click", ajouterArticle);
clearBtn.addEventListener("click", viderListe);

// --- Drag & Drop ---
function activerDragAndDrop() {
  const items = liste.querySelectorAll("li");

  items.forEach(item => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.outerHTML);
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      sauvegarderArticles();
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

// --- Charger les articles depuis localStorage ---
function chargerArticles() {
  const articles = JSON.parse(localStorage.getItem("articles")) || [];
  articles.forEach(article => ajouterArticle(article));
}

// Exécution au démarrage
chargerArticles();
