// ✅ Importă Firebase și Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ✅ Configurare Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBgG-pLhao6AEiTARxm5P_QImPtur_3P7s",
  authDomain: "colectaredate-97782.firebaseapp.com",
  projectId: "colectaredate-97782",
  storageBucket: "colectaredate-97782.appspot.com",
  messagingSenderId: "52221405810",
  appId: "1:52221405810:web:72ebbe334ce62abcc7f0eb"
};

// ✅ Inițializează Firebase și Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.onload = function () {
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

  function afiseazaRezumatFinal() {
    const endTime = new Date();
    const timpTotal = ((endTime - startTime) / 1000).toFixed(2);
    document.getElementById("testSection").style.display = "none";
    document.getElementById("rezumatFinal").style.display = "block";

    let rezumatHTML = `<p><strong>Timp total:</strong> ${timpTotal} secunde</p><hr>`;
    dateParticipant.raspunsuri.forEach((r) => {
      rezumatHTML += `<p><strong>${r.obiect}</strong></p>
        <p>Distanță corectă: ${r.distantaCorecta} m</p>
        <p>Prima estimare: ${r.primaEstimare} m</p>
        <p>Media estimărilor: ${r.mediaEstimari} m</p>
        <p>Număr de încercări: ${r.nrIncercari}</p>
        <p>Timp estimare: ${r.timpEtapaSecunde} secunde</p><hr>`;
    });

    document.getElementById("rezumatContent").innerHTML = rezumatHTML;
    
    // ✅ Trimite datele către Firebase Firestore
    addDoc(collection(db, "date_utilizatori"), dateParticipant)
      .then(() => {
        console.log("✔️ Date salvate în Firebase!");
        alert("Testul a fost completat și datele au fost salvate. Mulțumim!");
      })
      .catch(error => {
        console.error("❌ Eroare la salvare:", error);
        alert("A apărut o problemă la salvarea datelor.");
      });
  }
};
