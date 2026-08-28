// --- i18n --------------------------------------------------------------
// EN -> PT-BR dictionary for every UI string built in JS (chart titles,
// field labels, empty states, etc). Static HTML text is translated via
// data-pt attributes instead (see applyStaticTranslations below).
const DICT_PT = {
  "Country": "País",
  "Region": "Região",
  "Producer": "Produtor",
  "Vintage": "Safra",
  "Varietal": "Variedade",
  "Winemaking": "Vinificação",
  "Type": "Tipo",
  "Cellaring": "Guarda",
  "ABV": "Teor alcoólico",
  "Serving temp": "Temperatura de serviço",
  "Food pairing": "Harmonização",
  "Date logged": "Data registrada",
  "Reference": "Referência",
  "Location": "Localização",
  "Visited": "Visitado em",
  "Rating": "Nota",
  "Books": "Livros",
  "Serves": "Serve",
  "Prep": "Preparo",
  "Cook": "Cozimento",
  "Tips": "Dicas",
  "Ingredients": "Ingredientes",
  "Wine pairing": "Harmonização com vinho",
  "Learn more": "Saiba mais",
  "Not yet rated": "Ainda não avaliado",
  "Low": "Baixa",
  "Average": "Média",
  "Great": "Ótima",
  "Exceptional": "Excepcional",
  "Wines by Country": "Vinhos por país",
  "Wines by Winery": "Vinhos por vinícola",
  "Wines by Type": "Vinhos por tipo",
  "Wines by Origin": "Vinhos por origem",
  "wines": "vinhos",
  "White": "Branco",
  "Orange": "Laranja",
  "Rosé": "Rosé",
  "Red": "Tinto",
  "Sparkling": "Espumante",
  "Dessert": "Sobremesa",
  "Old World": "Velho Mundo",
  "New World": "Novo Mundo",
  "Nothing here yet.": "Nada por aqui ainda.",
  "No wines match these filters.": "Nenhum vinho corresponde a esses filtros.",
  "No wine bars pinned yet.": "Nenhum wine bar marcado ainda.",
  "Could not load data. If you're viewing this via file://, try running a local server (e.g. <code>python3 -m http.server</code>) instead.":
    "Não foi possível carregar os dados. Se você está vendo isso via file://, tente rodar um servidor local (ex.: <code>python3 -m http.server</code>).",
  "Open in Google Maps": "Abrir no Google Maps",
  "channel": "canal",
  "Link": "Link",
  "Wine Pantry (a personal project)": "Wine Pantry (um projeto pessoal)"
};

// English step labels (JSON `label` fields) -> PT-BR, since the label
// text lives in data/boards.json and data/cookbook.json and isn't worth
// duplicating per-locale there for a handful of one/two-word phrases.
const STEP_LABEL_DICT_PT = {
  "prep": "preparo",
  "assemble": "montar",
  "arrange": "arrumar",
  "slice": "fatiar",
  "chop": "picar",
  "season": "temperar",
  "marinate": "marinar",
  "cook": "cozinhar",
  "bake": "assar",
  "grill": "grelhar",
  "boil": "ferver",
  "reduce": "reduzir",
  "toss": "misturar",
  "rest": "descansar",
  "plate": "empratar",
  "garnish": "finalizar",
  "serve": "servir"
};

function getLang() {
  return localStorage.getItem("lang") === "pt" ? "pt" : "en";
}

// Translates a literal EN string built in JS via DICT_PT. Falls back to
// the original string when there's no PT-BR entry or the site is in EN.
function t(str) {
  if (getLang() !== "pt") return str;
  return DICT_PT[str] || str;
}

// Translates a JSON item's recipe-step `label` field.
function tLabel(label) {
  if (getLang() !== "pt") return label;
  return STEP_LABEL_DICT_PT[label] || label;
}

// Picks between an EN string and its PT-BR counterpart directly (for
// nested/array JSON shapes where the `<field>_pt` sibling convention on
// the item itself doesn't apply, e.g. a parallel translated array).
function tPick(en, pt) {
  return getLang() === "pt" && pt ? pt : en;
}

// Reads a JSON item's field, preferring the `<field>_pt` sibling when the
// site is in PT-BR and that sibling exists (falls back to the EN value
// otherwise — not every field has a translation, e.g. proper nouns).
function tf(item, field) {
  if (getLang() === "pt" && item[field + "_pt"] !== undefined) {
    return item[field + "_pt"];
  }
  return item[field];
}

// Swaps every element carrying a data-pt attribute between its English
// text (cached into data-en on first run) and its PT-BR text.
function applyStaticTranslations() {
  const lang = getLang();
  document.querySelectorAll("[data-pt]").forEach((el) => {
    if (!el.dataset.en) el.dataset.en = el.innerHTML;
    el.innerHTML = lang === "pt" ? el.dataset.pt : el.dataset.en;
  });
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyStaticTranslations();
  document.dispatchEvent(new CustomEvent("langchange"));
}

// Marks the nav link matching the current page as active, wires up the
// mobile hamburger toggle, and wires up the EN / PT-BR language toggle.
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.site-nav a").forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  applyStaticTranslations();
});

// Fetches a JSON data file and renders each item into a container using templateFn.
// Shows a friendly empty state if there's no data yet, or an error hint if the
// fetch fails (common when opening the site directly via file:// instead of a local server).
function loadAndRender(jsonPath, containerId, templateFn) {
  const container = document.getElementById(containerId);
  const render = () =>
    fetch(jsonPath)
      .then((res) => res.json())
      .then((items) => {
        if (!items.length) {
          container.innerHTML = `<p class="empty-state">${t("Nothing here yet.")}</p>`;
          return;
        }
        container.innerHTML = items.map(templateFn).join("");
      })
      .catch((err) => {
        console.error("Failed to load", jsonPath, err);
        container.innerHTML = `<p class="empty-state">${t("Could not load data. If you're viewing this via file://, try running a local server (e.g. <code>python3 -m http.server</code>) instead.")}</p>`;
      });
  render();
  document.addEventListener("langchange", render);
}
