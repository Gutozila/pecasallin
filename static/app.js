const supabaseUrl = "https://zzfhuqwedpnnkuvnjrds.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Zmh1cXdlZHBubmt1dm5qcmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNzU0MTUsImV4cCI6MjA2MDg1MTQxNX0.Cc4RKGvE-sLGw-MjXYNKOgHwOO26g7IK_aIOqjMYZks";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("form");
const lista = document.getElementById("pecas");

async function carregarPecas() {
  const { data, error } = await supabase.from("pecas").select("*").order("id", { ascending: false });
  if (data) {
    lista.innerHTML = "";
    data.forEach(p => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<strong>${p.nome}</strong><br>${p.modelo} - ${p.cor}<br>${p.descricao || ""}`;
      lista.appendChild(div);
    });
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const obj = {};
  fd.forEach((v, k) => obj[k] = v);
  const { error } = await supabase.from("pecas").insert([obj]);
  if (!error) {
    form.reset();
    carregarPecas();
  }
};

carregarPecas();