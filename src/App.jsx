import { useEffect, useMemo, useState } from "react";
import {
  getAll,
  makeId,
  removeById,
  seedIfNeeded,
  upsert
} from "./data/localDb";

const navItems = [
  { id: "kanban", name: "Kanban", icon: "◆" },
  { id: "projects", name: "Projects", icon: "◇" },
  { id: "notes", name: "Notes", icon: "○" },
  { id: "docs", name: "Docs", icon: "◎" }
];

const labelStyles = {
  cyan: "bg-neon-cyan/20 text-neon-cyan",
  purple: "bg-neon-purple/20 text-neon-purple",
  blue: "bg-neon-blue/20 text-neon-blue",
  green: "bg-neon-green/20 text-neon-green",
  rose: "bg-rose-500/20 text-rose-300",
  amber: "bg-amber-500/20 text-amber-300",
  teal: "bg-teal-500/20 text-teal-300",
  pink: "bg-neon-pink/20 text-neon-pink",
  slate: "bg-slate-500/20 text-slate-300"
};

const labelPalette = [
  "cyan",
  "purple",
  "blue",
  "green",
  "rose",
  "amber",
  "teal",
  "pink"
];

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null || stored === undefined) {
        return initialValue;
      }
      return JSON.parse(stored);
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage write errors.
    }
  }, [key, value]);

  return [value, setValue];
};

