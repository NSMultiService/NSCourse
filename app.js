const liste = document.getElementById("liste");
const itemInput = document.getElementById("article");
const addBtn = document.getElementById("ajouter");
const clearBtn = document.getElementById("clearBtn");

// --- Sauvegarde des articles (texte, état acheté, prix) ---
function sauvegarderArticles() {
  const articles = [...liste.children].map((li) => ({
    texte: li.querySelector("span").textContent.trim(),
    achete: li.classList.contains("achete"),
    prix: parseFloat(li.querySelector(".prix-input").value) || 0,
  }));
  localStorage.setItem("articles", JSON.stringify(articles));
}

// --- Total automatique (exclut les articles achetés) ---
function calculerTotal() {
  const totalEl = document.getElementById("total");
  if (!totalEl) return; // au cas où l'élément n'est pas encore ajouté
  const total = [...liste.children].reduce((sum, li) => {
    if (!li.classList.contains("achete")) {
      return sum + (parseFloat(li.querySelector(".prix-input").value) || 0);
    }
    return sum;
  }, 0);
  totalEl.textContent = total.toFixed(2);
}

// --- Ajouter un article (depuis saisie ou depuis localStorage) ---
function ajouterArticle(articleObj) {
  const fromStorage = typeof articleObj === "object" && articleObj !== null;
  const texte = fromStorage ? articleObj.texte || "" : itemInput.value.trim();
  const prixInitial =
    fromStorage && typeof articleObj.prix === "number" ? articleObj.prix : 0;
  const etatAchete = fromStorage ? !!articleObj.achete : false;

  if (texte === "") return;

  // Vérifie doublon uniquement pour ajout manuel (pas au chargement)
  if (
    !fromStorage &&
    [...liste.children].some(
      (li) => li.querySelector("span").textContent === texte
    )
  ) {
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
  if (etatAchete) li.classList.add("achete");

  const span = document.createElement("span");
  span.textContent = texte;

  // --- CHAMP PRIX (ajouté) ---
  const inputPrix = document.createElement("input");
  inputPrix.type = "number";
  inputPrix.min = "1";
  inputPrix.step = "0.1";
  inputPrix.value = prixInitial;
  inputPrix.className = "prix-input";
  inputPrix.addEventListener("input", () => {
    sauvegarderArticles();
    calculerTotal();
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  // Bouton marquer acheté / non
  const btnMarquer = document.createElement("button");
  btnMarquer.textContent = li.classList.contains("achete")
    ? "Non acheté"
    : "Acheté";
  btnMarquer.className = "mark-btn";
  btnMarquer.onclick = () => {
    li.classList.toggle("achete");
    btnMarquer.textContent = li.classList.contains("achete")
      ? "Non acheté"
      : "Acheté";
    sauvegarderArticles();
    calculerTotal(); // MAJ du total quand on achète/désachète
  };

  // Bouton supprimer
  const btnSupprimer = document.createElement("button");
  btnSupprimer.textContent = "Supp";
  btnSupprimer.className = "delete-btn";
  btnSupprimer.onclick = () => {
    li.remove();
    sauvegarderArticles();
    calculerTotal(); // MAJ du total quand on supprime
  };

  actions.appendChild(btnMarquer);
  actions.appendChild(btnSupprimer);

  li.appendChild(span);
  li.appendChild(inputPrix); // <-- on insère le champ prix juste après le nom
  li.appendChild(actions);

  liste.appendChild(li);
  itemInput.value = "";
  itemInput.focus();

  activerDragAndDrop();
  sauvegarderArticles();
  calculerTotal(); // MAJ du total à l'ajout
}

// --- Vider toute la liste ---
function viderListe() {
  liste.innerHTML = "";
  localStorage.removeItem("articles");
  calculerTotal(); // Total = 0.00
}

addBtn.addEventListener("click", () => {
  ajouterArticle();
});

// Touche Enter sou klavye (PC + mobile)
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    ajouterArticle();
  }
});

// Ajout avec Entrée
// itemInput.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") {
//     ajouterArticle();
//   }
// });

addBtn.addEventListener("click", ajouterArticle);
clearBtn.addEventListener("click", viderListe);

// --- Drag & Drop (on garde ta logique) ---
function activerDragAndDrop() {
  const items = liste.querySelectorAll("li");

  items.forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.outerHTML);
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      sauvegarderArticles();
      // Le total ne change pas avec l'ordre, mais on peut le recalculer sans risque :
      calculerTotal();
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
  const draggableElements = [
    ...container.querySelectorAll("li:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// --- Chargement au démarrage ---
function chargerArticles() {
  const articles = JSON.parse(localStorage.getItem("articles")) || [];
  articles.forEach((obj) => ajouterArticle(obj));
  calculerTotal();
}
chargerArticles();
