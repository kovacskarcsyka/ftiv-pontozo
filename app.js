let versenyLezarva = false;
let versenyBeallitas = null;

let aktualisCel = 0;
let aktualisVersenyzo = 0;

const versenyzok = [];

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

alert(
    "A verseny sikeresen lezárva!"
);

qrGeneralas();

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

    let s10 = 0;
    let s8 = 0;
    let s5 = 0;
    let s0 = 0;

    v.celok.forEach(cel => {

        if (!cel) return;

        cel.forEach(p => {

            if (p == 10) s10++;
            if (p == 8) s8++;
            if (p == 5) s5++;
            if (p == 0) s0++;

        });

    });

    return {
        s10,
        s8,
        s5,
        s0
    };
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

    versenyzok.forEach((v, index) => {

        let aktiv =
            index === aktualisVersenyzo
                ? "aktivTab"
                : "";

        let rovid =
            v.nev
                .split(" ")
                .map(x => x[0])
                .join("")
                .substring(0, 2);

        tabok.innerHTML += `

            <div
                class="versenyzoTab ${aktiv}"
                onclick="
                    aktualisVersenyzo=${index};
                    rajzol();
                ">

                ${rovid}

            </div>

        `;
    });

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

        gombok += `

            <button
                class="p${p}"
                onclick="pontHozzaadas(${p})">

                ${p}

            </button>

        `;
    });

    let stat =
        statisztika(v);

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

    document.getElementById("statisztika").innerHTML = `

        <div class="statFejlec">

            Pont:
            ${osszPont(v)}

        </div>

        <div class="statSor">

            <div class="statDoboz">
                <div class="statPont p10">10</div>
                <div class="statDb">${stat.s10}</div>
            </div>

            <div class="statDoboz">
                <div class="statPont p8">8</div>
                <div class="statDb">${stat.s8}</div>
            </div>

            <div class="statDoboz">
                <div class="statPont p5">5</div>
                <div class="statDb">${stat.s5}</div>
            </div>

            <div class="statDoboz">
                <div class="statPont p0">0</div>
                <div class="statDb">${stat.s0}</div>
            </div>

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

    document
        .getElementById("inditBtn")
        .addEventListener(
            "click",
            pontozasInditas
        );

    const qrScanner =
        new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: 250
            }
        );

    qrScanner.render(onScanSuccess);
document
    .getElementById("lezarasBtn")
    .addEventListener(
        "click",
        versenyLezarasa
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