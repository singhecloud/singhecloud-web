import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import "../../../css/font.css";
import { BookOpen, Check, Home, Search } from 'lucide-react';

interface SpeechToken {
  final_token: string;
  partial_token: string;
}

interface SearchPankti {
  id: string;
  gurmukhi: string;
  source_page: number;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Gurbani Navigator', href: dashboard().url },
];

function getLatestFinal(final: string, maxLength = 100) {
  if (final.length <= maxLength) return final;
  return final.slice(-maxLength);
}

function clearGurmukhi(gurmukhi: string) {
  return gurmukhi
    .replaceAll(";", "")
    .replaceAll(".", "")
    .replaceAll(",", "")
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
  const [page, setPage] = useState<string>("");
  const [shabadState, setShabadState] = useState<{current: number, home: number, shabadId: string}>({current: 0, home: 0, shabadId: ""});
  const [panktis, setPanktis] = useState<Pankti[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const { apiToken, appId, wssServer } = usePage().props;
  const [search, setSearch] = useState("");
  const [searchPanktis, setSearchPanktis] = useState([]);
  const [lineIds, setLineIds] = useState([]);
  const [visited, setVisited] = useState<number[]>([]);

  useEffect(() => {
    if (!wsRef.current) {
      const socket = new WebSocket(`${wssServer}?token=${apiToken}&appid=${appId}`);
      
      socket.onopen = () => console.log("Connected to WSS server");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "token") {
          setToken(token => {return {final_token: token.final_token + data.t, partial_token: data.pt}});
        } else if (data.type === "pankti") {
          setVisited(visited =>
            visited.includes(data.c)
              ? visited
              : [...visited, data.c]
          );
          setShabadState({current: data.c ?? 0, home: data.h ?? 0, shabadId: data.s ?? ""});
          if (page !== "shabad") {
            setPage("shabad");
          }
        } else if (data.type === "search-p") {
          setLineIds(data.p);
        } else if (data.type === "page") {
          setPage(data.p);
        }
      };
      socket.onclose = () => console.log("Disconnected");

      wsRef.current = socket;
    }

    return () => wsRef.current?.close();
  }, [appId, apiToken, wssServer, page]);

  useEffect(() => {
    if (shabadState.shabadId === "") {
      return;
    }

    setVisited([]);
    axios.get(`/shabads/${shabadState.shabadId}`)
      .then(res => {
        setPanktis(res.data.panktis)
      });
  }, [shabadState.shabadId]);

  useEffect(() => {
    if (lineIds.length === 0) {
      return;
    }

    axios.post('/panktis', {
      lines: lineIds
    }).then(res => setSearchPanktis(res.data));
  }, [lineIds, setSearchPanktis])

  const syncCurrentPankti = useCallback((idx: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'pankti',
        s: shabadState.shabadId,
        c: idx,
        h: shabadState.home,
        b: null,
      })
    );
  }, [shabadState.shabadId, shabadState.home]);

  const syncSearchPankti = useCallback((id: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'search-select',
        id: id
      })
    );
  }, []);

  const syncHome = useCallback((home: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'pankti',
        s: shabadState.shabadId,
        c: shabadState.current,
        h: home,
        b: null,
      })
    );

    setShabadState(state => {return {...state, home: home}});
  }, [shabadState.current, shabadState.shabadId])

  const syncPage = useCallback((navPage: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
      JSON.stringify({
          type: 'page',
          p: navPage
        })
      )
    }

    if (navPage !== page) {
      setPage(navPage);
      if (page === 'search') {
        setSearch("");
      }
    }
  }, [page]);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
      JSON.stringify({
          type: 'search-term',
          s: search
        })
      )
    }
  }, [search]);

  const currentPankti: Pankti|null = panktis[shabadState.current] ?? null;

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
        className={`fixed right-2 bottom-2 w-[40%] rounded-xl bg-gray-50 text-gray-800 transition-all duration-300 border ${
          isMinimized ? "h-[52px]" : "h-[40%]"
        } flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2 flex-none">
          <span className="text-sm font-semibold tracking-wide">
            {getLatestFinal(token.final_token + token.partial_token)}
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
          <>
            {page === 'shabad' &&
              <div className="flex-1 overflow-y-auto space-y-2">
                {panktis.map((pankti, index) => (
                  <div
                    key={index}
                    className={`shabad-text border-b border-gray-200 cursor-default font-normal px-2 py-2 ${
                      index === shabadState.current ? "bg-gray-200" : ""
                    }`}
                    style={{ fontSize: "20px" }}
                  >
                    <div className="flex items-center gap-2">

                      <div className="group w-6 h-6 flex items-center justify-center">
  
                        {index === shabadState.home ? (
                          <Home />
                        ) : (
                          <>
                            <div className="group-hover:opacity-0 opacity-100 transition-opacity duration-150 text-gray-500">
                              {visited.includes(index) && <Check size={16} />}
                            </div>

                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <Home onClick={() => syncHome(index)} />
                            </div>
                          </>
                        )}

                      </div>

                      <div onClick={() => syncCurrentPankti(index)}>
                        {clearGurmukhi(pankti.gurmukhi)}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            }

            {
              page === 'search' &&
              <div className="flex-1 overflow-y-auto space-y-2">
                <div className='m-2'>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="gurmukhi bg-white w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-500"
                    placeholder="Koj..."
                    style={{
                      fontSize: '18px'
                    }}
                  />
                </div>
                <div>
                  {searchPanktis.map((searchPankti: SearchPankti, index) => (
                    <div
                      key={searchPankti.id}
                      className={`gurmukhi border-b border-gray-200 cursor-default font-normal px-2 py-2 ${
                        index === 0 ? 'border-t' : ''
                      }`}
                      onClick={() => syncSearchPankti(searchPankti.id)}
                    >
                      {clearGurmukhi(searchPankti.gurmukhi)}
                    </div>
                  ))}
                </div>
              </div>
            }

            {/* Tabs */}
            <div className="flex items-center border-t border-gray-300 flex-none">
              <button
                className={`flex flex-col items-center text-xs text-gray-600 px-4 py-2 hover:text-black ${page === 'search' ? ' bg-gray-300 text-gray-800' : ''}`}
                onClick={() => syncPage('search')}
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                className={`flex flex-col items-center text-xs text-gray-600 px-4 py-2 hover:text-black ${page === 'shabad' ? ' bg-gray-300 text-gray-800' : ''}`}
                onClick={() => syncPage('shabad')}
              >
                <BookOpen className="h-5 w-5" />
              </button>
            </div>

          </>
        )}
      </div>
    </AppLayout>
  );
}