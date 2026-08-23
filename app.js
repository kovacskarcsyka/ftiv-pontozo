let versenyLezarva = false;
let versenyBeallitas = null;
let aktualisEdzesNev = "";
let aktualisCel = 0;
let aktualisVersenyzo = 0;
let aktualisMod = "verseny";
let versenyzok = [];
let adminKoppintas = 0;
const ADMIN_JELSZO = "11MaCika11";
const tesztVerseny = {

    nev: "Golden Hawk Cup 2026",

    leiras: `
        <p>Teszt versenykiírás.</p>
        <p>Helyszín: Füzesgyarmat</p>
        <p>Dátum: 2026.09.12.</p>
    `,

    korosztalyok: [
        "Gyerek",
        "Ifjúsági",
        "Felnőtt",
        "Veterán"
    ],

    kategoriak: [
        "Vadászreflex",
        "Barebow",
        "Csigás",
        "Longbow"
    ]

};
async function versenyBetoltese() {

    const response = await fetch("verseny.json");

    versenyBeallitas = await response.json();

    document.getElementById("versenyNev").innerText =
        versenyBeallitas.versenyNev;

    rajzolCelFejlec();
}

function nevKinyeres(szoveg) {

    if (szoveg.includes("Nev:")) {

        return szoveg
            .split("Nev:")[1]
            .trim();
    }

    const sorok = szoveg.split("\n");

    const nevSor =
        sorok.find(
            s => s.startsWith("Név:")
        );

    if (!nevSor) {
        return szoveg;
    }

    return nevSor
        .replace("Név:", "")
        .trim();
}

function pontErtekek() {

    return versenyBeallitas.pontok;

}
function osszesQrNyomtatas() {

    console.log(aktualisVerseny);

    let ablak = window.open("", "_blank");

    let html = `
    <html>
    <head>
        <title>QR Nyomtatás</title>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

    </head>
    <body>
`;

    aktualisVerseny.nevezok.forEach(n => {

        html += `
    <div style="
        border:1px solid black;
        padding:10px;
        margin:10px;
        display:inline-block;
        width:300px;
        text-align:center;
    ">
        <h2>${n.nev}</h2>

        <div id="qr_${n.id}"></div>

        <p>
${n.id}<br>
${n.nev}<br>
${n.nem}<br>
${n.korosztaly}<br>
${n.kategoria}<br>
${n.egyesulet}
</p>
    </div>
`;

    });

   html += `

<script>

window.onload = function() {

`;

aktualisVerseny.nevezok.forEach(n => {

    html += `
console.log("QR:", "FTIV: ${n.id}");

    new QRCode(
        document.getElementById("qr_${n.id}"),
        {
     text: "${n.id}",
        }
    );

    `;

});

html += `

};

</script>

</body>
</html>

`;

    ablak.document.write(html);
    ablak.document.close();

}
function onScanSuccess(decodedText) {
console.log(decodedText);
    let marVan =
        versenyzok.find(
            v => v.qr === decodedText
        );

    if (marVan) {
        return;
    }

  let nev = decodedText;
let ftiv = decodedText;

let versenyek =
    JSON.parse(
        localStorage.getItem("versenyek") || "[]"
    );

versenyek.forEach(v => {

    if (v.nevezok) {

        v.nevezok.forEach(n => {

            if (n.id == decodedText) {

                nev = n.nev;
                ftiv = n.id;

            }

        });

    }

});

versenyzok.push({

    id: Date.now() + Math.random(),

    qr: decodedText,

    ftiv: ftiv,

    nev: nev,

    celok: []

});

    frissitBeolvasottLista();
}

function frissitBeolvasottLista() {

    const lista =
        document.getElementById("lista");

    lista.innerHTML = "";

    versenyzok.forEach(v => {

        lista.innerHTML += `
            <div>
                ${v.nev}
            </div>
        `;
    });
}

function pontozasInditas() {

    if (versenyzok.length === 0) {

        alert("Nincs versenyző beolvasva!");

        return;

    }
console.log("ELREJTEM A QRMOD-OT");

document.getElementById("qrMod").style.display = "none";
document.getElementById("pontozoMod").style.display = "block";
    document.getElementById("qrMod").style.display = "none";

    document.getElementById("pontozoMod").style.display = "block";

    rajzol();
}

