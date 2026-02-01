# 🎯 Admin Panel - Schnellstart Guide

## Was Sie jetzt haben

Ein vollständiges Admin-Panel zum Verwalten von Benutzern in Ihrer HorizontOS App!

---

## ⚡ Quick Start

### 1. Öffnen Sie das Admin-Panel
- Melden Sie sich als **Admin** an
- Klicken Sie in der Sidebar auf **"Mitarbeiter"** 
- Sie sehen jetzt das AdminPanel mit allen Mitarbeitern

### 2. Benutzer suchen
```
Geben Sie einen Namen oder eine E-Mail ein
→ Die Tabelle filtert in Echtzeit
```

### 3. Benutzer filtern
- **Nach Rolle**: "Administratoren" oder "Mitarbeiter"
- **Nach Status**: "Aktiv" oder "Gesperrt"
- **Kombinierbar**: Z.B. nur gesperrte Mitarbeiter

### 4. Aktionen durchführen

| Icon | Aktion | Effekt |
|------|--------|--------|
| 🛡️ | Klicken | Rolle toggle (Admin ↔ Mitarbeiter) |
| 🔒 | Klicken | Benutzer sperren |
| 🔓 | Klicken | Benutzer entsperren |
| 🗑️ | Klicken | Bestätigung → Benutzer löschen |
| ↓ | Klicken | Detail-View öffnen |
| Doppelklick | Reihe | Detail-Modal öffnen |

---

## 📊 Dashboard Stats

**Oben sehen Sie 4 Karten:**
- 👥 **Gesamt** - Alle Benutzer
- 🛡️ **Administratoren** - Anzahl der Admins
- ✅ **Aktiv** - Nicht gesperrte Benutzer
- ❌ **Gesperrt** - Gesperrte Benutzer

---

## 🔒 Benutzer sperren

### Wann sperren?
- Benutzer verlässt das Unternehmen
- Zur Wartung/Überprüfung
- Temporär bei Sicherheitsbedenken

### Wie?
1. Benutzer finden
2. **Lock-Icon** klicken (🔒 = gesperrt, 🔓 = aktiv)
3. Gesperrte Benutzer können sich **nicht mehr anmelden**

---

## 🗑️ Benutzer löschen

### Warnung ⚠️
**Diese Aktion ist PERMANENT und kann nicht rückgängig gemacht werden!**

### Wie?
1. Benutzer finden
2. **Papierkorb-Icon** (🗑️) klicken
3. **Bestätigungsmodal** erscheint
4. Nochmal "Löschen" klicken zur Bestätigung
5. Benutzer wird gelöscht (inkl. aller Posts, Nachrichten etc.)

---

## 👤 Benutzer-Rolle ändern

### Admin machen
1. Benutzer finden
2. **Shield-Icon** (🛡️) klicken
3. Benutzer wird Admin

### Zu Mitarbeiter herabstufen
1. Admin-Benutzer finden
2. **Shield-Icon** (🛡️) klicken
3. Benutzer wird Mitarbeiter

---

## 👁️ Benutzer-Details anschauen

### Optionen:
- **Doppelklick** auf eine Reihe
- **Oder**: ↓-Icon am Ende der Reihe klicken

### Informationen:
- Name, E-Mail
- Aktuelle Rolle
- Status (Aktiv/Gesperrt)
- Registrierungsdatum

---

## 🔍 Beispiel-Szenarien

### Szenario 1: Max Mustermann verlässt das Unternehmen
```
1. Suchbox: "Max" eingeben
2. Benutzer sperren (optional)
3. Benutzer löschen
4. Gelöscht ✅
```

### Szenario 2: Neue Admin ernnennen
```
1. Benutzer finden
2. Shield-Icon klicken
3. Benutzer wird Admin ✅
4. Hat jetzt Zugriff auf Admin-Panel
```

### Szenario 3: Alle Mitarbeiter anschauen
```
1. Filter: "Mitarbeiter" anklicken
2. Zeigt nur Mitarbeiter (keine Admins)
3. Mit Suchbox kombinierbar
```

---

## ⚠️ Sicherheitsregeln

✅ **Sie können:**
- Andere Benutzer sperren/entsperren
- Andere Benutzer löschen
- Rollen für andere ändern

❌ **Sie können NICHT:**
- Ihre eigene Rolle ändern
- Ihr eigenes Konto sperren
- Ihr eigenes Konto löschen
- (Schutz vor Selbst-Sperrung!)

---

## 🚨 Häufige Fehler

| Fehler | Lösung |
|--------|--------|
| Button ist ausgegraut | Sie sind kein Admin oder es ist ein selbst-Aktion |
| "ZUGRIFF VERWEIGERT" | Sie müssen als Admin angemeldet sein |
| Änderung erscheint nicht | Warten Sie 1-2 Sekunden (Firebase Sync) |
| Benutzer kann sich noch anmelden (wenn gesperrt) | Auth-Logik muss `user.locked` prüfen |

---

## 💾 Daten-Persistenz

Alle Änderungen werden **automatisch** in Firebase gespeichert:
- ✅ Firestore synchronisiert in Echtzeit
- ✅ Mehrere Admins sehen Updates live
- ✅ Keine manuellen Speicher-Buttons nötig

---

## 📱 Mobile Ansicht

Das AdminPanel ist responsive:
- ✅ Desktop: Volle Tabellenansicht
- ⚠️ Tablet: Kompakte Ansicht
- ⚠️ Handy: Scrollbare Tabelle

---

## 🎓 Tipps & Tricks

### Tipp 1: Effizientes Filtern
```
Wollen Sie alle gesperrten Mitarbeiter sehen?
1. Filter: "Mitarbeiter" anklicken
2. Filter: "Gesperrt" anklicken
3. Fertig - nur gesperrte Mitarbeiter anzeigen
```

### Tipp 2: Schnelle Suche
```
Namen brauchen nicht exakt sein:
- "Max" findet "Maximilian Mustermann"
- "max@" findet "max@example.com"
- "muster" findet alle "Mustermanns"
```

### Tipp 3: Batch-Operationen
```
Wollen Sie mehrere Rollen ändern?
1. Erste Person: Role-Icon klicken
2. Zweite Person: Role-Icon klicken
3. ... (wiederholen Sie für alle)
```

---

## ✅ Checkliste für Admin-Arbeit

- [ ] Wöchentlich: Benutzerliste überprüfen
- [ ] Bei Austritt: Benutzer sperren oder löschen
- [ ] Bei Promotion: Benutzer zu Admin machen
- [ ] Gesperrte Benutzer: Regelmäßig überprüfen
- [ ] Backup: Vor Löschungen ein Backup erstellen

---

## ❓ Support

**Wenn etwas nicht funktioniert:**
1. Sind Sie als **Admin** angemeldet?
2. Versuchen Sie, die Seite neu zu laden
3. Prüfen Sie die **Browser-Konsole** (F12) auf Fehler
4. Kontaktieren Sie den Entwickler

---

**Viel Erfolg bei der Verwaltung! 🚀**
