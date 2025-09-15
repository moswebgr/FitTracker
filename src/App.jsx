import React, { useState, useEffect } from "react";
import "./App.css";

// === Activities (FitnessTracker) ===
function FitnessTracker() {
  const initialActivities = ["Γυμναστήριο", "Τρέξιμο", "Εξάσκηση στο σπίτι", "Άλλο"];
  const [activities, setActivities] = useState(initialActivities);
  const [responses, setResponses] = useState({});
  const [newActivity, setNewActivity] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const maxActivities = 6;

  const handleDropdownChange = (activity, value) => {
    setResponses(prev => ({ ...prev, [activity]: value }));
  };

  const handleAddActivity = () => {
    const trimmed = newActivity.trim();
    if (trimmed && !activities.includes(trimmed) && activities.length < maxActivities) {
      setActivities(prev => [...prev.slice(0, -1), trimmed, "Άλλο"]);
      setNewActivity("");
    }
  };

  const handleDeleteActivity = (activityToRemove) => {
    setActivities(prev => prev.filter(act => act !== activityToRemove));
    setResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[activityToRemove];
      return newResponses;
    });
  };

  const evaluateDay = () => {
    const filteredActivities = activities.filter(act => act !== "Άλλο");
    const total = filteredActivities.length;

    if (total === 0) {
      setEvaluation("Error 404: Activities not found");
      return;
    }

    const score = Object.entries(responses).filter(([activity, val]) => activity !== "Άλλο" && val === "Ναι").length;
    const answeredCount = Object.entries(responses).filter(([activity, val]) => activity !== "Άλλο" && (val === "Ναι" || val === "Όχι")).length;

    if (answeredCount < total) {
      const remaining = total - answeredCount;
      setEvaluation(`Έχεις ακόμα ${remaining} απαντήσεις να συμπληρώσεις. Η τελική αξιολόγηση μπορεί να μην είναι ακριβής.`);
      return;
    }

    let message = "";
    if (score === total) message = "Τέλεια μέρα! Τα έκανες όλα!";
    else if (score >= Math.max(total - 1, 1)) message = "Πολύ καλή προσπάθεια!";
    else if (score >= Math.max(total - 2, 1)) message = "Τα πας πολύ καλά!";
    else if (score >= Math.max(total - 3, 1)) message = "Μπράβο! Κινήσου λίγο παραπάνω!";
    else if (score >= 2) message = "Κουνήσου λίγο, άρχισε να ζεσταίνεσαι!";
    else if (score >= 1) message = "Καλό ξεκίνημα αλλά μπορείς και καλύτερα!";
    else message = "Άρχισε να κινείσαι, ώρα για δράση!";

    setEvaluation(message);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Σημερινές Δραστηριότητες</h1>

      {activities.map((activity, index) => (
        <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0" }}>
          <span>{activity}</span>

          {activity !== "Άλλο" ? (
            <>
              <select value={responses[activity] || ""} onChange={(e) => handleDropdownChange(activity, e.target.value)}>
                <option value="">-- Επιλέξτε --</option>
                <option value="Ναι">Ναι</option>
                <option value="Όχι">Όχι</option>
              </select>
              <button onClick={() => handleDeleteActivity(activity)} style={{ marginLeft: "1rem" }}>X</button>
            </>
          ) : (
            <em style={{ color: "#fff" }}>Δεν χρειάζεται επιλογή</em>
          )}
        </div>
      ))}

      {activities.length < maxActivities && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Νέα δραστηριότητα"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={handleAddActivity}>Προσθήκη Δραστηριότητας</button>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button onClick={evaluateDay} style={{ padding: "0.5rem 1rem" }}>Αξιολόγηση Ημέρας</button>
        {evaluation && (
         <p style={{ marginTop: "1rem", fontWeight: "bold", color: "red" }}>
  {evaluation}
</p>
        )}
      </div>
    </div>
  );
}

// === Main App ===
function App() {
  const [page, setPage] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [eventInput, setEventInput] = useState("");

  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");

  const [theme, setTheme] = useState("dark");

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { const savedEvents = localStorage.getItem("myEvents"); if (savedEvents) setEvents(JSON.parse(savedEvents)); }, []);
  useEffect(() => { localStorage.setItem("myEvents", JSON.stringify(events)); }, [events]);
  useEffect(() => { const savedNotes = localStorage.getItem("myNotes"); if (savedNotes) setNotes(JSON.parse(savedNotes)); }, []);
  useEffect(() => { localStorage.setItem("myNotes", JSON.stringify(notes)); }, [notes]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDay = startOfMonth.getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const addEvent = () => {
    if (!eventInput || !selectedDate) return;
    const key = selectedDate.toDateString();
    const newEvents = { ...events };
    if (!newEvents[key]) newEvents[key] = [];
    newEvents[key].push(eventInput);
    setEvents(newEvents);
    setEventInput("");
  };

  const addNote = () => {
    if (!noteInput) return;
    setNotes([...notes, noteInput]);
    setNoteInput("");
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  const currentEvents = selectedDate ? events[selectedDate.toDateString()] || [] : [];

  return (
    <div className="app-container">
      <div className="center-box">
        <nav>
          <button onClick={() => setPage("calendar")}>Calendar</button>
          <button onClick={() => setPage("notepad")}>Notepad</button>
          <button onClick={() => setPage("activities")}>Activities</button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>

        {page === "calendar" && (
          <div className="calendar-page">
            <div className="calendar-header">
              <button onClick={prevMonth}>PREVIOUS</button>
              <span>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</span>
              <button onClick={nextMonth}>NEXT</button>
            </div>

            <div className="calendar-grid">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              {calendarDays.map((day, idx) => {
                const key = day ? day.toDateString() : null;
                const hasEvent = key && events[key]?.length > 0;
                return (
                  <div
                    key={idx}
                    className={`calendar-cell ${day && selectedDate && day.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && <span>{day.getDate()}</span>}
                    {hasEvent && <div className="event-dot"></div>}
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="event-input">
                <input type="text" value={eventInput} onChange={e => setEventInput(e.target.value)} placeholder="Add event/activity"/>
                <button className="add-btn" onClick={addEvent}>Add</button>
                <ul>
                  {currentEvents.map((ev, i) => (
                    <li key={i}>
                      {ev} 
                      <button onClick={() => {
                        const key = selectedDate.toDateString();
                        const newEvents = { ...events };
                        newEvents[key] = newEvents[key].filter((_, idx) => idx !== i);
                        if(newEvents[key].length === 0) delete newEvents[key];
                        setEvents(newEvents);
                      }} style={{marginLeft:'1rem'}}>delete</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {page === "notepad" && (
          <div className="notepad-page">
            <div className="note-input">
              <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add a note"/>
              <button className="add-btn" onClick={addNote}>Add</button>
            </div>
            <ul>
              {notes.map((n, idx) => (
                <li key={idx}>
                  {n} 
                  <button onClick={() => setNotes(notes.filter((_, index) => index !== idx))} style={{marginLeft:'1rem'}}>delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {page === "activities" && <FitnessTracker />}
      </div>
    </div>
  );
}

export default App;