function pontHozzaadas(pont) {

    if (versenyLezarva) {

        alert("A verseny már le van zárva!");

        return;

    }

    let v =
        versenyzok[aktualisVersenyzo];

    if (!v.celok[aktualisCel]) {

        v.celok[aktualisCel] = [];

    }


    let lovesek =
        v.celok[aktualisCel];

    if (
        lovesek.length >=
        versenyBeallitas.lovesekCelonkent
    ) {

        return;
    }

    lovesek.push(pont);

localStorage.setItem(
    "folyamatbanLevoPontozas",
    JSON.stringify({
        aktualisCel,
        aktualisVersenyzo,
        aktualisMod,
        versenyzok
    })
);

rajzol();
}

function lovesVisszavonas() {

    if (versenyLezarva) {

        alert("A verseny már le van zárva!");

        return;

    }

    let v =
        versenyzok[aktualisVersenyzo];

    if (!v) return;

    if (!v.celok[aktualisCel]) return;

    if (v.celok[aktualisCel].length === 0) return;

    v.celok[aktualisCel].pop();

    rajzol();

}

function elozoVersenyzo() {

    if (aktualisVersenyzo > 0) {

        aktualisVersenyzo--;

        rajzol();
    }

}

function kovetkezoVersenyzo() {

    let v =
        versenyzok[aktualisVersenyzo];

    let lovesek =
        v.celok[aktualisCel] || [];

    if (
        lovesek.length <
        versenyBeallitas.lovesekCelonkent
    ) {

        alert("Nincs meg minden lövés!");

        return;
    }

    if (
        aktualisVersenyzo <
        versenyzok.length - 1
    ) {

        aktualisVersenyzo++;

        rajzol();
    }

}

function elozoCel() {

    if (aktualisCel > 0) {

        aktualisCel--;

        aktualisVersenyzo = 0;

        rajzol();
    }

}

function kovetkezoCel() {

    for (let v of versenyzok) {

        let lovesek =
            v.celok[aktualisCel] || [];

        if (
            lovesek.length <
            versenyBeallitas.lovesekCelonkent
        ) {

            alert(
                "Nincs minden versenyzőnél kitöltve!"
            );

            return;
        }
    }

    if (
        aktualisCel + 1 >=
        versenyBeallitas.celokSzama
    ) {

        alert("A verseny véget ért!");

        return;
    }

    aktualisCel++;

    aktualisVersenyzo = 0;

    rajzol();
}
 function mezoKinyeres(szoveg, mezoNev) {

    let sorok =
        szoveg.split("\n");

    let sor =
        sorok.find(
            s => s.startsWith(mezoNev + ":")
        );

    if (!sor) return "";

    return sor
        .split(":")[1]
        .trim();

}
function qrGeneralas() {

    alert("UJ QR GENERALAS");

    let hely =
        document.getElementById(
            "qrEredmeny"
        );

    hely.innerHTML = "";

    let csapatQr = "";

    versenyzok.forEach(v => {

        let korosztaly =
    mezoKinyeres(v.qr, "Korosztály");

let korKod =
    korosztaly.match(/\d+\-\d+|\d+\+/);

korKod =
    korKod
        ? korKod[0]
        : korosztaly;

csapatQr +=

    v.ftiv

    + "|"

    + osszPont(v)

    + ";";

    });

    console.log("CSAPAT QR:");
    console.log(csapatQr);

    console.log("CSAPAT HOSSZ:");
    console.log(csapatQr.length);
hely.innerHTML = "";

let blokk =
    document.createElement("div");

blokk.style.textAlign = "center";

blokk.innerHTML = `
    <h2>Csapat eredménye</h2>
    <div id="csapatQr"></div>
`;

hely.appendChild(blokk);
let qrElem =
    document.getElementById("csapatQr");

qrElem.innerHTML = "";

new QRCode(
    qrElem,
    {
        text: csapatQr,
        width: 350,
        height: 350,
        correctLevel: QRCode.CorrectLevel.L
    }
);

}  
function versenyLezarasa() {

    for (let v of versenyzok) {

        for (
            let cel = 0;
            cel < versenyBeallitas.celokSzama;
            cel++
        ) {

            let lovesek =
                v.celok[cel] || [];

            if (
                lovesek.length <
                versenyBeallitas.lovesekCelonkent
            ) {

                alert(
                    v.nev +
                    "\n\n" +
                    (cel + 1) +
                    ". célpont hiányos!"
                );

                return;
            }
        }
        }

    if (
        !confirm(
            "Biztosan le szeretnéd zárni a versenyt?"
        )
    ) {

        return;

    }

    versenyLezarva = true;

    localStorage.removeItem(
    "folyamatbanLevoPontozas"
);
if (aktualisMod == "verseny") {

    alert(
        "A verseny sikeresen lezárva!"
    );

    qrGeneralas();

}
else {

    edzesMentese();

}

}

