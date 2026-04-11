import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import "../../../css/font.css";

const apiToken = import.meta.env.VITE_API_TOKEN;
const appId = import.meta.env.VITE_APP_ID;
const wssServer = import.meta.env.VITE_WSS_SERVER;

interface SpeechToken {
  final_token: string | null;
  partial_token: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Gurbani Navigator', href: dashboard().url },
];

function getLatestFinal(final: string, maxLength = 200) {
  if (final.length <= maxLength) return final;
  return "..." + final.slice(-maxLength);
}

const renderGurbani = (gurmukhi: string) => {
    return gurmukhi.split(" ").map((word, index) => {
      let color = "#000000ff";
      let cleanWord = word;
      let isFullVishraam = false;

      if (word.endsWith(";")) {
        color = "#e56c00";
        cleanWord = word.slice(0, -1);
        isFullVishraam = true;
      } else if (word.endsWith(",") || word.endsWith(".")) {
        color = "#196fb2ff";
        cleanWord = word.slice(0, -1);
      }

      return (
        <span key={index}>
          <span style={{ color }}>{cleanWord}</span>{" "}
        </span>
      );
    });
  };

interface Pankti {
  id: string,
  gurmukhi: string,
  translation: string,
};

export default function GurbaniNavigator() {
  const wsRef = useRef<WebSocket|null>(null);
  const [token, setToken] = useState<SpeechToken>({final_token: "", partial_token: ""});
  const [shabadId, setShabadId] = useState<string>("");
  const [lineId, setLineId] = useState<string>("");
  const [panktis, setPanktis] = useState<Pankti[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!wsRef.current) {
      const socket = new WebSocket(`${wssServer}?token=${apiToken}&appid=${appId}`);
      
      socket.onopen = () => console.log("Connected to WSS server");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "token") {
          setToken(token => {return {final_token: token.final_token + data.t, partial_token: data.pt}});

          setShabadId(data.sid);
          setLineId(data.lid);
        }
      };
      socket.onclose = () => console.log("Disconnected");

      wsRef.current = socket;
    }

    return () => wsRef.current?.close();
  }, [appId, apiToken, wssServer]);

  useEffect(() => {
    if (!shabadId || shabadId === "") {
      return;
    }

    axios.get(`/shabads/${shabadId}`)
      .then(res => {
        setPanktis(res.data.panktis)
      });
  }, [shabadId]);

  const matchingPanktis = panktis.filter(pankti => pankti.id === lineId);

  const currentPankti: Pankti|null = matchingPanktis.length === 1 ? matchingPanktis[0] : null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gurbani Navigator" />

      {currentPankti &&
          <div className='row mt-8 p-4 text-center'>
            <div className='col-12 shabad-text'
              style={{letterSpacing: '-1px', fontSize: '80px'}}
            >
              {renderGurbani(currentPankti.gurmukhi)}
            </div>
            <div className='col-12'>
              {currentPankti.translation}
            </div>
        </div>
      }

      <div
        className={`fixed right-5 bottom-5 w-[750px] overflow-hidden rounded-xl bg-gray-100 text-gray-900 shadow-2xl transition-all duration-300 ${
          isMinimized ? "h-[52px]" : "h-[400px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2">
          <span className="text-sm font-semibold tracking-wide">
            {token.partial_token ? 
              getLatestFinal(token.final_token + token.partial_token) : ''
            }
          </span>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-md px-2 py-1 text-lg hover:bg-gray-200 transition"
          >
            {isMinimized ? "▢" : "—"}
          </button>
        </div>

        {/* Body */}
        {!isMinimized && (
          <div className="h-[calc(100%-52px)] overflow-y-auto space-y-2">
            {panktis.map((pankti, index) => (
              <div
                key={index}
                className={`shabad-text border-b border-gray-300 px-3 py-2 leading-snug ${pankti.id === lineId ? 'bg-gray-200' : ''}`}
                style={{
                  fontSize: '20px',
                }}
              >
                {pankti.gurmukhi.replaceAll(";", "").replaceAll(".", "")}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}