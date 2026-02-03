const DB_NAME = "openclaw-dashboard";
const DB_VERSION = 1;

let dbPromise;

const createStore = (db, name, options = {}, indexes = []) => {
  if (!db.objectStoreNames.contains(name)) {
    const store = db.createObjectStore(name, options);
    indexes.forEach(({ name: indexName, keyPath, options: indexOptions }) => {
      store.createIndex(indexName, keyPath, indexOptions);
    });
  }
};

export const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        createStore(db, "boards", { keyPath: "id" });
        createStore(
          db,
          "columns",
          { keyPath: "id" },
          [{ name: "boardId", keyPath: "boardId", options: { unique: false } }]
        );
        createStore(
          db,
          "cards",
          { keyPath: "id" },
          [
            { name: "boardId", keyPath: "boardId", options: { unique: false } },
            { name: "columnId", keyPath: "columnId", options: { unique: false } }
          ]
        );
        createStore(
          db,
          "projects",
          { keyPath: "id" },
          [{ name: "boardId", keyPath: "boardId", options: { unique: false } }]
        );
        createStore(db, "notes", { keyPath: "id" });
        createStore(db, "docs", { keyPath: "id" });
        createStore(db, "labels", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
};

const withStore = async (storeName, mode, handler) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = handler(store, tx);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const getAll = (storeName) =>
  withStore(storeName, "readonly", (store) =>
    new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    })
  );

export const getById = (storeName, id) =>
  withStore(storeName, "readonly", (store) =>
    new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    })
  );

export const upsert = (storeName, value) =>
  withStore(storeName, "readwrite", (store) => {
    store.put(value);
  });

export const removeById = (storeName, id) =>
  withStore(storeName, "readwrite", (store) => {
    store.delete(id);
  });

export const bulkUpsert = (storeName, values) =>
  withStore(storeName, "readwrite", (store) => {
    values.forEach((value) => store.put(value));
  });

export const clearStore = (storeName) =>
  withStore(storeName, "readwrite", (store) => {
    store.clear();
  });

const now = () => new Date().toISOString();

const seedData = () => {
  const boardId = "board-alpha";
  const columns = [
    { id: "col-backlog", boardId, name: "Backlog", order: 1 },
    { id: "col-progress", boardId, name: "In Progress", order: 2 },
    { id: "col-review", boardId, name: "Review", order: 3 },
    { id: "col-done", boardId, name: "Done", order: 4 }
  ];

  const labels = [
    { id: "label-research", name: "Research", color: "purple" },
    { id: "label-security", name: "Security", color: "rose" },
    { id: "label-design", name: "Design", color: "pink" },
    { id: "label-core", name: "Core", color: "cyan" },
    { id: "label-data", name: "Data", color: "blue" },
    { id: "label-docs", name: "Docs", color: "green" },
    { id: "label-ops", name: "Ops", color: "amber" },
    { id: "label-platform", name: "Platform", color: "teal" }
  ];

  const cards = [
    {
      id: "card-alpha-1",
      boardId,
      columnId: "col-backlog",
      title: "Launch alpha onboarding",
      description: "Draft the onboarding checklist and first-run tutorial.",
      labelIds: ["label-research"],
      owner: "Avery",
      due: "2d",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-2",
      boardId,
      columnId: "col-backlog",
      title: "Audit capture permissions",
      description: "Review access scopes for new capture endpoints.",
      labelIds: ["label-security"],
      owner: "Riley",
      due: "3d",
      order: 2,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-3",
      boardId,
      columnId: "col-backlog",
      title: "UX pass for mission map",
      description: "Tighten layout spacing and empty states.",
      labelIds: ["label-design"],
      owner: "Jules",
      due: "5d",
      order: 3,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-4",
      boardId,
      columnId: "col-progress",
      title: "Realtime sync for memory layer",
      description: "Stream deltas into the new memory renderer.",
      labelIds: ["label-core"],
      owner: "Morgan",
      due: "Today",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-5",
      boardId,
      columnId: "col-progress",
      title: "Telemetry dashboards",
      description: "Ship a first pass of KPI panels.",
      labelIds: ["label-data"],
      owner: "Kai",
      due: "1d",
      order: 2,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-6",
      boardId,
      columnId: "col-review",
      title: "Mission briefing templates",
      description: "Make sure briefs sync across squads.",
      labelIds: ["label-docs"],
      owner: "Quinn",
      due: "Today",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-7",
      boardId,
      columnId: "col-review",
      title: "Agent scheduling logic",
      description: "Review the new scheduler rules.",
      labelIds: ["label-ops"],
      owner: "Sam",
      due: "2d",
      order: 2,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-alpha-8",
      boardId,
      columnId: "col-done",
      title: "Capture streams upgrade",
      description: "Upgraded ingest buffers to v2.",
      labelIds: ["label-platform"],
      owner: "Logan",
      due: "Done",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    }
  ];

  const boards = [
    {
      id: boardId,
      name: "Mission Control",
      columnOrder: columns.map((column) => column.id),
      createdAt: now(),
      updatedAt: now()
    }
  ];

  const projects = [
    {
      id: "project-aurora",
      name: "Aurora Capture",
      summary: "Scale capture throughput and improve observability.",
      boardId,
      status: "In progress",
      tagIds: ["label-data", "label-platform"],
      updatedAt: now()
    },
    {
      id: "project-sentinel",
      name: "Sentinel Briefs",
      summary: "Standardize mission brief templates across squads.",
      boardId,
      status: "Review",
      tagIds: ["label-docs"],
      updatedAt: now()
    }
  ];

  const notes = [
    {
      id: "note-1",
      title: "Standup highlights",
      body: "Keep focus on capture stability. Pair with ops on alert tuning.",
      tagIds: ["label-ops"],
      updatedAt: now()
    },
    {
      id: "note-2",
      title: "Design pass",
      body: "Mission map needs stronger empty states and highlight strokes.",
      tagIds: ["label-design"],
      updatedAt: now()
    }
  ];

  const docs = [
    {
      id: "doc-1",
      title: "Mission Briefing v1",
      body: "Briefing template draft. Include goals, risks, and success metrics.",
      tagIds: ["label-docs"],
      updatedAt: now()
    },
    {
      id: "doc-2",
      title: "Capture Pipeline Spec",
      body: "Spec v2 introduces streaming validation and retry hooks.",
      tagIds: ["label-platform", "label-data"],
      updatedAt: now()
    }
  ];

  return { boards, columns, cards, projects, notes, docs, labels };
};

export const seedIfNeeded = async () => {
  const boards = await getAll("boards");
  if (boards.length > 0) {
    return;
  }
  const data = seedData();
  await Promise.all([
    bulkUpsert("labels", data.labels),
    bulkUpsert("boards", data.boards),
    bulkUpsert("columns", data.columns),
    bulkUpsert("cards", data.cards),
    bulkUpsert("projects", data.projects),
    bulkUpsert("notes", data.notes),
    bulkUpsert("docs", data.docs)
  ]);
};

export const makeId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
