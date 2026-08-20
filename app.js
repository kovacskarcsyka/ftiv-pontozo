let versenyLezarva = false;
let versenyBeallitas = null;
let aktualisEdzesNev = "";
let aktualisCel = 0;
let aktualisVersenyzo = 0;
let aktualisMod = "verseny";
let versenyzok = [];

async function versenyBetoltese() {

    const response = await fetch("verseny.json");

    versenyBeallitas = await response.json();

    document.getElementById("versenyNev").innerText =
        versenyBeallitas.versenyNev;

    rajzolCelFejlec();
}

function nevKinyeres(szoveg) {

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

function onScanSuccess(decodedText) {

    let marVan =
        versenyzok.find(
            v => v.qr === decodedText
        );

    if (marVan) {
        return;
    }

    versenyzok.push({

    id: Date.now() + Math.random(),

    qr: decodedText,

    ftiv: mezoKinyeres(
        decodedText,
        "FTIV"
    ),

    nev: nevKinyeres(decodedText),

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
   await versenyBetoltese();
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
   // qrScanner.render(onScanSuccess);
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
    .getElementById("lezarasBtn")
    .addEventListener(
        "click",
        versenyLezarasa
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
}
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
    document
    .getElementById("visszaMentettEdzesekBtn")
    .addEventListener(
        "click",
        () => {
        
         console.log("edzesReszletekMod");
         console.log(document.getElementById("edzesReszletekMod"));

         console.log("mentettEdzesekMod");
         console.log(document.getElementById("mentettEdzesekMod"));
            document
                .getElementById("edzesReszletekMod")
                .style.display = "none";

            document
                .getElementById("mentettEdzesekMod")
                .style.display = "block";

        }
    );
function edzesMentese() {

    let edzesek =
        JSON.parse(
            localStorage.getItem("edzesek") || "[]"
        );

    edzesek.push({

        nev:
            document.getElementById("edzesNev").value,

        datum:
            new Date().toLocaleString(),

        versenyzok:
            versenyzok

    });

    localStorage.setItem(
        "edzesek",
        JSON.stringify(edzesek)
    );

    alert(
        "Edzés elmentve!"
    );

}
function megnyitEdzes(index) {
    console.log(document.getElementById("mentettEdzesekMod"));
    console.log(document.getElementById("edzesReszletekMod"));
    console.log(document.getElementById("edzesReszletek"));

    let edzesek =
        JSON.parse(
            localStorage.getItem("edzesek") || "[]"
        );

    let e = edzesek[index];
console.log(e.versenyzok);

    let szoveg = "";

e.versenyzok.forEach(v => {

    szoveg +=
        v.nev +
        " - " +
        osszPont(v) +
        " pont\n";

});

document
    .getElementById("mentettEdzesekMod")
    .style.display = "none";

document
    .getElementById("edzesReszletekMod")
    .style.display = "block";
console.log(szoveg);
document
    .getElementById("edzesReszletek")
    .innerHTML =
        "<h2>" + e.nev + "</h2>" +
        "<p>" + e.datum + "</p>" +
        "<pre>" + szoveg + "</pre>";

}

