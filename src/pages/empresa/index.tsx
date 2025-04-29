import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  limit,
  getDocs,
} from "firebase/firestore";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { FiTrash } from "react-icons/fi";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { db } from "../../services/firebaseConnection";

export interface EmpresaProps {
  id: string;
  logo: string;
  organization: string;
}

export interface LinksEmpresaProps {
  id: string;
  name: string;
  url: string;
  bg: string;
  color: string;
}

export function Empresa() {
  const [empresa, setEmpresa] = useState<EmpresaProps>();

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [organizationInput, setOrganizationInput] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [textColorInput, setTextColorInput] = useState("#f1f1f1");
  const [backgroundColorInput, setBackgroundColorInput] = useState("#121212");

  const [links, setLinks] = useState<LinksEmpresaProps[]>([]);

  useEffect(() => {
    const linksOrganizationRef = collection(db, "links-organization");
    const queryRef = query(linksOrganizationRef, orderBy("created", "asc"));

    const unsub = onSnapshot(queryRef, (snapshot) => {
      const list: LinksEmpresaProps[] = [];

      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          name: doc.data().name,
          url: doc.data().url,
          bg: doc.data().bg,
          color: doc.data().color,
        });
      });

      setLinks(list);
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const organizationRef = collection(db, "organization");
    const queryRef = query(organizationRef, limit(1));

    const unsub = onSnapshot(queryRef, (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc) {
        setEmpresa({
          id: doc.id,
          logo: doc.data().logo,
          organization: doc.data().organization,
        });

        setImageUrl(doc.data().logo);
        setOrganizationInput(doc.data().organization);
      }
    });

    return () => unsub();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecione um arquivo primeiro!");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      //http://localhost:3001/upload
      const response = await fetch(
        "https://api-proxy-imgur.vercel.app/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erro no upload");
      }

      const data = await response.json();
      setImageUrl(data.data.link); // Aqui pega a URL da imagem no Imgur
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  async function handleRegisterLink(e: FormEvent) {
    e.preventDefault();

    if (nameInput === "" || urlInput === "") {
      alert("Preencha todos os campos!");
      return;
    }

    addDoc(collection(db, "links-organization"), {
      name: nameInput,
      url: urlInput,
      bg: backgroundColorInput,
      color: textColorInput,
      created: new Date(),
    })
      .then(() => {
        setNameInput("");
        setUrlInput("");
        setBackgroundColorInput("#121212");
        setTextColorInput("#f1f1f1");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function handleRegisterOrganization(e: FormEvent) {
    e.preventDefault();

    if (imageUrl === "" || organizationInput === "") {
      alert("Preencha todos os campos!");
      return;
    }

    addDoc(collection(db, "organization"), {
      id: "empresa_unica",
      logo: imageUrl,
      organization: organizationInput,
      created: new Date(),
    })
      .then(() => alert("Empresa cadastrada com sucesso!"))
      .catch((error) => {
        console.log(error);
      });
  }

  async function handleUpdateOrganization(e: FormEvent) {
    e.preventDefault();

    if (imageUrl === null && imageUrl === null) {
      alert("Carregue uma imagem para continuar!");
      return;
    }

    if (imageUrl === "" || organizationInput === "") {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const orgCollection = collection(db, "organization");
      const orgQuery = query(orgCollection, limit(1));
      const snapshot = await getDocs(orgQuery);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;

        await updateDoc(docRef, {
          logo: imageUrl,
          organization: organizationInput,
        });

        alert("Organização atualizada com sucesso!");
      } else {
        alert("Nenhuma organização encontrada para atualizar.");
      }
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
      alert("Erro ao atualizar. Verifique o console.");
    }
  }

  async function handleDeleteLink(id: string) {
    const docRef = doc(db, "links", id);
    await deleteDoc(docRef);
  }

  return (
    <div className="flex items-center flex-col min-h-screen pb-7 px-2">
      <Header />

      <h2 className="font-bold text-3xl mt-4 text-white">
        {empresa ? "Editar" : "Cadastrar"} empresa
      </h2>

      <label className="text-white font-medium mt-4 mb-2">
        Logo da Empresa
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {uploading ? "Carregando..." : "Carregar Imagem"}
      </button>

      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-lg mb-2 text-white">Imagem carregada:</h3>
          <img
            src={imageUrl || ""}
            width="200"
            alt="Logomarca"
            className="max-w-xs rounded shadow"
          />
        </div>
      )}

      <form
        className="flex flex-col mt-8 mb-3 w-full max-w-xl"
        onSubmit={(e) =>
          empresa ? handleUpdateOrganization(e) : handleRegisterOrganization(e)
        }
      >
        <label className="text-white font-medium mt-2 mb-2">
          Nome da Empresa
        </label>
        <Input
          placeholder="Digite o nome da empresa..."
          value={organizationInput}
          onChange={(e) => setOrganizationInput(e.target.value)}
        />
        <button
          disabled={imageUrl !== null && imageUrl !== "" ? false : true}
          type="submit"
          className="mb-7 bg-blue-600 h-9 rounded-md text-white font-medium gap-4 flex justify-center items-center cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {imageUrl === null || imageUrl === ""
            ? "Nenhuma imagem carregada"
            : empresa
            ? "Atualizar empresa"
            : "Cadastrar empresa"}
        </button>
      </form>

      <hr className="w-full my-10 text-amber-50" />

      <h2 className="font-bold text-3xl mt-4 text-white">
        Novo link para a Empresa
      </h2>

      <form
        className="flex flex-col mt-8 mb-3 w-full max-w-xl"
        onSubmit={(e) => handleRegisterLink(e)}
      >
        <label className="text-white font-medium mt-2 mb-2">Nome do Link</label>
        <Input
          placeholder="Digite o nome do link..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <label className="text-white font-medium mt-2 mb-2">Url do Link</label>
        <Input
          type="url"
          placeholder="Digite a url..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <section className="flex my-4 gap-5">
          <div className="flex items-center gap-2">
            <label className="text-white font-medium mt-2 mb-2">
              Cor do link
            </label>
            <input
              type="color"
              value={textColorInput}
              onChange={(e) => setTextColorInput(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white font-medium mt-2 mb-2">
              Fundo do link
            </label>
            <input
              type="color"
              value={backgroundColorInput}
              onChange={(e) => setBackgroundColorInput(e.target.value)}
            />
          </div>
        </section>
        {nameInput !== "" && (
          <div className="flex items-center justify-start flex-col mb-7 p-1 border-gray-100/25 border rounded-md">
            <label className="text-white font-medium mt-2 mb-3">
              Veja como está ficando:
            </label>
            <article
              className="w-11/12 max-w-lg flex flex-col items-center justify-between bg-zinc-900 rounded px-1 py-3"
              style={{
                marginBottom: 8,
                marginTop: 8,
                backgroundColor: backgroundColorInput,
              }}
            >
              <p className="font-medium" style={{ color: textColorInput }}>
                {nameInput}
              </p>
            </article>
          </div>
        )}
        <button
          type="submit"
          className="mb-7 bg-blue-600 h-9 rounded-md text-white font-medium gap-4 flex justify-center items-center cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Cadastrar
        </button>
      </form>

      <h2 className="font-bold text-white mb-4 text-2xl">Meus Links</h2>

      {links.map((link) => (
        <article
          key={link.id}
          className="flex items-center justify-between w-11/12 max-w-xl rounded py-3 px-2 mb-2 select-none"
          style={{ backgroundColor: link.bg, color: link.color }}
        >
          <p>{link.name}</p>
          <div>
            <button
              className="border border-dashed p-1 rounded cursor-pointer hover:bg-zinc-700/50"
              onClick={() => handleDeleteLink(link.id)}
            >
              <FiTrash size={18} color={link.color} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
