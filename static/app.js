document.addEventListener("DOMContentLoaded", async () => {
  const supabaseUrl = "https://zzfhuqwedpnnkuvnjrds.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Zmh1cXdlZHBubmt1dm5qcmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNzU0MTUsImV4cCI6MjA2MDg1MTQxNX0.Cc4RKGvE-sLGw-MjXYNKOgHwOO26g7IK_aIOqjMYZks";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const form = document.getElementById("form");
  const lista = document.getElementById("pecas");

  async function carregarPecas() {
    const { data } = await supabase.from("pecas").select("*").order("id", { ascending: false });
    lista.innerHTML = "";
    data.forEach(p => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<strong>${p.nome}</strong><br>${p.modelo} - ${p.cor}<br>${p.descricao || ""}`;
      if (p.imagem_url) div.innerHTML += `<br><img src="${p.imagem_url}">`;
      lista.appendChild(div);
    });
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const file = fd.get("imagem");
    let imagem_url = "";

    if (file && file.name) {
      const filename = Date.now() + "_" + file.name;
      await supabase.storage.from("imagens").upload(filename, file);
      const { data } = supabase.storage.from("imagens").getPublicUrl(filename);
      imagem_url = data.publicUrl;
    }

    const obj = {
      nome: fd.get("nome"),
      marca: fd.get("marca"),
      modelo: fd.get("modelo"),
      cor: fd.get("cor"),
      numero: fd.get("numero"),
      local: fd.get("local"),
      descricao: fd.get("descricao"),
      imagem_url: imagem_url
    };

    await supabase.from("pecas").insert([obj]);
    form.reset();
    carregarPecas();
  };

  carregarPecas();
});