const sortByOrder = (items) => [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

const TagPill = ({ label }) => {
  if (!label) return null;
  const style = labelStyles[label.color] || labelStyles.slate;
  return (
    <span className={`tag ${style} px-2 py-1 rounded-md text-[0.6rem] uppercase`}>{label.name}</span>
  );
};

const SectionHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
    <div>
      <h2 className="text-lg lg:text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

function App() {
  const [activeView, setActiveView] = useLocalStorage("oc-ui-view", "kanban");
  const [activeBoardId, setActiveBoardId] = useLocalStorage("oc-ui-board", null);
  const [activeProjectId, setActiveProjectId] = useLocalStorage("oc-ui-project", null);
  const [activeNoteId, setActiveNoteId] = useLocalStorage("oc-ui-note", null);
  const [activeDocId, setActiveDocId] = useLocalStorage("oc-ui-doc", null);

  const [boards, setBoards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [docs, setDocs] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newBoardName, setNewBoardName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSummary, setNewProjectSummary] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("cyan");
  const [searchNotes, setSearchNotes] = useState("");
  const [searchDocs, setSearchDocs] = useState("");
  const [filterNoteTag, setFilterNoteTag] = useState("all");
  const [filterDocTag, setFilterDocTag] = useState("all");

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      await seedIfNeeded();
      const [boardsData, columnsData, cardsData, projectsData, notesData, docsData, labelsData] =
        await Promise.all([
          getAll("boards"),
          getAll("columns"),
          getAll("cards"),
          getAll("projects"),
          getAll("notes"),
          getAll("docs"),
          getAll("labels")
        ]);
      if (!mounted) return;
      setBoards(boardsData);
      setColumns(columnsData);
      setCards(cardsData);
      setProjects(projectsData);
      setNotes(notesData);
      setDocs(docsData);
      setLabels(labelsData);
      setLoading(false);
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeBoardId && boards.length > 0) {
      setActiveBoardId(boards[0].id);
    }
  }, [activeBoardId, boards, setActiveBoardId]);

  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProjectId, projects, setActiveProjectId]);

  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, notes, setActiveNoteId]);

  useEffect(() => {
    if (!activeDocId && docs.length > 0) {
      setActiveDocId(docs[0].id);
    }
  }, [activeDocId, docs, setActiveDocId]);

  const labelsById = useMemo(
    () => Object.fromEntries(labels.map((label) => [label.id, label])),
    [labels]
  );

  const activeBoard = useMemo(
    () => boards.find((board) => board.id === activeBoardId) || boards[0] || null,
    [boards, activeBoardId]
  );

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0] || null,
    [projects, activeProjectId]
  );

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) || notes[0] || null,
    [notes, activeNoteId]
  );

  const activeDoc = useMemo(
    () => docs.find((doc) => doc.id === activeDocId) || docs[0] || null,
    [docs, activeDocId]
  );

  const boardColumns = useMemo(() => {
    if (!activeBoard) return [];
    const boardColumnList = columns.filter((column) => column.boardId === activeBoard.id);
    if (activeBoard.columnOrder?.length) {
      const map = new Map(boardColumnList.map((column) => [column.id, column]));
      return activeBoard.columnOrder.map((id) => map.get(id)).filter(Boolean);
    }
    return sortByOrder(boardColumnList);
  }, [columns, activeBoard]);

  const cardsByColumn = useMemo(() => {
    const grouped = new Map();
    cards.forEach((card) => {
      if (!grouped.has(card.columnId)) {
        grouped.set(card.columnId, []);
      }
      grouped.get(card.columnId).push(card);
    });
    grouped.forEach((list, key) => {
      grouped.set(key, sortByOrder(list));
    });
    return grouped;
  }, [cards]);

  const filteredNotes = useMemo(() => {
    const query = searchNotes.trim().toLowerCase();
    return notes.filter((note) => {
      if (filterNoteTag !== "all" && !note.tagIds?.includes(filterNoteTag)) {
        return false;
      }
      if (!query) return true;
      return (
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query)
      );
    });
  }, [notes, searchNotes, filterNoteTag]);

  const filteredDocs = useMemo(() => {
    const query = searchDocs.trim().toLowerCase();
    return docs.filter((doc) => {
      if (filterDocTag !== "all" && !doc.tagIds?.includes(filterDocTag)) {
        return false;
      }
      if (!query) return true;
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.body.toLowerCase().includes(query)
      );
    });
  }, [docs, searchDocs, filterDocTag]);

  const updateCollection = (setter, list, updated) => {
    setter(list.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleAddBoard = async () => {
    const baseName = newBoardName.trim() || `Board ${boards.length + 1}`;
    const id = makeId("board");
    const board = {
      id,
      name: baseName,
      columnOrder: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBoards((prev) => [...prev, board]);
    setNewBoardName("");
    setActiveBoardId(id);
    await upsert("boards", board);
  };

  const handleUpdateBoard = async (boardId, updates) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;
    const updated = { ...board, ...updates, updatedAt: new Date().toISOString() };
    updateCollection(setBoards, boards, updated);
    await upsert("boards", updated);
  };

  const handleDeleteBoard = async (boardId) => {
    const remainingBoards = boards.filter((board) => board.id !== boardId);
    const columnsToRemove = columns.filter((column) => column.boardId === boardId);
    const cardsToRemove = cards.filter((card) => card.boardId === boardId);
    const updatedProjects = projects.map((project) =>
      project.boardId === boardId ? { ...project, boardId: null, updatedAt: new Date().toISOString() } : project
    );

    setBoards(remainingBoards);
    setColumns(columns.filter((column) => column.boardId !== boardId));
    setCards(cards.filter((card) => card.boardId !== boardId));
    setProjects(updatedProjects);
    if (activeBoardId === boardId) {
      setActiveBoardId(remainingBoards[0]?.id || null);
    }

    await removeById("boards", boardId);
    await Promise.all([
      ...columnsToRemove.map((column) => removeById("columns", column.id)),
      ...cardsToRemove.map((card) => removeById("cards", card.id)),
      ...updatedProjects.map((project) => upsert("projects", project))
    ]);
  };

  const handleAddColumn = async () => {
    if (!activeBoard || !newColumnName.trim()) return;
    const id = makeId("col");
    const order = boardColumns.length + 1;
    const column = {
      id,
      boardId: activeBoard.id,
      name: newColumnName.trim(),
      order
    };
    const updatedBoard = {
      ...activeBoard,
      columnOrder: [...(activeBoard.columnOrder || []), id],
      updatedAt: new Date().toISOString()
    };
    setColumns((prev) => [...prev, column]);
    setBoards((prev) => prev.map((board) => (board.id === activeBoard.id ? updatedBoard : board)));
    setNewColumnName("");
    await Promise.all([upsert("columns", column), upsert("boards", updatedBoard)]);
  };

  const handleUpdateColumn = async (columnId, name) => {
    const column = columns.find((item) => item.id === columnId);
    if (!column) return;
    const updated = { ...column, name };
    setColumns((prev) => prev.map((item) => (item.id === columnId ? updated : item)));
    await upsert("columns", updated);
  };

  const handleDeleteColumn = async (columnId) => {
    const column = columns.find((item) => item.id === columnId);
    if (!column) return;
    const remainingColumns = columns.filter((item) => item.id !== columnId);
    const cardsToRemove = cards.filter((card) => card.columnId === columnId);
    setColumns(remainingColumns);
    setCards(cards.filter((card) => card.columnId !== columnId));

    if (activeBoard) {
      const updatedBoard = {
        ...activeBoard,
        columnOrder: (activeBoard.columnOrder || []).filter((id) => id !== columnId),
        updatedAt: new Date().toISOString()
      };
      setBoards((prev) => prev.map((board) => (board.id === activeBoard.id ? updatedBoard : board)));
      await upsert("boards", updatedBoard);
    }

    await removeById("columns", columnId);
    await Promise.all(cardsToRemove.map((card) => removeById("cards", card.id)));
  };

  const handleAddCard = async (columnId) => {
    const title = "New task";
    const order = (cardsByColumn.get(columnId) || []).length + 1;
    const card = {
      id: makeId("card"),
      boardId: activeBoard?.id || null,
      columnId,
      title,
      description: "",
      labelIds: [],
      owner: "",
      due: "",
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCards((prev) => [...prev, card]);
    await upsert("cards", card);
  };

  const handleUpdateCard = async (cardId, updates) => {
    const card = cards.find((item) => item.id === cardId);
    if (!card) return;
    const updated = { ...card, ...updates, updatedAt: new Date().toISOString() };
    updateCollection(setCards, cards, updated);
    await upsert("cards", updated);
  };

  const handleDeleteCard = async (cardId) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
    await removeById("cards", cardId);
  };

  const handleDropCard = async (event, columnId) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    const card = cards.find((item) => item.id === cardId);
    if (!card) return;
    const order = (cardsByColumn.get(columnId) || []).length + 1;
    await handleUpdateCard(cardId, { columnId, order });
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    const project = {
      id: makeId("project"),
      name: newProjectName.trim(),
      summary: newProjectSummary.trim(),
      boardId: activeBoard?.id || null,
      status: "Planning",
      tagIds: [],
      updatedAt: new Date().toISOString()
    };
    setProjects((prev) => [...prev, project]);
    setActiveProjectId(project.id);
    setNewProjectName("");
    setNewProjectSummary("");
    await upsert("projects", project);
  };

  const handleUpdateProject = async (projectId, updates) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const updated = { ...project, ...updates, updatedAt: new Date().toISOString() };
    updateCollection(setProjects, projects, updated);
    await upsert("projects", updated);
  };

  const handleDeleteProject = async (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(projects.find((project) => project.id !== projectId)?.id || null);
    }
    await removeById("projects", projectId);
  };

  const handleAddNote = async () => {
    const note = {
      id: makeId("note"),
      title: "Untitled note",
      body: "",
      tagIds: [],
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
    await upsert("notes", note);
  };

  const handleUpdateNote = async (noteId, updates) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    const updated = { ...note, ...updates, updatedAt: new Date().toISOString() };
    updateCollection(setNotes, notes, updated);
    await upsert("notes", updated);
  };

  const handleDeleteNote = async (noteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(notes.find((note) => note.id !== noteId)?.id || null);
    }
    await removeById("notes", noteId);
  };

  const handleAddDoc = async () => {
    const doc = {
      id: makeId("doc"),
      title: "Untitled doc",
      body: "",
      tagIds: [],
      updatedAt: new Date().toISOString()
    };
    setDocs((prev) => [doc, ...prev]);
    setActiveDocId(doc.id);
    await upsert("docs", doc);
  };

  const handleUpdateDoc = async (docId, updates) => {
    const doc = docs.find((item) => item.id === docId);
    if (!doc) return;
    const updated = { ...doc, ...updates, updatedAt: new Date().toISOString() };
    updateCollection(setDocs, docs, updated);
    await upsert("docs", updated);
  };

  const handleDeleteDoc = async (docId) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== docId));
    if (activeDocId === docId) {
      setActiveDocId(docs.find((doc) => doc.id !== docId)?.id || null);
    }
    await removeById("docs", docId);
  };

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    const label = {
      id: makeId("label"),
      name: newLabelName.trim(),
      color: newLabelColor
    };
    setLabels((prev) => [...prev, label]);
    setNewLabelName("");
    await upsert("labels", label);
  };

  const handleUpdateLabel = async (labelId, updates) => {
    const label = labels.find((item) => item.id === labelId);
    if (!label) return;
    const updated = { ...label, ...updates };
    updateCollection(setLabels, labels, updated);
    await upsert("labels", updated);
  };

  const handleDeleteLabel = async (labelId) => {
    const updatedCards = cards.map((card) => ({
      ...card,
      labelIds: (card.labelIds || []).filter((id) => id !== labelId)
    }));
    const updatedProjects = projects.map((project) => ({
      ...project,
      tagIds: (project.tagIds || []).filter((id) => id !== labelId)
    }));
    const updatedNotes = notes.map((note) => ({
      ...note,
      tagIds: (note.tagIds || []).filter((id) => id !== labelId)
    }));
    const updatedDocs = docs.map((doc) => ({
      ...doc,
      tagIds: (doc.tagIds || []).filter((id) => id !== labelId)
    }));

    setLabels((prev) => prev.filter((label) => label.id !== labelId));
    setCards(updatedCards);
    setProjects(updatedProjects);
    setNotes(updatedNotes);
    setDocs(updatedDocs);

    await removeById("labels", labelId);
    await Promise.all([
      ...updatedCards.map((card) => upsert("cards", card)),
      ...updatedProjects.map((project) => upsert("projects", project)),
      ...updatedNotes.map((note) => upsert("notes", note)),
      ...updatedDocs.map((doc) => upsert("docs", doc))
    ]);
  };

  const toggleTag = (ids, tagId) => {
    if (ids?.includes(tagId)) {
      return ids.filter((id) => id !== tagId);
    }
    return [...(ids || []), tagId];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 text-slate-100 flex items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-slate-300 shadow-glass">
          Loading local workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 text-slate-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-glow opacity-60" />
        <div className="absolute inset-0 bg-glow-bottom opacity-40" />
        <div className="absolute inset-0 bg-grid bg-[length:24px_24px] opacity-[0.15]" />
        <div className="absolute -top-40 right-20 h-96 w-96 rounded-full bg-aurora-600/20 blur-[150px] animate-pulse-slow" />
        <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-neon-cyan/15 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/3 h-64 w-64 rounded-full bg-neon-purple/15 blur-[120px] animate-pulse-slow" />
      </div>

      <main className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <header className="glass-elevated rounded-2xl lg:rounded-3xl px-5 lg:px-8 py-5 lg:py-6 shadow-glass-lg mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">
                Mission Control
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gradient tracking-tight">
                Openclaw Operations
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-subtle flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 status-pulse" />
                <span className="hidden sm:inline">Local workspace ready</span>
                <span className="sm:hidden">Local only</span>
              </div>
              <button
                className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                onClick={handleAddBoard}
              >
                New board
              </button>
            </div>
          </div>
        </header>

        <nav className="mb-6 lg:mb-8 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 rounded-full px-4 lg:px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeView === item.id
                    ? "tab-active text-white"
                    : "tab-inactive text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-xs opacity-60">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {activeView === "kanban" && (
          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="glass-elevated rounded-2xl lg:rounded-3xl p-5 lg:p-6 shadow-glass-lg">
              <SectionHeader
                title={activeBoard ? `Kanban • ${activeBoard.name}` : "Kanban"}
                subtitle="Boards, columns, and cards live locally"
                actions={
                  <>
                    <select
                      value={activeBoard?.id || ""}
                      onChange={(event) => setActiveBoardId(event.target.value)}
                      className="glass-subtle rounded-full px-4 py-2 text-xs text-slate-300"
                    >
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-secondary rounded-full px-4 py-2 text-xs font-medium text-slate-300"
                      onClick={handleAddColumn}
                    >
                      + Column
                    </button>
                  </>
                }
              />

              {activeBoard && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    value={activeBoard.name}
                    onChange={(event) =>
                      handleUpdateBoard(activeBoard.id, { name: event.target.value })
                    }
                    placeholder="Board name"
                    className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 flex-1"
                  />
                  <button
                    className="btn-secondary rounded-xl px-4 py-2 text-sm text-rose-300"
                    onClick={() => handleDeleteBoard(activeBoard.id)}
                  >
                    Delete board
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  value={newBoardName}
                  onChange={(event) => setNewBoardName(event.target.value)}
                  placeholder="New board name"
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 flex-1"
                />
                <button
                  className="btn-secondary rounded-xl px-4 py-2 text-sm text-slate-200"
                  onClick={handleAddBoard}
                >
                  Create board
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  value={newColumnName}
                  onChange={(event) => setNewColumnName(event.target.value)}
                  placeholder="Add column to active board"
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 flex-1"
                />
                <button
                  className="btn-secondary rounded-xl px-4 py-2 text-sm text-slate-200"
                  onClick={handleAddColumn}
                >
                  Add column
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {boardColumns.map((column) => (
                  <div
                    key={column.id}
                    className="kanban-column p-4"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropCard(event, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <input
                        value={column.name}
                        onChange={(event) => handleUpdateColumn(column.id, event.target.value)}
                        className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                          {(cardsByColumn.get(column.id) || []).length}
                        </span>
                        <button
                          className="text-xs text-rose-300"
                          onClick={() => handleDeleteColumn(column.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(cardsByColumn.get(column.id) || []).map((card) => (
                        <div
                          key={card.id}
                          className="glass-subtle task-card rounded-xl p-3.5 cursor-grab"
                          draggable
                          onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-white leading-snug">
                              {card.title}
                            </p>
                            <button
                              className="text-xs text-rose-300"
                              onClick={() => handleDeleteCard(card.id)}
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">
                            {card.description || "No details yet."}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {(card.labelIds || []).map((labelId) => (
                                <TagPill key={labelId} label={labelsById[labelId]} />
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-medium">
                                {card.owner ? card.owner[0] : "•"}
                              </span>
                              <span className={card.due === "Done" ? "text-emerald-400" : ""}>
                                {card.due || ""}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <input
                              value={card.title}
                              onChange={(event) => handleUpdateCard(card.id, { title: event.target.value })}
                              className="glass-subtle rounded-lg px-2 py-1 text-xs text-slate-200 w-full"
                              placeholder="Card title"
                            />
                            <textarea
                              value={card.description}
                              onChange={(event) => handleUpdateCard(card.id, { description: event.target.value })}
                              className="glass-subtle rounded-lg px-2 py-1 text-xs text-slate-200 w-full h-16 resize-none"
                              placeholder="Card details"
                            />
                            <input
                              value={card.owner}
                              onChange={(event) => handleUpdateCard(card.id, { owner: event.target.value })}
                              className="glass-subtle rounded-lg px-2 py-1 text-xs text-slate-200 w-full"
                              placeholder="Owner"
                            />
                            <input
                              value={card.due}
                              onChange={(event) => handleUpdateCard(card.id, { due: event.target.value })}
                              className="glass-subtle rounded-lg px-2 py-1 text-xs text-slate-200 w-full"
                              placeholder="Due"
                            />
                            <div className="flex flex-wrap gap-1">
                              {labels.map((label) => (
                                <button
                                  key={label.id}
                                  className={`tag px-2 py-1 rounded-md text-[0.6rem] uppercase ${
                                    card.labelIds?.includes(label.id)
                                      ? labelStyles[label.color]
                                      : "bg-white/5 text-slate-400"
                                  }`}
                                  onClick={() =>
                                    handleUpdateCard(card.id, {
                                      labelIds: toggleTag(card.labelIds || [], label.id)
                                    })
                                  }
                                >
                                  {label.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn-secondary rounded-full px-3 py-1.5 text-xs text-slate-300 mt-3"
                      onClick={() => handleAddCard(column.id)}
                    >
                      + Card
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4 lg:space-y-5">
              <div className="glass rounded-2xl p-5 shadow-glass">
                <h3 className="text-base font-semibold mb-3">Boards</h3>
                <div className="space-y-2">
                  {boards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => setActiveBoardId(board.id)}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-colors ${
                        activeBoard?.id === board.id
                          ? "bg-white/10 text-white"
                          : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{board.name}</span>
                        <span className="text-xs text-slate-500">
                          {columns.filter((column) => column.boardId === board.id).length} cols
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-5 shadow-glass">
                <h3 className="text-base font-semibold mb-3">Labels</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1"
                    >
                      <input
                        value={label.name}
                        onChange={(event) => handleUpdateLabel(label.id, { name: event.target.value })}
                        className="bg-transparent text-xs text-slate-200 w-24"
                      />
                      <select
                        value={label.color}
                        onChange={(event) => handleUpdateLabel(label.id, { color: event.target.value })}
                        className="bg-transparent text-xs text-slate-400"
                      >
                        {labelPalette.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <button
                        className="text-xs text-rose-300"
                        onClick={() => handleDeleteLabel(label.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newLabelName}
                    onChange={(event) => setNewLabelName(event.target.value)}
                    placeholder="New label"
                    className="glass-subtle rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 flex-1"
                  />
                  <select
                    value={newLabelColor}
                    onChange={(event) => setNewLabelColor(event.target.value)}
                    className="glass-subtle rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    {labelPalette.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-secondary rounded-lg px-3 py-2 text-xs text-slate-200"
                    onClick={handleAddLabel}
                  >
                    Add
                  </button>
                </div>
              </div>
            </aside>
          </section>
        )}

        {activeView === "projects" && (
          <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <aside className="glass rounded-2xl p-5 shadow-glass">
              <SectionHeader
                title="Projects"
                subtitle="Linked to kanban boards"
                actions={
                  <button className="btn-secondary rounded-full px-4 py-2 text-xs" onClick={handleAddProject}>
                    + Project
                  </button>
                }
              />
              <div className="space-y-3 mb-4">
                <input
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="Project name"
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <textarea
                  value={newProjectSummary}
                  onChange={(event) => setNewProjectSummary(event.target.value)}
                  placeholder="Short summary"
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 h-20 resize-none"
                />
              </div>
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setActiveProjectId(project.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-colors ${
                      activeProject?.id === project.id
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{project.name}</span>
                      <span className="text-xs text-slate-500">{project.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
            <div className="glass-elevated rounded-2xl lg:rounded-3xl p-5 lg:p-6 shadow-glass-lg">
              {activeProject ? (
                <>
                  <SectionHeader
                    title={activeProject.name}
                    subtitle="Project detail"
                    actions={
                      <button
                        className="btn-secondary rounded-full px-4 py-2 text-xs text-rose-300"
                        onClick={() => handleDeleteProject(activeProject.id)}
                      >
                        Delete
                      </button>
                    }
                  />
                  <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-3">
                      <input
                        value={activeProject.name}
                        onChange={(event) =>
                          handleUpdateProject(activeProject.id, { name: event.target.value })
                        }
                        className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                      />
                      <textarea
                        value={activeProject.summary}
                        onChange={(event) =>
                          handleUpdateProject(activeProject.id, { summary: event.target.value })
                        }
                        className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 h-32 resize-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        {labels.map((label) => (
                          <button
                            key={label.id}
                            className={`tag px-2 py-1 rounded-md text-[0.6rem] uppercase ${
                              activeProject.tagIds?.includes(label.id)
                                ? labelStyles[label.color]
                                : "bg-white/5 text-slate-400"
                            }`}
                            onClick={() =>
                              handleUpdateProject(activeProject.id, {
                                tagIds: toggleTag(activeProject.tagIds || [], label.id)
                              })
                            }
                          >
                            {label.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <select
                        value={activeProject.status}
                        onChange={(event) =>
                          handleUpdateProject(activeProject.id, { status: event.target.value })
                        }
                        className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                      >
                        <option>Planning</option>
                        <option>In progress</option>
                        <option>Review</option>
                        <option>Done</option>
                      </select>
                      <select
                        value={activeProject.boardId || ""}
                        onChange={(event) =>
                          handleUpdateProject(activeProject.id, { boardId: event.target.value })
                        }
                        className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                      >
                        <option value="">No board linked</option>
                        {boards.map((board) => (
                          <option key={board.id} value={board.id}>
                            {board.name}
                          </option>
                        ))}
                      </select>
                      {activeProject.boardId && (
                        <button
                          className="btn-secondary rounded-xl px-4 py-2 text-sm text-slate-200"
                          onClick={() => {
                            setActiveBoardId(activeProject.boardId);
                            setActiveView("kanban");
                          }}
                        >
                          Open linked board
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">Create a project to get started.</div>
              )}
            </div>
          </section>
        )}

        {activeView === "notes" && (
          <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <aside className="glass rounded-2xl p-5 shadow-glass">
              <SectionHeader
                title="Notes"
                subtitle="Local capture with tag search"
                actions={
                  <button className="btn-secondary rounded-full px-4 py-2 text-xs" onClick={handleAddNote}>
                    + Note
                  </button>
                }
              />
              <div className="space-y-3 mb-4">
                <input
                  value={searchNotes}
                  onChange={(event) => setSearchNotes(event.target.value)}
                  placeholder="Search notes"
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <select
                  value={filterNoteTag}
                  onChange={(event) => setFilterNoteTag(event.target.value)}
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                >
                  <option value="all">All tags</option>
                  {labels.map((label) => (
                    <option key={label.id} value={label.id}>
                      {label.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-colors ${
                      activeNote?.id === note.id
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{note.title}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
            <div className="glass-elevated rounded-2xl lg:rounded-3xl p-5 lg:p-6 shadow-glass-lg">
              {activeNote ? (
                <>
                  <SectionHeader
                    title={activeNote.title}
                    subtitle="Note detail"
                    actions={
                      <button
                        className="btn-secondary rounded-full px-4 py-2 text-xs text-rose-300"
                        onClick={() => handleDeleteNote(activeNote.id)}
                      >
                        Delete
                      </button>
                    }
                  />
                  <div className="space-y-4">
                    <input
                      value={activeNote.title}
                      onChange={(event) =>
                        handleUpdateNote(activeNote.id, { title: event.target.value })
                      }
                      className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                    />
                    <textarea
                      value={activeNote.body}
                      onChange={(event) =>
                        handleUpdateNote(activeNote.id, { body: event.target.value })
                      }
                      className="glass-subtle rounded-xl px-4 py-3 text-sm text-slate-200 h-64 resize-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label) => (
                        <button
                          key={label.id}
                          className={`tag px-2 py-1 rounded-md text-[0.6rem] uppercase ${
                            activeNote.tagIds?.includes(label.id)
                              ? labelStyles[label.color]
                              : "bg-white/5 text-slate-400"
                          }`}
                          onClick={() =>
                            handleUpdateNote(activeNote.id, {
                              tagIds: toggleTag(activeNote.tagIds || [], label.id)
                            })
                          }
                        >
                          {label.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">Create a note to get started.</div>
              )}
            </div>
          </section>
        )}

        {activeView === "docs" && (
          <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <aside className="glass rounded-2xl p-5 shadow-glass">
              <SectionHeader
                title="Docs"
                subtitle="Local documentation library"
                actions={
                  <button className="btn-secondary rounded-full px-4 py-2 text-xs" onClick={handleAddDoc}>
                    + Doc
                  </button>
                }
              />
              <div className="space-y-3 mb-4">
                <input
                  value={searchDocs}
                  onChange={(event) => setSearchDocs(event.target.value)}
                  placeholder="Search docs"
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <select
                  value={filterDocTag}
                  onChange={(event) => setFilterDocTag(event.target.value)}
                  className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                >
                  <option value="all">All tags</option>
                  {labels.map((label) => (
                    <option key={label.id} value={label.id}>
                      {label.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-colors ${
                      activeDoc?.id === doc.id
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{doc.title}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
            <div className="glass-elevated rounded-2xl lg:rounded-3xl p-5 lg:p-6 shadow-glass-lg">
              {activeDoc ? (
                <>
                  <SectionHeader
                    title={activeDoc.title}
                    subtitle="Doc detail"
                    actions={
                      <button
                        className="btn-secondary rounded-full px-4 py-2 text-xs text-rose-300"
                        onClick={() => handleDeleteDoc(activeDoc.id)}
                      >
                        Delete
                      </button>
                    }
                  />
                  <div className="space-y-4">
                    <input
                      value={activeDoc.title}
                      onChange={(event) =>
                        handleUpdateDoc(activeDoc.id, { title: event.target.value })
                      }
                      className="glass-subtle rounded-xl px-4 py-2 text-sm text-slate-200"
                    />
                    <textarea
                      value={activeDoc.body}
                      onChange={(event) =>
                        handleUpdateDoc(activeDoc.id, { body: event.target.value })
                      }
                      className="glass-subtle rounded-xl px-4 py-3 text-sm text-slate-200 h-72 resize-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label) => (
                        <button
                          key={label.id}
                          className={`tag px-2 py-1 rounded-md text-[0.6rem] uppercase ${
                            activeDoc.tagIds?.includes(label.id)
                              ? labelStyles[label.color]
                              : "bg-white/5 text-slate-400"
                          }`}
                          onClick={() =>
                            handleUpdateDoc(activeDoc.id, {
                              tagIds: toggleTag(activeDoc.tagIds || [], label.id)
                            })
                          }
                        >
                          {label.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">Create a doc to get started.</div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-8 lg:mt-10 text-center">
          <p className="text-xs text-slate-500">
            Openclaw Mission Control • <span className="text-slate-600">Local-only v1</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