function osszPont(v) {

    let ossz = 0;

    v.celok.forEach(cel => {

        if (!cel) return;

        cel.forEach(p => {

            ossz += p;

        });

    });

    return ossz;
}

function statisztika(v) {
    return {};
}

function rajzolCelFejlec() {

    let fejlec =
        document.getElementById("celNavigacio");

    fejlec.innerHTML = `

        <button onclick="elozoCel()">
            ◀
        </button>

        <div class="celFejlec">

            ${aktualisCel + 1}. Célpont
            (${aktualisCel + 1}/${versenyBeallitas.celokSzama})

        </div>

        <button onclick="kovetkezoCel()">
            ▶
        </button>

    `;
}

function rajzol() {

    rajzolCelFejlec();

    const tabok =
        document.getElementById("versenyzoTabok");

    tabok.innerHTML = "";

    let aktualisV =
    versenyzok[aktualisVersenyzo];

let rovid =
    aktualisV.nev
        .split(" ")
        .map(x => x[0])
        .join("")
        .substring(0, 2);

tabok.innerHTML = `
    <div class="valtoSor">

        <button
            onclick="
                if (aktualisVersenyzo > 0) {
                    aktualisVersenyzo--;
                    rajzol();
                }
            ">
            ◀
        </button>

        <div class="versenyzoTab aktivTab">
            ${rovid || "??"}
        </div>

        <button
            onclick="
                if (aktualisVersenyzo < versenyzok.length - 1) {
                    aktualisVersenyzo++;
                    rajzol();
                }
            ">
            ▶
        </button>

    </div>
`;

    let v =
        versenyzok[aktualisVersenyzo];

    let lovesek =
        v.celok[aktualisCel] || [];

    let lovesKartya = "";

    for (
        let i = 0;
        i < versenyBeallitas.lovesekCelonkent;
        i++
    ) {

        lovesKartya += `

            <div class="lovesKartya">
                ${lovesek[i] ?? "-"}
            </div>

        `;
    }

    let gombok = "";

    pontErtekek().forEach(p => {

       let szin = "#607d8b";
let betuSzin = "white";
let keret = "none";

if (p == 0) {

    szin = "white";
    betuSzin = "black";
    keret = "2px solid black";

}
else if (p <= 2) {

    szin = "#bdbdbd";

}
else if (p <= 4) {

    szin = "#222222";

}
else if (p <= 6) {

    szin = "#2196f3";

}
else if (p <= 8) {

    szin = "#e53935";

}
else {

    szin = "#fbc02d";
    betuSzin = "black";

}

gombok += `

    <button
        style="
            background:${szin};
            color:${betuSzin};
            border:${keret};
        "
        onclick="pontHozzaadas(${p})">

        ${p}

    </button>

`;
    });

       document.getElementById("versenyzoPanel").innerHTML = `

        <div class="versenyzoKartya">

            <div class="versenyzoNev">
                ${v.nev}
            </div>

            <div class="lovesekSor">
                ${lovesKartya}
            </div>

            <div class="pontGombok">
                ${gombok}
            </div>

            <button
                class="visszaBtn"
                onclick="lovesVisszavonas()">

                ↶ Utolsó lövés törlése

            </button>

        </div>

    `;
let statHtml = "";

versenyBeallitas.pontok.forEach(p => {

    let db = 0;

    v.celok.forEach(cel => {

        if (!cel) return;

        cel.forEach(loves => {

            if (loves == p) {
                db++;
            }

        });

    });
let szin = "#607d8b";
let betuSzin = "white";
let keret = "none";

if (p == 0) {

    szin = "white";
    betuSzin = "black";
    keret = "2px solid black";

}
else if (p <= 2) {

    szin = "#bdbdbd";

}
else if (p <= 4) {

    szin = "#222222";

}
else if (p <= 6) {

    szin = "#2196f3";

}
else if (p <= 8) {

    szin = "#e53935";

}
else {

    szin = "#fbc02d";
    betuSzin = "black";

}
    statHtml += `

        <div class="statDoboz">

            <div
    class="statPont"
    style="
        background:${szin};
        color:${betuSzin};
        border:${keret};
    "
>
    ${p}
</div>

            <div class="statDb">
                ${db}
            </div>

        </div>

    `;

});
    document.getElementById("statisztika").innerHTML = `

        <div class="statFejlec">

            Pont:
            ${osszPont(v)}

        </div>

        <div class="statSor">

    ${statHtml}

</div>

    `;
let tabla = `
<h3>Célpontok eredményei</h3>

<table>
<tr>
    <th>Cél</th>
    <th>Lövések</th>
    <th>Pont</th>
    <th>Összesített</th>
</tr>
`;

let futoOsszeg = 0;

v.celok.forEach((cel, index) => {

    if (!cel) return;

    let celPont = cel.reduce((a, b) => a + b, 0);

    futoOsszeg += celPont;

    tabla += `
    <tr>
        <td>${index + 1}</td>
        <td>${cel.join(" | ")}</td>
        <td>${celPont}</td>
        <td>${futoOsszeg}</td>
    </tr>
    `;
});

tabla += `
<tr>
    <th colspan="3">
        Összesen
    </th>

    <th>
        ${futoOsszeg}
    </th>
</tr>
</table>
`;

document.getElementById("eredmenyTabla").innerHTML = tabla;

}

