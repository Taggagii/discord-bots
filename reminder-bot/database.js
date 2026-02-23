const fs = require('fs');
const path = require('path');

const DATABASE_FILE = path.join(__dirname, 'reminders.json');
const DEFAULT_DB = { reminders: [], oldReminders: [] };

let db = { ...DEFAULT_DB };
let modified = false; 

const ensureDatabase = () => {
  if (!fs.existsSync(DATABASE_FILE)) {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(DEFAULT_DB, null, 2));
  }
};

const loadReminders = () => {
  ensureDatabase();
  const data = fs.readFileSync(DATABASE_FILE, 'utf-8');
  db = JSON.parse(data);
  return db.reminders;
};

const safeWrite = () => {
  if (!modified) return Promise.resolve();
  modified = false;

  return new Promise((resolve) => {
    fs.writeFile(DATABASE_FILE, JSON.stringify(db, null, 2), (err) => {
      if (err) {
				console.error('Error while writing database file: ', err);
			}

      resolve();
    });
  });
};

const saveReminders = (reminders) => {
  db.reminders = reminders;
  modified = true;
  return safeWrite();
};

const addReminder = (reminder) => {
  db.reminders.push(reminder);
  modified = true;
  return safeWrite();
};

const removeReminder = (id) => {
	const reminder = db.reminders.find(r => r.id === id);
	if (!reminder) return Promise.resolve();
	
  db.reminders = db.reminders.filter(r => r.id !== id);
	db.oldReminders.push({
		...reminder,
		fulfilledAt: Date.now(),
		fulfilledAtReadable: new Date,
	});

  modified = true;
  return safeWrite();
};

loadReminders();

module.exports = {
	db,
  loadReminders,
  saveReminders,
  addReminder,
  removeReminder
};
