# 🧪 Lekcja Chemii z Halbiną | Multiplayer Online Live

Dynamiczna, komediowa gra wieloosobowa w czasie rzeczywistym (**Node.js + Socket.IO + HTML5 Canvas 60 FPS**) osadzona w klasie szkolnej na lekcji chemii u pani **Katarzyny Halbina**.

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
   *(Możesz otworzyć kilka kart przeglądarki, aby grać w multiplayerze ze sobą lub zaprosić znajomych z sieci lokalnej).*

---

## 💥 NOWE FUNKCJE I MECHANIKI

### 🚨 1. Sygnały policyjne i Furia Halbina ("WY GŁUPIE SKURWYSYNY!")
* Gdy uczniowie kilkukrotnie krzykną hasła związane z policją:
  * **„Szkieły jadą!”**
  * **„Szkieły!”**
  * **„Halo, policja?!”**
  * **„Co jedzie?!”**
  * **„Surron!”**
* **Uruchamia się najazd policji:**
  * 🚓 **Sygnały radiowozu:** W oknach i na sali gwałtownie pulsują niebiesko-czerwone sygnały kogutów radiowozu!
  * 🔊 **Dźwięk syren policyjnych:** Odtwarza się autentyczny dwutonowy dźwięk syren policyjnych.
  * 😡 **Pasek Wkurwienia Halbina:** Osiąga natychmiast **100%**! Z uszu pani buchają kłęby pary, a na czole pulsuje żyłka wściekłości!
  * 🤬 **Katarzyna Halbina wpada w furię i krzyczy na całą klasę:**
    ## **„WY GŁUPIE SKURWYSYNY!”**
    *(z gigantycznym czerwonym dymkiem komiksowym, trzęsieniem ekranu i dźwiękiem uderzenia w tablicę!)*

---

### 🎓 2. Nowe Zdolności Ucznia (Romanowski):

1. **🙈 Kucanie za ławką (Klawisz `C` lub przycisk w UI):**
   * Romanowski chowa głowę pod drewniany blat ławki.
   * Gdy jesteś w swojej ławce i kucasz, pani Halbina **Cię nie widzi**, nawet gdy patrzy prosto na klasę!
   * *Uwaga:* Jeśli krzykniesz będąc schowanym, Twój krzyk natychmiast Cię zdradzi!

2. **✈️ Rzucanie samolotem z papieru (Klawisz `F` lub przycisk w UI):**
   * Rzucasz złożonym samolocikiem z papieru, który leci parabolą przez klasę!
   * Trafienie w tablicę lub okolice biurka nauczycielki **odwraca uwagę pani Halbina** (zmusza ją do odwrócenia się do tablicy) i daje **+150 pkt respektu**!

3. **📝 Ściąganie chemii pod ławką (Przytrzymaj `E` lub przycisk w UI):**
   * Wyciągasz ściągę ze wzorami i zdobywasz **+35 pkt respektu co sekundę**.
   * *Wysokie ryzyko:* Jeśli pani Halbina spojrzy na klasę podczas ściągania – natychmiast dostajesz Uwagę!

4. **🪑 Szybki powrót do ławki (Klawisz `R`):**
   * Natychmiast biegniesz prosto do swojej przypisanej ławki, by nie dostać uwagi za chodzenie po klasie.

---

## 🕹️ Sterowanie w skrócie

| Klawisz / Akcja | Funkcja |
|---|---|
| **W, A, S, D** / **Strzałki** | Poruszanie się po klasie |
| **1, 2, 3** / Kliknięcie kart | Wybór i wykrzyczenie jednego z 3 losowych haseł |
| **C** | Kucanie / chowanie się pod ławką |
| **E** (przytrzymanie) | Ściąganie chemii pod ławką (+35 pkt) |
| **F** | Rzut samolotem z papieru w tablicę (odwraca uwagę pani) |
| **R** | Szybki powrót do ławki |
| **SPACJA** | Obracanie się / pisanie na tablicy (gdy grasz jako Halbina) |

---

## 📁 Wymiana własnych grafik i dźwięków

Wszystkie assety znajdują się w katalogu `public/assets/`:
* `romanowski.png` – uczeń stojący
* `romanowskiidzie.png` – uczeń idący
* `romanowskikrzyczy.png` – uczeń krzyczący
* `halbina.png` – nauczycielka patrząca na klasę
* `halbina_tyl.png` – nauczycielka pisząca na tablicy
* `dzwonek.mp3` – dźwięk dzwonka lekcyjnego
* `krzyk.mp3` – dźwięk krzyku