window.onload = async function () {
   
    document
    .getElementById("ujVersenyLeiras")
    .addEventListener(
        "input",
        function () {

            this.style.height = "auto";

            this.style.height =
                this.scrollHeight + "px";

        }
    );
   await versenyBetoltese();

    const mentettPontozas =
    localStorage.getItem(
        "folyamatbanLevoPontozas"
    );

if (mentettPontozas) {

    if (
        confirm(
            "Találtam egy félbehagyott pontozást. Folytatod?"
        )
    ) {

        const adat =
            JSON.parse(
                mentettPontozas
            );

        aktualisCel =
            adat.aktualisCel;

        aktualisVersenyzo =
            adat.aktualisVersenyzo;

        aktualisMod =
            adat.aktualisMod;

        versenyzok =
            adat.versenyzok;

        document
            .getElementById("fomenu")
            .style.display =
                "none";

        document
            .getElementById("pontozoMod")
            .style.display =
                "block";

        rajzol();

       // return;

    }

}
   const pontValaszto =
    document.getElementById("pontValaszto");

for (let i = 0; i <= 11; i++) {

    const gomb =
        document.createElement("button");

    gomb.type = "button";

    gomb.innerText = i;
gomb.addEventListener(
    "click",
    () => {

        gomb.classList.toggle("kivalasztottPont");

        let pontok = [];

        document
            .querySelectorAll(
                "#pontValaszto .kivalasztottPont"
            )
            .forEach(g => {

                pontok.push(
                    parseInt(g.innerText)
                );

            });

        pontok.sort(
            (a, b) => b - a
        );

        document
            .getElementById("edzesPontok")
            .value =
                pontok.join(",");

    }
);
    pontValaszto.appendChild(gomb);

}
document
    .getElementById("inditBtn")
    .addEventListener(
        "click",
        pontozasInditas
    );
   document
    .getElementById("foCim")
    .addEventListener(
        "click",
        () => {

            adminKoppintas++;

            if (adminKoppintas >= 5) {

                const adminGomb =
                    document.getElementById(
                        "ujVersenyBtn"
                    );

                adminGomb.style.display =
    adminGomb.style.display === "none"
    ? ""
    : "none";


                adminKoppintas = 0;

            }

        }
    );
document
    .getElementById("versenyModeBtn")
    .addEventListener("click", () => {
        aktualisMod = "verseny";

        document.getElementById("fomenu").style.display = "none";
        document.getElementById("versenyNev").style.display = "block";
        document.getElementById("qrMod").style.display = "block";

   const qrScanner =
    new Html5Qrcode("reader");

qrScanner.start(
    { facingMode: "environment" },
    {
        fps: 20,
        qrbox: {
            width: 200,
            height: 200
}
    },
    onScanSuccess
)
.then(() => {

    const video = document.querySelector("#reader video");

    if (video) {
    video.style.width = "450px";
    video.style.height = "450px";
}

const reader = document.getElementById("reader");

if (reader) {
    reader.style.width = "450px";
    reader.style.height = "450px";
    reader.style.margin = "20px auto";
}

})
.catch(error => {
    console.error("KAMERA HIBA:", error);
});
        }
    );

document
    .getElementById("edzesModeBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("fomenu")
                .style.display = "none";

            document
                .getElementById("edzesMod")
                .style.display = "block";

        }
    );
    document
    .getElementById("nevezekBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("nevezesiUrlap")
                .style.display = "block";

        }
    );

