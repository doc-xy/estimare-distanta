// script.js
document.addEventListener("DOMContentLoaded", function () {
  // 🔥 Configurare Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyC0ehiWxhWwersSQKxa9-5T9-9MGpPp29Y",
    authDomain: "estimare-distanta.firebaseapp.com",
    databaseURL: "https://estimare-distanta-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "estimare-distanta",
    storageBucket: "estimare-distanta.firebasestorage.app",
    messagingSenderId: "549115334361",
    appId: "1:549115334361:web:c6d8afc1692affb61178c8"
  };

  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  const DISTANTE_TEST = [124, 580, 1465];
  const OBIECTE_TEST = [
    { nume: "Obiect 1", imagine: "obiect1.jpg" },
    { nume: "Obiect 2", imagine: "obiect2.jpg" },
    { nume: "Obiect 3", imagine: "obiect3.jpg" }
  ];

  let etapaCurenta = 0;
  let incercariEtapa = [];
  let dateParticipant = {};
  let startTime = null;
  let startEtapa = null;

  const checkboxuri = document.querySelectorAll(".consentCheck");
  const continuaBtn = document.getElementById("continuaBtn");

  checkboxuri.forEach(cb => {
    cb.addEventListener("change", function () {
      const toateBifate = Array.from(checkboxuri).every(c => c.checked);
      continuaBtn.disabled = !toateBifate;
    });
  });

  continuaBtn.addEventListener("click", function () {
    document.getElementById("paginaIntro").style.display = "none";
    document.getElementById("userForm").style.display = "block";
  });

  document.getElementById("userForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const age = document.getElementById("age").value;
    const sex = document.getElementById("sex").value;

    if (!age || !sex) {
      alert("Te rog completează toate câmpurile.");
      return;
    }

    dateParticipant = {
      varsta: age,
      sex: sex,
      timpStart: new Date().toISOString(),
      raspunsuri: []
    };

    document.getElementById("userForm").style.display = "none";
    document.getElementById("testSection").style.display = "block";
    startTime = new Date();

    incarcaEtapaCurenta();
  });

  document.getElementById("submitEstimateBtn").addEventListener("click", submitEstimate);

  function incarcaEtapaCurenta() {
    const obiect = OBIECTE_TEST[etapaCurenta];
    document.getElementById("numeObiect").textContent = obiect.nume;
    document.getElementById("imagineObiect").src = obiect.imagine;
    document.getElementById("feedback").textContent = "";
    document.getElementById("estimateInput").value = "";
    startEtapa = new Date();
  }

  function submitEstimate() {
    const estimate = parseInt(document.getElementById("estimateInput").value);
    const feedbackEl = document.getElementById("feedback");

    if (isNaN(estimate)) {
      feedbackEl.textContent = "Te rog introdu un număr valid.";
      return;
    }

    const distantaCorecta = DISTANTE_TEST[etapaCurenta];
    let feedback = "";

    if (estimate === distantaCorecta) {
      feedback = `✅ Felicitări! Valoarea corectă este ${distantaCorecta} m.`;
    } else if (estimate > distantaCorecta) {
      feedback = "Prea mare.";
    } else {
      feedback = "Prea mică.";
    }

    feedbackEl.textContent = feedback;

    incercariEtapa.push({
      valoare: estimate,
      feedback: feedback,
      timp: new Date().toISOString()
    });

    if (estimate === distantaCorecta) {
      const endEtapa = new Date();
      const durataSec = ((endEtapa - startEtapa) / 1000).toFixed(2);

      const estimariNum = incercariEtapa.map(e => e.valoare);
      const primaEstimare = estimariNum[0];
      const mediaEstimari = (estimariNum.reduce((a, b) => a + b, 0) / estimariNum.length).toFixed(2);

      dateParticipant.raspunsuri.push({
        obiect: OBIECTE_TEST[etapaCurenta].nume,
        distantaCorecta: distantaCorecta,
        primaEstimare: primaEstimare,
        mediaEstimari: mediaEstimari,
        nrIncercari: incercariEtapa.length,
        timpEtapaSecunde: durataSec,
        incercari: [...incercariEtapa]
      });

      etapaCurenta++;
      incercariEtapa = [];

      if (etapaCurenta < DISTANTE_TEST.length) {
        setTimeout(() => {
          feedbackEl.textContent = "";
          incarcaEtapaCurenta();
        }, 1500);
      } else {
        afiseazaRezumatFinal();
      }
    } else {
      document.getElementById("estimateInput").value = "";
      document.getElementById("estimateInput").focus();
    }
  }

  function afiseazaRezumatFinal() {
    const endTime = new Date();
    const timpTotal = ((endTime - startTime) / 1000).toFixed(2);

    document.getElementById("testSection").style.display = "none";
    document.getElementById("rezumatFinal").style.display = "block";

    let rezumatHTML = `<p><strong>Timp total:</strong> ${timpTotal} secunde</p><hr>`;
    dateParticipant.raspunsuri.forEach((r, index) => {
      rezumatHTML += `
        <p><strong>${r.obiect}</strong></p>
        <p>Distanță corectă: ${r.distantaCorecta} m</p>
        <p>Prima estimare: ${r.primaEstimare} m</p>
        <p>Media estimărilor: ${r.mediaEstimari} m</p>
        <p>Număr de încercări: ${r.nrIncercari}</p>
        <p>Timp estimare: ${r.timpEtapaSecunde} secunde</p>
        <hr>
      `;
    });

    document.getElementById("rezumatContent").innerHTML = rezumatHTML;

    console.log("Date colectate:", dateParticipant);
    salveazaInFirebase(dateParticipant);
  }

  function salveazaInFirebase(dateParticipant) {
    const timestamp = new Date().toISOString();
    const uniqueKey = "participant_" + timestamp.replace(/[:.]/g, "-");

    firebase.database().ref("estimari/" + uniqueKey).set(dateParticipant)
      .then(() => {
        alert("Datele au fost trimise cu succes în Firebase!");
      })
      .catch((error) => {
        console.error("❌ Eroare la trimitere în Firebase:", error);
        alert("A apărut o eroare la trimiterea datelor. Te rugăm să încerci din nou.");
      });
  }
});
