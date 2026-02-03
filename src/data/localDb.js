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
  const boardId = "board-ai-intel";
  const columns = [
    { id: "col-backlog", boardId, name: "Backlog", order: 1 },
    { id: "col-today", boardId, name: "Today", order: 2 },
    { id: "col-review", boardId, name: "Review", order: 3 },
    { id: "col-published", boardId, name: "Published", order: 4 }
  ];

  const labels = [
    { id: "label-sources", name: "Sources", color: "blue" },
    { id: "label-scan", name: "Scan", color: "cyan" },
    { id: "label-extract", name: "Extract", color: "purple" },
    { id: "label-summary", name: "Summary", color: "green" },
    { id: "label-publish", name: "Publish", color: "amber" }
  ];

  const cards = [
    {
      id: "card-intel-1",
      boardId,
      columnId: "col-backlog",
      title: "Define target subreddits",
      description: "Lock in the core AI/business/workflow subreddits and filters.",
      labelIds: ["label-sources"],
      owner: "Damian",
      due: "Today",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-intel-2",
      boardId,
      columnId: "col-today",
      title: "Daily scan + shortlist",
      description: "Review top posts, shortlist 5–10 with high signal.",
      labelIds: ["label-scan"],
      owner: "Ex-Machina",
      due: "Daily",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-intel-3",
      boardId,
      columnId: "col-today",
      title: "Extract insights + takeaways",
      description: "Summarize key insights and actionable takeaways.",
      labelIds: ["label-extract"],
      owner: "Ex-Machina",
      due: "Daily",
      order: 2,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-intel-4",
      boardId,
      columnId: "col-review",
      title: "Draft daily summary",
      description: "Write the final summary in Notes/Docs for review.",
      labelIds: ["label-summary"],
      owner: "Damian",
      due: "Daily",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: "card-intel-5",
      boardId,
      columnId: "col-published",
      title: "Share to Damian",
      description: "Send the daily intel summary once approved.",
      labelIds: ["label-publish"],
      owner: "Ex-Machina",
      due: "Daily",
      order: 1,
      createdAt: now(),
      updatedAt: now()
    }
  ];

  const boards = [
    {
      id: boardId,
      name: "Daily AI Subreddit Intel",
      columnOrder: columns.map((column) => column.id),
      createdAt: now(),
      updatedAt: now()
    }
  ];

  const projects = [
    {
      id: "project-ai-intel",
      name: "Daily AI Subreddit Intel",
      summary: "Scan key AI subreddits daily, extract high-signal insights, and deliver a concise brief.",
      boardId,
      status: "In progress",
      tagIds: ["label-scan", "label-summary"],
      updatedAt: now()
    }
  ];

  const notes = [
    {
      id: "note-daily-intel",
      title: "Daily Findings (Today)",
      body: "Drop today’s top insights here. Replace with date-stamped entries.",
      tagIds: ["label-summary"],
      updatedAt: now()
    }
  ];

  const docs = [
    {
      id: "doc-sources",
      title: "Subreddit Sources & Filters",
      body: "List target subreddits, filters, and ranking criteria here.",
      tagIds: ["label-sources"],
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