document
    .getElementById("adminUjVersenyBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("ujVersenyMod")
                .style.display = "none";

            document
                .getElementById("ujVersenyOldal")
                .style.display = "block";

        }
    );
    document
    .getElementById("visszaAdminBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("ujVersenyOldal")
                .style.display = "none";

            document
                .getElementById("ujVersenyMod")
                .style.display = "block";

        }
    );
    document
    .getElementById("adminVersenyekBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("adminVersenyLista")
                .style.display = "block";

            let versenyek =
                JSON.parse(
                    localStorage.getItem("versenyek") || "[]"
                );

            let html = "";
            versenyek.forEach((v, index) => {

               html += `

    <div
        class="versenyElem"
        onclick="adminVersenyMegnyit(${index})"
    >

        🏹 ${v.nev}

        <br>

        👥 ${v.nevezok ? v.nevezok.length : 0} nevező

    </div>

`;

            });

            document
                .getElementById("adminVersenyLista")
                .innerHTML = html;

        }
    );
    document
    .getElementById("nevezesKuldesBtn")
    .addEventListener(
        "click",
        () => {

            if (!aktualisVerseny) return;

            if (!aktualisVerseny.nevezok) {

                aktualisVerseny.nevezok = [];

            }
let ujId = "FTIV-" +
    String(
        (Number(localStorage.getItem("utolsoFTIV")) || 0) + 1
    ).padStart(4, "0");

localStorage.setItem(
    "utolsoFTIV",
    String(
        (Number(localStorage.getItem("utolsoFTIV")) || 0) + 1
    )
);
           aktualisVerseny.nevezok.push({

    id: ujId,

    nev:
        document
            .getElementById("nevezoNev")
            .value,

    nem:
        document
            .getElementById("nevezoNem")
            .value,

    korosztaly:
        document
            .getElementById("nevezoKorosztaly")
            .value,

    kategoria:
        document
            .getElementById("nevezoKategoria")
            .value,

    egyesulet:
        document
            .getElementById("nevezoEgyesulet")
            .value

});
            let versenyek =
    JSON.parse(
        localStorage.getItem("versenyek") || "[]"
    );

let index =
    versenyek.findIndex(
        v => v.nev === aktualisVerseny.nev
    );

if (index >= 0) {

    versenyek[index] =
        aktualisVerseny;

    localStorage.setItem(
        "versenyek",
        JSON.stringify(versenyek)
    );

}

            alert(
                "Nevezés rögzítve!"
            );

        }
    );
    document

    .getElementById("versenyekBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("fomenu")
                .style.display = "none";

            document
    .getElementById("versenyekMod")
    .style.display = "block";

let versenyek =
    JSON.parse(
        localStorage.getItem("versenyek") || "[]"
    );

let html = "";

versenyek.forEach((v, index) => {

    html += `

        <div
            class="versenyElem"
            onclick="megnyitVerseny(${index})"
        >

            🏹 ${v.nev}

        </div>

    `;

});

document
    .getElementById("versenyLista")
    .innerHTML = html;

        }
    );
    document
    .getElementById("ujVersenyBtn")
    .addEventListener(
        "click",
        () => {
const jelszo =
    prompt("Admin jelszó:");

if (jelszo !== ADMIN_JELSZO) {

    alert("Hibás jelszó!");

    return;

}
            document
                .getElementById("fomenu")
                .style.display = "none";

            document
                .getElementById("ujVersenyMod")
                .style.display = "block";

        }
    );
