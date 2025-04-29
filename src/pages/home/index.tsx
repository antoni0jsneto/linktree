import { useEffect, useState } from "react";

import { db } from "../../services/firebaseConnection";
import {
  getDocs,
  collection,
  orderBy,
  query,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { EmpresaProps, LinksEmpresaProps } from "../empresa";

interface LinkProps {
  id: string;
  name: string;
  url: string;
  bg: string;
  color: string;
}

// interface SocialLinksProps {
//   facebook: string;
//   youtube: string;
//   instagram: string;
// }

export function Home() {
  const [links, setLinks] = useState<LinkProps[]>([]);
  // const [socialLinks, setSocialLinks] = useState<SocialLinksProps>();
  // const [facebookColor, setFacebookColor] = useState("#FFF");
  // const [instagramColor, setInstagramColor] = useState("#FFF");
  // const [youtubeColor, setYoutubeColor] = useState("#FFF");

  const [empresa, setEmpresa] = useState<EmpresaProps>();
  const [empresaLinks, setEmpresaLinks] = useState<LinksEmpresaProps[]>([]);

  useEffect(() => {
    function loadLinks() {
      const linksRef = collection(db, "links");
      const queryRef = query(linksRef, orderBy("created", "asc"));

      getDocs(queryRef).then((snapshot) => {
        const lista = [] as LinkProps[];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            name: doc.data().name,
            url: doc.data().url,
            bg: doc.data().bg,
            color: doc.data().color,
          });
        });

        setLinks(lista);
      });
    }

    loadLinks();
  }, []);

  // useEffect(() => {
  //   function loadSocialLinks() {
  //     const docRef = doc(db, "social", "link");

  //     getDoc(docRef).then((snapshot) => {
  //       if (snapshot.data() !== undefined) {
  //         setSocialLinks({
  //           facebook: snapshot.data()?.facebook,
  //           instagram: snapshot.data()?.instagram,
  //           youtube: snapshot.data()?.youtube,
  //         });
  //       }
  //     });
  //   }

  //   loadSocialLinks();
  // }, []);

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

      setEmpresaLinks(list);
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
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col w-full py-4 items-center justify-center">
      <img
        className="w-40 h-40 rounded-full border-4 border-white object-cover mt-20"
        src="/assets/gi3.jpg"
        alt="Giselle Silva"
      />
      <h1 className="md:text-4xl  text-3xl font-bold text-white mt-3">
        Giselle Silva
      </h1>
      <span className="text-gray-50 mb-5 mt-3">
        Me siga nas redes sociais 👇
      </span>

      <main className="flex flex-col w-11/12 max-w-xl text-center">
        {links.map((link) => (
          <section
            style={{ backgroundColor: link.bg }}
            key={link.id}
            className="bg-white mb-4 w-full py-2 rounded-lg select-none transition-transform hover:scale-105 cursor-pointer"
          >
            <a href={link.url} target="_blank">
              <p className="text-base md:text-lg" style={{ color: link.color }}>
                {link.name}
              </p>
            </a>
          </section>
        ))}

        {/* {socialLinks && Object.keys(socialLinks).length > 0 && (
          <div className="flex justify-center gap-3 my-4">
            <Social url={socialLinks?.facebook}>
              <FaFacebook
                size={35}
                color={facebookColor}
                onMouseEnter={() => setFacebookColor("#0866FF")}
                onMouseLeave={() => setFacebookColor("#FFF")}
                style={{ transition: "color 0.3s" }}
              />
            </Social>

            <Social url={socialLinks?.youtube}>
              <FaYoutube
                size={35}
                color={youtubeColor}
                onMouseEnter={() => setYoutubeColor("#FF0033")}
                onMouseLeave={() => setYoutubeColor("#FFF")}
              />
            </Social>

            <Social url={socialLinks?.instagram}>
              <FaInstagram
                size={35}
                color={instagramColor}
                onMouseEnter={() => setInstagramColor("#CC27A0")}
                onMouseLeave={() => setInstagramColor("#FFF")}
              />
            </Social>
          </div>
        )} */}

        {empresa && (
          <div>
            <hr className="w-full my-10 text-amber-50" />

            <div className="w-full flex justify-center">
              <img className="w-50" src={empresa.logo} alt="Amplilume" />
            </div>
            <span className="text-gray-50 mb-5 mt-3">
              Siga a {empresa.organization} nas redes sociais 👇
            </span>
          </div>
        )}
        {empresaLinks && empresaLinks.length > 0 && (
          <div className=" mt-5 mb-10">
            {empresaLinks.map((link) => (
              <section
                style={{ backgroundColor: link.bg }}
                key={link.id}
                className="bg-white w-full py-2 rounded-lg select-none transition-transform hover:scale-105 cursor-pointer mb-4"
              >
                <a href={link.url} target="_blank">
                  <p
                    className="text-base md:text-lg"
                    style={{ color: link.color }}
                  >
                    {link.name}
                  </p>
                </a>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
