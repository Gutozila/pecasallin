
from flask import Flask, render_template, request, redirect, url_for, send_file
import sqlite3, os, qrcode
from werkzeug.utils import secure_filename
from io import BytesIO

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def init_db():
    with sqlite3.connect("estoque.db") as con:
        con.execute("""CREATE TABLE IF NOT EXISTS pecas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT, marca TEXT, modelo TEXT, cor TEXT,
            numero TEXT, local TEXT, imagem TEXT
        )""")

@app.route("/", methods=["GET", "POST"])
def index():
    con = sqlite3.connect("estoque.db")
    cur = con.cursor()
    if request.method == "POST":
        dados = {k: request.form[k] for k in ("nome", "marca", "modelo", "cor", "numero", "local")}
        imagem = request.files.get("imagem")
        filename = None
        if imagem:
            filename = secure_filename(imagem.filename)
            imagem.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        cur.execute("INSERT INTO pecas (nome, marca, modelo, cor, numero, local, imagem) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (*dados.values(), filename))
        con.commit()
        return redirect("/")
    termo = request.args.get("busca", "")
    cur.execute("SELECT * FROM pecas WHERE modelo LIKE ?", ('%' + termo + '%',))
    pecas = cur.fetchall()
    return render_template("index.html", pecas=pecas, busca=termo)

@app.route("/ver/<int:pid>")
def ver(pid):
    con = sqlite3.connect("estoque.db")
    peca = con.execute("SELECT * FROM pecas WHERE id = ?", (pid,)).fetchone()
    return render_template("ver.html", peca=peca)

@app.route("/remover/<int:pid>")
def remover(pid):
    con = sqlite3.connect("estoque.db")
    con.execute("DELETE FROM pecas WHERE id = ?", (pid,))
    con.commit()
    return redirect("/")

@app.route("/qrcode/<int:pid>")
def gerar_qrcode(pid):
    url = url_for("ver", pid=pid, _external=True)
    img = qrcode.make(url)
    buf = BytesIO()
    img.save(buf)
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