document
    .getElementById("lezarasBtn")
    .addEventListener(
        "click",
        versenyLezarasa
    );
    document
    .getElementById("kilepesBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Ha most kilépsz, a folyamatban lévő verseny vagy edzés nem lesz elmentve.\n\nBiztosan kilépsz?"
                )
            ) {
                return;
            }

            localStorage.removeItem(
                "folyamatbanLevoPontozas"
            );

            location.reload();

        }
    );
document
    .getElementById("edzesTipus")
    .addEventListener(
        "change",
        function () {

            document
                .getElementById("csoportosBlokk")
                .style.display =
                    this.value === "csoportos"
                    ? "block"
                    : "none";
        }
    );
document
    .getElementById("versenyMentesBtn")
    .addEventListener(
        "click",
        () => {

            let versenyek =
                JSON.parse(
                    localStorage.getItem("versenyek") || "[]"
                );

            versenyek.push({

    nev:
        document
            .getElementById("ujVersenyNev")
            .value,

    leiras:
        document
            .getElementById("ujVersenyLeiras")
            .value,

    korosztalyok:
        document
            .getElementById("ujVersenyKorosztalyok")
            .value
            .split(","),

    kategoriak:
        document
            .getElementById("ujVersenyKategoriak")
            .value
            .split(",")

});

            localStorage.setItem(
                "versenyek",
                JSON.stringify(versenyek)
            );

            alert(
                "Verseny elmentve!"
            );

        }
    );


                    const nev =document
    .getElementById("ujEdzotarsBtn")
    .addEventListener(
        "click",
        () => {

            const sor =
    document.createElement("div");

sor.className =
    "edzotarsSor";

const ujInput =
    document.createElement("input");

ujInput.type = "text";

ujInput.className =
    "edzotarsNev";

ujInput.placeholder =
    "Név";

const torlesBtn =
    document.createElement("button");

torlesBtn.textContent = "🗑";

torlesBtn.onclick = () => {
    sor.remove();
};

sor.appendChild(ujInput);
sor.appendChild(torlesBtn);

document
    .getElementById("edzotarsLista")
    .appendChild(sor);

        }
    );

};
if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register("./sw.js")
        .then(() => {

            console.log(
                "Service Worker regisztrálva"
            );

        })
        .catch(error => {

            console.error(
                "Service Worker hiba:",
                error
            );

        });
}
document
    .getElementById("edzesInditBtn")
    .addEventListener(
        "click",
        () => {
             aktualisMod = "edzes";
            const nevek = [];

            const foNev =
                document
                    .getElementById("edzesLovoNev")
                    .value
                    .trim();

           if (foNev !== "") {

    nevek.push(foNev);

}
else if (
    document.getElementById("edzesTipus").value
    === "egyeni"
) {

    nevek.push("Lövő 1");

}

            document
    .querySelectorAll(".edzotarsNev")
    .forEach(elem => {

        const nev =
            elem.value.trim();

        if (nev !== "") {

            nevek.push(nev);

        }

    });

            document
                .getElementById("edzesMod")
                .style.display = "none";

            document
                .getElementById("pontozoMod")
                .style.display = "block";
versenyBeallitas.celokSzama =
    parseInt(
        document.getElementById("edzesCelok").value
    );

versenyBeallitas.lovesekCelonkent =
    parseInt(
        document.getElementById("edzesLovesek").value
    );
    versenyBeallitas.pontok =
    document
        .getElementById("edzesPontok")
        .value
        .split(",")
        .map(p => parseInt(p.trim()));
           versenyzok = [];

nevek.forEach(nev => {

    versenyzok.push({

        id: Date.now() + Math.random(),

        qr: "",

        ftiv: "",

        nev: nev,

        celok: []

    });

});
aktualisVersenyzo = 0;

document
    .getElementById("edzesMod")
    .style.display = "none";

document
    .getElementById("pontozoMod")
    .style.display = "block";

rajzol();

        }
    );

