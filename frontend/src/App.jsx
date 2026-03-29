import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import "./App.css";

function Tile({ letter, state }) {
  const cls =
    state === "correct"
      ? "tile correct"
      : state === "present"
        ? "tile present"
        : state === "absent"
          ? "tile absent"
          : "tile empty";
  return (
    <div className={cls}>
      <span>{letter || ""}</span>
    </div>
  );
}

function Row({ word, feedback }) {
  const letters = (word || "     ").slice(0, 5).padEnd(5, " ").split("");
  const fb = feedback || [];
  return (
    <div className="row">
      {letters.map((L, i) => (
        <Tile key={i} letter={L.trim() ? L : ""} state={fb[i]} />
      ))}
    </div>
  );
}

function DailyPanel() {
  const [meta, setMeta] = useState(null);
  const [name, setName] = useState("");
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState([]);

  const loadMeta = useCallback(async () => {
    const m = await api("/daily/meta");
    setMeta(m);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await api("/daily/me");
      setSession(me);
      if (Array.isArray(me.guessHistory)) {
        setBoard(
          me.guessHistory.map((g) => ({
            word: g.word,
            feedback: g.feedback,
          }))
        );
      }
      return me;
    } catch {
      setSession(null);
      return null;
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const lb = await api("/daily/leaderboard");
      setRows(lb.leaderboard || []);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    loadMeta();
    refreshMe();
    loadLeaderboard();
  }, [loadMeta, refreshMe, loadLeaderboard]);

  async function handleEnter(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/daily/enter", { method: "POST", body: { displayName: name } });
      await refreshMe();
      setBoard([]);
      await loadLeaderboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuess(e) {
    e.preventDefault();
    const g = input.toLowerCase().trim();
    if (g.length !== 5) {
      setError("Five letters required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api("/daily/guess", { method: "POST", body: { guess: g } });
      setBoard((b) => [...b, { word: g, feedback: res.feedback }]);
      setInput("");
      await refreshMe();
      if (res.solved) await loadLeaderboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api("/daily/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setSession(null);
    setBoard([]);
  }

  if (!meta) return <p className="muted">Loading daily puzzle…</p>;

  return (
    <div className="panel">
      <header className="panel-head">
        <div>
          <h2>Global daily</h2>
          <p className="muted small">
            Same word for everyone · unlimited guesses
          </p>
        </div>
        {session && (
          <button type="button" className="btn ghost" onClick={handleLogout}>
            Leave daily
          </button>
        )}
      </header>

      {!session ? (
        <form className="form" onSubmit={handleEnter}>
          <label>
            Display name (unique today)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. blue_tiger"
              autoComplete="off"
            />
          </label>
          <button type="submit" className="btn primary" disabled={loading}>
            Play today
          </button>
        </form>
      ) : (
        <>
          <p className="welcome">
            Hi, <strong>{session.displayName}</strong>
            {session.solved ? (
              <span className="badge solved">Solved in {session.guessCount}</span>
            ) : null}
          </p>
          <div className="board">
            {board.map((row, i) => (
              <Row key={i} word={row.word} feedback={row.feedback} />
            ))}
          </div>
          {!session.solved ? (
            <form className="form inline" onSubmit={handleGuess}>
              <input
                className="guess-input"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5))}
                placeholder="Guess"
                maxLength={5}
                autoCapitalize="off"
              />
              <button type="submit" className="btn primary" disabled={loading}>
                Guess
              </button>
            </form>
          ) : null}
        </>
      )}

      {error ? <p className="error">{error}</p> : null}

      <aside className="leader">
        <h3>Today&apos;s leaderboard</h3>
        <p className="muted small leader-sub">
          Fastest solvers — each line shows the guesses they used.
        </p>
        <ol className="leader-list">
          {rows.length === 0 ? (
            <li className="muted">No solves yet</li>
          ) : (
            rows.map((r, i) => (
              <li key={i} className="leader-card">
                <div className="leader-card-head">
                  <span className="leader-rank">#{i + 1}</span>
                  <span className="leader-name">{r.displayName}</span>
                  <span className="muted leader-meta">
                    {r.guessCount} {r.guessCount === 1 ? "guess" : "guesses"}
                    {r.solvedAt ? ` · ${new Date(r.solvedAt).toLocaleTimeString()}` : ""}
                  </span>
                </div>
                {Array.isArray(r.guessHistory) && r.guessHistory.length > 0 ? (
                  <ul className="leader-guesses">
                    {r.guessHistory.map((g, gi) => (
                      <li key={gi} className="leader-guess-line">
                        <span className="leader-guess-word">{String(g.word || "").toUpperCase()}</span>
                        <span className="leader-mini-tiles" aria-hidden>
                          {(g.feedback || []).map((fb, fi) => (
                            <span key={fi} className={`leader-mini leader-mini--${fb}`} />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))
          )}
        </ol>
        <button type="button" className="btn ghost small" onClick={loadLeaderboard}>
          Refresh
        </button>
      </aside>
    </div>
  );
}

function FriendsPanel() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guess, setGuess] = useState("");
  const [board, setBoard] = useState([]);
  const [hint, setHint] = useState("");

  const refreshMe = useCallback(async () => {
    try {
      const data = await api("/user/me");
      setUser(data.userDetails);
      return data.userDetails;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  async function register(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/user/register", { method: "POST", body: { username } });
      await api("/user/login", { method: "POST", body: { username } });
      await refreshMe();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/user/login", { method: "POST", body: { username } });
      await refreshMe();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api("/user/logout", { method: "GET" });
    } catch {
      /* ignore */
    }
    setUser(null);
    setRoom(null);
    setBoard([]);
  }

  async function createRoom(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api("/room/create", { method: "POST", body: { roomName } });
      setRoom({
        code: res.roomCode,
        name: roomName,
        host: true,
        status: "waiting",
        players: [],
      });
      setHint(`Share code: ${res.roomCode}`);
      const st = await api(`/room/status/${res.roomCode}`);
      setRoom((r) => ({ ...r, ...mapStatus(st) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function mapStatus(st) {
    return {
      status: st.status,
      players: st.players || [],
      winner: st.winner,
      roomName: st.roomName,
    };
  }

  async function joinRoom(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const code = joinCode.trim().toUpperCase();
      await api(`/room/join/${code}`, { method: "POST" });
      const st = await api(`/room/status/${code}`);
      setRoom({
        code,
        name: st.roomName,
        host: false,
        ...mapStatus(st),
      });
      setHint(`Joined ${st.roomName}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshRoom() {
    if (!room?.code) return;
    try {
      const st = await api(`/room/status/${room.code}`);
      setRoom((r) => ({ ...r, ...mapStatus(st) }));
    } catch {
      /* ignore */
    }
  }

  async function startGame() {
    setError("");
    setLoading(true);
    try {
      await api(`/room/start/${room.code}`, { method: "POST" });
      await refreshRoom();
      setBoard([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitGuess(e) {
    e.preventDefault();
    const g = guess.toLowerCase().trim();
    if (g.length !== 5) {
      setError("Five letters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api(`/guess/${room.code}`, { method: "POST", body: { guess: g } });
      setBoard((b) => [...b, { word: g, feedback: res.feedback }]);
      setGuess("");
      setHint(res.message);
      await refreshRoom();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!room?.code || room.status !== "waiting") return;
    const t = setInterval(refreshRoom, 4000);
    return () => clearInterval(t);
  }, [room?.code, room?.status]);

  if (!user) {
    return (
      <div className="panel">
        <h2>Play with friends</h2>
        <p className="muted small">One username for private rooms (stored on the server).</p>
        <form className="form" onSubmit={register}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pick a name"
              autoComplete="username"
            />
          </label>
          <div className="btn-row">
            <button type="submit" className="btn primary" disabled={loading}>
              Register &amp; enter
            </button>
            <button type="button" className="btn secondary" disabled={loading} onClick={login}>
              Login only
            </button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="panel">
      <header className="panel-head">
        <div>
          <h2>Private room</h2>
          <p className="muted small">
            Logged in as <strong>{user.username}</strong>
          </p>
        </div>
        <button type="button" className="btn ghost" onClick={logout}>
          Log out
        </button>
      </header>

      {!room ? (
        <div className="split">
          <form className="form" onSubmit={createRoom}>
            <h3>Create</h3>
            <label>
              Room name
              <input value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </label>
            <button type="submit" className="btn primary" disabled={loading}>
              New room
            </button>
          </form>
          <form className="form" onSubmit={joinRoom}>
            <h3>Join</h3>
            <label>
              Room code
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABCDE"
              />
            </label>
            <button type="submit" className="btn secondary" disabled={loading}>
              Join
            </button>
          </form>
        </div>
      ) : (
        <div className="room-active">
          <div className="room-bar">
            <span>
              <strong>{room.name}</strong> · code <code>{room.code}</code>
            </span>
            <span className={`pill ${room.status}`}>{room.status}</span>
          </div>
          <p className="muted small">Players: {room.players?.join(", ") || "—"}</p>
          {room.winner ? (
            <p className="win">Winner: {room.winner.username}</p>
          ) : null}
          {room.host && room.status === "waiting" ? (
            <button type="button" className="btn primary" onClick={startGame} disabled={loading}>
              Start game (host)
            </button>
          ) : null}
          {!room.host && room.status === "waiting" ? (
            <p className="muted">Waiting for host to start…</p>
          ) : null}

          {room.status === "in-progress" || room.status === "finished" ? (
            <>
              <div className="board">
                {board.map((row, i) => (
                  <Row key={i} word={row.word} feedback={row.feedback} />
                ))}
              </div>
              {room.status === "in-progress" ? (
                <form className="form inline" onSubmit={submitGuess}>
                  <input
                    className="guess-input"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5))}
                    maxLength={5}
                  />
                  <button type="submit" className="btn primary" disabled={loading}>
                    Guess
                  </button>
                </form>
              ) : null}
            </>
          ) : null}

          <button type="button" className="btn ghost small" onClick={() => setRoom(null)}>
            Leave room view
          </button>
        </div>
      )}

      {hint && !error ? <p className="hint">{hint}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("daily");

  return (
    <div className="app">
      <header className="hero">
        <h1>Word Guess</h1>
        <p className="tagline">Daily puzzle for the world · private rooms for your crew</p>
        <nav className="tabs">
          <button
            type="button"
            className={tab === "daily" ? "tab active" : "tab"}
            onClick={() => setTab("daily")}
          >
            Global daily
          </button>
          <button
            type="button"
            className={tab === "friends" ? "tab active" : "tab"}
            onClick={() => setTab("friends")}
          >
            Friends room
          </button>
        </nav>
      </header>
      <main className="main">{tab === "daily" ? <DailyPanel /> : <FriendsPanel />}</main>
    </div>
  );
}
