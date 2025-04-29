import { useState, FormEvent, useEffect } from "react";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";

import { db } from "../../services/firebaseConnection";
import { setDoc, doc, getDoc } from "firebase/firestore";

export function Networks() {
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [site, setSite] = useState("");

  useEffect(() => {
    async function loadLinks() {
      const docRef = doc(db, "social", "link");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFacebook(docSnap.data().facebook);
        setInstagram(docSnap.data().instagram);
        setYoutube(docSnap.data().youtube);
        setLinkedin(docSnap.data().linkedin);
        setSite(docSnap.data().site);
      }
    }

    loadLinks();
  }, []);

  function handleRegister(e: FormEvent) {
    e.preventDefault();

    setDoc(doc(db, "social", "link"), {
      facebook: facebook,
      instagram: instagram,
      youtube: youtube,
      linkedin: linkedin,
      site: site,
    })
      .then(() => {
        console.log("CADASTRADOS COM SUCESSO!");
      })
      .catch((error) => {
        console.log("ERRO AO SALVAR" + error);
      });
  }

  return (
    <div className="flex items-center flex-col min-h-screen pb-7 px-2">
      <Header />

      <h1 className="text-white text-2xl font-medium mt-8 mb-4">
        Minhas redes sociais
      </h1>

      <form className="flex flex-col max-w-xl w-full" onSubmit={handleRegister}>
        <label className="text-white font-medium mt-2 mb-2">
          Link do facebook
        </label>
        <Input
          type="url"
          placeholder="Digite a url do facebook..."
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />

        <label className="text-white font-medium mt-2 mb-2">
          Link do Instagram
        </label>
        <Input
          type="url"
          placeholder="Digite a url do instagram..."
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />

        <label className="text-white font-medium mt-2 mb-2">
          Link do Yotube
        </label>
        <Input
          type="url"
          placeholder="Digite a url do youtube..."
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
        />

        <label className="text-white font-medium mt-2 mb-2">
          Link do Linkedin
        </label>
        <Input
          type="url"
          placeholder="Digite a url do linkedin..."
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />

        <label className="text-white font-medium mt-2 mb-2">Link do Site</label>
        <Input
          type="url"
          placeholder="Digite a url do site..."
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />

        <button
          type="submit"
          className="text-white bg-blue-600 h-9 rounded-md items-center justify-center flex mb-7 font-medium cursor-pointer hover:bg-blue-500"
        >
          Salvar links
        </button>
      </form>
    </div>
  );
}