document
    .getElementById("mentettEdzesekBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("fomenu")
                .style.display = "none";

            document
                .getElementById("mentettEdzesekMod")
                .style.display = "block";

            let edzesek =
                JSON.parse(
                    localStorage.getItem("edzesek") || "[]"
                );

            let html = "";

            edzesek.forEach((e, index) => {

                html += `

                    <div
                        class="mentettEdzes"
                        onclick="megnyitEdzes(${index})"
                    >

                        <b>${e.nev}</b><br>

                        ${e.datum}

                    </div>

                    <br>

                `;

            });

            document
                .getElementById("mentettEdzesLista")
                .innerHTML = html;

        }
    );
  function megnyitVerseny(index) {

    let versenyek =
        JSON.parse(
            localStorage.getItem("versenyek") || "[]"
        );

    let verseny =
        versenyek[index];

    aktualisVerseny = verseny;

    document
        .getElementById("versenyekMod")
        .style.display = "none";

    document
        .getElementById("versenyAdatlapMod")
        .style.display = "block";

    document
        .getElementById("versenyAdatlapNev")
        .innerText =
            "🏹 " + verseny.nev;

    document
        .getElementById("versenyAdatlapLeiras")
        .innerHTML =
            verseny.leiras;
            let korHtml = "";

verseny.korosztalyok.forEach(k => {

    korHtml +=
        `<option>${k.trim()}</option>`;

});

document
    .getElementById("nevezoKorosztaly")
    .innerHTML =
        korHtml;

let katHtml = "";

verseny.kategoriak.forEach(k => {

    katHtml +=
        `<option>${k.trim()}</option>`;

});

document
    .getElementById("nevezoKategoria")
    .innerHTML =
        katHtml;


}
function adminVersenyMegnyit(index) {

    let versenyek =
        JSON.parse(
            localStorage.getItem("versenyek") || "[]"
        );

    let verseny =
        versenyek[index];

    window.aktualisVerseny =
        verseny;

    document
        .getElementById("ujVersenyMod")
        .style.display = "none";

    document
        .getElementById("adminVersenyOldal")
        .style.display = "block";

    document
        .getElementById("adminVersenyNev")
        .innerText =
            "🏹 " + verseny.nev;

   let html = `

<div class="versenyFejlec">

    <div class="versenyInfo">

        👥 Nevezők:
        ${verseny.nevezok ? verseny.nevezok.length : 0}

    </div>

    <button
        onclick="osszesQrNyomtatas()"
    >
        🏷 Összes QR nyomtatása
    </button>

    <button
        onclick="csapatBeosztasMegnyit()"
    >
        🏹 Csapatbeosztás
    </button>

</div>

`;

    if (verseny.nevezok) {

        verseny.nevezok.forEach(n => {

            html += `

                <div class="nevezoSor">

                    <div>${n.nev}</div>

                    <div>${n.nem}</div>

                    <div>${n.korosztaly}</div>

                    <div>${n.kategoria}</div>

                    <div>${n.egyesulet}</div>

                </div>

            `;

        });

    }

    document
        .getElementById("adminVersenyAdatok")
        .innerHTML =
            html;

}
    function csapatBeosztasMegnyit() {

    localStorage.setItem(
        "aktualisCsapatVerseny",
        JSON.stringify(window.aktualisVerseny)
    );

    window.open(
        "csapatbeosztas.html",
        "_blank"
    );

}