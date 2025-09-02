// Gumbaynggirr Connect v3 Prototype
// Core interactions: navigation, calendar, events, offline cache, geolocation, touch, audio

(function () {
  const screenWelcome = document.getElementById("screen-welcome");
  const screenCalendar = document.getElementById("screen-calendar");
  const screenEvent = document.getElementById("screen-event");
  const backBtn = document.getElementById("backBtn");
  const viewEventsBtn = document.getElementById("viewEventsBtn");
  const welcomeLocations = document.getElementById("welcomeLocations");
  const welcomeVoice = document.getElementById("welcomeVoice");
  const refreshSync = document.getElementById("refreshSync");
  const monthLabel = document.getElementById("monthLabel");
  const grid = document.getElementById("calendarGrid");
  const todayEvents = document.getElementById("todayEvents");
  const lastSyncEl = document.getElementById("lastSync");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  // Event detail elements
  const eventTitle = document.getElementById("eventTitle");
  const eventMeta = document.getElementById("eventMeta");
  const eventPlace = document.getElementById("eventPlace");
  const eventHost = document.getElementById("eventHost");
  const eventAbout = document.getElementById("eventAbout");
  const eventBring = document.getElementById("eventBring");
  const eventCulture = document.getElementById("eventCulture");
  const btnSave = document.getElementById("btnSave");
  const btnMap = document.getElementById("btnMap");
  const btnRecord = document.getElementById("btnRecord");
  const btnOffline = document.getElementById("btnOffline");
  const eventVenueName = document.getElementById("eventVenueName");
  const eventDistance = document.getElementById("eventDistance");
  const eventDriveTime = document.getElementById("eventDriveTime");
  const getDirections = document.getElementById("getDirections");
  const openMapFromCard = document.getElementById("openMapFromCard");
  const recordFromCard = document.getElementById("recordFromCard");
  const eventNameInVoice = document.getElementById("eventNameInVoice");
  const voiceSpectrum = document.getElementById("voiceSpectrum");
  const recordingTimer = document.getElementById("recordingTimer");
  const recordingInterface = document.getElementById("recordingInterface");
  const savedVoiceNote = document.getElementById("savedVoiceNote");
  const customAudioPlayer = document.getElementById("customAudioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const progressBar = document.getElementById("progressBar");
  const currentTime = document.getElementById("currentTime");
  const totalDuration = document.getElementById("totalDuration");
  const deleteRecording = document.getElementById("deleteRecording");
  const hiddenAudio = document.getElementById("hiddenAudio");

  // State
  let current = new Date();
  let selectedDate = new Date();
  let events = [];
  let selectedEvent = null;
  let mediaRecorder = null;
  let recordingChunks = [];
  let recordingStartTime = 0;
  let recordingInterval = null;
  let currentAudioBlob = null;

  // IndexedDB helper
  const EventDB = {
    db: null,
    async init() {
      if (this.db) return this.db;
      return new Promise((resolve, reject) => {
        const req = indexedDB.open("GumbaynggirrDB", 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("events")) {
            db.createObjectStore("events", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("audioNotes")) {
            db.createObjectStore("audioNotes", {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        };
        req.onsuccess = () => {
          this.db = req.result;
          resolve(this.db);
        };
        req.onerror = () => reject(req.error);
      });
    },
    async saveEvents(eventList) {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(["events"], "readwrite");
        const store = tx.objectStore("events");
        eventList.forEach((ev) => store.put(ev));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async getAllEvents() {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(["events"], "readonly");
        const store = tx.objectStore("events");
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },
    async saveAudioNote(eventId, blob, durationMs) {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(["audioNotes"], "readwrite");
        const store = tx.objectStore("audioNotes");
        const record = {
          eventId,
          audio: blob,
          timestamp: Date.now(),
          durationMs,
        };
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    },
  };

  // Mock remote fetch
  function simulateNetworkDelay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function fetchRemoteEvents() {
    await simulateNetworkDelay(600);
    const base = new Date();
    const yyyy = base.getFullYear();
    const mm = base.getMonth();
    const sample = [
      {
        id: "lang-circle",
        title: "Gumbaynggirr Language Circle",
        date: new Date(yyyy, mm, 17).toISOString().slice(0, 10),
        time: "10:00-12:00",
        place: "Bowraville Community Hall",
        host: "Elder Mary Johnson",
        address: "Bowraville NSW",
        lat: -30.651,
        lon: 152.846,
        about: "Weekly gathering to practice and share language.",
        bring: "Notebook, water, open heart.",
        culture: "Respectful space connecting to Country and language.",
      },
      {
        id: "river-walk",
        title: "River Walk and Stories",
        date: new Date(yyyy, mm, 21).toISOString().slice(0, 10),
        time: "08:00-10:00",
        place: "Nambucca River",
        host: "Uncle Peter",
        address: "Nambucca Heads NSW",
        lat: -30.645,
        lon: 153.005,
        about: "Walk along the river sharing cultural stories.",
        bring: "Comfortable shoes, hat.",
        culture: "Learning river significance and kinship with waters.",
      },
      {
        id: "weaving",
        title: "Cultural Weaving Workshop",
        date: new Date(yyyy, mm, 29).toISOString().slice(0, 10),
        time: "13:00-15:00",
        place: "Community Arts Center",
        host: "Aunty Grace",
        address: "Macksville NSW",
        lat: -30.709,
        lon: 152.916,
        about: "Traditional weaving techniques with natural fibers.",
        bring: "Materials provided, bring curiosity.",
        culture: "Hands-on practice linking elders and youth.",
      },
    ];
    return sample;
  }

  async function loadEvents() {
    try {
      // Show loading state
      lastSyncEl.textContent = "Loading...";
      lastSyncEl.classList.add("loading-pulse");

      // Show cached first
      const cached = await EventDB.getAllEvents();
      if (cached.length) {
        events = cached;
        renderCalendar();
        renderTodayEvents();
      }
      if (navigator.onLine) {
        const fresh = await fetchRemoteEvents();
        events = fresh;
        await EventDB.saveEvents(fresh);
        renderCalendar();
        renderTodayEvents();
        lastSyncEl.textContent = new Date().toLocaleTimeString();
      } else {
        lastSyncEl.textContent = "Offline mode";
      }
    } catch (e) {
      console.error("Event load error", e);
      lastSyncEl.textContent = "Error loading";
    } finally {
      lastSyncEl.classList.remove("loading-pulse");
    }
  }

  // Calendar rendering
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function firstWeekday(year, month) {
    return new Date(year, month, 1).getDay();
  }
  function formatISODate(d) {
    return d.toISOString().slice(0, 10);
  }

  function renderCalendar() {
    const year = current.getFullYear();
    const month = current.getMonth();
    monthLabel.textContent = current.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
    grid.innerHTML = "";

    const totalDays = daysInMonth(year, month);
    const startPad = firstWeekday(year, month); // 0..6 starting Sunday

    for (let i = 0; i < startPad; i++) {
      const pad = document.createElement("div");
      grid.appendChild(pad);
    }

    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("button");
      cell.className =
        "aspect-square rounded-lg flex items-center justify-center relative bg-white hover:bg-softGrey transition calendar-day";
      cell.textContent = String(day);
      const cellDate = new Date(year, month, day);
      const iso = formatISODate(cellDate);

      // Dot if events exist
      const hasEvent = events.some((ev) => ev.date === iso);
      if (hasEvent) {
        const dot = document.createElement("span");
        dot.className =
          "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sunsetRed";
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => {
        selectedDate = cellDate;
        openDayEvents(iso);
      });
      grid.appendChild(cell);
    }
  }

  function renderTodayEvents() {
    const todayISO = formatISODate(new Date());
    const todays = events.filter((e) => e.date === todayISO);
    todayEvents.innerHTML = "";
    if (!todays.length) {
      todayEvents.innerHTML = `<div class="text-textMedium text-sm">No events today.</div>`;
      return;
    }
    todays.forEach((ev) => todayEvents.appendChild(createEventCard(ev)));
  }

  function createEventCard(ev) {
    const card = document.createElement("div");
    card.className =
      "event-card rounded-xl bg-white p-4 shadow hover:shadow-elevate cursor-pointer";
    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="text-sunsetRed"><ion-icon name="ellipse"></ion-icon></div>
        <div class="flex-1">
          <div class="font-medium">${ev.title}</div>
          <div class="text-sm text-textMedium">${ev.place}</div>
          <div class="text-xs text-textMedium mt-1">
            <ion-icon class="mr-1" name="time-outline"></ion-icon>${ev.time}
          </div>
        </div>
        <div class="text-textMedium">
          <ion-icon name="chevron-forward-outline"></ion-icon>
        </div>
      </div>
    `;

    // Enhanced accessibility
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `View details for ${ev.title} at ${ev.place}`
    );

    card.addEventListener("click", () => openEventDetails(ev));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEventDetails(ev);
      }
    });

    return card;
  }

  function openDayEvents(iso) {
    const list = events.filter((e) => e.date === iso);
    todayEvents.innerHTML = "";
    const label = new Date(iso).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const heading = document.createElement("div");
    heading.className = "text-sm font-semibold mb-2";
    heading.textContent = `${label} Events`;
    todayEvents.appendChild(heading);
    if (!list.length) {
      const msg = document.createElement("div");
      msg.className = "text-textMedium text-sm";
      msg.textContent = "No events for this day.";
      todayEvents.appendChild(msg);
      return;
    }
    list.forEach((ev) => todayEvents.appendChild(createEventCard(ev)));
  }

  // Navigation
  function navigate(to) {
    screenWelcome.classList.add("hidden");
    screenCalendar.classList.add("hidden");
    screenEvent.classList.add("hidden");
    backBtn.classList.add("hidden");

    if (to === "welcome") screenWelcome.classList.remove("hidden");
    if (to === "calendar") screenCalendar.classList.remove("hidden");
    if (to === "event") {
      screenEvent.classList.remove("hidden");
      backBtn.classList.remove("hidden");
    }
  }

  viewEventsBtn.addEventListener("click", () => navigate("calendar"));
  welcomeLocations?.addEventListener("click", () => navigate("calendar"));
  welcomeVoice?.addEventListener("click", () => navigate("calendar"));
  refreshSync?.addEventListener("click", () => loadEvents());
  backBtn.addEventListener("click", () => navigate("calendar"));
  prevMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    renderCalendar();
  });

  // Event details
  async function openEventDetails(ev) {
    selectedEvent = ev;
    navigate("event");
    eventTitle.textContent = ev.title;
    eventMeta.textContent = `${new Date(ev.date).toDateString()} • ${ev.time}`;
    eventPlace.innerHTML = `<ion-icon name="location-outline"></ion-icon> ${ev.place}`;
    eventHost.innerHTML = `<ion-icon name=\"person-outline\"></ion-icon> ${ev.host}`;
    eventVenueName.textContent = ev.place;
    eventNameInVoice.textContent = ev.title;
    eventAbout.textContent = ev.about;
    eventBring.textContent = ev.bring;
    eventCulture.textContent = ev.culture;

    // Distance & travel time (mock simple calc)
    try {
      const userPos = await getCurrentPosition();
      const km = haversineKm(userPos, { latitude: ev.lat, longitude: ev.lon });
      const minutes = Math.round((km / 50) * 60); // assume 50km/h
      eventMeta.textContent += ` • ~${km.toFixed(1)} km • ~${minutes} min`;
      eventDistance.textContent = `${km.toFixed(1)}km away`;
      eventDriveTime.textContent = `${Math.floor(minutes / 60)}h ${
        minutes % 60
      }m drive`;
    } catch (_) {
      eventDistance.textContent = "Distance calculating...";
      eventDriveTime.textContent = "Drive time calculating...";
    }

    // Actions
    btnSave.onclick = () => saveToCalendar(ev);
    btnMap.onclick = () => openMaps(ev);
    btnOffline.onclick = () => cacheEventOffline(ev);
    setupRecordingHandlers(ev);

    // wire extra buttons
    getDirections?.addEventListener("click", () => openMaps(ev));
    openMapFromCard?.addEventListener("click", () => openMaps(ev));

    // Check for existing voice note
    checkExistingVoiceNote(ev.id);
  }

  function saveToCalendar(ev) {
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${
      ev.title
    }\nDTSTART:${ev.date.replaceAll("-", "")}T${ev.time
      .slice(0, 5)
      .replace(":", "")}00\nLOCATION:${ev.place}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openMaps(ev) {
    const q = encodeURIComponent(`${ev.place} ${ev.address}`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${q}`,
      "_blank"
    );
  }

  // Check for existing voice note and update UI accordingly
  async function checkExistingVoiceNote(eventId) {
    if (!recordingInterface || !savedVoiceNote) return;

    const db = await EventDB.init();
    const tx = db.transaction(["audioNotes"], "readonly");
    const store = tx.objectStore("audioNotes");
    const req = store.getAll();

    req.onsuccess = () => {
      const rows = (req.result || []).filter((r) => r.eventId === eventId);

      if (rows.length > 0) {
        // Show saved voice note, hide recording interface
        const latestNote = rows.sort((a, b) => b.timestamp - a.timestamp)[0];
        currentAudioBlob = latestNote.audio;

        recordingInterface.classList.add("hidden");
        savedVoiceNote.classList.remove("hidden");

        setupCustomAudioPlayer(latestNote.audio, latestNote.durationMs);
      } else {
        // Show recording interface, hide saved voice note
        recordingInterface.classList.remove("hidden");
        savedVoiceNote.classList.add("hidden");
      }
    };
  }

  // Setup custom audio player
  function setupCustomAudioPlayer(audioBlob, durationMs) {
    if (!hiddenAudio || !playPauseBtn || !progressBar) return;

    const audioUrl = URL.createObjectURL(audioBlob);
    hiddenAudio.src = audioUrl;

    // Format duration
    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    totalDuration.textContent = formatTime(durationMs || 0);
    currentTime.textContent = "0:00";

    let isPlaying = false;

    // Play/Pause functionality
    playPauseBtn.onclick = () => {
      if (isPlaying) {
        hiddenAudio.pause();
        playPauseBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
        isPlaying = false;
      } else {
        hiddenAudio.play();
        playPauseBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
        isPlaying = true;
      }
    };

    // Update progress
    hiddenAudio.ontimeupdate = () => {
      const progress = (hiddenAudio.currentTime / hiddenAudio.duration) * 100;
      progressBar.style.width = `${progress}%`;
      currentTime.textContent = formatTime(hiddenAudio.currentTime * 1000);
    };

    // Handle audio end
    hiddenAudio.onended = () => {
      playPauseBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
      isPlaying = false;
      progressBar.style.width = "0%";
      currentTime.textContent = "0:00";
    };

    // Progress bar click to seek
    progressBar.parentElement.onclick = (e) => {
      const rect = e.target.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      hiddenAudio.currentTime = percent * hiddenAudio.duration;
    };

    // Delete recording
    deleteRecording.onclick = async () => {
      if (confirm("Delete this voice note?")) {
        await deleteVoiceNote(selectedEvent.id);
        recordingInterface.classList.remove("hidden");
        savedVoiceNote.classList.add("hidden");
        URL.revokeObjectURL(audioUrl);
      }
    };
  }

  // Delete voice note from IndexedDB
  async function deleteVoiceNote(eventId) {
    const db = await EventDB.init();
    const tx = db.transaction(["audioNotes"], "readwrite");
    const store = tx.objectStore("audioNotes");
    const req = store.getAll();

    req.onsuccess = () => {
      const rows = (req.result || []).filter((r) => r.eventId === eventId);
      rows.forEach((row) => store.delete(row.id));
    };
  }

  // Update recording timer
  function updateRecordingTimer() {
    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    recordingTimer.textContent = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  async function cacheEventOffline(ev) {
    // Simply ensure events are in IndexedDB (already saved on sync)
    await EventDB.saveEvents([ev]);
    btnOffline.classList.add("bg-softGrey");
  }

  // Geolocation
  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("No geolocation"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  function haversineKm(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Touch gestures for month swipe and pull-to-refresh
  (function setupTouch() {
    let startX = null,
      startY = null,
      startTime = 0;
    const el = screenCalendar;

    el.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();

      // Add visual feedback
      el.style.transform = "scale(0.98)";
      el.style.transition = "transform 0.1s ease";
    });

    el.addEventListener("touchend", (e) => {
      if (startX == null || startY == null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // Reset visual feedback
      el.style.transform = "scale(1)";

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -50) {
          current.setMonth(current.getMonth() + 1);
          renderCalendar();
          // Show swipe feedback
          showSwipeFeedback("Next month");
        }
        if (dx > 50) {
          current.setMonth(current.getMonth() - 1);
          renderCalendar();
          showSwipeFeedback("Previous month");
        }
      } else {
        if (dy > 100 && Date.now() - startTime < 800) {
          loadEvents();
          showSwipeFeedback("Refreshing events...");
        }
      }
      startX = startY = null;
    });
  })();

  // Show swipe feedback
  function showSwipeFeedback(message) {
    const feedback = document.createElement("div");
    feedback.className =
      "fixed top-20 left-1/2 -translate-x-1/2 bg-deepEarth text-white px-4 py-2 rounded-lg text-sm z-50";
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.style.opacity = "0";
      feedback.style.transform = "translate(-50%, -20px)";
      setTimeout(() => document.body.removeChild(feedback), 300);
    }, 1000);
  }

  // Audio recording with better permission handling
  async function requestMicrophonePermission() {
    try {
      // First check if we already have permission
      const permissionStatus = await navigator.permissions.query({
        name: "microphone",
      });

      if (permissionStatus.state === "granted") {
        return true;
      }

      if (permissionStatus.state === "denied") {
        showPermissionDeniedDialog();
        return false;
      }

      // Try to get user media to trigger permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just wanted the permission
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      console.error("Microphone permission error:", err);

      if (err.name === "NotAllowedError") {
        showPermissionDeniedDialog();
      } else if (err.name === "NotFoundError") {
        showSwipeFeedback("No microphone found on this device");
      } else if (err.name === "NotSupportedError") {
        showSwipeFeedback("Audio recording not supported in this browser");
      } else {
        showSwipeFeedback("Unable to access microphone");
      }
      return false;
    }
  }

  function showPermissionDeniedDialog() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-sm w-full">
        <div class="text-center space-y-4">
          <div class="text-4xl text-sunsetRed">
            <ion-icon name="mic-off-outline"></ion-icon>
          </div>
          <div class="font-semibold">Microphone Access Needed</div>
          <div class="text-sm text-textMedium">
            To record cultural voice notes, please allow microphone access in your browser settings.
          </div>
          <div class="space-y-2">
            <button id="tryAgainBtn" class="w-full bg-primaryOchre text-white py-2 rounded-lg btn-action">
              Try Again
            </button>
            <button id="closeModalBtn" class="w-full bg-softGrey text-textDark py-2 rounded-lg btn-action">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const tryAgainBtn = modal.querySelector("#tryAgainBtn");
    const closeModalBtn = modal.querySelector("#closeModalBtn");

    tryAgainBtn.onclick = async () => {
      document.body.removeChild(modal);
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        btnRecord.click(); // Trigger recording again
      }
    };

    closeModalBtn.onclick = () => {
      document.body.removeChild(modal);
    };

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };
  }

  function setupRecordingHandlers(ev) {
    const startRecording = async () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        return;
      }

      // Check permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        recordingChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        const startAt = Date.now();

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordingChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          // Stop all tracks to release microphone
          stream.getTracks().forEach((track) => track.stop());

          const blob = new Blob(recordingChunks, { type: "audio/webm" });
          const duration = Date.now() - startAt;

          try {
            await EventDB.saveAudioNote(ev.id, blob, duration);
            showSwipeFeedback("Voice note saved!");

            // Switch to saved voice note view
            if (selectedEvent && selectedEvent.id === ev.id) {
              checkExistingVoiceNote(ev.id);
            }
          } catch (error) {
            console.error("Error saving voice note:", error);
            showSwipeFeedback("Error saving voice note");
          }

          // Reset button
          resetRecordButton();
        };

        mediaRecorder.onerror = (e) => {
          console.error("MediaRecorder error:", e);
          stream.getTracks().forEach((track) => track.stop());
          showSwipeFeedback("Recording error occurred");
          resetRecordButton();
        };

        mediaRecorder.start(1000); // Collect data every second
        recordingStartTime = Date.now();

        // Update button to show recording state
        btnRecord.classList.add("bg-sunsetRed", "text-white", "loading-pulse");
        btnRecord.innerHTML = `
          <div class="text-xl"><ion-icon name="stop"></ion-icon></div>
          <div class="text-xs">Stop</div>
        `;

        // Also update the card button if it exists
        if (recordFromCard) {
          recordFromCard.classList.add("bg-errorClay", "text-white");
          recordFromCard.innerHTML = `
            <ion-icon name="stop"></ion-icon>
            <span>Stop Recording</span>
          `;

          // Show spectrum animation
          if (voiceSpectrum) {
            voiceSpectrum.classList.remove("hidden");
          }

          // Start timer
          recordingInterval = setInterval(updateRecordingTimer, 1000);
        }
      } catch (err) {
        console.error("Recording start error:", err);
        showSwipeFeedback("Unable to start recording");
        resetRecordButton();
      }
    };

    const resetRecordButton = () => {
      btnRecord.classList.remove("bg-sunsetRed", "text-white", "loading-pulse");
      btnRecord.innerHTML = `
        <div class="text-xl"><ion-icon name="mic-outline"></ion-icon></div>
        <div class="text-xs">Rec</div>
      `;

      if (recordFromCard) {
        recordFromCard.classList.remove("bg-errorClay", "text-white");
        recordFromCard.innerHTML = `
          <ion-icon name="mic-outline"></ion-icon>
          <span>Start Recording</span>
        `;

        // Hide spectrum animation
        if (voiceSpectrum) {
          voiceSpectrum.classList.add("hidden");
        }

        // Clear timer
        if (recordingInterval) {
          clearInterval(recordingInterval);
          recordingInterval = null;
        }

        if (recordingTimer) {
          recordingTimer.textContent = "00:00";
        }
      }
    };

    btnRecord.onclick = startRecording;

    // Also wire up the card record button
    if (recordFromCard) {
      recordFromCard.onclick = startRecording;
    }
  }

  // Initialize
  navigate("welcome");
  loadEvents();
})();
