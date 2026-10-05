# 🧪 Lekcja Chemii z Halbiną | Multiplayer Online Live

Dynamiczna, komediowa gra wieloosobowa w czasie rzeczywistym (Node.js + Socket.IO + HTML5 Canvas) osadzona w klasie szkolnej na lekcji chemii u pani **Katarzyny Halbina**.

---

## 🎮 Jak Uruchomić Grę

1. **Uruchomienie serwera:**
   ```bash
   npm start
   ```
   *(lub `node server.js`)*

2. **Wejście do gry:**
   Otwórz przeglądarkę i wejdź na:
   ```
   http://localhost:3000
   ```
   *Możesz otworzyć kilka kart lub zaprosić znajomych w sieci lokalnej (podając Twój adres IP).*

---

## 🕹️ Rozgrywka i Zasady

### 1. Lobby i Kody Pokojów
* **Tworzenie lekcji:** Gracz wpisuje swój nick (np. *Romanowski*) i klika **„Stwórz Lekcję”**. Otrzymuje unikalny 5-literowy kod (np. `CHEMIA`).
* **Dołączanie:** Pozostali gracze wpisują ten kod i klikają **„Dołącz do Klasy”**.
* **Obsada Halbina:**
  * **Losowy gracz** – jeden z graczy zostaje wylosowany jako pani Halbina, pozostali to uczniowie.
  * **Nauczycielka AI (Bot)** – umożliwia grę solo lub pełną kooperację uczniów przeciwko czujnej sztucznej inteligencji.
* **Gospodarz** klika **„ZACZNIJ LEKCJĘ!”** – rozlega się szkolny dzwonek (`dzwonek.mp3`) i startuje animacja wejścia do klasy.

### 2. Mechanika Ucznia (Romanowski)
* **Chodzenie:** `W, A, S, D` lub **Strzałki**.
  * Stojąc: grafika `romanowski.png`
  * Chodząc: grafika `romanowskiidzie.png`
  * Krzycząc: grafika `romanowskikrzyczy.png`
* **Twoja ławka:** Każdy uczeń ma przypisaną ławkę (podświetloną na zielono z podpisem *„TWOJA ŁAWKA”*). Klawisz `R` pozwala szybko wrócić do ławki.
* **Krzyczenie (Zadymiarz):**
  * Na dole ekranu masz **3 losowe propozycje krzyków** (np. *„Szkieły jadą!”*, *„Surron!”*, *„Masz długopis?”*, *„Obiecasz na mamę?”*, *„Bagno!”*, *„Kleszczyński!”* itd.).
  * Kliknij kartę lub wciśnij klawisz `1`, `2` lub `3`.
  * Postać krzyczy, odtwarza się `krzyk.mp3`, a nad Twoją głową pojawia się komiksowy dymek z tekstem i fale dźwiękowe!
  * Po każdym krzyku zestaw 3 propozycji natychmiast losuje się na nowo!
  * Za każdy udany krzyk dostajesz **Punkty Respektu**.

### 3. Czujność Halbina i Kary
* **Gdy Halbina pisze na tablicy:** Jest bezpiecznie! Możesz krzyczeć i zbierać punkty.
* **Gdy Halbina się odwraca (`!` ostrzeżenie):** Uważaj! Za ułamek sekundy spojrzy na klasę.
* **Gdy Halbina patrzy na klasę (czerwony stożek wzroku):**
  * 🚨 **Przyłapanie na krzyku:** Natychmiastowa wpadka i uwaga!
  * ⚠️ **Poza ławką:** Jeśli nauczycielka zobaczy Cię chodzącego po sali, otrzymujesz **Uwagę**.
  * ❌ **3 Uwagi = DYREKTOR:** Po 3 uwagach wylatujesz z klasy do gabinetu dyrektora (przegrana)!

### 4. Koniec Lekcji i Ranking
* Gdy upłynie czas lekcji (90s lub 60s w trybie Kartkówki), dzwoni dzwonek na przerwę!
* Wyświetla się podium klasowych zadymiarzy (ranking według Punktów Respektu).

---

## 📁 Własne Pliki i Grafiki

W folderze `public/assets/` znajdują się domyślne assety, które możesz w każdej chwili podmienić na własne:
* `romanowski.png` – uczeń stojący
* `romanowskiidzie.png` – uczeń idący
* `romanowskikrzyczy.png` – uczeń krzyczący
* `halbina.png` – nauczycielka patrząca na klasę
* `halbina_tyl.png` – nauczycielka pisząca na tablicy
* `dzwonek.mp3` – dźwięk dzwonka szkolnego
* `krzyk.mp3` – dźwięk krzyku ucznia
