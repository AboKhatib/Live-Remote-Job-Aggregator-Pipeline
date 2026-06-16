const CSV_URL = "https://docs.google.com/spreadsheets/d/YOUR_ID/pub?output=csv";

const FILTERS = {
  js: ["javascript","node","react","vue","typescript"],
  python: ["python","django","fastapi"],
  devops: ["docker","kubernetes","aws","devops"],
  ai: ["ai","ml","llm","pytorch","tensorflow"],
  backend: ["backend","java","go","node","php"]
};

let ALL_JOBS = [];
let activeFilter = "all";
let searchQuery = "";

const el = (id)=>document.getElementById(id);

function matches(job, filter){
  if(filter==="all") return true;
  const hay = (job.title+" "+job.tags+" "+job.description).toLowerCase();
  return (FILTERS[filter]||[]).some(k=>hay.includes(k));
}

function searchMatch(job, q){
  if(!q) return true;
  const hay = (job.title+" "+job.company+" "+job.tags).toLowerCase();
  return q.toLowerCase().split(" ").every(w=>hay.includes(w));
}

function parseCSV(text){
  const lines = text.split("\n").filter(Boolean);
  const headers = lines[0].split(",");

  return lines.slice(1).map(line=>{
    const cols = line.split(",");
    let obj = {};
    headers.forEach((h,i)=>obj[h.trim()] = cols[i]);
    return {
      title: obj.title,
      company: obj.company,
      location: obj.location,
      tags: obj.tags,
      description: obj.description,
      url: obj.url
    };
  });
}

function render(){
  const list = el("jobList");
  list.innerHTML = "";

  let jobs = ALL_JOBS
    .filter(j=>matches(j,activeFilter))
    .filter(j=>searchMatch(j,searchQuery));

  el("feedTitle").innerText = `${jobs.length} Jobs`;

  jobs.forEach(job=>{
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="title">${job.title}</div>
      <div class="meta">${job.company || ""} • ${job.location || "Remote"}</div>
      <div class="desc">${job.description || ""}</div>
    `;

    card.onclick = ()=> window.open(job.url, "_blank");
    list.appendChild(card);
  });
}

async function load(){
  try{
    const res = await fetch(CSV_URL);
    const text = await res.text();
    ALL_JOBS = parseCSV(text);
    render();
  } catch(e){
    console.error(e);
  }
}

/* EVENTS */
document.addEventListener("DOMContentLoaded", ()=>{
  load();

  el("searchInput").addEventListener("input", (e)=>{
    searchQuery = e.target.value;
    render();
  });

  document.querySelectorAll(".chip").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll(".chip").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render();
    };
  });
});